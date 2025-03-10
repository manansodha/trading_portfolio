import { useEffect, useState } from 'react';
import { getStockDetails, addTrade, deleteTrade, temporaryXIRR} from '../services/api';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    MenuItem,
    DialogTitle,
    DialogContent,
    DialogActions, 
    Dialog
} from "@mui/material";

export default function StockDetails() {
    const { symbol } = useParams();
    
    // Trade fetch values
    const [trades, setTrades] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalPnL, setTotalPnL] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [totalDividend, setTotalDividend] = useState(0);
    const [totalRG, setTotalRG] = useState(0);
    const [xirr, setXirr] = useState(null);
    
    
    const { user } = useAuth();
    const navigate = useNavigate();
    const username = String(user?.username);
    const [open, setOpen] = useState(false)

    // Trade entry state
    const [tradeType, setTradeType] = useState("BUY");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [tradeDate, setTradeDate] = useState("");

    // Temporary XIRR Calculation state
    const [sellPrice, setSellPrice] = useState("");
    const [sellDate, setSellDate] = useState("");
    const [tempXirrResult, setTempXirrResult] = useState(null);
    const [openXIRR, setOpenXIRR] = useState(false)
     
    useEffect(() => {
        document.title = symbol; // Change tab name
    }, []);

    useEffect(() => {
        if (!username) {
            console.error("No username provided!");
            return;
        }

        getStockDetails(symbol, username)
            .then(response => {
                if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
                    setTrades(Object.values(response.data.data));
                } else if (Array.isArray(response.data.data)) {
                    setTrades(response.data.data);
                } else {
                    console.error("Unexpected API response format:", response.data.data);
                    setTrades([]);
                }
                setTotalPnL(response.data.total_pnl ?? 0);
                setTotalQuantity(response.data.total_quantity ?? 0);
                setTotalCost(response.data.total_cost ?? 0);
                setTotalDividend(response.data.total_dividend ?? 0);
                setTotalRG(response.data.total_rg ?? 0);
                setXirr(response.data.xirr ?? null);
            })
            .catch(error => {
                console.error("Error in fetching stock details:", error);
                setTrades([]);
            });
    }, [symbol, username]);

    // Function to handle adding a trade
    const handleAddTrade = async () => {
        if (!quantity || !price || !tradeDate) {
            alert("Please fill in all fields.");
            return;
        }

        const tradeData = {
            username,
            symbol,
            trade_type: tradeType,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            date: tradeDate,
        };

        try {
            console.log("Adding trade:", tradeData);
            await addTrade(tradeData, symbol, username);
            alert("Trade added successfully!");
            setQuantity("");
            setPrice("");
            setTradeDate("");
            window.location.reload(); // Refresh data
        } catch (error) {
            console.error("Error adding trade:", error);
            alert("Failed to add trade.");
        }
    };

    const handleDeleteTrade = async (id, symbol, type) => {

        const tradeData = {
            username,
            symbol,
            trade_type: type.toUpperCase(),
            id: id,
        };
        console.log("Deleting trade:", tradeData);
        if (!window.confirm("Are you sure you want to delete this trade?")) return;

        try {
            await deleteTrade(tradeData);
            setTrades(trades.filter(trade => trade.id !== id));
            alert("Trade deleted successfully!");
            window.location.reload(); 
        } catch (error) {
            console.error("Error deleting trade:", error);
        }
    };

    // Function to calculate temporary XIRR
    const handleCalculateXirr = async () => {
        if (!sellPrice || !sellDate) {
            alert("Please enter sell price and date");
            return;
        }
        const sellData = {
            username,
            symbol,
            sellPrice,
            sellDate
        }

        try {
            const response = await temporaryXIRR(sellData);
            setTempXirrResult(response.data);
        } catch (error) {
            console.error("Error calculating XIRR:", error);
            alert("Failed to calculate XIRR");
        }
    };

    // Reset XIRR simulation
    const handleResetXirr = () => {
        setSellPrice("");
        setSellDate("");
        setTempXirrResult(null);
        setOpenXIRR(false)
    };


    return (
        <Box sx={{ p: 3, fontFamily: "Arial, sans-serif" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
            <Button variant="contained" align='left' onClick={() => navigate('/')}>
                Back
            </Button>
            <Button variant="contained" align='right' color="primary" onClick={() => setOpen(true)}>
                Add New Trade
            </Button>
            </Box>

            <Typography variant="h4" align="center" gutterBottom>
                Stock Details: {symbol}
            </Typography>

            {/* Summary Details */}
            <Box sx={{ mt: 2, mb: 3, p: 2, display: 'flex', justifyContent: 'space-between', border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    {totalQuantity !== 0 ? (
                        <Typography variant="h6" sx={{ color: totalPnL >= 0 ? "green" : "red" }}>
                            Total Realised Gains: ₹{totalRG}
                        </Typography>
                    ) : (
                        <Typography variant="h6" sx={{ color: totalPnL >= 0 ? "green" : "red" }}>
                            Total PnL: ₹{totalPnL}
                        </Typography>
                    )}
                    
                    <Typography variant="h6" >
                        Total Cost: ₹{totalCost}
                    </Typography>
                    <Typography variant="h6" >
                        Dividend Earned: ₹{totalDividend}
                    </Typography>
                </Box>

                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant="h6">Remaining Quantity: {totalQuantity}</Typography>
                {xirr !== null ? (
                    <Typography variant="h6" sx={{ color: "blue" }}>
                        XIRR: {(xirr)}%
                    </Typography>
                ) : (
                    <Typography variant="h6" sx={{ color: "red" }}>
                        Insufficient data for XIRR
                    </Typography>
                )}
                {totalQuantity !==0 ?
                    (<Button variant="contained" align='right' color="primary" onClick={() => setOpenXIRR(true)}>
                        Check Temporary XIRR
                    </Button>):(null)}
                </Box>
            </Box>


            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f4f4f4" }}>
                            <TableCell align="center"><strong>Date</strong></TableCell>
                            <TableCell align="center"><strong>Type</strong></TableCell>
                            <TableCell align="center"><strong>Quantity</strong></TableCell>
                            <TableCell align="center"><strong>Average Cost (₹)</strong></TableCell>
                            <TableCell align="center"><strong>Total Cost (₹)</strong></TableCell>
                            <TableCell align="center"><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trades.length > 0 ? (
                            trades.map((trade) => (
                                <TableRow key={trade.id} sx={{ backgroundColor: trades.indexOf(trade) % 2 === 0 ? "#f9f9f9" : "white" }}>
                                    <TableCell align="center">{new Date(trade.date).toLocaleDateString()}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "bold", color: trade.trade_type.toUpperCase() === "BUY" ? "green" : "red" }}>
                                        {trade.trade_type.toUpperCase()}
                                    </TableCell>
                                    <TableCell align="center">{trade.quantity || "-"}</TableCell>
                                    <TableCell align="center">{trade.average_price ? `₹${parseFloat(trade.average_price).toFixed(2)}` : "-"}</TableCell>
                                    <TableCell align="center">{trade.average_price ? `₹${(parseFloat(trade.average_price) * trade.quantity).toFixed(2)}` : "-"}</TableCell>
                                    <TableCell align="center">
                                        <Button color="error" onClick={() => handleDeleteTrade(trade.id, trade.symbol, trade.trade_type)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic" }}>
                                    No trade history available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
                    
                {/* Add Trade Box */}
                <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Manually
                <DialogContent>
                    <Typography variant="h6">Add Trade</Typography>
                    <TextField label="Date" type="date" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
                    <TextField select label="Type" value={tradeType} onChange={(e) => setTradeType(e.target.value)} fullWidth margin="normal">
                        <MenuItem value="BUY">BUY</MenuItem>
                        <MenuItem value="SELL">SELL</MenuItem>
                        <MenuItem value="DIVIDEND">DIVIDEND</MenuItem>
                    </TextField>
                    <TextField label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth margin="normal" />
                    <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth margin="normal" />
                </DialogContent>
                <DialogActions>    
                    <Button variant="outlined" color="error" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleAddTrade} >
                        Add Trade
                    </Button>
                </DialogActions>
                </DialogTitle>
                </Dialog>



                {/* Temporary XIRR Box */}
                <Dialog open={openXIRR} onClose={() => setOpenXIRR(false)}>
                <DialogTitle>Check XIRR
                <DialogContent>
                    <Typography variant="h6">Add Trade</Typography>
                    <TextField label="Date" type="date" value={sellDate} onChange={(e) => setSellDate(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />                   
                    <TextField label="Price" type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} fullWidth margin="normal" />
                    <TextField label="Quantity" type="number" value={totalQuantity} disabled fullWidth margin="normal" />
                </DialogContent>
                <DialogActions>    
                    <Button variant="outlined" color="error" onClick={handleResetXirr}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleCalculateXirr} >
                        Check
                    </Button>
                </DialogActions>
                    {tempXirrResult && (
                        <Box sx={{ mt: 2, p: 2, border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#fff" }}>
                            <Typography variant="h6">Results:</Typography>
                            <Typography>Total Realisation: ₹{tempXirrResult.total_realisation}</Typography>
                            <Typography sx={{color: tempXirrResult.profit >=0 ? "green" : "red"}}>Profit: ₹{tempXirrResult.profit}</Typography>
                            <Typography>New XIRR: {tempXirrResult.new_xirr ? `${tempXirrResult.new_xirr}%` : "Insufficient Data"}</Typography>
                        </Box>
                    )}
                </DialogTitle>
                </Dialog>
        </Box>
    );
}
