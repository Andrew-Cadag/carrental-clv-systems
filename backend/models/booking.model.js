const db = require('../config/db');

const Booking = {
  findAll: async () => {
    const [rows] = await db.execute(
      `SELECT b.*, u.full_name as customer_name, c.make, c.model 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN cars c ON b.car_id = c.id 
       ORDER BY b.created_at DESC`
    );
    return rows;
  },
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT b.*, u.full_name as customer_name, c.make, c.model 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN cars c ON b.car_id = c.id 
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  },
  findByUserId: async (userId) => {
    const [rows] = await db.execute(
      `SELECT b.*, c.make, c.model, c.license_plate, c.category
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  },
  create: async (bookingData) => {
    const { user_id, car_id, start_date, end_date, total_amount } = bookingData;
    const [result] = await db.execute(
      'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_amount) VALUES (?, ?, ?, ?, ?)',
      [user_id, car_id, start_date, end_date, total_amount]
    );
    return result.insertId;
  },
  updateStatus: async (id, status) => {
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  },
  delete: async (id) => {
    await db.execute('DELETE FROM bookings WHERE id = ?', [id]);
  }
};

module.exports = Booking;
