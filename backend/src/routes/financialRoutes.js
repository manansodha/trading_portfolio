// backend/routes/financials.js
const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;

router.get('/fundamentals/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol.toUpperCase();
  const nseSymbol = `${rawSymbol}.NS`;
  const bseSymbol = `${rawSymbol}.BO`;

  try {
    const result = await yahooFinance.quoteSummary(nseSymbol, { modules: ['financialData', 'summaryDetail'] });
    return res.json({ source: 'NSE', data: result });
  } catch (errNS) {
    console.warn(`NSE failed: ${errNS.message}`);
    try {
      const result = await yahooFinance.quoteSummary(bseSymbol, { modules: ['financialData', 'summaryDetail'] });
      return res.json({ source: 'BSE', data: result });
    } catch (errBO) {
      console.error(`BSE failed: ${errBO.message}`);
      return res.status(404).json({ error: `Symbol ${rawSymbol} not found on NSE or BSE.` });
    }
  }
});

router.get('/details/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol.toUpperCase();
  
  if ('-' in rawSymbol) {
  const symbol = rawSymbol.split('-')[0]; }
  else {
    var symbol = rawSymbol;
  }
  
  const bseSymbol = `${symbol}.BO`;
  const nseSymbol = `${symbol}.NS`;

  try {
      const result = await yahooFinance.quote(bseSymbol, { modules: ['financialData', 'summaryDetail'] });
      return res.json({ source: 'BSE', data: result });
    
  } catch (errBO) {
    console.warn(`NSE failed: ${errNS.message}`);
    try {
        const result = await yahooFinance.quote(nseSymbol, { modules: ['financialData', 'summaryDetail'] });
        return res.json({ source: 'NSE', data: result });
    } catch (errNS) {
      console.error(`NSE failed: ${errNS.message}`);
      return res.status(404).json({ error: `Symbol ${symbol} not found on NSE or BSE.` });
    }
  }
});



module.exports = router;
