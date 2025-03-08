const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.user = user; // Attach user data to the request
        next();
    });

    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
