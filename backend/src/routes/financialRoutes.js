// backend/routes/financials.js
const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;

// Helper function to retry requests with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // Detect rate limiting: check error message, status code, or JSON parse errors from "Too Many Requests"
      const isRateLimited = 
        err.message?.includes('Too Many Requests') || 
        err.message?.includes('Unexpected token') ||  // JSON parse error from non-JSON response
        err.status === 429;
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (!isRateLimited || isLastAttempt) {
        throw err;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Rate limited, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

router.get('/fundamentals/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol.toUpperCase();
  const nseSymbol = `${rawSymbol}.NS`;
  const bseSymbol = `${rawSymbol}.BO`;

  try {
    const result = await retryWithBackoff(() => 
      yahooFinance.quoteSummary(nseSymbol, { modules: ['financialData', 'summaryDetail'] })
    );
    return res.json({ source: 'NSE', data: result });
  } catch (errNS) {
    console.warn(`NSE failed: ${errNS.message}`);
    try {
      const result = await retryWithBackoff(() =>
        yahooFinance.quoteSummary(bseSymbol, { modules: ['financialData', 'summaryDetail'] })
      );
      return res.json({ source: 'BSE', data: result });
    } catch (errBO) {
      console.error(`BSE failed: ${errBO.message}`);
      return res.status(429).json({ error: `Too many requests. Please try again later.`, details: errBO.message });
    }
  }
});

router.get('/details/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol.toUpperCase();
  
  let symbol = rawSymbol.includes('-') ? rawSymbol.split('-')[0] : rawSymbol;
  const bseSymbol = `${symbol}.BO`;
  const nseSymbol = `${symbol}.NS`;
  console.log(`Fetching details for symbol: ${symbol} (NSE: ${nseSymbol}, BSE: ${bseSymbol})`);
  try {
      const result = await retryWithBackoff(() =>
        yahooFinance.quote(bseSymbol, { modules: ['financialData', 'summaryDetail'] })
      );
      return res.json({ source: 'BSE', data: result });
    
  } catch (errBO) {
    console.warn(`BSE failed: ${errBO.message}`);
    try {
        const result = await retryWithBackoff(() =>
          yahooFinance.quote(nseSymbol, { modules: ['financialData', 'summaryDetail'] })
        );
        return res.json({ source: 'NSE', data: result });
    } catch (errNS) {
      console.error(`NSE failed: ${errNS.message}`);
      const statusCode = errNS.message?.includes('Too Many Requests') ? 429 : 404;
      const errorMessage = statusCode === 429 
        ? `Too many requests. Please try again later.` 
        : `Symbol ${symbol} not found on NSE or BSE.`;
      return res.status(statusCode).json({ error: errorMessage, details: errNS.message });
    }
  }
});



module.exports = router;
