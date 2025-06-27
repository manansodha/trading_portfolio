import React, { useEffect, useState } from 'react';
import { getPortfolio } from '../services/api';
import { addStock } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
    Box, Button, Card, Table, TableBody, TableCell, TableContainer, Tooltip, Snackbar,
    TableHead, TableRow, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, FormLabel, RadioGroup, Radio, FormControlLabel,
    Menu, Stack, Grid2 as Grid, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MuiAlert from '@mui/material/Alert';
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function PortfolioDashboard() {
    const [stocks, setStocks] = useState([]);  
    const [filteredStocks, setFilteredStocks] = useState([]);  
    const [filterType, setFilterType] = useState("active"); // Default filter: Active stocks
    const [error, setError] = useState(null);   
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const [newDate, setTradeDate] = useState("");
    const [newType, setTradeType] = useState("BUY");
    const [newQuantity, setQuantity] = useState("");
    const [newPrice, setPrice] = useState("");
    const [newSymbol, setSymbol] = useState("");

    const { user } = useAuth();
    const username = String(user?.username);

    const [searchQuery, setSearchQuery] = useState("");

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const showSnackbar = (msg, severity = "success") => {
        setSnackbarMessage(msg);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    useEffect(() => {
        document.title = "Trading Portfolio"; // Change tab name
    }, []);
    
    const fetchPortfolio = async () => {
        getPortfolio(username)
            .then(data => {
                if (Array.isArray(data)) {
                    setStocks(data);
                } else {
                    console.error("Unexpected API response format:", data);
                    setStocks([]);
                }
            })
            .catch(error => {
                console.error("Error in fetching portfolio:", error);
                setError("Failed to load portfolio data.");
                setStocks([]);
            });
        };
    
    
    useEffect(() => {
            if (username) fetchPortfolio();
    }, [username]);

    // Apply filtering when stocks or filterType changes
    useEffect(() => {
        if (filterType === "active") {
            setFilteredStocks(stocks.filter(stock => Number(stock.net_quantity) !== 0));
        } else if (filterType === "sold") {
            setFilteredStocks(stocks.filter(stock => Number(stock.net_quantity) === 0));
        }
    }, [stocks, filterType]);


    const handleSubmit = async () => {
        const tradeData = {
            date: newDate,
            symbol: newSymbol,
            quantity: newQuantity,
            price: newPrice,
            trade_type: newType,
            username: username,
        }
        try {
            console.log("Adding trade:", tradeData);
            await addStock(tradeData);
            showSnackbar("Trade added successfully!", "success");
            fetchPortfolio(); // Refresh data
        } catch (error) {
            console.error("Error adding trade:", error);
            showSnackbar("Failed to add trade.", "error");
        }
    };

    const displayedStocks = filteredStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const soldStocks = stocks.filter(stock => Number(stock.net_quantity) === 0);
    const totalInvestmentSold = soldStocks.reduce(
        (acc, stock) => acc + Number(stock.total_cost), 0
    );

    const totalProfitSold = soldStocks.reduce(
    (acc, stock) => acc + Number(stock.total_profit), 0
    );

    const activeStocks = stocks.filter(stock => Number(stock.net_quantity) !== 0);
    const totalInvestmentActive = activeStocks.reduce(
        (acc, stock) => acc + Number(stock.total_cost), 0
    );

    const formatINR = (val) =>
        Number(val).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
    });

    const formatNumber = (val) =>
        Number(val).toLocaleString('en-IN');

    return (
        <Box sx={{ width: '70%', margin: '20px auto', textAlign: 'center' }}>
        <Box sx={{ pb: 3 }}>
            {/* Upload & Manual Add Actions */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <Stack spacing={2} alignItems="center">
                <Typography variant="h6" fontWeight="bold" align="center">
                    Manage Your Portfolio
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
                    <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/upload')}
                    >
                    Upload Trade/Dividend History
                    </Button>

                    <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={() => setOpen(true)}
                    >
                    Add New Stock Manually
                    </Button>
                </Stack>
                </Stack>
            </Card>

            {/* Summary Card */}
            <Card
                sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #1976d2',
                mb: 3,
                }}
            >
                <Typography variant="h6" gutterBottom>
                Summary of {filterType === 'sold' ? 'Sold' : 'Active'} Stocks
                </Typography>
                <Typography>
                <strong>Total Stocks:</strong> {filteredStocks.length}
                </Typography>
                {filterType === 'sold' ? (
                <>
                    <Typography display="inline">
                    <strong>Total Profit/Loss:</strong>
                    </Typography>
                    <Typography display="inline" sx={{ color: totalProfitSold >= 0 ? 'green' : 'red', ml: 1 }}>
                    {formatINR(totalProfitSold)}
                    </Typography>
                </>
                ) : (
                <Typography>
                    <strong>Total Investment:</strong> {formatINR(totalInvestmentActive)}
                </Typography>
                )}
            </Card>

            {/* Add Stock Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Stock Manually</DialogTitle>
                <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                    label="Date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setTradeDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                    label="Stock Symbol"
                    value={newSymbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    fullWidth
                    />
                    <TextField
                    select
                    label="Type"
                    value={newType}
                    onChange={(e) => setTradeType(e.target.value)}
                    fullWidth
                    >
                    <MenuItem value="BUY">BUY</MenuItem>
                    <MenuItem value="SELL">SELL</MenuItem>
                    <MenuItem value="DIVIDEND">DIVIDEND</MenuItem>
                    </TextField>
                    <TextField
                    label="Quantity"
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                    />
                    <TextField
                    label="Price"
                    type="number"
                    value={newPrice}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                    />
                </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setOpen(false)} color="error" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    Add Stock
                </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={5} alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete='off'
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <SearchIcon />
                        </InputAdornment>
                    ),
                    }}
                />
                </Grid>

                <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Filter Portfolio</InputLabel>
                    <Select
                    value={filterType}
                    label="Filter Portfolio"
                    onChange={(e) => setFilterType(e.target.value)}
                    >
                    <MenuItem value="active">Active Stocks</MenuItem>
                    <MenuItem value="sold">Sold Stocks</MenuItem>
                    </Select>
                </FormControl>
                </Grid>
            </Grid>
            </Box>

            {filterType === 'active' ? (
            <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'left' }}>Symbol</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'center'}}>Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'center' }}>Avg Cost</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'center' }}>Total Cost</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedStocks.map((stock, index) => (
                            <Tooltip
                            key={index}
                            title={stock.net_quantity < 0 ? "Please add the initial buy trade" : ""}
                            arrow
                            placement="right"
                            slotProps={{
                                tooltip: {
                                    sx: {
                                        bgcolor: "black", // Dark background
                                        color: "white", // White text for contrast
                                        fontSize: "14px", // Larger text for readability
                                        fontWeight: "bold",
                                        p: 1.5, // Padding for better spacing
                                        borderRadius: "6px",
                                        boxShadow: 3
                                    },
                                },
                                arrow: {
                                    sx: {
                                        color: "black", // Arrow color matching tooltip
                                    },
                                },
                            }}
                        >
                            <TableRow key={index} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/stocks/${stock.symbol}`)}>
                                <TableCell sx={{textAlign:'left'}} >{stock.symbol}</TableCell>
                                <TableCell sx={{textAlign:'center'}} >{formatNumber(stock.net_quantity) || 0}</TableCell>
                                <TableCell sx={{textAlign:'center'}}>{stock.avg_cost ? `${formatINR(Number(stock.avg_cost))}` : 'N/A'}</TableCell>
                                <TableCell sx={{textAlign:'center'}}>{stock.avg_cost * stock.total_quantity ? `${formatINR(Number(stock.avg_cost * stock.total_quantity))}` : 'N/A'}</TableCell>
                            </TableRow>
                            </Tooltip>
                            
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>) : 
            
            

            <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'left'}} >Symbol</TableCell>
                            {/* <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'center', cursor:'pointer' }} >Total Investment</TableCell> */}
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'center', cursor:'pointer' }} >Profit Earned</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign:'center' }}>Dividend Earned</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedStocks.map((stock, index) => (
                            <TableRow 
                                key={index} 
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                            >
                                <TableCell sx={{textAlign:'left'}}>{stock.symbol}</TableCell>
                                {/* <TableCell sx={{textAlign:'center'}}>{stock.avg_cost ? `₹${Number(stock.avg_cost).toFixed(2)}` : 'N/A'}</TableCell> */}
                                <TableCell sx={{textAlign:'center', color: stock.total_profit >=0 ? "green" : "red"}}>{`${formatINR(stock.total_profit)}` || "₹0"}</TableCell>
                                <TableCell sx={{textAlign:'center'}}>{`${formatINR(stock.total_dividends)}`}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>}


            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} 
                    sx={{ width: '120%',  fontSize: '16px'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
