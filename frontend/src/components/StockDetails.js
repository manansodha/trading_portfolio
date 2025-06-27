import React, { useEffect, useState } from 'react';
import { getStockDetails, addTrade, deleteTrade, temporaryXIRR} from '../services/api';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import StockFinancials from './FinancialData';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions, 
    Dialog,
    Fab,
    MenuItem,
    Tab,
    Paper,
    Tabs, 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    TextField,
    Snackbar,
} from "@mui/material";

import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState(null); // stores {id, symbol, type}


    // Temporary XIRR Calculation state
    const [sellPrice, setSellPrice] = useState("");
    const [sellDate, setSellDate] = useState("");
    const [tempXirrResult, setTempXirrResult] = useState(null);
    const [openXIRR, setOpenXIRR] = useState(false)
     
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
        document.title = symbol; // Change tab name
    }, [symbol]);

    useEffect(() => {
        if (tradeToDelete) setConfirmOpen(true);
    }, [tradeToDelete]);

    const formatINR = (val) =>
        Number(val).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
   });

   const formatIn = (val) =>
    Number(val).toLocaleString('en-IN');



    const fetchStockDetails = () => {
        getStockDetails(symbol, username)
            .then(response => {
                if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
                    setTrades(Object.values(response.data.data));
                } else if (Array.isArray(response.data.data)) {
                    setTrades(response.data.data);
                } else {
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
    };

    useEffect(() => {
        if (username) fetchStockDetails();
    }, [symbol, username]);


    // Function to handle adding a trade
    const handleAddTrade = async () => {
        if (!quantity || !price || !tradeDate) {
            showSnackbar("Please fill in all fields.", "warning");
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
            showSnackbar("Trade added successfully!", "success");
            setQuantity("");
            setPrice("");
            setTradeDate("");
            setOpen(false); // close dialog
            fetchStockDetails();
        } catch (error) {
            console.error("Error adding trade:", error);
            showSnackbar("Failed to add trade.", "error");
        }
    };

    const confirmDeleteTrade = async () => {
        const { id, symbol, type } = tradeToDelete;

        try {
            await deleteTrade({
            username,
            symbol,
            trade_type: type.toUpperCase(),
            id: id,
            });
            setTrades(trades.filter(trade => trade.id !== id));
            showSnackbar("Trade deleted successfully!", "success");
        } catch (error) {
            console.error("Error deleting trade:", error);
            showSnackbar("Failed to delete trade.", "error");
        } finally {
            setConfirmOpen(false);
            setTradeToDelete(null);
            fetchStockDetails();// optional
        }
        };


    // Function to calculate temporary XIRR
    const handleCalculateXirr = async () => {
        if (!sellPrice || !sellDate) {
            showSnackbar("Please enter sell price and date", "warning");
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
            showSnackbar("Failed to calculate XIRR", "error");
        }
    };

    // Reset XIRR simulation
    const handleResetXirr = () => {
        setSellPrice("");
        setSellDate("");
        setTempXirrResult(null);
        setOpenXIRR(false)
    };


    // Tab state
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };


    return (
        <Box sx={{ p: 3, fontFamily: "Arial, sans-serif", width: '80%' , margin: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' , gap: '20px', marginBottom: '20px' }}>
            <Fab size="small" color="primary" align='left' onClick={() => navigate('/')}>
                <KeyboardBackspaceIcon /> 
            </Fab>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'left', flexGrow: 1 }}>
                {symbol}
            </Typography>
            <Tooltip title="Add Trade" arrow placement='left' slotProps={{
                                tooltip: {sx: {bgcolor: "black", color: "white", fontSize: '14px'},},
                                arrow: {sx: {color: "black", },},
                            }}>
            <Fab size="small" align='right' color="primary" onClick={() => setOpen(true)}>
                <AddIcon />
            </Fab>   
            </Tooltip>
            </Box>


            {/* Summary Details */}
            <Box sx={{ width: '100%', mt: 4 }}>
                
                <Tabs value={tabValue} onChange={handleTabChange} centered variant="fullWidth">
                    <Tab
                        label="Stock Details"
                        onMouseEnter={e => e.target.style.color = 'white'}
                        onMouseLeave={e => e.target.style.color = ''}
                        sx={{ 
                            fontSize: '16px' 
                        }}/>
                    
                    <Tab
                        label="My Transactions"
                        onMouseEnter={e => e.target.style.color = 'white'}
                        onMouseLeave={e => e.target.style.color = ''}
                        sx={{  
                            fontSize: '16px' 
                        }}
                    />
                    
                </Tabs>
                
            </Box>


            {/* Tabs Section */}
            <Box sx={{ width: '100%', mt: 4 }}>
                
                
                
                {tabValue === 1 && (
                    
                    <Box sx={{ width: '100%', mt: 4 }}>
                        {/* My Transactions Tab */}
                <Box sx={{ mt: 2, mb: 3, p: 2, display: 'flex', justifyContent: 'space-between', border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        {totalQuantity !== 0 ? (
                            <Typography variant="h6" sx={{ color: totalPnL >= 0 ? "green" : "red" }}>
                                Total Realised Gains: {formatINR(totalRG)}
                            </Typography>
                        ) : (
                            <Typography variant="h6" sx={{ color: totalPnL >= 0 ? "green" : "red" }}>
                                Total PnL: {formatINR(totalPnL)}
                            </Typography>
                        )}
                        
                        <Typography variant="h6" >
                            Total Cost: {formatINR(totalCost)}
                        </Typography>
                        <Typography variant="h6" >
                            Dividend Earned: {formatINR(totalDividend)}
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="h6">Remaining Quantity: {totalQuantity}</Typography>
                    {xirr !== null ? (
                        <Typography variant="h6" sx={{ color: "blue" }}>
                            XIRR: {formatIn(xirr)}%
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
                                    <TableCell align="center"><strong>Average Cost</strong></TableCell>
                                    <TableCell align="center"><strong>Total Cost</strong></TableCell>
                                    <TableCell align="center"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {trades.length > 0 ? (
                                    trades.map((trade) => (
                                        <TableRow key={trade.id} sx={{ backgroundColor: trades.indexOf(trade) % 2 === 0 ? "#f9f9f9" : "white" }}>
                                            <TableCell align="center">{(() => {
                                                    const d = new Date(trade.date);
                                                    const day = String(d.getDate()).padStart(2, '0');
                                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                                    const year = d.getFullYear();
                                                    return `${day}/${month}/${year}`;
                                                    })()}</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: "bold", color: trade.trade_type.toUpperCase() === "BUY" ? "green" : "red" }}>
                                                {trade.trade_type.toUpperCase()}
                                            </TableCell>
                                            <TableCell align="center">{trade.quantity || "-"}</TableCell>
                                            <TableCell align="center">{trade.average_price ? `${formatINR(parseFloat(trade.average_price).toFixed(2))}` : "-"}</TableCell>
                                            <TableCell align="center">{trade.average_price ? `${formatINR((parseFloat(trade.average_price) * trade.quantity).toFixed(2))}` : "-"}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                        color="error"
                                                        onClick={() =>
                                                            setTradeToDelete({ id: trade.id, symbol: trade.symbol, type: trade.trade_type })
                                                        }
                                                        >
                                                        Delete
                                                        </Button>

                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ fontStyle: "italic" }}>
                                            No trade history available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Box>
                )}

                {/* Stock Details Tab */}
                {tabValue === 0 && (
                    <Box sx={{ mt: 3, p: 3, backgroundColor: "#fafafa", borderRadius: "8px", boxShadow: 2 }}>
                        
                            <StockFinancials symbol={symbol} />
                    </Box>
                )}
            </Box>

                    
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
                            <Typography>Total Realisation: {formatINR(tempXirrResult.total_realisation)}</Typography>
                            <Typography sx={{color: tempXirrResult.profit >=0 ? "green" : "red"}}>Profit: {formatINR(tempXirrResult.profit)}</Typography>
                            <Typography>New XIRR: {tempXirrResult.new_xirr ? `${formatIn(tempXirrResult.new_xirr)}%` : "Insufficient Data"}</Typography>
                        </Box>
                    )}
                </DialogTitle>
                </Dialog>
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


        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to delete this trade?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmOpen(false)} color="primary" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={confirmDeleteTrade} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>

        </Box>
    );
}
