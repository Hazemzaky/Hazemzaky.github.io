import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Grow,
  Zoom,
  Slide,
  Fab,
  Tooltip,
  Divider,
  LinearProgress,
  Avatar,
  Badge,
  Skeleton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';
import theme from '../theme';

// Enhanced color palette using the custom theme
const MODULE_COLORS = {
  financial: theme.palette.primary.main,
  hr: theme.palette.warning.main,
  assets: theme.palette.success.main,
  operations: theme.palette.secondary.main,
  maintenance: theme.palette.error.main,
  procurement: theme.palette.info.main,
  sales: theme.palette.success.light,
  admin: theme.palette.neutral?.main || '#795548',
  hse: theme.palette.neutral?.dark || '#607D8B'
};

// Enhanced mock data for charts
const mockChartData = {
  monthlyTrends: [
    { month: 'Jan', revenue: 125000, expenses: 98000, profit: 27000, target: 25000 },
    { month: 'Feb', revenue: 138000, expenses: 102000, profit: 36000, target: 28000 },
    { month: 'Mar', revenue: 152000, expenses: 115000, profit: 37000, target: 30000 },
    { month: 'Apr', revenue: 145000, expenses: 108000, profit: 37000, target: 32000 },
    { month: 'May', revenue: 168000, expenses: 125000, profit: 43000, target: 35000 },
    { month: 'Jun', revenue: 182000, expenses: 138000, profit: 44000, target: 38000 }
  ],
  moduleBreakdown: [
    { name: 'HR', value: 28, color: MODULE_COLORS.hr },
    { name: 'Assets', value: 22, color: MODULE_COLORS.assets },
    { name: 'Operations', value: 18, color: MODULE_COLORS.operations },
    { name: 'Maintenance', value: 15, color: MODULE_COLORS.maintenance },
    { name: 'Procurement', value: 12, color: MODULE_COLORS.procurement },
    { name: 'Admin', value: 5, color: MODULE_COLORS.admin }
  ],
  performanceMetrics: [
    { metric: 'Efficiency', current: 87, target: 90, trend: 'up' },
    { metric: 'Quality', current: 94, target: 92, trend: 'up' },
    { metric: 'Safety', current: 98, target: 95, trend: 'up' },
    { metric: 'Cost Control', current: 82, target: 85, trend: 'down' }
  ]
};

interface DashboardData {
  financial: {
    revenue: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
    margin: number;
  };
  hr: {
    headcount: number;
    payroll: number;
    attrition: number;
    attritionRate: number;
  };
  assets: {
    bookValue: number;
    utilization: number;
    depreciation: number;
    renewals: number;
  };
  operations: {
    deliveries: number;
    onTimePercentage: number;
    deliveryCost: number;
    fleetUtilization: number;
  };
  maintenance: {
    cost: number;
    preventiveVsCorrective: any[];
    downtime: number;
  };
  procurement: {
    totalSpend: number;
    topVendors: any[];
    openPOs: number;
    cycleTime: number;
  };
  sales: {
    totalSales: number;
    pipeline: number;
    topCustomers: any[];
    salesMargin: number;
  };
  admin: {
    costs: number;
    overheadPercentage: number;
    pendingApprovals: number;
  };
  hse: {
    incidents: number;
    trainingCompliance: number;
    openActions: number;
  };
  alerts: {
    overdueInvoices: number;
    unapprovedPOs: number;
    pendingReconciliations: number;
    expiringContracts: number;
    pendingRequests: number;
  };
}

interface MetricItem {
  label: string;
  value: string | number;
  format: (value: any) => string;
}

