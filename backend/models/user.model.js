const db = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (userData) => {
    const { email, password, full_name, phone, role } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, password, full_name, phone, role]
    );
    return result.insertId;
  }
};

module.exports = User;
