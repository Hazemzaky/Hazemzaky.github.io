import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, MenuItem, Card, CardContent, InputAdornment, useTheme, alpha, Avatar, Badge, Divider, LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

interface Asset {
  _id: string;
  plateNumber: string;
  description: string;
}
interface Client {
  _id: string;
  name: string;
}
interface FuelLog {
  _id?: string;
  dateTime: string;
  asset: string | Asset;
  currentKm: number;
  lastKm: number;
  distanceTraveled: number;
  client: string | Client;
  type: 'callout' | 'monthly';
  litresConsumed: number;
  pricePerLitre: number;
  totalCost: number;
}

const defaultForm = {
  dateTime: '',
  asset: '',
  currentKm: '',
  lastKm: '',
  client: '',
  type: '',
  litresConsumed: '',
  pricePerLitre: '',
};

const FuelLogsPage: React.FC = () => {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');

  useEffect(() => {
    fetchFuelLogs();
    fetchAssets();
    fetchClients();
  }, []);

  const fetchFuelLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<FuelLog[]>('/fuel-logs');
      setFuelLogs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fuel logs');
    } finally {
      setLoading(false);
    }
  };
  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data as Asset[]);
    } catch {}
  };
  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data as Client[]);
    } catch {}
  };

  const handleOpen = (log?: FuelLog) => {
    if (log) {
      setEditingId(log._id!);
      setForm({
        dateTime: log.dateTime ? log.dateTime.slice(0, 16) : '',
        asset: typeof log.asset === 'object' ? log.asset._id : log.asset,
        currentKm: log.currentKm,
        lastKm: log.lastKm,
        client: typeof log.client === 'object' ? log.client._id : log.client,
        type: log.type,
        litresConsumed: log.litresConsumed,
        pricePerLitre: log.pricePerLitre,
      });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => {
      let updated = { ...prev, [name]: value };
      // Auto-calculate distanceTraveled if currentKm or lastKm changes
      if (name === 'currentKm' || name === 'lastKm') {
        const current = Number(name === 'currentKm' ? value : updated.currentKm);
        const last = Number(name === 'lastKm' ? value : updated.lastKm);
        if (!isNaN(current) && !isNaN(last)) {
          updated.distanceTraveled = current - last;
        }
      }
      // Auto-calculate totalCost if litresConsumed or pricePerLitre changes
      if (name === 'litresConsumed' || name === 'pricePerLitre') {
        const litres = Number(name === 'litresConsumed' ? value : updated.litresConsumed);
        const price = Number(name === 'pricePerLitre' ? value : updated.pricePerLitre);
        if (!isNaN(litres) && !isNaN(price)) {
          updated.totalCost = litres * price;
        }
      }
      return updated;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const submitData = {
        ...form,
        currentKm: Number(form.currentKm),
        lastKm: Number(form.lastKm),
        litresConsumed: Number(form.litresConsumed),
        pricePerLitre: Number(form.pricePerLitre),
        distanceTraveled: Number(form.currentKm) - Number(form.lastKm),
        totalCost: Number(form.litresConsumed) * Number(form.pricePerLitre),
      };
      if (editingId) {
        await api.put(`/fuel-logs/${editingId}`, submitData);
        setSuccess('Fuel log updated!');
      } else {
        await api.post('/fuel-logs', submitData);
        setSuccess('Fuel log created!');
      }
      fetchFuelLogs();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save fuel log');
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/fuel-logs/${deleteId}`);
      setSuccess('Fuel log deleted!');
      fetchFuelLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete fuel log');
    } finally {
      setDeleteId(null);
    }
  };

  // Filtered assets for vehicle search
  const filteredAssets = useMemo(() => {
    if (!assetSearch.trim()) return assets;
    const s = assetSearch.trim().toLowerCase();
    return assets.filter(a =>
      (a.plateNumber && a.plateNumber.toLowerCase().includes(s)) ||
      (a.description && a.description.toLowerCase().includes(s))
    );
  }, [assets, assetSearch]);

  // Filtered logs for search
  const filteredLogs = useMemo(() => {
    if (!search.trim()) return fuelLogs;
    const s = search.trim().toLowerCase();
    return fuelLogs.filter(log => {
      const asset = typeof log.asset === 'object' ? log.asset : assets.find(a => a._id === log.asset);
      const client = typeof log.client === 'object' ? log.client : clients.find(c => c._id === log.client);
      return (
        (asset?.plateNumber || '').toLowerCase().includes(s) ||
        (asset?.description || '').toLowerCase().includes(s) ||
        (client?.name || '').toLowerCase().includes(s)
      );
    });
  }, [fuelLogs, search, assets, clients]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date/Time', 'Plate Number', 'Asset Description', 'Current KM', 'Last KM', 'Distance', 'Client', 'Type', 'Litres', 'Price/Litre', 'Total Cost'];
    const rows = filteredLogs.map(log => {
      const asset = typeof log.asset === 'object' ? log.asset : assets.find(a => a._id === log.asset);
      const client = typeof log.client === 'object' ? log.client : clients.find(c => c._id === log.client);
      return [
        log.dateTime ? new Date(log.dateTime).toLocaleString() : '',
        asset?.plateNumber || '',
        asset?.description || '',
        log.currentKm,
        log.lastKm,
        log.distanceTraveled,
        client?.name || '',
        log.type,
        log.litresConsumed,
        log.pricePerLitre,
        log.totalCost,
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Fuel Logs');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('fuel_logs');
    a.click();
    window.URL.revokeObjectURL(url);
  };
  // Print
  const handlePrint = () => {
    const printHeader = addPrintHeader('Fuel Logs');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fuel Logs Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printHeader}
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
                    <LocalGasStationIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Fuel Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive fuel consumption tracking and cost analysis
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleOpen()}
                  startIcon={<AddIcon />}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Fuel Log
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

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total Fuel Logs',
                value: fuelLogs.length,
                icon: <LocalGasStationIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Litres Consumed',
                value: fuelLogs.reduce((sum, log) => sum + log.litresConsumed, 0).toFixed(1) + 'L',
                icon: <TrendingUpIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Total Cost',
                value: fuelLogs.reduce((sum, log) => sum + log.totalCost, 0).toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <AttachMoneyIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Active Vehicles',
                value: Array.from(new Set(fuelLogs.map(log => typeof log.asset === 'object' ? log.asset._id : log.asset))).length,
                icon: <DirectionsCarIcon />,
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

        {/* Search and Export Section */}
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
              🔍 Search & Export Options
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search plate, asset, or client"
                size="small"
                sx={{ minWidth: 220 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
              />
              <Button 
                variant="outlined" 
                startIcon={<SaveAltIcon />} 
                onClick={handleExportCSV}
                sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
              >
                Export CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                onClick={handlePrint}
                sx={{ borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main }}
              >
                Print
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Fuel Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📋 Fuel Consumption Records
            </Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Date/Time</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Plate Number</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Asset Description</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Current KM</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Last KM</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Distance</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Litres</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Price/Litre</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Total Cost</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const asset = typeof log.asset === 'object' ? log.asset : assets.find(a => a._id === log.asset);
                  const client = typeof log.client === 'object' ? log.client : clients.find(c => c._id === log.client);
                  return (
                    <tr key={log._id || idx} style={{ 
                      background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8)
                    }}>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{log.dateTime ? new Date(log.dateTime).toLocaleString() : ''}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee', color: theme.palette.primary.main, fontWeight: 500 }}>{asset?.plateNumber || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset?.description || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{log.currentKm}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{log.lastKm}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee', color: theme.palette.success.main, fontWeight: 500 }}>{log.distanceTraveled}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{client?.name || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <Badge 
                          badgeContent={log.type} 
                          color={log.type === 'callout' ? 'warning' : 'info'}
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
                        />
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee', color: theme.palette.warning.main, fontWeight: 500 }}>{log.litresConsumed}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{log.pricePerLitre}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee', color: theme.palette.error.main, fontWeight: 600 }}>{log.totalCost}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <Box display="flex" gap={1}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpen(log)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => setDeleteId(log._id!)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1)
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && <Typography align="center" sx={{ mt: 2 }}>Loading...</Typography>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Add/Edit Dialog */}
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
              <LocalGasStationIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {editingId ? 'Edit Fuel Log' : 'Add New Fuel Log'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {editingId ? 'Update fuel consumption details' : 'Record new fuel consumption entry'}
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
            {/* Date and Time Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                📅 Date & Time Information
              </Typography>
              <TextField 
                label="Date/Time" 
                name="dateTime" 
                value={form.dateTime} 
                onChange={handleFormChange} 
                type="datetime-local" 
                InputLabelProps={{ shrink: true }} 
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

            {/* Vehicle Selection Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                🚗 Vehicle Selection
              </Typography>
              <TextField
                label="Search Plate/Asset"
                value={assetSearch}
                onChange={e => setAssetSearch(e.target.value)}
                placeholder="Search by plate or description"
                fullWidth
                size="medium"
                sx={{ mb: 2,
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
                select
                label="Select Vehicle (Plate)"
                name="asset"
                value={form.asset}
                onChange={handleFormChange}
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
                <MenuItem value="">Select Vehicle</MenuItem>
                {filteredAssets.map(asset => (
                  <MenuItem key={asset._id} value={asset._id}>
                    {asset.plateNumber} - {asset.description}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Distance Tracking Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                📏 Distance Tracking
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Current KM" 
                  name="currentKm" 
                  value={form.currentKm} 
                  onChange={handleFormChange} 
                  type="number" 
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
                  label="Last KM" 
                  name="lastKm" 
                  value={form.lastKm} 
                  onChange={handleFormChange} 
                  type="number" 
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
              </Box>
              <TextField 
                label="Distance Traveled" 
                name="distanceTraveled" 
                value={form.distanceTraveled || (form.currentKm && form.lastKm ? Number(form.currentKm) - Number(form.lastKm) : '')} 
                InputProps={{ readOnly: true }} 
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
            </Box>

            {/* Client and Type Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                👥 Client & Service Type
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField
                  select
                  label="Client"
                  name="client"
                  value={form.client}
                  onChange={handleFormChange}
                  required
                  fullWidth
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
                  <MenuItem value="">Select Client</MenuItem>
                  {clients.map(client => (
                    <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Type"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                  fullWidth
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
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="callout">Callout</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Fuel Consumption Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.error.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.error.main }}>
                ⛽ Fuel Consumption Details
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Litres Consumed" 
                  name="litresConsumed" 
                  value={form.litresConsumed} 
                  onChange={handleFormChange} 
                  type="number" 
                  required 
                  fullWidth
                  size="medium"
                  InputProps={{ 
                    endAdornment: <InputAdornment position="end">L</InputAdornment> 
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.error.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.error.main,
                      },
                    },
                  }}
                />
                <TextField 
                  label="Price per Litre" 
                  name="pricePerLitre" 
                  value={form.pricePerLitre} 
                  onChange={handleFormChange} 
                  type="number" 
                  required 
                  fullWidth
                  size="medium"
                  InputProps={{ 
                    endAdornment: <InputAdornment position="end">KWD</InputAdornment> 
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.error.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.error.main,
                      },
                    },
                  }}
                />
              </Box>
              <TextField 
                label="Total Cost" 
                name="totalCost" 
                value={form.totalCost || (form.litresConsumed && form.pricePerLitre ? Number(form.litresConsumed) * Number(form.pricePerLitre) : '')} 
                InputProps={{ 
                  readOnly: true, 
                  endAdornment: <InputAdornment position="end">KWD</InputAdornment> 
                }} 
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.error.main,
                    },
                  },
                }}
              />
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
            disabled={false}
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
            disabled={false}
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
            {editingId ? 'Update Fuel Log' : 'Create Fuel Log'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)}
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
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)`,
            color: theme.palette.error.main,
            borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Delete Fuel Log
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Confirm deletion of this fuel consumption record
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
            background: alpha(theme.palette.error.main, 0.1),
            zIndex: 1
          }} />
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Typography>Are you sure you want to delete this fuel log?</Typography>
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
            onClick={() => setDeleteId(null)}
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
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.6)}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Delete
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
    </Box>
  );
};

export default FuelLogsPage; 