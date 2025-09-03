import React, { useState, useEffect } from 'react';
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
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon
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
    default: return '#757575';
  }
};

// P&L Summary Cards Component
const PnLSummaryCards: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
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

      {/* Cost Breakdown */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
        Cost Breakdown by Module
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={2}>
        {/* Cost of Sales Breakdown */}
        <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom color="error.main">
              Cost of Sales
            </Typography>
            <Box>
              <Typography variant="body2">
                Fuel & Vehicle: KD {breakdown.costOfSales?.fuel?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2">
                Procurement: KD {breakdown.costOfSales?.procurement?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2">
                Depreciation: KD {breakdown.costOfSales?.depreciation?.toLocaleString() || '0'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Operating Expenses Breakdown */}
        <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom color="warning.main">
              Operating Expenses
            </Typography>
            <Box>
              <Typography variant="body2">
                Staff Costs: KD {breakdown.operatingExpenses?.staff?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2">
                Maintenance: KD {breakdown.operatingExpenses?.maintenance?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2">
                HSE: KD {breakdown.operatingExpenses?.hse?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2">
                Training: KD {breakdown.operatingExpenses?.training?.toLocaleString() || '0'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// P&L Table Component with Vertical Structure - Updated for new categories
const PnLTable: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
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
      <Alert severity="info">
        No P&L table data available. Please select a period and generate the report.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Vertical Profit & Loss Statement
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Amount (KD)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">% of Revenue</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((section) => (
              <React.Fragment key={section.id}>
                {/* Section Header */}
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {section.category}
                      </Typography>
                      {section.items && section.items.length > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => toggleSection(section.id)}
                        >
                          {expandedSections.has(section.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {section.subtotal?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {section.type === 'summary' ? '-' : '100%'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {section.type === 'summary' ? (
                      <Chip 
                        label={section.subtotal >= 0 ? 'Profit' : 'Loss'} 
                        color={section.subtotal >= 0 ? 'success' : 'error'} 
                        size="small" 
                      />
                    ) : (
                      <Chip label="Section" color="primary" size="small" />
                    )}
                  </TableCell>
                </TableRow>

                {/* Section Items (if expandable) */}
                {section.items && section.items.length > 0 && expandedSections.has(section.id) && (
                  section.items.map((item: any) => (
                    <TableRow key={item.id} sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ pl: 4 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {item.description}
                          </Typography>
                          {item.expandable && (
                            <Chip 
                              label={item.module} 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          color={item.trend === 'up' ? 'success.main' : item.trend === 'down' ? 'error.main' : 'text.primary'}
                        >
                          {item.amount?.toLocaleString() || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {item.amount && data[0]?.subtotal ? 
                            ((item.amount / data[0].subtotal) * 100).toFixed(1) + '%' : 
                            '0%'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          {item.trend === 'up' && <TrendingUpIcon />}
                          {item.trend === 'down' && <TrendingDownIcon />}
                          {item.trend === 'neutral' && <TrendingFlatIcon />}
                          {item.expandable && (
                            <Chip 
                              label={item.type} 
                              size="small" 
                              color={item.type === 'revenue' ? 'success' : 'error'} 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

// P&L Analysis Component
const PnLAnalysis: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
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
        No analysis data available. Please select a period and generate the report.
      </Alert>
    );
  }

  const { alerts, trends, recommendations } = data;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Financial Analysis & Insights
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="warning.main">
                ⚠️ Financial Alerts
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {alerts.map((alert: any, index: number) => (
                  <Alert 
                    key={index} 
                    severity={alert.severity as any} 
                    sx={{ mb: 1 }}
                  >
                    {alert.message}
                  </Alert>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Trends */}
        {trends && trends.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="info.main">
                📈 Performance Trends
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {trends.map((trend: any, index: number) => (
                  <Box key={index} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2">{trend.description}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom color="success.main">
                💡 Strategic Recommendations
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {recommendations.map((rec: any, index: number) => (
                  <Box key={index} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2">{rec}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* IFRS Compliance Notice */}
        <Card sx={{ backgroundColor: 'primary.50' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom color="primary.main">
              📋 IFRS Compliance
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This P&L Statement follows IAS 1 (Presentation of Financial Statements) requirements. 
              All revenues and expenses are automatically consolidated from their respective system modules 
              and categorized according to IFRS standards.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Manual PnL Entry Management Component
const ManualPnLEntries: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ amount: '', notes: '' });

  // Specific manual entry items that need input boxes
  const [manualValues, setManualValues] = useState({
    gainSellingProducts: 0,
    provisionCreditLoss: 0,
    provisionImpairment: 0,
    provisionEndService: 0
  });

  useEffect(() => {
    fetchManualEntries();
  }, []);

  const fetchManualEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pnl/manual-entries');
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
        }
      });
      
      setManualValues(newManualValues);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch manual entries');
    } finally {
      setLoading(false);
    }
  };

  const handleManualValueChange = async (field: string, value: number) => {
    try {
      // Map frontend field names to backend item IDs
      const itemIdMap: { [key: string]: string } = {
        gainSellingProducts: 'gain_selling_products',
        provisionCreditLoss: 'provision_credit_loss',
        provisionImpairment: 'provision_impairment',
        provisionEndService: 'provision_end_service'
      };

      const itemId = itemIdMap[field];
      if (!itemId) return;

      await api.put(`/pnl/manual-entries/${itemId}`, {
        amount: value,
        notes: `Updated via frontend input - ${field}`
      });

      setManualValues(prev => ({ ...prev, [field]: value }));
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
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setEditForm({ amount: entry.amount.toString(), notes: entry.notes || '' });
    setEditModalOpen(true);
  };

  const handleSaveEntry = async () => {
    try {
      await api.put(`/pnl/manual-entries/${editingEntry.itemId}`, {
        amount: Number(editForm.amount),
        notes: editForm.notes
      });
      setSuccess('Manual entry updated successfully!');
      setEditModalOpen(false);
      setEditingEntry(null);
      setEditForm({ amount: '', notes: '' });
      fetchManualEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update manual entry');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Manual P&L Entry Management
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        These entries allow you to manually input values for P&L items that are not automatically calculated from the system.
      </Alert>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Quick Entry:</strong> Use the input boxes below to quickly update the key manual entries. 
          Changes are saved automatically and will be reflected in your P&L calculations immediately.
        </Typography>
      </Alert>

      {/* Specific Manual Entry Input Boxes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Key Manual Entries
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Gain from Selling Other Products (KD)"
              type="number"
              value={manualValues.gainSellingProducts}
              onChange={(e) => handleManualValueChange('gainSellingProducts', Number(e.target.value))}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for gains"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Provision for Expected Credit Loss (KD)"
              type="number"
              value={manualValues.provisionCreditLoss}
              onChange={(e) => handleManualValueChange('provisionCreditLoss', Number(e.target.value))}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>-</Typography>
              }}
              helperText="Enter positive value for provisions (will be subtracted)"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Provision for Impairment Loss No Longer Required (KD)"
              type="number"
              value={manualValues.provisionImpairment}
              onChange={(e) => handleManualValueChange('provisionImpairment', Number(e.target.value))}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for provisions no longer required"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <TextField
              label="Provision for End of Service Indemnity No Longer Required (KD)"
              type="number"
              value={manualValues.provisionEndService}
              onChange={(e) => handleManualValueChange('provisionEndService', Number(e.target.value))}
              fullWidth
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>+</Typography>
              }}
              helperText="Enter positive value for provisions no longer required"
            />
          </Box>
        </Box>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Calculation Impact:
          </Typography>
          <Typography variant="body2">
            • Gain from Selling Other Products: <strong>+{manualValues.gainSellingProducts.toLocaleString()} KD</strong> (added to revenue)
          </Typography>
          <Typography variant="body2">
            • Provision for Expected Credit Loss: <strong>-{manualValues.provisionCreditLoss.toLocaleString()} KD</strong> (subtracted from expenses)
          </Typography>
          <Typography variant="body2">
            • Provision for Impairment Loss No Longer Required: <strong>+{manualValues.provisionImpairment.toLocaleString()} KD</strong> (added to revenue)
          </Typography>
          <Typography variant="body2">
            • Provision for End of Service Indemnity No Longer Required: <strong>+{manualValues.provisionEndService.toLocaleString()} KD</strong> (added to revenue)
          </Typography>
        </Box>
      </Paper>

      {/* All Manual Entries Table */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        All Manual Entries
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Current Amount (KD)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.itemId}>
                <TableCell>
                  <Typography variant="body2">{entry.description}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {entry.amount?.toLocaleString() || '0'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEditEntry(entry)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Manual Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
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
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEntry} variant="contained" color="primary">
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
    provisionEndService: 0
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
        }
      });
      
      setManualValues(newManualValues);
    } catch (err) {
      console.error('Failed to fetch manual values:', err);
    }
  };

  const totalRevenueImpact = manualValues.gainSellingProducts + manualValues.provisionImpairment + manualValues.provisionEndService;
  const totalExpenseImpact = -manualValues.provisionCreditLoss;
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
              color={currentTab === 4 ? "secondary" : "primary"}
              onClick={onNavigateToManualEntries}
              sx={{ 
                minWidth: 140,
                background: currentTab === 4 
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
              {currentTab === 4 ? 'Manual Entries Active' : 'Manage Entries'}
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

  // Fetch P&L data
  const fetchPnLData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      params.append('period', period);
      
      const [summaryRes, tableRes, chartsRes, analysisRes] = await Promise.all([
        api.get(`/pnl/summary?${params.toString()}`),
        api.get(`/pnl/table?${params.toString()}`),
        api.get(`/pnl/charts?${params.toString()}`),
        api.get(`/pnl/analysis?${params.toString()}`)
      ]);
      
      setSummaryData(summaryRes.data);
      setTableData(Array.isArray(tableRes.data) ? tableRes.data : []);
      setChartsData(chartsRes.data);
      setAnalysisData(analysisRes.data);
    } catch (err: any) {
      console.error('Error fetching P&L data:', err);
      setError(err.response?.data?.message || 'Failed to fetch P&L data');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToManualEntries = () => {
    console.log('Navigating to Manual Entries tab...');
    setActiveTab(4); // Switch to the Manual Entries tab
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Show success message
    setSuccess('Navigated to Manual Entries tab');
    console.log('Active tab set to:', 4);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // Export logic here
    console.log(`Exporting as ${format}`);
  };

  // Load initial data
  useEffect(() => {
    fetchPnLData();
  }, []);

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
                    onChange={(e) => setPeriod(e.target.value)}
                    label="Period"
                    size="small"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="half_yearly">Half Yearly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
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
              <Tab label="Analysis" />
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
              <PnLAnalysis data={analysisData} loading={loading} />
            )}

            {activeTab === 4 && (
              <ManualPnLEntries />
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