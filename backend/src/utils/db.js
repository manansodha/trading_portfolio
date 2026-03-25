// backend/src/utils/db.js
// const mysql = require('mysql2/promise');
require('dotenv').config();
const postgres = require('postgres');

const db = {
  client: null,

  async initialize() {
    try {
      const connectionString = (process.env.DATABASE_URL || process.env.DB_URL || '').trim();
      const sslEnabled = (process.env.DB_SSL || 'true').toLowerCase() !== 'false';
      
      if (connectionString) {
        if (connectionString.includes('DATABASE_URL=')) {
          throw new Error('Invalid DATABASE_URL/DB_URL value. Do not include "DATABASE_URL=" inside the value.');
        }

        let parsedUrl;
        try {
          parsedUrl = new URL(connectionString);
        } catch (parseError) {
          throw new Error('Invalid DATABASE_URL/DB_URL format. Use: postgresql://user:password@host:port/database');
        }

        if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
          throw new Error('Invalid DATABASE_URL/DB_URL protocol or hostname. Expected postgresql://...');
        }
        this.client = postgres(connectionString, {
          max: Number(process.env.DB_MAX_CONNECTIONS || 10),
          idle_timeout: Number(process.env.DB_IDLE_TIMEOUT_SECONDS || 30),
          ssl: sslEnabled ? 'require' : false,
        });
      } else {
        const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        const missing = requiredEnv.filter((key) => {
          const value = process.env[key];
          return typeof value !== 'string' || value.trim() === '';
        });

        if (missing.length) {
          throw new Error(`Missing required database environment variables: ${missing.join(', ')}`);
        }
        console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME, process.env.DB_PASSWORD);
        this.client = postgres({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          max: Number(process.env.DB_MAX_CONNECTIONS || 10),
          idle_timeout: Number(process.env.DB_IDLE_TIMEOUT_SECONDS || 30),
          ssl: sslEnabled ? 'require' : false,
        });
        
      }

      // await this.client`SELECT 1`;

      console.log('PostgreSQL database connection established');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  },

  async execute(query, params = []) {
    if (!this.client) {
      console.error('Database client is not initialized');
      throw new Error('Database client is null');
    }

    try {
      const result = await this.client.unsafe(query, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async transaction(callback) {
    if (!this.client) {
      console.error('Database client is not initialized');
      throw new Error('Database client is null');
    }

    return this.client.begin(async (tx) => {
      const txClient = {
        query: (query, params = []) => tx.unsafe(query, params),
      };
      return callback(txClient);
    });
  }
};

module.exports = db;


// const db = {
//   pool: null,
//   async initialize() {
//   try{
//     this.pool = mysql.createPool({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0
//     });

//     console.log('Database connection established');
//     } catch (error) {
//       console.error('Database initialization error:', error);
//     }
//   },

//   async execute(query, params = []) {
//     if (!this.pool) {
//       console.error('Database connection pool is not initialized');
//       throw new Error('Database connection pool is null');
//     }
//     try {
//       const [results] = await this.pool.execute(query, params);
//       return results;
//     } catch (error) {
//       console.error('Database query error:', error);
//       throw error;
//     }
//   },

//   async transaction(callback) {
//     const connection = await this.pool.getConnection();
//     try {
//       await connection.beginTransaction();
//       const result = await callback(connection);
//       await connection.commit();
//       return result;
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }
// };