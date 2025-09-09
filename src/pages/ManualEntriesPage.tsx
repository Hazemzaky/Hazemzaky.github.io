import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  InputAdornment,
  Autocomplete,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

// Types
interface ManualEntry {
  _id?: string;
  itemId: string;
  description: string;
  amount: number;
  category: 'revenue' | 'expense' | 'other_income';
  type: 'revenue' | 'expense';
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  period?: string;
  startDate?: Date;
  endDate?: Date;
  attachedFiles?: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }>;
}

interface ManualEntryFormData {
  itemId: string;
  description: string;
  amount: number;
  category: 'revenue' | 'expense' | 'other_income';
  type: 'revenue' | 'expense';
  notes: string;
  period: string;
  startDate: string;
  endDate: string;
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Main Manual Entries Page Component
const ManualEntriesPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [entries, setEntries] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('description');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'chart'>('table');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  
  // Form states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ManualEntry | null>(null);
  const [formData, setFormData] = useState<ManualEntryFormData>({
    itemId: '',
    description: '',
    amount: 0,
    category: 'revenue',
    type: 'revenue',
    notes: '',
    period: 'monthly',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netImpact: 0,
    recentUpdates: 0
  });

  // Fetch manual entries from database
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching manual entries from database...');
      const response = await api.get('/pnl/manual-entries');
      
