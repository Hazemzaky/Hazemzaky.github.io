import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiBase';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, MenuItem, Card, CardContent, Avatar, Chip, Tooltip, Fab, InputAdornment, Divider, useTheme, alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExportIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

interface InventoryTransaction {
  _id: string;
  item: { _id: string; name: string; type: string } | string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  date: string;
  relatedAsset?: { _id: string; name: string } | string;
  relatedMaintenance?: { _id: string; description: string } | string;
  user?: { _id: string; email: string } | string;
  notes?: string;
}

const typeOptions = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'adjustment', label: 'Adjustment' },
];

const InventoryTransactionsPage: React.FC = () => {
  const muiTheme = useTheme();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [form, setForm] = useState({
    item: '',
    type: '',
    quantity: '',
    date: '',
    relatedAsset: '',
    relatedMaintenance: '',
    user: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchItems();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory/transactions');
      if (Array.isArray(res.data)) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
        setError('Unexpected response from server');
        console.error('Expected array, got:', res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchItems = async () => {
    try {
      const res = await api.get('/inventory/items');
      if (Array.isArray(res.data)) {
        setItems(res.data as any[]);
      } else {
        setItems([]);
        console.error('Expected array, got:', res.data);
      }
    } catch {}
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterItem && (typeof t.item === 'object' ? t.item._id : t.item) !== filterItem) return false;
      if (filterType && t.type !== filterType) return false;
      if (filterFrom && new Date(t.date) < new Date(filterFrom)) return false;
      if (filterTo && new Date(t.date) > new Date(filterTo)) return false;
      return true;
    });
  }, [transactions, filterItem, filterType, filterFrom, filterTo]);

  // Calculate metrics
  const transactionMetrics = useMemo(() => {
    const inbound = transactions.filter(t => t.type === 'inbound').length;
    const outbound = transactions.filter(t => t.type === 'outbound').length;
    const adjustment = transactions.filter(t => t.type === 'adjustment').length;
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
    
    return {
      total: transactions.length,
      inbound,
      outbound,
      adjustment,
      totalQuantity
    };
  }, [transactions]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Item', 'Type', 'Quantity', 'Date', 'Related Asset', 'Related Maintenance', 'User', 'Notes'];
    const rows = filteredTransactions.map(t => [
      typeof t.item === 'object' ? t.item.name : t.item,
      t.type,
      t.quantity,
      t.date ? new Date(t.date).toLocaleDateString() : '',
      typeof t.relatedAsset === 'object' ? t.relatedAsset.name : t.relatedAsset || '',
      typeof t.relatedMaintenance === 'object' ? t.relatedMaintenance.description : t.relatedMaintenance || '',
      typeof t.user === 'object' ? t.user.email : t.user || '',
      t.notes || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Inventory Transactions');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('inventory_transactions');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    const printHeader = addPrintHeader('Inventory Transactions');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Inventory Transactions Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printHeader}
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Add Transaction handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      item: '',
      type: '',
      quantity: '',
      date: '',
      relatedAsset: '',
      relatedMaintenance: '',
      user: '',
      notes: '',
    });
    setError('');
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/inventory/transactions', {
        ...form,
        quantity: Number(form.quantity),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Transaction added successfully!');
      fetchTransactions();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inbound': return 'success';
      case 'outbound': return 'error';
      case 'adjustment': return 'warning';
      default: return 'default';
    }
  };



  // Render Dashboard Header
  const renderDashboardHeader = () => (
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
              <InventoryIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Inventory Transactions
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Track all inventory movements, adjustments, and stock changes
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={fetchTransactions} 
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton 
                onClick={handleExportCSV}
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
        
        {/* Metrics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {transactionMetrics.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.light }}>
                {transactionMetrics.inbound}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Inbound Transactions
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.light }}>
                {transactionMetrics.outbound}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Outbound Transactions
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.light }}>
                {transactionMetrics.adjustment}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Adjustments
              </Typography>
            </CardContent>
          </Card>
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
  );

  return (
    <Box sx={{ 
      p: fullscreen ? 1 : 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderDashboardHeader()}
        </motion.div>

        {/* Main Content */}
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
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            {/* Action Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Transaction Management
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleOpen}
                startIcon={<AddIcon />}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add Transaction
              </Button>
            </Box>

            {/* Enhanced Filters */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                🔍 Filter & Search Options
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField 
                  select 
                  label="Item" 
                  value={filterItem} 
                  onChange={e => setFilterItem(e.target.value)} 
                  sx={{ minWidth: 180 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">All Items</MenuItem>
                  {items.map(i => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
                </TextField>
                
                <TextField 
                  select 
                  label="Type" 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)} 
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {typeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
                
                <TextField 
                  label="From Date" 
                  type="date" 
                  value={filterFrom} 
                  onChange={e => setFilterFrom(e.target.value)} 
                  sx={{ minWidth: 140 }} 
                  InputLabelProps={{ shrink: true }} 
                />
                
                <TextField 
                  label="To Date" 
                  type="date" 
                  value={filterTo} 
                  onChange={e => setFilterTo(e.target.value)} 
                  sx={{ minWidth: 140 }} 
                  InputLabelProps={{ shrink: true }} 
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SaveAltIcon />} 
                    onClick={handleExportCSV}
                    sx={{ 
                      borderColor: theme.palette.success.main,
                      color: theme.palette.success.main,
                      '&:hover': {
                        borderColor: theme.palette.success.dark,
                        backgroundColor: alpha(theme.palette.success.main, 0.1)
                      }
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<PrintIcon />} 
                    onClick={handlePrint}
                    sx={{ 
                      borderColor: theme.palette.info.main,
                      color: theme.palette.info.main,
                      '&:hover': {
                        borderColor: theme.palette.info.dark,
                        backgroundColor: alpha(theme.palette.info.main, 0.1)
                      }
                    }}
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Enhanced Table */}
            <Paper 
              elevation={0}
              sx={{ 
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  📊 Transaction Details ({filteredTransactions.length} records)
                </Typography>
              </Box>
              
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Item</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Type</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Quantity</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Date</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Related Asset</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Related Maintenance</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>User</th>
                      <th style={{ padding: '16px', borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, textAlign: 'left', fontWeight: 600, color: theme.palette.text.primary }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t, idx) => (
                      <tr 
                        key={t._id} 
                        style={{ 
                          background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.05);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8);
                        }}
                      >
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {typeof t.item === 'object' ? t.item.name : t.item}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Chip
                            label={t.type}
                            color={getTypeColor(t.type) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {t.quantity}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" color="text.secondary">
                            {t.date ? new Date(t.date).toLocaleDateString() : '-'}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" color="text.secondary">
                            {typeof t.relatedAsset === 'object' ? t.relatedAsset.name : t.relatedAsset || '-'}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" color="text.secondary">
                            {typeof t.relatedMaintenance === 'object' ? t.relatedMaintenance.description : t.relatedMaintenance || '-'}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" color="text.secondary">
                            {typeof t.user === 'object' ? t.user.email : t.user || '-'}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                          <Typography variant="body2" color="text.secondary">
                            {t.notes || '-'}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              
              {loading && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">Loading transactions...</Typography>
                </Box>
              )}
              
              {error && (
                <Box sx={{ p: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              )}
              
              {filteredTransactions.length === 0 && !loading && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No transactions found matching the current filters.</Typography>
                </Box>
              )}
            </Paper>
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add transaction"
        onClick={handleOpen}
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
        <AddIcon />
      </Fab>

      {/* Enhanced Add Transaction Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        {/* Enhanced Dialog Header */}
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
            <AddIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Add New Transaction
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Record a new inventory movement or adjustment
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
                📝 Transaction Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField 
                  label="Item" 
                  name="item" 
                  value={form.item} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  select
                  helperText="Select the inventory item for this transaction"
                >
                  <MenuItem value="">Select Item</MenuItem>
                  {items.map(i => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
                </TextField>
                <TextField 
                  label="Type" 
                  name="type" 
                  value={form.type} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  select
                  helperText="Transaction type (inbound, outbound, or adjustment)"
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {typeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  label="Quantity" 
                  name="quantity" 
                  value={form.quantity} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
                  helperText="Number of items involved in this transaction"
                />
                <TextField 
                  label="Date" 
                  name="date" 
                  value={form.date} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="date" 
                  InputLabelProps={{ shrink: true }}
                  helperText="When this transaction occurred"
                />
              </Box>
            </Paper>

            {/* Related Information Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                🔗 Related Information (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField 
                  label="Related Asset" 
                  name="relatedAsset" 
                  value={form.relatedAsset} 
                  onChange={handleFormChange} 
                  fullWidth
                  helperText="Link to a specific asset if applicable"
                />
                <TextField 
                  label="Related Maintenance" 
                  name="relatedMaintenance" 
                  value={form.relatedMaintenance} 
                  onChange={handleFormChange} 
                  fullWidth
                  helperText="Link to maintenance work if applicable"
                />
              </Box>
              <TextField 
                label="User" 
                name="user" 
                value={form.user} 
                onChange={handleFormChange} 
                fullWidth
                helperText="User responsible for this transaction"
              />
            </Paper>

            {/* Notes Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.neutral?.main || '#64748b', 0.05),
                border: `1px solid ${alpha(theme.palette.neutral?.main || '#64748b', 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.neutral?.main || '#64748b', fontWeight: 600 }}>
                📝 Additional Notes
              </Typography>
              <TextField 
                label="Notes" 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                fullWidth 
                multiline 
                minRows={3}
                placeholder="Enter any additional notes, reasons, or context for this transaction..."
                helperText="Optional notes for internal reference and tracking"
              />
            </Paper>

            {/* Error Display */}
            {error && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Alert severity="error" sx={{ mb: 0 }}>
                  {error}
                </Alert>
              </Paper>
            )}
          </Box>
        </DialogContent>
        
        {/* Enhanced Dialog Actions */}
        <DialogActions sx={{ 
          p: 3, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              disabled={submitting}
              startIcon={<CloseIcon />}
              sx={{ 
                px: 4,
                py: 1.5,
                borderColor: theme.palette.grey[400],
                color: theme.palette.text.secondary,
                borderRadius: theme.shape.borderRadius,
                fontWeight: 600,
                '&:hover': {
                  borderColor: theme.palette.grey[600],
                  backgroundColor: alpha(theme.palette.grey[400], 0.1),
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                },
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </Button>
          </Box>
          
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={submitting}
            startIcon={<AddIcon />}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: theme.shape.borderRadius,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              },
              transition: 'all 0.3s ease'
            }}
          >
            {submitting ? 'Adding...' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success"
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: 28
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="success">✅</span>
            {success}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryTransactionsPage;