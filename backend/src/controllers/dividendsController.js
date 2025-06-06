const db = require('../utils/db');
const xlsx = require('xlsx');

exports.parseDividends = async (req, res) => {
    try {
        const {username} = req.body;
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        const table = 'dividend_'+String(username);
        for (const row of data) {
            if (!row['__EMPTY_2'] || !row['__EMPTY'] || !row['__EMPTY_3'] || !row['__EMPTY_4']) {
                continue;
            }
            try{
            await db.execute(
                `INSERT INTO ${table} (date, symbol, trade_type, quantity, dividend_per_share)
                 VALUES ($1, $2, $3, $4, $5)`,
                [row['__EMPTY_2'], row['__EMPTY'], 'dividend', row['__EMPTY_3'], row['__EMPTY_4']]
            );
            }catch(err){
                console.log(err);
            }
        }

        res.json({ message: 'Dividends uploaded successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error parsing dividend file' });
    }
};
