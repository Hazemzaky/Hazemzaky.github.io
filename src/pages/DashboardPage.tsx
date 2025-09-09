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
import { useNavigate } from 'react-router-dom';
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
import { usePnLIntegration } from '../services/pnlIntegrationService';

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


interface DashboardData {
  financial: {
    revenue: number;
    expenses: number;
    ebitda: number;
    subCompaniesRevenue: number;
    margin: number;
  };
  hr: {
    headcount: number;
    payroll: number;
    activeEmployees: number;
    onLeaveEmployees: number;
  };
  assets: {
    bookValue: number;
    totalAssets: number;
    renewalsRequired: number;
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
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // PnL Integration for enhanced financial data
  const { 
    pnlData: pnlIntegrationData, 
    loading: pnlLoading, 
    error: pnlError, 
    refreshPnLData 
  } = usePnLIntegration('dashboard');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<DashboardData>('/dashboard/dashboard-summary');
      
      // Update financial data with PnL integration data if available
      const updatedData = { ...response.data };
      if (pnlIntegrationData?.summary) {
        updatedData.financial = {
          ...updatedData.financial,
          revenue: pnlIntegrationData.summary.revenue || updatedData.financial.revenue,
          expenses: pnlIntegrationData.summary.operatingExpenses || updatedData.financial.expenses,
          ebitda: pnlIntegrationData.summary.operatingProfit || updatedData.financial.ebitda,
          // Keep other financial data from dashboard
          subCompaniesRevenue: updatedData.financial.subCompaniesRevenue,
          margin: updatedData.financial.margin
        };
      }
      
      setData(updatedData);
      setLastUpdated(new Date());
      setSnackbar({ open: true, message: 'Dashboard data refreshed successfully!', severity: 'success' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      setSnackbar({ open: true, message: 'Failed to refresh dashboard data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pnlIntegrationData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch PnL data for enhanced financial metrics
  useEffect(() => {
    console.log('Fetching PnL data for dashboard...');
    refreshPnLData('yearly');
  }, [refreshPnLData]);

  // Refresh dashboard data when PnL data changes
  useEffect(() => {
    if (pnlIntegrationData?.summary) {
      console.log('Updating dashboard data with PnL data:', pnlIntegrationData.summary);
      // Update the existing data with PnL data without refetching
      setData(prevData => {
        if (!prevData) return prevData;
        const updatedData = {
          ...prevData,
          financial: {
            ...prevData.financial,
            revenue: pnlIntegrationData.summary.revenue || prevData.financial.revenue,
            expenses: pnlIntegrationData.summary.operatingExpenses || prevData.financial.expenses,
            ebitda: pnlIntegrationData.summary.operatingProfit || prevData.financial.ebitda,
            // Keep other financial data from dashboard
            subCompaniesRevenue: prevData.financial.subCompaniesRevenue,
            margin: prevData.financial.margin
          }
        };
        console.log('Updated financial data:', updatedData.financial);
        return updatedData;
      });
    }
  }, [pnlIntegrationData]);

  // Get enhanced revenue from PnL data (same as PnL table)
  const getEnhancedRevenue = () => {
    if (pnlIntegrationData?.summary?.revenue) {
      return pnlIntegrationData.summary.revenue;
    }
    // Fallback to dashboard data
    return data?.financial?.revenue || 0;
  };

  // Get enhanced expenses from PnL data (same as PnL table)
  const getEnhancedExpenses = () => {
    if (pnlIntegrationData?.summary?.operatingExpenses) {
      return pnlIntegrationData.summary.operatingExpenses;
    }
    // Fallback to dashboard data
    return data?.financial?.expenses || 0;
  };

  // Get enhanced EBITDA from PnL data (same as PnL table)
  const getEnhancedEBITDA = () => {
    console.log('getEnhancedEBITDA - PnL data:', pnlIntegrationData?.summary?.operatingProfit);
    console.log('getEnhancedEBITDA - Dashboard data:', data?.financial?.ebitda);
    if (pnlIntegrationData?.summary?.operatingProfit !== undefined) {
      console.log('Using PnL EBITDA data:', pnlIntegrationData.summary.operatingProfit);
      return pnlIntegrationData.summary.operatingProfit;
    }
    // Fallback to dashboard data
    console.log('Using dashboard EBITDA data:', data?.financial?.ebitda || 0);
    return data?.financial?.ebitda || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
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

  const handleActionCenterClick = (action: string) => {
    switch (action) {
      case 'overdueInvoices':
        navigate('/invoices');
        break;
      case 'unapprovedPOs':
        navigate('/procurement?tab=3'); // Purchase Orders tab
        break;
      case 'pendingReconciliations':
        navigate('/accounting/reconciliation');
        break;
      case 'expiringContracts':
        navigate('/clients?tab=contract'); // Contract tab
        break;
      case 'pendingRequests':
        navigate('/pending-requests'); // Dedicated Pending Requests page
        break;
      default:
        break;
    }
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
              {Object.entries(data.alerts).map(([key, value], index) => {
                const alertLabels: { [key: string]: string } = {
                  overdueInvoices: 'Overdue Invoices',
                  unapprovedPOs: 'Unapproved POs',
                  pendingReconciliations: 'Pending Reconciliations',
                  expiringContracts: 'Expiring Contracts',
                  pendingRequests: 'Pending Requests'
                };
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      onClick={() => handleActionCenterClick(key)}
                      sx={{ 
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[8],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color={getAlertSeverity(value) as any} sx={{ fontWeight: 700, mb: 1 }}>
                          {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alertLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                💰 Financial Performance
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  console.log('Manual PnL refresh triggered');
                  refreshPnLData('yearly');
                }}
                sx={{ 
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                Refresh PnL Data
              </Button>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              {[
                { 
                  title: 'Revenue', 
                  value: getEnhancedRevenue(), 
                  color: theme.palette.primary.main,
                  bgColor: alpha(theme.palette.primary.main, 0.1),
                  icon: <TrendingUpIcon />
                },
                { 
                  title: 'Expenses', 
                  value: getEnhancedExpenses(), 
                  color: theme.palette.error.main,
                  bgColor: alpha(theme.palette.error.main, 0.1),
                  icon: <TrendingDownIcon />
                },
                { 
                  title: 'EBITDA', 
                  value: getEnhancedEBITDA(), 
                  color: theme.palette.success.main,
                  bgColor: alpha(theme.palette.success.main, 0.1),
                  icon: <TrendingUpIcon />
                },
                { 
                  title: 'Sub Companies Revenue', 
                  value: data.financial.subCompaniesRevenue, 
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
                      {item.title === 'Revenue' && pnlIntegrationData?.summary?.revenue && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          ✨ Enhanced from PnL Vertical Table
                        </Typography>
                      )}
                      {item.title === 'Expenses' && pnlIntegrationData?.summary?.operatingExpenses && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          ✨ Enhanced from PnL Vertical Table
                        </Typography>
                      )}
                      {item.title === 'EBITDA' && pnlIntegrationData?.summary?.ebitda && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          ✨ Enhanced from PnL Vertical Table
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
                  { label: 'Total Headcount', value: data.hr.headcount, format: formatNumber },
                  { label: 'Active Employees', value: data.hr.activeEmployees, format: formatNumber },
                  { label: 'Monthly Payroll', value: data.hr.payroll, format: formatCurrency },
                  { label: 'On Leave', value: data.hr.onLeaveEmployees, format: formatNumber }
                ] as MetricItem[]
              },
              {
                title: 'Assets',
                icon: <BusinessIcon />,
                color: MODULE_COLORS.assets,
                data: data.assets,
                metrics: [
                  { label: 'Total Book Value', value: data.assets.bookValue, format: formatCurrency },
                  { label: 'Total Assets', value: data.assets.totalAssets, format: formatNumber },
                  { label: 'Renewals Required', value: data.assets.renewalsRequired, format: formatNumber }
                ] as MetricItem[]
              },
              {
                title: 'Operations',
                icon: <LocalShippingIcon />,
                color: MODULE_COLORS.operations,
                data: data.operations,
                metrics: [
                  { label: 'Total Callouts', value: data.operations.deliveries, format: formatNumber },
                  { label: 'Total Orders', value: data.operations.onTimePercentage, format: formatNumber },
                  { label: 'Cancelled Orders', value: data.operations.fleetUtilization, format: formatNumber }
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
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: module.color }}>
                          {module.title}
                        </Typography>
                        {module.title === 'Human Resources' && (
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                            ✨ Live Data from Employee & Payroll Modules
                          </Typography>
                        )}
                        {module.title === 'Assets' && (
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                            ✨ Live Data from Asset Module
                          </Typography>
                        )}
                        {module.title === 'Operations' && (
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                            ✨ Live Data from Projects Module
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {module.metrics.map((metric, idx) => {
                      // Special styling for HR metrics
                      const isHRPayroll = module.title === 'Human Resources' && metric.label === 'Monthly Payroll';
                      const isHRActive = module.title === 'Human Resources' && metric.label === 'Active Employees';
                      
                      // Special styling for Assets metrics
                      const isAssetBookValue = module.title === 'Assets' && metric.label === 'Total Book Value';
                      const isAssetTotal = module.title === 'Assets' && metric.label === 'Total Assets';
                      const isAssetRenewals = module.title === 'Assets' && metric.label === 'Renewals Required';
                      
                      // Special styling for Operations metrics
                      const isOpsCallouts = module.title === 'Operations' && metric.label === 'Total Callouts';
                      const isOpsOrders = module.title === 'Operations' && metric.label === 'Total Orders';
                      const isOpsCancelled = module.title === 'Operations' && metric.label === 'Cancelled Orders';
                      
                      return (
                        <Box key={idx} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {metric.label}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isHRPayroll && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isHRActive && (
                                <Chip 
                                  size="small" 
                                  label="Active"
                                  color="success"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isAssetBookValue && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isAssetTotal && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isAssetRenewals && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isOpsCallouts && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isOpsOrders && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {isOpsCancelled && (
                                <Chip 
                                  size="small" 
                                  label="Live"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              <Typography variant="h6" sx={{ fontWeight: 600, color: module.color }}>
                                {metric.format(metric.value)}
                              </Typography>
                            </Box>
                          </Box>
                          {idx < module.metrics.length - 1 && (
                            <Divider sx={{ opacity: 0.3 }} />
                          )}
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Real Data Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(800px, 1fr))', gap: 3, mb: 4 }}>
            {/* Financial Summary Chart */}
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
                📊 Financial Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Revenue', value: getEnhancedRevenue(), color: theme.palette.primary.main },
                  { name: 'Expenses', value: getEnhancedExpenses(), color: theme.palette.error.main },
                  { name: 'EBITDA', value: getEnhancedEBITDA(), color: theme.palette.success.main },
                  { name: 'Sub Companies Revenue', value: data.financial.subCompaniesRevenue, color: theme.palette.secondary.main }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Bar dataKey="value" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Module Performance Chart */}
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
                🎯 Module Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'HR', value: data.hr.payroll, color: MODULE_COLORS.hr },
                      { name: 'Assets', value: data.assets.bookValue, color: MODULE_COLORS.assets },
                      { name: 'Operations', value: data.operations.deliveryCost, color: MODULE_COLORS.operations },
                      { name: 'Maintenance', value: data.maintenance.cost, color: MODULE_COLORS.maintenance },
                      { name: 'Procurement', value: data.procurement.totalSpend, color: MODULE_COLORS.procurement },
                      { name: 'Admin', value: data.admin.costs, color: MODULE_COLORS.admin },
                      { name: 'HSE', value: data.hse.incidents, color: MODULE_COLORS.hse }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent || 0) * 100}%`}
                  >
                    {[
                      { name: 'HR', value: data.hr.payroll, color: MODULE_COLORS.hr },
                      { name: 'Assets', value: data.assets.bookValue, color: MODULE_COLORS.assets },
                      { name: 'Operations', value: data.operations.deliveryCost, color: MODULE_COLORS.operations },
                      { name: 'Maintenance', value: data.maintenance.cost, color: MODULE_COLORS.maintenance },
                      { name: 'Procurement', value: data.procurement.totalSpend, color: MODULE_COLORS.procurement },
                      { name: 'Admin', value: data.admin.costs, color: MODULE_COLORS.admin },
                      { name: 'HSE', value: data.hse.incidents, color: MODULE_COLORS.hse }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </motion.div>

        {/* Real Performance Metrics */}
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
              📈 Key Performance Indicators
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              {[
                {
                  metric: 'Profit Margin',
                  current: data.financial.margin,
                  trend: data.financial.margin > 0 ? 'up' : 'down',
                  icon: <TrendingUpIcon />
                },
                {
                  metric: 'Total Assets',
                  current: data.assets.totalAssets,
                  trend: data.assets.totalAssets > 0 ? 'up' : 'down',
                  icon: <TrendingUpIcon />
                },
                {
                  metric: 'On-Time Delivery',
                  current: data.operations.onTimePercentage,
                  trend: data.operations.onTimePercentage > 0 ? 'up' : 'down',
                  icon: <TrendingUpIcon />
                },
                {
                  metric: 'Training Compliance',
                  current: data.hse.trainingCompliance * 100,
                  trend: data.hse.trainingCompliance > 0 ? 'up' : 'down',
                  icon: <TrendingUpIcon />
                }
              ].map((metric, index) => (
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
                          <Typography variant="body2" color="text.secondary">Current Value</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {metric.current.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.divider, 0.3),
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          height: '100%',
                          width: '100%',
                          bgcolor: metric.trend === 'up' ? theme.palette.success.main : theme.palette.warning.main,
                          opacity: 0.3
                        }} />
                      </Box>
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