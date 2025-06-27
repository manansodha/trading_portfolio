import React, { useEffect, useState } from 'react';
import { getFinancialDetails, getFinancialFundamentals } from '../services/api';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PaidIcon from '@mui/icons-material/Paid';
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
import { Padding } from '@mui/icons-material';

const StockFinancials = ({ symbol }) => {
  const [fundamentals, setFundamentals] = useState();
  const [details, setDetails] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFinancialDetails(symbol);
        setDetails(response.data);
        const fundResponse = await getFinancialFundamentals(symbol);
        setFundamentals(fundResponse.data.financialData);
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

  const formatCr = (val) =>
    val !== undefined && val !== null ? `${(val / 1e7).toFixed(2)} Cr` : 'NA';

  const safeVal = (val, percent = false) =>
    val !== undefined && val !== null
      ? percent
        ? `${(val).toFixed(2)}%`
        : val.toFixed(2)
      : 'NA';

  if (loading) return <CircularProgress sx={{ mx: 'auto', mt: 4, display: 'block' }} />;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
        {details?.longName} ({symbol})
      </Typography>

      {/* Market Overview */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f0f0f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShowChartIcon/>
          <Typography variant="h6" fontWeight="bold">Market Overview</Typography>
        </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>LTP: {formatINR(details.regularMarketPrice)}</Typography>
          <Typography sx={{ color: details.regularMarketChange >= 0 ? 'green' : 'red' }}>
            Change: {formatINR(details.regularMarketChange)} ({safeVal(details.regularMarketChangePercent, true)})
          </Typography>
          <Typography>Prev Close: {formatINR(details.regularMarketPreviousClose)}</Typography>
          <Typography>Open: {formatINR(details.regularMarketOpen)}</Typography>
          <Typography>Day Range: {formatINR(details.regularMarketDayLow)} - {formatINR(details.regularMarketDayHigh)}</Typography>
          <Typography>Volume: {details.regularMarketVolume?.toLocaleString()}</Typography>
          <Typography>3M Avg Volume: {details.averageDailyVolume3Month?.toLocaleString()}</Typography>
          <Typography>52W Range: {formatINR(details.fiftyTwoWeekLow)} - {formatINR(details.fiftyTwoWeekHigh)}</Typography>
          <Typography>52W Change: {safeVal(details.fiftyTwoWeekChangePercent, true)}</Typography>
          <Typography>Last Updated: {new Date(details.regularMarketTime).toLocaleString()}</Typography>
        </AccordionDetails>
      </Accordion>

      {/* Financial Summary */}
      <Accordion>
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
      </Accordion>

      {/* Key Financials */}
      <Accordion>
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
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f7f7f7' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CandlestickChartIcon sx={{margin:"auto"}}/>
          <Typography variant="h6" fontWeight="bold">Interactive Chart</Typography>
        </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TradingViewWidget symbol={symbol} />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default StockFinancials;
