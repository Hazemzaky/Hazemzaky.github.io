import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, Snackbar, Alert,
  Avatar, Tooltip, useTheme, alpha, Button, IconButton, Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface Balance {
  account: string;
  name: string;
  code: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}

const TrialBalancePage: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [balanced, setBalanced] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const fetchTrialBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/accounts/trial-balance');
      const data = res.data;
      if (
        data &&
        typeof data === 'object' &&
        Array.isArray((data as any).balances) &&
        typeof (data as any).totalDebit === 'number' &&
        typeof (data as any).totalCredit === 'number' &&
        typeof (data as any).balanced === 'boolean'
      ) {
        const safeData = data as { balances: Balance[]; totalDebit: number; totalCredit: number; balanced: boolean };
        setBalances(safeData.balances);
        setTotalDebit(safeData.totalDebit);
        setTotalCredit(safeData.totalCredit);
        setBalanced(safeData.balanced);
        setSuccess('Trial balance data refreshed successfully!');
      } else {
        setBalances([]);
        setTotalDebit(0);
        setTotalCredit(0);
        setBalanced(false);
        setError('Unexpected response from server');
        console.error('Expected balances array, got:', data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trial balance');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getAccountTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      asset: 'primary',
      liability: 'error',
      equity: 'success',
      revenue: 'info',
      expense: 'warning'
    };
    return colors[type.toLowerCase()] || 'default';
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return theme.palette.success.main;
    if (balance < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUpIcon />;
    if (balance < 0) return <TrendingDownIcon />;
    return <BalanceIcon />;
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
                      Trial Balance
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive view of all account balances with debit and credit totals
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      onClick={fetchTrialBalance} 
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Report">
                    <IconButton 
                      onClick={() => setSuccess('Export functionality coming soon!')}
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <SaveAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Report">
                    <IconButton 
                      onClick={() => setSuccess('Print functionality coming soon!')}
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
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

        {/* Balance Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Balance Status',
                value: balanced ? 'Balanced' : 'Not Balanced',
                icon: balanced ? <CheckCircleIcon /> : <ErrorIcon />,
                color: balanced ? theme.palette.success.main : theme.palette.error.main,
                bgColor: balanced ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1)
              },
              {
                title: 'Total Debit',
                value: formatCurrency(totalDebit),
                icon: <TrendingUpIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Credit',
                value: formatCurrency(totalCredit),
                icon: <TrendingDownIcon />,
                color: theme.palette.secondary.main,
                bgColor: alpha(theme.palette.secondary.main, 0.1)
              },
              {
                title: 'Difference',
                value: formatCurrency(Math.abs(totalDebit - totalCredit)),
                icon: <BalanceIcon />,
                color: balanced ? theme.palette.success.main : theme.palette.warning.main,
                bgColor: balanced ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1)
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

        {/* Trial Balance Table */}
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
                📊 Account Balances
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveAltIcon />}
                  onClick={() => setSuccess('Export functionality coming soon!')}
                  sx={{ 
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                    '&:hover': {
                      borderColor: theme.palette.info.dark,
                      color: theme.palette.info.dark,
                    }
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => setSuccess('Print functionality coming soon!')}
                  sx={{ 
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      color: theme.palette.warning.dark,
                    }
                  }}
                >
                  Print
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Account Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Debit</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Credit</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Net Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balances.map((balance, idx) => (
                      <TableRow 
                        key={balance.account} 
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
                          <Typography variant="body2" fontWeight="bold">
                            {balance.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {balance.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={balance.type}
                            color={getAccountTypeColor(balance.type) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                            {formatCurrency(balance.debit)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {formatCurrency(balance.credit)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title={balance.balance > 0 ? 'Debit Balance' : balance.balance < 0 ? 'Credit Balance' : 'Zero Balance'}>
                              <IconButton size="small" sx={{ color: getBalanceColor(balance.balance) }}>
                                {getBalanceIcon(balance.balance)}
                              </IconButton>
                            </Tooltip>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: getBalanceColor(balance.balance) }}>
                              {formatCurrency(Math.abs(balance.balance))}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </motion.div>

        {/* IFRS Compliance Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mt: 4, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              🏛️ IFRS Compliance & Trial Balance
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The trial balance is a fundamental accounting report that lists all account balances at a specific point in time. 
              It serves as a basis for preparing financial statements in accordance with International Financial Reporting Standards (IFRS).
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mt: 3 }}>
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 1 }}>
                  Balanced Books
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When total debits equal total credits, the books are balanced and ready for financial statement preparation.
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.warning.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.warning.main, fontWeight: 600, mb: 1 }}>
                  Unbalanced Books
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When debits and credits don't match, there may be posting errors that need to be identified and corrected.
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 1 }}>
                  IFRS Requirements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trial balances must be prepared in accordance with IAS 1 (Presentation of Financial Statements) requirements.
                </Typography>
              </Box>
            </Box>
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

export default TrialBalancePage; 