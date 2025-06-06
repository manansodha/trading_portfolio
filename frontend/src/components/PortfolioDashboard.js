import { useEffect, useState } from 'react';
import { getPortfolio } from '../services/api';
import { addStock } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
    Box, Button, Card, Table, TableBody, TableCell, TableContainer, Tooltip,
    TableHead, TableRow, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';

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

    useEffect(() => {
        document.title = "Trading Portfolio"; // Change tab name
    }, []);
    
    useEffect(() => {
        if (!username) {
            console.error("No username provided!");
            return;
        }

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
    }, [username]);

    // Apply filtering when stocks or filterType changes
    useEffect(() => {
        if (filterType === "active") {
            setFilteredStocks(stocks.filter(stock => Number(stock.total_quantity) !== 0));
        } else if (filterType === "sold") {
            setFilteredStocks(stocks.filter(stock => Number(stock.total_quantity) === 0));
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
            alert("Trade added successfully!");
            window.location.reload(); // Refresh data
        } catch (error) {
            console.error("Error adding trade:", error);
            alert("Failed to add trade.");
        }
    };

    const soldStocks = stocks.filter(stock => Number(stock.total_quantity) === 0);
    const totalInvestmentSold = soldStocks.reduce(
        (acc, stock) => acc + Number(stock.total_cost), 0
    );

    const totalProfitSold = soldStocks.reduce(
    (acc, stock) => acc + Number(stock.total_profit), 0
    );

    const activeStocks = stocks.filter(stock => Number(stock.total_quantity) !== 0);
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
        <Box sx={{ width: '80%', margin: '20px auto', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>Portfolio</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/upload')}
                >
                    Upload Trade/Dividend History
                </Button>
                <Button variant="contained" color="secondary" onClick={() => setOpen(true)}>Add New Stock Manually</Button>
                <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Stock Manually</DialogTitle>
                <DialogContent>
                    <TextField label="Date" type="date" value={newDate} onChange={(e) => setTradeDate(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
                    <TextField label="Stock Symbol" type="text" value={newSymbol} onChange={(e) => setSymbol(e.target.value)} fullWidth margin="normal" />
                    <TextField select label="Type" value={newType} onChange={(e) => setTradeType(e.target.value)} fullWidth margin="normal">
                        <MenuItem value="BUY">BUY</MenuItem>
                        <MenuItem value="SELL">SELL</MenuItem>
                        <MenuItem value="DIVIDEND">DIVIDEND</MenuItem>
                    </TextField>
                    <TextField label="Quantity" type="number" value={newQuantity} onChange={(e) => setQuantity(e.target.value)} fullWidth margin="normal" />
                    <TextField label="Price" type="number" value={newPrice} onChange={(e) => setPrice(e.target.value)} fullWidth margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="error" variant='outlined'>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">Add Stock</Button>
                </DialogActions>
                </Dialog>
            </Box>

            {/* Filter Dropdown */}
            <FormControl sx={{ minWidth: 200, marginBottom: '20px' }}>
                <InputLabel>Filter Portfolio</InputLabel>
                <Select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value)}
                    label="Filter Portfolio"
                >
                    <MenuItem value="active">Active Stocks</MenuItem>
                    <MenuItem value="sold">Sold Stocks</MenuItem>
                </Select>
                

            </FormControl>


            {filterType === 'sold'? (
            <Card sx={{ padding: 2, marginBottom: 2, textAlign: 'left', 
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', 
                        borderRadius: '8px', border: '1px solid #1976d2' }}>
                <Typography variant="h6" gutterBottom>Summary of Sold Stocks</Typography>
                <Typography><strong>Total Stocks:</strong> {filteredStocks.length}</Typography>
                {/* <Typography><strong>Total Investment:</strong> ₹{totalInvestmentSold.toFixed(2)}</Typography> */}
                 
                    <Typography display="inline"><strong>Total Profit/Loss:</strong></Typography> 
                    <Typography display="inline" sx={{color: totalProfitSold >=0 ? "green" : "red"}}> {formatINR(totalProfitSold)}</Typography>
                
            </Card>
            ):(<Card sx={{ padding: 2, marginBottom: 2, textAlign: 'left', 
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', 
                        borderRadius: '8px', border: '1px solid #1976d2' }}>
                <Typography variant="h6" gutterBottom>Summary of Active Stocks</Typography>
                <Typography><strong>Total Stocks:</strong> {filteredStocks.length}</Typography>
                <Typography><strong>Total Investment:</strong> {formatINR(totalInvestmentActive)}</Typography>
            </Card>)}



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
                        {filteredStocks.map((stock, index) => (
                            <Tooltip
                            key={index}
                            title={stock.total_quantity < 0 ? "Please add the initial buy trade" : ""}
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
                                <TableCell sx={{textAlign:'center'}} >{formatNumber(stock.total_quantity) || 0}</TableCell>
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
                        {filteredStocks.map((stock, index) => (
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
        </Box>
    );
}
