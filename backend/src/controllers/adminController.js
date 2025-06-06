const db = require('../utils/db');



exports.changeStockName = async (req, res) => {
    const { oldSymbol, newSymbol, username } = req.body;
    if (!oldSymbol || !newSymbol) {
        return res.status(400).json({ error: "Old symbol, new symbol, and date are required" });
    }

    try {
        await db.execute(
            `INSERT INTO stock_adjustments (symbol, type, new_symbol) VALUES ($1, $2, $3)`,
            [oldSymbol, "RENAME", newSymbol]
        );
        res.status(200).json({ message: "Stock name change recorded successfully" });
    } catch (error) {
        console.error("Error recording stock name change:", error);
        res.status(500).json({ error: "Database error while processing request" });
    }
};

exports.stockSplit = async (req, res) => {
    const { oldSymbol, adjustmentValue, actionDate, username } = req.body;
    if (!oldSymbol || !adjustmentValue || !actionDate || adjustmentValue <= 0) {
        return res.status(400).json({ error: "Invalid input values" });
    }

    try {
        await db.execute(
            `INSERT INTO stock_adjustments (symbol, type, split_ratio, date) VALUES ($1, $2, $3, $4)`,
            [oldSymbol, "SPLIT", adjustmentValue, actionDate]
        );
        res.status(200).json({ message: "Stock split recorded successfully" });
    } catch (error) {
        console.error("Error recording stock split:", error);
        res.status(500).json({ error: "Database error while processing request" });
    }
};

exports.bonusIssue = async (req, res) => {
    const { oldSymbol, adjustmentValue, actionDate, username } = req.body;

    if (!oldSymbol || !adjustmentValue || !actionDate || adjustmentValue<=0) {
        return res.status(400).json({ error: "Invalid input values" });
    }

    try {
        await db.execute(
            `INSERT INTO stock_adjustments (symbol, type, bonus_ratio, date) VALUES ($1, $2, $3, $4)`,
            [oldSymbol, "BONUS", adjustmentValue, actionDate]
        );
        res.status(200).json({ message: "Bonus issue recorded successfully" });
    } catch (error) {
        console.error("Error recording bonus issue:", error);
        res.status(500).json({ error: "Database error while processing request" });
    }
}