const DashboardPage: React.FC = () => {
  const muiTheme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<DashboardData>('/dashboard/dashboard-summary');
      setData(response.data);
      setLastUpdated(new Date());
      setSnackbar({ open: true, message: 'Dashboard data refreshed successfully!', severity: 'success' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      setSnackbar({ open: true, message: 'Failed to refresh dashboard data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getAlertSeverity = (count: number) => {
    if (count === 0) return 'success';
    if (count <= 3) return 'warning';
    return 'error';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleExport = () => {
    setSnackbar({ open: true, message: 'Export functionality coming soon!', severity: 'info' });
  };

  if (loading && !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={200} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ 
      p: fullscreen ? 1 : 3, 
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
                      Executive Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Real-time insights across all business modules
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      onClick={fetchDashboardData} 
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Dashboard">
                    <IconButton 
                      onClick={handleExport}
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <ExportIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                    <IconButton 
                      onClick={handleFullscreen}
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {lastUpdated && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Last updated: {lastUpdated.toLocaleString()}
                </Typography>
              )}
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

        {/* Action Center Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Badge badgeContent={Object.values(data.alerts).reduce((a, b) => a + b, 0)} color="error">
                <NotificationsIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
              </Badge>
              <Typography variant="h6" sx={{ color: theme.palette.warning.dark, fontWeight: 600 }}>
                Action Center
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              {Object.entries(data.alerts).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card 
                    elevation={0}
                    sx={{ 
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
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color={getAlertSeverity(value) as any} sx={{ fontWeight: 700, mb: 1 }}>
                        {value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Financial Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
              💰 Financial Performance
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              {[
                { 
                  title: 'Revenue', 
                  value: data.financial.revenue, 
                  color: theme.palette.primary.main,
                  bgColor: alpha(theme.palette.primary.main, 0.1),
                  icon: <TrendingUpIcon />
                },
                { 
                  title: 'Expenses', 
                  value: data.financial.expenses, 
                  color: theme.palette.error.main,
                  bgColor: alpha(theme.palette.error.main, 0.1),
                  icon: <TrendingDownIcon />
                },
                { 
                  title: 'Gross Profit', 
                  value: data.financial.grossProfit, 
                  color: theme.palette.success.main,
                  bgColor: alpha(theme.palette.success.main, 0.1),
                  icon: <TrendingUpIcon />
                },
                { 
                  title: 'Net Profit', 
                  value: data.financial.netProfit, 
                  color: theme.palette.secondary.main,
                  bgColor: alpha(theme.palette.secondary.main, 0.1),
                  icon: <TrendingUpIcon />
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <Card 
                    elevation={0}
                    sx={{ 
                      background: item.bgColor,
                      border: `1px solid ${alpha(item.color, 0.3)}`,
                      borderRadius: theme.shape.borderRadius,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(item.color, 0.3)}`
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: item.color, width: 40, height: 40, mr: 1 }}>
                          {item.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ color: item.color, fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatCurrency(item.value)}
                      </Typography>
                      {item.title === 'Gross Profit' && (
                        <Typography variant="body2" color="text.secondary">
                          Margin: {formatPercentage(data.financial.margin)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Module KPIs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
            📊 Module Performance Overview
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3, mb: 4 }}>
            {[
              {
                title: 'Human Resources',
                icon: <PeopleIcon />,
                color: MODULE_COLORS.hr,
                data: data.hr,
                metrics: [
                  { label: 'Active Employees', value: data.hr.headcount, format: formatNumber },
                  { label: 'Monthly Payroll', value: data.hr.payroll, format: formatCurrency },
                  { label: 'Employees on Vacation', value: data.hr.attritionRate, format: formatNumber }
                ] as MetricItem[]
              },
              {
                title: 'Assets',
                icon: <BusinessIcon />,
                color: MODULE_COLORS.assets,
                data: data.assets,
                metrics: [
                  { label: 'Total Book Value', value: data.assets.bookValue, format: formatCurrency },
                  { label: 'Avg Utilization', value: data.assets.utilization, format: formatPercentage },
                  { label: 'Renewals Required', value: data.assets.renewals, format: formatNumber }
                ] as MetricItem[]
              },
              {
                title: 'Operations',
                icon: <LocalShippingIcon />,
                color: MODULE_COLORS.operations,
                data: data.operations,
                metrics: [
                  { label: 'Total Callouts', value: data.operations.deliveries, format: formatNumber },
                  { label: 'On-Time Delivery', value: data.operations.onTimePercentage, format: formatPercentage },
                  { label: 'Fleet Utilization', value: data.operations.fleetUtilization, format: formatPercentage }
                ] as MetricItem[]
              },
              {
                title: 'Maintenance',
                icon: <BuildIcon />,
                color: MODULE_COLORS.maintenance,
                data: data.maintenance,
                metrics: [
                  { label: 'Total Cost', value: data.maintenance.cost, format: formatCurrency },
                  { label: 'Total Maintenance Hours', value: data.maintenance.downtime, format: formatNumber },
                  { label: 'Focus', value: 'Preventive', format: (v: string) => v }
                ] as MetricItem[]
              },
              {
                title: 'Procurement',
                icon: <ShoppingCartIcon />,
                color: MODULE_COLORS.procurement,
                data: data.procurement,
                metrics: [
                  { label: 'Total Spend', value: data.procurement.totalSpend, format: formatCurrency },
                  { label: 'Open POs', value: data.procurement.openPOs, format: formatNumber },
                  { label: 'Cycle Time', value: Math.round(data.procurement.cycleTime / (1000 * 60 * 60 * 24)), format: (v: number) => `${v} days` }
                ] as MetricItem[]
              },
              {
                title: 'Sales',
                icon: <AttachMoneyIcon />,
                color: MODULE_COLORS.sales,
                data: data.sales,
                metrics: [
                  { label: 'Total Sales', value: data.sales.totalSales, format: formatCurrency },
                  { label: 'Pipeline', value: data.sales.pipeline, format: formatNumber },
                  { label: 'Sales Margin', value: data.sales.salesMargin, format: formatPercentage }
                ] as MetricItem[]
              },
              {
                title: 'Administration',
                icon: <AdminIcon />,
                color: MODULE_COLORS.admin,
                data: data.admin,
                metrics: [
                  { label: 'Total Cost', value: data.admin.costs, format: formatCurrency },
                  { label: 'Overhead %', value: data.admin.overheadPercentage, format: formatPercentage },
                  { label: 'Pending Approvals', value: data.admin.pendingApprovals, format: formatNumber }
                ] as MetricItem[]
              },
              {
                title: 'HSE',
                icon: <SecurityIcon />,
                color: MODULE_COLORS.hse,
                data: data.hse,
                metrics: [
                  { label: 'Total Incidents', value: data.hse.incidents, format: formatNumber },
                  { label: 'Training Compliance', value: data.hse.trainingCompliance, format: formatPercentage },
                  { label: 'Open Actions', value: data.hse.openActions, format: formatNumber }
                ] as MetricItem[]
              }
            ].map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(module.color, 0.05)} 0%, ${alpha(module.color, 0.02)} 100%)`,
                    border: `1px solid ${alpha(module.color, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(module.color, 0.2)}`,
                      borderColor: module.color
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: module.color, width: 48, height: 48 }}>
                        {module.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: module.color }}>
                        {module.title}
                      </Typography>
                    </Box>
                    
                    {module.metrics.map((metric, idx) => (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {metric.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: module.color }}>
                            {metric.format(metric.value)}
                          </Typography>
                        </Box>
                        {idx < module.metrics.length - 1 && (
                          <Divider sx={{ opacity: 0.3 }} />
                        )}
                      </Box>
                    ))}
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
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(800px, 1fr))', gap: 3, mb: 4 }}>
            {/* Monthly Trends Chart */}
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                📈 Monthly Financial Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockChartData.monthlyTrends}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} fill="url(#revenueGradient)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expenses" stroke={theme.palette.error.main} fill="url(#expensesGradient)" strokeWidth={3} />
                  <Area type="monotone" dataKey="profit" stroke={theme.palette.success.main} fill="url(#profitGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>

            {/* Module Breakdown Chart */}
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                🥧 Cost Distribution by Module
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockChartData.moduleBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent || 0) * 100}%`}
                  >
                    {mockChartData.moduleBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 3 }}>
              🎯 Performance Metrics vs Targets
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              {mockChartData.performanceMetrics.map((metric, index) => (
                <motion.div
                  key={metric.metric}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                >
                  <Card elevation={0} sx={{ background: alpha(theme.palette.background.paper, 0.8) }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {metric.metric}
                        </Typography>
                        <Avatar 
                          sx={{ 
                            bgcolor: metric.trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                            width: 32, 
                            height: 32 
                          }}
                        >
                          {metric.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        </Avatar>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Current</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {metric.current}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Target</Typography>
                          <Typography variant="body1" color="text.secondary">
                            {metric.target}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={(metric.current / metric.target) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.divider, 0.3),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: metric.current >= metric.target ? theme.palette.success.main : theme.palette.warning.main
                          }
                        }} 
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        onClick={fetchDashboardData}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
            transform: 'scale(1.1)'
          }
        }}
      >
        <RefreshIcon />
      </Fab>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;     