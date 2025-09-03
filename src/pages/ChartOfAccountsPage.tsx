import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Avatar,
  Badge,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface ChartOfAccount {
  _id: string;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subcategory?: string;
  ifrsCategory: string;
  ifrsSubcategory?: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  parentAccount?: {
    _id: string;
    accountCode: string;
    accountName: string;
  };
  level: number;
  sortOrder: number;
  createdBy: {
    email: string;
  };
  updatedBy: {
    email: string;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface AccountStatistics {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  accountsByType: Array<{ _id: string; count: number }>;
  accountsByIFRSCategory: Array<{ _id: string; count: number }>;
  accountsByLevel: Array<{ _id: string; count: number }>;
}

const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);

  // Dialog states
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  // Form state
  const [accountForm, setAccountForm] = useState<{
    accountCode: string;
    accountName: string;
    accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    category: string;
    subcategory: string;
    ifrsCategory: string;
    ifrsSubcategory: string;
    description: string;
    isActive: boolean;
    parentAccount: string;
    level: number;
    sortOrder: number;
  }>({
    accountCode: '',
    accountName: '',
    accountType: 'asset',
    category: '',
    subcategory: '',
    ifrsCategory: '',
    ifrsSubcategory: '',
    description: '',
    isActive: true,
    parentAccount: '',
    level: 0,
    sortOrder: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    accountType: '',
    ifrsCategory: '',
    isActive: true,
    level: ''
  });

  // View mode - only table view since TreeView is not available
  const [viewMode, setViewMode] = useState<'table'>('table');

  // Load initial data
  useEffect(() => {
    fetchAccounts();
    fetchStatistics();
  }, []);

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.accountType) params.append('accountType', filters.accountType);
      if (filters.ifrsCategory) params.append('ifrsCategory', filters.ifrsCategory);
      if (filters.isActive !== null) params.append('isActive', filters.isActive.toString());

      const response = await api.get(`/chart-of-accounts?${params.toString()}`);
      setAccounts((response.data as any).accounts || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await api.get('/chart-of-accounts/statistics');
      setStatistics(response.data as AccountStatistics);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setAccountForm(prev => ({ ...prev, [field]: value }));
  };

  // Open account dialog
  const handleOpenAccountDialog = (account?: ChartOfAccount) => {
    if (account) {
      setEditingAccount(account);
      setAccountForm({
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
        category: account.category,
        subcategory: account.subcategory || '',
        ifrsCategory: account.ifrsCategory,
        ifrsSubcategory: account.ifrsSubcategory || '',
        description: account.description || '',
        isActive: account.isActive,
        parentAccount: account.parentAccount?._id || '',
        level: account.level,
        sortOrder: account.sortOrder
      });
    } else {
      setEditingAccount(null);
      setAccountForm({
        accountCode: '',
        accountName: '',
        accountType: 'asset',
        category: '',
        subcategory: '',
        ifrsCategory: '',
        ifrsSubcategory: '',
        description: '',
        isActive: true,
        parentAccount: '',
        level: 0,
        sortOrder: 0
      });
    }
    setAccountDialogOpen(true);
  };

  // Submit account form
  const handleSubmitAccount = async () => {
    try {
      if (editingAccount) {
        await api.put(`/chart-of-accounts/${editingAccount._id}`, accountForm);
        setSuccess('Account updated successfully!');
      } else {
        await api.post('/chart-of-accounts', accountForm);
        setSuccess('Account created successfully!');
      }
      
      setAccountDialogOpen(false);
      fetchAccounts();
      fetchStatistics();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save account');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;

    try {
      await api.delete(`/chart-of-accounts/${deleteAccountId}`);
      setSuccess('Account deleted successfully!');
      setDeleteAccountId(null);
      fetchAccounts();
      fetchStatistics();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchAccounts();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      accountType: '',
      ifrsCategory: '',
      isActive: true,
      level: ''
    });
  };

  // Get account type color
  const getAccountTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      asset: 'primary',
      liability: 'error',
      equity: 'success',
      revenue: 'info',
      expense: 'warning'
    };
    return colors[type] || 'default';
  };

  // Get IFRS category color
  const getIFRSCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      current_assets: 'primary',
      non_current_assets: 'secondary',
      property_plant_equipment: 'info',
      current_liabilities: 'error',
      non_current_liabilities: 'error',
      share_capital: 'success',
      retained_earnings: 'success',
      revenue: 'info',
      cost_of_sales: 'warning',
      operating_expenses: 'warning'
    };
    return colors[category] || 'default';
  };

  // Filtered accounts
  const filteredAccounts = accounts.filter(account => {
    if (filters.search && !account.accountCode.includes(filters.search) && !account.accountName.includes(filters.search)) return false;
    if (filters.accountType && account.accountType !== filters.accountType) return false;
    if (filters.ifrsCategory && account.ifrsCategory !== filters.ifrsCategory) return false;
    if (filters.isActive !== undefined && account.isActive !== filters.isActive) return false;
    if (filters.level && account.level !== Number(filters.level)) return false;
    return true;
  });

  const theme = useTheme();

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
                      Chart of Accounts
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage IFRS-compliant chart of accounts with hierarchical structure
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleOpenAccountDialog()}
                  startIcon={<AddIcon />}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Account
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

        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {[
                {
                  title: 'Total Accounts',
                  value: statistics.totalAccounts,
                  icon: <AccountBalanceIcon />,
                  color: theme.palette.primary.main,
                  bgColor: alpha(theme.palette.primary.main, 0.1)
                },
                {
                  title: 'Active Accounts',
                  value: statistics.activeAccounts,
                  icon: <CheckCircleIcon />,
                  color: theme.palette.success.main,
                  bgColor: alpha(theme.palette.success.main, 0.1)
                },
                {
                  title: 'Inactive Accounts',
                  value: statistics.inactiveAccounts,
                  icon: <WarningIcon />,
                  color: theme.palette.warning.main,
                  bgColor: alpha(theme.palette.warning.main, 0.1)
                },
                {
                  title: 'System Accounts',
                  value: statistics.accountsByType.find(t => t._id === 'system')?.count || 0,
                  icon: <InfoIcon />,
                  color: theme.palette.info.main,
                  bgColor: alpha(theme.palette.info.main, 0.1)
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      flex: '1 1 200px', 
                      minWidth: 200,
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
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: card.color, width: 40, height: 40, mr: 1 }}>
                          {card.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                          {card.title}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>
                        {card.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        )}

        {/* Filters Section */}
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
              🔍 Account Filters & Search
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField 
                label="Search Accounts" 
                value={filters.search} 
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} 
                sx={{ minWidth: 200 }}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={filters.accountType}
                  onChange={(e) => setFilters(prev => ({ ...prev, accountType: e.target.value }))}
                  label="Account Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="asset">Asset</MenuItem>
                  <MenuItem value="liability">Liability</MenuItem>
                  <MenuItem value="equity">Equity</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>IFRS Category</InputLabel>
                <Select
                  value={filters.ifrsCategory}
                  onChange={(e) => setFilters(prev => ({ ...prev, ifrsCategory: e.target.value }))}
                  label="IFRS Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="current_assets">Current Assets</MenuItem>
                  <MenuItem value="non_current_assets">Non-Current Assets</MenuItem>
                  <MenuItem value="property_plant_equipment">Property, Plant & Equipment</MenuItem>
                  <MenuItem value="current_liabilities">Current Liabilities</MenuItem>
                  <MenuItem value="non_current_liabilities">Non-Current Liabilities</MenuItem>
                  <MenuItem value="share_capital">Share Capital</MenuItem>
                  <MenuItem value="retained_earnings">Retained Earnings</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="cost_of_sales">Cost of Sales</MenuItem>
                  <MenuItem value="operating_expenses">Operating Expenses</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  label="Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="0">Root</MenuItem>
                  <MenuItem value="1">Level 1</MenuItem>
                  <MenuItem value="2">Level 2</MenuItem>
                  <MenuItem value="3">Level 3</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isActive}
                    onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active Only"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={applyFilters}
                startIcon={<FilterIcon />}
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
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
                startIcon={<RefreshIcon />}
                sx={{ 
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    borderColor: theme.palette.secondary.dark,
                    color: theme.palette.secondary.dark,
                  }
                }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveAltIcon />}
                onClick={() => {/* Export functionality */}}
                sx={{ 
                  borderColor: theme.palette.info.main,
                  color: theme.palette.info.main,
                  '&:hover': {
                    borderColor: theme.palette.info.dark,
                    color: theme.palette.info.dark,
                  }
                }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => {/* Print functionality */}}
                sx={{ 
                  borderColor: theme.palette.warning.main,
                  color: theme.palette.warning.main,
                  '&:hover': {
                    borderColor: theme.palette.warning.dark,
                    color: theme.palette.warning.dark,
                  }
                }}
              >
                Print
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => setViewMode('table')}
                startIcon={<AssessmentIcon />}
                sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Table View
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              width: '100%', 
              overflow: 'hidden',
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
            <Table>
              <TableHead>
                <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Account Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Account Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>IFRS Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No accounts found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account, idx) => (
                    <TableRow 
                      key={account._id} 
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
                        <Typography variant="body2" fontFamily="monospace" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {account.accountCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {account.accountName}
                          </Typography>
                          {account.subcategory && (
                            <Typography variant="caption" color="text.secondary">
                              {account.subcategory}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={account.accountType}
                          color={getAccountTypeColor(account.accountType) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{account.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={account.ifrsCategory.replace('_', ' ')}
                          color={getIFRSCategoryColor(account.ifrsCategory) as any}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Level ${account.level}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontWeight: 500,
                            borderColor: theme.palette.info.main,
                            color: theme.palette.info.main
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={account.isActive ? 'Active' : 'Inactive'}
                          color={account.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Account">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenAccountDialog(account)}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Account">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteAccountId(account._id)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Account Dialog */}
      <Dialog
        open={accountDialogOpen}
        onClose={() => setAccountDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: theme.shadows[24]
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            color: theme.palette.primary.main,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
              <AccountBalanceIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {editingAccount ? 'Update account information' : 'Create a new chart of accounts entry'}
              </Typography>
            </Box>
          </Box>
          
          {/* Decorative background elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: alpha(theme.palette.primary.main, 0.1),
            zIndex: 1
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -15, 
            left: -15, 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: alpha(theme.palette.secondary.main, 0.08),
            zIndex: 1
          }} />
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                📝 Basic Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    label="Account Code"
                    value={accountForm.accountCode}
                    onChange={(e) => handleFormChange('accountCode', e.target.value)}
                    required
                    fullWidth
                    disabled={!!editingAccount}
                    size="medium"
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
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    label="Account Name"
                    value={accountForm.accountName}
                    onChange={(e) => handleFormChange('accountName', e.target.value)}
                    required
                    fullWidth
                    size="medium"
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
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Account Classification Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                🏷️ Account Classification
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={accountForm.accountType}
                      onChange={(e) => handleFormChange('accountType', e.target.value as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense')}
                      label="Account Type"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.info.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.info.main,
                          },
                        },
                      }}
                    >
                      <MenuItem value="asset">Asset</MenuItem>
                      <MenuItem value="liability">Liability</MenuItem>
                      <MenuItem value="equity">Equity</MenuItem>
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    label="Category"
                    value={accountForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    required
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
            
            {/* IFRS Classification Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                🌍 IFRS Classification
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    label="Subcategory"
                    value={accountForm.subcategory}
                    onChange={(e) => handleFormChange('subcategory', e.target.value)}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.warning.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.warning.main,
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>IFRS Category</InputLabel>
                    <Select
                      value={accountForm.ifrsCategory}
                      onChange={(e) => handleFormChange('ifrsCategory', e.target.value)}
                      label="IFRS Category"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      }}
                    >
                      <MenuItem value="current_assets">Current Assets</MenuItem>
                      <MenuItem value="non_current_assets">Non-Current Assets</MenuItem>
                      <MenuItem value="property_plant_equipment">Property, Plant & Equipment</MenuItem>
                      <MenuItem value="intangible_assets">Intangible Assets</MenuItem>
                      <MenuItem value="current_liabilities">Current Liabilities</MenuItem>
                      <MenuItem value="non_current_liabilities">Non-Current Liabilities</MenuItem>
                      <MenuItem value="provisions">Provisions</MenuItem>
                      <MenuItem value="deferred_tax">Deferred Tax</MenuItem>
                      <MenuItem value="share_capital">Share Capital</MenuItem>
                      <MenuItem value="retained_earnings">Retained Earnings</MenuItem>
                      <MenuItem value="other_equity">Other Equity</MenuItem>
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="other_income">Other Income</MenuItem>
                      <MenuItem value="cost_of_sales">Cost of Sales</MenuItem>
                      <MenuItem value="operating_expenses">Operating Expenses</MenuItem>
                      <MenuItem value="finance_costs">Finance Costs</MenuItem>
                      <MenuItem value="income_tax_expense">Income Tax Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
            
            {/* Additional Details Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                📋 Additional Details
              </Typography>
              <TextField
                label="Description"
                value={accountForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.success.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.success.main,
                    },
                  },
                }}
              />
            </Box>
            
            {/* Hierarchy & Settings Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.secondary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.secondary.main }}>
                🏗️ Hierarchy & Settings
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Parent Account</InputLabel>
                    <Select
                      value={accountForm.parentAccount}
                      onChange={(e) => handleFormChange('parentAccount', e.target.value)}
                      label="Parent Account"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.secondary.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.secondary.main,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Root Level</MenuItem>
                      {accounts
                        .filter(acc => acc.isActive && acc._id !== editingAccount?._id)
                        .map(account => (
                          <MenuItem key={account._id} value={account._id}>
                            {account.accountCode} - {account.accountName}
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    label="Sort Order"
                    value={accountForm.sortOrder}
                    onChange={(e) => handleFormChange('sortOrder', Number(e.target.value))}
                    type="number"
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.secondary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.secondary.main,
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={accountForm.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.success.main,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: theme.palette.success.main,
                      },
                    }}
                  />
                }
                label="Active Account"
                sx={{ mt: 2 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            gap: 2
          }}
        >
          <Button 
            onClick={() => setAccountDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: theme.palette.text.secondary,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                color: theme.palette.text.primary,
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAccount} 
            variant="contained"
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
            {editingAccount ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteAccountId}
        onClose={() => setDeleteAccountId(null)}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: theme.shadows[24]
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.dark, 0.1)} 100%)`,
          color: theme.palette.error.main,
          borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete Account
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this account? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> Deleting an account may affect financial reports and transactions that reference this account.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setDeleteAccountId(null)}
            variant="outlined"
            sx={{
              borderColor: theme.palette.text.secondary,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                color: theme.palette.text.primary,
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.6)}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

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

export default ChartOfAccountsPage; 