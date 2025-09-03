import React, { useState } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
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
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#f57c00'];

// Simulated data for dashboard
const simulated = {
  revenue: months.map((m, i) => 10000 + i * 500),
  opex: months.map((m, i) => 6000 + i * 200),
  profit: months.map((m, i) => 4000 + i * 300),
  headcount: months.map((m, i) => 20 + (i % 3)),
  pipeline: months.map((m, i) => 20000 - i * 1000),
  categories: [
    { name: 'Equipment Rental', value: 70000 },
    { name: 'Water Sales', value: 50000 },
    { name: 'Logistics', value: 20000 },
    { name: 'G&A', value: 18000 },
  ],
  table: months.map((m, i) => ({
    month: m,
    revenue: 10000 + i * 500,
    opex: 6000 + i * 200,
    profit: 4000 + i * 300,
    headcount: 20 + (i % 3),
    pipeline: 20000 - i * 1000,
  })),
};

const BudgetDashboard: React.FC = () => {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');

  // Filtered data (simulate for now)
  const filtered = simulated.table.filter(row => selectedMonth === 'all' || row.month === selectedMonth);
  const totalRevenue = filtered.reduce((sum, row) => sum + row.revenue, 0);
  const totalOpex = filtered.reduce((sum, row) => sum + row.opex, 0);
  const totalProfit = filtered.reduce((sum, row) => sum + row.profit, 0);
  const avgHeadcount = filtered.length ? (filtered.reduce((sum, row) => sum + row.headcount, 0) / filtered.length) : 0;
  const totalPipeline = filtered.reduce((sum, row) => sum + row.pipeline, 0);

  // Export handlers (simulate)
  const handleExportExcel = () => alert('Export to Excel (simulated)');
  const handleExportPDF = () => alert('Export to PDF (simulated)');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
                    <DashboardIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Budget Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive overview of budget performance and financial metrics
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleExportExcel}
                    startIcon={<SaveAltIcon />}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': { 
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    Export Excel
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleExportPDF}
                    startIcon={<PrintIcon />}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': { 
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    Export PDF
                  </Button>
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

        {/* Filters Section */}
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
              🔍 Dashboard Filters
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Month</InputLabel>
                <Select 
                  value={selectedMonth} 
                  label="Month" 
                  onChange={e => setSelectedMonth(e.target.value)}
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
                  <MenuItem value="all">All Months</MenuItem>
                  {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Module</InputLabel>
                <Select 
                  value={selectedModule} 
                  label="Module" 
                  onChange={e => setSelectedModule(e.target.value)}
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
                  <MenuItem value="all">All Modules</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="opex">OPEX</MenuItem>
                  <MenuItem value="profit">Profit</MenuItem>
                  <MenuItem value="headcount">Headcount</MenuItem>
                  <MenuItem value="pipeline">Pipeline</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedModule('all');
                }}
                sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Reset Filters
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
            {[
              {
                title: 'Total Revenue',
                value: formatCurrency(totalRevenue),
                icon: <MoneyIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1),
                trend: 'up'
              },
              {
                title: 'Total OPEX',
                value: formatCurrency(totalOpex),
                icon: <BusinessIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1),
                trend: 'down'
              },
              {
                title: 'Net Profit',
                value: formatCurrency(totalProfit),
                icon: <TrendingUpIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1),
                trend: 'up'
              },
              {
                title: 'Avg. Headcount',
                value: avgHeadcount.toLocaleString(undefined, { maximumFractionDigits: 1 }),
                icon: <PeopleIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1),
                trend: 'stable'
              },
              {
                title: 'Pipeline',
                value: formatCurrency(totalPipeline),
                icon: <AssessmentIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1),
                trend: 'up'
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <Card 
                  sx={{ 
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
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 40, height: 40 }}>
                        {card.icon}
                      </Avatar>
                      <Chip
                        label={card.trend === 'up' ? '↗' : card.trend === 'down' ? '↘' : '→'}
                        size="small"
                        sx={{ 
                          bgcolor: card.trend === 'up' ? theme.palette.success.main : 
                                 card.trend === 'down' ? theme.palette.error.main : 
                                 theme.palette.info.main,
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: card.color, mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: 3, mb: 4 }}>
            {/* Revenue vs OPEX Chart */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
                📊 Revenue vs OPEX Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulated.table}>
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
                  <Line type="monotone" dataKey="revenue" stroke={theme.palette.success.main} strokeWidth={3} />
                  <Line type="monotone" dataKey="opex" stroke={theme.palette.error.main} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Revenue Distribution Chart */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
                🥧 Revenue Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={simulated.categories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent || 0) * 100}%`}
                  >
                    {simulated.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
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
              📋 Monthly Performance Data
            </Typography>
            
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Month</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>OPEX</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Profit</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Headcount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Pipeline</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((row, idx) => (
                    <TableRow 
                      key={row.month}
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
                        <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                          {row.month}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                          {formatCurrency(row.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                          {formatCurrency(row.opex)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                          {formatCurrency(row.profit)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                          {row.headcount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                          {formatCurrency(row.pipeline)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default BudgetDashboard; 