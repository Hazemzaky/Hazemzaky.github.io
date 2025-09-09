import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, useTheme, alpha, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const defaultLogistics = () => ({
  id: Date.now() + Math.random(),
  no: '',
  description: '',
  forecastedYearEnded: '',
  budget1stQuarter: '',
  budget2ndQuarter: '',
  budget3rdQuarter: '',
  budgetTotal: ''
});

const BudgetLogistics: React.FC = () => {
  const [logisticsBudgets, setLogisticsBudgets] = useState([defaultLogistics()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLogistics, setEditingLogistics] = useState<any>(null);
  const [formData, setFormData] = useState(defaultLogistics());

  const theme = useTheme();
  const pageColor = '#43e97b';

  useEffect(() => {
    fetchLogisticsBudgets();
  }, []);

  const fetchLogisticsBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget/logistics');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setLogisticsBudgets(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch logistics data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLogistics = () => {
    setEditingLogistics(null);
    setFormData(defaultLogistics());
    setOpenDialog(true);
  };

  const handleEditLogistics = (logistics: any) => {
    setEditingLogistics(logistics);
    setFormData(logistics);
    setOpenDialog(true);
  };

  const handleDeleteLogistics = async (id: number) => {
    try {
      await api.delete(`/budget/logistics/${id}`);
      setLogisticsBudgets(logisticsBudgets.filter(logistics => logistics.id !== id));
      setSuccess('Logistics budget deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete logistics budget');
    }
  };

  const handleSaveLogistics = async () => {
    try {
      if (editingLogistics) {
        await api.put(`/budget/logistics/${editingLogistics.id}`, formData);
        setLogisticsBudgets(logisticsBudgets.map(logistics => 
          logistics.id === editingLogistics.id ? { ...formData } : logistics
        ));
        setSuccess('Logistics budget updated successfully!');
      } else {
        const response = await api.post('/budget/logistics', formData);
        setLogisticsBudgets([...logisticsBudgets, { ...formData, id: Date.now() + Math.random() }]);
        setSuccess('Logistics budget added successfully!');
      }
      setOpenDialog(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save logistics budget');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return `${parseFloat(value).toLocaleString()} KWD`;
  };

  const getTotalBudget = () => {
    return logisticsBudgets.reduce((sum, logistics) => {
      return sum + (parseFloat(logistics.budgetTotal) || 0);
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
                    <Typography sx={{ fontSize: '2rem' }}>🚚</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Logistics Cost
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage logistics and transportation costs
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddLogistics}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Logistics Cost
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Logistics Table */}
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
              📊 Logistics Cost Overview
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
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80, textAlign: 'center' }}>NO.</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 200 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>Forecasted Year Ended</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>Budget 1st Quarter</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>Budget 2nd Quarter</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>Budget 3rd Quarter</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 180 }}>Budget Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logisticsBudgets.map((logistics, index) => (
                      <TableRow 
                        key={logistics.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {logistics.no || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {logistics.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(logistics.forecastedYearEnded)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(logistics.budget1stQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(logistics.budget2ndQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(logistics.budget3rdQuarter)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(logistics.budgetTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditLogistics(logistics)}
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
                              onClick={() => handleDeleteLogistics(logistics.id)}
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
                      <TableCell colSpan={6} sx={{ fontWeight: 600, color: pageColor, textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          TOTAL
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

        {/* Add/Edit Logistics Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingLogistics ? 'Edit Logistics Cost' : 'Add Logistics Cost'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <TextField
                  label="NO."
                  value={formData.no}
                  onChange={(e) => handleFormChange('no', e.target.value)}
                  fullWidth
                  placeholder="Enter NO..."
                />
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  fullWidth
                  placeholder="Enter description..."
                />
                <TextField
                  label="Forecasted Year Ended"
                  value={formData.forecastedYearEnded}
                  onChange={(e) => handleFormChange('forecastedYearEnded', e.target.value)}
                  fullWidth
                  placeholder="Enter forecasted year ended..."
                />
                <TextField
                  label="Budget 1st Quarter"
                  value={formData.budget1stQuarter}
                  onChange={(e) => handleFormChange('budget1stQuarter', e.target.value)}
                  fullWidth
                  placeholder="Enter budget 1st quarter..."
                />
                <TextField
                  label="Budget 2nd Quarter"
                  value={formData.budget2ndQuarter}
                  onChange={(e) => handleFormChange('budget2ndQuarter', e.target.value)}
                  fullWidth
                  placeholder="Enter budget 2nd quarter..."
                />
                <TextField
                  label="Budget 3rd Quarter"
                  value={formData.budget3rdQuarter}
                  onChange={(e) => handleFormChange('budget3rdQuarter', e.target.value)}
                  fullWidth
                  placeholder="Enter budget 3rd quarter..."
                />
                <TextField
                  label="Budget Total"
                  value={formData.budgetTotal}
                  onChange={(e) => handleFormChange('budgetTotal', e.target.value)}
                  fullWidth
                  placeholder="Enter budget total..."
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveLogistics}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingLogistics ? 'Update' : 'Add'} Logistics Cost
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

export default BudgetLogistics;
