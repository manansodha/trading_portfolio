const { randomInt } = require('crypto');
const db = require('../utils/db');
const xlsx = require('xlsx');


exports.parseTrades = async (req, res) => {
    try {
        const {username} = req.body;
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        const table = 'portfolio_'+String(username);
        for (const row of data) {
            if (!row['__EMPTY_10'] || !row['__EMPTY_2'] || !row['__EMPTY'] || !row['__EMPTY_6'] || !row['__EMPTY_8'] || !row['__EMPTY_9']) {
                data.shift();
            }
            try{
            await db.execute(
                `INSERT INTO ${table} (trade_id, date, symbol, trade_type, quantity, average_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [row['__EMPTY_10'], row['__EMPTY_2'], row['__EMPTY'], row['__EMPTY_6'], row['__EMPTY_8'], row['__EMPTY_9']]
            );}catch(err){
                console.log(err);
            }
        }

        res.json({ message: 'Trades uploaded successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error parsing trade file' });
    }
};

exports.addTrade = async (req, res) => {
    console.log("adding trade", req.body);
    const { username, symbol, trade_type, quantity, price, date } = req.body;
    if (!username || !symbol || !trade_type || !quantity || !price || !date) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        if (trade_type.toUpperCase() === 'DIVIDEND') {
            const table = `dividend_${username}`;
            await db.execute(
                `INSERT INTO ${table} (date, symbol, trade_type, quantity, dividend_per_share)
                 VALUES (?, ?, ?, ?, ?)`,
                [date, symbol, trade_type.toUpperCase(), quantity, price]
            );
        }else{
            const table = `portfolio_${username}`;
            const trade_id = Math.floor(Math.random() * 10000); // Generates a random number
            await db.execute(
                `INSERT INTO ${table} (date, trade_id, symbol, trade_type, quantity, average_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [date, trade_id, symbol, trade_type.toUpperCase(), quantity, price]
            );
        }
        res.status(201).json({ message: "Trade added successfully" });
    } catch (error) {
        console.error("Error adding trade:", error);
        res.status(500).json({ error: "Database error while adding trade" });
    }
};


exports.addStock = async (req, res) => {
    const username = req.body.tradeData.username;
    const symbol = req.body.tradeData.symbol;
    const quantity = req.body.tradeData.quantity;
    const price = req.body.tradeData.price;
    const date = req.body.tradeData.date;
    const trade_id = Math.floor(Math.random() * 10000); // Generates a random number
    const type = req.body.tradeData.trade_type;
    

    if (!username || !symbol || !quantity || !price || !date || !type) {
        return res.status(400).json({ error: "Username is required" });
    }

    if (type.toUpperCase() === 'BUY' || type.toUpperCase() === 'SELL') {
        const table = `portfolio_${username}`;
        try {
            await db.execute(
                `INSERT INTO ${table} (date, trade_id, symbol, trade_type, quantity, average_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [date, trade_id, symbol, type.toUpperCase(), quantity, price]
            );
            res.json({ message: "Stock added successfully" });
        } catch (error) {
            console.error("Error adding stock:", error);
            res.status(500).json({ error: "Database error while adding stock" });
        }
    } else if (type.toUpperCase() === 'DIVIDEND') {
        const table = `dividend_${username}`;
        try {
            await db.execute(
                `INSERT INTO ${table} (date, symbol, trade_type, quantity, dividend_per_share)
                 VALUES (?, ?, ?, ?, ?)`,
                [date, symbol, type.toUpperCase(), quantity, price]
            );
            res.json({ message: "Dividend added successfully" });
        } catch (error) {
            console.error("Error adding dividend:", error);
            res.status(500).json({ error: "Database error while adding dividend" });
        }
    } else {
        res.status(400).json({ error: "Invalid trade type" });
    }
}



exports.deleteTrades = async (req, res) => {
    // console.log("deleting trades", req.body.tradeData);
    const username = req.body.tradeData.username;
    const trade_id = req.body.tradeData.id;
    const symbol = req.body.tradeData.symbol;
    const trade_type = req.body.tradeData.trade_type;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    if (trade_type.toUpperCase() === 'DIVIDEND') {
        try {
            await db.execute(`DELETE FROM dividend_${username} where id =? and symbol=? and trade_type = "Dividend"`, [trade_id, symbol]);
            res.json({ message: "Dividend deleted successfully" });
        } catch (error) {
            console.error("Error deleting dividend:", error);
            res.status(500).json({ error: "Database error while deleting dividend" });
        }
        return;
    }
    else if (trade_type.toUpperCase() === 'BUY' || trade_type.toUpperCase() === 'SELL') {
        try {
            await db.execute(`DELETE FROM portfolio_${username} where trade_id =? and symbol=? and trade_type =?`, [trade_id, symbol, trade_type.toUpperCase()]);
            res.json({ message: "Trades deleted successfully" });
        } catch (error) {
            console.error("Error deleting trades:", error);
            res.status(500).json({ error: "Database error while deleting trades" });
        }
        return;

}};