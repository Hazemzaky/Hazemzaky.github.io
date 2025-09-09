import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Divider,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface PendingRequest {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  requestedBy: string;
  department: string;
  requestDate: string;
  requiredDate?: string;
  amount?: number;
  source: string;
  sourcePage: string;
  actions: string[];
}

interface PendingRequestsStats {
  total: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  bySource: Record<string, number>;
  totalValue: number;
}

const PendingRequestsPage: React.FC = () => {
  const muiTheme = useTheme();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [stats, setStats] = useState<PendingRequestsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'byType' | 'byPriority' | 'bySource'>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  useEffect(() => {
    fetchPendingRequests();
    fetchStats();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/pending-requests');
      const data = response.data as any;
      if (data.success) {
        setRequests(data.data as PendingRequest[]);
        setStats(data.stats as PendingRequestsStats);
      } else {
        setError(data.message || 'Failed to fetch pending requests');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Stats are now fetched with the main request
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/procurement/requests/${requestId}`, { status: newStatus });
      setSuccess('Request status updated successfully!');
      fetchPendingRequests();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update request status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/procurement/requests/${requestId}`);
      setSuccess('Request deleted successfully!');
      fetchPendingRequests();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'info';
      case 'in-progress': return 'warning';
      case 'rejected': return 'error';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredRequests = requests.filter(request => {
    if (tab === 'all') return true;
    if (tab === 'byType') return request.type === filterValue;
    if (tab === 'byPriority') return request.priority === filterValue;
    if (tab === 'bySource') return request.source === filterValue;
    return true;
  });

  if (loading && requests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.05)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.05)} 100%)`
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
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: muiTheme.shape.borderRadius,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <DescriptionIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Pending Requests
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage and track all pending procurement requests
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      onClick={fetchPendingRequests} 
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <RefreshIcon />
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

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {[
                {
                  title: 'Total Requests',
                  value: stats.total,
                  icon: <DescriptionIcon />,
                  color: muiTheme.palette.primary.main,
                  bgColor: alpha(muiTheme.palette.primary.main, 0.1)
                },
                {
                  title: 'High Priority',
                  value: stats.byPriority.high || 0,
                  icon: <WarningIcon />,
                  color: muiTheme.palette.error.main,
                  bgColor: alpha(muiTheme.palette.error.main, 0.1)
                },
                {
                  title: 'Urgent',
                  value: stats.byPriority.urgent || 0,
                  icon: <ScheduleIcon />,
                  color: muiTheme.palette.warning.main,
                  bgColor: alpha(muiTheme.palette.warning.main, 0.1)
                },
                {
                  title: 'Total Value',
                  value: formatCurrency(stats.totalValue),
                  icon: <AttachMoneyIcon />,
                  color: muiTheme.palette.info.main,
                  bgColor: alpha(muiTheme.palette.info.main, 0.1)
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
                      borderRadius: muiTheme.shape.borderRadius,
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

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            sx={{ 
              mb: 2,
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              borderRadius: muiTheme.shape.borderRadius
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => {
                setTab(v);
                setFilterValue('');
              }}
              sx={{ mb: 2 }}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label={`All (${requests.length})`} value="all" />
              <Tab label="By Type" value="byType" />
              <Tab label="By Priority" value="byPriority" />
              <Tab label="By Source" value="bySource" />
            </Tabs>
            
            {/* Filter Dropdowns */}
            {tab !== 'all' && (
              <Box sx={{ p: 2, pt: 0 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by {tab === 'byType' ? 'Type' : tab === 'byPriority' ? 'Priority' : 'Source'}</InputLabel>
                  <Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    label={`Filter by ${tab === 'byType' ? 'Type' : tab === 'byPriority' ? 'Priority' : 'Source'}`}
                  >
                    {tab === 'byType' && stats?.byType && Object.keys(stats.byType).map(type => (
                      <MenuItem key={type} value={type}>
                        {type} ({stats.byType[type]})
                      </MenuItem>
                    ))}
                    {tab === 'byPriority' && stats?.byPriority && Object.keys(stats.byPriority).map(priority => (
                      <MenuItem key={priority} value={priority}>
                        {priority.toUpperCase()} ({stats.byPriority[priority]})
                      </MenuItem>
                    ))}
                    {tab === 'bySource' && stats?.bySource && Object.keys(stats.bySource).map(source => (
                      <MenuItem key={source} value={source}>
                        {source.toUpperCase()} ({stats.bySource[source]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            sx={{ 
              p: 3,
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              borderRadius: muiTheme.shape.borderRadius
            }}
          >
            <Typography variant="h6" mb={3} sx={{ color: muiTheme.palette.text.primary, fontWeight: 600 }}>
              📋 Request Details
            </Typography>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Type</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Title</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Requested By</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Department</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Source Page</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Priority</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Status</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Amount</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Request Date</TableCell>
                  <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      <Chip 
                        label={request.type} 
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {request.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{request.requestedBy}</TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{request.department}</TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      <Chip 
                        label={request.sourcePage} 
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      <Chip 
                        label={request.priority.toUpperCase()} 
                        color={getPriorityColor(request.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      <Chip 
                        label={request.status.replace('-', ' ').toUpperCase()} 
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      {request.amount ? formatCurrency(request.amount) : '-'}
                    </TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{formatDate(request.requestDate)}</TableCell>
                    <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {request.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="small"
                            variant="outlined"
                            onClick={() => {/* Handle action */}}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            {action}
                          </Button>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default PendingRequestsPage;
