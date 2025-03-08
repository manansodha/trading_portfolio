const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const adminController = require('../controllers/adminController');

// Apply Stock Name Change
router.post('/change-stock-name', adminController.changeStockName);

// Apply Stock Split
router.post('/stock-split', adminController.stockSplit);

// Apply Bonus Issue
router.post('/bonus-issue', adminController.bonusIssue);

module.exports = router;
