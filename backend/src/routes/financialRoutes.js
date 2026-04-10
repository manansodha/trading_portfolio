// backend/routes/financials.js
const express = require('express');
const router = express.Router();
const YAHOO_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Accept: 'application/json',
};

function unwrapValue(value) {
  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'raw')) {
    return value.raw;
  }
  return value ?? null;
}

function normalizeSymbol(rawSymbol) {
  const symbol = String(rawSymbol || '').toUpperCase().replace(/[^A-Z0-9&_.-]/g, '');
  if (!symbol || !/^[A-Z0-9&_.-]{1,20}$/.test(symbol)) {
    throw new Error('Invalid symbol');
  }
  return symbol;
}

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

async function fetchYahooJson(url) {
  return retryWithBackoff(async () => {
    const response = await fetch(url, { headers: YAHOO_HEADERS });
    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`Yahoo API error [${response.status}]: ${text.substring(0, 200)}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  });
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function buildMarketData(symbol, chartResult) {
  const meta = chartResult?.meta || {};
  const quote = chartResult?.indicators?.quote?.[0] || {};
  const timestamps = chartResult?.timestamp || [];
  const lastIdx = timestamps.length - 1;

  const highs = (quote.high || []).filter((v) => v !== null && v !== undefined);
  const lows = (quote.low || []).filter((v) => v !== null && v !== undefined);
  const closes = (quote.close || []).filter((v) => v !== null && v !== undefined);
  const volumes = (quote.volume || []).filter((v) => v !== null && v !== undefined);

  const ltp = meta.regularMarketPrice ?? null;
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const open = quote.open?.[lastIdx] ?? null;
  const dayHigh = quote.high?.[lastIdx] ?? null;
  const dayLow = quote.low?.[lastIdx] ?? null;
  const volume = meta.regularMarketVolume ?? quote.volume?.[lastIdx] ?? null;
  const week52High = highs.length ? Math.max(...highs) : null;
  const week52Low = lows.length ? Math.min(...lows) : null;
  const change = ltp !== null && previousClose !== null ? ltp - previousClose : null;
  const changePercent = ltp !== null && previousClose ? ((ltp - previousClose) / previousClose) * 100 : null;
  const fiftyDayAverage = closes.length ? average(closes.slice(-50)) : null;
  const twoHundredDayAverage = closes.length ? average(closes.slice(-200)) : null;
  const averageDailyVolume3Month = volumes.length ? average(volumes.slice(-63)) : null;
  const marketCap = meta.sharesOutstanding && ltp !== null ? meta.sharesOutstanding * ltp : null;
  const priceToBook = meta.bookValue && ltp !== null ? ltp / meta.bookValue : null;

  return {
    longName: meta.longName || symbol,
    regularMarketPrice: ltp,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    regularMarketPreviousClose: previousClose,
    regularMarketOpen: open,
    regularMarketDayLow: dayLow,
    regularMarketDayHigh: dayHigh,
    regularMarketVolume: volume,
    averageDailyVolume3Month,
    fiftyTwoWeekLow: week52Low,
    fiftyTwoWeekHigh: week52High,
    fiftyTwoWeekChangePercent:
      week52Low && ltp !== null ? ((ltp - week52Low) / week52Low) * 100 : null,
    regularMarketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
    marketCap,
    bookValue: meta.bookValue ?? null,
    epsTrailingTwelveMonths: meta.epsCurrentYear ?? null,
    sharesOutstanding: meta.sharesOutstanding ?? null,
    priceToBook,
    fiftyDayAverage,
    twoHundredDayAverage,
    operatingMargins: null,
    returnOnEquity: null,
    debtToEquity: null,
    currency: meta.currency || 'INR',
    exchange: meta.exchangeName || 'NSE',
  };
}

async function fetchChart(symbolWithExchange) {
  const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(symbolWithExchange)}?interval=1d&range=1y&includePrePost=false`;
  const payload = await fetchYahooJson(url);
  if (payload?.chart?.error) {
    throw new Error(payload.chart.error.description || 'Yahoo chart error');
  }
  return payload?.chart?.result?.[0] || null;
}

async function tryNseThenBse(symbol, handler) {
  const nseSymbol = `${symbol}.NS`;
  const bseSymbol = `${symbol}.BO`;

  try {
    const data = await handler(nseSymbol);
    return { source: 'NSE', data };
  } catch (errNS) {
    console.warn(`NSE failed: ${errNS.message}`);
    const data = await handler(bseSymbol);
    return { source: 'BSE', data };
  }
}

router.get('/fundamentals/:symbol', async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const result = await tryNseThenBse(symbol, async (symbolWithExchange) => {
      const chart = await fetchChart(symbolWithExchange);
      if (!chart) {
        throw new Error('No data found');
      }
      return {
        financialData: {
          totalRevenue: null,
          grossProfits: null,
          ebitda: null,
          operatingMargins: null,
          returnOnEquity: null,
          debtToEquity: null,
        },
        summaryDetail: {
          marketCap: null,
          priceToBook: null,
          averageVolume: null,
        },
      };
    });

    return res.json(result);
  } catch (err) {
    console.error(`Fundamentals failed: ${err.message}`);
    const status = err.message === 'Invalid symbol' ? 400 : 429;
    return res.status(status).json({ error: status === 400 ? 'Invalid symbol' : 'Failed to fetch data', details: err.message });
  }
});

router.get('/details/:symbol', async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    console.log(`Fetching details for ${symbol}`);

    const result = await tryNseThenBse(symbol, async (symbolWithExchange) => {
      const chart = await fetchChart(symbolWithExchange);

      if (!chart) {
        throw new Error('No data found');
      }

      return buildMarketData(symbol, chart);
    });

    return res.json(result);
  } catch (err) {
    console.error('Details fetch failed:', err);
    const status = err.message === 'Invalid symbol' ? 400 : 429;
    return res.status(status).json({
      error: status === 400 ? 'Invalid symbol' : 'Failed to fetch data',
      details: err.message,
    });
  }
});



module.exports = router;
