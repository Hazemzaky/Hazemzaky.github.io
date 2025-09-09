import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const defaultVariance = () => ({
  id: Date.now() + Math.random(),
  description: '',
  yearEnded: '',
  actual9MonthsAmount: '',
  actual9MonthsPercentage: '',
  forecastedYearEnded: '',
  forecastedChangePercentage: '',
  budgetYearEnded: '',
  budgetChange: '',
  budgetChangePercentage: ''
});

const BudgetVariance: React.FC = () => {
  const theme = useTheme();
  const [variances, setVariances] = useState([defaultVariance()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVariance, setEditingVariance] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: '',
    yearEnded: '',
    actual9MonthsAmount: '',
    actual9MonthsPercentage: '',
    forecastedYearEnded: '',
    forecastedChangePercentage: '',
    budgetYearEnded: '',
    budgetChange: '',
    budgetChangePercentage: ''
  });
  
  const pageColor = '#f57c00';

  const handleAddVariance = () => {
    setEditingVariance(null);
    setFormData({
      description: '',
      yearEnded: '',
      actual9MonthsAmount: '',
      actual9MonthsPercentage: '',
      forecastedYearEnded: '',
      forecastedChangePercentage: '',
      budgetYearEnded: '',
      budgetChange: '',
      budgetChangePercentage: ''
    });
    setOpenDialog(true);
  };

  const handleEditVariance = (variance: any) => {
    setEditingVariance(variance);
    setFormData({
      description: variance.description,
      yearEnded: variance.yearEnded,
      actual9MonthsAmount: variance.actual9MonthsAmount,
      actual9MonthsPercentage: variance.actual9MonthsPercentage,
      forecastedYearEnded: variance.forecastedYearEnded,
      forecastedChangePercentage: variance.forecastedChangePercentage,
      budgetYearEnded: variance.budgetYearEnded,
      budgetChange: variance.budgetChange,
      budgetChangePercentage: variance.budgetChangePercentage
    });
    setOpenDialog(true);
  };

  const handleDeleteVariance = (id: number) => {
    if (variances.length > 1) {
      setVariances(variances.filter(variance => variance.id !== id));
    }
  };

  const handleSaveVariance = () => {
    if (editingVariance) {
      // Edit existing variance
      setVariances(variances.map(variance => 
        variance.id === editingVariance.id 
          ? { ...variance, ...formData }
          : variance
      ));
    } else {
      // Add new variance
      setVariances([...variances, { ...formData, id: Date.now() + Math.random() }]);
    }
    setOpenDialog(false);
    setSuccess(editingVariance ? 'Variance updated successfully!' : 'Variance added successfully!');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return `${parseFloat(value).toLocaleString()} KWD`;
  };

  const formatPercentage = (value: string) => {
    if (!value) return '-';
    return `${value}%`;
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
                    <Typography sx={{ fontSize: '2rem' }}>📊</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Budget Variance
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Track and analyze budget variances across different periods
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVariance}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Variance
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

        {/* Variance Table */}
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
              📊 Budget Variance Analysis
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
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 200 }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>
                        Year Ended
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Actual 9 Months Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>
                        % of Change
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Forecasted Year Ended
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>
                        Change % of Change
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>
                        Budget Year Ended
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>
                        Change
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>
                        % of Change
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100, textAlign: 'center' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {variances.map((variance, index) => (
                      <TableRow 
                        key={variance.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {variance.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {variance.yearEnded || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(variance.actual9MonthsAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatPercentage(variance.actual9MonthsPercentage)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(variance.forecastedYearEnded)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatPercentage(variance.forecastedChangePercentage)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(variance.budgetYearEnded)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(variance.budgetChange)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatPercentage(variance.budgetChangePercentage)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditVariance(variance)}
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
                              onClick={() => handleDeleteVariance(variance.id)}
                              disabled={variances.length === 1}
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
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>

        {/* Add/Edit Variance Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingVariance ? 'Edit Variance' : 'Add Variance'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
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
                label="Year Ended"
                value={formData.yearEnded}
                onChange={(e) => handleFormChange('yearEnded', e.target.value)}
                fullWidth
                placeholder="Enter year..."
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
                label="Actual 9 Months Amount"
                value={formData.actual9MonthsAmount}
                onChange={(e) => handleFormChange('actual9MonthsAmount', e.target.value)}
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
                label="Percentage of Change"
                value={formData.actual9MonthsPercentage}
                onChange={(e) => handleFormChange('actual9MonthsPercentage', e.target.value)}
                fullWidth
                placeholder="Enter percentage..."
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
                label="Change Percentage of Change"
                value={formData.forecastedChangePercentage}
                onChange={(e) => handleFormChange('forecastedChangePercentage', e.target.value)}
                fullWidth
                placeholder="Enter percentage..."
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
                label="Budget Year Ended"
                value={formData.budgetYearEnded}
                onChange={(e) => handleFormChange('budgetYearEnded', e.target.value)}
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
                label="Change"
                value={formData.budgetChange}
                onChange={(e) => handleFormChange('budgetChange', e.target.value)}
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
                label="Percentage of Change"
                value={formData.budgetChangePercentage}
                onChange={(e) => handleFormChange('budgetChangePercentage', e.target.value)}
                fullWidth
                placeholder="Enter percentage..."
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
              onClick={handleSaveVariance}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingVariance ? 'Update' : 'Add'} Variance
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

export default BudgetVariance;