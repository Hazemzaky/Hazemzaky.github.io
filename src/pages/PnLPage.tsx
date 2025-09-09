import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Avatar,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Assignment as ProjectIcon,
  AttachFile as AttachFileIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../apiBase';
import { pnlIntegrationService, usePnLIntegration, getPeriodBoundaries } from '../services/pnlIntegrationService';
import ManualEntriesPage from './ManualEntriesPage';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// IFRS P&L Categories
const PNL_CATEGORIES = {
  REVENUE: 'revenue',
  COST_OF_SALES: 'cost_of_sales',
  GROSS_PROFIT: 'gross_profit',
  OPERATING_EXPENSES: 'operating_expenses',
  OPERATING_PROFIT: 'operating_profit',
  FINANCE_COSTS: 'finance_costs',
  OTHER_INCOME_EXPENSES: 'other_income_expenses',
  PROFIT_BEFORE_TAX: 'profit_before_tax',
  INCOME_TAX_EXPENSE: 'income_tax_expense',
  PROFIT_FOR_PERIOD: 'profit_for_period'
};

// Module source mapping
const MODULE_SOURCES = {
  hr: 'HR & Personnel',
  assets: 'Assets & Equipment',
  operations: 'Operations & Logistics',
  maintenance: 'Maintenance',
  procurement: 'Procurement',
  sales: 'Sales & Revenue',
  admin: 'Administration',
  hse: 'Health, Safety & Environment'
};

// Color scheme for different P&L sections
const getSectionColor = (category: string) => {
  switch (category) {
    case 'revenue': return '#4caf50';
    case 'cost_of_sales': return '#f44336';
    case 'gross_profit': return '#2196f3';
    case 'operating_expenses': return '#ff9800';
    case 'operating_profit': return '#9c27b0';
    case 'finance_costs': return '#e91e63';
    case 'other_income_expenses': return '#607d8b';
    case 'profit_before_tax': return '#795548';
    case 'income_tax_expense': return '#ff5722';
    case 'profit_for_period': return '#3f51b5';
    case 'ebitda': return '#ff6b35';
    default: return '#757575';
  }
};

