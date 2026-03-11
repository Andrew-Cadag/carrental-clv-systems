const db = require('../config/db');

const Car = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM cars WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM cars WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (carData) => {
    const { brand, model, year, plate_number, price_per_day } = carData;
    const [result] = await db.execute(
      'INSERT INTO cars (brand, model, year, plate_number, price_per_day) VALUES (?, ?, ?, ?, ?)',
      [brand, model, year, plate_number, price_per_day]
    );
    return result.insertId;
  },
  update: async (id, carData) => {
    const { brand, model, year, plate_number, price_per_day, status } = carData;
    await db.execute(
      'UPDATE cars SET brand = ?, model = ?, year = ?, plate_number = ?, price_per_day = ?, status = ? WHERE id = ?',
      [brand, model, year, plate_number, price_per_day, status, id]
    );
  },
  delete: async (id) => {
    await db.execute('DELETE FROM cars WHERE id = ?', [id]);
  }
};

module.exports = Car;
