import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import {
  Box, Button, Card, CardContent, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';

interface Asset {
  _id: string;
  description: string;
  type: string;
  brand: string;
  purchaseDate: string;
  purchaseValue: number;
  usefulLifeMonths: number;
  salvageValue: number;
  status: string;
  chassisNumber?: string;
  plateNumber?: string;
  serialNumber?: string;
  fleetNumber?: string;
  serial?: string; // Added serial/document number
}

interface Depreciation {
  _id: string;
  asset: { _id: string; description: string } | string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

const DepreciationDashboard: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [depreciation, setDepreciation] = useState<Depreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetDetailOpen, setAssetDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assetsRes, depreciationRes] = await Promise.all([
        api.get<Asset[]>('/assets'),
        api.get<Depreciation[]>('/depreciation')
      ]);
      setAssets(assetsRes.data);
      setDepreciation(depreciationRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily depreciation for an asset
  const calculateDailyDepreciation = (asset: Asset) => {
    if (!asset.purchaseValue || !asset.salvageValue || !asset.usefulLifeMonths) return 0;
    const totalDepreciableValue = asset.purchaseValue - asset.salvageValue;
    const usefulLifeDays = asset.usefulLifeMonths * 30; // Approximate days
    return totalDepreciableValue / usefulLifeDays;
  };

  // Calculate book value as of a specific date
  const calculateBookValue = (asset: Asset, asOfDate?: Date) => {
    if (!asset.purchaseDate || !asset.purchaseValue) return asset.purchaseValue || 0;
    
    const purchaseDate = new Date(asset.purchaseDate);
    const targetDate = asOfDate || new Date();
    
    if (targetDate < purchaseDate) return asset.purchaseValue;
    
    const daysSincePurchase = Math.floor((targetDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyDepreciation = calculateDailyDepreciation(asset);
    const totalDepreciation = dailyDepreciation * daysSincePurchase;
    
    return Math.max(asset.salvageValue || 0, asset.purchaseValue - totalDepreciation);
  };

  // Calculate depreciation percentage
  const calculateDepreciationPercentage = (asset: Asset) => {
    const bookValue = calculateBookValue(asset);
    const totalDepreciableValue = asset.purchaseValue - asset.salvageValue;
    return totalDepreciableValue > 0 ? ((asset.purchaseValue - bookValue) / totalDepreciableValue) * 100 : 0;
  };

  // Calculate remaining useful life in months
  const calculateRemainingLife = (asset: Asset) => {
    const depreciationPercentage = calculateDepreciationPercentage(asset);
    const usedLife = (depreciationPercentage / 100) * asset.usefulLifeMonths;
    return Math.max(0, asset.usefulLifeMonths - usedLife);
  };

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (filterType && a.type !== filterType) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (dateFrom && new Date(a.purchaseDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(a.purchaseDate) > new Date(dateTo)) return false;
      return true;
    });
  }, [assets, filterType, filterStatus, dateFrom, dateTo]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const totalPurchaseValue = filteredAssets.reduce((sum, a) => sum + a.purchaseValue, 0);
    const totalBookValue = filteredAssets.reduce((sum, a) => sum + calculateBookValue(a), 0);
    const totalDepreciation = totalPurchaseValue - totalBookValue;
    const averageDepreciationRate = totalPurchaseValue > 0 ? (totalDepreciation / totalPurchaseValue) * 100 : 0;
    
    const fullyDepreciated = filteredAssets.filter(a => calculateBookValue(a) <= a.salvageValue).length;
    const partiallyDepreciated = filteredAssets.filter(a => {
      const bookValue = calculateBookValue(a);
      return bookValue > a.salvageValue && bookValue < a.purchaseValue;
    }).length;
    const notDepreciated = filteredAssets.filter(a => calculateBookValue(a) >= a.purchaseValue).length;

    return {
      totalAssets,
      totalPurchaseValue,
      totalBookValue,
      totalDepreciation,
      averageDepreciationRate,
      fullyDepreciated,
      partiallyDepreciated,
      notDepreciated
    };
  }, [filteredAssets]);

  // Chart data
  const depreciationByType = useMemo(() => {
    const map: Record<string, { purchaseValue: number; bookValue: number; depreciation: number }> = {};
    filteredAssets.forEach(a => {
      if (!map[a.type]) map[a.type] = { purchaseValue: 0, bookValue: 0, depreciation: 0 };
      const bookValue = calculateBookValue(a);
      map[a.type].purchaseValue += a.purchaseValue;
      map[a.type].bookValue += bookValue;
      map[a.type].depreciation += a.purchaseValue - bookValue;
    });
    return Object.entries(map).map(([type, data]) => ({ type, ...data }));
  }, [filteredAssets]);

  const depreciationTrend = useMemo(() => {
    const months = 12;
    const trend = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthTotal = filteredAssets.reduce((sum, a) => {
        const bookValue = calculateBookValue(a, date);
        return sum + (a.purchaseValue - bookValue);
      }, 0);
      trend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        depreciation: monthTotal
      });
    }
    return trend;
  }, [filteredAssets]);

  const assetLifecycleData = useMemo(() => {
    return filteredAssets.map(a => ({
      name: a.description,
      purchaseValue: a.purchaseValue,
      bookValue: calculateBookValue(a),
      depreciationPercentage: calculateDepreciationPercentage(a),
      remainingLife: calculateRemainingLife(a)
    }));
  }, [filteredAssets]);

  // Export comprehensive CSV
  const handleExportCSV = () => {
    const exportDate = new Date();
    const headers = [
      'Asset Description', 'Serial Number', 'Type', 'Brand', 'Purchase Date', 'Purchase Value', 
      'Book Value as of Export', 'Total Depreciation', 'Depreciation %', 
      'Remaining Life (months)', 'Daily Depreciation', 'Status'
    ];
    const rows = filteredAssets.map(a => [
      a.description,
      a.serial || a.serialNumber || '-', // Serial/document number
      a.type,
      a.brand,
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      a.purchaseValue,
      calculateBookValue(a, exportDate).toFixed(2),
      (a.purchaseValue - calculateBookValue(a, exportDate)).toFixed(2),
      calculateDepreciationPercentage(a).toFixed(2) + '%',
      calculateRemainingLife(a).toFixed(1),
      calculateDailyDepreciation(a).toFixed(2),
      a.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Depreciation Dashboard');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('depreciation_dashboard');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printHeader = addPrintHeader('Depreciation Dashboard');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Depreciation Dashboard Report</title>
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

  const handleAssetDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetDetailOpen(true);
  };

  const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#6d4c41', '#0288d1'];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Depreciation Dashboard</Typography>

      {/* KPI Cards */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Card sx={{ flex: '1 1 250px', minWidth: 250, background: '#1976d2', color: '#fff' }}>
          <CardContent>
            <Typography variant="subtitle2">Total Assets</Typography>
            <Typography variant="h4">{kpis.totalAssets}</Typography>
            <Typography variant="caption">Depreciable Assets</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250, background: '#d32f2f', color: '#fff' }}>
          <CardContent>
            <Typography variant="subtitle2">Total Purchase Value</Typography>
            <Typography variant="h4">{kpis.totalPurchaseValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
            <Typography variant="caption">Original Cost</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250, background: '#388e3c', color: '#fff' }}>
          <CardContent>
            <Typography variant="subtitle2">Total Book Value</Typography>
            <Typography variant="h4">{kpis.totalBookValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
            <Typography variant="caption">Current Value</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250, background: '#fbc02d', color: '#fff' }}>
          <CardContent>
            <Typography variant="subtitle2">Total Depreciation</Typography>
            <Typography variant="h4">{kpis.totalDepreciation.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
            <Typography variant="caption">{kpis.averageDepreciationRate.toFixed(1)}% of Purchase Value</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Asset Status Cards */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary">Fully Depreciated</Typography>
            <Typography variant="h5" color="error">{kpis.fullyDepreciated}</Typography>
            <Typography variant="caption">Assets at salvage value</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary">Partially Depreciated</Typography>
            <Typography variant="h5" color="warning.main">{kpis.partiallyDepreciated}</Typography>
            <Typography variant="caption">Assets in depreciation period</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary">Not Depreciated</Typography>
            <Typography variant="h5" color="success.main">{kpis.notDepreciated}</Typography>
            <Typography variant="caption">New or recently acquired</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField 
          select 
          label="Asset Type" 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)} 
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {Array.from(new Set(assets.map(a => a.type))).map(t => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField 
          select 
          label="Status" 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)} 
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {Array.from(new Set(assets.map(a => a.status))).map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <TextField 
          label="From Date" 
          type="date" 
          value={dateFrom} 
          onChange={e => setDateFrom(e.target.value)} 
          sx={{ minWidth: 160 }} 
          InputLabelProps={{ shrink: true }} 
        />
        <TextField 
          label="To Date" 
          type="date" 
          value={dateTo} 
          onChange={e => setDateTo(e.target.value)} 
          sx={{ minWidth: 160 }} 
          InputLabelProps={{ shrink: true }} 
        />
        <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportCSV}>Export CSV</Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
      </Box>

      {/* Charts Section */}
      <Box display="flex" flexDirection="column" gap={3} mb={3}>
        {/* Charts Row 1 */}
        <Box display="flex" gap={3} flexWrap="wrap">
          {/* Depreciation by Type */}
          <Paper sx={{ p: 2, height: 300, flex: '1 1 400px', minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>Depreciation by Asset Type</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={depreciationByType}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="purchaseValue" fill="#1976d2" name="Purchase Value" />
                <Bar dataKey="bookValue" fill="#388e3c" name="Book Value" />
                <Bar dataKey="depreciation" fill="#d32f2f" name="Depreciation" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Depreciation Trend */}
          <Paper sx={{ p: 2, height: 300, flex: '1 1 400px', minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>Depreciation Trend (Last 12 Months)</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={depreciationTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="depreciation" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Asset Lifecycle */}
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>Asset Lifecycle Analysis</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={assetLifecycleData.slice(0, 10)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="purchaseValue" fill="#1976d2" name="Purchase Value" />
              <Bar dataKey="bookValue" fill="#388e3c" name="Book Value" />
              <Line type="monotone" dataKey="depreciationPercentage" stroke="#d32f2f" name="Depreciation %" />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Assets Table */}
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <Typography variant="h6" gutterBottom>Asset Depreciation Details</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Asset</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Serial Number</th> {/* New column */}
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Purchase Value</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Book Value</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Depreciation</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Depreciation %</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Remaining Life</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Daily Depreciation</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset, idx) => {
              const bookValue = calculateBookValue(asset);
              const depreciationAmount = asset.purchaseValue - bookValue;
              const depreciationPercentage = calculateDepreciationPercentage(asset);
              const remainingLife = calculateRemainingLife(asset);
              const dailyDepreciation = calculateDailyDepreciation(asset);
              
              let statusColor = 'success';
              if (bookValue <= asset.salvageValue) statusColor = 'error';
              else if (depreciationPercentage > 50) statusColor = 'warning';
              
              return (
                <tr key={asset._id} style={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleAssetDetail(asset)}>
                    {asset.description}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset.serial || asset.serialNumber || '-'}</td> {/* Serial Number */}
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset.type}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset.purchaseValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{bookValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{depreciationAmount.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 60, height: 8, bgcolor: '#eee', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ width: `${depreciationPercentage}%`, height: 8, bgcolor: statusColor === 'error' ? '#d32f2f' : statusColor === 'warning' ? '#fbc02d' : '#1976d2' }} />
                      </Box>
                      <Typography variant="caption">{depreciationPercentage.toFixed(1)}%</Typography>
                    </Box>
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{remainingLife.toFixed(1)} months</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{dailyDepreciation.toFixed(2)}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <Chip 
                      label={bookValue <= asset.salvageValue ? 'Fully Depreciated' : depreciationPercentage > 50 ? 'Partially Depreciated' : 'Not Depreciated'} 
                      color={statusColor as any} 
                      size="small" 
                    />
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <Button size="small" variant="outlined" onClick={() => handleAssetDetail(asset)}>
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <Typography align="center" sx={{ mt: 2 }}>Loading...</Typography>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {/* Asset Detail Dialog */}
      <Dialog open={assetDetailOpen} onClose={() => setAssetDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Asset Depreciation Details</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedAsset.description}</Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle2">Asset Information</Typography>
                  <Typography>Type: {selectedAsset.type}</Typography>
                  <Typography>Brand: {selectedAsset.brand}</Typography>
                  <Typography>Purchase Date: {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : '-'}</Typography>
                  <Typography>Useful Life: {selectedAsset.usefulLifeMonths} months</Typography>
                  <Typography>Salvage Value: {selectedAsset.salvageValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle2">Depreciation Analysis</Typography>
                  <Typography>Purchase Value: {selectedAsset.purchaseValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                  <Typography>Current Book Value: {calculateBookValue(selectedAsset).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                  <Typography>Total Depreciation: {(selectedAsset.purchaseValue - calculateBookValue(selectedAsset)).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                  <Typography>Depreciation %: {calculateDepreciationPercentage(selectedAsset).toFixed(1)}%</Typography>
                  <Typography>Remaining Life: {calculateRemainingLife(selectedAsset).toFixed(1)} months</Typography>
                  <Typography>Daily Depreciation: {calculateDailyDepreciation(selectedAsset).toFixed(2)}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Depreciation Progress</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateDepreciationPercentage(selectedAsset)} 
                  sx={{ height: 10, borderRadius: 5 }}
                  color={calculateBookValue(selectedAsset) <= selectedAsset.salvageValue ? 'error' : 'primary'}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssetDetailOpen(false)}>Close</Button>
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

export default DepreciationDashboard; 
