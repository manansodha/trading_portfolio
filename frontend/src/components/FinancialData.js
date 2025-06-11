import React, { useEffect, useState } from 'react';
import { getFinancialDetails, getFinancialFundamentals } from '../services/api';
import { Typography, Card, CardContent, Grid2 as Grid, Divider, Box, CircularProgress } from '@mui/material';

const StockFinancials = ({ symbol }) => {
  const [fundamentals, setFundamentals] = useState();
  const [details, setDetails] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFinancialDetails(symbol);
        console.log('Financial details response:', response.data);
        setDetails(response.data);

        const fundResponse = await getFinancialFundamentals(symbol);
        console.log('Fundamental details response:', fundResponse.data.financialData);
        setFundamentals(fundResponse.data.financialData);
      } catch (err) {
        console.error('Failed to load financials', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);
    
   console.log('Financials details:', details);
    console.log('Fundamental details:', fundamentals);

  // Safely extract variables from details and fundamentals
  

    const formatINR = (val) =>
        Number(val).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
    });

    const formatNumber = (val) =>
        Number(val).toLocaleString('en-IN');

    if (loading) return <CircularProgress />;

  return (
    <Card sx={{ width: '100%', margin: 'auto', mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {details.longName} ({symbol})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} justifyContent={'space-between'}>
          {/* Market Section */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Market Overview</Typography>
            <Box>
              <Typography>Price: ₹{details.regularMarketPrice}</Typography>
              <Typography color={details.regularMarketChange >= 0 ? 'green' : 'red'}>
                Change: ₹{(details.regularMarketChange).toFixed(2)} ({(details.regularMarketChangePercent).toFixed(2)}%)
              </Typography>
              <Typography>Prev Close: ₹{details.regularMarketPreviousClose}</Typography>
              <Typography>Open: ₹{details.regularMarketOpen}</Typography>
              <Typography>Day Range: ₹{details.regularMarketDayLow} - ₹{details.regularMarketDayHigh}</Typography>
              <Typography>Volume: {details.regularMarketVolume.toLocaleString()}</Typography>
              <Typography>3M Avg Volume: {details.averageDailyVolume3Month.toLocaleString()}</Typography>
              <Typography>52W Range: ₹{details.fiftyTwoWeekLow} - ₹{details.fiftyTwoWeekHigh}</Typography>
              <Typography>52W Change: {details.fiftyTwoWeekChangePercent}%</Typography>
              <Typography>Last Updated: {new Date(details.regularMarketTime).toLocaleString()}</Typography>
            </Box>
          </Grid>

          {/* Financial Metrics Section */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Financial Summary</Typography>
            <Box>
              <Typography>Market Cap: ₹{(details.marketCap / 1e7).toFixed(2)} Cr</Typography>
              <Typography>Book Value: ₹{details.bookValue}</Typography>
              <Typography>EPS (TTM): ₹{details.epsTrailingTwelveMonths}</Typography>
              <Typography>Shares Outstanding: {formatNumber(details.sharesOutstanding)}</Typography>
              <Typography>Price to Book: {(details.priceToBook).toFixed(2)}</Typography>
              <Typography>50 Day MA: ₹{(details.fiftyDayAverage).toFixed(2)}</Typography>
              <Typography>200 Day MA: ₹{(details.twoHundredDayAverage).toFixed(2)}</Typography>
            </Box>
          </Grid>

          {/* Custom Financials Section */}
          <Grid item xs={12} sm={6}>

            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Key Financials</Typography>
            <Box>
              <Grid item xs={12} sm={4}>
                <Typography>Revenue: ₹{(fundamentals.totalRevenue/ 1e7).toFixed(2)}Cr</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Gross Profit: ₹{(fundamentals.grossProfits/ 1e7).toFixed(2) || 'NA'}Cr</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>EBITDA: ₹{(fundamentals.ebitda/ 1e7).toFixed(2) || 'NA'}Cr</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Operating Margin: {(fundamentals.operatingMargins * 100).toFixed(2) || 'NA'}%</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Return on Equity: {(fundamentals.returnOnEquity * 100).toFixed(2) || 'NA'}%</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Debt/Equity: {fundamentals.debtToEquity || 'NA'}</Typography>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StockFinancials;
