const db = require('../config/db');
const axios = require('axios');

// Flask AI Service URL - should match the FLASK_URL in .env
const FLASK_API_URL = process.env.FLASK_URL || 'http://localhost:5000';


/**
 * Predict CLV for a specific user and store the result
 */
exports.predictCLV = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get user details
    const [users] = await db.execute(
      'SELECT id, email, name FROM users WHERE id = ? AND role = ?',
      [user_id, 'customer']
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get booking stats for this user
    const [stats] = await db.execute(`
      SELECT 
        COUNT(id) as frequency,
        COALESCE(SUM(total_amount), 0) as total_spent,
        DATEDIFF(NOW(), MAX(start_date)) as recency
      FROM bookings
      WHERE customer_id = ?
    `, [user_id]);

    const frequency = parseInt(stats[0].frequency);
    const total_spent = parseFloat(stats[0].total_spent);
    const recency = stats[0].recency === null ? 999 : Math.max(0, parseInt(stats[0].recency));

    let clvTier;
    let clvScore = total_spent;

    try {
      // Call Flask API for prediction
      const response = await axios.post(`${FLASK_API_URL}/predict`, {
        frequency,
        total_spent,
        recency
      });
      clvTier = response.data.clv.toLowerCase();
    } catch (flaskError) {
      console.error('Flask API error:', flaskError.message);
      // Fallback calculation (PHP thresholds)
      clvTier = total_spent > 50000 ? 'high' : total_spent > 20000 ? 'medium' : 'low';
    }

    res.json({
      user_id: parseInt(user_id),
      full_name: users[0].name,
      email: users[0].email,
      features: {
        frequency,
        total_spent,
        recency
      },
      clv_score: clvScore,
      clv_tier: clvTier
    });
  } catch (error) {
    console.error('CLV prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get CLV history for a specific user
 */
exports.getCLVHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check if user exists
    const [users] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current stats as the latest "prediction"
    const [stats] = await db.execute(`
      SELECT 
        COUNT(id) as frequency,
        COALESCE(SUM(total_amount), 0) as total_spent,
        DATEDIFF(NOW(), MAX(start_date)) as recency
      FROM bookings
      WHERE customer_id = ?
    `, [user_id]);

    res.json({
      predictions: [{
        user_id: parseInt(user_id),
        frequency: parseInt(stats[0].frequency),
        total_spent: parseFloat(stats[0].total_spent),
        recency: stats[0].recency === null ? 999 : parseInt(stats[0].recency),
        predicted_at: new Date().toISOString()
      }]
    });
  } catch (error) {
    console.error('Get CLV history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all customers with their CLV predictions
 * Queries booking stats per customer, calls Flask API for CLV prediction
 */
exports.getAllCLVScores = async (req, res) => {
  try {
    // Query all customers with their booking statistics
    // frequency = COUNT of bookings
    // total_spent = SUM of total_amount
    // recency = days since last booking (or NULL if no bookings)
    const [customers] = await db.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(b.id) as frequency,
        COALESCE(SUM(b.total_amount), 0) as total_spent,
        DATEDIFF(NOW(), MAX(b.start_date)) as recency
      FROM users u
      LEFT JOIN bookings b ON u.id = b.customer_id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email
      ORDER BY u.id
    `);

    // For each customer, call Flask API to get CLV prediction
    const customersWithCLV = await Promise.all(
      customers.map(async (customer) => {
        // Default recency to 999 if customer has no bookings (very high = low value)
        const recency = customer.recency === null ? 999 : Math.max(0, parseInt(customer.recency));
        
        try {
          // Call Flask API for CLV prediction
          const response = await axios.post(`${FLASK_API_URL}/predict`, {
            frequency: parseInt(customer.frequency),
            total_spent: parseFloat(customer.total_spent),
            recency: recency
          });

          return {
            id: customer.id,
            full_name: customer.name,
            email: customer.email,
            frequency: parseInt(customer.frequency),
            total_spent: parseFloat(customer.total_spent),
            recency: parseInt(recency),
            clv_tier: response.data.clv.toLowerCase(),
            clv_score: parseFloat(customer.total_spent)
          };
        } catch (flaskError) {
          console.error(`Flask API error for customer ${customer.id}:`, flaskError.message);
          // Fallback: calculate tier locally based on total_spent (PHP thresholds)
          const tier = customer.total_spent > 50000 ? 'high' : customer.total_spent > 20000 ? 'medium' : 'low';
          return {
            id: customer.id,
            full_name: customer.name,
            email: customer.email,
            frequency: parseInt(customer.frequency),
            total_spent: parseFloat(customer.total_spent),
            recency: parseInt(recency),
            clv_tier: tier,
            clv_score: parseFloat(customer.total_spent)
          };
        }
      })
    );

    res.json({ users: customersWithCLV });
  } catch (error) {
    console.error('Get all CLV scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
