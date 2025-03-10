import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/Registration.css'; // Import CSS

const Register = () => {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
      document.title = "Register Account - Trading Portfolio"; // Change tab name
  }, []);

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fname, lname, username, password })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />
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
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Re-enter Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
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
            className="register-btn"
          >
            Register
          </Button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
