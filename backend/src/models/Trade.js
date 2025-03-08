const db = require('../utils/db');

class Trade {
  constructor(data) {
    this.date = data.date;
    this.trade_type = data.trade_type;
    this.quantity = data.quantity;
    this.price = data.price;
    this.amount = data.amount;
    this.is_dividend = data.is_dividend;
    this.user_id = data.user_id;
    this.stock_name = data.stock_name;
  }

  static async create(tradeData) {
    const [result] = await db.execute(
      'INSERT INTO ? values(?,?,?,?)',
      [(stock_name + user_id),date, price, quantity, amount]
    );
    return result.insertId;
  }

  static async getXIRR(user_id) {
    const [rows] = await db.execute(`
      SELECT date, amount 
      FROM trades 
      WHERE user_id = ?
      ORDER BY date
    `, [user_id]);

    return calculateXIRR(rows);
  }
}

module.exports = Trade;