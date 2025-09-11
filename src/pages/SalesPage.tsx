import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Divider,
  InputAdornment,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Fab
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  SaveAlt as SaveAltIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';
import PrintIcon from '@mui/icons-material/Print';
import theme from '../theme';

const currencyOptions = [
  { code: 'KWD', sign: 'د.ك' },
  { code: 'KWD', sign: 'KD' },
  { code: 'EUR', sign: '€' },
  { code: 'GBP', sign: '£' },
  { code: 'SAR', sign: 'ر.س' },
  { code: 'AED', sign: 'د.إ' },
];

const defaultQuote = {
  quotationDate: '',
  validUntil: '',
  status: 'Draft',
  clientName: '',
  attn: '',
  email: '',
  contactNo: '',
  subject: '',
  refCode: '',
  currency: 'KWD',
  project: '',
  rateType: 'daily',
  rate: '',
  operatorCharges: '',
  fuelCharges: '',
  mobilizationFee: '',
  standbyCharges: '',
  securityDeposit: '',
  discounts: '',
  taxes: '',
  addOns: '',
  paymentTerms: '',
  paymentMethods: '',
  penalty: '',
  withOperator: 'no',
  fuelProvidedBy: '',
  insurance: '',
  maintenance: '',
  availability: '',
  breakdownPolicy: '',
  standbyConditions: '',
  grandTotal: '',
  clientPOBox: '',
  clientFax: '',
  clientEmail: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  contactPersonExtension: '',
  serialNumber: '',
  termsAndConditions: '',
  additionalDetails: '',
};

// Default rental item structure
const defaultRentalItem = {
  description: '',
  rentType: 'Callout',
  workingHours: '8',
  unitPrice: '',
  remarks: ''
};

