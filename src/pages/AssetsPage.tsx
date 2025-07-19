import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import CategorySelector from '../components/CategorySelector';
import {
  Box, Button, Card, CardContent, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';

// Add typeOptions for the asset type dropdown
const typeOptions = [
  'Vehicle',
  'Equipment',
  'Building',
  'IT',
  'Furniture',
  'Tools',
  'Half Lorrey',
  'Bom Truck'
];

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#6d4c41', '#0288d1'];

// Updated asset categories as requested
const AssetMainCategories = [
  'Vehicle', 'Equipment', 'Building', 'IT', 'Furniture', 'Tools', 'Half Lorrey', 'Bom Truck'
];

const AssetSubCategories = {
  'Vehicle': ['Truck', 'Car', 'Van', 'Bus', 'Trailer'],
  'Equipment': ['Crane', 'Excavator', 'Bulldozer', 'Forklift', 'Generator'],
  'Building': ['Office', 'Warehouse', 'Workshop', 'Showroom'],
  'IT': ['Computer', 'Laptop', 'Printer', 'Server', 'Network'],
  'Furniture': ['Desk', 'Chair', 'Cabinet', 'Table', 'Shelf'],
  'Tools': ['Hand Tools', 'Power Tools', 'Measuring Tools', 'Safety Equipment']
};

// Updated asset statuses as requested
const AssetStatuses = [
  'active', 'disposed', 'accident/scraped', 'other', 'pending'
];

// Asset availability options
const AssetAvailability = [
  'available', 'assigned', 'maintenance', 'out_of_service'
];

const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [plateNumberFilter, setPlateNumberFilter] = useState('');
  const [chassisNumberFilter, setChassisNumberFilter] = useState('');
  const [serialNumberFilter, setSerialNumberFilter] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [open, setOpen] = useState(false);
  const [bookValueDialogOpen, setBookValueDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [futureDate, setFutureDate] = useState('');
  const [calculatedBookValue, setCalculatedBookValue] = useState(0);
  const [form, setForm] = useState({
    description: '',
    mainCategory: '',
    subCategory: '',
    subSubCategory: '',
    subSubSubCategory: '',
    subSubSubSubCategory: '',
    brand: '',
    status: 'active',
    availability: 'available',
    countryOfOrigin: '',
    purchaseDate: '',
    purchaseValue: '',
    usefulLifeMonths: '',
    salvageValue: '',
    chassisNumber: '',
    plateNumber: '',
    serialNumber: '',
    fleetNumber: '',
    notes: '',
    type: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [multiBookValueDate, setMultiBookValueDate] = useState<string>("");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any[]>('/assets');
      setAssets(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily depreciation
  const calculateDailyDepreciation = (asset: any) => {
    if (!asset.purchaseValue || !asset.salvageValue || !asset.usefulLifeMonths) return 0;
    const totalDepreciableValue = asset.purchaseValue - asset.salvageValue;
    const usefulLifeDays = asset.usefulLifeMonths * 30; // Approximate days
    return totalDepreciableValue / usefulLifeDays;
  };

  // Calculate book value as of a specific date
  const calculateBookValue = (asset: any, asOfDate?: Date) => {
    if (!asset.purchaseDate || !asset.purchaseValue) return asset.purchaseValue || 0;
    
    const purchaseDate = new Date(asset.purchaseDate);
    const targetDate = asOfDate || new Date();
    
    if (targetDate < purchaseDate) return asset.purchaseValue;
    
    const daysSincePurchase = Math.floor((targetDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyDepreciation = calculateDailyDepreciation(asset);
    const totalDepreciation = dailyDepreciation * daysSincePurchase;
    
    return Math.max(asset.salvageValue || 0, asset.purchaseValue - totalDepreciation);
  };

  // Calculate total book value as of today
  const totalBookValueToday = useMemo(() => {
    return assets.reduce((total, asset) => {
      return total + calculateBookValue(asset);
    }, 0);
  }, [assets]);

  // Filtering
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (mainCategoryFilter && a.mainCategory !== mainCategoryFilter) return false;
      if (subCategoryFilter && a.subCategory !== subCategoryFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (availabilityFilter && a.availability !== availabilityFilter) return false;
      if (plateNumberFilter && (!a.plateNumber || !a.plateNumber.toLowerCase().includes(plateNumberFilter.toLowerCase()))) return false;
      if (chassisNumberFilter && (!a.chassisNumber || !a.chassisNumber.toLowerCase().includes(chassisNumberFilter.toLowerCase()))) return false;
      if (serialNumberFilter && (!a.serialNumber || !a.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase()))) return false;
      if (descriptionSearch && (!a.description || !a.description.toLowerCase().includes(descriptionSearch.toLowerCase()))) return false;
      if (dateFrom && new Date(a.purchaseDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(a.purchaseDate) > new Date(dateTo)) return false;
      return true;
    });
  }, [assets, mainCategoryFilter, subCategoryFilter, statusFilter, availabilityFilter, plateNumberFilter, chassisNumberFilter, serialNumberFilter, descriptionSearch, dateFrom, dateTo]);

  const handleAssetCheckbox = (id: string) => {
    setSelectedAssetIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleSelectAllAssets = (checked: boolean) => {
    setSelectedAssetIds(checked ? filteredAssets.map(a => a._id) : []);
  };
  const selectedAssets = filteredAssets.filter(a => selectedAssetIds.includes(a._id));
  const totalSelectedBookValue = selectedAssets.reduce((sum, a) => sum + calculateBookValue(a, multiBookValueDate ? new Date(multiBookValueDate) : undefined), 0);

  // Export CSV with book value as of export date
  const handleExportCSV = () => {
    const exportDate = new Date();
    const headers = ['Description', 'Serial Number', 'Type', 'Brand', 'Status', 'Availability', 'Current Project', 'Country of Origin', 'Purchase Date', 'Purchase Value', 'Book Value as of Export', 'Chassis Number', 'Plate Number', 'Serial Number (Asset)', 'Fleet Number'];
    const rows = filteredAssets.map(a => [
      a.description,
      a.serial || '-', // Serial Number column
      a.type || '-',
      a.brand,
      a.status,
      a.availability,
      a.currentProject ? `${a.currentProject.customer} (${a.currentProject.status})` : 'None',
      a.countryOfOrigin,
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      a.purchaseValue,
      calculateBookValue(a, exportDate).toFixed(2),
      a.chassisNumber,
      a.plateNumber,
      a.serialNumber,
      a.fleetNumber
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Assets');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('assets');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    const printHeader = addPrintHeader('Assets');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Assets Report</title>
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

  // Chart data
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAssets.forEach(a => { map[a.type] = (map[a.type] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ name: type, value: count }));
  }, [filteredAssets]);
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAssets.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ name: status, value: count }));
  }, [filteredAssets]);
  const availabilityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAssets.forEach(a => { map[a.availability] = (map[a.availability] || 0) + 1; });
    return Object.entries(map).map(([availability, count]) => ({ name: availability, value: count }));
  }, [filteredAssets]);

  // Asset lifecycle progress (months used / usefulLifeMonths)
  const getLifecyclePercent = (a: any) => {
    if (!a.purchaseDate || !a.usefulLifeMonths) return 0;
    const monthsUsed = (new Date().getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.min(100, Math.max(0, (monthsUsed / a.usefulLifeMonths) * 100));
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      description: '',
      mainCategory: '',
      subCategory: '',
      subSubCategory: '',
      subSubSubCategory: '',
      subSubSubSubCategory: '',
      brand: '',
      status: 'active',
      availability: 'available',
      countryOfOrigin: '',
      purchaseDate: '',
      purchaseValue: '',
      usefulLifeMonths: '',
      salvageValue: '',
      chassisNumber: '',
      plateNumber: '',
      serialNumber: '',
      fleetNumber: '',
      notes: '',
      type: '',
    });
    setError('');
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // If type changes, reset mainCategory and subCategory
    if (name === 'type') {
      setForm(prev => ({
        ...prev,
        type: value,
        mainCategory: '',
        subCategory: '',
        subSubCategory: '',
        subSubSubCategory: '',
        subSubSubSubCategory: '',
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/assets', {
        ...form,
        purchaseValue: Number(form.purchaseValue),
        usefulLifeMonths: Number(form.usefulLifeMonths),
        salvageValue: Number(form.salvageValue),
        type: form.type,
      });
      setSuccess('Asset submitted successfully!');
      fetchAssets();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookValueCalculation = (asset: any) => {
    setSelectedAsset(asset);
    setBookValueDialogOpen(true);
  };

  const calculateFutureBookValue = () => {
    if (!selectedAsset || !futureDate) return;
    const bookValue = calculateBookValue(selectedAsset, new Date(futureDate));
    setCalculatedBookValue(bookValue);
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Assets</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Submit Asset Request
        </Button>
      </Box>
      {/* Summary Cards */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Assets</Typography>
            <Typography variant="h5">{assets.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle1">Available Assets</Typography>
            <Typography variant="h5" color="success.main">
              {assets.filter(a => a.availability === 'available' && a.status === 'active').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle1">Assigned Assets</Typography>
            <Typography variant="h5" color="warning.main">
              {assets.filter(a => a.availability === 'assigned').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Book Value</Typography>
            <Typography variant="h5">
              {totalBookValueToday.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3} alignItems="center">
        <TextField 
          select 
          label="Main Category" 
          value={mainCategoryFilter} 
          onChange={e => setMainCategoryFilter(e.target.value)} 
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {AssetMainCategories.map(category => <MenuItem key={category} value={category}>{category}</MenuItem>)}
        </TextField>
        <TextField 
          select 
          label="Sub Category" 
          value={subCategoryFilter} 
          onChange={e => setSubCategoryFilter(e.target.value)} 
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Sub Categories</MenuItem>
          {mainCategoryFilter && AssetSubCategories[mainCategoryFilter as keyof typeof AssetSubCategories]?.map(subCategory => 
            <MenuItem key={subCategory} value={subCategory}>{subCategory}</MenuItem>
          )}
        </TextField>
        <TextField 
          select 
          label="Status" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {AssetStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField 
          select 
          label="Availability" 
          value={availabilityFilter} 
          onChange={e => setAvailabilityFilter(e.target.value)} 
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Availability</MenuItem>
          {AssetAvailability.map(a => <MenuItem key={a} value={a}>{a.replace('_', ' ')}</MenuItem>)}
        </TextField>
        <TextField 
          label="Plate Number" 
          value={plateNumberFilter} 
          onChange={e => setPlateNumberFilter(e.target.value)} 
          sx={{ minWidth: 160 }}
        />
        <TextField 
          label="Chassis Number" 
          value={chassisNumberFilter} 
          onChange={e => setChassisNumberFilter(e.target.value)} 
          sx={{ minWidth: 160 }}
        />
        <TextField 
          label="Serial Number" 
          value={serialNumberFilter} 
          onChange={e => setSerialNumberFilter(e.target.value)} 
          sx={{ minWidth: 160 }}
        />
        <TextField 
          label="Description Search" 
          value={descriptionSearch} 
          onChange={e => setDescriptionSearch(e.target.value)} 
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
        <TextField 
          label="From" 
          type="date" 
          value={dateFrom} 
          onChange={e => setDateFrom(e.target.value)} 
          sx={{ minWidth: 160 }} 
          InputLabelProps={{ shrink: true }} 
        />
        <TextField 
          label="To" 
          type="date" 
          value={dateTo} 
          onChange={e => setDateTo(e.target.value)} 
          sx={{ minWidth: 160 }} 
          InputLabelProps={{ shrink: true }} 
        />
        <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportCSV}>Export CSV</Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
      </Box>

      {/* Charts */}
      <Box display="flex" gap={4} mb={3} flexWrap="wrap">
        <Paper sx={{ p: 2, minWidth: 320, flex: 1 }}>
          <Typography variant="subtitle1">Asset Distribution by Type</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {typeData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 320, flex: 1 }}>
          <Typography variant="subtitle1">Asset Distribution by Status</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {statusData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 320, flex: 1 }}>
          <Typography variant="subtitle1">Asset Distribution by Availability</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={availabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {availabilityData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Selection and Book Value Panel */}
      <Paper sx={{ p: 2, minWidth: 260, maxWidth: 320, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Selected Assets</Typography>
        <Box mb={2}>
          <Checkbox
            checked={selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0}
            indeterminate={selectedAssetIds.length > 0 && selectedAssetIds.length < filteredAssets.length}
            onChange={e => handleSelectAllAssets(e.target.checked)}
            size="small"
          />
          <Typography variant="body2" display="inline">Select All</Typography>
        </Box>
        <Box sx={{ maxHeight: 120, overflowY: 'auto', mb: 2 }}>
          {selectedAssets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No assets selected</Typography>
          ) : (
            selectedAssets.map(a => (
              <Typography key={a._id} variant="body2">{a.description || a.serial || a._id}</Typography>
            ))
          )}
        </Box>
        <TextField
          label="As of Date"
          type="date"
          value={multiBookValueDate}
          onChange={e => setMultiBookValueDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle2">Total Book Value</Typography>
        <Typography variant="h6" color="primary">
          {totalSelectedBookValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
        </Typography>
      </Paper>

      {/* Assets Table */}
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <Checkbox
                  checked={selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0}
                  indeterminate={selectedAssetIds.length > 0 && selectedAssetIds.length < filteredAssets.length}
                  onChange={e => handleSelectAllAssets(e.target.checked)}
                  size="small"
                />
              </th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Description</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Serial Number</th> {/* New column */}
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Category</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Brand</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Availability</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Current Project</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Purchase Date</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Purchase Value</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Book Value</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Chassis Number</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Plate Number</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Serial Number</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Fleet Number</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((a, idx) => (
              <tr key={a._id} style={{ 
                background: a.status === 'pending' ? '#f0f0f0' : (idx % 2 === 0 ? '#fafafa' : '#fff'),
                opacity: a.status === 'pending' ? 0.7 : 1
              }}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <Checkbox
                    checked={selectedAssetIds.includes(a._id)}
                    onChange={() => handleAssetCheckbox(a._id)}
                    size="small"
                  />
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/assets/${a._id}`)}>
                  {a.description}
                  {a.status === 'pending' && <Chip label="Pending" size="small" sx={{ ml: 1 }} color="warning" />}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.serial || '-'}</td> {/* Serial Number */}
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.type || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {a.mainCategory} {'>'} {a.subCategory}
                  {a.subSubCategory && ` > ${a.subSubCategory}`}
                  {a.subSubSubCategory && ` > ${a.subSubSubCategory}`}
                  {a.subSubSubSubCategory && ` > ${a.subSubSubSubCategory}`}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.brand}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.status}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <Chip 
                    label={a.availability?.replace('_', ' ') || 'available'} 
                    size="small" 
                    color={
                      a.availability === 'available' ? 'success' : 
                      a.availability === 'assigned' ? 'warning' : 
                      a.availability === 'maintenance' ? 'info' : 'error'
                    }
                    variant="outlined"
                  />
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {a.currentProject ? (
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{a.currentProject.customer}</Typography>
                      <Chip 
                        label={a.currentProject.status || 'active'} 
                        size="small" 
                        color={a.currentProject.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  ) : '-'}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.purchaseValue?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{calculateBookValue(a).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.chassisNumber || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.plateNumber || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.serialNumber || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{a.fleetNumber || '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleBookValueCalculation(a)}
                    sx={{ mr: 1 }}
                  >
                    Calculate Book Value
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <Typography align="center" sx={{ mt: 2 }}>Loading...</Typography>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {/* Add Asset Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Submit Asset Request</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Type Dropdown */}
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
              {typeOptions.map((type: string) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField label="Asset Description" name="description" value={form.description} onChange={handleFormChange} required fullWidth />
            {/* Main Category Dropdown, filtered by type */}
            <TextField
              select
              label="Main Category"
              name="mainCategory"
              value={form.mainCategory}
              onChange={handleFormChange}
              required
              fullWidth
              disabled={!form.type}
            >
              <MenuItem value="">Select Main Category</MenuItem>
              {AssetMainCategories.filter(cat => !form.type || cat === form.type).map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            {/* CategorySelector for subcategories, only if mainCategory is selected */}
            {form.mainCategory && (
              <CategorySelector
                value={{
                  mainCategory: form.mainCategory,
                  subCategory: form.subCategory,
                  subSubCategory: form.subSubCategory,
                  subSubSubCategory: form.subSubSubCategory,
                  subSubSubSubCategory: form.subSubSubSubCategory
                }}
                onChange={(categories: {
                  mainCategory?: string;
                  subCategory?: string;
                  subSubCategory?: string;
                  subSubSubCategory?: string;
                  subSubSubSubCategory?: string;
                }) => {
                  setForm(prev => ({
                    ...prev,
                    mainCategory: categories.mainCategory || '',
                    subCategory: categories.subCategory || '',
                    subSubCategory: categories.subSubCategory || '',
                    subSubSubCategory: categories.subSubSubCategory || '',
                    subSubSubSubCategory: categories.subSubSubSubCategory || ''
                  }));
                }}
              />
            )}
            
              <TextField label="Brand" name="brand" value={form.brand} onChange={handleFormChange} required fullWidth />
            <Box display="flex" gap={2}>
              <TextField 
                select 
                label="Status" 
                name="status" 
                value={form.status} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                {AssetStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                label="Availability" 
                name="availability" 
                value={form.availability} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                {AssetAvailability.map(a => <MenuItem key={a} value={a}>{a.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Box>
            <TextField label="Country of Origin" name="countryOfOrigin" value={form.countryOfOrigin} onChange={handleFormChange} required fullWidth />
            <Box display="flex" gap={2}>
              <TextField label="Purchase Date" name="purchaseDate" value={form.purchaseDate} onChange={handleFormChange} required fullWidth type="date" InputLabelProps={{ shrink: true }} />
              <TextField label="Purchase Value" name="purchaseValue" value={form.purchaseValue} onChange={handleFormChange} required fullWidth type="number" />
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Useful Life (months)" name="usefulLifeMonths" value={form.usefulLifeMonths} onChange={handleFormChange} required fullWidth type="number" />
              <TextField label="Salvage Value" name="salvageValue" value={form.salvageValue} onChange={handleFormChange} required fullWidth type="number" />
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Chassis Number" name="chassisNumber" value={form.chassisNumber} onChange={handleFormChange} fullWidth />
              <TextField label="Plate Number" name="plateNumber" value={form.plateNumber} onChange={handleFormChange} fullWidth />
            </Box>
            <TextField label="Serial Number" name="serialNumber" value={form.serialNumber} onChange={handleFormChange} fullWidth />
            {form.subCategory === 'Trailer' && (
              <TextField label="Fleet Number" name="fleetNumber" value={form.fleetNumber} onChange={handleFormChange} required fullWidth />
            )}
            <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} fullWidth multiline minRows={2} />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>Submit Request</Button>
        </DialogActions>
      </Dialog>

      {/* Book Value Calculation Dialog */}
      <Dialog open={bookValueDialogOpen} onClose={() => setBookValueDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Calculate Future Book Value</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {selectedAsset && (
              <>
                <Typography variant="subtitle1">Asset: {selectedAsset.description}</Typography>
                <Typography variant="body2">Current Book Value: {calculateBookValue(selectedAsset).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                <TextField 
                  label="Calculate Book Value as of Date" 
                  type="date" 
                  value={futureDate} 
                  onChange={e => setFutureDate(e.target.value)} 
                  fullWidth 
                  InputLabelProps={{ shrink: true }}
                />
                <Button variant="outlined" onClick={calculateFutureBookValue} disabled={!futureDate}>
                  Calculate
                </Button>
                {calculatedBookValue > 0 && (
                  <Alert severity="info">
                    Book Value as of {futureDate}: {calculatedBookValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                  </Alert>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookValueDialogOpen(false)}>Close</Button>
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

export default AssetsPage; 