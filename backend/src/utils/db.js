// backend/src/utils/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = {
  pool: null,
  async initialize() {
  try{
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Database connection established');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  },

  async execute(query, params = []) {
    if (!this.pool) {
      console.error('Database connection pool is not initialized');
      throw new Error('Database connection pool is null');
    }
    try {
      const [results] = await this.pool.execute(query, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = db;