      if (response.data && Array.isArray(response.data)) {
        setEntries(response.data);
        calculateStats(response.data);
        console.log(`Loaded ${response.data.length} manual entries`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching manual entries:', err);
      setError(err.response?.data?.message || 'Failed to fetch manual entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (entries: ManualEntry[]) => {
    const totalEntries = entries.length;
    const totalRevenue = entries
      .filter(entry => entry.type === 'revenue')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const netImpact = totalRevenue - totalExpenses;
    const recentUpdates = entries.filter(entry => 
      new Date(entry.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    setStats({
      totalEntries,
      totalRevenue,
      totalExpenses,
      netImpact,
      recentUpdates
    });
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
      const matchesType = filterType === 'all' || entry.type === filterType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof ManualEntry];
      let bValue: any = b[sortBy as keyof ManualEntry];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Form validation
  const validateForm = (data: ManualEntryFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.itemId.trim()) {
      errors.itemId = 'Item ID is required';
    }
    
    if (!data.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (isNaN(data.amount) || data.amount === 0) {
      errors.amount = 'Amount must be a valid number';
    }
    
    if (data.category === 'expense' && data.amount > 0) {
      errors.amount = 'Expense amounts should be negative or zero';
    }
    
    if (data.category === 'revenue' && data.amount < 0) {
      errors.amount = 'Revenue amounts should be positive';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      if (editingEntry) {
        // Update existing entry
        await api.put(`/pnl/manual-entries/${editingEntry.itemId}`, {
          amount: formData.amount,
          notes: formData.notes,
          description: formData.description,
          category: formData.category,
          type: formData.type
        });
        setSuccess('Manual entry updated successfully!');
      } else {
        // Create new entry
        await api.post('/pnl/manual-entries', formData);
        setSuccess('Manual entry created successfully!');
      }
      
      setEditModalOpen(false);
      setEditingEntry(null);
      resetForm();
      fetchEntries();
      
      // Trigger P&L refresh
      window.dispatchEvent(new CustomEvent('pnlDataUpdated'));
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save manual entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle entry deletion
  const handleDelete = async (entry: ManualEntry) => {
    try {
      await api.delete(`/pnl/manual-entries/${entry.itemId}`);
      setSuccess('Manual entry deleted successfully!');
      setDeleteModalOpen(false);
      fetchEntries();
      
      // Trigger P&L refresh
      window.dispatchEvent(new CustomEvent('pnlDataUpdated'));
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete manual entry');
    }
  };

  // Handle bulk operations
  const handleBulkAction = async () => {
    if (selectedEntries.length === 0 || !bulkAction) return;
    
    try {
      switch (bulkAction) {
        case 'delete':
          await Promise.all(
            selectedEntries.map(itemId => 
              api.delete(`/pnl/manual-entries/${itemId}`)
            )
          );
          setSuccess(`Deleted ${selectedEntries.length} entries successfully!`);
          break;
        case 'activate':
          await Promise.all(
            selectedEntries.map(itemId => 
              api.put(`/pnl/manual-entries/${itemId}`, { isActive: true })
            )
          );
          setSuccess(`Activated ${selectedEntries.length} entries successfully!`);
          break;
        case 'deactivate':
          await Promise.all(
            selectedEntries.map(itemId => 
              api.put(`/pnl/manual-entries/${itemId}`, { isActive: false })
            )
          );
          setSuccess(`Deactivated ${selectedEntries.length} entries successfully!`);
          break;
      }
      
      setBulkModalOpen(false);
      setSelectedEntries([]);
      setBulkAction('');
      fetchEntries();
      
      // Trigger P&L refresh
      window.dispatchEvent(new CustomEvent('pnlDataUpdated'));
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      itemId: '',
      description: '',
      amount: 0,
      category: 'revenue',
      type: 'revenue',
      notes: '',
      period: 'monthly',
      startDate: '',
      endDate: ''
    });
    setFormErrors({});
    setEditingEntry(null);
  };

  // Handle edit entry
  const handleEdit = (entry: ManualEntry) => {
    setEditingEntry(entry);
    setFormData({
      itemId: entry.itemId,
      description: entry.description,
      amount: entry.amount,
      category: entry.category,
      type: entry.type,
      notes: entry.notes || '',
      period: entry.period || 'monthly',
      startDate: entry.startDate ? new Date(entry.startDate).toISOString().split('T')[0] : '',
      endDate: entry.endDate ? new Date(entry.endDate).toISOString().split('T')[0] : ''
    });
    setEditModalOpen(true);
  };

  // Handle create new entry
  const handleCreate = () => {
    resetForm();
    setEditModalOpen(true);
  };

  // Load entries on component mount
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  // Listen for P&L updates
  useEffect(() => {
    const handlePnLUpdate = () => {
      fetchEntries();
    };
    
    window.addEventListener('pnlDataUpdated', handlePnLUpdate);
    return () => window.removeEventListener('pnlDataUpdated', handlePnLUpdate);
  }, [fetchEntries]);

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
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
                  <EditIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Manual P&L Entries Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage manual entries that integrate with your P&L calculations
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchEntries}
                  disabled={loading}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Entry
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
        </Paper>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 3, 
          mb: 3 
        }}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Entries
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.totalEntries}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="success.main">
                KD {stats.totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main">
                KD {stats.totalExpenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Impact
              </Typography>
              <Typography variant="h4" color={stats.netImpact >= 0 ? 'success.main' : 'error.main'}>
                KD {stats.netImpact.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recent Updates
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.recentUpdates}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 3, 
            alignItems: 'center' 
          }}>
            <TextField
              fullWidth
              label="Search entries"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="other_income">Other Income</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="description">Description</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="updatedAt">Updated Date</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                label="Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <IconButton
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <TableChartIcon />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('cards')}
                color={viewMode === 'cards' ? 'primary' : 'default'}
              >
                <BarChartIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <Paper sx={{ p: 3 }}>
            {viewMode === 'table' ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries(filteredEntries.map(entry => entry.itemId));
                            } else {
                              setSelectedEntries([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount (KD)</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Updated</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.itemId} hover>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry.itemId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEntries([...selectedEntries, entry.itemId]);
                              } else {
                                setSelectedEntries(selectedEntries.filter(id => id !== entry.itemId));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {entry.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {entry.itemId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={entry.type === 'revenue' ? 'success.main' : 'error.main'}
                          >
                            {entry.type === 'expense' && entry.amount > 0 ? '-' : ''}
                            KD {Math.abs(entry.amount).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.category} 
                            size="small" 
                            color={entry.category === 'revenue' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.type} 
                            size="small" 
                            color={entry.type === 'revenue' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {entry.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(entry.updatedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(entry)}
                              sx={{
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                minWidth: 70,
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
                              startIcon={<UploadIcon />}
                              component="label"
                              disabled={uploadingFile === entry.itemId}
                              sx={{
                                borderColor: theme.palette.secondary.main,
                                color: theme.palette.secondary.main,
                                minWidth: 80,
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
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadFiles(entry)}
                                sx={{
                                  borderColor: theme.palette.success.main,
                                  color: theme.palette.success.main,
                                  minWidth: 90,
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
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingEntry(entry);
                                setDeleteModalOpen(true);
                              }}
                              color="error"
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: 3 
              }}>
                {filteredEntries.map((entry) => (
                  <Card key={entry.itemId} sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" noWrap>
                          {entry.description}
                        </Typography>
                        <Chip 
                          label={entry.category} 
                          size="small" 
                          color={entry.category === 'revenue' ? 'success' : 'error'}
                        />
                      </Box>
                      <Typography variant="h4" color={entry.type === 'revenue' ? 'success.main' : 'error.main'} sx={{ mb: 2 }}>
                        {entry.type === 'expense' && entry.amount > 0 ? '-' : ''}
                        KD {Math.abs(entry.amount).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {entry.notes || 'No notes'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="textSecondary">
                          Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(entry)}
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              minWidth: 60,
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
                            startIcon={<UploadIcon />}
                            component="label"
                            disabled={uploadingFile === entry.itemId}
                            sx={{
                              borderColor: theme.palette.secondary.main,
                              color: theme.palette.secondary.main,
                              minWidth: 70,
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
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadFiles(entry)}
                              sx={{
                                borderColor: theme.palette.success.main,
                                color: theme.palette.success.main,
                                minWidth: 80,
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
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingEntry(entry);
                              setDeleteModalOpen(true);
                            }}
                            color="error"
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1)
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        )}
      </motion.div>

      {/* Bulk Actions */}
      {selectedEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ p: 2, mt: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {selectedEntries.length} entries selected
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Bulk Action</InputLabel>
                <Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  label="Bulk Action"
                >
                  <MenuItem value="activate">Activate</MenuItem>
                  <MenuItem value="deactivate">Deactivate</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => setBulkModalOpen(true)}
                disabled={!bulkAction}
                size="small"
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedEntries([])}
                size="small"
              >
                Clear
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Edit/Create Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingEntry ? 'Edit Manual Entry' : 'Create New Manual Entry'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 3, 
              mt: 1 
            }}>
              <TextField
                fullWidth
                label="Item ID"
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                error={!!formErrors.itemId}
                helperText={formErrors.itemId}
                disabled={!!editingEntry}
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
              <TextField
                fullWidth
                label="Amount (KD)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">KD</InputAdornment>,
                }}
              />
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  label="Category"
                >
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="other_income">Other Income</MenuItem>
                </Select>
                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{editingEntry?.description}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => editingEntry && handleDelete(editingEntry)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Confirmation Modal */}
      <Dialog 
        open={bulkModalOpen} 
        onClose={() => setBulkModalOpen(false)}
      >
        <DialogTitle>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {bulkAction} {selectedEntries.length} entries? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkAction} 
            color="error" 
            variant="contained"
          >
            {bulkAction === 'delete' ? 'Delete' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

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
        autoHideDuration={5000}
        onClose={() => setError('')}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ManualEntriesPage;
