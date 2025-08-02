import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Paper, Button, Divider, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, InputAdornment, Chip, CircularProgress, Alert } from '@mui/material';
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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  success: 'success',
  failed: 'error',
  manual: 'warning',
  tamper: 'info',
};

const WaterLogPage: React.FC = () => {
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Water Log</Typography>
      {/* 1. Summary Dashboard */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Card sx={{ minWidth: 220, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Water Dispensed Today</Typography>
            <Typography variant="h5">-- L</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 220, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Water Dispensed This Month</Typography>
            <Typography variant="h5">-- L</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 220, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">Number of Tankers Filled</Typography>
            <Typography variant="h5">--</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 220, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">Top 5 Clients by Volume</Typography>
            <Typography variant="body2">(Chart/Ranking Placeholder)</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 220, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">Stations with Highest Usage</Typography>
            <Typography variant="body2">(Chart/Ranking Placeholder)</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 220, flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">Prepaid Balance Alerts</Typography>
            <Typography variant="body2">(Low balance clients)</Typography>
          </CardContent>
        </Card>
      </Box>
      <Divider sx={{ my: 3 }} />
      {/* 2. Water Dispensing Logs Table (Read-only, from Tracker) */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Water Dispensing Logs (from Tracker)</Typography>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
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
      {/* Water Card Balance Management */}
      <Typography variant="h6" gutterBottom>Water Card Balance Management</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
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
      {/* 3. Prepaid Card Management */}
      <Typography variant="h6" gutterBottom>Prepaid Card Management</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
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
        <Dialog open={addCardOpen} onClose={() => setAddCardOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Prepaid Card</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleAddCard} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Card ID" name="cardId" value={addCardForm.cardId} onChange={e => setAddCardForm(f => ({ ...f, cardId: e.target.value }))} required fullWidth />
              <TextField label="Client" name="client" value={addCardForm.client} onChange={e => setAddCardForm(f => ({ ...f, client: e.target.value }))} required fullWidth />
              <TextField label="Initial Balance" name="balance" value={addCardForm.balance} onChange={e => setAddCardForm(f => ({ ...f, balance: e.target.value }))} required fullWidth type="number" />
              {addCardError && <Alert severity="error">{addCardError}</Alert>}
              {addCardSuccess && <Alert severity="success">{addCardSuccess}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddCardOpen(false)} disabled={addCardLoading}>Cancel</Button>
            <Button onClick={handleAddCard} variant="contained" color="primary" disabled={addCardLoading}>Add</Button>
          </DialogActions>
        </Dialog>
        {/* Recharge Modal */}
        <Dialog open={rechargeOpen} onClose={() => setRechargeOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Recharge Card</DialogTitle>
          <DialogContent>
            <TextField label="Amount" value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value)} type="number" fullWidth sx={{ mt: 2 }} />
            {rechargeError && <Alert severity="error" sx={{ mt: 2 }}>{rechargeError}</Alert>}
            {rechargeSuccess && <Alert severity="success" sx={{ mt: 2 }}>{rechargeSuccess}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRechargeOpen(false)} disabled={rechargeLoading}>Cancel</Button>
            <Button onClick={handleRecharge} variant="contained" color="primary" disabled={rechargeLoading || !rechargeAmount}>Recharge</Button>
          </DialogActions>
        </Dialog>
      </Paper>
      {/* 4. Station Activity Tracker */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom>Station Activity Tracker</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddStationOpen(true)}>Add Station Track</Button>
      </Box>
      <Dialog open={addStationOpen} onClose={() => setAddStationOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Station Track</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Station Name" name="station" value={stationForm.station} onChange={e => setStationForm(f => ({ ...f, station: e.target.value }))} required fullWidth>
              <MenuItem value="">Select Station</MenuItem>
              {stationNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </TextField>
            <TextField select label="Status" name="status" value={stationForm.status} onChange={e => setStationForm(f => ({ ...f, status: e.target.value }))} required fullWidth>
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Offline">Offline</MenuItem>
            </TextField>
            <TextField label="Last Dispense" name="lastDispense" type="datetime-local" value={stationForm.lastDispense} onChange={e => setStationForm(f => ({ ...f, lastDispense: e.target.value }))} InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="Operator" name="operator" value={stationForm.operator} onChange={e => setStationForm(f => ({ ...f, operator: e.target.value }))} required fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStationOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            setStationTracks(tracks => [...tracks, { ...stationForm }]);
            setAddStationOpen(false);
            setStationForm({ station: '', status: 'Online', lastDispense: '', operator: '' });
          }} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ p: 2, mb: 3 }}>
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
      {/* 5. Alerts & Exceptions */}
      <Typography variant="h6" gutterBottom>Alerts & Exceptions</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
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
      {/* 6. Quick Actions / Shortcuts */}
      <Typography variant="h6" gutterBottom>Quick Actions</Typography>
      <Box display="flex" gap={2} mb={3}>
        <Button variant="outlined">View Card History</Button>
        <Button variant="outlined">Add Manual Entry</Button>
        <Button variant="outlined">Export Report</Button>
        <Button variant="outlined">Print Receipt</Button>
      </Box>
      {/* 7. Client Water Usage Chart */}
      <Typography variant="h6" gutterBottom>Client Water Usage Chart</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
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
      {/* 8. Card Usage Limits */}
      <Typography variant="h6" gutterBottom>Card Usage Limits</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
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
    </Box>
  );
};

export default WaterLogPage; 