import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, Tooltip, useTheme, alpha, IconButton, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
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

const defaultStaff = () => ({
  id: Date.now() + Math.random(),
  no: '',
  description: '',
  forecastedYearEnded: '',
  budget1stQuarter: '',
  budget2ndQuarter: '',
  budget3rdQuarter: '',
  budgetTotal: ''
});

const BudgetStaffingDatabase: React.FC = () => {
  const [staffBudgets, setStaffBudgets] = useState([defaultStaff()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
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
  const pageColor = '#ff9800';

  useEffect(() => {
    fetchStaffBudgets();
  }, []);

  const fetchStaffBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget/staff');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setStaffBudgets(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch Staff budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
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

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setFormData({
      no: staff.no,
      description: staff.description,
      forecastedYearEnded: staff.forecastedYearEnded,
      budget1stQuarter: staff.budget1stQuarter,
      budget2ndQuarter: staff.budget2ndQuarter,
      budget3rdQuarter: staff.budget3rdQuarter,
      budgetTotal: staff.budgetTotal
    });
    setOpenDialog(true);
  };

  const handleDeleteStaff = (id: number) => {
    if (staffBudgets.length > 1) {
      setStaffBudgets(staffBudgets.filter(staff => staff.id !== id));
    }
  };

  const handleSaveStaff = () => {
    if (editingStaff) {
      // Edit existing Staff
      setStaffBudgets(staffBudgets.map(staff => 
        staff.id === editingStaff.id 
          ? { ...staff, ...formData }
          : staff
      ));
    } else {
      // Add new Staff
      setStaffBudgets([...staffBudgets, { ...formData, id: Date.now() + Math.random() }]);
    }
    setOpenDialog(false);
    setSuccess(editingStaff ? 'Staff Cost updated successfully!' : 'Staff Cost added successfully!');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return `${parseFloat(value).toLocaleString()} KWD`;
  };

  const getTotalForecasted = () => {
    return staffBudgets.reduce((sum, staff) => {
      return sum + (parseFloat(staff.forecastedYearEnded) || 0);
    }, 0);
  };

  const getTotal1stQuarter = () => {
    return staffBudgets.reduce((sum, staff) => {
      return sum + (parseFloat(staff.budget1stQuarter) || 0);
    }, 0);
  };

  const getTotal2ndQuarter = () => {
    return staffBudgets.reduce((sum, staff) => {
      return sum + (parseFloat(staff.budget2ndQuarter) || 0);
    }, 0);
  };

  const getTotal3rdQuarter = () => {
    return staffBudgets.reduce((sum, staff) => {
      return sum + (parseFloat(staff.budget3rdQuarter) || 0);
    }, 0);
  };

  const getTotalBudget = () => {
    return staffBudgets.reduce((sum, staff) => {
      return sum + (parseFloat(staff.budgetTotal) || 0);
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
                    <Typography sx={{ fontSize: '2rem' }}>🎖️</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Staff Cost
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Plan and manage staff costs and quarterly budgets
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddStaff}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Staff Cost
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
                title: 'Total Forecasted',
                value: `KWD ${getTotalForecasted().toLocaleString()}`,
                icon: <MoneyIcon />,
                color: pageColor,
                bgColor: alpha(pageColor, 0.1)
              },
              {
                title: '1st Quarter',
                value: `KWD ${getTotal1stQuarter().toLocaleString()}`,
                icon: <TrendingUpIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              },
              {
                title: '2nd Quarter',
                value: `KWD ${getTotal2ndQuarter().toLocaleString()}`,
                icon: <AssessmentIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: '3rd Quarter',
                value: `KWD ${getTotal3rdQuarter().toLocaleString()}`,
                icon: <BusinessIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Total Budget',
                value: `KWD ${getTotalBudget().toLocaleString()}`,
                icon: <CheckCircleIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1)
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

        {/* Staff Cost Table */}
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
              border: `1px solid ${alpha(pageColor, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" sx={{ color: pageColor, fontWeight: 600, mb: 3 }}>
              📊 Staff Cost Overview
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
                    {staffBudgets.map((staff, index) => (
                      <TableRow 
                        key={staff.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {staff.no || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {staff.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(staff.forecastedYearEnded)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(staff.budget1stQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(staff.budget2ndQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(staff.budget3rdQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(staff.budgetTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditStaff(staff)}
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
                              onClick={() => handleDeleteStaff(staff.id)}
                              disabled={staffBudgets.length === 1}
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
                          {formatCurrency(getTotalForecasted().toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotal1stQuarter().toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotal2ndQuarter().toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotal3rdQuarter().toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
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

        {/* Add/Edit Staff Cost Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingStaff ? 'Edit Staff Cost' : 'Add Staff Cost'}
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
                placeholder="Enter forecasted year ended amount..."
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
                placeholder="Enter budget 1st quarter amount..."
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
                placeholder="Enter budget 2nd quarter amount..."
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
                placeholder="Enter budget 3rd quarter amount..."
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
                placeholder="Enter budget total amount..."
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
              onClick={handleSaveStaff}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingStaff ? 'Update' : 'Add'} Staff Cost
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

export default BudgetStaffingDatabase;