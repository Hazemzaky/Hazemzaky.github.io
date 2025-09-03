import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, Tooltip, useTheme, alpha, IconButton, Chip, Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
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
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const defaultBusinessLine = () => ({
  name: '',
  units: Array(12).fill(''),
  price: ''
});

const BudgetRevenue: React.FC = () => {
  const [lines, setLines] = useState([defaultBusinessLine()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchBudgetRevenue();
  }, []);

  const fetchBudgetRevenue = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget-revenue');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setLines(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch budget revenue');
    } finally {
      setLoading(false);
    }
  };

  const handleLineChange = (idx: number, field: 'name' | 'units' | 'price', value: any, monthIdx?: number) => {
    const newLines = [...lines];
    if (field === 'units' && monthIdx !== undefined) {
      newLines[idx].units[monthIdx] = value;
    } else {
      newLines[idx][field] = value;
    }
    setLines(newLines);
  };

  const handleAddLine = () => setLines([...lines, defaultBusinessLine()]);

  const handleRemoveLine = (idx: number) => setLines(lines => lines.filter((_, i) => i !== idx));

  const getLineRevenue = (line: any, monthIdx: number) => {
    const units = parseFloat(line.units[monthIdx]) || 0;
    const price = parseFloat(line.price) || 0;
    return units * price;
  };

  const getLineTotal = (line: any) => months.reduce((sum, _, i) => sum + getLineRevenue(line, i), 0);

  const getMonthTotal = (monthIdx: number) => lines.reduce((sum, line) => sum + getLineRevenue(line, monthIdx), 0);

  const getGrandTotal = () => lines.reduce((sum, line) => sum + getLineTotal(line), 0);

  const handleSave = async () => {
    try {
      await api.post('/budget-revenue', { lines });
      setSuccess('Budget revenue saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save budget revenue');
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
                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Revenue Budget
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Plan and forecast revenue streams by business line and month
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
                title: 'Total Revenue',
                value: `$${getGrandTotal().toLocaleString()}`,
                icon: <MoneyIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Business Lines',
                value: lines.length,
                icon: <BusinessIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Avg Monthly Revenue',
                value: `$${(getGrandTotal() / 12).toLocaleString()}`,
                icon: <AssessmentIcon />,
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

        {/* Revenue Table */}
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
                📊 Revenue Budget by Business Line
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddLine}
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
                Add Business Line
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
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Business Line</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Unit Price</TableCell>
                      {months.map((month) => (
                        <TableCell key={month} align="right" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {month}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((line, idx) => (
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
                            value={line.name}
                            onChange={(e) => handleLineChange(idx, 'name', e.target.value)}
                            placeholder="Business line name"
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
                            value={line.price}
                            onChange={(e) => handleLineChange(idx, 'price', e.target.value)}
                            placeholder="0.00"
                            type="number"
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
                        {months.map((month, monthIdx) => (
                          <TableCell key={month} align="right">
                            <TextField
                              value={line.units[monthIdx]}
                              onChange={(e) => handleLineChange(idx, 'units', e.target.value, monthIdx)}
                              placeholder="0"
                              type="number"
                              size="small"
                              sx={{
                                width: 80,
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
                        ))}
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            ${getLineTotal(line).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveLine(idx)}
                            color="error"
                            disabled={lines.length === 1}
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
                    <TableRow sx={{ background: alpha(theme.palette.success.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                      </TableCell>
                      <TableCell />
                      {months.map((month, monthIdx) => (
                        <TableCell key={month} align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            ${getMonthTotal(monthIdx).toLocaleString()}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          ${getGrandTotal().toLocaleString()}
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

export default BudgetRevenue; 