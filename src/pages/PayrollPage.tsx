import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Snackbar, Alert, MenuItem, Card, CardContent, Avatar, Chip, useTheme, alpha,
  Tabs, Tab, Divider, Badge, Tooltip, Fab, Accordion, AccordionSummary, AccordionDetails
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

interface Payroll {
  _id: string;
  employee: { _id: string; name: string };
  period: string;
  baseSalary: number;
  benefits: number;
  leaveCost: number;
  reimbursements: number;
  deductions: number;
  netPay: number;
  status: string;
  runDate: string;
  serial?: string;
}

interface Period {
  _id: string;
  period: string;
  closed: boolean;
}

interface MonthlyPayrollData {
  month: string;
  year: string;
  monthName: string;
  payrolls: Payroll[];
  totalBaseSalary: number;
  totalBenefits: number;
  totalLeaveCost: number;
  totalReimbursements: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
}

const PayrollPage: React.FC = () => {
  const muiTheme = useTheme();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    employee: '',
    period: '',
    baseSalary: '',
    benefits: '',
    leaveCost: '',
    reimbursements: '',
    deductions: '',
    netPay: '',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Period lock state
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodLocked, setPeriodLocked] = useState(false);

  // Defensive: ensure payrolls is always an array
  const safePayrolls = Array.isArray(payrolls) ? payrolls : [];

  // Group payrolls by month
  const monthlyPayrollData = useMemo(() => {
    if (!Array.isArray(safePayrolls)) return [];
    
    const monthlyGroups: { [key: string]: Payroll[] } = {};
    
    safePayrolls.forEach(payroll => {
      const date = new Date(payroll.runDate);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      
      if (!monthlyGroups[key]) {
        monthlyGroups[key] = [];
      }
      monthlyGroups[key].push(payroll);
    });

    return Object.entries(monthlyGroups)
      .map(([key, monthPayrolls]) => {
        const [year, month] = key.split('-');
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const totals = monthPayrolls.reduce((acc, p) => ({
          totalBaseSalary: acc.totalBaseSalary + p.baseSalary,
          totalBenefits: acc.totalBenefits + p.benefits,
          totalLeaveCost: acc.totalLeaveCost + p.leaveCost,
          totalReimbursements: acc.totalReimbursements + p.reimbursements,
          totalDeductions: acc.totalDeductions + p.deductions,
          totalNetPay: acc.totalNetPay + p.netPay,
        }), {
          totalBaseSalary: 0, totalBenefits: 0, totalLeaveCost: 0,
          totalReimbursements: 0, totalDeductions: 0, totalNetPay: 0
        });

        return {
          month,
          year,
          monthName: monthNames[parseInt(month)],
          payrolls: monthPayrolls,
          employeeCount: monthPayrolls.length,
          ...totals
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        return parseInt(b.month) - parseInt(a.month);
      });
  }, [safePayrolls]);

  const filteredPayrolls = useMemo(() => {
    let data = safePayrolls;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(p =>
        p.employee?.name?.toLowerCase().includes(s) ||
        p.period.toLowerCase().includes(s) ||
        p.status.toLowerCase().includes(s)
      );
    }
    return data;
  }, [safePayrolls, search]);

  const errorNotArray = !Array.isArray(filteredPayrolls) || !Array.isArray(safePayrolls);

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
    fetchPeriods();
  }, []);

  useEffect(() => {
    // Check if form.period is locked
    if (form.period) {
      const found = periods.find(p => p.period === form.period);
      setPeriodLocked(!!(found && found.closed));
    } else {
      setPeriodLocked(false);
    }
  }, [form.period, periods]);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/payrolls');
      if (Array.isArray(res.data)) {
        setPayrolls(res.data);
      } else {
        setPayrolls([]);
        setError('Unexpected response from server');
        console.error('Expected array, got:', res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payrolls');
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
    } catch {}
  };

  const fetchPeriods = async () => {
    try {
      const res = await api.get<Period[]>('/periods');
      if (Array.isArray(res.data)) {
        setPeriods(res.data);
      } else {
        setPeriods([]);
        console.error('Expected array, got:', res.data);
      }
    } catch {}
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      employee: '',
      period: '',
      baseSalary: '',
      benefits: '',
      leaveCost: '',
      reimbursements: '',
      deductions: '',
      netPay: '',
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
      await api.post('/payroll', {
        ...form,
        baseSalary: Number(form.baseSalary),
        benefits: Number(form.benefits),
        leaveCost: Number(form.leaveCost),
        reimbursements: Number(form.reimbursements),
        deductions: Number(form.deductions),
        netPay: Number(form.netPay),
      });
      setSuccess('Payroll created successfully!');
      fetchPayrolls();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'processed': return 'info';
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
                      Payroll Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive payroll processing and monthly reporting
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
                    disabled={periodLocked}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Add Payroll
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
                title: 'Total Payrolls',
                value: payrolls.length,
                icon: <GroupIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Active Employees',
                value: employees.length,
                icon: <PersonIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Total Net Pay',
                value: formatCurrency(payrolls.reduce((sum, p) => sum + p.netPay, 0)),
                icon: <MoneyIcon />,
                color: theme.palette.secondary.main,
                bgColor: alpha(theme.palette.secondary.main, 0.1)
              },
              {
                title: 'Monthly Tables',
                value: monthlyPayrollData.length,
                icon: <CalendarIcon />,
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
                label="Search Payrolls" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by employee, period, or status"
                sx={{ minWidth: 300 }}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
              />
              {periodLocked && (
                <Alert severity="warning" sx={{ ml: 2 }}>
                  This period is locked and cannot be edited.
                </Alert>
              )}
            </Box>
          </Paper>
        </motion.div>

        {/* Monthly Payroll Tables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress size={60} />
            </Box>
          ) : monthlyPayrollData.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No payroll data available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding payroll entries for your employees
              </Typography>
            </Paper>
          ) : (
            monthlyPayrollData.map((monthData, monthIndex) => (
              <motion.div
                key={`${monthData.year}-${monthData.month}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 + monthIndex * 0.1 }}
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
                  {/* Month Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {monthData.monthName} {monthData.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {monthData.employeeCount} employee(s) • {monthData.payrolls.length} payroll entries
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={`Total Net: ${formatCurrency(monthData.totalNetPay)}`}
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  {/* Month Summary Cards */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                    {[
                      { label: 'Base Salary', value: monthData.totalBaseSalary, color: theme.palette.primary.main },
                      { label: 'Benefits', value: monthData.totalBenefits, color: theme.palette.success.main },
                      { label: 'Leave Cost', value: monthData.totalLeaveCost, color: theme.palette.warning.main },
                      { label: 'Reimbursements', value: monthData.totalReimbursements, color: theme.palette.info.main },
                      { label: 'Deductions', value: monthData.totalDeductions, color: theme.palette.error.main },
                      { label: 'Net Pay', value: monthData.totalNetPay, color: theme.palette.secondary.main }
                    ].map((item, idx) => (
                      <Card 
                        key={item.label}
                        elevation={0}
                        sx={{ 
                          background: alpha(item.color, 0.05),
                          border: `1px solid ${alpha(item.color, 0.2)}`,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(item.color, 0.2)}`
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                            {formatCurrency(item.value)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  {/* Monthly Payroll Table */}
                  <TableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.1) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Base Salary</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Benefits</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Leave Cost</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Reimbursements</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Deductions</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Net Pay</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Run Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Serial</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthData.payrolls.map((p, idx) => (
                          <TableRow 
                            key={p._id} 
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
                                  {p.employee?.name?.charAt(0) || '?'}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {p.employee?.name || '-'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{p.period}</TableCell>
                            <TableCell>{formatCurrency(p.baseSalary)}</TableCell>
                            <TableCell>{formatCurrency(p.benefits)}</TableCell>
                            <TableCell>{formatCurrency(p.leaveCost)}</TableCell>
                            <TableCell>{formatCurrency(p.reimbursements)}</TableCell>
                            <TableCell>{formatCurrency(p.deductions)}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                {formatCurrency(p.netPay)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={p.status} 
                                size="small" 
                                color={getStatusColor(p.status) as any}
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>{new Date(p.runDate).toLocaleDateString()}</TableCell>
                            <TableCell>{p.serial || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Payroll Dialog */}
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
                Add New Payroll Entry
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Create payroll record for employee
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
            {/* Employee and Period Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                👤 Employee & Period
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
                  {employees.map(e => (
                    <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                  ))}
                </TextField>
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

            {/* Salary Components Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                💰 Salary Components
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <TextField 
                  label="Base Salary" 
                  name="baseSalary" 
                  value={form.baseSalary} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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
                  label="Benefits" 
                  name="benefits" 
                  value={form.benefits} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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
                  label="Leave Cost" 
                  name="leaveCost" 
                  value={form.leaveCost} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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
                  label="Reimbursements" 
                  name="reimbursements" 
                  value={form.reimbursements} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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
                  label="Deductions" 
                  name="deductions" 
                  value={form.deductions} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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
                  label="Net Pay" 
                  name="netPay" 
                  value={form.netPay} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  type="number"
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

            {/* Status Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                📊 Status & Processing
              </Typography>
              <TextField 
                label="Status" 
                name="status" 
                value={form.status} 
                onChange={handleFormChange} 
                required 
                fullWidth 
                select
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processed">Processed</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </TextField>
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
            disabled={submitting || periodLocked}
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
            {submitting ? 'Creating...' : 'Create Payroll'}
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
        aria-label="add payroll"
        onClick={handleOpen}
        disabled={periodLocked}
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

export default PayrollPage;
