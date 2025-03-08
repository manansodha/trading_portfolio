// backend/src/utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const auth = {
  protect: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Please authenticate' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        trading_account_id: user.trading_account_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = auth;