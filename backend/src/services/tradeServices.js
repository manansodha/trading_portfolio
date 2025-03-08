// backend/src/services/tradeService.js
const db = require('../utils/db');
const Trade = require('../models/Trade');

class TradeService {
  static async createTrade(tradeData) {
    const tradeId = await Trade.create(tradeData);
    
    // Update portfolio value
    const [rows] = await db.execute(`
      SELECT p.id, COALESCE(SUM(t.amount), 0) as total_value
      FROM portfolios p
      LEFT JOIN trades t ON t.trading_account_id = p.trading_account_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [tradeData.trading_account_id]);

    await PortfolioService.updatePortfolioValue(
      rows[0].id,
      rows[0].total_value
    );

    return tradeId;
  }

  static async getTradesByAccount(accountId) {
    const [rows] = await db.execute(`
      SELECT t.*, s.symbol, s.name
      FROM trades t
      JOIN stocks s ON t.stock_id = s.id
      WHERE t.trading_account_id = ?
      ORDER BY t.date DESC
    `, [accountId]);
    return rows;
  }

  static async uploadTradesCSV(accountId, csvData) {
    const trades = parseCSV(csvData);
    for (const trade of trades) {
      await this.createTrade({ ...trade, trading_account_id: accountId });
    }
  }
}

function parseCSV(csvData) {
  const trades = [];
  const lines = csvData.split('\n');
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const [date, symbol, tradeType, quantity, price, amount, isDividend] = 
      lines[i].split(',');
    
    trades.push({
      date: new Date(date),
      symbol,
      trade_type: tradeType,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      amount: parseFloat(amount),
      is_dividend: isDividend === 'true'
    });
  }
  
  return trades;
}

module.exports = TradeService;