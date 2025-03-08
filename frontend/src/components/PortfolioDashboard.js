import { useEffect, useState } from 'react';
import { getPortfolio } from '../services/api';
import { addStock } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
    Box, Button, Table, TableBody, TableCell, TableContainer, 
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

            <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Symbol</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Avg Cost</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Cost</TableCell>
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
                                <TableCell>{stock.symbol}</TableCell>
                                <TableCell>{stock.total_quantity || 0}</TableCell>
                                <TableCell>{stock.avg_cost ? Number(stock.avg_cost).toFixed(2) : 'N/A'}</TableCell>
                                <TableCell>{stock.avg_cost * stock.total_quantity ? Number(stock.avg_cost * stock.total_quantity).toFixed(2) : 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
