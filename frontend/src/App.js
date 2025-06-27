import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth} from './hooks/useAuth';
import { useEffect, useState } from 'react';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { Avatar, Tooltip } from '@mui/material';
import {Menu, MenuButton, MenuItem, Dropdown} from '@mui/joy';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';
import { grey, blue} from '@mui/material/colors';
// import { setAuthToken } from './services/api';
import PortfolioDashboard from './components/PortfolioDashboard';
import PrivateRoute from './components/PrivateRoute'; 
import Login from './components/Login'; 
import Register from './components/Registration';
import StockDetails from './components/StockDetails';
import UploadFile from './components/UploadFile';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  useEffect(() => {
    setIsLoggedIn(!!user);
}, [user]);

  const handleLogout = async () => {
    try {
        await logout(); // Call backend API to destroy session
    } catch (error) {
        console.error("Error logging out:", error);
    }
    navigate("/login");
    // Prevent browser from storing previous authenticated state
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", function () {
        window.history.pushState(null, null, window.location.href);
      });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

 

  return (
    <div className="app">
      <div className="app-header">
        <h3>Trading Portfolio Manager</h3>
        
          {isLoggedIn ? (
            <>
            <Dropdown>
              <MenuButton variant='plain' color='primary' sx={{ borderRadius: '100%', width: '32px', height: '32px'}}>
                <Tooltip title={`Open Profile`} arrow placement="left" slotProps={{
                                tooltip: {sx: {bgcolor: "black", color: "white", fontSize: '12px'},},
                                arrow: {sx: {color: "black", },},
                            }}>
                  <Avatar variant='plain' size='md' sx={{ bgcolor:grey[50], color:blue[800]}}>{user.fname.charAt(0)}{user.lname.charAt(0)}</Avatar>
                </Tooltip>
                            
              </MenuButton>
              <Menu size='md' placement="bottom-end" >
                <MenuItem onClick={() => navigate('/profile')}> <AccountBoxIcon/>Profile</MenuItem>
                <MenuItem onClick={handleLogout}> <LogoutIcon/> Logout</MenuItem>
              </Menu>
            </Dropdown>
            </>
          ) : (
            <div>
              <ButtonGroup variant="contianed">
              <Button onClick={() => window.location.href = '/login'} sx={{fontWeight:'600'}}>Login</Button>
              <Button onClick={() => window.location.href = '/register'} sx={{fontWeight:'600'}}>Register</Button>
              </ButtonGroup>
            </div>
          )}
      </div>

      <main className="app-content">
      
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
          <Route path="/portfolio" element={<PrivateRoute element={<PortfolioDashboard />} />} />
          <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} />} />
          <Route path="/stocks/:symbol" element={<StockDetails />} />
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/" element={user ? <Navigate to="/portfolio" /> : <Navigate to="/login" />} />
        
      </Routes>

      </main>
    </div>
  );
}

export default App;
