import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Snackbar, Alert, MenuItem, Card, CardContent, Avatar, Chip, useTheme, alpha, Fab
} from '@mui/material';
import {
  Search as SearchIcon, Close as CloseIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as ViewIcon, FilterList as FilterIcon,
  ViewList as ViewListIcon, ViewModule as ViewModuleIcon, 
  Person as PersonIcon, Work as WorkIcon, AttachMoney as MoneyIcon,
  Event as EventIcon, ExpandMore as ExpandMoreIcon, 
  TrendingUp as TrendingUpIcon, Group as GroupIcon, 
  LocationOn as LocationIcon, Phone as PhoneIcon, Email as EmailIcon,
  CalendarToday as CalendarIcon, Star as StarIcon, Remove as RemoveIcon,
  MoreVert as MoreVertIcon, Download as DownloadIcon, Upload as UploadIcon,
  FilterAlt as FilterAltIcon, Sort as SortIcon, VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon, Error as ErrorIcon,
  Schedule as ScheduleIcon, Assignment as AssignmentIcon, Security as SecurityIcon,
  LocalShipping as LocalShippingIcon, Build as BuildIcon, School as SchoolIcon,
  Assessment as AssessmentIcon, Timeline as TimelineIcon, Notifications as NotificationsIcon,
  Archive as ArchiveIcon, Restore as RestoreIcon, Block as BlockIcon, VerifiedUser as VerifiedUserIcon,
  EmojiEvents as EmojiEventsIcon, Psychology as PsychologyIcon, Analytics as AnalyticsIcon,
  QrCode as QrCodeIcon, Badge as BadgeIcon, WorkHistory as WorkHistoryIcon,
  AccessTime as AccessTimeIcon, LocationCity as LocationCityIcon, Business as BusinessIcon,
  Cancel as CancelIcon, Message as MessageIcon, Login as LoginIcon, Logout as LogoutIcon, EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../apiBase';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

interface Reimbursement {
  _id: string;
  employee: { _id: string; name: string } | string;
  amount: number;
  description: string;
  date: string;
  status: string;
  approvedBy?: { _id: string; name: string };
  payroll?: string;
  serial?: string;
}

const ReimbursementsPage: React.FC = () => {
  const muiTheme = useTheme();
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    employee: '',
    amount: '',
    description: '',
    date: '',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Defensive: ensure employees is always an array
  const safeEmployees = Array.isArray(employees) ? employees : [];

  useEffect(() => {
    fetchReimbursements();
    fetchEmployees();
  }, []);

  const fetchReimbursements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reimbursements');
      if (Array.isArray(res.data)) {
        setReimbursements(res.data);
      } else {
        setReimbursements([]);
        setError('Unexpected response from server');
        console.error('Expected array, got:', res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reimbursements');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get<{ _id: string; name: string }[]>('/employees');
      if (Array.isArray(res.data)) {
        setEmployees(res.data as { _id: string; name: string }[]);
      } else {
        setEmployees([]);
        console.error('Expected array, got:', res.data);
      }
    } catch (err: any) {
      setEmployees([]);
      console.error('Failed to fetch employees:', err);
    }
  };

  const filteredReimbursements = useMemo(() => {
    let data = reimbursements;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(r =>
        typeof r.employee === 'object' && r.employee.name?.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s)
      );
    }
    return data;
  }, [reimbursements, search]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      employee: '',
      amount: '',
      description: '',
      date: '',
      status: 'pending',
    });
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reimbursements', {
        ...form,
        amount: Number(form.amount),
      });
      setSuccess('Reimbursement created successfully!');
      fetchReimbursements();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reimbursement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/reimbursements/${id}/approve`, {});
      setSuccess('Reimbursement approved!');
      fetchReimbursements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve reimbursement');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/reimbursements/${id}/reject`, {});
      setSuccess('Reimbursement rejected!');
      fetchReimbursements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject reimbursement');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
                    <MoneyIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Reimbursements
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage employee expense reimbursements and approvals
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  <Button
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    startIcon={<ViewListIcon />}
                    onClick={() => setViewMode('table')}
                    sx={{ 
                      bgcolor: viewMode === 'table' ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Table View
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                    startIcon={<ViewModuleIcon />}
                    onClick={() => setViewMode('cards')}
                    sx={{ 
                      bgcolor: viewMode === 'cards' ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Card View
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpen}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Add Reimbursement
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

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total Reimbursements',
                value: reimbursements.length,
                icon: <MoneyIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Pending Approvals',
                value: reimbursements.filter(r => r.status === 'pending').length,
                icon: <ScheduleIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Approved',
                value: reimbursements.filter(r => r.status === 'approved').length,
                icon: <CheckCircleIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Total Amount',
                value: formatCurrency(reimbursements.reduce((sum, r) => sum + r.amount, 0)),
                icon: <MoneyIcon />,
                color: theme.palette.secondary.main,
                bgColor: alpha(theme.palette.secondary.main, 0.1)
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

        {/* Search and Filters */}
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
              🔍 Search & Filters
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField 
                label="Search Reimbursements" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by employee, description, or status"
                sx={{ minWidth: 300 }}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
              />
            </Box>
          </Paper>
        </motion.div>

        {/* Reimbursements Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Serial Number</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReimbursements.map((r, idx) => (
                      <TableRow 
                        key={r._id} 
                        sx={{ 
                          background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {typeof r.employee === 'object' ? r.employee.name?.charAt(0) || '?' : '?'}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {typeof r.employee === 'object' ? r.employee.name : r.employee}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {formatCurrency(r.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{r.description}</TableCell>
                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={r.status} 
                            size="small" 
                            color={getStatusColor(r.status) as any}
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>{r.serial || '-'}</TableCell>
                        <TableCell>
                          {r.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="success" 
                                onClick={() => handleApprove(r._id)}
                                sx={{ 
                                  borderColor: theme.palette.success.main,
                                  color: theme.palette.success.main,
                                  '&:hover': {
                                    borderColor: theme.palette.success.dark,
                                    color: theme.palette.success.dark,
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="error" 
                                onClick={() => handleReject(r._id)}
                                sx={{ 
                                  borderColor: theme.palette.error.main,
                                  color: theme.palette.error.main,
                                  '&:hover': {
                                    borderColor: theme.palette.error.dark,
                                    color: theme.palette.error.dark,
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Add Reimbursement Dialog */}
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
              <MoneyIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Add New Reimbursement
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Create reimbursement request for employee
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
            {/* Employee and Amount Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                👤 Employee & Amount
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Employee"
                  name="employee"
                  value={form.employee}
                  onChange={handleFormChange}
                  required
                  select
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
                >
                  <MenuItem value="">Select Employee</MenuItem>
                  {safeEmployees.map(e => (
                    <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                  ))}
                </TextField>
                <TextField 
                  label="Amount" 
                  name="amount" 
                  value={form.amount} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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

            {/* Description and Date Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                📝 Details & Date
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                        borderColor: theme.palette.success.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.success.main,
                      },
                    },
                  }}
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
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  '& .MuiAlert-icon': {
                    color: theme.palette.error.main
                  }
                }}
              >
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
            color="primary" 
            disabled={submitting}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
              }
            }}
          >
            {submitting ? 'Creating...' : 'Create Reimbursement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add reimbursement"
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
    </Box>
  );
};

export default ReimbursementsPage;