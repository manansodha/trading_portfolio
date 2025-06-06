// const {xirr} = require('node-irr');
const Finance = require('financejs');
const finance = new Finance();
const db = require('../utils/db');  // Make sure db connection is imported

exports.getPortfolio = async (req, res) => {
    const portfolioTable = `portfolio_${req.query.username}`;
    const dividendTable = `dividend_${req.query.username}`;

    try {
        const trades = await db.execute(`
            SELECT *
            FROM ${portfolioTable}
            ORDER BY symbol, date, trade_id
        `);

        const dividends = await db.execute(`
            SELECT symbol, SUM(quantity * dividend_per_share) AS total_dividends
            FROM ${dividendTable}
            GROUP BY symbol
        `);

        const dividendMap = Object.fromEntries(dividends.map(d => [d.symbol, Number(d.total_dividends)]));

        const portfolio = {};

        for (const trade of trades) {
            const symbol = trade.symbol;
            const type = trade.trade_type.trim().toLowerCase();
            const quantity = Number(trade.quantity);
            const price = Number(trade.average_price);

            if (!portfolio[symbol]) {
                portfolio[symbol] = {
                    symbol,
                    lots: [],
                    total_quantity: 0,
                    total_cost: 0,
                    realized_gain: 0,
                    total_sell_value: 0,
                    net_quantity: 0
                };
            }

            const entry = portfolio[symbol];

            if (type === 'buy') {
                entry.lots.push({ quantity, price });
                entry.total_quantity += quantity;
                entry.total_cost += quantity * price;
                entry.net_quantity += quantity; // track net buys
            } else if (type === 'sell') {
                let qtyToSell = quantity;
                let sellValue = quantity * price;
                entry.total_sell_value += sellValue;
                entry.net_quantity -= quantity; // track net sells
                while (qtyToSell > 0 && entry.lots.length > 0) {
                    const lot = entry.lots[0];
                    const sellQty = Math.min(qtyToSell, lot.quantity);

                    const costBasis = sellQty * lot.price;
                    const proceeds = sellQty * price;
                    entry.realized_gain += proceeds - costBasis;

                    lot.quantity -= sellQty;
                    entry.total_quantity -= sellQty;
                    entry.total_cost -= costBasis;
                    qtyToSell -= sellQty;

                    if (lot.quantity === 0) entry.lots.shift();
                }
            }
        }

        const result = Object.values(portfolio).map(entry => {
            return {
                symbol: entry.symbol,
                total_quantity: entry.total_quantity,
                total_cost: Number(entry.total_cost.toFixed(2)),
                avg_cost: entry.total_quantity > 0 ? Number((entry.total_cost / entry.total_quantity).toFixed(2)) : null,
                total_dividends: dividendMap[entry.symbol] || 0,
                realized_gain: Number(entry.realized_gain.toFixed(2)),
                total_profit: Number((entry.realized_gain + (dividendMap[entry.symbol] || 0)).toFixed(2)),
                net_quantity: entry.net_quantity,
            };
        });

        res.json(result);
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
    const dividendTable = `dividend_${req.query.username}`;

    try {
        const rows = await db.execute(
            `SELECT trade_id as id, date, symbol, trade_type, quantity, average_price FROM ${portfolioTable} WHERE symbol = $1
             UNION ALL
             SELECT id, date, symbol, trade_type, quantity, dividend_per_share AS average_price
             FROM ${dividendTable} WHERE symbol = $2
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
            `SELECT date, trade_type, quantity, average_price FROM ${portfolioTable} WHERE symbol = $1
             UNION ALL
             SELECT date, trade_type, quantity, dividend_per_share AS average_price
             FROM ${dividendTable} WHERE symbol = $2
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

