const express = require('express');
const multer = require('multer');
const tradesController = require('../controllers/tradesController');
const dividendsController = require('../controllers/dividendsController');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/trades', upload.single('file'), (req, res, next) => {
    console.log("Received Trade File:", req.file); // Debugging log
    console.log("Received Body:", req.body); // Debugging log
    next();
}, tradesController.parseTrades);

router.post('/dividends', upload.single('file'), (req, res, next) => {
    console.log("Received Dividend File:", req.file); // Debugging log
    console.log("Received Body:", req.body); // Debugging log
    next();
}, dividendsController.parseDividends);


router.post("/add-trade", tradesController.addTrade);

router.post("/delete-trade", tradesController.deleteTrades);

router.post("/add-Stock", tradesController.addStock);

module.exports = router;
