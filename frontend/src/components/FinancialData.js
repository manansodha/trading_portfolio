import React, { useEffect, useState } from 'react';
import { getFinancialDetails } from '../services/api';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import TradingViewWidget from './TradingView';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const StockFinancials = ({ symbol }) => {
  const [details, setDetails] = useState();
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFinancialDetails(symbol);
        setDetails(response.data);
      } catch (err) {
        console.error('Failed to load financials', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  const formatINR = (val) =>
    Number(val).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });

  const formatDelta = (val) => {
    if (val === undefined || val === null) return 'NA';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}`;
  };

  const formatPercent = (val) => {
    if (val === undefined || val === null) return 'NA';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  if (loading) return <CircularProgress sx={{ mx: 'auto', mt: 4, display: 'block' }} />;

  return (
    


    <Box sx={{ width: '100%' }}>
      {!details?.longName === false ? (
        <>
          <Box
            sx={{
              mt: 1,
              mb: 2,
              p: { xs: 2, md: 2.5 },
              backgroundColor: '#f7f9fc',
              border: '1px solid #d7dfec',
              borderRadius: '12px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="h5" sx={{ color: '#1f2a44', fontWeight: 700, fontSize: '1.5rem' }}>
                  {symbol}
                </Typography>
                <Typography variant="h5" sx={{ color: '#1f2a44', fontWeight: 700, fontSize: '1.5rem' }}>
                  {formatINR(details.regularMarketPrice)}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: details.regularMarketChange >= 0 ? '#22c55e' : '#ff1744',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {formatDelta(details.regularMarketChange)} ({formatPercent(details.regularMarketChangePercent)})
                </Typography>
              </Box>
              <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>
                {details.exchange || 'NSE'}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                rowGap: 2,
                columnGap: 2,
              }}
            >
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>LTP</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.regularMarketPrice)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>Volume</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{details.regularMarketVolume?.toLocaleString('en-IN') || 'NA'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>Open</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.regularMarketOpen)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>Prev Close</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.regularMarketPreviousClose)}</Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>Day High</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.regularMarketDayHigh)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>Day Low</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.regularMarketDayLow)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>52W High</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.fiftyTwoWeekHigh)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#6b7b97', fontSize: '0.9rem' }}>52W Low</Typography>
                <Typography sx={{ color: '#1f2a44', fontSize: '1.45rem', fontWeight: 700 }}>{formatINR(details.fiftyTwoWeekLow)}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Financial Summary */}
          {/* <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f7f7f7'}}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaidIcon />
                <Typography variant="h6" fontWeight="bold"> Financial Summary</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Market Cap: {formatCr(details.marketCap)}</Typography>
              <Typography>Book Value: {formatINR(details.bookValue)}</Typography>
              <Typography>EPS (TTM): {formatINR(details.epsTrailingTwelveMonths)}</Typography>
              <Typography>Shares Outstanding: {details.sharesOutstanding?.toLocaleString()}</Typography>
              <Typography>Price to Book: {safeVal(details.priceToBook)}</Typography>
              <Typography>50 Day Avg: {formatINR(details.fiftyDayAverage)}</Typography>
              <Typography>200 Day Avg: {formatINR(details.twoHundredDayAverage)}</Typography>
            </AccordionDetails>
          </Accordion> */}

          {/* Key Financials */}
          {/* <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#fcfcfc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon/>
                <Typography variant="h6" fontWeight="bold">Key Financials</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Revenue: {formatCr(fundamentals?.totalRevenue)}</Typography>
              <Typography>Gross Profit: {formatCr(fundamentals?.grossProfits)}</Typography>
              <Typography>EBITDA: {formatCr(fundamentals?.ebitda)}</Typography>
              <Typography>Operating Margin: {safeVal(fundamentals?.operatingMargins, true)}</Typography>
              <Typography>Return on Equity: {safeVal(fundamentals?.returnOnEquity, true)}</Typography>
              <Typography>Debt/Equity: {fundamentals?.debtToEquity ?? 'NA'}</Typography>
            </AccordionDetails>
          </Accordion> */}

       
              
            
              <TradingViewWidget symbol={symbol} />
            
        </>
      ) : (
        <Typography variant="h6" color="error" textAlign="center">
          No financial data available for {symbol}
        </Typography>
      )}
      </Box>
  );
};

export default StockFinancials;
