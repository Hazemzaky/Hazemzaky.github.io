import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AccountingSidebar from '../components/AccountingSidebar';
import axios from 'axios';

const journalTypes = ['All', 'Sales', 'Purchase', 'Misc'];
const statuses = ['All', 'Draft', 'Posted'];

const JournalEntriesPage: React.FC = () => {
  const [journalType, setJournalType] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: '', description: '', period: '', reference: '', lines: [{ account: '', debit: 0, credit: 0, description: '' }] });
  const [submitting, setSubmitting] = useState(false);
  const [viewEntry, setViewEntry] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [accounts, setAccounts] = useState<{ _id: string; name: string }[]>([]);

  const theme = useTheme();

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
  }, [journalType, status]);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (status !== 'All') params.status = status.toLowerCase();
      // Optionally add journalType/dateRange filters
      const res = await axios.get('/api/journal-entries', { params });
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleOpen = () => {
    setForm({ date: '', description: '', period: '', reference: '', lines: [{ account: '', debit: 0, credit: 0, description: '' }] });
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setError('');
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleLineChange = (idx: number, field: string, value: any) => {
    const newLines = [...form.lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    setForm({ ...form, lines: newLines });
  };
  
  const handleAddLine = () => {
    setForm({ ...form, lines: [...form.lines, { account: '', debit: 0, credit: 0, description: '' }] });
  };
  
  const handleRemoveLine = (idx: number) => {
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  };
  
  const totalDebit = form.lines.reduce((sum, l) => sum + Number(l.debit), 0);
  const totalCredit = form.lines.reduce((sum, l) => sum + Number(l.credit), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setError('Debits and credits must be equal and non-zero.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/journal-entries', form);
      fetchEntries();
      handleClose();
      setSuccess('Journal entry created successfully!');
    } catch (err: any) {
      setError('Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (entry: any) => {
    setViewEntry(entry);
    setViewOpen(true);
  };
  
  const handleViewClose = () => {
    setViewOpen(false);
    setViewEntry(null);
  };

  // Calculate statistics
  const totalEntries = entries.length;
  const postedEntries = entries.filter(e => e.status === 'posted').length;
  const draftEntries = entries.filter(e => e.status === 'draft').length;
  const totalDebitAmount = entries.reduce((sum, entry) => 
    sum + entry.lines.reduce((lineSum: number, line: any) => lineSum + Number(line.debit), 0), 0
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafdff' }}>
      <AccountingSidebar />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, ml: '220px', width: '100%' }}>
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
                      <ReceiptIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Manual Journal Entries
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Create and manage manual journal entries with full audit trail
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpen}
                    startIcon={<AddIcon />}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    + New Journal Entry
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {[
                {
                  title: 'Total Entries',
                  value: totalEntries,
                  icon: <ReceiptIcon />,
                  color: theme.palette.primary.main,
                  bgColor: alpha(theme.palette.primary.main, 0.1)
                },
                {
                  title: 'Posted Entries',
                  value: postedEntries,
                  icon: <CheckCircleIcon />,
                  color: theme.palette.success.main,
                  bgColor: alpha(theme.palette.success.main, 0.1)
                },
                {
                  title: 'Draft Entries',
                  value: draftEntries,
                  icon: <WarningIcon />,
                  color: theme.palette.warning.main,
                  bgColor: alpha(theme.palette.warning.main, 0.1)
                },
                {
                  title: 'Total Debit',
                  value: `$${totalDebitAmount.toLocaleString()}`,
                  icon: <TrendingUpIcon />,
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
                🔍 Entry Filters & Search
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Journal Type</InputLabel>
                  <Select
                    value={journalType}
                    onChange={(e) => setJournalType(e.target.value)}
                    label="Journal Type"
                  >
                    {journalTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label="Status"
                  >
                    {statuses.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField 
                  label="Date Range" 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)} 
                  sx={{ minWidth: 180 }}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={fetchEntries}
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
                  onClick={() => {
                    setJournalType('All');
                    setStatus('All');
                    setDateRange('');
                  }}
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

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: theme.shape.borderRadius,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Entry Number</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Reference</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Debit Total</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Credit Total</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((row, idx) => (
                        <TableRow 
                          key={row._id} 
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
                              {row.serial || row._id}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                          <TableCell>{row.reference}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                              ${row.lines.reduce((sum: number, l: any) => sum + Number(l.debit), 0).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                              ${row.lines.reduce((sum: number, l: any) => sum + Number(l.credit), 0).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={row.status} 
                              color={row.status === 'posted' ? 'success' : 'warning'} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Entry">
                                <IconButton
                                  size="small"
                                  onClick={() => handleView(row)}
                                  sx={{ 
                                    color: theme.palette.info.main,
                                    '&:hover': { 
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* New Journal Entry Modal */}
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
                  Add Journal Entry
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Create a new manual journal entry with balanced debits and credits
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
                  📝 Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <TextField 
                      label="Date" 
                      name="date" 
                      value={form.date} 
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
                  <Box sx={{ flex: '1 1 200px' }}>
                    <TextField 
                      label="Period" 
                      name="period" 
                      value={form.period} 
                      onChange={handleFormChange} 
                      required 
                      fullWidth 
                      placeholder="e.g. 2024-Q2 or 2024-05"
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
                <Box sx={{ mt: 2 }}>
                  <TextField 
                    label="Description" 
                    name="description" 
                    value={form.description} 
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
                <Box sx={{ mt: 2 }}>
                  <TextField 
                    label="Reference" 
                    name="reference" 
                    value={form.reference} 
                    onChange={handleFormChange} 
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

              {/* Journal Lines Section */}
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                  📊 Journal Lines
                </Typography>
                {form.lines.map((line, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, p: 2, background: alpha(theme.palette.background.paper, 0.5), borderRadius: 1 }}>
                    <TextField
                      label="Account"
                      value={line.account}
                      onChange={(e) => handleLineChange(idx, 'account', e.target.value)}
                      required
                      select
                      sx={{ minWidth: 200 }}
                      size="small"
                    >
                      <MenuItem value="">Select Account</MenuItem>
                      {accounts.map(a => (
                        <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
                      ))}
                    </TextField>
                    <TextField 
                      label="Debit" 
                      type="number" 
                      value={line.debit} 
                      onChange={(e) => handleLineChange(idx, 'debit', Number(e.target.value))} 
                      required 
                      sx={{ maxWidth: 120 }}
                      size="small"
                    />
                    <TextField 
                      label="Credit" 
                      type="number" 
                      value={line.credit} 
                      onChange={(e) => handleLineChange(idx, 'credit', Number(e.target.value))} 
                      required 
                      sx={{ maxWidth: 120 }}
                      size="small"
                    />
                    <TextField 
                      label="Line Description" 
                      value={line.description} 
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)} 
                      sx={{ minWidth: 200 }}
                      size="small"
                    />
                    <IconButton 
                      onClick={() => handleRemoveLine(idx)} 
                      color="error" 
                      disabled={form.lines.length === 1}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button 
                  onClick={handleAddLine} 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  sx={{ width: 180, mb: 2 }}
                >
                  Add Line
                </Button>
                
                {/* Balance Check */}
                <Box sx={{ 
                  p: 2, 
                  background: isBalanced ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  borderRadius: 2,
                  border: `1px solid ${isBalanced ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.3)}`,
                  mt: 2
                }}>
                  <Typography variant="body2" sx={{ 
                    color: isBalanced ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    Total Debit: ${totalDebit.toLocaleString()} | Total Credit: ${totalCredit.toLocaleString()} 
                    {isBalanced ? ' ✓ (Balanced)' : ' ✗ (Not Balanced)'}
                  </Typography>
                </Box>
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
              color="primary" 
              disabled={submitting || !isBalanced}
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
              Create Entry
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Entry Modal */}
        <Dialog 
          open={viewOpen} 
          onClose={handleViewClose} 
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
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.dark, 0.1)} 100%)`,
              color: theme.palette.info.main,
              borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                <VisibilityIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Journal Entry Details
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  View complete journal entry information and line details
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
              background: alpha(theme.palette.info.main, 0.1),
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -15, 
              left: -15, 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              background: alpha(theme.palette.info.dark, 0.08),
              zIndex: 1
            }} />
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {viewEntry ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Entry Header */}
                <Box sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    📋 Entry Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(viewEntry.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Reference:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {viewEntry.reference || '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Description:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {viewEntry.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Journal Lines */}
                <Box sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                    📊 Journal Lines
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: alpha(theme.palette.info.main, 0.1) }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.info.main }}>Account</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.info.main }}>Debit</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.info.main }}>Credit</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.info.main }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewEntry.lines.map((line: any, idx: number) => (
                        <TableRow 
                          key={idx}
                          sx={{ 
                            background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.3) : 'transparent',
                            '&:hover': {
                              background: alpha(theme.palette.info.main, 0.05)
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {typeof line.account === 'object' ? line.account.name : line.account}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                              ${Number(line.debit).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                              ${Number(line.credit).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {line.description || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            ) : (
              <Typography>No details found.</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleViewClose}
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
              Close
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
    </Box>
  );
};

export default JournalEntriesPage; 