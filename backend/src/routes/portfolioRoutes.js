const express = require('express');
const { getPortfolio, getStockDetails, temporaryXIRR } = require('../controllers/portfolioController');
const router = express.Router();

router.get('/', getPortfolio);
router.get("/:symbol", (req, res, next) => {
    // console.log("Matched symbol route:", req.params.symbol);
    next();
}, getStockDetails);

router.post('/temporaryXIRR', (req, res, next) => {
    // console.log("Temp XIRR working", req.body.data)
    next();
}, temporaryXIRR)


// Catch-all for debugging:
router.all("*", (req, res) => {
    console.log("No matching route for:", req.method, req.url);
    res.status(404).json({ error: "Route not found" });
});

router.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});


module.exports = router;