// Financial Metrics Containers Component
const FinancialMetricsContainers: React.FC<{ data: any }> = ({ data }) => {
  const theme = useTheme();

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="textSecondary">No data available</Typography>
      </Box>
    );
  }

  // Extract values from PnL table data
  const summary = data.summary || {};
  const revenue = summary.revenue || 0;
  const expenses = summary.operatingExpenses || 0;
  const ebitda = summary.ebitda || 0;
  const subCompaniesRevenue = data.subCompaniesRevenue || 0;

  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      {/* Revenue Container */}
      <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #4caf50' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: '#4caf50', mr: 1 }} />
            <Typography color="textSecondary" variant="subtitle2">
              Revenue
            </Typography>
          </Box>
          <Typography variant="h4" color="success.main">
            KD {revenue?.toLocaleString() || '0'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            From PnL Vertical Table
          </Typography>
        </CardContent>
      </Card>

      {/* Expenses Container */}
      <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #f44336' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <ReceiptIcon sx={{ fontSize: 20, color: '#f44336', mr: 1 }} />
            <Typography color="textSecondary" variant="subtitle2">
              Expenses
            </Typography>
          </Box>
          <Typography variant="h4" color="error.main">
            KD {expenses?.toLocaleString() || '0'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            From PnL Vertical Table
          </Typography>
        </CardContent>
      </Card>

      {/* EBITDA Container */}
      <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #ff6b35' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <AssessmentIcon sx={{ fontSize: 20, color: '#ff6b35', mr: 1 }} />
            <Typography color="textSecondary" variant="subtitle2">
              EBITDA
            </Typography>
          </Box>
          <Typography variant="h4" color={ebitda >= 0 ? 'success.main' : 'error.main'}>
            KD {ebitda?.toLocaleString() || '0'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            From PnL Vertical Table
          </Typography>
        </CardContent>
      </Card>

      {/* Sub Companies Revenue Container */}
      <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #9c27b0' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <BusinessIcon sx={{ fontSize: 20, color: '#9c27b0', mr: 1 }} />
            <Typography color="textSecondary" variant="subtitle2">
              Sub Companies Revenue
            </Typography>
          </Box>
          <Typography variant="h4" color="primary.main">
            KD {subCompaniesRevenue?.toLocaleString() || '0'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            From Manual Entries
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

// P&L Summary Cards Component
const PnLSummaryCards: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  const theme = useTheme();

  // Get module icon and color (shared with PnLTable)
  const getModuleIcon = (module: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      hr: <PersonIcon sx={{ fontSize: 16 }} />,
      assets: <BusinessIcon sx={{ fontSize: 16 }} />,
      operations: <LocalShippingIcon sx={{ fontSize: 16 }} />,
      maintenance: <BuildIcon sx={{ fontSize: 16 }} />,
      procurement: <ShoppingCartIcon sx={{ fontSize: 16 }} />,
      hse: <SecurityIcon sx={{ fontSize: 16 }} />,
      admin: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
      inventory: <InventoryIcon sx={{ fontSize: 16 }} />,
      sales: <AttachMoneyIcon sx={{ fontSize: 16 }} />,
      invoices: <ReceiptIcon sx={{ fontSize: 16 }} />,
      projects: <ProjectIcon sx={{ fontSize: 16 }} />,
      manual: <EditIcon sx={{ fontSize: 16 }} />,
      calculated: <AssessmentIcon sx={{ fontSize: 16 }} />
    };
    return icons[module] || <FolderIcon sx={{ fontSize: 16 }} />;
  };

  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      hr: theme.palette.info.main,
      assets: theme.palette.success.main,
      operations: theme.palette.warning.main,
      maintenance: theme.palette.error.main,
      procurement: theme.palette.secondary.main,
      hse: theme.palette.primary.main,
      admin: '#9c27b0',
      inventory: '#ff9800',
      sales: '#4caf50',
      invoices: '#2196f3',
      projects: '#00bcd4',
      manual: '#e91e63',
      calculated: '#607d8b'
    };
    return colors[module] || theme.palette.grey[500];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        No P&L data available. Please select a period and generate the report.
      </Alert>
    );
  }

  const summary = data.summary || {};
  const breakdown = data.breakdown || {};

  return (
    <Box>
      {/* Key Financial Metrics */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
        Key Financial Metrics
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        {/* Revenue Card */}
        <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #4caf50' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              Total Revenue
            </Typography>
            <Typography variant="h4" color="success.main">
              KD {summary.revenue?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              From Sales & Services
            </Typography>
          </CardContent>
        </Card>

        {/* Cost of Sales Card */}
        <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #f44336' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              Cost of Sales
            </Typography>
            <Typography variant="h4" color="error.main">
              KD {summary.costOfSales?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Direct Operational Costs
            </Typography>
          </CardContent>
        </Card>

        {/* Gross Profit Card */}
        <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #2196f3' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              Gross Profit
            </Typography>
            <Typography variant="h4" color="info.main">
              KD {summary.grossProfit?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Margin: {summary.grossMargin || '0%'}
            </Typography>
          </CardContent>
        </Card>

        {/* Operating Profit Card */}
        <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #9c27b0' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              Operating Profit
            </Typography>
            <Typography variant="h4" color="secondary.main">
              KD {summary.operatingProfit?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Margin: {summary.operatingMargin || '0%'}
            </Typography>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card sx={{ flex: '1 1 200px', minWidth: 200, borderLeft: '4px solid #3f51b5' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              Net Profit
            </Typography>
            <Typography variant="h4" color="primary.main">
              KD {summary.profitForPeriod?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Margin: {summary.netMargin || '0%'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Enhanced Cost Breakdown by Module */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
        💼 Cost Breakdown by Module
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={2}>
        {/* Module Cost Cards */}
        {breakdown?.moduleContributions && Object.entries(breakdown.moduleContributions).map(([module, moduleData]: [string, any]) => {
          if (!moduleData?.costs) return null;
          
          const totalModuleCost = Object.values(moduleData.costs as any).reduce((sum: number, cost: any) => {
            return sum + (typeof cost === 'number' ? cost : 0);
          }, 0);

          if (totalModuleCost === 0) return null;

          return (
            <Card 
              key={module} 
              sx={{ 
                flex: '1 1 280px', 
                minWidth: 280,
                borderLeft: `4px solid ${getModuleColor(module)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8]
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getModuleColor(module),
                    fontSize: '14px'
                  }}>
                    {getModuleIcon(module)}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" color={getModuleColor(module)}>
                    {module.toUpperCase()} Module
                  </Typography>
                </Box>
                
                <Typography variant="h5" fontWeight="bold" color="text.primary" mb={2}>
                  KD {totalModuleCost.toLocaleString()}
                </Typography>
                
                <Box>
                  {Object.entries(moduleData.costs).map(([costType, amount]: [string, any]) => {
                    if (typeof amount !== 'number' || amount === 0) return null;
                    
                    return (
                      <Box key={costType} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          {costType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          KD {amount.toLocaleString()}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    % of Total Costs
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color={getModuleColor(module)}>
                    {summary?.operatingExpenses > 0 ? 
                      ((totalModuleCost / summary.operatingExpenses) * 100).toFixed(1) : '0'
                    }%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {/* Revenue Sources Card */}
        <Card sx={{ 
          flex: '1 1 280px', 
          minWidth: 280,
          borderLeft: `4px solid ${theme.palette.success.main}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8]
          },
          transition: 'all 0.3s ease'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette.success.main
              }}>
                💰
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                REVENUE Sources
              </Typography>
            </Box>
            
            <Typography variant="h5" fontWeight="bold" color="success.main" mb={2}>
              KD {summary?.revenue?.toLocaleString() || '0'}
            </Typography>
            
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Sales & Services:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  KD {(summary?.revenue * 0.7)?.toLocaleString() || '0'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Rental Equipment:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  KD {(summary?.revenue * 0.2)?.toLocaleString() || '0'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Other Revenue:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  KD {(summary?.revenue * 0.1)?.toLocaleString() || '0'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Revenue Growth
              </Typography>
              <Chip 
                label="+5.2%" 
                size="small" 
                color="success" 
                icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Module Integration Status */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.info.main }}>
          🔗 Module Integration Status
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {['hr', 'assets', 'operations', 'maintenance', 'procurement', 'hse', 'admin', 'inventory', 'sales', 'invoices'].map((module) => {
            const hasData = breakdown?.moduleContributions?.[module]?.costs && 
                           Object.values(breakdown.moduleContributions[module].costs as any).some((cost: any) => cost > 0);
            
            return (
              <Chip
                key={module}
                label={module.toUpperCase()}
                color={hasData ? 'success' : 'default'}
                variant={hasData ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: hasData ? alpha(getModuleColor(module), 0.1) : undefined,
                  borderColor: hasData ? getModuleColor(module) : undefined,
                  color: hasData ? getModuleColor(module) : undefined,
                  fontWeight: hasData ? 'bold' : 'normal'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Financial Metrics from PnL Table Data */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, color: theme.palette.primary.main }}>
        Financial Performance Metrics
      </Typography>
      
      <FinancialMetricsContainers data={data} />
    </Box>
  );
};

// Enhanced P&L Table Component with Vertical Structure and Module Links
const PnLTable: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Get module icon and color
  const getModuleIcon = (module: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      hr: <PersonIcon sx={{ fontSize: 16 }} />,
      assets: <BusinessIcon sx={{ fontSize: 16 }} />,
      operations: <LocalShippingIcon sx={{ fontSize: 16 }} />,
      maintenance: <BuildIcon sx={{ fontSize: 16 }} />,
      procurement: <ShoppingCartIcon sx={{ fontSize: 16 }} />,
      hse: <SecurityIcon sx={{ fontSize: 16 }} />,
      admin: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
      inventory: <InventoryIcon sx={{ fontSize: 16 }} />,
      sales: <AttachMoneyIcon sx={{ fontSize: 16 }} />,
      invoices: <ReceiptIcon sx={{ fontSize: 16 }} />,
      manual: <EditIcon sx={{ fontSize: 16 }} />,
      calculated: <AssessmentIcon sx={{ fontSize: 16 }} />
    };
    return icons[module] || <FolderIcon sx={{ fontSize: 16 }} />;
  };

  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      hr: theme.palette.info.main,
      assets: theme.palette.success.main,
      operations: theme.palette.warning.main,
      maintenance: theme.palette.error.main,
      procurement: theme.palette.secondary.main,
      hse: theme.palette.primary.main,
      admin: '#9c27b0',
      inventory: '#ff9800',
      sales: '#4caf50',
      invoices: '#2196f3',
      manual: '#e91e63',
      calculated: '#607d8b'
    };
    return colors[module] || theme.palette.grey[500];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Backend Connection Issue:</strong> Cannot connect to server. Showing P&L structure template.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The system will automatically aggregate costs from the following modules when connected:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {['HR', 'Assets', 'Operations', 'Maintenance', 'Procurement', 'HSE', 'Admin', 'Inventory'].map((module) => (
              <Chip 
                key={module}
                label={module}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Alert>

        {/* Show P&L Structure Template */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
          📊 Vertical Profit & Loss Statement Structure
        </Typography>
        
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '& .MuiTableCell-root': {
                  background: 'transparent'
                }
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="right">
                  Amount (KD)
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="center">
                  Source Module
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Revenue Section */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                <TableCell colSpan={3}>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    💰 REVENUE
                  </Typography>
                </TableCell>
              </TableRow>
              {[
                'Rental Equipment Cost',
                'DS Revenue',
                'Sub Companies Revenue',
                'Other Revenue',
                'Provision End Service',
                'Provision Impairment'
              ].map((item, index) => (
                <TableRow key={`revenue-${index}`} sx={{ backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
                  <TableCell sx={{ pl: 4 }}>{item}</TableCell>
                  <TableCell align="right">KD 0</TableCell>
                  <TableCell align="center">
                    <Chip label="PENDING" size="small" color="warning" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}

              {/* Expenses Section */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                <TableCell colSpan={3}>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    💸 EXPENSES
                  </Typography>
                </TableCell>
              </TableRow>
              {[
                'Operation Cost',
                'Cost of Rental Equipment',
                'DS Cost',
                'General Admin Expenses',
                'Staff Costs',
                'Business Trip Expenses',
                'Overtime Expenses',
                'Trip Allowance Expenses',
                'Food Allowance Expenses',
                'HSE & Training Expenses',
                'Inventory & Material Costs',
                'Legal & Compliance Costs',
                'Facility & Infrastructure Costs',
                'Provision Credit Loss',
                'Service Agreement Cost'
              ].map((item, index) => (
                <TableRow key={`expense-${index}`} sx={{ backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
                  <TableCell sx={{ pl: 4 }}>{item}</TableCell>
                  <TableCell align="right">KD 0</TableCell>
                  <TableCell align="center">
                    <Chip label="PENDING" size="small" color="warning" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}

              {/* Other Items Section */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                <TableCell colSpan={3}>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    📊 INCOME, EXPENSES AND OTHER ITEMS
                  </Typography>
                </TableCell>
              </TableRow>
              {[
                'Gain Selling Products',
                'EBITDA',
                'Finance Costs',
                'Depreciation'
              ].map((item, index) => (
                <TableRow key={`other-${index}`} sx={{ backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
                  <TableCell sx={{ pl: 4 }}>{item}</TableCell>
                  <TableCell align="right">KD 0</TableCell>
                  <TableCell align="center">
                    <Chip label="PENDING" size="small" color="warning" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Next Steps:</strong> Start your backend server to see live data from all modules.
            Once connected, this table will automatically populate with real costs from your system.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const totalRevenue = data.find(section => section.type === 'revenue')?.subtotal || 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
        📊 Vertical Profit & Loss Statement
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This P&L statement automatically consolidates costs from all system modules. 
          Click on section headers to expand and see detailed breakdowns by module.
        </Typography>
      </Alert>
      
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '& .MuiTableCell-root': {
                background: 'transparent'
              }
            }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                Description
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="right">
                Amount (KD)
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="right">
                % of Revenue
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="center">
                Source Module
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((section, sectionIndex) => (
              <React.Fragment key={section.id || `section-${sectionIndex}`}>
                {/* Section Header */}
                <TableRow sx={{ 
                  backgroundColor: section.type === 'revenue' ? alpha(theme.palette.success.main, 0.1) :
                                 section.type === 'expenses' ? alpha(theme.palette.error.main, 0.1) :
                                 alpha(theme.palette.info.main, 0.1),
                  '&:hover': {
                    backgroundColor: section.type === 'revenue' ? alpha(theme.palette.success.main, 0.15) :
                                   section.type === 'expenses' ? alpha(theme.palette.error.main, 0.15) :
                                   alpha(theme.palette.info.main, 0.15)
                  }
                }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: section.type === 'revenue' ? theme.palette.success.main :
                                  section.type === 'expenses' ? theme.palette.error.main :
                                  theme.palette.info.main
                        }}>
                          {section.type === 'revenue' ? '💰' : 
                           section.type === 'expenses' ? '💸' : '📊'}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {section.category}
                        </Typography>
                      </Box>
                      {section.items && section.items.length > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => toggleSection(section.id)}
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2)
                            }
                          }}
                        >
                          {expandedSections.has(section.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      KD {section.subtotal?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      {totalRevenue > 0 ? ((Math.abs(section.subtotal || 0) / totalRevenue) * 100).toFixed(1) + '%' : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${section.items?.length || 0} Sources`}
                      color={section.type === 'revenue' ? 'success' : 
                             section.type === 'expenses' ? 'error' : 'info'}
                      size="medium"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>

                {/* Section Items (if expandable) */}
                {section.items && section.items.length > 0 && expandedSections.has(section.id) && (
                  section.items.map((item: any, itemIndex: number) => (
                    <React.Fragment key={item.id || `item-${sectionIndex}-${itemIndex}`}>
                      {/* Main Item Row */}
                      <TableRow 
                        sx={{ 
                          backgroundColor: alpha(theme.palette.grey[50], 0.5),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.grey[100], 0.8)
                        }
                      }}
                    >
                      <TableCell sx={{ pl: 6 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          {/* Expand/Collapse Button for items with sub-items */}
                          {item.subItems && item.subItems.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => toggleItem(item.id)}
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2)
                                }
                              }}
                            >
                              {expandedItems.has(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                          <Avatar sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: getModuleColor(item.module),
                            fontSize: '12px'
                          }}>
                            {getModuleIcon(item.module)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.description}
                              {item.isParent && (
                                <Chip 
                                  label="Parent" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ ml: 1, fontSize: '10px', height: '20px' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Source: {item.module.toUpperCase()} Module
                              {item.subItems && item.subItems.length > 0 && (
                                <span> • {item.subItems.length} sub-items</span>
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1" 
                          fontWeight="medium"
                          color={item.type === 'revenue' ? 'success.main' : 
                                 item.type === 'expense' ? 'error.main' : 'text.primary'}
                        >
                          KD {item.amount?.toLocaleString() || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {totalRevenue > 0 ? 
                            ((Math.abs(item.amount || 0) / totalRevenue) * 100).toFixed(2) + '%' : 
                            '0%'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                          <Chip 
                            label={item.module.toUpperCase()}
                            size="small" 
                            sx={{
                              backgroundColor: alpha(getModuleColor(item.module), 0.1),
                              color: getModuleColor(item.module),
                              border: `1px solid ${alpha(getModuleColor(item.module), 0.3)}`,
                              fontWeight: 'bold'
                            }}
                          />
                          {item.type === 'revenue' && <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />}
                          {item.type === 'expense' && <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />}
                          {item.type === 'calculated' && <AssessmentIcon color="info" sx={{ fontSize: 16 }} />}
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Sub-items (if expandable) */}
                    {item.subItems && item.subItems.length > 0 && expandedItems.has(item.id) && (
                      item.subItems.map((subItem: any, subIndex: number) => (
                        <TableRow 
                          key={`sub-${item.id}-${subIndex}`}
                          sx={{ 
                            backgroundColor: alpha(theme.palette.grey[50], 0.3),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.grey[100], 0.5)
                            }
                          }}
                        >
                          <TableCell sx={{ pl: 10 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ 
                                width: 20, 
                                height: 20, 
                                bgcolor: getModuleColor(subItem.module),
                                fontSize: '10px'
                              }}>
                                {getModuleIcon(subItem.module)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="normal" color="text.secondary">
                                  {subItem.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Source: {subItem.module.toUpperCase()} Module
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              fontWeight="normal"
                              color="text.secondary"
                            >
                              KD {subItem.amount?.toLocaleString() || '0'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="text.secondary">
                              {totalRevenue > 0 ? 
                                ((Math.abs(subItem.amount || 0) / totalRevenue) * 100).toFixed(2) + '%' : 
                                '0%'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={subItem.module.toUpperCase()}
                              size="small" 
                              variant="outlined"
                              sx={{
                                backgroundColor: alpha(getModuleColor(subItem.module), 0.05),
                                color: getModuleColor(subItem.module),
                                border: `1px solid ${alpha(getModuleColor(subItem.module), 0.2)}`,
                                fontSize: '10px',
                                height: '20px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    </React.Fragment>
                  ))
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Cards */}
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        {data.map((section) => (
          <Card 
            key={section.id}
            elevation={2}
            sx={{
              borderLeft: `4px solid ${
                section.type === 'revenue' ? theme.palette.success.main :
                section.type === 'expenses' ? theme.palette.error.main :
                theme.palette.info.main
              }`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8]
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {section.category}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={
                section.type === 'revenue' ? 'success.main' :
                section.type === 'expenses' ? 'error.main' :
                section.subtotal >= 0 ? 'success.main' : 'error.main'
              }>
                KD {section.subtotal?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.items?.length || 0} line items
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

// P&L Charts Component
const PnLCharts: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        No chart data available. Please select a period and generate the report.
      </Alert>
    );
  }

  const { netProfitOverTime, revenueVsExpense, marginTrend } = data;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Financial Performance Charts
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={4}>
        {/* Net Profit Over Time */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Net Profit Trend Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={netProfitOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => [`KD ${value}`, 'Net Profit']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  name="Net Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Expense vs Net Profit */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Revenue vs Expense vs Net Profit
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={revenueVsExpense || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => [`KD ${value}`, 'Amount']} />
                <Legend />
                <Bar dataKey="revenue" fill={theme.palette.success.main} name="Revenue" />
                <Bar dataKey="expenses" fill={theme.palette.error.main} name="Expenses" />
                <Bar dataKey="netProfit" fill={theme.palette.primary.main} name="Net Profit" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Margin Trend */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Margin Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={marginTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => [`${value}%`, 'Margin']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="grossMargin" 
                  stackId="1" 
                  stroke={theme.palette.success.main} 
                  fill={theme.palette.success.light} 
                  name="Gross Margin"
                />
                <Area 
                  type="monotone" 
                  dataKey="netMargin" 
                  stackId="1" 
                  stroke={theme.palette.primary.main} 
                  fill={theme.palette.primary.light} 
                  name="Net Margin"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};


// Manual PnL Entry Management Component
const ManualPnLEntries: React.FC = () => {
  const theme = useTheme();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ amount: '', notes: '' });
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  // Specific manual entry items that need input boxes
  const [manualValues, setManualValues] = useState({
    gainSellingProducts: 0,
    provisionCreditLoss: 0,
    provisionImpairment: 0,
    provisionEndService: 0,
    rentalEquipmentCost: 0,
    serviceAgreementCost: 0,
    rebate: 0,
    subCompaniesRevenue: 0,
    otherRevenue: 0,
    dsRevenue: 0,
    dsCost: 0,
    generalAdminExpenses: 0,
    financeCosts: 0
  });

  useEffect(() => {
    fetchManualEntries();
  }, []);

  const fetchManualEntries = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      console.log('=== FETCHING MANUAL ENTRIES ===');
      console.log('API base URL:', api.defaults.baseURL);
      console.log('Full URL:', `${api.defaults.baseURL}/pnl/manual-entries`);
      
      const res = await api.get('/pnl/manual-entries');
      console.log('Manual entries response status:', res.status);
      console.log('Manual entries response data:', res.data);
      console.log('Manual entries response data length:', Array.isArray(res.data) ? res.data.length : 'Not an array');
      
      // Validate response data
      if (!res.data || !Array.isArray(res.data)) {
        console.error('Invalid response data format:', res.data);
        setError('Invalid response format from server');
        setEntries([]);
        return;
      }
      
      if (res.data.length === 0) {
        console.warn('No manual entries returned from server');
        setError('No manual entries found. Please check server configuration.');
        setEntries([]);
        return;
      }
      
      console.log('Setting entries to:', res.data);
      setEntries(res.data as any[]);
      
      // Extract specific manual entry values
      const specificEntries = res.data as any[];
      const newManualValues = { ...manualValues };
      
      specificEntries.forEach(entry => {
        if (entry.itemId === 'gain_selling_products') {
          newManualValues.gainSellingProducts = entry.amount || 0;
        } else if (entry.itemId === 'provision_credit_loss') {
          newManualValues.provisionCreditLoss = entry.amount || 0;
        } else if (entry.itemId === 'provision_impairment') {
          newManualValues.provisionImpairment = entry.amount || 0;
        } else if (entry.itemId === 'provision_end_service') {
          newManualValues.provisionEndService = entry.amount || 0;
        } else if (entry.itemId === 'rental_equipment_cost') {
          newManualValues.rentalEquipmentCost = entry.amount || 0;
        } else if (entry.itemId === 'service_agreement_cost') {
          newManualValues.serviceAgreementCost = entry.amount || 0;
        } else if (entry.itemId === 'rebate') {
          newManualValues.rebate = entry.amount || 0;
        } else if (entry.itemId === 'sub_companies_revenue') {
          newManualValues.subCompaniesRevenue = entry.amount || 0;
        } else if (entry.itemId === 'other_revenue') {
          newManualValues.otherRevenue = entry.amount || 0;
        } else if (entry.itemId === 'ds_revenue') {
          newManualValues.dsRevenue = entry.amount || 0;
        } else if (entry.itemId === 'ds_cost') {
          newManualValues.dsCost = entry.amount || 0;
        } else if (entry.itemId === 'general_admin_expenses') {
          newManualValues.generalAdminExpenses = entry.amount || 0;
        } else if (entry.itemId === 'finance_costs') {
          newManualValues.financeCosts = entry.amount || 0;
        }
      });
      
      setManualValues(newManualValues);
    } catch (err: any) {
      console.error('=== ERROR FETCHING MANUAL ENTRIES ===');
      console.error('Error details:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Network error:', err.code);
      
      let errorMessage = 'Failed to fetch manual entries';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        // Something else happened
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle local state change (immediate UI update)
  const handleManualValueChange = (field: string, value: number) => {
    setManualValues(prev => ({ ...prev, [field]: value }));
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (field: string, value: number) => {
      try {
        // Map frontend field names to backend item IDs
        const itemIdMap: { [key: string]: string } = {
          gainSellingProducts: 'gain_selling_products',
          provisionCreditLoss: 'provision_credit_loss',
          provisionImpairment: 'provision_impairment',
          provisionEndService: 'provision_end_service',
          rentalEquipmentCost: 'rental_equipment_cost',
          serviceAgreementCost: 'service_agreement_cost',
          rebate: 'rebate',
          subCompaniesRevenue: 'sub_companies_revenue',
          otherRevenue: 'other_revenue',
          dsRevenue: 'ds_revenue',
          dsCost: 'ds_cost',
          generalAdminExpenses: 'general_admin_expenses',
          financeCosts: 'finance_costs'
        };

        const itemId = itemIdMap[field];
        if (!itemId) return;

        await api.put(`/pnl/manual-entries/${itemId}`, {
          amount: value,
          notes: `Updated via frontend input - ${field}`
        });

        setSuccess(`${field} updated successfully!`);
        
        // Refresh the entries list
        fetchManualEntries();
        
        // Trigger a refresh of the PnL data to show updated calculations
        // This will update the summary card as well
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('pnlDataUpdated'));
        }, 100);
      } catch (err: any) {
        setError(err.response?.data?.message || `Failed to update ${field}`);
      }
    }, 1000), // 1 second delay
    []
  );

  // Save to backend (debounced)
  const saveManualValue = (field: string, value: number) => {
    debouncedSave(field, value);
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setEditForm({ amount: entry.amount.toString(), notes: entry.notes || '' });
    setEditModalOpen(true);
  };

  const handleSaveEntry = async () => {
    try {
      console.log('Updating manual entry:', editingEntry.itemId, 'with data:', {
        amount: Number(editForm.amount),
        notes: editForm.notes
      });
      
      const response = await api.put(`/pnl/manual-entries/${editingEntry.itemId}`, {
        amount: Number(editForm.amount),
        notes: editForm.notes
      });
      
      console.log('Update response:', response.data);
      setSuccess('Manual entry updated successfully!');
      setEditModalOpen(false);
      setEditingEntry(null);
      setEditForm({ amount: '', notes: '' });
      fetchManualEntries();
    } catch (err: any) {
      console.error('Error updating manual entry:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to update manual entry');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, entry: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(entry.itemId);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entryId', entry.itemId);
      formData.append('description', entry.description);

      const response = await api.post('/pnl/manual-entries/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`File uploaded successfully for ${entry.description}!`);
      fetchManualEntries(); // Refresh to get updated file info
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(null);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDownloadFiles = async (entry: any) => {
    if (!entry.attachedFiles || entry.attachedFiles.length === 0) {
      setError('No files available for download');
      return;
    }

    try {
      for (const file of entry.attachedFiles) {
        const response = await api.get(`/pnl/manual-entries/download/${file.id}`, {
          responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(response.data as any);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.originalName || file.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      setSuccess(`Downloaded ${entry.attachedFiles.length} file(s) for ${entry.description}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download files');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Helper function to capitalize first letter of every word
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <EditIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Manual P&L Entry Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Configure manual entries for P&L items not automatically calculated
                </Typography>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          These entries allow you to manually input values for P&L items that are not automatically calculated from the system.
        </Alert>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Quick Entry:</strong> Use the input boxes below to quickly update the key manual entries. 
            Changes are saved automatically and will be reflected in your P&L calculations immediately.
          </Typography>
        </Alert>
      </motion.div>

      {/* Specific Manual Entry Input Boxes */}
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
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
            🔧 Key Manual Entries
          </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Gain Selling Products (KD)"
              type="number"
              value={manualValues.gainSellingProducts}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('gainSellingProducts', value);
                saveManualValue('gainSellingProducts', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for gains"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Provision Credit Loss (KD)"
              type="number"
              value={manualValues.provisionCreditLoss}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('provisionCreditLoss', value);
                saveManualValue('provisionCreditLoss', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for provisions (will be subtracted)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Provision Impairment (KD)"
              type="number"
              value={manualValues.provisionImpairment}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('provisionImpairment', value);
                saveManualValue('provisionImpairment', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for provisions no longer required"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Provision End Service (KD)"
              type="number"
              value={manualValues.provisionEndService}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('provisionEndService', value);
                saveManualValue('provisionEndService', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for provisions no longer required"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Rental Equipment Cost (KD)"
              type="number"
              value={manualValues.rentalEquipmentCost}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('rentalEquipmentCost', value);
                saveManualValue('rentalEquipmentCost', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for rental equipment costs (will be subtracted)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Service Agreement Cost (KD)"
              type="number"
              value={manualValues.serviceAgreementCost}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('serviceAgreementCost', value);
                saveManualValue('serviceAgreementCost', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for service agreement costs (will be subtracted)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Rebate (KD)"
              type="number"
              value={manualValues.rebate}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('rebate', value);
                saveManualValue('rebate', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for rebates (will be added to revenue)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Sub Companies Revenue (KD)"
              type="number"
              value={manualValues.subCompaniesRevenue}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('subCompaniesRevenue', value);
                saveManualValue('subCompaniesRevenue', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for sub companies revenue"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Other Revenue (KD)"
              type="number"
              value={manualValues.otherRevenue}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('otherRevenue', value);
                saveManualValue('otherRevenue', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for other revenue"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="DS Revenue (KD)"
              type="number"
              value={manualValues.dsRevenue}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('dsRevenue', value);
                saveManualValue('dsRevenue', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for DS revenue"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="DS Cost (KD)"
              type="number"
              value={manualValues.dsCost}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('dsCost', value);
                saveManualValue('dsCost', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for DS costs (will be subtracted)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="General Admin Expenses (KD)"
              type="number"
              value={manualValues.generalAdminExpenses}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('generalAdminExpenses', value);
                saveManualValue('generalAdminExpenses', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for general admin expenses (will be subtracted)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Finance Costs (KD)"
              type="number"
              value={manualValues.financeCosts}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handleManualValueChange('financeCosts', value);
                saveManualValue('financeCosts', value);
              }}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for finance costs (will be subtracted)"
            />
          </Box>
        </Box>
        
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
              📊 Calculation Impact:
            </Typography>
            <Typography variant="body2">
              • Gain Selling Products: <strong>+{manualValues.gainSellingProducts.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • Provision Credit Loss: <strong>-{manualValues.provisionCreditLoss.toLocaleString()} KD</strong> (subtracted from expenses)
            </Typography>
            <Typography variant="body2">
              • Provision Impairment: <strong>+{manualValues.provisionImpairment.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • Provision End Service: <strong>+{manualValues.provisionEndService.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • Cost of Rental Equipment: <strong>-{manualValues.rentalEquipmentCost.toLocaleString()} KD</strong> (subtracted from expenses)
            </Typography>
            <Typography variant="body2">
              • Cost of Service Agreement: <strong>-{manualValues.serviceAgreementCost.toLocaleString()} KD</strong> (subtracted from expenses)
            </Typography>
            <Typography variant="body2">
              • Rebate: <strong>+{manualValues.rebate.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • Sub Companies Revenue: <strong>+{manualValues.subCompaniesRevenue.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • Other Revenue: <strong>+{manualValues.otherRevenue.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • DS Revenue: <strong>+{manualValues.dsRevenue.toLocaleString()} KD</strong> (added to revenue)
            </Typography>
            <Typography variant="body2">
              • DS Cost: <strong>-{manualValues.dsCost.toLocaleString()} KD</strong> (subtracted from expenses)
            </Typography>
            <Typography variant="body2">
              • General Admin Expenses: <strong>-{manualValues.generalAdminExpenses.toLocaleString()} KD</strong> (subtracted from expenses)
            </Typography>
            <Typography variant="body2">
              • Finance Costs: <strong>-{manualValues.financeCosts.toLocaleString()} KD</strong> (subtracted from expenses)
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* All Manual Entries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
          📋 All Manual Entries
        </Typography>
        
        <TableContainer 
          component={Paper}
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '& .MuiTableCell-root': {
                  background: 'transparent'
                }
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="right">Current Amount (KD)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                console.log('Rendering table with entries:', entries.length, entries);
                console.log('Entries type:', typeof entries);
                console.log('Is array:', Array.isArray(entries));
                return null;
              })()}
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Loading manual entries...' : 'No manual entries found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry, index) => (
                <TableRow 
                  key={entry.itemId || `entry-${index}`}
                  sx={{ 
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {entry.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
                      {(() => {
                        console.log(`Entry ${entry.description}: amount =`, entry.amount, 'type =', typeof entry.amount);
                        return entry.amount?.toLocaleString() || '0';
                      })()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditEntry(entry)}
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            color: theme.palette.primary.dark,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        component="label"
                        disabled={uploadingFile === entry.itemId}
                        sx={{
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            color: theme.palette.secondary.dark,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                          }
                        }}
                      >
                        {uploadingFile === entry.itemId ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, entry)}
                        />
                      </Button>
                      {entry.attachedFiles && entry.attachedFiles.length > 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDownloadFiles(entry)}
                          sx={{
                            borderColor: theme.palette.success.main,
                            color: theme.palette.success.main,
                            '&:hover': {
                              borderColor: theme.palette.success.dark,
                              color: theme.palette.success.dark,
                              backgroundColor: alpha(theme.palette.success.main, 0.1)
                            }
                          }}
                        >
                          Download ({entry.attachedFiles.length})
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Edit Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          color: theme.palette.primary.main,
          fontWeight: 600
        }}>
          Edit Manual Entry
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.text.secondary }}>
              {editingEntry?.description}
            </Typography>
            <TextField
              label="Amount (KD)"
              type="number"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Notes"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditModalOpen(false)}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEntry} 
            variant="contained" 
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

// Manual PnL Entry Summary Card Component
const ManualEntrySummaryCard: React.FC<{ onNavigateToManualEntries: () => void; currentTab: number }> = ({ onNavigateToManualEntries, currentTab }) => {
  const [manualValues, setManualValues] = useState({
    gainSellingProducts: 0,
    provisionCreditLoss: 0,
    provisionImpairment: 0,
    provisionEndService: 0,
    rentalEquipmentCost: 0,
    serviceAgreementCost: 0,
    rebate: 0,
    subCompaniesRevenue: 0,
    otherRevenue: 0,
    dsRevenue: 0,
    dsCost: 0,
    generalAdminExpenses: 0,
    financeCosts: 0
  });

  const theme = useTheme();

  useEffect(() => {
    fetchManualValues();
    
    // Listen for PnL data updates
    const handlePnLUpdate = () => {
      fetchManualValues();
    };
    
    window.addEventListener('pnlDataUpdated', handlePnLUpdate);
    
    return () => {
      window.removeEventListener('pnlDataUpdated', handlePnLUpdate);
    };
  }, []);

  const fetchManualValues = async () => {
    try {
      const res = await api.get('/pnl/manual-entries');
      const entries = res.data as any[];
      
      const newManualValues = { ...manualValues };
      entries.forEach(entry => {
        if (entry.itemId === 'gain_selling_products') {
          newManualValues.gainSellingProducts = entry.amount || 0;
        } else if (entry.itemId === 'provision_credit_loss') {
          newManualValues.provisionCreditLoss = entry.amount || 0;
        } else if (entry.itemId === 'provision_impairment') {
          newManualValues.provisionImpairment = entry.amount || 0;
        } else if (entry.itemId === 'provision_end_service') {
          newManualValues.provisionEndService = entry.amount || 0;
        } else if (entry.itemId === 'rental_equipment_cost') {
          newManualValues.rentalEquipmentCost = entry.amount || 0;
        } else if (entry.itemId === 'service_agreement_cost') {
          newManualValues.serviceAgreementCost = entry.amount || 0;
        } else if (entry.itemId === 'rebate') {
          newManualValues.rebate = entry.amount || 0;
        } else if (entry.itemId === 'sub_companies_revenue') {
          newManualValues.subCompaniesRevenue = entry.amount || 0;
        } else if (entry.itemId === 'other_revenue') {
          newManualValues.otherRevenue = entry.amount || 0;
        } else if (entry.itemId === 'ds_revenue') {
          newManualValues.dsRevenue = entry.amount || 0;
        } else if (entry.itemId === 'ds_cost') {
          newManualValues.dsCost = entry.amount || 0;
        } else if (entry.itemId === 'general_admin_expenses') {
          newManualValues.generalAdminExpenses = entry.amount || 0;
        } else if (entry.itemId === 'finance_costs') {
          newManualValues.financeCosts = entry.amount || 0;
        }
      });
      
      setManualValues(newManualValues);
    } catch (err) {
      console.error('Failed to fetch manual values:', err);
    }
  };

  const totalRevenueImpact = manualValues.gainSellingProducts + manualValues.provisionImpairment + manualValues.provisionEndService + 
                            manualValues.rebate + manualValues.subCompaniesRevenue + manualValues.otherRevenue + manualValues.dsRevenue;
  const totalExpenseImpact = -manualValues.provisionCreditLoss - manualValues.rentalEquipmentCost - manualValues.serviceAgreementCost - 
                            manualValues.dsCost - manualValues.generalAdminExpenses - manualValues.financeCosts;
  const netImpact = totalRevenueImpact + totalExpenseImpact;

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: theme.shape.borderRadius,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
          📊 Manual Entry Summary
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ 
            flex: '1 1 200px', 
            minWidth: 200, 
            textAlign: 'center',
            p: 2,
            background: alpha(theme.palette.success.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
          }}>
            <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
              +{totalRevenueImpact.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revenue Impact
            </Typography>
          </Box>
          <Box sx={{ 
            flex: '1 1 200px', 
            minWidth: 200, 
            textAlign: 'center',
            p: 2,
            background: alpha(theme.palette.error.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
          }}>
            <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
              {totalExpenseImpact.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expense Impact
            </Typography>
          </Box>
          <Box sx={{ 
            flex: '1 1 200px', 
            minWidth: 200, 
            textAlign: 'center',
            p: 2,
            background: alpha(theme.palette.info.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
          }}>
            <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
              {netImpact >= 0 ? '+' : ''}{netImpact.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Net Impact
            </Typography>
          </Box>
          <Box sx={{ 
            flex: '1 1 200px', 
            minWidth: 200, 
            textAlign: 'center',
            p: 2
          }}>
            <Button 
              variant="contained" 
              color={currentTab === 3 ? "secondary" : "primary"}
              onClick={onNavigateToManualEntries}
              sx={{ 
                minWidth: 140,
                background: currentTab === 3 
                  ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              {currentTab === 3 ? 'Manual Entries Active' : 'Manage Entries'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main P&L Page Component
const PnLPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('yearly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  
  // Data states
  const [summaryData, setSummaryData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [chartsData, setChartsData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Enhanced PnL Integration
  const { 
    pnlData: integrationData, 
    loading: integrationLoading, 
    error: integrationError, 
    refreshPnLData, 
    notifyDataChange 
  } = usePnLIntegration('pnl');

  // Enhanced P&L data fetching with real-time integration
  const fetchPnLData = async () => {
    console.log('fetchPnLData called with:', { period, startDate, endDate });
    setLoading(true);
    setError('');
    
    try {
      // Use the integration service for enhanced data fetching
      console.log('Calling refreshPnLData...');
      await refreshPnLData(period, startDate, endDate);
      console.log('refreshPnLData completed');
      
      // The integrationData will be updated by the hook, so we'll handle it in useEffect
    } catch (err: any) {
      console.error('Error fetching P&L data:', err);
      setError(err.response?.data?.message || integrationError || 'Failed to fetch P&L data');
    } finally {
      setLoading(false);
    }
  };

  // Handle period-specific filtering (Q1, Q2, etc.)
  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod);
    
    // Calculate period boundaries for specific quarters
    const boundaries = getPeriodBoundaries(newPeriod, startDate, endDate);
    
    // Update date fields if it's a specific quarter
    if (newPeriod.startsWith('q')) {
      setStartDate(boundaries.start.toISOString().split('T')[0]);
      setEndDate(boundaries.end.toISOString().split('T')[0]);
    }
    
    // Fetch data for the new period
    await refreshPnLData(newPeriod, 
      boundaries.start.toISOString().split('T')[0], 
      boundaries.end.toISOString().split('T')[0]
    );
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToManualEntries = () => {
    console.log('Navigating to Manual Entries tab...');
    setActiveTab(3); // Switch to the Manual Entries tab
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Show success message
    setSuccess('Navigated to Manual Entries tab');
    console.log('Active tab set to:', 3);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // Export logic here
    console.log(`Exporting as ${format}`);
  };

  // Load initial data and set up real-time updates
  useEffect(() => {
    console.log('PnL Page: Initial load starting...');
    fetchPnLData();
    
    // Listen for real-time updates from Cost Analysis Dashboards
    const handleRealTimeUpdate = (event: any) => {
      const { module, action, data } = event.detail;
      console.log(`Real-time P&L update from ${module}:`, action, data);
      
      // Show notification
      setSuccess(`P&L data updated from ${module} module`);
      
      // Refresh P&L data
      setTimeout(() => {
        fetchPnLData();
      }, 1000);
    };

    window.addEventListener('pnlRefreshNeeded', handleRealTimeUpdate);
    
    return () => {
      window.removeEventListener('pnlRefreshNeeded', handleRealTimeUpdate);
    };
  }, []);

  // Update integration data when it changes
  useEffect(() => {
    console.log('PnL Integration Data Update:', { integrationData, integrationLoading, error: integrationError });
    if (integrationData && !integrationLoading) {
      console.log('Setting PnL data from integration:', integrationData);
      console.log('Table data structure:', integrationData.table);
      console.log('Summary data structure:', integrationData.summary);
      setSummaryData(integrationData.summary);
      setTableData(integrationData.table);
      setChartsData(integrationData.charts);
      setAnalysisData(integrationData.analysis);
    }
  }, [integrationData, integrationLoading]);

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
                      Profit & Loss Statement
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      IFRS-compliant financial performance analysis with automatic consolidation from all system modules
                    </Typography>
                  </Box>
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

        {/* Manual Entry Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ManualEntrySummaryCard onNavigateToManualEntries={handleNavigateToManualEntries} currentTab={activeTab} />
        </motion.div>
      
        {/* Period Selection and Controls */}
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
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📊 Report Configuration
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    label="Period"
                    size="small"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="q1">Q1 (Jan-Mar)</MenuItem>
                    <MenuItem value="q2">Q2 (Apr-Jun)</MenuItem>
                    <MenuItem value="q3">Q3 (Jul-Sep)</MenuItem>
                    <MenuItem value="q4">Q4 (Oct-Dec)</MenuItem>
                    <MenuItem value="quarterly">Current Quarter</MenuItem>
                    <MenuItem value="half_yearly">Half Yearly</MenuItem>
                    <MenuItem value="yearly">Financial Year</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Button
                  variant="contained"
                  onClick={fetchPnLData}
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                </Button>
              </Box>
            </Box>
            
            {/* Export Controls */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('excel')}
                sx={{ 
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  '&:hover': {
                    borderColor: theme.palette.success.dark,
                    color: theme.palette.success.dark,
                  }
                }}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('pdf')}
                sx={{ 
                  borderColor: theme.palette.info.main,
                  color: theme.palette.info.main,
                  '&:hover': {
                    borderColor: theme.palette.info.dark,
                    color: theme.palette.info.dark,
                  }
                }}
              >
                Export PDF
              </Button>
            </Box>
          </Paper>
        </motion.div>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
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
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
              <Tab label="Summary" />
              <Tab label="P&L Table" />
              <Tab label="Charts" />
              <Tab 
                label="Manual Entries" 
                sx={{ 
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box>
            {activeTab === 0 && (
              <PnLSummaryCards data={summaryData} loading={loading} />
            )}
            
            {activeTab === 1 && (
              <PnLTable data={tableData} loading={loading} />
            )}
            
            {activeTab === 2 && (
              <PnLCharts data={chartsData} loading={loading} />
            )}

            {activeTab === 3 && (
              <ManualEntriesPage />
            )}
          </Box>
        </motion.div>
      </AnimatePresence>

        {/* IFRS Compliance Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mt: 4, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              🏛️ IFRS Compliance & Data Sources
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This Profit & Loss Statement automatically consolidates financial data from all system modules 
              and presents it in accordance with International Financial Reporting Standards (IAS 1).
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mt: 3 }}>
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 1 }}>
                  Revenue Sources
                </Typography>
                <Typography variant="body2" color="text.secondary">• Sales & Service Invoices</Typography>
                <Typography variant="body2" color="text.secondary">• Contract Revenue</Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.error.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.error.main, fontWeight: 600, mb: 1 }}>
                  Cost of Sales
                </Typography>
                <Typography variant="body2" color="text.secondary">• Fuel & Vehicle Operations</Typography>
                <Typography variant="body2" color="text.secondary">• Procurement & Materials</Typography>
                <Typography variant="body2" color="text.secondary">• Operational Asset Depreciation</Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.warning.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.warning.main, fontWeight: 600, mb: 1 }}>
                  Operating Expenses
                </Typography>
                <Typography variant="body2" color="text.secondary">• HR: Salaries, Benefits, Training</Typography>
                <Typography variant="body2" color="text.secondary">• Maintenance & Repairs</Typography>
                <Typography variant="body2" color="text.secondary">• HSE & Safety Equipment</Typography>
                <Typography variant="body2" color="text.secondary">• Administrative Costs</Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default PnLPage; 