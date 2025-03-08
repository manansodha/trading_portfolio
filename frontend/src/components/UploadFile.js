import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { uploadDividends } from '../services/api';
import { uploadTrades } from '../services/api';
import { Box, Button, Typography, TextField, MenuItem } from '@mui/material';


export default function UploadFile() {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [tradeType, setTradeType] = useState('TRADE');
    const navigate = useNavigate();

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        try {
            if (tradeType === 'TRADE') {
                await uploadTrades(file, user);
            } else {
                await uploadDividends(file, user)
            }
            
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error("Error uploading the file", error);
            setMessage(error.response?.data?.error || 'Upload failed');
        }
    };

    return (
        <Box sx={{ 
            width: '400px', 
            margin: '50px auto', 
            padding: '20px', 
            border: '1px solid #ccc', 
            borderRadius: '10px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
        }}>
            <Typography variant="h6" sx={{ marginBottom: '15px' }}>
                Upload Trade/Dividend File
            </Typography>

            <TextField 
                select 
                label="Type" 
                value={tradeType} 
                onChange={(e) => setTradeType(e.target.value)} 
                fullWidth 
                margin="normal"
            >
                <MenuItem value="TRADE">BUY/SELL TRADE</MenuItem>
                <MenuItem value="DIVIDEND">DIVIDEND</MenuItem>
            </TextField>

            <input
                type="file"
                onChange={handleFileChange}
                style={{
                    display: 'block',
                    margin: '10px auto',
                    padding: '10px'
                }}
            />
            
            <Box sx={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleUpload}
                    disabled={!file}
                >
                    Upload
                </Button>
                
                <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => navigate('/')}
                >
                    Cancel
                </Button>
            </Box>

            <Typography variant="body1" sx={{ marginTop: '15px' }}>
                {message}
            </Typography>
        </Box>
    );
}







    