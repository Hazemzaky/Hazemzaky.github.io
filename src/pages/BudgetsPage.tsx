import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Alert,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MonetizationOn as MoneyIcon,
  Business as BusinessIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import Countdown from 'react-countdown';
import api from '../apiBase';

const tabCategories = [
  'Budget Assumptions', 'Summary', 'Variance', 'Expected Sales', 'Sales', 'Other', 'Logistics Cost',
  'Cost Of Water Sale', 'Cost Of Rental Equipment', 'GA', 'OPEX', 'Staff', 'Costs', 'Manpower', 'Capex'
];

const getNextBudgetDate = (year: number) => dayjs(`${year}-04-01T00:00:00`);

const BudgetsPage: React.FC = () => {
  const theme = useTheme();
  const [budgetsByTab, setBudgetsByTab] = useState<{ [tab: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedTab, setSelectedTab] = useState(0);
  const [form, setForm] = useState<any>({
    department: '',
    project: '',
    period: '',
    accountCode: '',
    amount: '',
    forecast: '',
    scenarios: { best: '', worst: '', expected: '' },
    notes: '',
    subCategory: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all budgets for the selected year, grouped by tab
  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/budgets?year=${selectedYear}`);
        // Ensure response.data is always an array
        const data = Array.isArray(res.data) ? res.data : [];
        // Group by category/tab
        const grouped: { [tab: string]: any[] } = {};
        tabCategories.forEach(tab => grouped[tab] = []);
        data.forEach((b: any) => {
          if (grouped[b.category]) grouped[b.category].push(b);
        });
        setBudgetsByTab(grouped);
        // Update years list
        const allYears = new Set<number>([selectedYear, ...data.map((b: any) => b.year)]);
        setYears(Array.from(allYears).sort());
      } catch (err: any) {
        setError('Failed to fetch budgets');
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [selectedYear]);

  // Add new year
  const handleAddYear = () => {
    const nextYear = Math.max(...years, dayjs().year()) + 1;
    setYears([...years, nextYear]);
    setSelectedYear(nextYear);
  };

  // Add Budget handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleScenarioChange = (field: string, value: string) => {
    setForm({ ...form, scenarios: { ...form.scenarios, [field]: value } });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/budgets', {
        ...form,
        year: selectedYear,
        category: tabCategories[selectedTab],
        amount: Number(form.amount),
        forecast: Number(form.forecast),
        scenarios: {
          best: Number(form.scenarios.best),
          worst: Number(form.scenarios.worst),
          expected: Number(form.scenarios.expected),
        },
      });
      setSuccess('Budget entry added!');
      setForm({
        department: '',
        project: '',
        period: '',
        accountCode: '',
        amount: '',
        forecast: '',
        scenarios: { best: '', worst: '', expected: '' },
        notes: '',
        subCategory: '',
      });
      // Refetch
      const res = await api.get(`/budgets?year=${selectedYear}`);
      const data = Array.isArray(res.data) ? res.data : [];
      const grouped: { [tab: string]: any[] } = {};
      tabCategories.forEach(tab => grouped[tab] = []);
      data.forEach((b: any) => {
        if (grouped[b.category]) grouped[b.category].push(b);
      });
      setBudgetsByTab(grouped);
    } catch (err: any) {
      setError('Failed to add budget entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Table totals for current tab
  const currentTabBudgets = budgetsByTab[tabCategories[selectedTab]] || [];
  const totalAmount = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.amount || 0), 0), [currentTabBudgets]);
  const totalForecast = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.forecast || 0), 0), [currentTabBudgets]);
  const totalActual = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.actual || 0), 0), [currentTabBudgets]);
  const totalVariance = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.variance || 0), 0), [currentTabBudgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
                      Budget Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive budget planning and tracking across all business categories
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Export Budgets">
                    <IconButton 
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <SaveAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Report">
                    <IconButton 
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

        {/* Year Selector and Controls */}
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
              📅 Budget Period Configuration
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <TextField
                  select
                  label="Budget Year"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  fullWidth
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
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </TextField>
              </Box>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddYear}
                sx={{ 
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    borderColor: theme.palette.secondary.dark,
                    color: theme.palette.secondary.dark,
                  }
                }}
              >
                Add Year
              </Button>
              <Box sx={{ 
                flex: '1 1 300px', 
                minWidth: 300,
                p: 2,
                background: alpha(theme.palette.info.main, 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ScheduleIcon sx={{ color: theme.palette.info.main }} />
                  <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                    Next Budget Cycle:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.info.main }}>
                  <Countdown date={getNextBudgetDate(selectedYear).toDate()} />
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Tabs 
              value={selectedTab} 
              onChange={(_, v) => setSelectedTab(v)} 
              variant="scrollable" 
              scrollButtons="auto" 
              sx={{ 
                mb: 2,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 700
                  }
                }
              }}
            >
              {tabCategories.map((cat, idx) => <Tab key={cat} label={cat} />)}
            </Tabs>
          </Paper>
        </motion.div>

        {/* Add Data Form */}
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
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 3 }}>
              ➕ Add Budget Entry
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField 
                label="Department" 
                name="department" 
                value={form.department} 
                onChange={handleFormChange} 
                required 
                size="small"
                sx={{ minWidth: 160 }}
              />
              <TextField 
                label="Project" 
                name="project" 
                value={form.project} 
                onChange={handleFormChange} 
                size="small"
                sx={{ minWidth: 120 }}
              />
              <TextField 
                label="Period" 
                name="period" 
                value={form.period} 
                onChange={handleFormChange} 
                required 
                size="small"
                sx={{ minWidth: 100 }}
              />
              <TextField 
                label="Account Code" 
                name="accountCode" 
                value={form.accountCode} 
                onChange={handleFormChange} 
                size="small"
                sx={{ minWidth: 120 }}
              />
              <TextField 
                label="Amount" 
                name="amount" 
                value={form.amount} 
                onChange={handleFormChange} 
                type="number" 
                required 
                size="small"
                sx={{ minWidth: 100 }}
              />
              <TextField 
                label="Forecast" 
                name="forecast" 
                value={form.forecast} 
                onChange={handleFormChange} 
                type="number" 
                required 
                size="small"
                sx={{ minWidth: 100 }}
              />
              <TextField 
                label="Best Case" 
                name="best" 
                value={form.scenarios.best} 
                onChange={e => handleScenarioChange('best', e.target.value)} 
                type="number" 
                required 
                size="small"
                sx={{ minWidth: 80 }}
              />
              <TextField 
                label="Worst Case" 
                name="worst" 
                value={form.scenarios.worst} 
                onChange={e => handleScenarioChange('worst', e.target.value)} 
                type="number" 
                required 
                size="small"
                sx={{ minWidth: 80 }}
              />
              <TextField 
                label="Expected" 
                name="expected" 
                value={form.scenarios.expected} 
                onChange={e => handleScenarioChange('expected', e.target.value)} 
                type="number" 
                required 
                size="small"
                sx={{ minWidth: 80 }}
              />
              <TextField 
                label="Notes" 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                size="small"
                sx={{ minWidth: 160 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting}
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
                {submitting ? <CircularProgress size={20} /> : 'Add Entry'}
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Table for Selected Tab/Year */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3,
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
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
              📊 {tabCategories[selectedTab]} ({selectedYear})
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Project</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Period</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Account Code</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Forecast</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Best</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Worst</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Expected</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actual</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Variance</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentTabBudgets.map((b, idx) => (
                      <TableRow 
                        key={b._id} 
                        sx={{ 
                          background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.05),
                            transform: 'scale(1.01)'
                          }
                        }}
                      >
                        <TableCell>{b.department}</TableCell>
                        <TableCell>{b.project || '-'}</TableCell>
                        <TableCell>{b.period}</TableCell>
                        <TableCell>{b.accountCode || '-'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {formatCurrency(b.amount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                            {formatCurrency(b.forecast || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>{b.scenarios?.best}</TableCell>
                        <TableCell>{b.scenarios?.worst}</TableCell>
                        <TableCell>{b.scenarios?.expected}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {formatCurrency(b.actual || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: (b.variance || 0) >= 0 ? theme.palette.success.main : theme.palette.error.main 
                            }}
                          >
                            {formatCurrency(b.variance || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>{b.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Totals Card */}
            <Card 
              elevation={0}
              sx={{ 
                mt: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                  📈 Budget Totals
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {formatCurrency(totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                      {formatCurrency(totalForecast)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Forecast</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {formatCurrency(totalActual)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Actual</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      color: totalVariance >= 0 ? theme.palette.success.main : theme.palette.error.main 
                    }}>
                      {formatCurrency(totalVariance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Variance</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
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

export default BudgetsPage; 