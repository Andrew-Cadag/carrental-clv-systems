const db = require('../config/db');

exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT b.*, 
        u.full_name as customer_name, u.email as customer_email,
        c.brand, c.model, c.plate_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN cars c ON b.car_id = c.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await db.execute(query, params);
    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [bookings] = await db.execute(
      `SELECT b.*, c.brand, c.model, c.plate_number
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [bookings] = await db.execute(
      `SELECT b.*, u.full_name as customer_name, c.brand, c.model, c.plate_number
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN cars c ON b.car_id = c.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking: bookings[0] });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookedDatesForCar = async (req, res) => {
  try {
    const { car_id } = req.params;
    const [bookings] = await db.execute(
      `SELECT start_date, end_date FROM bookings 
       WHERE car_id = ? AND status NOT IN ('cancelled', 'completed') 
       ORDER BY start_date ASC`,
      [car_id]
    );
    res.json({ booked_dates: bookings });
  } catch (error) {
    console.error('Get booked dates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { car_id, start_date, end_date } = req.body;
    const user_id = req.user.id;

    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({ message: 'Car ID, start date, and end_date are required' });
    }

    const [cars] = await db.execute('SELECT price_per_day, status FROM cars WHERE id = ?', [car_id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (cars[0].status === 'maintenance') {
      return res.status(400).json({ message: 'Car is currently under maintenance' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for overlapping active bookings on the same car
    const [overlaps] = await db.execute(
      `SELECT id FROM bookings 
       WHERE car_id = ? AND status NOT IN ('cancelled', 'completed') 
       AND start_date < ? AND end_date > ?`,
      [car_id, end_date, start_date]
    );
    if (overlaps.length > 0) {
      return res.status(400).json({ message: 'Car is already booked for the selected dates' });
    }

    const total_amount = days * cars[0].price_per_day;

    const [result] = await db.execute(
      'INSERT INTO bookings (customer_id, car_id, start_date, end_date, total_amount) VALUES (?, ?, ?, ?, ?)',
      [user_id, car_id, start_date, end_date, total_amount]
    );

    // Update car status to 'rented'
    await db.execute('UPDATE cars SET status = ? WHERE id = ?', ['rented', car_id]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: { id: result.insertId, customer_id: user_id, car_id, start_date, end_date, total_amount, status: 'pending' }
    });
  } catch (error) {
    console.error('Create booking error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [bookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    if (status === 'completed' || status === 'cancelled') {
      await db.execute('UPDATE cars SET status = ? WHERE id = ?', ['available', bookings[0].car_id]);
    }

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [bookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (bookings[0].customer_id !== userId && userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (bookings[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be updated' });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const [cars] = await db.execute('SELECT price_per_day FROM cars WHERE id = ?', [bookings[0].car_id]);
    const total_amount = days * cars[0].price_per_day;

    await db.execute(
      'UPDATE bookings SET start_date = ?, end_date = ?, total_amount = ? WHERE id = ?',
      [start_date, end_date, total_amount, id]
    );

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [bookings] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (bookings[0].customer_id !== userId && userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (bookings[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Customers can only cancel if rental period has not started yet
    if (userRole === 'customer') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(bookings[0].start_date);
      startDate.setHours(0, 0, 0, 0);

      if (today >= startDate) {
        return res.status(400).json({ message: 'Cannot cancel a booking after the rental period has started' });
      }
    }

    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
    await db.execute('UPDATE cars SET status = ? WHERE id = ?', ['available', bookings[0].car_id]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
