import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Snackbar, 
  Alert, 
  Paper, 
  Avatar, 
  useTheme, 
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useFiscalYear } from '../context/FiscalYearContext';
import { getAssumptions, saveAssumptions } from '../services/budgetApi';

const defaultAssumption = () => ({
  id: Date.now() + Math.random(),
  assumption: ''
});

const BudgetAssumptions: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const theme = useTheme();
  const [assumptions, setAssumptions] = useState([defaultAssumption()]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const pageColor = '#1976d2';

  useEffect(() => {
    setLoading(true);
    setError('');
    getAssumptions(fiscalYear)
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setAssumptions(res.data);
        } else {
          setAssumptions([defaultAssumption()]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load assumptions');
        setAssumptions([defaultAssumption()]);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleAssumptionChange = (id: number, value: string) => {
    setAssumptions(assumptions.map(assumption => 
      assumption.id === id ? { ...assumption, assumption: value } : assumption
    ));
  };

  const handleAddAssumption = () => {
    setAssumptions([...assumptions, defaultAssumption()]);
  };

  const handleRemoveAssumption = (id: number) => {
    if (assumptions.length > 1) {
      setAssumptions(assumptions.filter(assumption => assumption.id !== id));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveAssumptions({ assumptions, year: fiscalYear });
      setSuccess('Budget assumptions saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save assumptions');
    } finally {
      setLoading(false);
    }
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
                      Budget Assumptions
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Configure budget parameters and assumptions for {fiscalYear}/{(fiscalYear+1).toString().slice(-2)}
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Assumptions'}
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

        {/* Table Section */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: pageColor, fontWeight: 600 }}>
                📊 Budget Assumptions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddAssumption}
                sx={{
                  background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(pageColor, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(pageColor, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Add Line
              </Button>
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {!loading && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha(pageColor, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, width: '80%' }}>
                        Budget Assumption
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, width: '20%', textAlign: 'center' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assumptions.map((assumption, index) => (
                      <TableRow 
                        key={assumption.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ p: 0 }}>
                          <TextField
                            multiline
                            rows={6}
                            fullWidth
                            value={assumption.assumption}
                            onChange={(e) => handleAssumptionChange(assumption.id, e.target.value)}
                            placeholder="Enter your budget assumption here... (up to 1000 words)"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: pageColor,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: pageColor,
                                },
                              },
                              '& .MuiInputBase-input': {
                                fontSize: '0.95rem',
                                lineHeight: 1.6
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top', pt: 2 }}>
                          <IconButton
                            onClick={() => handleRemoveAssumption(assumption.id)}
                            disabled={assumptions.length === 1}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetAssumptions; 