function exportCSV(rows: any[], headers: string[], filename: string) {
  const csv = [headers, ...rows].map((r: any[]) => r.map((x: any) => `"${x ?? ''}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const SalesPage: React.FC = () => {
  const muiTheme = useTheme();
  const [quote, setQuote] = useState<any>(defaultQuote);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // Filtering/search state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rentalItems, setRentalItems] = useState<any[]>([defaultRentalItem]);

  // Calculate sales metrics
  const salesMetrics = {
    totalQuotations: quotations.length,
    totalValue: quotations.reduce((sum, q) => sum + (parseFloat(q.grandTotal) || 0), 0),
    pendingQuotations: quotations.filter(q => q.status === 'Draft' || q.status === 'Pending').length,
    approvedQuotations: quotations.filter(q => q.status === 'Approved').length,
    totalClients: new Set(quotations.map(q => q.clientName)).size
  };

  // Fetch quotations from backend
  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/quotations');
      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError((err as any).response?.data?.message || 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Dashboard header and metrics section
  const renderDashboardHeader = () => (
    <>
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
                  <AttachMoneyIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Sales Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Quotations, client management, and sales analytics
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={fetchQuotations} 
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
                    onClick={() => setFullscreen(!fullscreen)}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
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

      {/* Sales Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
          {[
            { 
              title: 'Total Quotations', 
              value: salesMetrics.totalQuotations, 
              color: theme.palette.primary.main,
              bgColor: alpha(theme.palette.primary.main, 0.1),
              icon: <AssessmentIcon />
            },
            { 
              title: 'Total Value', 
              value: salesMetrics.totalValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }), 
              color: theme.palette.success.main,
              bgColor: alpha(theme.palette.success.main, 0.1),
              icon: <TrendingUpIcon />
            },
            { 
              title: 'Pending Quotations', 
              value: salesMetrics.pendingQuotations, 
              color: theme.palette.warning.main,
              bgColor: alpha(theme.palette.warning.main, 0.1),
              icon: <PeopleIcon />
            },
            { 
              title: 'Total Clients', 
              value: salesMetrics.totalClients, 
              color: theme.palette.info.main,
              bgColor: alpha(theme.palette.info.main, 0.1),
              icon: <PeopleIcon />
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
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
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </>
  );

  // Auto-calculate rental duration and totals
  const calcTotal = () => {
    const rate = Number(quote.rate) || 0;
    let total = rate;
    total += Number(quote.operatorCharges) || 0;
    total += Number(quote.fuelCharges) || 0;
    total += Number(quote.mobilizationFee) || 0;
    total += Number(quote.standbyCharges) || 0;
    total += Number(quote.securityDeposit) || 0;
    total -= Number(quote.discounts) || 0;
    total += Number(quote.taxes) || 0;
    return total > 0 ? total : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };



  // Rental items functions
  const handleAddRentalItem = () => {
    setRentalItems([...rentalItems, { ...defaultRentalItem }]);
  };

  const handleRemoveRentalItem = (idx: number) => {
    if (rentalItems.length > 1) {
      setRentalItems(rentalItems.filter((_, i) => i !== idx));
    }
  };

  const handleRentalItemChange = (idx: number, field: string, value: string) => {
    const updatedItems = rentalItems.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setRentalItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...quote,
        termsAndConditions: quote.termsAndConditions,
        rentalItems,
        currency: quote.currency,
        clientPOBox: quote.clientPOBox,
        clientFax: quote.clientFax,
        clientEmail: quote.clientEmail,
        contactPersonPhone: quote.contactPersonPhone,
        contactPersonEmail: quote.contactPersonEmail,
        contactPersonExtension: quote.contactPersonExtension,
        serialNumber: quote.serialNumber,
        rate: Number(quote.rate),
        operatorCharges: Number(quote.operatorCharges),
        fuelCharges: Number(quote.fuelCharges),
        mobilizationFee: Number(quote.mobilizationFee),
        standbyCharges: Number(quote.standbyCharges),
        securityDeposit: Number(quote.securityDeposit),
        discounts: Number(quote.discounts),
        taxes: Number(quote.taxes),
        grandTotal: calcTotal(),
        quotationDate: quote.quotationDate ? new Date(quote.quotationDate) : null,
        validUntil: quote.validUntil ? new Date(quote.validUntil) : null,
      };
      await api.post('/quotations', submitData);
      setSuccess('Quotation submitted!');
      setQuote(defaultQuote);
      setRentalItems([defaultRentalItem]);
      fetchQuotations();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quotation');
    }
  };

  // Filtered and searched quotations
  const filteredQuotations = quotations.filter(q => {
    // Date range
    if (filterFrom && (!q.quotationDate || new Date(q.quotationDate) < new Date(filterFrom))) return false;
    if (filterTo && (!q.quotationDate || new Date(q.quotationDate) > new Date(filterTo))) return false;
    // Status
    if (filterStatus && q.status !== filterStatus) return false;
    // Client
    if (filterClient && !q.clientName?.toLowerCase().includes(filterClient.toLowerCase())) return false;
    // Free text search
    if (search) {
      const s = search.toLowerCase();
      if (!(
        (q.clientName && q.clientName.toLowerCase().includes(s)) ||
        (q.status && q.status.toLowerCase().includes(s))
      )) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Client', 'Status', 'Grand Total'];
    const rows = filteredQuotations.map(q => [
      q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-',
      q.clientName,
      q.status,
      q.grandTotal ? `${q.grandTotal} KWD` : '-',
    ]);
    exportCSV(rows, headers, 'quotations.csv');
  };

  const printQuotation = (q: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Quotation - ${q.clientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
            .logo { font-size: 2rem; font-weight: bold; color: #1976d2; }
            .company-info { text-align: right; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 8px; color: #1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Company Logo</div>
            <div class="company-info">
              <div>Company Name</div>
              <div>Address Line 1</div>
              <div>Address Line 2</div>
              <div>Email: info@company.com</div>
              <div>Phone: +965 1234 5678</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Quotation Details</div>
            <table>
              <tr><th>Quotation Date</th><td>${q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-'}</td></tr>
              <tr><th>Valid Until</th><td>${q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '-'}</td></tr>
              <tr><th>Status</th><td>${q.status}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; width: 25%;">Client Name</th>
                <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">${q.clientName || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-'}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Attn.</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.attn || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Ref Code</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.refCode || '-'}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.email || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Currency</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.currency || '-'}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Cont No.</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.contactNo || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Project</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.project || '-'}</td>
              </tr>
            </table>
            <div style="margin-top: 16px;">
              <strong>Subject:</strong><br/>
              <div style="border: 1px solid #ddd; padding: 8px; min-height: 60px; margin-top: 8px;">
                ${q.subject || '-'}
              </div>
            </div>
          </div>




          <div style="margin-top: 40px; text-align: center; font-size: 1rem; color: #666; font-style: italic; border-top: 1px solid #ddd; padding-top: 20px;">
            This Quotation is automatically Generated and doesn't need any signing or stamping
          </div>
          <div style="margin-top: 20px; text-align: right; font-size: 1.1rem; color: #1976d2;">Thank you for your business!</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleEditQuotation = (q: any) => {
    setQuote(q);
    setRentalItems(q.rentalItems || [defaultRentalItem]);
    setDialogOpen(true);
  };

  const handleViewQuotation = (q: any) => {
    // This function is not fully implemented in the new_code,
    // but it's part of the new_code's enhanced table structure.
    // For now, it will just open the print dialog.
    printQuotation(q);
  };

  const handleStatusUpdate = async (quotationId: string, newStatus: string) => {
    try {
      await api.put(`/quotations/${quotationId}/status`, { status: newStatus });
      setSuccess(`Quotation status updated to ${newStatus}`);
      fetchQuotations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Draft': return 'default';
      case 'Expired': return 'warning';
      case 'Sent': return 'info';
      case 'Revised': return 'secondary';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return '✅';
      case 'Rejected': return '❌';
      case 'Draft': return '📝';
      case 'Expired': return '⏰';
      case 'Sent': return '📤';
      case 'Revised': return '🔄';
      default: return '📋';
    }
  };

  return (
    <Box sx={{ 
      p: fullscreen ? 1 : 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {renderDashboardHeader()}
        
        {/* Main Content */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Quotations Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add New Quotation
              </Button>
            </Box>

            {/* Quick Actions Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3, 
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.warning.main, fontWeight: 600 }}>
                ⚡ Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterStatus('Draft');
                    setSearch('');
                    setFilterClient('');
                  }}
                  sx={{ 
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1)
                    }
                  }}
                >
                  Show Drafts
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterStatus('Approved');
                    setSearch('');
                    setFilterClient('');
                  }}
                  sx={{ 
                    borderColor: theme.palette.success.main,
                    color: theme.palette.success.main,
                    '&:hover': {
                      borderColor: theme.palette.success.dark,
                      backgroundColor: alpha(theme.palette.success.main, 0.1)
                    }
                  }}
                >
                  Show Approved
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterStatus('');
                    setSearch('');
                    setFilterClient('');
                    setFilterFrom('');
                    setFilterTo('');
                  }}
                  sx={{ 
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                    '&:hover': {
                      borderColor: theme.palette.info.dark,
                      backgroundColor: alpha(theme.palette.info.main, 0.1)
                    }
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const today = new Date();
                    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                    setFilterFrom(thirtyDaysAgo.toISOString().split('T')[0]);
                    setFilterTo(today.toISOString().split('T')[0]);
                  }}
                  sx={{ 
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                    }
                  }}
                >
                  Last 30 Days
                </Button>
              </Box>
            </Paper>

            {/* Enhanced Filter/Search Controls */}
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
                🔍 Search & Filter Options
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <TextField 
                  label="Search Quotations" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by client, status, or reference..."
                />
                <TextField 
                  label="Client Name" 
                  value={filterClient} 
                  onChange={e => setFilterClient(e.target.value)} 
                  sx={{ minWidth: 180 }} 
                  placeholder="Filter by client..."
                />
                <TextField 
                  select 
                  label="Status Filter" 
                  value={filterStatus} 
                  onChange={e => setFilterStatus(e.target.value)} 
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Draft">📝 Draft</MenuItem>
                  <MenuItem value="Sent">📤 Sent</MenuItem>
                  <MenuItem value="Revised">🔄 Revised</MenuItem>
                  <MenuItem value="Rejected">❌ Rejected</MenuItem>
                  <MenuItem value="Approved">✅ Approved</MenuItem>
                  <MenuItem value="Expired">⏰ Expired</MenuItem>
                </TextField>
                <TextField 
                  label="From Date" 
                  type="date" 
                  value={filterFrom} 
                  onChange={e => setFilterFrom(e.target.value)} 
                  sx={{ minWidth: 150 }} 
                  InputLabelProps={{ shrink: true }} 
                />
                <TextField 
                  label="To Date" 
                  type="date" 
                  value={filterTo} 
                  onChange={e => setFilterTo(e.target.value)} 
                  sx={{ minWidth: 150 }} 
                  InputLabelProps={{ shrink: true }} 
                />
                <Button 
                  variant="outlined" 
                  onClick={handleExportCSV}
                  startIcon={<ExportIcon />}
                  sx={{ 
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                    '&:hover': {
                      borderColor: theme.palette.info.dark,
                      backgroundColor: alpha(theme.palette.info.main, 0.1)
                    }
                  }}
                >
                  Export CSV
                </Button>
              </Box>
            </Paper>

            {/* Enhanced Quotations Table */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Loading quotations...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we fetch your sales data
                </Typography>
              </Box>
            ) : (
              <Paper sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Grand Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredQuotations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" color="text.secondary">
                              No quotations found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Create your first quotation to get started with sales management
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={() => setDialogOpen(true)}
                            >
                              Create First Quotation
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotations.map((q) => (
                        <TableRow key={q._id} hover sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-'}
                              </Typography>
                              {q.validUntil && (
                                <Typography variant="caption" color="text.secondary">
                                  Valid until: {new Date(q.validUntil).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {q.clientName}
                              </Typography>
                              {q.attn && (
                                <Typography variant="caption" color="text.secondary">
                                  Attn: {q.attn}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {q.refCode || q.serialNumber || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${getStatusIcon(q.status)} ${q.status}`}
                              color={getStatusColor(q.status) as any}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                {q.grandTotal ? `${q.grandTotal} KWD` : '-'}
                              </Typography>
                              {q.currency && q.currency !== 'KWD' && (
                                <Typography variant="caption" color="text.secondary">
                                  ({q.currency})
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Tooltip title="Print Quotation">
                                <IconButton 
                                  size="small" 
                                  onClick={() => printQuotation(q)}
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                                  }}
                                >
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Quotation">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditQuotation(q)}
                                  sx={{ 
                                    color: theme.palette.info.main,
                                    '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewQuotation(q)}
                                  sx={{ 
                                    color: theme.palette.success.main,
                                    '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                                  }}
                                >
                                  <AssessmentIcon />
                                </IconButton>
                              </Tooltip>
                              <TextField
                                select
                                size="small"
                                value={q.status}
                                onChange={(e) => handleStatusUpdate(q._id, e.target.value)}
                                sx={{ 
                                  minWidth: 120,
                                  '& .MuiSelect-select': { py: 0.5, px: 1 }
                                }}
                              >
                                <MenuItem value="Draft">📝 Draft</MenuItem>
                                <MenuItem value="Sent">📤 Sent</MenuItem>
                                <MenuItem value="Revised">🔄 Revised</MenuItem>
                                <MenuItem value="Approved">✅ Approved</MenuItem>
                                <MenuItem value="Rejected">❌ Rejected</MenuItem>
                                <MenuItem value="Expired">⏰ Expired</MenuItem>
                              </TextField>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Summary Statistics */}
            {filteredQuotations.length > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  mt: 3, 
                  background: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.success.main, fontWeight: 600 }}>
                  📊 Summary Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Quotations</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {filteredQuotations.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Value</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      {filteredQuotations.reduce((sum, q) => sum + (parseFloat(q.grandTotal) || 0), 0).toLocaleString()} KWD
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Average Value</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {(filteredQuotations.reduce((sum, q) => sum + (parseFloat(q.grandTotal) || 0), 0) / filteredQuotations.length).toLocaleString()} KWD
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Approved Rate</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      {((filteredQuotations.filter(q => q.status === 'Approved').length / filteredQuotations.length) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Paper>
        </motion.div>
        {/* Enhanced Quotation Creation Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
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
                Create New Quotation
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Fill in the details to create a new quotation for your client
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Quotation Details Section */}
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
                  📋 Quotation Details
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField label="Quotation Date" name="quotationDate" type="date" value={quote.quotationDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
                  <TextField label="Valid Until" name="validUntil" type="date" value={quote.validUntil} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
                  <TextField label="Status" name="status" value={quote.status} onChange={handleChange} select fullWidth>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Sent">Sent</MenuItem>
                    <MenuItem value="Revised">Revised</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                  </TextField>
                </Box>
              </Paper>

              {/* Customer Information Section */}
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
                  👥 Customer Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" gap={2}>
                    <TextField label="Client Name" name="clientName" value={quote.clientName} onChange={handleChange} fullWidth required />
                    <TextField label="Date" name="quotationDate" type="date" value={quote.quotationDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Attn." name="attn" value={quote.attn} onChange={handleChange} fullWidth />
                    <TextField label="Ref Code" name="refCode" value={quote.refCode} onChange={handleChange} fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Email" name="email" value={quote.email} onChange={handleChange} fullWidth />
                    <TextField label="Currency" name="currency" value={quote.currency} onChange={handleChange} select fullWidth>
                      {currencyOptions.map(opt => (
                        <MenuItem key={opt.code} value={opt.code}>{opt.code} ({opt.sign})</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Cont No." name="contactNo" value={quote.contactNo} onChange={handleChange} fullWidth />
                    <TextField label="Project" name="project" value={quote.project} onChange={handleChange} fullWidth />
                  </Box>
                  <TextField label="Subject" name="subject" value={quote.subject} onChange={handleChange} fullWidth multiline minRows={2} />
                </Box>
              </Paper>

              {/* Rental Items Section */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.success.main, fontWeight: 600 }}>
                  🚗 Rental Items
                </Typography>
              {rentalItems.map((item, idx) => (
                <Box key={idx} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">Item #{idx + 1}</Typography>
                    {rentalItems.length > 1 && (
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleRemoveRentalItem(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Description"
                      value={item.description}
                      onChange={(e) => handleRentalItemChange(idx, 'description', e.target.value)}
                      fullWidth
                      required
                    />
                    <Box display="flex" gap={2}>
                      <TextField
                        select
                        label="Rent Type"
                        value={item.rentType}
                        onChange={(e) => handleRentalItemChange(idx, 'rentType', e.target.value)}
                        fullWidth
                        required
                      >
                        <MenuItem value="Callout">Callout</MenuItem>
                        <MenuItem value="Monthly">Monthly</MenuItem>
                        <MenuItem value="Trip">Trip</MenuItem>
                      </TextField>
                      <TextField
                        select
                        label="Working Hours"
                        value={item.workingHours}
                        onChange={(e) => handleRentalItemChange(idx, 'workingHours', e.target.value)}
                        fullWidth
                        required
                      >
                        <MenuItem value="8">8 Hours</MenuItem>
                        <MenuItem value="12">12 Hours</MenuItem>
                        <MenuItem value="16">16 Hours</MenuItem>
                        <MenuItem value="24">24 Hours</MenuItem>
                      </TextField>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField
                        label="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleRentalItemChange(idx, 'unitPrice', e.target.value)}
                        type="number"
                        fullWidth
                        required
                        InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }}
                      />
                      <TextField
                        label="Remarks"
                        value={item.remarks}
                        onChange={(e) => handleRentalItemChange(idx, 'remarks', e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={handleAddRentalItem}
                sx={{ mb: 2 }}
              >
                Add More Items
              </Button>
            </Paper>

            {/* Terms & Conditions Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.warning.main, fontWeight: 600 }}>
                📜 Terms & Conditions
              </Typography>
              <TextField
                label="Terms & Conditions"
                name="termsAndConditions"
                value={quote.termsAndConditions}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={8}
                maxRows={15}
                sx={{
                  '& .MuiInputBase-root': {
                    overflow: 'auto',
                    maxHeight: '400px',
                  }
                }}
                placeholder="Enter all terms and conditions here..."
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
                onClick={() => setDialogOpen(false)}
                variant="outlined"
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
              startIcon={<SaveAltIcon />}
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
              Submit Quotation
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
      </AnimatePresence>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add quotation"
        onClick={() => setDialogOpen(true)}
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
    </Box>
  );
};

export default SalesPage; 