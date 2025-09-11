import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, Tooltip, useTheme, alpha, IconButton, Chip, Divider, FormControl, InputLabel, Select, MenuItem, Collapse
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
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
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const defaultLoan = () => ({
  description: '',
  principal: '',
  interestRate: '',
  term: '',
  startMonth: 'Jan',
  paymentType: 'monthly',
  expanded: false
});

function getMonthIdx(m: string) {
  return months.indexOf(m);
}

function getAmortization(loan: any) {
  const principal = parseFloat(loan.principal) || 0;
  const rate = parseFloat(loan.interestRate) || 0;
  const term = parseInt(loan.term) || 0;
  const startMonth = getMonthIdx(loan.startMonth);
  
  if (!principal || !rate || !term) return Array(12).fill(0);
  
  const monthlyRate = rate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  
  const schedule = Array(12).fill(0);
  let remainingPrincipal = principal;
  
  for (let i = startMonth; i < 12 && i < startMonth + term; i++) {
    const interest = remainingPrincipal * monthlyRate;
    const principalPayment = payment - interest;
    schedule[i] = payment;
    remainingPrincipal -= principalPayment;
  }
  
  return schedule;
}

const BudgetLoans: React.FC = () => {
  const [loans, setLoans] = useState([defaultLoan()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchBudgetLoans();
  }, []);

  const fetchBudgetLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget-loans');
      // Ensure response.data is always an array
      const data = Array.isArray(response.data) ? response.data : [];
      setLoans(data.length > 0 ? data : [defaultLoan()]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch budget loans');
      setLoans([defaultLoan()]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanChange = (idx: number, field: string, value: any) => {
    const newLoans = [...loans];
    // Use type assertion for dynamic property access
    (newLoans[idx] as any)[field] = value;
    setLoans(newLoans);
  };

  const handleAddLoan = () => setLoans([...loans, defaultLoan()]);

  const handleRemoveLoan = (idx: number) => setLoans(loans => loans.filter((_, i) => i !== idx));

  const handleToggleExpand = (idx: number) => setLoans(loans => loans.map((l, i) => i === idx ? { ...l, expanded: !l.expanded } : l));

  function getLoanMonthlyOutflow(loan: any) {
    const schedule = getAmortization(loan);
    return schedule.reduce((sum, payment) => sum + payment, 0);
  }

  const getTotalPrincipal = () => loans.reduce((sum, loan) => sum + (parseFloat(loan.principal) || 0), 0);

  const getTotalPayments = () => loans.reduce((sum, loan) => sum + getLoanMonthlyOutflow(loan), 0);

  const getTotalInterest = () => {
    return loans.reduce((sum, loan) => {
      const principal = parseFloat(loan.principal) || 0;
      const rate = parseFloat(loan.interestRate) || 0;
      const term = parseInt(loan.term) || 0;
      
      if (!principal || !rate || !term) return sum;
      
      const monthlyRate = rate / 100 / 12;
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
      const totalPayments = payment * term;
      
      return sum + (totalPayments - principal);
    }, 0);
  };

  const handleSave = async () => {
    try {
      await api.post('/budget-loans', { loans });
      setSuccess('Budget loans saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save budget loans');
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
                    <AccountBalanceIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Loan Budget
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Plan and forecast loan payments with amortization schedules
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
                title: 'Total Principal',
                value: getTotalPrincipal().toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <MoneyIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Payments',
                value: getTotalPayments().toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <TrendingUpIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1)
              },
              {
                title: 'Total Interest',
                value: getTotalInterest().toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <AccountBalanceIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Active Loans',
                value: loans.length,
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

        {/* Loans Table */}
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
                💰 Loan Management
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddLoan}
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
                Add Loan
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
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Principal</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Interest Rate</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Term (Months)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Start Month</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Monthly Payment</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loans.map((loan, idx) => (
                      <React.Fragment key={idx}>
                        <TableRow 
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
                              value={loan.description}
                              onChange={(e) => handleLoanChange(idx, 'description', e.target.value)}
                              placeholder="Loan description"
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
                            <TextField
                              value={loan.principal}
                              onChange={(e) => handleLoanChange(idx, 'principal', e.target.value)}
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
                            <TextField
                              value={loan.interestRate}
                              onChange={(e) => handleLoanChange(idx, 'interestRate', e.target.value)}
                              placeholder="0.00"
                              type="number"
                              size="small"
                              InputProps={{
                                endAdornment: <Typography variant="caption">%</Typography>
                              }}
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
                              value={loan.term}
                              onChange={(e) => handleLoanChange(idx, 'term', e.target.value)}
                              placeholder="12"
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
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={loan.startMonth}
                                onChange={(e) => handleLoanChange(idx, 'startMonth', e.target.value)}
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
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                              {getLoanMonthlyOutflow(loan).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                onClick={() => handleToggleExpand(idx)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                {loan.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              <IconButton
                                onClick={() => handleRemoveLoan(idx)}
                                color="error"
                                disabled={loans.length === 1}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                        
                        {/* Amortization Schedule */}
                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0 }}>
                            <Collapse in={loan.expanded} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 2, background: alpha(theme.palette.info.main, 0.05) }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                                  📊 Amortization Schedule
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Month</TableCell>
                                      <TableCell align="right">Payment</TableCell>
                                      <TableCell align="right">Principal</TableCell>
                                      <TableCell align="right">Interest</TableCell>
                                      <TableCell align="right">Remaining Balance</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {getAmortization(loan).map((payment, monthIdx) => {
                                      if (payment === 0) return null;
                                      
                                      const principal = parseFloat(loan.principal) || 0;
                                      const rate = parseFloat(loan.interestRate) || 0;
                                      const monthlyRate = rate / 100 / 12;
                                      const remainingBalance = principal * Math.pow(1 + monthlyRate, monthIdx + 1);
                                      const interest = remainingBalance * monthlyRate;
                                      const principalPayment = payment - interest;
                                      
                                      return (
                                        <TableRow key={monthIdx}>
                                          <TableCell>{months[monthIdx]}</TableCell>
                                          <TableCell align="right">{payment.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                                          <TableCell align="right">{principalPayment.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                                          <TableCell align="right">{interest.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                                          <TableCell align="right">{(remainingBalance - principalPayment).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {getTotalPrincipal().toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {getTotalPayments().toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                        </Typography>
                      </TableCell>
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

export default BudgetLoans; 