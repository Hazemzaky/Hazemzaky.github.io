import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, Tooltip, useTheme, alpha, IconButton, Chip, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Build as BuildIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MonetizationOn as MoneyIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const defaultCapex = () => ({
  description: '',
  category: 'equipment',
  amount: '',
  purchaseMonth: 'Jan',
  depreciationYears: 5,
  salvageValue: '0'
});

function getMonthIdx(m: string) {
  return months.indexOf(m);
}

function getDepreciationSchedule(item: any) {
  const amount = parseFloat(item.amount) || 0;
  const salvage = parseFloat(item.salvageValue) || 0;
  const years = parseInt(item.depreciationYears) || 5;
  const monthlyDepreciation = (amount - salvage) / (years * 12);
  
  const schedule = Array(12).fill(0);
  const startMonth = getMonthIdx(item.purchaseMonth);
  
  for (let i = startMonth; i < 12; i++) {
    schedule[i] = monthlyDepreciation;
  }
  
  return schedule;
}

const BudgetCapex: React.FC = () => {
  const [capex, setCapex] = useState([defaultCapex()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchBudgetCapex();
  }, []);

  const fetchBudgetCapex = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget-capex');
      // Ensure response.data is always an array
      const data = Array.isArray(response.data) ? response.data : [];
      setCapex(data.length > 0 ? data : [defaultCapex()]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch budget CAPEX');
      setCapex([defaultCapex()]);
    } finally {
      setLoading(false);
    }
  };

  const handleCapexChange = (idx: number, field: string, value: any) => {
    const newCapex = [...capex];
    // Use type assertion for dynamic property access
    (newCapex[idx] as any)[field] = value;
    setCapex(newCapex);
  };

  const handleAddCapex = () => setCapex([...capex, defaultCapex()]);

  const handleRemoveCapex = (idx: number) => setCapex(capex => capex.filter((_, i) => i !== idx));

  const getTotalCapex = () => capex.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const getTotalDepreciation = () => {
    return capex.reduce((sum, item) => {
      const schedule = getDepreciationSchedule(item);
      return sum + schedule.reduce((monthSum, monthly) => monthSum + monthly, 0);
    }, 0);
  };

  const handleSave = async () => {
    try {
      await api.post('/budget-capex', { capex });
      setSuccess('Budget CAPEX saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save budget CAPEX');
    }
  };

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
                    <BuildIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Capital Expenditure Budget
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Plan and forecast capital investments with depreciation schedules
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Save Budget
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

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total CAPEX',
                value: `$${getTotalCapex().toLocaleString()}`,
                icon: <MoneyIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Depreciation',
                value: `$${getTotalDepreciation().toLocaleString()}`,
                icon: <TrendingUpIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              },
              {
                title: 'Capital Items',
                value: capex.length,
                icon: <BusinessIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
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

        {/* CAPEX Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                🏗️ Capital Expenditure Items
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddCapex}
                startIcon={<AddIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Add CAPEX Item
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Purchase Month</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Depreciation (Years)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Salvage Value</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {capex.map((item, idx) => (
                      <TableRow 
                        key={idx}
                        hover
                        sx={{ 
                          background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.05),
                            transform: 'scale(1.01)'
                          }
                        }}
                      >
                        <TableCell>
                          <TextField
                            value={item.description}
                            onChange={(e) => handleCapexChange(idx, 'description', e.target.value)}
                            placeholder="Item description"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={item.category}
                              onChange={(e) => handleCapexChange(idx, 'category', e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                  },
                                },
                              }}
                            >
                              <MenuItem value="equipment">Equipment</MenuItem>
                              <MenuItem value="vehicles">Vehicles</MenuItem>
                              <MenuItem value="buildings">Buildings</MenuItem>
                              <MenuItem value="software">Software</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.amount}
                            onChange={(e) => handleCapexChange(idx, 'amount', e.target.value)}
                            placeholder="0.00"
                            type="number"
                            size="small"
                            sx={{
                              width: 120,
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={item.purchaseMonth}
                              onChange={(e) => handleCapexChange(idx, 'purchaseMonth', e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                  },
                                },
                              }}
                            >
                              {months.map((month) => (
                                <MenuItem key={month} value={month}>{month}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.depreciationYears}
                            onChange={(e) => handleCapexChange(idx, 'depreciationYears', e.target.value)}
                            placeholder="5"
                            type="number"
                            size="small"
                            sx={{
                              width: 100,
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.salvageValue}
                            onChange={(e) => handleCapexChange(idx, 'salvageValue', e.target.value)}
                            placeholder="0.00"
                            type="number"
                            size="small"
                            sx={{
                              width: 100,
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveCapex(idx)}
                            color="error"
                            disabled={capex.length === 1}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          ${getTotalCapex().toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
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
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetCapex; 