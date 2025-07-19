import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, MenuItem, Card, CardContent, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';

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
    <Box p={3}>
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Logs</Typography>
            <Typography variant="h5">{fuelLogs.length}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Fuel Logs</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Fuel Log
          </Button>
        </Box>
      </Box>
      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search plate, asset, or client"
          size="small"
          sx={{ minWidth: 220 }}
        />
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Plate Number</th>
              <th>Asset Description</th>
              <th>Current KM</th>
              <th>Last KM</th>
              <th>Distance</th>
              <th>Client</th>
              <th>Type</th>
              <th>Litres</th>
              <th>Price/Litre</th>
              <th>Total Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const asset = typeof log.asset === 'object' ? log.asset : assets.find(a => a._id === log.asset);
              const client = typeof log.client === 'object' ? log.client : clients.find(c => c._id === log.client);
              return (
                <tr key={log._id || idx} style={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td>{log.dateTime ? new Date(log.dateTime).toLocaleString() : ''}</td>
                  <td>{asset?.plateNumber || '-'}</td>
                  <td>{asset?.description || '-'}</td>
                  <td>{log.currentKm}</td>
                  <td>{log.lastKm}</td>
                  <td>{log.distanceTraveled}</td>
                  <td>{client?.name || '-'}</td>
                  <td>{log.type}</td>
                  <td>{log.litresConsumed}</td>
                  <td>{log.pricePerLitre}</td>
                  <td>{log.totalCost}</td>
                  <td>
                    <Box display="flex" gap={1}>
                      <IconButton color="primary" onClick={() => handleOpen(log)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(log._id!)}><DeleteIcon /></IconButton>
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
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Fuel Log' : 'Add Fuel Log'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Date/Time" name="dateTime" value={form.dateTime} onChange={handleFormChange} type="datetime-local" InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField
              label="Search Plate/Asset"
              value={assetSearch}
              onChange={e => setAssetSearch(e.target.value)}
              placeholder="Search by plate or description"
              fullWidth
            />
            <TextField
              select
              label="Select Vehicle (Plate)"
              name="asset"
              value={form.asset}
              onChange={handleFormChange}
              required
              fullWidth
            >
              <MenuItem value="">Select Vehicle</MenuItem>
              {filteredAssets.map(asset => (
                <MenuItem key={asset._id} value={asset._id}>
                  {asset.plateNumber} - {asset.description}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Current KM" name="currentKm" value={form.currentKm} onChange={handleFormChange} type="number" required fullWidth />
            <TextField label="Last KM" name="lastKm" value={form.lastKm} onChange={handleFormChange} type="number" required fullWidth />
            <TextField label="Distance Traveled" name="distanceTraveled" value={form.distanceTraveled || (form.currentKm && form.lastKm ? Number(form.currentKm) - Number(form.lastKm) : '')} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              select
              label="Client"
              name="client"
              value={form.client}
              onChange={handleFormChange}
              required
              fullWidth
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
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="callout">Callout</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <TextField label="Litres Consumed" name="litresConsumed" value={form.litresConsumed} onChange={handleFormChange} type="number" required fullWidth InputProps={{ endAdornment: <InputAdornment position="end">L</InputAdornment> }} />
            <TextField label="Price per Litre" name="pricePerLitre" value={form.pricePerLitre} onChange={handleFormChange} type="number" required fullWidth InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} />
            <TextField label="Total Cost" name="totalCost" value={form.totalCost || (form.litresConsumed && form.pricePerLitre ? Number(form.litresConsumed) * Number(form.pricePerLitre) : '')} InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{editingId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Fuel Log</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this fuel log?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
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