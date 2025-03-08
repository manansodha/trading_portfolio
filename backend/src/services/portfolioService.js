// backend/src/services/portfolioService.js
const db = require('../utils/db');
const Portfolio = require('../models/Portfolio');

class PortfolioService {
  static async createPortfolio(tradingAccountId) {
    const portfolioData = {
      trading_account_id: tradingAccountId,
      total_value: 0,
      total_profit_loss: 0,
      xirr: 0
    };

    const portfolioId = await Portfolio.create(portfolioData);
    await Portfolio.updateXIRR(portfolioId);
    return portfolioId;
  }

  static async updatePortfolioValue(portfolioId, newValue) {
    await db.execute(
      'UPDATE portfolios SET total_value = ? WHERE id = ?',
      [newValue, portfolioId]
    );
    await Portfolio.updateXIRR(portfolioId);
  }

  static async getPortfolioMetrics(portfolioId) {
    const [rows] = await db.execute(`
      SELECT * FROM portfolios 
      WHERE id = ?
    `, [portfolioId]);
    return rows[0];
  }
}

module.exports = PortfolioService;