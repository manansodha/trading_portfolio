import { useState } from 'react';
import { Box, Button, TextField, Typography, MenuItem, Select} from '@mui/material';
// import axios from 'axios';
import { changeName, stockSplit, bonusIssue } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboard() {
    const [action, setAction] = useState('');
    const [oldSymbol, setOldSymbol] = useState('');
    const [newSymbol, setNewSymbol] = useState('');
    const [adjustmentValue, setAdjustmentValue] = useState('');
    const [actionDate, setActionDate] = useState('');
    const {user} = useAuth();
    const username = user?.username;

    const handleRatioChange = (e) => {
        const value = e.target.value;
        // Ensure only positive numbers are entered
        if (value > 0 || value === '') {
            setAdjustmentValue(value);
        }
    };

    const handleSubmit = async () => {

        if (action === "RENAME") {
            try {
                const data = { oldSymbol, newSymbol, username };
                await changeName(data);
                alert("Stock name changed successfully");
            } catch (error) {
                console.error("Error changing stock name:", error);
            }
        } else if (action === "SPLIT") {
            try{
                const data = { oldSymbol, adjustmentValue, actionDate, username };
                await stockSplit(data);
                alert("Stock split recorded successfully");
            }catch(error){
                console.error("Error processing stock split:", error);
            }
        } else if (action === "BONUS") {
            try{
                const data = { oldSymbol, adjustmentValue, actionDate, username };
                await bonusIssue(data);
                alert("Bonus issue recorded successfully");
            }
            catch(error){
                console.error("Error processing bonus issue:", error);
            }
        }
    };

    return (
        <Box sx={{ width: '50%', margin: 'auto', padding: '20px', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>Admin Dashboard</Typography>

            <Select value={action} onChange={(e) => setAction(e.target.value)} fullWidth sx={{ mb: 2 }}>
                <MenuItem value="RENAME">Rename Stock</MenuItem>
                <MenuItem value="SPLIT">Stock Split</MenuItem>
                <MenuItem value="BONUS">Bonus Issue</MenuItem>
            </Select>

            {action === "RENAME" && (
                <>
                    <TextField label="Old Symbol" fullWidth sx={{ mb: 2 }} value={oldSymbol} onChange={(e) => setOldSymbol(e.target.value)} />
                    <TextField label="New Symbol" fullWidth sx={{ mb: 2 }} value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} />
                </>
            )}

            {(action === "SPLIT" || action === "BONUS") && (
                <>
                    <TextField label="Stock Symbol" fullWidth sx={{ mb: 2 }} value={oldSymbol} onChange={(e) => setOldSymbol(e.target.value)} />
                    <TextField 
                        label="Ratio" 
                        fullWidth 
                        sx={{ mb: 2 }} 
                        type="number" 
                        value={adjustmentValue} 
                        onChange={handleRatioChange}
                        inputProps={{ min: 0.01, step: 0.01 }} // Ensures positive values only
                    />
                    {/* New Date Field */}
                    <TextField 
                        label="Effective Date" 
                        type="date" 
                        fullWidth 
                        sx={{ mb: 2 }} 
                        value={actionDate} 
                        onChange={(e) => setActionDate(e.target.value)} 
                        InputLabelProps={{ shrink: true }} 
                    />
                </>
            )}

            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                Apply Changes
            </Button>
        </Box>
    );
}
