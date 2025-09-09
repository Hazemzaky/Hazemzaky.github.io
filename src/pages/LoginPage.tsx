import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Zoom,
  CircularProgress,
  Avatar,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  LinearProgress,
  Chip,
  Container
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  GppGood as GppGoodIcon,
  AllInclusive as AllInclusiveIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';
import theme from '../theme';

// Add the LoginResponse interface
interface LoginResponse {
  token: string;
  // add other properties if your API returns more
}

const LoginPage: React.FC = () => {
  const muiTheme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // Use the configured api instance instead of axios directly
      const res = await api.post<LoginResponse>('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      
      // Simulate a brief success state before redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 50%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 0
        }
      }}
    >
      {/* Decorative background elements */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`, zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: -150, right: -150, width: 400, height: 400, borderRadius: '50%', background: `linear-gradient(225deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.info.main, 0.05)})`, zIndex: 0 }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Card
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 24,
                  overflow: 'hidden',
                  position: 'relative',
                  maxWidth: 480,
                  mx: 'auto',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                }}
              >
                {loading && (
                  <LinearProgress
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }
                    }}
                  />
                )}

                <CardContent sx={{ p: 5 }}>
                  {/* Header Section */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 3,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                          position: 'relative',
                          p: 1,
                          background: '#fefcff',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'transparent',
                            zIndex: 1,
                            borderRadius: '50%'
                          }
                        }}
                      >
                        <img
                          src={`${process.env.PUBLIC_URL}/company-logo.gif`}
                          alt="Company Logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            position: 'relative',
                            zIndex: 2
                          }}
                          onError={(e) => {
                            // Fallback to the original BusinessIcon if GIF fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div style="
                                  width: 100%;
                                  height: 100%;
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  background: linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main});
                                  color: white;
                                  font-size: 40px;
                                ">
                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      </Box>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1,
                          fontFamily: `'Poppins','Montserrat','Segoe UI','Helvetica Neue',Arial,sans-serif`
                        }}
                      >
                        Login To The Infinite Growth
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'nowrap' }}>
                          <Chip
                            label="(RISE)"
                            size="small"
                            sx={{ fontWeight: 800, letterSpacing: 2, bgcolor: alpha(theme.palette.secondary.main, 0.12), color: theme.palette.secondary.main }}
                          />
                          <Chip
                            icon={<VerifiedUserIcon />}
                            label="Reliable"
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}
                          />
                          <Chip
                            icon={<AllInclusiveIcon />}
                            label="Integral"
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.main }}
                          />
                          <Chip
                            icon={<SecurityIcon />}
                            label="Safe"
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}
                          />
                          <Chip
                            icon={<TrendingUpIcon />}
                            label="Effective"
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  </Box>

                  {/* Error Alert */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert
                          severity="error"
                          sx={{
                            borderRadius: theme.shape.borderRadius,
                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                            background: alpha(theme.palette.error.main, 0.05)
                          }}
                        >
                          {error}
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login Form */}
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        fullWidth
                        variant="outlined"
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: theme.shape.borderRadius,
                            background: alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: theme.palette.background.paper,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                            },
                            '&.Mui-focused': {
                              background: theme.palette.background.paper,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                            }
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        fullWidth
                        variant="outlined"
                        error={!!formErrors.password}
                        helperText={formErrors.password}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                disabled={loading}
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: theme.shape.borderRadius,
                            background: alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: theme.palette.background.paper,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                            },
                            '&.Mui-focused': {
                              background: theme.palette.background.paper,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                            }
                          }
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: theme.shape.borderRadius,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: alpha(theme.palette.action.disabled, 0.12),
                          boxShadow: 'none',
                          transform: 'none'
                        }
                      }}
                    >
                      {''}
                    </Button>
                  </motion.form>

                  {/* Success State */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                          <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Authentication successful! Redirecting...
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <Box sx={{ textAlign: 'center', mt: 4, pt: 3 }}>
                    <Divider sx={{ mb: 3, opacity: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Secured by enterprise-grade encryption
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default LoginPage; 