import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../apiBase';

interface GLEntry {
  _id: string;
  transactionId: string;
  transactionDate: string;
  moduleSource: string;
  referenceType: string;
  accountCode: string;
  account: {
    accountCode: string;
    accountName: string;
    accountType: string;
    category: string;
  };
  debit: number;
  credit: number;
  description: string;
  narration?: string;
  approvalStatus: string;
  createdBy: {
    email: string;
  };
  runningBalance?: number;
}

interface GLSummary {
  summary: Array<{
    accountCode: string;
    accountName: string;
    accountType: string;
    category: string;
    totalDebits: number;
    totalCredits: number;
    netAmount: number;
    entryCount: number;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    totalEntries: number;
  };
  validation: {
    balance: number;
    isBalanced: boolean;
  };
}

interface TrialBalance {
  trialBalance: {
    [key: string]: Array<{
      accountCode: string;
      accountName: string;
      accountType: string;
      category: string;
      totalDebits: number;
      totalCredits: number;
      balance: number;
    }>;
  };
  totals: {
    totalDebits: number;
    totalCredits: number;
  };
  validation: {
    balance: number;
    isBalanced: boolean;
  };
}

const GeneralLedgerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [glEntries, setGLEntries] = useState<GLEntry[]>([]);
  const [glSummary, setGLSummary] = useState<GLSummary | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    accountCode: '',
    moduleSource: '',
    referenceType: '',
    period: '',
    fiscalYear: new Date().getFullYear().toString(),
    approvalStatus: ''
  });

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalEntries, setTotalEntries] = useState(0);

  // Dialog states
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<GLEntry | null>(null);

  // Load initial data
  useEffect(() => {
    fetchGLData();
  }, [activeTab]);

  // Fetch GL data based on active tab
  const fetchGLData = async () => {
    setLoading(true);
    setError('');

    try {
      switch (activeTab) {
        case 0: // GL Entries
          await fetchGLEntries();
          break;
        case 1: // GL Summary
          await fetchGLSummary();
          break;
        case 2: // Trial Balance
          await fetchTrialBalance();
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch GL data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch GL entries
  const fetchGLEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.accountCode) params.append('accountCode', filters.accountCode);
      if (filters.moduleSource) params.append('moduleSource', filters.moduleSource);
      if (filters.referenceType) params.append('referenceType', filters.referenceType);
      if (filters.period) params.append('period', filters.period);
      if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);

      const response = await api.get(`/gl/entries?${params.toString()}`);
      setGLEntries((response.data as any).entries);
      setTotalEntries((response.data as any).pagination.total);
    } catch (error) {
      console.error('Error fetching GL entries:', error);
      setError('Failed to fetch GL entries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch GL summary
  const fetchGLSummary = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await api.get(`/gl/summary?${params.toString()}`);
      setGLSummary(response.data as GLSummary);
    } catch (error) {
      console.error('Error fetching GL summary:', error);
    }
  };

  // Fetch trial balance
  const fetchTrialBalance = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await api.get(`/gl/trial-balance?${params.toString()}`);
      setTrialBalance(response.data as TrialBalance);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply filters
  const applyFilters = () => {
    fetchGLData();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      accountCode: '',
      moduleSource: '',
      referenceType: '',
      period: '',
      fiscalYear: new Date().getFullYear().toString(),
      approvalStatus: ''
    });
    setPage(0);
  };

  // View entry details
  const handleViewEntry = (entry: GLEntry) => {
    setSelectedEntry(entry);
    setEntryDialogOpen(true);
  };

  // Export data
  const handleExport = async (format: 'json' | 'excel' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.accountCode) params.append('accountCode', filters.accountCode);
      if (filters.moduleSource) params.append('moduleSource', filters.moduleSource);
      
      params.append('format', format);

      const response = await api.get(`/gl/export?${params.toString()}`);
      
      if (format === 'json') {
        // Download JSON file
        const dataStr = JSON.stringify((response.data as any).data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gl-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      setSuccess(`Data exported successfully to ${format.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export data');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Get module source color
  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      hr: 'primary',
      assets: 'secondary',
      operations: 'info',
      maintenance: 'warning',
      procurement: 'success',
      sales: 'error',
      admin: 'default',
      hse: 'primary'
    };
    return colors[module] || 'default';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        General Ledger
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Central accounting book for all financial transactions with IFRS compliance
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="GL Entries" icon={<VisibilityIcon />} />
          <Tab label="GL Summary" icon={<VisibilityIcon />} />
          <Tab label="Trial Balance" icon={<VisibilityIcon />} />
        </Tabs>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          
          <TextField
            label="Start Date"
            type="date"
            value={filters.startDate ? new Date(filters.startDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => handleFilterChange('startDate', new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
          
          <TextField
            label="End Date"
            type="date"
            value={filters.endDate ? new Date(filters.endDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => handleFilterChange('endDate', new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
          
          <TextField
            label="Account Code"
            value={filters.accountCode}
            onChange={(e) => handleFilterChange('accountCode', e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Module Source</InputLabel>
            <Select
              value={filters.moduleSource}
              onChange={(e) => handleFilterChange('moduleSource', e.target.value)}
              label="Module Source"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="assets">Assets</MenuItem>
              <MenuItem value="operations">Operations</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="procurement">Procurement</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="hse">HSE</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              label="Period"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="half_yearly">Half-Yearly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Fiscal Year"
            value={filters.fiscalYear}
            onChange={(e) => handleFilterChange('fiscalYear', e.target.value)}
            size="small"
            type="number"
            sx={{ minWidth: 100 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Approval Status</InputLabel>
            <Select
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
              label="Approval Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={applyFilters}
            startIcon={<SearchIcon />}
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            onClick={resetFilters}
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleExport('json')}
            startIcon={<DownloadIcon />}
          >
            Export JSON
          </Button>
        </Box>
      </Paper>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Debit</TableCell>
                <TableCell>Credit</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : glEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No GL entries found
                  </TableCell>
                </TableRow>
              ) : (
                glEntries.map((entry) => (
                  <TableRow key={entry._id} hover>
                    <TableCell>
                      {new Date(entry.transactionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {entry.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {entry.account.accountCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.account.accountName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {entry.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.moduleSource.toUpperCase()}
                        color={getModuleColor(entry.moduleSource) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {entry.debit > 0 && (
                        <Typography variant="body2" color="error.main" fontWeight="bold">
                          {formatCurrency(entry.debit)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.credit > 0 && (
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {formatCurrency(entry.credit)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.runningBalance !== undefined && (
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(entry.runningBalance)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.approvalStatus}
                        color={getStatusColor(entry.approvalStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewEntry(entry)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalEntries}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {activeTab === 1 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : glSummary ? (
            <>
              {/* Summary Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Total Entries
                    </Typography>
                    <Typography variant="h4">
                      {totalEntries}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main">
                      Total Debits
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(glSummary.totals.totalDebits)}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="warning.main">
                      Total Credits
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(glSummary.totals.totalCredits)}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="info.main">
                      Net Balance
                    </Typography>
                    <Typography variant="h4" color={glSummary.totals.totalDebits === glSummary.totals.totalCredits ? 'success.main' : 'error.main'}>
                      {formatCurrency(glSummary.totals.totalDebits - glSummary.totals.totalCredits)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Summary Table */}
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account Code</TableCell>
                      <TableCell>Account Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Total Debits</TableCell>
                      <TableCell>Total Credits</TableCell>
                      <TableCell>Net Amount</TableCell>
                      <TableCell>Entry Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {glSummary.summary.map((account) => (
                      <TableRow key={account.accountCode} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {account.accountCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>
                          <Chip
                            label={account.accountType}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{account.category}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {formatCurrency(account.totalDebits)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(account.totalCredits)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={account.netAmount >= 0 ? 'primary.main' : 'error.main'}
                          >
                            {formatCurrency(account.netAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{account.entryCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </>
          ) : (
            <Typography>No summary data available</Typography>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : trialBalance ? (
            <>
              {/* Trial Balance Summary */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Total Debits
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {formatCurrency(trialBalance?.totals.totalDebits || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All Accounts
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main">
                      Total Credits
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(trialBalance?.totals.totalCredits || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All Accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Trial Balance by Account Type */}
              {Object.entries(trialBalance.trialBalance).map(([accountType, accounts]) => (
                <Paper key={accountType} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography variant="h6" textTransform="capitalize">
                      {accountType.replace('_', ' ')} Accounts
                    </Typography>
                  </Box>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Account Code</TableCell>
                        <TableCell>Account Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Total Debits</TableCell>
                        <TableCell>Total Credits</TableCell>
                        <TableCell>Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.accountCode} hover>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {account.accountCode}
                            </Typography>
                          </TableCell>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell>{account.category}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error.main">
                              {formatCurrency(account.totalDebits)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main">
                              {formatCurrency(account.totalCredits)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={account.balance >= 0 ? 'primary.main' : 'error.main'}
                            >
                              {formatCurrency(account.balance)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ))}

              {/* Validation Status */}
              <Alert
                severity={trialBalance.validation.isBalanced ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {trialBalance.validation.isBalanced
                  ? 'Trial Balance is balanced ✓'
                  : `Trial Balance is not balanced. Difference: ${formatCurrency(trialBalance.validation.balance)}`
                }
              </Alert>
            </>
          ) : (
            <Typography>No trial balance data available</Typography>
          )}
        </Box>
      )}

      {/* Entry Details Dialog */}
      <Dialog
        open={entryDialogOpen}
        onClose={() => setEntryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>GL Entry Details</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2">Transaction ID</Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedEntry.transactionId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body2">
                    {new Date(selectedEntry.transactionDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Module Source</Typography>
                  <Typography variant="body2">
                    {selectedEntry.moduleSource.toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Reference Type</Typography>
                  <Typography variant="body2">
                    {selectedEntry.referenceType}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Account Code</Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedEntry.accountCode}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Account Name</Typography>
                  <Typography variant="body2">
                    {selectedEntry.account.accountName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Debit</Typography>
                  <Typography variant="body2" color="error.main">
                    {selectedEntry.debit > 0 ? formatCurrency(selectedEntry.debit) : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Credit</Typography>
                  <Typography variant="body2" color="success.main">
                    {selectedEntry.credit > 0 ? formatCurrency(selectedEntry.credit) : '-'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body2">
                    {selectedEntry.description}
                  </Typography>
                </Box>
                {selectedEntry.narration && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2">Narration</Typography>
                    <Typography variant="body2">
                      {selectedEntry.narration}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={selectedEntry.approvalStatus}
                    color={selectedEntry.approvalStatus === 'approved' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Created By</Typography>
                  <Typography variant="body2">
                    {selectedEntry.createdBy.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
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

export default GeneralLedgerPage;
