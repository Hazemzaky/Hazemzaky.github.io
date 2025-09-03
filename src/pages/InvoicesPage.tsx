import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, InputAdornment, IconButton, Chip, Alert,
  Tabs, Tab, Checkbox, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Dialog, DialogTitle, DialogContent, DialogActions, ListItemText, Avatar, Tooltip, useTheme, alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface Invoice {
  _id: string;
  recipient: { name: string; email: string };
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  totalAmount: number;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  uploadedBy?: any;
  fileUrl?: string;
  serial?: string; // Added serial field
}

interface CompletedOrder {
  _id: string;
  poNumber?: string;
  serialNumber?: string;
  clientName: string;
  clientType: 'quotation' | 'contract' | 'project';
  department: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  vendor?: any;
  items?: Array<{ description: string; quantity: number; price: number }>;
  project?: any; // For project-specific data
}

type SortKey = 'dueDate' | 'totalAmount' | 'status' | '';
type SortOrder = 'asc' | 'desc';

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  sent: 'primary',
  paid: 'success',
  overdue: 'error',
};

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    recipientName: '',
    recipientEmail: '',
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    serial: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Orders ready to be invoiced state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [clientTypeFilter, setClientTypeFilter] = useState<string[]>([]);
  const [clientNameFilter, setClientNameFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [invoiceOrdersDialog, setInvoiceOrdersDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    companyName: '',
    companyType: 'quotation',
    department: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchCompletedOrders();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<Invoice[]>('/invoices');
      setInvoices(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    setOrdersLoading(true);
    try {
      console.log('Fetching completed projects...');
      
      // Fetch completed projects from the Projects/Orders page
      const projectsRes = await api.get<any[]>('/projects?status=completed');
      console.log('Completed projects response:', projectsRes.data);
      
      const completedProjects = projectsRes.data.map((project: any) => ({
        _id: project._id,
        poNumber: project.serial || project._id.slice(-6).toUpperCase(),
        serialNumber: project.serial,
        clientName: project.customer,
        clientType: 'project' as const,
        department: project.department,
        totalAmount: (project.unitPrice * project.overallHours) || 0,
        status: project.status,
        createdAt: project.createdAt,
        items: [{
          description: project.equipmentDescription,
          quantity: 1,
          price: project.unitPrice || 0,
        }],
        project: project, // Keep the full project data for reference
      }));

      console.log('Completed projects mapped:', completedProjects);
      setCompletedOrders(completedProjects);
    } catch (err: any) {
      console.error('Error fetching completed projects:', err);
      // Set empty array to prevent errors
      setCompletedOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Sorting and filtering
  const filteredInvoices = useMemo(() => {
    let data = invoices;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(inv =>
        (inv.recipient?.name?.toLowerCase().includes(s) || '') ||
        (inv.recipient?.email?.toLowerCase().includes(s) || '') ||
        inv.status.toLowerCase().includes(s)
      );
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        let aVal: any = a[sortKey];
        let bVal: any = b[sortKey];
        if (sortKey === 'dueDate') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [invoices, search, sortKey, sortOrder]);

  // Filter completed orders
  const filteredCompletedOrders = useMemo(() => {
    let data = completedOrders;
    
    if (clientTypeFilter.length > 0) {
      data = data.filter(order => clientTypeFilter.includes(order.clientType));
    }
    
    if (clientNameFilter.length > 0) {
      data = data.filter(order => clientNameFilter.includes(order.clientName));
    }
    
    if (departmentFilter.length > 0) {
      data = data.filter(order => departmentFilter.includes(order.department));
    }
    
    return data;
  }, [completedOrders, clientTypeFilter, clientNameFilter, departmentFilter]);

  // Get unique filter options
  const clientTypes = useMemo(() => 
    [...new Set(completedOrders.map(order => order.clientType))], 
    [completedOrders]
  );
  
  const clientNames = useMemo(() => 
    [...new Set(completedOrders.map(order => order.clientName))], 
    [completedOrders]
  );
  
  const departments = useMemo(() => 
    [...new Set(completedOrders.map(order => order.department))], 
    [completedOrders]
  );

  // Currency formatter
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '0.00 KWD';
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'KWD' });
  };

  // Sorting handlers
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Mark as paid
  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    try {
      await api.put(`/invoices/${id}/status`, { status: 'paid' });
      setSuccess('Invoice marked as paid!');
      fetchInvoices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update invoice');
    } finally {
      setMarkingPaid(null);
    }
  };

  // Add Invoice handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      recipientName: '',
      recipientEmail: '',
      dueDate: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      serial: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLineItemChange = (idx: number, field: string, value: any) => {
    const newLineItems = [...form.lineItems];
    newLineItems[idx] = { ...newLineItems[idx], [field]: value };
    // Update total for this line
    newLineItems[idx].total = Number(newLineItems[idx].quantity) * Number(newLineItems[idx].unitPrice);
    setForm({ ...form, lineItems: newLineItems });
  };

  const handleAddLineItem = () => {
    setForm({ ...form, lineItems: [...form.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }] });
  };

  const handleRemoveLineItem = (idx: number) => {
    const newLineItems = form.lineItems.filter((_, i) => i !== idx);
    setForm({ ...form, lineItems: newLineItems });
  };

  const totalAmount = form.lineItems.reduce((sum, item) => sum + Number(item.total), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/invoices', {
        recipient: { name: form.recipientName, email: form.recipientEmail },
        dueDate: form.dueDate,
        lineItems: form.lineItems,
        serial: form.serial,
      });
      setSuccess('Invoice created successfully!');
      fetchInvoices();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Orders ready to be invoiced handlers
  const handleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === filteredCompletedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredCompletedOrders.map(order => order._id));
    }
  };

  const handleInvoiceOrders = () => {
    if (selectedOrders.length === 0) {
      setError('Please select at least one order to invoice');
      return;
    }
    setInvoiceOrdersDialog(true);
  };

  const handleInvoiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
  };

  const handleCreateInvoiceFromOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const selectedOrderData = completedOrders.filter(order => selectedOrders.includes(order._id));
      
      // Create line items from selected orders
      const lineItems = selectedOrderData.map(order => {
        let description = '';
        if (order.clientType === 'project') {
          description = `PROJECT - ${order.project?.equipmentDescription || order.serialNumber || order._id.slice(-6)}`;
        } else {
          description = `${order.clientType.toUpperCase()} - ${order.serialNumber || order._id.slice(-6)}`;
        }
        
        return {
          description,
          quantity: 1,
          unitPrice: order.totalAmount,
          total: order.totalAmount,
        };
      });

      const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

      await api.post('/invoices', {
        recipient: { 
          name: invoiceForm.companyName, 
          email: `${invoiceForm.companyName.toLowerCase().replace(/\s+/g, '.')}@company.com` 
        },
        dueDate: invoiceForm.dueDate,
        lineItems,
        serial: `INV-${Date.now()}`,
      });

      setSuccess(`Invoice created successfully for ${selectedOrders.length} orders!`);
      setSelectedOrders([]);
      setInvoiceOrdersDialog(false);
      setInvoiceForm({
        companyName: '',
        companyType: 'quotation',
        department: '',
        dueDate: '',
      });
      fetchInvoices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice from orders');
    } finally {
      setSubmitting(false);
    }
  };

  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        p: 3
      }}
    >
      <AnimatePresence mode="wait">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 4,
              mb: 3,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  width: 64,
                  height: 64,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`
                }}
              >
                <ReceiptIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Invoice Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Create, manage, and track invoices for your business
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Statistics and Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={3}>
            <Box flex={1} mb={{ xs: 2, md: 0 }}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Invoices</Typography>
                  <Typography variant="h3" fontWeight="bold">{invoices.length}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex={2} display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
              <TextField
                size="small"
                placeholder="Search by recipient or status"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearch('')} size="small">
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.9),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 1),
                    }
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleOpen} 
                startIcon={<AddIcon />}
                sx={{ 
                  minWidth: 180, 
                  fontWeight: 600, 
                  fontSize: 16,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.4)}`,
                  }
                }}
              >
                Add Invoice
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ 
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontWeight: 500,
                  borderRadius: '12px 12px 0 0',
                  '&.Mui-selected': {
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }
                }
              }}
            >
              <Tab label="Invoices" />
              <Tab label="Orders Ready To Be Invoiced" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {tabValue === 0 && (
            <Paper sx={{ mt: 2, p: 2, overflowX: 'auto' }}>
              <Typography variant="h5" gutterBottom>Invoices</Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ background: '#f5f5f5' }}>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Serial Number</TableCell>
                        <TableCell>Recipient</TableCell>
                        <TableCell>
                          <span style={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => handleSort('dueDate')}>
                            Due Date {sortKey === 'dueDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => handleSort('totalAmount')}>
                            Total {sortKey === 'totalAmount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                          </span>
                        </TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredInvoices.map((inv, idx) => (
                        <TableRow key={inv._id} sx={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                          <TableCell>{inv._id.slice(-6).toUpperCase()}</TableCell>
                          <TableCell>{inv.serial || '-'}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>{inv.recipient?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{inv.recipient?.email}</Typography>
                          </TableCell>
                          <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{formatCurrency(Number(inv.totalAmount))}</TableCell>
                          <TableCell>
                            <Chip label={inv.status} color={statusColors[inv.status]} size="small" sx={{ textTransform: 'capitalize' }} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              disabled={inv.status === 'paid' || markingPaid === inv._id}
                              onClick={() => handleMarkPaid(inv._id)}
                              sx={{ mr: 1 }}
                            >
                              {markingPaid === inv._id ? 'Marking...' : 'Mark as Paid'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {tabValue === 1 && (
            <Box>
              {/* Filters */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Filters
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Client Type</InputLabel>
                    <Select
                      multiple
                      value={clientTypeFilter}
                      onChange={(e) => setClientTypeFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      input={<OutlinedInput label="Client Type" />}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {clientTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          <Checkbox checked={clientTypeFilter.indexOf(type) > -1} />
                          <ListItemText primary={type.charAt(0).toUpperCase() + type.slice(1)} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Client Name</InputLabel>
                    <Select
                      multiple
                      value={clientNameFilter}
                      onChange={(e) => setClientNameFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      input={<OutlinedInput label="Client Name" />}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {clientNames.map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox checked={clientNameFilter.indexOf(name) > -1} />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      multiple
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      input={<OutlinedInput label="Department" />}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          <Checkbox checked={departmentFilter.indexOf(dept) > -1} />
                          <ListItemText primary={dept} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setClientTypeFilter([]);
                      setClientNameFilter([]);
                      setDepartmentFilter([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Paper>

              {/* Actions */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">
                  Orders Ready To Be Invoiced ({filteredCompletedOrders.length})
                </Typography>
                {/* Debug info - remove this later */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                  Debug: Total orders fetched: {completedOrders.length} | Filtered: {filteredCompletedOrders.length}
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={handleSelectAllOrders}
                    disabled={filteredCompletedOrders.length === 0}
                  >
                    {selectedOrders.length === filteredCompletedOrders.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleInvoiceOrders}
                    disabled={selectedOrders.length === 0}
                  >
                    Invoice Selected Orders ({selectedOrders.length})
                  </Button>
                </Box>
              </Box>

              {/* Orders Table */}
              <Paper sx={{ overflowX: 'auto' }}>
                {ordersLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : filteredCompletedOrders.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <Typography variant="h6" color="text.secondary">
                      No completed orders found. Orders will appear here when they are completed/approved.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ background: '#f5f5f5' }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedOrders.length === filteredCompletedOrders.length && filteredCompletedOrders.length > 0}
                              indeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredCompletedOrders.length}
                              onChange={handleSelectAllOrders}
                            />
                          </TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Client Name</TableCell>
                          <TableCell>Client Type</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Total Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCompletedOrders.map((order, idx) => (
                          <TableRow key={order._id} sx={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleOrderSelection(order._id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>
                                {order.poNumber || order.serialNumber || order._id.slice(-6).toUpperCase()}
                              </Typography>
                            </TableCell>
                            <TableCell>{order.clientName}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.clientType} 
                                color={order.clientType === 'quotation' ? 'primary' : order.clientType === 'contract' ? 'secondary' : 'success'}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>{order.department}</TableCell>
                            <TableCell>{formatCurrency(order.totalAmount || 0)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status} 
                                color="success"
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          )}

          {/* Add Invoice Dialog */}
          <Dialog 
            open={open} 
            onClose={handleClose} 
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
                  <AddIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Add New Invoice
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Create a new invoice with line items and recipient details
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
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Basic Information Section */}
                <Box sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    📝 Invoice Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <TextField 
                        label="Serial Number" 
                        name="serial" 
                        value={form.serial} 
                        onChange={handleFormChange} 
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
                    <Box sx={{ flex: '1 1 200px' }}>
                      <TextField 
                        label="Recipient Name" 
                        name="recipientName" 
                        value={form.recipientName} 
                        onChange={handleFormChange} 
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <TextField 
                        label="Recipient Email" 
                        name="recipientEmail" 
                        value={form.recipientEmail} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        type="email"
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
                        label="Due Date" 
                        name="dueDate" 
                        value={form.dueDate} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        type="date" 
                        InputLabelProps={{ shrink: true }}
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

                {/* Line Items Section */}
                <Box sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                    📊 Line Items
                  </Typography>
                  {form.lineItems.map((item, idx) => (
                    <Box key={idx} sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      alignItems: 'center', 
                      mb: 2, 
                      p: 2, 
                      background: alpha(theme.palette.background.paper, 0.5), 
                      borderRadius: 1 
                    }}>
                      <TextField 
                        label="Description" 
                        value={item.description} 
                        onChange={e => handleLineItemChange(idx, 'description', e.target.value)} 
                        required 
                        fullWidth
                        size="small"
                      />
                      <TextField 
                        label="Quantity" 
                        type="number" 
                        value={item.quantity} 
                        onChange={e => handleLineItemChange(idx, 'quantity', Number(e.target.value))} 
                        required 
                        sx={{ maxWidth: 120 }}
                        size="small"
                      />
                      <TextField 
                        label="Unit Price" 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={e => handleLineItemChange(idx, 'unitPrice', Number(e.target.value))} 
                        required 
                        sx={{ maxWidth: 140 }}
                        size="small"
                      />
                      <TextField 
                        label="Total" 
                        value={item.total} 
                        InputProps={{ readOnly: true }} 
                        sx={{ maxWidth: 140 }}
                        size="small"
                      />
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveLineItem(idx)} 
                        disabled={form.lineItems.length === 1}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button 
                    onClick={handleAddLineItem} 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    sx={{ width: 180, mb: 2 }}
                  >
                    Add Line Item
                  </Button>
                  
                  {/* Total Amount Display */}
                  <Box sx={{ 
                    p: 2, 
                    background: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    textAlign: 'right'
                  }}>
                    <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                      Total: {totalAmount.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                  </Box>
                </Box>
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
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
                onClick={handleClose} 
                disabled={submitting}
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
                onClick={handleSubmit} 
                variant="contained" 
                disabled={submitting}
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
                Create Invoice
              </Button>
            </DialogActions>
          </Dialog>

          {/* Invoice Orders Dialog */}
          <Dialog open={invoiceOrdersDialog} onClose={() => setInvoiceOrdersDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Create Invoice from Selected Orders</DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleCreateInvoiceFromOrders} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Selected Orders: {selectedOrders.length}
                </Typography>
                
                <Box display="flex" gap={2}>
                  <TextField 
                    label="Company Name" 
                    name="companyName" 
                    value={invoiceForm.companyName} 
                    onChange={handleInvoiceFormChange} 
                    required 
                    fullWidth 
                  />
                  <FormControl fullWidth>
                    <InputLabel>Company Type</InputLabel>
                    <Select
                      name="companyType"
                      value={invoiceForm.companyType}
                      onChange={handleInvoiceFormChange}
                      label="Company Type"
                    >
                      <MenuItem value="quotation">Quotation</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="project">Project</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box display="flex" gap={2}>
                  <TextField 
                    label="Department" 
                    name="department" 
                    value={invoiceForm.department} 
                    onChange={handleInvoiceFormChange} 
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Due Date" 
                    name="dueDate" 
                    value={invoiceForm.dueDate} 
                    onChange={handleInvoiceFormChange} 
                    required 
                    fullWidth 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                  />
                </Box>

                <Typography variant="subtitle1" fontWeight={600} mt={2}>
                  Order Summary
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                  {completedOrders
                    .filter(order => selectedOrders.includes(order._id))
                    .map((order, idx) => (
                      <Box key={order._id} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {order.poNumber || order.serialNumber || order._id.slice(-6).toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.clientName} - {order.department}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(order.totalAmount || 0)}
                        </Typography>
                      </Box>
                    ))}
                </Box>

                <Typography variant="h6" align="right">
                  Total: {formatCurrency(
                    completedOrders
                      .filter(order => selectedOrders.includes(order._id))
                      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                  )}
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInvoiceOrdersDialog(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleCreateInvoiceFromOrders} variant="contained" color="primary" disabled={submitting}>
                Create Invoice
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={!!success}
            autoHideDuration={3000}
            onClose={() => setSuccess('')}
            message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default InvoicesPage;
