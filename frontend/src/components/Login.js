import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/Login.css'; // Import CSS
import { useAuth } from '../hooks/useAuth';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const {login} = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const success = await login({username, password});
      const user = JSON.parse(localStorage.getItem('user'))
      if (success && user.role === 'admin') {
        setMessage('Login successful! Redirecting to admin dashboard...');
        setTimeout(() => navigate('/admin'), 500);
      } else if (success && user.role === 'user') {
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/portfolio'), 500);
      } else {
        setMessage('Invalid credentials');
      }
    }
    catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    document.title = "Login - Trading Portfolio"; // Change tab name
}, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="login-btn"
          >
            Login
          </Button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
