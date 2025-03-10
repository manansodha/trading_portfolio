import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth} from './hooks/useAuth';
import { useEffect, useState } from 'react';
// import { setAuthToken } from './services/api';
import PortfolioDashboard from './components/PortfolioDashboard';
import PrivateRoute from './components/PrivateRoute'; 
import Login from './components/Login'; 
import Register from './components/Registration';
import StockDetails from './components/StockDetails';
import UploadFile from './components/UploadFile';
import AdminDashboard from './components/AdminDashboard';
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
      <header className="app-header">
        <h1>Trading Portfolio Manager</h1>
        <div className="user-info">
          {isLoggedIn ? (
            <>
              <span>Welcome, {user.fname}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div>
              <button onClick={() => window.location.href = '/login'}>Login</button>
              <button onClick={() => window.location.href = '/register'}>Register</button>
            </div>
          )}
        </div>
      </header>

      <main className="app-content">
      
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
