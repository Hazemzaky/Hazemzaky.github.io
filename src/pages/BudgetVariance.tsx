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
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MonetizationOn as MoneyIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getVariance, saveVarianceBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const modules = [
  { value: 'revenue', label: 'Revenue', icon: <MoneyIcon />, color: '#1976d2' },
  { value: 'opex', label: 'OPEX', icon: <BusinessIcon />, color: '#d32f2f' },
  { value: 'staffing', label: 'Staffing', icon: <PeopleIcon />, color: '#388e3c' },
  { value: 'capex', label: 'CAPEX', icon: <BuildIcon />, color: '#f57c00' },
];

const defaultData: { [key: string]: any[] } = {
  revenue: [
    { name: 'Equipment Rental', budget: Array(12).fill(10000), actual: Array(12).fill('') },
    { name: 'Water Sales', budget: Array(12).fill(8000), actual: Array(12).fill('') },
  ],
  opex: [
    { name: 'Logistics', budget: Array(12).fill(2000), actual: Array(12).fill('') },
    { name: 'G&A', budget: Array(12).fill(1500), actual: Array(12).fill('') },
  ],
  staffing: [
    { name: 'Operations', budget: Array(12).fill(3000), actual: Array(12).fill('') },
    { name: 'Finance', budget: Array(12).fill(1200), actual: Array(12).fill('') },
  ],
  capex: [
    { name: 'Equipment', budget: Array(12).fill(5000), actual: Array(12).fill('') },
    { name: 'Vehicles', budget: Array(12).fill(4000), actual: Array(12).fill('') },
  ],
};

const BudgetVariance: React.FC = () => {
  const theme = useTheme();
  const [selectedModule, setSelectedModule] = useState<string>('revenue');
  const [data, setData] = useState<any>(defaultData);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getVariance(2024, selectedModule)
      .then((res: any) => {
        if (Array.isArray(res.data)) {
          setData((prev: any) => ({ ...prev, [selectedModule]: res.data.length > 0 ? res.data : defaultData[selectedModule] }));
        } else {
          setData((prev: any) => ({ ...prev, [selectedModule]: defaultData[selectedModule] }));
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Failed to load variance data');
        setData((prev: any) => ({ ...prev, [selectedModule]: defaultData[selectedModule] }));
        setLoading(false);
      });
  }, [selectedModule]);

  const handleActualChange = (rowIdx: number, mIdx: number, value: any) => {
    setData((prev: any) => {
      const updated = { ...prev };
      updated[selectedModule] = updated[selectedModule].map((row: any, i: number) => {
        if (i !== rowIdx) return row;
        const actual = [...row.actual];
        actual[mIdx] = value;
        return { ...row, actual };
      });
      return updated;
    });
  };

  // Calculate variance and variance %
  const getRowVariance = (row: any, mIdx: number) => {
    const budget = parseFloat(row.budget[mIdx]) || 0;
    const actual = parseFloat(row.actual[mIdx]) || 0;
    return actual - budget;
  };
  const getVariancePct = (row: any, mIdx: number) => {
    const budget = parseFloat(row.budget[mIdx]) || 0;
    if (!budget) return '';
    return (((parseFloat(row.actual[mIdx]) || 0) - budget) / budget * 100).toFixed(1);
  };

  // Chart data: total variance per month
  const chartData = months.map((m, mIdx) => {
    const totalBudget = data[selectedModule].reduce((sum: number, row: any) => sum + (parseFloat(row.budget[mIdx]) || 0), 0);
    const totalActual = data[selectedModule].reduce((sum: number, row: any) => sum + (parseFloat(row.actual[mIdx]) || 0), 0);
    return {
      month: m,
      budget: totalBudget,
      actual: totalActual,
      variance: totalActual - totalBudget,
    };
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveVarianceBulk(2024, selectedModule, data[selectedModule]);
      setSuccess('Variance data saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save variance data');
    } finally {
      setLoading(false);
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return theme.palette.success.main;
    if (variance < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUpIcon />;
    if (variance < 0) return <TrendingDownIcon />;
    return <InfoIcon />;
  };

  const selectedModuleData = modules.find(m => m.value === selectedModule);

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
                    <AssessmentIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Budget Variance Analysis
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Track actual vs budget performance across all modules
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Save Variance
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

        {/* Module Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📊 Select Module for Variance Analysis
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {modules.map((module) => (
                <motion.div
                  key={module.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + modules.indexOf(module) * 0.1 }}
                >
                  <Card 
                    onClick={() => setSelectedModule(module.value)}
                    sx={{ 
                      minWidth: 200,
                      cursor: 'pointer',
                      background: selectedModule === module.value 
                        ? alpha(module.color, 0.1) 
                        : alpha(theme.palette.background.paper, 0.8),
                      border: `2px solid ${selectedModule === module.value ? module.color : alpha(theme.palette.divider, 0.3)}`,
                      borderRadius: theme.shape.borderRadius,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(module.color, 0.3)}`,
                        borderColor: module.color
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ bgcolor: module.color, width: 48, height: 48, mx: 'auto', mb: 2 }}>
                        {module.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: module.color }}>
                        {module.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Variance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📈 Monthly Variance Trend - {selectedModuleData?.label}
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip 
                  contentStyle={{ 
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8
                  }}
                />
                <Legend />
                <Bar dataKey="budget" fill={theme.palette.primary.main} name="Budget" />
                <Bar dataKey="actual" fill={theme.palette.success.main} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Variance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
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
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📋 Detailed Variance Analysis - {selectedModuleData?.label}
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Category</TableCell>
                      {months.map((month) => (
                        <TableCell key={month} align="center" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {month}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data[selectedModule].map((row: any, rowIdx: number) => (
                      <TableRow 
                        key={rowIdx}
                        hover
                        sx={{ 
                          background: rowIdx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.05),
                            transform: 'scale(1.01)'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.name}
                          </Typography>
                        </TableCell>
                        {months.map((month, mIdx) => {
                          const variance = getRowVariance(row, mIdx);
                          const variancePct = getVariancePct(row, mIdx);
                          return (
                            <TableCell key={month} align="center">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <TextField
                                  value={row.actual[mIdx]}
                                  onChange={(e) => handleActualChange(rowIdx, mIdx, e.target.value)}
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
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  {getVarianceIcon(variance)}
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: getVarianceColor(variance),
                                      fontWeight: 600
                                    }}
                                  >
                                    {variancePct}%
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
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

export default BudgetVariance; 