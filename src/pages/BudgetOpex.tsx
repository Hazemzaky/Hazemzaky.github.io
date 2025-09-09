import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, Tooltip, useTheme, alpha, IconButton, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
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

const defaultOPEX = () => ({
  id: Date.now() + Math.random(),
  sr: '',
  serviceAnnualAgreement: '',
  vendor: '',
  agreementDescription: '',
  paymentType: '',
  typeOfCost: '',
  annual: '',
  quarter: ''
});

const BudgetOpex: React.FC = () => {
  const [opexBudgets, setOpexBudgets] = useState([defaultOPEX()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOPEX, setEditingOPEX] = useState<any>(null);
  const [formData, setFormData] = useState({
    sr: '',
    serviceAnnualAgreement: '',
    vendor: '',
    agreementDescription: '',
    paymentType: '',
    typeOfCost: '',
    annual: '',
    quarter: ''
  });

  const theme = useTheme();
  const pageColor = '#e91e63';

  useEffect(() => {
    fetchOPEXBudgets();
  }, []);

  const fetchOPEXBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget/opex');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setOpexBudgets(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch OPEX budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOPEX = () => {
    setEditingOPEX(null);
    setFormData({
      sr: '',
      serviceAnnualAgreement: '',
      vendor: '',
      agreementDescription: '',
      paymentType: '',
      typeOfCost: '',
      annual: '',
      quarter: ''
    });
    setOpenDialog(true);
  };

  const handleEditOPEX = (opex: any) => {
    setEditingOPEX(opex);
    setFormData({
      sr: opex.sr,
      serviceAnnualAgreement: opex.serviceAnnualAgreement,
      vendor: opex.vendor,
      agreementDescription: opex.agreementDescription,
      paymentType: opex.paymentType,
      typeOfCost: opex.typeOfCost,
      annual: opex.annual,
      quarter: opex.quarter
    });
    setOpenDialog(true);
  };

  const handleDeleteOPEX = (id: number) => {
    if (opexBudgets.length > 1) {
      setOpexBudgets(opexBudgets.filter(opex => opex.id !== id));
    }
  };

  const handleSaveOPEX = () => {
    if (editingOPEX) {
      // Edit existing OPEX
      setOpexBudgets(opexBudgets.map(opex => 
        opex.id === editingOPEX.id 
          ? { ...opex, ...formData }
          : opex
      ));
    } else {
      // Add new OPEX
      setOpexBudgets([...opexBudgets, { ...formData, id: Date.now() + Math.random() }]);
    }
    setOpenDialog(false);
    setSuccess(editingOPEX ? 'OPEX updated successfully!' : 'OPEX added successfully!');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return `${parseFloat(value).toLocaleString()} KWD`;
  };

  const getTotalAnnual = () => {
    return opexBudgets.reduce((sum, opex) => {
      return sum + (parseFloat(opex.annual) || 0);
    }, 0);
  };

  const getTotalQuarter = () => {
    return opexBudgets.reduce((sum, opex) => {
      return sum + (parseFloat(opex.quarter) || 0);
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
                    <Typography sx={{ fontSize: '2rem' }}>🏢</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      OPEX
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Plan and forecast operating expenses and service agreements
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddOPEX}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add OPEX
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

        {/* OPEX Table */}
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
              📊 OPEX Overview
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
                        Service Annual Agreement
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>
                        Vendor
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 200 }}>
                        Agreement Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>
                        Payment Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>
                        Type of Cost
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>
                        Annual
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>
                        Quarter
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100, textAlign: 'center' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {opexBudgets.map((opex, index) => (
                      <TableRow 
                        key={opex.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {opex.sr || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {opex.serviceAnnualAgreement || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {opex.vendor || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {opex.agreementDescription || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {opex.paymentType || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {opex.typeOfCost || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(opex.annual)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(opex.quarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditOPEX(opex)}
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
                              onClick={() => handleDeleteOPEX(opex.id)}
                              disabled={opexBudgets.length === 1}
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
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotalAnnual().toString())}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotalQuarter().toString())}
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

        {/* Add/Edit OPEX Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingOPEX ? 'Edit OPEX' : 'Add OPEX'}
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
                label="Service Annual Agreement"
                value={formData.serviceAnnualAgreement}
                onChange={(e) => handleFormChange('serviceAnnualAgreement', e.target.value)}
                fullWidth
                placeholder="Enter service annual agreement..."
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
                label="Agreement Description"
                value={formData.agreementDescription}
                onChange={(e) => handleFormChange('agreementDescription', e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="Enter agreement description..."
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
                label="Payment Type"
                value={formData.paymentType}
                onChange={(e) => handleFormChange('paymentType', e.target.value)}
                fullWidth
                placeholder="Enter payment type..."
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
                label="Type of Cost"
                value={formData.typeOfCost}
                onChange={(e) => handleFormChange('typeOfCost', e.target.value)}
                fullWidth
                placeholder="Enter type of cost..."
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
                label="Annual"
                value={formData.annual}
                onChange={(e) => handleFormChange('annual', e.target.value)}
                fullWidth
                placeholder="Enter annual amount..."
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
                label="Quarter"
                value={formData.quarter}
                onChange={(e) => handleFormChange('quarter', e.target.value)}
                fullWidth
                placeholder="Enter quarter amount..."
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
              onClick={handleSaveOPEX}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingOPEX ? 'Update' : 'Add'} OPEX
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

export default BudgetOpex; 