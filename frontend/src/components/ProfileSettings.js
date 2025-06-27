import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Grid2 as Grid,
  Paper,
  Divider,
  Stack,
  CardHeader,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
// import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProfileSettings = () => {
  const [userData, setUserData] = useState({
    fullName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    theme: '',
  });

  const handleChange = (field) => (e) => {
    setUserData({ ...userData, [field]: e.target.value });
  };

  const handleSubmit = (section) => {
    console.log(`Updated ${section}:`, userData);
    // Submit to backend if needed
  };

    useEffect(() => {
        document.title = 'Profile'; // Change tab name
    });
    const { user } = useAuth();
    const navigate = useNavigate();
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

  return (
    <Box sx={{ maxWidth: '90%', mx: 'auto', mt: 5, px: 3 }}>
        

      <Grid container spacing={3}>
        {/* Personal Information Card */}
        <Grid size={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader title="Personal Information" fontWeight="bold" gutterBottom/>
            <Divider />
            <CardContent>
              <TextField
                label="Full Name"
                fullWidth
                value={userData.fullName}
                onChange={handleChange('fullName')}
                margin="dense"
              />
              <TextField
                label="Last Name"
                fullWidth
                value={userData.lastName}
                onChange={handleChange('lastName')}
                margin="dense"
              />
              <TextField
                label="Username"
                fullWidth
                value={userData.username}
                onChange={handleChange('username')}
                margin="dense"
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2 }}>
              <Button variant="contained" onClick={() => handleSubmit('Personal Info')}>
                Update
              </Button>
            </CardActions>
          </Card>
        </Grid> 

        <Grid size={6}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader title="Change Password" fontWeight="bold" gutterBottom/>
            <Divider />
            <CardContent>
            <TextField
                label="Current Password"
                fullWidth
                type="password"
                margin="dense"
                value={userData.currentPassword || ''}
                onChange={(e) => setUserData({ ...userData, currentPassword: e.target.value })}
            />
            <TextField
                label="New Password"
                fullWidth
                type="password"
                margin="dense"
                value={userData.newPassword || ''}
                onChange={(e) => setUserData({ ...userData, newPassword: e.target.value })}
            />
            <TextField
                label="Confirm New Password"
                fullWidth
                type="password"
                margin="dense"
                value={userData.confirmPassword || ''}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
            />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2 }}>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                if (userData.newPassword !== userData.confirmPassword) {
                    showSnackbar("New passwords do not match.", 'error');
                    return;
                }
                if (!userData.currentPassword || !userData.newPassword) {
                    showSnackbar("Please fill all fields.", 'warning');
                    return;
                }
                console.log("Password update submitted:", userData);
                
                }}
            >
                Change Password
            </Button>
            </CardActions>
        </Card>
        </Grid>

        {/* Contact Details Card */}
        <Grid size={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader title="Contact Details" fontWeight="bold" gutterBottom/>
              
              <Divider />
            <CardContent>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={userData.email}
                onChange={handleChange('email')}
                margin="dense"
              />
              <TextField
                label="Phone"
                fullWidth
                value={userData.phone}
                onChange={handleChange('phone')}
                margin="dense"
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2 }}>
              <Button variant="contained" onClick={() => handleSubmit('Contact')}>
                Update
              </Button>
            </CardActions>
          </Card>
        </Grid>

      <Grid size={6}>
          <Paper elevation={3} sx={{ p:2, borderRadius: 3, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Account Management
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={3}>

            {/* Export Data */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Export Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Download your trading and portfolio data in CSV format.
                </Typography>
              </Box>
              <Button variant="outlined" color="primary" startIcon={<CloudDownloadIcon />}>
                Export CSV
              </Button>
            </Box>

            {/* Temporary Deactivation */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Deactivate Account</Typography>
                <Typography variant="body2" color="text.secondary">
                  Temporarily deactivate your account without deleting data.
                </Typography>
              </Box>
              <Button variant="outlined" color="warning" startIcon={<PowerSettingsNewIcon />}>
                Deactivate
              </Button>
            </Box>

            {/* Connected Accounts */}
            {/* <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Connected Accounts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage apps or brokers linked to your profile.
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<LinkIcon />}>
                Manage
              </Button>
            </Box> */}

            {/* Delete Account */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="error">Delete Account</Typography>
                <Typography variant="body2" color="text.secondary">
                  Permanently delete your account and all data. 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This action is irreversible.
                </Typography>
              </Box>
              <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
                Delete
              </Button>
            </Box>

          </Stack>
        </Paper>
      </Grid>
      </Grid>

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
};

export default ProfileSettings;
