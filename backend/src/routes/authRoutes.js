const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const User = require('../models/User'); // Adjust according to your project structure
const {login, register} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Remove JWT Token
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Expires", "0");
    res.setHeader("Pragma", "no-cache");
    return res.json({ message: "Logged out successfully" });
});



module.exports = router;
