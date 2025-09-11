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

const defaultITOpex = () => ({
  id: Date.now() + Math.random(),
  sr: '',
  itService: '',
  vendor: '',
  serviceDesk: '',
  renewMonth: ''
});

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BudgetITOpexDatabase: React.FC = () => {
  const [itOpexBudgets, setITOpexBudgets] = useState([defaultITOpex()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingITOpex, setEditingITOpex] = useState<any>(null);
  const [formData, setFormData] = useState({
    sr: '',
    itService: '',
    vendor: '',
    serviceDesk: '',
    renewMonth: ''
  });

  const theme = useTheme();
  const pageColor = '#ff5722';

  useEffect(() => {
    fetchITOpexBudgets();
  }, []);

  const fetchITOpexBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget/it-opex');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setITOpexBudgets(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch IT OPEX budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddITOpex = () => {
    setEditingITOpex(null);
    setFormData({
      sr: '',
      itService: '',
      vendor: '',
      serviceDesk: '',
      renewMonth: ''
    });
    setOpenDialog(true);
  };

  const handleEditITOpex = (itOpex: any) => {
    setEditingITOpex(itOpex);
    setFormData({
      sr: itOpex.sr,
      itService: itOpex.itService,
      vendor: itOpex.vendor,
      serviceDesk: itOpex.serviceDesk,
      renewMonth: itOpex.renewMonth
    });
    setOpenDialog(true);
  };

  const handleDeleteITOpex = (id: number) => {
    if (itOpexBudgets.length > 1) {
      setITOpexBudgets(itOpexBudgets.filter(itOpex => itOpex.id !== id));
    }
  };

  const handleSaveITOpex = () => {
    if (editingITOpex) {
      // Edit existing IT OPEX
      setITOpexBudgets(itOpexBudgets.map(itOpex => 
        itOpex.id === editingITOpex.id 
          ? { ...itOpex, ...formData }
          : itOpex
      ));
    } else {
      // Add new IT OPEX
      setITOpexBudgets([...itOpexBudgets, { ...formData, id: Date.now() + Math.random() }]);
    }
    setOpenDialog(false);
    setSuccess(editingITOpex ? 'IT OPEX updated successfully!' : 'IT OPEX added successfully!');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const getTotalServices = () => {
    return itOpexBudgets.length;
  };

  const getServicesByMonth = (month: string) => {
    return itOpexBudgets.filter(itOpex => itOpex.renewMonth === month).length;
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
                    <Typography sx={{ fontSize: '2rem' }}>💻</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      IT OPEX
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Plan and manage IT services, vendors, and renewal schedules
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddITOpex}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add IT OPEX
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

        {/* IT OPEX Table */}
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
              📊 IT OPEX Overview
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
                        SR.
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 200 }}>
                        IT Service
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>
                        Vendor
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>
                        Service Desk
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>
                        Renew Month
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100, textAlign: 'center' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itOpexBudgets.map((itOpex, index) => (
                      <TableRow 
                        key={itOpex.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {itOpex.sr || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {itOpex.itService || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {itOpex.vendor || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {itOpex.serviceDesk || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {itOpex.renewMonth || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditITOpex(itOpex)}
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
                              onClick={() => handleDeleteITOpex(itOpex.id)}
                              disabled={itOpexBudgets.length === 1}
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
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {getTotalServices()} Services
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

        {/* Add/Edit IT OPEX Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingITOpex ? 'Edit IT OPEX' : 'Add IT OPEX'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                label="SR."
                value={formData.sr}
                onChange={(e) => handleFormChange('sr', e.target.value)}
                fullWidth
                placeholder="Enter SR number..."
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
                label="IT Service"
                value={formData.itService}
                onChange={(e) => handleFormChange('itService', e.target.value)}
                fullWidth
                placeholder="Enter IT service name..."
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
                label="Vendor"
                value={formData.vendor}
                onChange={(e) => handleFormChange('vendor', e.target.value)}
                fullWidth
                placeholder="Enter vendor name..."
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
                label="Service Desk"
                value={formData.serviceDesk}
                onChange={(e) => handleFormChange('serviceDesk', e.target.value)}
                fullWidth
                placeholder="Enter service desk information..."
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
              <FormControl fullWidth>
                <InputLabel>Renew Month</InputLabel>
                <Select
                  value={formData.renewMonth}
                  onChange={(e) => handleFormChange('renewMonth', e.target.value)}
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
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveITOpex}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingITOpex ? 'Update' : 'Add'} IT OPEX
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

export default BudgetITOpexDatabase;
