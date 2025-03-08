// const {xirr} = require('node-irr');
const Finance = require('financejs');
const finance = new Finance();
const db = require('../utils/db');  // Make sure db connection is imported

exports.getPortfolio = async (req, res) => {
    
    const table = `portfolio_${req.query.username}`; // Using backticks for safety
    console.log(table);
    try {
        const rows = await db.execute(
            `SELECT symbol, 
                SUM(CASE WHEN trade_type = 'buy' THEN quantity ELSE -quantity END) AS total_quantity, 
                average_price AS avg_cost,
                SUM(CASE WHEN trade_type = 'buy' THEN quantity * average_price ELSE 0 END) AS total_cost
             FROM ${table} 
             GROUP BY symbol
             ORDER BY symbol`
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
        let totalPnL = 0;
        let cashFlows = [];

        rows.forEach((trade) => {
            let amount = 0;
            if (trade.trade_type.toUpperCase() === "BUY") {
                totalQuantity += trade.quantity;
                totalPnL -= trade.quantity * trade.average_price;
                amount = -1 * trade.quantity * trade.average_price; 
            } else if (trade.trade_type.toUpperCase() === "SELL") {
                totalQuantity -= trade.quantity; 
                totalPnL += trade.quantity * trade.average_price; 
                amount = trade.quantity * trade.average_price; 
            } else if (trade.trade_type.toUpperCase() === "DIVIDEND") {
                totalPnL += trade.average_price * trade.quantity; 
                amount = trade.average_price * trade.quantity; 
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
