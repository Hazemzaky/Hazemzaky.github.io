import React, { useState, useMemo, useEffect } from 'react';
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
  // Table state
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add Log state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    dateTime: '',
    prepaidCard: '', // New field for prepaid card ID
    cardId: '',
    client: '',
    tankerPlateNo: '',
    station: '',
    volume: '',
    unitPrice: '',
    totalCost: '',
    filledBy: '',
    status: 'success',
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

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

  // Fetch logs from backend
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const params: any = {
          page: page + 1,
          limit: rowsPerPage,
        };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        if (stationFilter) params.station = stationFilter;
        if (clientFilter) params.client = clientFilter;
        const token = localStorage.getItem('token');
        const res = await api.get('/water-logs', {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data as { logs: any[]; total: number };
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [search, statusFilter, stationFilter, clientFilter, page, rowsPerPage]);

  // Fetch cards
  useEffect(() => {
    const fetchCards = async () => {
      setCardsLoading(true);
      setCardsError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/water-logs/prepaid-cards', { headers: { Authorization: `Bearer ${token}` } });
        setCards(res.data as any[]);
      } catch (err: any) {
        setCardsError(err.response?.data?.message || 'Failed to fetch cards');
      } finally {
        setCardsLoading(false);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      setAlertsLoading(true);
      setAlertsError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/water-logs/alerts', { headers: { Authorization: `Bearer ${token}` } });
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
    const rows = logs.map(log => [
      new Date(log.dateTime).toLocaleString(),
      log.cardId,
      log.client?.name || '',
      log.tankerPlateNo,
      log.station,
      log.volume,
      log.unitPrice,
      log.totalCost,
      log.filledBy?.name || '',
      log.status,
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

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
    if (name === 'volume' || name === 'unitPrice') {
      const v = name === 'volume' ? value : addForm.volume;
      const u = name === 'unitPrice' ? value : addForm.unitPrice;
      setAddForm(prev => ({ ...prev, totalCost: v && u ? String(Number(v) * Number(u)) : '' }));
    }
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...addForm,
        volume: Number(addForm.volume),
        unitPrice: Number(addForm.unitPrice),
        totalCost: Number(addForm.totalCost),
        dateTime: addForm.dateTime ? new Date(addForm.dateTime) : new Date(),
      };
      await api.post('/water-logs', submitData, { headers: { Authorization: `Bearer ${token}` } });
      setAddOpen(false);
      setAddForm({ dateTime: '', prepaidCard: '', cardId: '', client: '', tankerPlateNo: '', station: '', volume: '', unitPrice: '', totalCost: '', filledBy: '', status: 'success' });
      setPage(0);
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add log');
    } finally {
      setAddLoading(false);
    }
  };

  // Add Card handler
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCardLoading(true);
    setAddCardError('');
    setAddCardSuccess('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/water-logs/prepaid-cards', {
        cardId: addCardForm.cardId,
        client: addCardForm.client,
        balance: Number(addCardForm.balance),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAddCardSuccess('Card added successfully!');
      setAddCardOpen(false);
      setAddCardForm({ cardId: '', client: '', balance: '' });
      // Refresh cards
      const res = await api.get('/water-logs/prepaid-cards', { headers: { Authorization: `Bearer ${token}` } });
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
      const token = localStorage.getItem('token');
      await api.post('/water-logs/prepaid-cards/recharge', {
        cardId: rechargeCard.cardId,
        amount: Number(rechargeAmount),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRechargeSuccess('Card recharged!');
      setRechargeOpen(false);
      setRechargeAmount('');
      setRechargeCard(null);
      // Refresh cards
      const res = await api.get('/water-logs/prepaid-cards', { headers: { Authorization: `Bearer ${token}` } });
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
      const token = localStorage.getItem('token');
      await api.post('/water-logs/prepaid-cards/block-activate', {
        cardId: card.cardId,
        action,
      }, { headers: { Authorization: `Bearer ${token}` } });
      // Refresh cards
      const res = await api.get('/water-logs/prepaid-cards', { headers: { Authorization: `Bearer ${token}` } });
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
        const token = localStorage.getItem('token');
        const res = await api.get('/water-logs', {
          params: { prepaidCard: cardId },
          headers: { Authorization: `Bearer ${token}` },
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
      {/* 2. Water Dispensing Logs Table */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Water Dispensing Logs</Typography>
        <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>Add Water Dispense Log</Button>
      </Box>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Water Dispense Log</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Date & Time" name="dateTime" type="datetime-local" value={addForm.dateTime} onChange={handleAddChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField
              select
              label="Prepaid Card"
              name="prepaidCard"
              value={addForm.prepaidCard || ''}
              onChange={e => {
                const cardId = e.target.value;
                setAddForm(prev => {
                  const card = cards.find(c => c._id === cardId);
                  return {
                    ...prev,
                    prepaidCard: cardId,
                    cardId: card ? card.cardId : '',
                    client: card && card.client ? card.client._id || card.client : prev.client,
                  };
                });
              }}
              fullWidth
              required
            >
              <MenuItem value="">Select Prepaid Card</MenuItem>
              {cards.map(card => (
                <MenuItem key={card._id} value={card._id}>
                  {card.cardId} - {card.client?.name || card.client || '-'}
                </MenuItem>
              ))}
            </TextField>
            {/* Show card info if selected */}
            {addForm.prepaidCard && (() => {
              const card = cards.find((c: any) => c._id === addForm.prepaidCard);
              if (!card) return null;
              return (
                <Box sx={{ mb: 1, ml: 1 }}>
                  <Typography variant="body2">Balance: <b>{card.balance}</b></Typography>
                  <Typography variant="body2">Client: <b>{card.client?.name || card.client || '-'}</b></Typography>
                  <Typography variant="body2">Status: <b>{card.status}</b></Typography>
                </Box>
              );
            })()}
            <TextField label="Client" name="client" value={addForm.client} onChange={handleAddChange} fullWidth required disabled={!!addForm.prepaidCard} />
            <TextField label="Tanker Plate No." name="tankerPlateNo" value={addForm.tankerPlateNo} onChange={handleAddChange} fullWidth required />
            <TextField label="Station" name="station" value={addForm.station} onChange={handleAddChange} fullWidth required />
            <TextField label="Volume (Liters)" name="volume" value={addForm.volume} onChange={handleAddChange} type="number" fullWidth required />
            <TextField label="Unit Price" name="unitPrice" value={addForm.unitPrice} onChange={handleAddChange} type="number" fullWidth required />
            <TextField label="Total Cost" name="totalCost" value={addForm.totalCost} InputProps={{ readOnly: true }} fullWidth required />
            <TextField label="Filled By" name="filledBy" value={addForm.filledBy} onChange={handleAddChange} fullWidth />
            <TextField label="Status" name="status" value={addForm.status} onChange={handleAddChange} select fullWidth required>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="tamper">Tamper</MenuItem>
            </TextField>
            {addError && <Alert severity="error">{addError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="primary" disabled={addLoading}>Add</Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <TextField label="Search" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} size="small" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <TextField label="Status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} size="small" select sx={{ minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="tamper">Tamper</MenuItem>
          </TextField>
          <TextField label="Station" value={stationFilter} onChange={e => { setStationFilter(e.target.value); setPage(0); }} size="small" sx={{ minWidth: 120 }} />
          <TextField label="Client" value={clientFilter} onChange={e => { setClientFilter(e.target.value); setPage(0); }} size="small" sx={{ minWidth: 120 }} />
          <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Card ID</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Tanker Plate No.</TableCell>
                  <TableCell>Station</TableCell>
                  <TableCell>Volume (Liters)</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Filled By</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log._id} sx={{ backgroundColor: log.status === 'success' ? '#e8f5e9' : log.status === 'failed' ? '#ffebee' : log.status === 'manual' ? '#fffde7' : '#e3f2fd' }}>
                    <TableCell>{new Date(log.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{log.cardId}</TableCell>
                    <TableCell>{log.client?.name || ''}</TableCell>
                    <TableCell>{log.tankerPlateNo}</TableCell>
                    <TableCell>{log.station}</TableCell>
                    <TableCell>{log.volume}</TableCell>
                    <TableCell>{log.unitPrice}</TableCell>
                    <TableCell>{log.totalCost}</TableCell>
                    <TableCell>{log.filledBy?.name || ''}</TableCell>
                    <TableCell><Chip label={log.status} color={statusColors[log.status]} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
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