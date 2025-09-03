import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Paper, Button, Divider, TextField, MenuItem, 
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Chip, 
  CircularProgress, Alert, useTheme, alpha, Avatar, Badge, IconButton, InputAdornment
} from '@mui/material';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import api from '../apiBase';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import AddIcon from '@mui/icons-material/Add';
import WaterIcon from '@mui/icons-material/Water';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  success: 'success',
  failed: 'error',
  manual: 'warning',
  tamper: 'info',
};

const WaterLogPage: React.FC = () => {
  const muiTheme = useTheme();
  
  // Water trips state
  const [waterTrips, setWaterTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWaterTrips = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/tracker/water-trips');
        setWaterTrips(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch water trips');
      } finally {
        setLoading(false);
      }
    };
    fetchWaterTrips();
  }, []);

  // Prepaid Card Management state
  const [cards, setCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState('');
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeCard, setRechargeCard] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cardHistories, setCardHistories] = useState<Record<string, any[]>>({});
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addCardForm, setAddCardForm] = useState({ cardId: '', client: '', balance: '' });
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [addCardError, setAddCardError] = useState('');
  const [addCardSuccess, setAddCardSuccess] = useState('');

  // Fetch cards data
  useEffect(() => {
    const fetchCards = async () => {
      setCardsLoading(true);
      setCardsError('');
      try {
        const res = await api.get('/water-logs/prepaid-cards');
        setCards(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setCardsError(err.response?.data?.message || 'Failed to fetch cards');
      } finally {
        setCardsLoading(false);
      }
    };
    fetchCards();
  }, []);

  // Station Activity Tracker state
  const stationNames = [
    'Shuwaikh',
    'Shuaiba North',
    'Shuaiba South',
    'Doha East',
    'Doha West',
    'Zour South',
    'Zour North',
    'Sabiya',
  ];
  const [stationTracks, setStationTracks] = useState<any[]>([]);
  const [addStationOpen, setAddStationOpen] = useState(false);
  const [stationForm, setStationForm] = useState({
    station: '',
    status: 'Online',
    lastDispense: '',
    operator: '',
  });

  // Add state for alerts
  const [alerts, setAlerts] = useState<any>(null);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      setAlertsLoading(true);
      setAlertsError('');
      try {
        const res = await api.get('/water-logs/alerts');
        setAlerts(res.data);
      } catch (err: any) {
        setAlertsError(err.response?.data?.message || 'Failed to fetch alerts');
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const [usageChart, setUsageChart] = useState<any[]>([]);
  const [usageChartLoading, setUsageChartLoading] = useState(false);
  const [usageChartError, setUsageChartError] = useState('');

  useEffect(() => {
    const fetchUsageChart = async () => {
      setUsageChartLoading(true);
      setUsageChartError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/water-logs/client-usage-chart', { headers: { Authorization: `Bearer ${token}` } });
        setUsageChart(res.data as any[]);
      } catch (err: any) {
        setUsageChartError(err.response?.data?.message || 'Failed to fetch usage chart');
      } finally {
        setUsageChartLoading(false);
      }
    };
    fetchUsageChart();
  }, []);

  const [cardLimits, setCardLimits] = useState<any[]>([]);
  const [cardLimitsLoading, setCardLimitsLoading] = useState(false);
  const [cardLimitsError, setCardLimitsError] = useState('');

  useEffect(() => {
    const fetchCardLimits = async () => {
      setCardLimitsLoading(true);
      setCardLimitsError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/water-logs/card-usage-limits', { headers: { Authorization: `Bearer ${token}` } });
        setCardLimits(res.data as any[]);
      } catch (err: any) {
        setCardLimitsError(err.response?.data?.message || 'Failed to fetch card usage limits');
      } finally {
        setCardLimitsLoading(false);
      }
    };
    fetchCardLimits();
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date & Time', 'Card ID', 'Client Name', 'Tanker Plate No.', 'Station', 'Volume (Liters)', 'Unit Price', 'Total Cost', 'Filled By', 'Status'];
    const rows = waterTrips.map(trip => [
      trip.date ? new Date(trip.date).toLocaleString() : '',
      trip.waterCardNo || '',
      trip.name || '',
      trip.trailerNumber || '',
      trip.to || '',
      trip.gallons || '',
      '', // Unit Price
      '', // Total Cost
      trip.name || '',
      '', // Status
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'water_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  // Print
  const handlePrint = () => {
    window.print();
  };

  // Add Card handler
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCardLoading(true);
    setAddCardError('');
    setAddCardSuccess('');
    try {
      await api.post('/water-logs/prepaid-cards', {
        cardId: addCardForm.cardId,
        client: addCardForm.client,
        balance: Number(addCardForm.balance),
      });
      setAddCardSuccess('Card added successfully!');
      setAddCardOpen(false);
      setAddCardForm({ cardId: '', client: '', balance: '' });
      // Refresh cards
      const res = await api.get('/water-logs/prepaid-cards');
      setCards(res.data as any[]);
    } catch (err: any) {
      setAddCardError(err.response?.data?.message || 'Failed to add card');
    } finally {
      setAddCardLoading(false);
    }
  };

  // Recharge handler
  const handleRecharge = async () => {
    setRechargeLoading(true);
    setRechargeError('');
    setRechargeSuccess('');
    try {
      await api.post('/water-logs/prepaid-cards/recharge', {
        cardId: rechargeCard.cardId,
        amount: Number(rechargeAmount),
      });
      setRechargeSuccess('Card recharged!');
      setRechargeOpen(false);
      setRechargeAmount('');
      setRechargeCard(null);
      // Refresh cards
      const res = await api.get('/water-logs/prepaid-cards');
      setCards(res.data as any[]);
    } catch (err: any) {
      setRechargeError(err.response?.data?.message || 'Failed to recharge card');
    } finally {
      setRechargeLoading(false);
    }
  };

  // Block/Activate handler
  const handleBlockActivate = async (card: any, action: 'block' | 'activate') => {
    try {
      await api.post('/water-logs/prepaid-cards/block-activate', {
        cardId: card.cardId,
        action,
      });
      // Refresh cards
      const res = await api.get('/water-logs/prepaid-cards');
      setCards(res.data as any[]);
    } catch {}
  };

  // Expand/collapse card accordion
  const handleExpandCard = async (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
      return;
    }
    setExpandedCard(cardId);
    // Fetch history if not already loaded
    if (!cardHistories[cardId]) {
      setHistoryLoading(true);
      try {
        const res = await api.get('/water-logs', {
          params: { prepaidCard: cardId },
        });
        setCardHistories(prev => ({ ...prev, [cardId]: (res.data as any).logs }));
      } catch {}
      setHistoryLoading(false);
    }
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
                    <WaterIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Water Management System
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive water dispensing tracking and card management
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SaveAltIcon />} 
                    onClick={handleExportCSV}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<PrintIcon />} 
                    onClick={handlePrint}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Print
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
                title: 'Total Water Dispensed Today',
                value: '-- L',
                icon: <WaterIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Water Dispensed This Month',
                value: '-- L',
                icon: <TrendingUpIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Number of Tankers Filled',
                value: '--',
                icon: <LocalShippingIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Active Prepaid Cards',
                value: cards.length || 0,
                icon: <CheckCircleIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              },
              {
                title: 'Total Alerts',
                value: alerts ? Object.values(alerts).reduce((sum: any, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0) : 0,
                icon: <WarningIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1)
              },
              {
                title: 'Station Status',
                value: '8 Active',
                icon: <InfoIcon />,
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
                      {String(card.value)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
              </Box>
        </motion.div>
             </AnimatePresence>
       
       <Divider sx={{ my: 3 }} />
       
       <AnimatePresence>
         {/* 2. Water Dispensing Logs Table (Read-only, from Tracker) */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.6 }}
         >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              💧 Water Dispensing Logs (from Tracker)
            </Typography>
          </Box>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Water Card No</TableCell>
                  <TableCell>Gallons</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>TMR</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Dept Requester</TableCell>
                  <TableCell>VPN</TableCell>
                  <TableCell>Trailer Number</TableCell>
                  <TableCell>Driver Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Date Loaded</TableCell>
                  <TableCell>Returned Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waterTrips.map(trip => (
                  <TableRow key={trip._id}>
                    <TableCell>{trip.waterCardNo || '-'}</TableCell>
                    <TableCell>{trip.gallons || '-'}</TableCell>
                    <TableCell>{trip.date ? new Date(trip.date).toLocaleString() : '-'}</TableCell>
                    <TableCell>{trip.TMR || '-'}</TableCell>
                    <TableCell>{trip.from || '-'}</TableCell>
                    <TableCell>{trip.to || '-'}</TableCell>
                    <TableCell>{trip.departmentRequester || '-'}</TableCell>
                    <TableCell>{trip.VPN || '-'}</TableCell>
                    <TableCell>{trip.trailerNumber || '-'}</TableCell>
                    <TableCell>{trip.name || '-'}</TableCell>
                    <TableCell>{trip.contact || '-'}</TableCell>
                    <TableCell>{trip.dateLoaded ? new Date(trip.dateLoaded).toLocaleString() : '-'}</TableCell>
                    <TableCell>{trip.returnedDate ? new Date(trip.returnedDate).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
        </motion.div>
        
        {/* Water Card Balance Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            💳 Water Card Balance Management
          </Typography>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
        {cardsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : cardsError ? (
          <Alert severity="error">{cardsError}</Alert>
        ) : cards.length === 0 ? (
          <Typography>No water cards found.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Card ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Remaining Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map(card => (
                  <TableRow key={card._id} sx={{ backgroundColor: card.status === 'Blocked' || card.balance === 0 ? '#ffebee' : undefined }}>
                    <TableCell>{card.cardId}</TableCell>
                    <TableCell>{card.client?.name || card.client || '-'}</TableCell>
                    <TableCell>{card.balance}</TableCell>
                    <TableCell>
                      {card.status === 'Blocked' || card.balance === 0 ? (
                        <Chip label="Expired Card" color="error" size="small" />
                      ) : (
                        <Chip label="Active" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{card.lastUsed ? new Date(card.lastUsed).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
        </motion.div>
        
                {/* 3. Prepaid Card Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            💳 Prepaid Card Management
          </Typography>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1">Prepaid Cards</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddCardOpen(true)}>Add Card</Button>
        </Box>
        {cardsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : cardsError ? (
          <Alert severity="error">{cardsError}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Card ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map(card => (
                  <React.Fragment key={card._id}>
                    <TableRow hover>
                      <TableCell>{card.cardId}</TableCell>
                      <TableCell>{card.client?.name || card.client || '-'}</TableCell>
                      <TableCell>{card.lastUsed ? new Date(card.lastUsed).toLocaleString() : '-'}</TableCell>
                      <TableCell>{card.balance}</TableCell>
                      <TableCell>
                        <Chip label={card.status} color={card.status === 'Active' ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => { setRechargeCard(card); setRechargeOpen(true); }}>Recharge</Button>
                        <Button size="small" variant="outlined" color={card.status === 'Active' ? 'error' : 'success'} sx={{ ml: 1 }} onClick={() => handleBlockActivate(card, card.status === 'Active' ? 'block' : 'activate')}>
                          {card.status === 'Active' ? 'Block' : 'Activate'}
                        </Button>
                        <IconButton size="small" onClick={() => handleExpandCard(card._id)} aria-label="expand row">
                          <ExpandMoreIcon style={{ transform: expandedCard === card._id ? 'rotate(180deg)' : undefined, transition: '0.2s' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0, background: '#f9f9f9' }}>
                        <Collapse in={expandedCard === card._id} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <Typography variant="subtitle2">Card Info</Typography>
                            <Typography variant="body2">Card ID: {card.cardId}</Typography>
                            <Typography variant="body2">Client: {card.client?.name || card.client || '-'}</Typography>
                            <Typography variant="body2">Balance: {card.balance}</Typography>
                            <Typography variant="body2">Status: {card.status}</Typography>
                            <Typography variant="body2">Last Used: {card.lastUsed ? new Date(card.lastUsed).toLocaleString() : '-'}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2">Transaction History</Typography>
                            {historyLoading ? <CircularProgress size={20} /> : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date/Time</TableCell>
                                    <TableCell>Volume</TableCell>
                                    <TableCell>Total Cost</TableCell>
                                    <TableCell>Station</TableCell>
                                    <TableCell>Status</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(cardHistories[card._id] || []).map((log: any) => (
                                    <TableRow key={log._id}>
                                      <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                                      <TableCell>{log.volume}</TableCell>
                                      <TableCell>{log.totalCost}</TableCell>
                                      <TableCell>{log.station}</TableCell>
                                      <TableCell><Chip label={log.status} color={statusColors[log.status] || 'default'} size="small" /></TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Add Card Modal */}
        <Dialog 
          open={addCardOpen} 
          onClose={() => setAddCardOpen(false)} 
          maxWidth="sm" 
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
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Add Prepaid Card
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Create a new water card for client
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
            <Box component="form" onSubmit={handleAddCard} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Card ID" 
                name="cardId" 
                value={addCardForm.cardId} 
                onChange={e => setAddCardForm(f => ({ ...f, cardId: e.target.value }))} 
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
              <TextField 
                label="Client" 
                name="client" 
                value={addCardForm.client} 
                onChange={e => setAddCardForm(f => ({ ...f, client: e.target.value }))} 
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
              <TextField 
                label="Initial Balance" 
                name="balance" 
                value={addCardForm.balance} 
                onChange={e => setAddCardForm(f => ({ ...f, balance: e.target.value }))} 
                required 
                fullWidth 
                type="number"
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
              {addCardError && <Alert severity="error">{addCardError}</Alert>}
              {addCardSuccess && <Alert severity="success">{addCardSuccess}</Alert>}
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
              onClick={() => setAddCardOpen(false)} 
              disabled={addCardLoading}
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
              onClick={handleAddCard} 
              variant="contained" 
              color="primary" 
              disabled={addCardLoading}
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
              Add Card
            </Button>
          </DialogActions>
        </Dialog>
        {/* Recharge Modal */}
        <Dialog 
          open={rechargeOpen} 
          onClose={() => setRechargeOpen(false)} 
          maxWidth="xs" 
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
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              color: theme.palette.success.main,
              borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}>
                <AttachMoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Recharge Card
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Add funds to water card
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
              background: alpha(theme.palette.success.main, 0.1),
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -15, 
              left: -15, 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              background: alpha(theme.palette.primary.main, 0.08),
              zIndex: 1
            }} />
          </DialogTitle>
          <DialogContent sx={{ mt: 2, p: 3 }}>
            <TextField 
              label="Amount" 
              value={rechargeAmount} 
              onChange={e => setRechargeAmount(e.target.value)} 
              type="number" 
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
            {rechargeError && <Alert severity="error" sx={{ mt: 2 }}>{rechargeError}</Alert>}
            {rechargeSuccess && <Alert severity="success" sx={{ mt: 2 }}>{rechargeSuccess}</Alert>}
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
              onClick={() => setRechargeOpen(false)} 
              disabled={rechargeLoading}
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
              onClick={handleRecharge} 
              variant="contained" 
              color="success" 
              disabled={rechargeLoading || !rechargeAmount}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}
            >
              Recharge
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
        </motion.div>
        
        {/* 4. Station Activity Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            🏭 Station Activity Tracker
          </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom>Station Activity Tracker</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddStationOpen(true)}>Add Station Track</Button>
      </Box>
      <Dialog 
        open={addStationOpen} 
        onClose={() => setAddStationOpen(false)} 
        maxWidth="xs" 
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            color: theme.palette.info.main,
            borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
              <InfoIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Add Station Track
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Track station activity and status
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
            background: alpha(theme.palette.primary.main, 0.08),
            zIndex: 1
          }} />
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              select 
              label="Station Name" 
              name="station" 
              value={stationForm.station} 
              onChange={e => setStationForm(f => ({ ...f, station: e.target.value }))} 
              required 
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
              <MenuItem value="">Select Station</MenuItem>
              {stationNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </TextField>
            <TextField 
              select 
              label="Status" 
              name="status" 
              value={stationForm.status} 
              onChange={e => setStationForm(f => ({ ...f, status: e.target.value }))} 
              required 
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
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Offline">Offline</MenuItem>
            </TextField>
            <TextField 
              label="Last Dispense" 
              name="lastDispense" 
              type="datetime-local" 
              value={stationForm.lastDispense} 
              onChange={e => setStationForm(f => ({ ...f, lastDispense: e.target.value }))} 
              InputLabelProps={{ shrink: true }} 
              required 
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
            />
            <TextField 
              label="Operator" 
              name="operator" 
              value={stationForm.operator} 
              onChange={e => setStationForm(f => ({ ...f, operator: e.target.value }))} 
              required 
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
            />
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
            onClick={() => setAddStationOpen(false)}
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
            onClick={() => {
              setStationTracks(tracks => [...tracks, { ...stationForm }]);
              setAddStationOpen(false);
              setStationForm({ station: '', status: 'Online', lastDispense: '', operator: '' });
            }} 
            variant="contained" 
            color="info"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.6)}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Add Station
          </Button>
        </DialogActions>
      </Dialog>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
            <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Station Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Dispense</TableCell>
                <TableCell>Operator</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stationTracks.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No station tracks added yet.</TableCell></TableRow>
              ) : stationTracks.map((track, idx) => (
                <TableRow key={idx}>
                  <TableCell>{track.station}</TableCell>
                  <TableCell>
                    <Chip label={track.status} color={track.status === 'Online' ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell>{track.lastDispense ? new Date(track.lastDispense).toLocaleString() : '-'}</TableCell>
                  <TableCell>{track.operator}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        </motion.div>
        
        {/* 5. Alerts & Exceptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            ⚠️ Alerts & Exceptions
          </Typography>
      
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
            {alertsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : alertsError ? (
          <Alert severity="error">{alertsError}</Alert>
        ) : alerts ? (
          <>
            {/* Failed Cards */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Cards that Failed</Typography>
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Card ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.failedCards?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">No failed cards.</TableCell></TableRow>
                  ) : alerts.failedCards?.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                      <TableCell>{log.cardId}</TableCell>
                      <TableCell>{log.client?.name || '-'}</TableCell>
                      <TableCell>{log.station}</TableCell>
                      <TableCell>{log.volume}</TableCell>
                      <TableCell><Chip label={log.status} color="error" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Manual Fills */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Manual Fills</Typography>
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Card ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.manualFills?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">No manual fills.</TableCell></TableRow>
                  ) : alerts.manualFills?.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                      <TableCell>{log.cardId}</TableCell>
                      <TableCell>{log.client?.name || '-'}</TableCell>
                      <TableCell>{log.station}</TableCell>
                      <TableCell>{log.volume}</TableCell>
                      <TableCell><Chip label={log.status} color="warning" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Suspicious Logs */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Suspicious Logs (Volume &gt; 20,000)</Typography>
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Card ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.suspiciousLogs?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">No suspicious logs.</TableCell></TableRow>
                  ) : alerts.suspiciousLogs?.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                      <TableCell>{log.cardId}</TableCell>
                      <TableCell>{log.client?.name || '-'}</TableCell>
                      <TableCell>{log.station}</TableCell>
                      <TableCell>{log.volume}</TableCell>
                      <TableCell><Chip label={log.status} color="info" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Tamper Alerts */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Tamper Alerts</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Card ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.tamperAlerts?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">No tamper alerts.</TableCell></TableRow>
                  ) : alerts.tamperAlerts?.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                      <TableCell>{log.cardId}</TableCell>
                      <TableCell>{log.client?.name || '-'}</TableCell>
                      <TableCell>{log.station}</TableCell>
                      <TableCell>{log.volume}</TableCell>
                      <TableCell><Chip label={log.status} color="secondary" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </Paper>
        </motion.div>
        
        {/* 6. Quick Actions / Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            ⚡ Quick Actions / Shortcuts
          </Typography>
          <Box display="flex" gap={2} mb={3}>
            <Button variant="outlined" sx={{ 
              borderColor: theme.palette.primary.main, 
              color: theme.palette.primary.main,
              '&:hover': { borderColor: theme.palette.primary.dark }
            }}>View Card History</Button>
            <Button variant="outlined" sx={{ 
              borderColor: theme.palette.secondary.main, 
              color: theme.palette.secondary.main,
              '&:hover': { borderColor: theme.palette.secondary.dark }
            }}>Add Manual Entry</Button>
            <Button variant="outlined" sx={{ 
              borderColor: theme.palette.success.main, 
              color: theme.palette.success.main,
              '&:hover': { borderColor: theme.palette.success.dark }
            }}>Export Report</Button>
            <Button variant="outlined" sx={{ 
              borderColor: theme.palette.info.main, 
              color: theme.palette.info.main,
              '&:hover': { borderColor: theme.palette.info.dark }
            }}>Print Receipt</Button>
          </Box>
        </motion.div>
        
        {/* 7. Client Water Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            📊 Client Water Usage Chart
          </Typography>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
            {usageChartLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
            ) : usageChartError ? (
              <Alert severity="error">{usageChartError}</Alert>
            ) : usageChart.length === 0 ? (
              <Typography>No data available.</Typography>
            ) : (
              // If recharts is not installed, run: npm install recharts
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={usageChart}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey={d => `${d.client} (W${d.week})`} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Volume (L)" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </motion.div>
        
        {/* 8. Card Usage Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            📋 Card Usage Limits
          </Typography>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: theme.shape.borderRadius
          }}>
            {cardLimitsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
            ) : cardLimitsError ? (
              <Alert severity="error">{cardLimitsError}</Alert>
            ) : cardLimits.length === 0 ? (
              <Typography>No cards exceeding usage limits.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Card ID</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Dispenses Today</TableCell>
                      <TableCell>Volume This Week</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cardLimits.map((row: any) => (
                      <TableRow key={row.cardId}>
                        <TableCell>{row.cardId}</TableCell>
                        <TableCell>{row.client}</TableCell>
                        <TableCell>{row.dispensesToday}</TableCell>
                        <TableCell>{row.volumeThisWeek}</TableCell>
                        <TableCell><Chip label={row.status} color={row.status === 'Blocked' ? 'error' : 'success'} size="small" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default WaterLogPage; 