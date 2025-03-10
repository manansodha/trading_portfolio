// const {xirr} = require('node-irr');
const Finance = require('financejs');
const finance = new Finance();
const db = require('../utils/db');  // Make sure db connection is imported

exports.getPortfolio = async (req, res) => {
    
    const portfolioTable = `portfolio_${req.query.username}`; 
    const dividendTable = `dividend_${req.query.username}`; 
    
    try {
        const rows = await db.execute(
            `SELECT 
                p.symbol, 
                SUM(CASE WHEN p.trade_type = 'buy' THEN p.quantity ELSE -p.quantity END) AS total_quantity,
                SUM(CASE WHEN p.trade_type = 'buy' THEN -p.quantity * p.average_price ELSE p.quantity * p.average_price END) AS total_profit,
                AVG(CASE WHEN p.trade_type = 'buy' THEN p.average_price ELSE NULL END) AS avg_cost,
                SUM(CASE WHEN p.trade_type = 'buy' THEN p.quantity * p.average_price ELSE 0 END) AS total_cost,
                COALESCE(SUM(d.quantity * d.dividend_per_share), 0) AS total_dividends
            FROM ${portfolioTable} p
            LEFT JOIN ${dividendTable} d ON p.symbol = d.symbol
            GROUP BY p.symbol
            ORDER BY p.symbol;`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching portfolio:", error);
        res.status(500).json({ error: 'Error fetching portfolio' });
    }
}; 

exports.getStockDetails = async (req, res) => {
    if (!req.query.username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    const portfolioTable = `portfolio_${req.query.username}`;
    const dividendTable = `dividend_${req.query.username}`; // Different table for dividends

    try {
        const rows = await db.execute(
            `SELECT trade_id as id, date, symbol, trade_type, quantity, average_price FROM ${portfolioTable} WHERE symbol = ?
             UNION ALL
             SELECT id, date, symbol, trade_type, quantity, dividend_per_share AS average_price
             FROM ${dividendTable} WHERE symbol = ?
             ORDER BY date DESC`,
            [req.params.symbol, req.params.symbol]
        );

        let totalQuantity = 0;
        let totalDividend = 0;
        let totalCost = 0;
        let totalPnL = 0;
        let totalRG = 0;
        let cashFlows = [];

        rows.forEach((trade) => {
            let amount = 0;
            let value = trade.quantity * trade.average_price;;
            if (trade.trade_type.toUpperCase() === "BUY") {
                totalQuantity += trade.quantity;
                totalPnL -= value;
                totalCost += value;
                amount = -1 * value; 
            } else if (trade.trade_type.toUpperCase() === "SELL") {
                totalQuantity -= trade.quantity; 
                totalPnL += value; 
                totalRG += value;
                amount = value; 
            } else if (trade.trade_type.toUpperCase() === "DIVIDEND") {
                totalPnL += value;
                totalRG += value; 
                amount = value; 
                totalDividend += value;
            }

            
            cashFlows.push({ amount, date: new Date(trade.date) });
        });

        // Compute XIRR (If cashFlows exist)
        let xirrValue = null;
        if (cashFlows.length > 1) {
            cashFlows = cashFlows.sort((a, b) => a.date - b.date); // Sort by date
            try {
                xirrValue = finance.XIRR(cashFlows.map(cf => cf.amount),
                cashFlows.map(cf => cf.date));
            } catch (err) {
                console.error("Error calculating XIRR:", err);
            }
        }

        // Respond with full details
        res.json({
            data: rows,
            total_quantity: totalQuantity,
            total_pnl: totalPnL.toFixed(2),
            total_cost: totalCost.toFixed(2),
            total_dividend: totalDividend.toFixed(2), 
            total_rg: totalRG.toFixed(2),
            xirr: xirrValue !== null ? xirrValue : null
        });
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Stock details not found" });
        }
    } catch (error) {
        console.error("Error fetching stock details:", error);
        res.status(500).json({ error: 'Error fetching stock details' });
    }
};


exports.temporaryXIRR = async (req, res) => {
    try {
    
        const { username, symbol, sellPrice, sellDate } = req.body.data;

        if (!username || !symbol || !sellPrice || !sellDate) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const portfolioTable = `portfolio_${username}`;
        const dividendTable = `dividend_${username}`

        // Fetch all trades for the stock
        const trades = await db.execute(
            `SELECT date, trade_type, quantity, average_price FROM ${portfolioTable} WHERE symbol = ?
             UNION ALL
             SELECT date, trade_type, quantity, dividend_per_share AS average_price
             FROM ${dividendTable} WHERE symbol = ?
             ORDER BY date DESC`,
            [symbol, symbol]
        );

        let cashFlows = [];
        let totalQuantity = 0;
        let totalCost = 0;
        let totalRG = 0

        trades.forEach(trade => {
            let amount = 0;
            let value = trade.quantity * trade.average_price;
            let date = new Date(trade.date);

            if (trade.trade_type.toUpperCase() === "BUY") {
                totalQuantity += trade.quantity;
                totalCost += value;
                amount = -1*value;
            } else if (trade.trade_type.toUpperCase() === "SELL") {
                totalQuantity -= trade.quantity;
                totalRG += value
                amount = value;
            } else if (trade.trade_type.toUpperCase() == "DIVIDEND"){
                totalRG += value
                amount = value;
            }

            cashFlows.push({ amount, date });
        });

        // Add user-provided hypothetical sell transaction
        let sellAmount = totalQuantity * parseFloat(sellPrice);
        cashFlows.push({ amount: sellAmount, date: new Date(sellDate) });

        totalRG += sellAmount;

        // Calculate new XIRR
        let xirrValue = null;
        if (cashFlows.length > 1) {
            cashFlows = cashFlows.sort((a, b) => a.date - b.date); // Sort by date
            try {
                xirrValue = finance.XIRR(cashFlows.map(cf => cf.amount),
                cashFlows.map(cf => cf.date));
            } catch (err) {
                console.error("Error calculating XIRR:", err);
            }
        }
        // console.log(xirrValue)
        res.json({
            total_realisation: totalRG.toFixed(2),
            profit: (totalRG - totalCost).toFixed(2),
            new_xirr: xirrValue !== null ? xirrValue.toFixed(2) : null,
        });

    } catch (error) {
        console.error("Error calculating hypothetical XIRR:", error);
        res.status(500).json({ error: "Error calculating hypothetical XIRR" });
    }
};

