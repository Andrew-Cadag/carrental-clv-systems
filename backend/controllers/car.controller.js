const db = require('../config/db');

exports.getAllCars = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = 'SELECT * FROM cars WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [cars] = await db.execute(query, params);
    res.json({ cars });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllCarsWithAvailability = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [cars] = await db.execute('SELECT * FROM cars ORDER BY created_at DESC');

    // Default: check against today if no dates provided
    const checkStart = start_date || new Date().toISOString().split('T')[0];
    const checkEnd = end_date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Find cars with overlapping active bookings in the date range
    const [overlaps] = await db.execute(
      `SELECT DISTINCT car_id FROM bookings 
       WHERE status NOT IN ('cancelled', 'completed') 
       AND start_date < ? AND end_date > ?`,
      [checkEnd, checkStart]
    );
    const bookedCarIds = new Set(overlaps.map(r => r.car_id));
    cars.forEach(car => {
      car.available_for_dates = car.status !== 'maintenance' && !bookedCarIds.has(car.id);
    });

    res.json({ cars });
  } catch (error) {
    console.error('Get cars with availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const [cars] = await db.execute('SELECT * FROM cars WHERE id = ?', [id]);

    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ car: cars[0] });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCar = async (req, res) => {
  try {
    const { brand, model, year, plate_number, price_per_day } = req.body;

    if (!brand || !model || !year || !plate_number || !price_per_day) {
      return res.status(400).json({ message: 'Brand, model, year, plate number, and price per day are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO cars (brand, model, year, plate_number, price_per_day) VALUES (?, ?, ?, ?, ?)',
      [brand, model, year, plate_number, price_per_day]
    );

    res.status(201).json({
      message: 'Car created successfully',
      car: { id: result.insertId, brand, model, year, plate_number, price_per_day, status: 'available' }
    });
  } catch (error) {
    console.error('Create car error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Plate number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, year, plate_number, price_per_day, status } = req.body;

    const [existing] = await db.execute('SELECT id FROM cars WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await db.execute(
      'UPDATE cars SET brand = ?, model = ?, year = ?, plate_number = ?, price_per_day = ?, status = ? WHERE id = ?',
      [brand, model, year, plate_number, price_per_day, status, id]
    );

    res.json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM cars WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await db.execute('DELETE FROM cars WHERE id = ?', [id]);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
