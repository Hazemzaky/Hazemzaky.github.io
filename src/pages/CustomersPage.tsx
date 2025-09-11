import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, InputAdornment, IconButton, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Avatar, Tooltip, useTheme, alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessType: 'individual' | 'company' | 'government' | 'non_profit';
  taxId?: string;
  creditLimit: number;
  paymentTerms: number;
  discountRate: number;
  currency: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    position?: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  averagePaymentTime: number;
  lastPaymentDate?: string;
  lastInvoiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
  blacklisted: 'error',
};

const businessTypeColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  individual: 'primary',
  company: 'success',
  government: 'warning',
  non_profit: 'secondary',
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Kuwait'
    },
    businessType: 'company' as 'individual' | 'company' | 'government' | 'non_profit',
    taxId: '',
    creditLimit: 0,
    paymentTerms: 30,
    discountRate: 0,
    currency: 'KWD',
    primaryContact: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    status: 'active' as 'active' | 'inactive' | 'suspended' | 'blacklisted',
    notes: ''
  });

  const theme = useTheme();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{customers: Customer[]}>('/customers');
      setCustomers(res.data.customers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let data = customers;
    
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(customer =>
        customer.name.toLowerCase().includes(s) ||
        customer.email.toLowerCase().includes(s) ||
        customer.phone.toLowerCase().includes(s) ||
        customer.primaryContact.name.toLowerCase().includes(s)
      );
    }
    
    if (statusFilter) {
      data = data.filter(customer => customer.status === statusFilter);
    }
    
    if (businessTypeFilter) {
      data = data.filter(customer => customer.businessType === businessTypeFilter);
    }
    
    return data;
  }, [customers, search, statusFilter, businessTypeFilter]);

  // Currency formatter
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '0.00 KWD';
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'KWD' });
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('primaryContact.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        primaryContact: {
          ...prev.primaryContact,
          [field]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, form);
        setSuccess('Customer updated successfully!');
      } else {
        await api.post('/customers', form);
        setSuccess('Customer created successfully!');
      }
      
      fetchCustomers();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle dialog open/close
  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        website: customer.website || '',
        address: customer.address,
        businessType: customer.businessType as 'individual' | 'company' | 'government' | 'non_profit',
        taxId: customer.taxId || '',
        creditLimit: customer.creditLimit,
        paymentTerms: customer.paymentTerms,
        discountRate: customer.discountRate,
        currency: customer.currency,
        primaryContact: {
          ...customer.primaryContact,
          position: customer.primaryContact.position || ''
        },
        status: customer.status as 'active' | 'inactive' | 'suspended' | 'blacklisted',
        notes: ''
      });
    } else {
      setEditingCustomer(null);
      setForm({
        name: '',
        email: '',
        phone: '',
        website: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Kuwait'
        },
        businessType: 'company',
        taxId: '',
        creditLimit: 0,
        paymentTerms: 30,
        discountRate: 0,
        currency: 'KWD',
        primaryContact: {
          name: '',
          email: '',
          phone: '',
          position: ''
        },
        status: 'active',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Kuwait'
      },
      businessType: 'company',
      taxId: '',
      creditLimit: 0,
      paymentTerms: 30,
      discountRate: 0,
      currency: 'KWD',
      primaryContact: {
        name: '',
        email: '',
        phone: '',
        position: ''
      },
      status: 'active',
      notes: ''
    });
  };

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
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Customer Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage customer information, credit limits, and payment terms
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
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Customers</Typography>
                  <Typography variant="h3" fontWeight="bold">{customers.length}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex={2} display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
              <TextField
                size="small"
                placeholder="Search customers..."
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
                onClick={() => handleOpen()} 
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
                Add Customer
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="blacklisted">Blacklisted</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Business Type</InputLabel>
                <Select
                  value={businessTypeFilter}
                  onChange={e => setBusinessTypeFilter(e.target.value)}
                  label="Business Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="government">Government</MenuItem>
                  <MenuItem value="non_profit">Non-Profit</MenuItem>
                </Select>
              </FormControl>

              <Button 
                variant="outlined" 
                onClick={() => {
                  setStatusFilter('');
                  setBusinessTypeFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Paper sx={{ overflowX: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ background: '#f5f5f5' }}>
                      <TableCell>Customer</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Business Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Credit Limit</TableCell>
                      <TableCell>Outstanding</TableCell>
                      <TableCell>Payment Terms</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.map((customer, idx) => (
                      <TableRow key={customer._id} sx={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>{customer.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {customer.address.city}, {customer.address.country}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="body2">{customer.email}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2">{customer.phone}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.businessType} 
                            color={businessTypeColors[customer.businessType]}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.status} 
                            color={statusColors[customer.status]}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(customer.creditLimit)}</TableCell>
                        <TableCell>
                          <Typography 
                            color={customer.outstandingBalance > customer.creditLimit ? 'error' : 'text.primary'}
                            fontWeight={customer.outstandingBalance > 0 ? 600 : 400}
                          >
                            {formatCurrency(customer.outstandingBalance)}
                          </Typography>
                        </TableCell>
                        <TableCell>{customer.paymentTerms} days</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpen(customer)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>

        {/* Add/Edit Customer Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Box display="flex" flexWrap="wrap" gap={3}>
                {/* Basic Information */}
                <Box flex="1 1 100%" minWidth="100%">
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Company Name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Box>

                {/* Address */}
                <Box flex="1 1 100%" minWidth="100%">
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address</Typography>
                </Box>
                <Box flex="1 1 100%" minWidth="200px">
                  <TextField
                    label="Street Address"
                    name="address.street"
                    value={form.address.street}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="City"
                    name="address.city"
                    value={form.address.city}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="State"
                    name="address.state"
                    value={form.address.state}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Zip Code"
                    name="address.zipCode"
                    value={form.address.zipCode}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>

                {/* Financial Information */}
                <Box flex="1 1 100%" minWidth="100%">
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Financial Information</Typography>
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Credit Limit"
                    name="creditLimit"
                    type="number"
                    value={form.creditLimit}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Payment Terms (days)"
                    name="paymentTerms"
                    type="number"
                    value={form.paymentTerms}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>

                {/* Primary Contact */}
                <Box flex="1 1 100%" minWidth="100%">
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Primary Contact</Typography>
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Contact Name"
                    name="primaryContact.name"
                    value={form.primaryContact.name}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Contact Email"
                    name="primaryContact.email"
                    type="email"
                    value={form.primaryContact.email}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Contact Phone"
                    name="primaryContact.phone"
                    value={form.primaryContact.phone}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Box>
                <Box flex="1 1 200px" minWidth="200px">
                  <TextField
                    label="Position"
                    name="primaryContact.position"
                    value={form.primaryContact.position}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Box>

                {error && (
                  <Box flex="1 1 100%" minWidth="100%">
                    <Alert severity="error">{error}</Alert>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingCustomer ? 'Update' : 'Create')}
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
      </AnimatePresence>
    </Box>
  );
};

export default CustomersPage;
