import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, Tooltip, useTheme, alpha, IconButton, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
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

const defaultOthersBudget = () => ({
  id: Date.now() + Math.random(),
  no: '',
  description: '',
  forecastedYearEnded: '',
  budget1stQuarter: '',
  budget2ndQuarter: '',
  budget3rdQuarter: '',
  budgetTotal: ''
});

const BudgetOthers: React.FC = () => {
  const [othersBudgets, setOthersBudgets] = useState([defaultOthersBudget()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOthersBudget, setEditingOthersBudget] = useState<any>(null);
  const [formData, setFormData] = useState({
    no: '',
    description: '',
    forecastedYearEnded: '',
    budget1stQuarter: '',
    budget2ndQuarter: '',
    budget3rdQuarter: '',
    budgetTotal: ''
  });

  const theme = useTheme();
  const pageColor = '#795548';

  useEffect(() => {
    fetchOthersBudgets();
  }, []);

  const fetchOthersBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget/others');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setOthersBudgets(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch others budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOthersBudget = () => {
    setEditingOthersBudget(null);
    setFormData({
      no: '',
      description: '',
      forecastedYearEnded: '',
      budget1stQuarter: '',
      budget2ndQuarter: '',
      budget3rdQuarter: '',
      budgetTotal: ''
    });
    setOpenDialog(true);
  };

  const handleEditOthersBudget = (othersBudget: any) => {
    setEditingOthersBudget(othersBudget);
    setFormData({
      no: othersBudget.no,
      description: othersBudget.description,
      forecastedYearEnded: othersBudget.forecastedYearEnded,
      budget1stQuarter: othersBudget.budget1stQuarter,
      budget2ndQuarter: othersBudget.budget2ndQuarter,
      budget3rdQuarter: othersBudget.budget3rdQuarter,
      budgetTotal: othersBudget.budgetTotal
    });
    setOpenDialog(true);
  };

  const handleDeleteOthersBudget = (id: number) => {
    if (othersBudgets.length > 1) {
      setOthersBudgets(othersBudgets.filter(othersBudget => othersBudget.id !== id));
    }
  };

  const handleSaveOthersBudget = () => {
    if (editingOthersBudget) {
      // Edit existing others budget
      setOthersBudgets(othersBudgets.map(othersBudget => 
        othersBudget.id === editingOthersBudget.id 
          ? { ...othersBudget, ...formData }
          : othersBudget
      ));
    } else {
      // Add new others budget
      setOthersBudgets([...othersBudgets, { ...formData, id: Date.now() + Math.random() }]);
    }
    setOpenDialog(false);
    setSuccess(editingOthersBudget ? 'Others budget updated successfully!' : 'Others budget added successfully!');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return `${parseFloat(value).toLocaleString()} KWD`;
  };

  const getTotalBudget = () => {
    return othersBudgets.reduce((sum, budget) => {
      const q1 = parseFloat(budget.budget1stQuarter) || 0;
      const q2 = parseFloat(budget.budget2ndQuarter) || 0;
      const q3 = parseFloat(budget.budget3rdQuarter) || 0;
      return sum + q1 + q2 + q3;
    }, 0);
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(pageColor, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
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
              background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
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
                    <Typography sx={{ fontSize: '2rem' }}>🔀</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Others Budget
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage other budget categories and miscellaneous items
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddOthersBudget}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Others Budget
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

        {/* Others Budget Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(pageColor, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" sx={{ color: pageColor, fontWeight: 600, mb: 3 }}>
              📊 Others Budget Overview
            </Typography>

            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {!loading && (
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ background: alpha(pageColor, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80, textAlign: 'center' }}>
                        NO.
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 200 }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Forecasted Year Ended
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Budget 1st Quarter
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Budget 2nd Quarter
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Budget 3rd Quarter
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Budget Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100, textAlign: 'center' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {othersBudgets.map((othersBudget, index) => (
                      <TableRow 
                        key={othersBudget.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {othersBudget.no || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {othersBudget.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(othersBudget.forecastedYearEnded)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(othersBudget.budget1stQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(othersBudget.budget2ndQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(othersBudget.budget3rdQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(othersBudget.budgetTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditOthersBudget(othersBudget)}
                              sx={{ 
                                color: pageColor,
                                '&:hover': { 
                                  bgcolor: alpha(pageColor, 0.1),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteOthersBudget(othersBudget.id)}
                              disabled={othersBudgets.length === 1}
                              sx={{ 
                                color: theme.palette.error.main,
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
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ background: alpha(pageColor, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(othersBudgets.reduce((sum, budget) => sum + (parseFloat(budget.forecastedYearEnded) || 0), 0).toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(othersBudgets.reduce((sum, budget) => sum + (parseFloat(budget.budget1stQuarter) || 0), 0).toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(othersBudgets.reduce((sum, budget) => sum + (parseFloat(budget.budget2ndQuarter) || 0), 0).toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(othersBudgets.reduce((sum, budget) => sum + (parseFloat(budget.budget3rdQuarter) || 0), 0).toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotalBudget().toString())}
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

        {/* Add/Edit Others Budget Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingOthersBudget ? 'Edit Others Budget' : 'Add Others Budget'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                label="NO."
                value={formData.no}
                onChange={(e) => handleFormChange('no', e.target.value)}
                fullWidth
                placeholder="Enter number..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="Enter description..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
              <TextField
                label="Forecasted Year Ended"
                value={formData.forecastedYearEnded}
                onChange={(e) => handleFormChange('forecastedYearEnded', e.target.value)}
                fullWidth
                placeholder="Enter amount..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
              <TextField
                label="Budget 1st Quarter"
                value={formData.budget1stQuarter}
                onChange={(e) => handleFormChange('budget1stQuarter', e.target.value)}
                fullWidth
                placeholder="Enter amount..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
              <TextField
                label="Budget 2nd Quarter"
                value={formData.budget2ndQuarter}
                onChange={(e) => handleFormChange('budget2ndQuarter', e.target.value)}
                fullWidth
                placeholder="Enter amount..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
              <TextField
                label="Budget 3rd Quarter"
                value={formData.budget3rdQuarter}
                onChange={(e) => handleFormChange('budget3rdQuarter', e.target.value)}
                fullWidth
                placeholder="Enter amount..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
              <TextField
                label="Budget Total"
                value={formData.budgetTotal}
                onChange={(e) => handleFormChange('budgetTotal', e.target.value)}
                fullWidth
                placeholder="Enter total amount..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: pageColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: pageColor,
                    },
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveOthersBudget}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingOthersBudget ? 'Update' : 'Add'} Others Budget
            </Button>
          </DialogActions>
        </Dialog>
      </AnimatePresence>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetOthers;
