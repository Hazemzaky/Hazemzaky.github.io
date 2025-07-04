import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import API_BASE from '../apiBase';

// Add the LoginResponse interface
interface LoginResponse {
  token: string;
  // add other properties if your API returns more
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use LoginResponse as the generic type for axios.post
      const res = await axios.post<LoginResponse>(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      // Optionally redirect or update app state here
      setLoading(false);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setLoading(false);
      console.error('Login Error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Network error: Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response?.status === 404) {
        setError('Login endpoint not found. Please check the backend URL.');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper sx={{ p: 4, width: 350 }}>
        {/* Logo Section - Top of Login Box */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            {/* Dollar SVG Logo */}
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 8 }}>
              <circle cx="16" cy="16" r="16" fill="#e8f5e9" />
              <path d="M16 8v16M20.5 11.5c0-2-1.79-3.5-4.5-3.5s-4.5 1.5-4.5 3.5c0 2.5 2.5 3.5 4.5 3.5s4.5 1 4.5 3.5c0 2-1.79 3.5-4.5 3.5s-4.5-1.5-4.5-3.5" stroke="#43a047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="15" stroke="#43a047" strokeWidth="1.5" fill="none" />
            </svg>
            <Typography
              variant="h3"
              sx={{
                color: 'transparent',
                textDecoration: 'none',
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: { xs: '1.8rem', sm: '2.5rem' },
                background: 'linear-gradient(90deg, #FFD700 0%, #FFB300 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              Rassen
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: '#666' }}>Login to Your Account</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage; 