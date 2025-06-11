const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const db = require('./src/utils/db');
const tradesRoutes = require('./src/routes/tradeRoutes');
const portfolioRoutes= require('./src/routes/portfolioRoutes');
const getStockDetails = require('./src/routes/portfolioRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
app.use(cors({ origin: process.env.FRONTEND, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();


async function startServer() {
  try {
    await db.initialize();  // Ensure database is initialized before routes
    console.log('Database initialized');

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

startServer();

// Middleware
app.use(async (req, res, next) => {
  // console.log('Incoming Request Headers:', req.headers); // Log all headers

  try {
    const authHeader = req.headers.authorization; // Check Authorization header
    // console.log('Authorization Header:', authHeader); // Log Authorization header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid Authorization header found');
      return next(); // Continue to the next middleware
    }

    const token = authHeader.split(' ')[1];
    // console.log('Extracted Token:', token); // Log token

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded User:', decoded); // Log decoded user info

      req.user = decoded;
    }
    next();
  } catch (error) {
    console.error('JWT Middleware Error:', error.message);
    next();
  }
});



// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/upload', tradesRoutes);


const isAdmin = async (req, res, next) => {
  const username = req.query.username || req.body.username;  // Support both

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // PostgreSQL parameterized query
    const rows = await db.execute(`SELECT role FROM users WHERE username = $1`, [username]);
    
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    next();
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


app.use('/api/admin', isAdmin, adminRoutes);


app.use('/api/financials', require('./src/routes/financialRoutes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

