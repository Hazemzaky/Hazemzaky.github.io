import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Chip, TextField, Alert, CircularProgress, Card, CardContent, Avatar, Tooltip, useTheme, alpha, IconButton, Snackbar
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface Period {
  _id: string;
  period: string;
  closed: boolean;
  closedAt?: string;
  closedBy?: string;
}

const PeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [closedPeriods, setClosedPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPeriod, setNewPeriod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchPeriods();
    fetchClosedPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await api.get<Period[]>('/periods');
      setPeriods(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError('Failed to fetch periods');
    }
  };

  const fetchClosedPeriods = async () => {
    try {
      const response = await api.get<Period[]>('/periods/closed');
      setClosedPeriods(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const closePeriod = async () => {
    if (!newPeriod) return;
    try {
      await api.post('/periods/close', { period: newPeriod, closedBy: 'admin' });
      setNewPeriod('');
      fetchPeriods();
      fetchClosedPeriods();
      setSuccess('Period closed successfully!');
    } catch (error) {
      setError('Failed to close period');
    }
  };

  const openPeriod = async (period: string) => {
    try {
      await api.put(`/periods/${period}/open`);
      fetchPeriods();
      fetchClosedPeriods();
      setSuccess('Period opened successfully!');
    } catch (error) {
      setError('Failed to open period');
    }
  };

  const openCount = periods.filter(p => !p.closed).length;
  const closedCount = periods.filter(p => p.closed).length;

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: theme.shape.borderRadius,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <ScheduleIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Period Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage accounting periods and control financial data access
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => { fetchPeriods(); fetchClosedPeriods(); }}
                  startIcon={<RefreshIcon />}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            
            {/* Decorative background elements */}
            <Box sx={{ 
              position: 'absolute', 
              top: -50, 
              right: -50, 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -30, 
              left: -30, 
              width: 150, 
              height: 150, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.08)',
              zIndex: 1
            }} />
          </Paper>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total Periods',
                value: periods.length,
                icon: <ScheduleIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Open Periods',
                value: openCount,
                icon: <LockOpenIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Closed Periods',
                value: closedCount,
                icon: <LockIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1)
              },
              {
                title: 'Current Period',
                value: periods.find(p => !p.closed)?.period || 'None',
                icon: <InfoIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    flex: '1 1 200px', 
                    minWidth: 200,
                    background: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(card.color, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 40, height: 40, mr: 1 }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Close Period Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              🔒 Close Accounting Period
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField
                type="month"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                label="Period (YYYY-MM)"
                size="small"
                sx={{ minWidth: 180 }}
                InputProps={{
                  startAdornment: <ScheduleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                }}
              />
              <Button 
                variant="contained" 
                color="error" 
                onClick={closePeriod}
                startIcon={<LockIcon />}
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Close Period
              </Button>
            </Box>
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> Closing a period will prevent any new transactions from being posted to that period. 
                This action cannot be easily undone and may affect financial reporting.
              </Typography>
            </Alert>
          </Paper>
        </motion.div>

        {/* Closed Periods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              🔐 Closed Periods
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <CircularProgress />
              </Box>
            ) : closedPeriods.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  No closed periods found. All periods are currently open for transactions.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {closedPeriods.map((period, index) => (
                  <motion.div
                    key={period._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        background: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                            <LockIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                              {period.period}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Closed by: {period.closedBy} on {period.closedAt ? new Date(period.closedAt).toLocaleDateString() : ''}
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          onClick={() => openPeriod(period.period)}
                          startIcon={<LockOpenIcon />}
                          sx={{ 
                            fontWeight: 600, 
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                              boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          Open Period
                        </Button>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* All Periods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📅 All Periods Overview
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <CircularProgress />
              </Box>
            ) : periods.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  No periods found. Create your first accounting period to get started.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {periods.map((period, index) => (
                  <motion.div
                    key={period._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        background: period.closed 
                          ? alpha(theme.palette.error.main, 0.05)
                          : alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${period.closed 
                          ? alpha(theme.palette.error.main, 0.2)
                          : alpha(theme.palette.success.main, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: period.closed 
                            ? `0 8px 25px ${alpha(theme.palette.error.main, 0.2)}`
                            : `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: period.closed ? theme.palette.error.main : theme.palette.success.main, 
                            width: 40, 
                            height: 40 
                          }}>
                            {period.closed ? <LockIcon /> : <LockOpenIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600, 
                              color: period.closed ? theme.palette.error.main : theme.palette.success.main 
                            }}>
                              {period.period}
                            </Typography>
                            <Chip 
                              label={period.closed ? 'CLOSED' : 'OPEN'} 
                              color={period.closed ? 'error' : 'success'} 
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                        {period.closed && (
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small" 
                            onClick={() => openPeriod(period.period)}
                            startIcon={<LockOpenIcon />}
                            sx={{ 
                              fontWeight: 600, 
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                              boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Open Period
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PeriodsPage; 