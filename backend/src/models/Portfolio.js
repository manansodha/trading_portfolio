const db = require('../utils/db');

class Portfolio {
  constructor(data) {
    this.trading_account_id = data.trading_account_id;
    this.total_value = data.total_value || 0;
    this.total_profit_loss = data.total_profit_loss || 0;
    this.xirr = data.xirr || 0;
  }

  static async create(portfolioData) {
    const [result] = await db.execute(
      'INSERT INTO portfolios SET ?',
      portfolioData
    );
    return result.insertId;
  }

  static async updateXIRR(portfolioId) {
    const [rows] = await db.execute(`
      SELECT t.date, t.amount
      FROM trades t
      JOIN portfolios p ON t.trading_account_id = p.trading_account_id
      WHERE p.id = ?
      ORDER BY t.date
    `, [portfolioId]);

    const xirr = XIRRCalculator.calculateXIRR(rows);
    
    await db.execute(
      'UPDATE portfolios SET xirr = ? WHERE id = ?',
      [xirr, portfolioId]
    );
  }
}

module.exports = Portfolio;