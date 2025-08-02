import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, Card, CardContent, MenuItem, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';

interface Asset {
  _id: string;
  description: string;
  plateNumber?: string;
  serialNumber?: string;
  fleetNumber?: string;
  chassisNumber?: string;
  brand?: string;
}

interface InventoryItem {
  _id: string;
  description: string;
  rop?: string;
  quantity: number;
  uom: string;
  purchaseCost?: number;
  type: string;
  location?: string;
  supplier?: string;
}

interface MaintenancePart {
  item: string;
  itemName: string;
  quantity: number;
  cost: number;
  availableQuantity?: number;
  withdrawnQuantity?: number;
}

interface Maintenance {
  _id: string;
  asset: Asset | string;
  description: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
  completedDate?: string;
  completedTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  totalCost: number;
  totalMaintenanceTime: number; // in hours
  parts: MaintenancePart[];
  notes?: string;
  createdBy?: string;
  completedBy?: string;
  serial?: string; // Added serial/document number
  cancellationReason?: string;
}

const defaultForm = {
  asset: '',
  description: '',
  type: 'preventive',
  scheduledDate: '',
  scheduledTime: '',
  completedDate: '',
  completedTime: '',
  status: 'scheduled',
  parts: [] as MaintenancePart[],
  notes: '',
};

const MaintenancePage: React.FC = () => {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterAsset, setFilterAsset] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [assetSearchType, setAssetSearchType] = useState<'plateNumber' | 'serialNumber' | 'fleetNumber' | 'chassisNumber'>('plateNumber');
  const [assetSearchValue, setAssetSearchValue] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [partForm, setPartForm] = useState({ item: '', quantity: '' });
  const [showPartForm, setShowPartForm] = useState(false);
  const [needsParts, setNeedsParts] = useState<'yes' | 'no'>('no');
  const [inventorySearchType, setInventorySearchType] = useState<'description' | 'type' | 'location' | 'all'>('all');
  const [inventorySearchValue, setInventorySearchValue] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [serialSearch, setSerialSearch] = useState('');

  useEffect(() => {
    fetchMaintenance();
    fetchAssets();
    fetchInventoryItems();
  }, []);

  const fetchMaintenance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<Maintenance[]>('/maintenance');
      setMaintenance(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch maintenance records');
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

  const fetchInventoryItems = async () => {
    try {
      const res = await api.get('/inventory/items');
      console.log('Fetched inventory items:', res.data);
      setInventoryItems(res.data as InventoryItem[]);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    if (!assetSearchValue.trim()) return assets;
    const searchValue = assetSearchValue.trim().toLowerCase();
    
    return assets.filter(asset => {
      switch (assetSearchType) {
        case 'plateNumber':
          return asset.plateNumber?.toLowerCase().includes(searchValue);
        case 'serialNumber':
          return asset.serialNumber?.toLowerCase().includes(searchValue);
        case 'fleetNumber':
          return asset.fleetNumber?.toLowerCase().includes(searchValue);
        case 'chassisNumber':
          return asset.chassisNumber?.toLowerCase().includes(searchValue);
        default:
          return false;
      }
    });
  }, [assets, assetSearchType, assetSearchValue]);

  // Filter inventory items based on search
  const filteredInventoryItems = useMemo(() => {
    console.log('Filtering inventory items:', {
      searchValue: inventorySearchValue,
      searchType: inventorySearchType,
      totalItems: inventoryItems.length
    });
    
    if (!inventorySearchValue.trim()) {
      console.log('No search value, returning all items');
      return inventoryItems;
    }
    
    const searchValue = inventorySearchValue.trim().toLowerCase();
    console.log('Searching for:', searchValue);
    
    const filtered = inventoryItems.filter(item => {
      switch (inventorySearchType) {
        case 'description':
          return item.description?.toLowerCase().includes(searchValue);
        case 'type':
          return item.type?.toLowerCase().includes(searchValue);
        case 'location':
          return item.location?.toLowerCase().includes(searchValue);
        case 'all':
        default:
          return (
            (item.description?.toLowerCase() || '').includes(searchValue) ||
            (item.type?.toLowerCase() || '').includes(searchValue) ||
            (item.location?.toLowerCase() || '').includes(searchValue) ||
            (item.supplier?.toLowerCase() || '').includes(searchValue)
          );
      }
    });
    
    console.log('Filtered results:', filtered.length);
    return filtered;
  }, [inventoryItems, inventorySearchType, inventorySearchValue]);

  const handleOpen = (m?: Maintenance) => {
    if (m) {
      setEditingId(m._id);
      setForm({
        asset: typeof m.asset === 'object' ? m.asset._id : m.asset || '',
        description: m.description,
        type: m.type,
        scheduledDate: m.scheduledDate ? m.scheduledDate.slice(0, 10) : '',
        scheduledTime: m.scheduledTime || '',
        completedDate: m.completedDate ? m.completedDate.slice(0, 10) : '',
        completedTime: m.completedTime || '',
        status: m.status,
        parts: m.parts || [],
        notes: m.notes || '',
        serial: m.serial || '', // Ensure serial is included in form
        cancellationReason: m.cancellationReason || '', // Ensure cancellationReason is included in form
      });
      setSelectedAsset(typeof m.asset === 'object' ? m.asset : null);
    } else {
      setEditingId(null);
      setForm(defaultForm);
      setSelectedAsset(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setSelectedAsset(null);
    setShowPartForm(false);
    setPartForm({ item: '', quantity: '' });
    setCancellationReason('');
    setShowCancelReasonModal(false);
    setPendingCancelId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => a._id === assetId);
    setSelectedAsset(asset || null);
    setForm({ ...form, asset: assetId });
  };

  const handleAddPart = () => {
    setShowPartForm(true);
  };

  const handlePartFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartForm({ ...partForm, [e.target.name]: e.target.value });
  };

  const handleAddPartToJob = () => {
    if (!partForm.item || !partForm.quantity) return;
    
    const selectedItem = inventoryItems.find(item => item._id === partForm.item);
    if (!selectedItem) return;

    const quantity = Number(partForm.quantity);
    const availableQuantity = selectedItem.quantity;
    
    if (quantity > availableQuantity) {
      setError(`Insufficient stock. Available: ${availableQuantity} ${selectedItem.uom}`);
      return;
    }

    const cost = (selectedItem.purchaseCost || 0) * quantity;

    const newPart: MaintenancePart = {
      item: selectedItem._id,
      itemName: selectedItem.description,
      quantity,
      cost,
      availableQuantity,
      withdrawnQuantity: quantity,
    };

    setForm({
      ...form,
      parts: [...form.parts, newPart]
    });

    setPartForm({ item: '', quantity: '' });
    setShowPartForm(false);
  };

  const handleRemovePart = (index: number) => {
    const updatedParts = form.parts.filter((_: MaintenancePart, i: number) => i !== index);
    setForm({ ...form, parts: updatedParts });
  };

  const calculateTotalCost = (parts: MaintenancePart[]) => {
    return parts.reduce((sum, part) => sum + part.cost, 0);
  };

  const calculateTotalTime = (scheduledDate: string, scheduledTime: string, completedDate?: string, completedTime?: string) => {
    if (!completedDate || !completedTime) return 0;
    
    const scheduled = new Date(`${scheduledDate}T${scheduledTime}`);
    const completed = new Date(`${completedDate}T${completedTime}`);
    
    const diffMs = completed.getTime() - scheduled.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const totalCost = calculateTotalCost(form.parts);
      const totalTime = calculateTotalTime(form.scheduledDate, form.scheduledTime, form.completedDate, form.completedTime);

      const submitData = {
        ...form,
        totalCost,
        totalMaintenanceTime: totalTime,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        completedDate: form.completedDate || undefined,
        completedTime: form.completedTime || undefined,
      };

      if (editingId) {
        await api.put(`/maintenance/${editingId}`, submitData);
        setSuccess('Job Card updated!');
      } else {
        await api.post('/maintenance', submitData);
        setSuccess('Job Card created!');
      }
      
      // Inventory deduction is handled automatically by the backend when status is 'completed'
      
      fetchMaintenance();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job card');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/maintenance/${deleteId}`);
      setSuccess('Job Card deleted!');
      fetchMaintenance();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete job card');
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setPendingCancelId(id);
      setShowCancelReasonModal(true);
      return;
    }
    try {
      await api.patch(`/maintenance/${id}/status`, { status: newStatus });
      setSuccess(`Job Card ${newStatus}!`);
      fetchMaintenance();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancelReasonSubmit = async () => {
    if (!cancellationReason.trim()) return;
    try {
      await api.patch(`/maintenance/${pendingCancelId}/status`, { status: 'cancelled', cancellationReason });
      setSuccess('Job Card cancelled!');
      setShowCancelReasonModal(false);
      setPendingCancelId(null);
      setCancellationReason('');
      fetchMaintenance();
    } catch (err: any) {
      setError('Failed to cancel job card');
    }
  };

  const columns = useMemo<ColumnDef<Maintenance>[]>(() => [
    { 
      header: 'Asset', 
      accessorKey: 'asset', 
      cell: info => {
        const asset = typeof info.getValue() === 'object' ? info.getValue() as Asset : null;
        return asset ? `${asset.description} (${asset.plateNumber || asset.serialNumber || asset.fleetNumber || asset.chassisNumber || 'No ID'})` : info.getValue();
      }
    },
    { 
      header: 'Serial Number', 
      accessorKey: 'serial',
      cell: info => info.getValue() || '-' // Serial/document number
    },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Type', accessorKey: 'type' },
    { 
      header: 'Scheduled', 
      accessorKey: 'scheduledDate', 
      cell: info => {
        const maintenance = info.row.original;
        return `${new Date(maintenance.scheduledDate).toLocaleDateString()} ${maintenance.scheduledTime}`;
      }
    },
    { 
      header: 'Completed', 
      accessorKey: 'completedDate', 
      cell: info => {
        const maintenance = info.row.original;
        return maintenance.completedDate ? `${new Date(maintenance.completedDate).toLocaleDateString()} ${maintenance.completedTime}` : '-';
      }
    },
    { 
      header: 'Total Cost', 
      accessorKey: 'totalCost', 
      cell: info => Number(info.getValue()).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })
    },
    { 
      header: 'Total Time (hrs)', 
      accessorKey: 'totalMaintenanceTime', 
      cell: info => Number(info.getValue()).toFixed(1)
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: info => {
        const status = info.getValue() as string;
        const color = status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : status === 'cancelled' ? 'error' : 'default';
        return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
      }
    },
    {
      header: 'Actions',
      cell: ({ row }) => {
        const maintenance = row.original;
        const canEdit = maintenance.status === 'scheduled' || maintenance.status === 'in_progress';
        
        return (
          <Box display="flex" gap={1}>
            {canEdit && (
              <IconButton color="primary" onClick={() => handleOpen(maintenance)}>
                <EditIcon />
              </IconButton>
            )}
            {maintenance.status === 'scheduled' && (
              <IconButton color="warning" onClick={() => handleStatusChange(maintenance._id, 'in_progress')}>
                <CheckCircleIcon />
              </IconButton>
            )}
            {maintenance.status === 'in_progress' && (
              <IconButton color="success" onClick={() => handleStatusChange(maintenance._id, 'completed')}>
                <CheckCircleIcon />
              </IconButton>
            )}
            {maintenance.status === 'scheduled' && (
              <IconButton color="error" onClick={() => handleStatusChange(maintenance._id, 'cancelled')}>
                <CancelIcon />
              </IconButton>
            )}
            {maintenance.status === 'in_progress' && (
              <IconButton color="error" onClick={() => handleStatusChange(maintenance._id, 'cancelled')}>
                <CancelIcon />
              </IconButton>
            )}
            <IconButton color="error" onClick={() => setDeleteId(maintenance._id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ], [assets, handleStatusChange]);

  const table = useReactTable({
    data: maintenance,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Filtered maintenance
  const filteredMaintenance = useMemo(() => {
    return maintenance.filter(m => {
      if (serialSearch && !(m.serial || '').toLowerCase().includes(serialSearch.trim().toLowerCase())) return false;
      if (filterAsset && (typeof m.asset === 'object' ? m.asset._id : m.asset) !== filterAsset) return false;
      if (filterType && m.type !== filterType) return false;
      if (filterStatus && m.status !== filterStatus) return false;
      if (filterFrom && new Date(m.scheduledDate) < new Date(filterFrom)) return false;
      if (filterTo && new Date(m.scheduledDate) > new Date(filterTo)) return false;
      return true;
    });
  }, [maintenance, serialSearch, filterAsset, filterType, filterStatus, filterFrom, filterTo]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Asset', 'Serial Number', 'Description', 'Type', 'Scheduled Date', 'Scheduled Time', 'Completed Date', 'Completed Time', 'Total Cost', 'Total Time (hrs)', 'Status', 'Parts Used'];
    const rows = filteredMaintenance.map(m => [
      typeof m.asset === 'object' ? m.asset.description : m.asset,
      m.serial || '-', // Serial/document number
      m.description,
      m.type,
      m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : '',
      m.scheduledTime,
      m.completedDate ? new Date(m.completedDate).toLocaleDateString() : '',
      m.completedTime,
      m.totalCost,
      m.totalMaintenanceTime,
      m.status,
      m.parts.map(p => `${p.itemName} (${p.quantity})`).join(', ')
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Maintenance Job Cards');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('maintenance_job_cards');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    const printHeader = addPrintHeader('Maintenance Job Cards');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Maintenance Job Cards Report</title>
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

  // Summary calculations
  const totalCost = maintenance.reduce((sum, m) => sum + m.totalCost, 0);
  const totalTime = maintenance.reduce((sum, m) => sum + m.totalMaintenanceTime, 0);
  const avgCostPerJob = maintenance.length ? totalCost / maintenance.length : 0;

  return (
    <Box p={3}>
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField
          label="Search by Job Card Serial Number"
          value={serialSearch}
          onChange={e => setSerialSearch(e.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Maintenance Job Cards</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Job Card
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Job Cards</Typography>
            <Typography variant="h5">{maintenance.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Cost</Typography>
            <Typography variant="h5">{totalCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Time (hrs)</Typography>
            <Typography variant="h5">{totalTime.toFixed(1)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Avg. Cost per Job</Typography>
            <Typography variant="h5">{avgCostPerJob.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
        <TextField select label="Asset" value={filterAsset} onChange={e => setFilterAsset(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">All Assets</MenuItem>
          {assets.map(a => <MenuItem key={a._id} value={a._id}>{a.description}</MenuItem>)}
        </TextField>
        <TextField select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="preventive">Preventive</MenuItem>
          <MenuItem value="corrective">Corrective</MenuItem>
        </TextField>
        <TextField select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <TextField label="From" type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
        <TextField label="To" type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
        <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportCSV}>Export CSV</Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
      </Box>

      {/* Job Cards Table */}
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows
              .filter(row => filteredMaintenance.includes(row.original))
              .map(row => (
                <tr key={row.id} style={{ background: row.index % 2 === 0 ? '#fafafa' : '#fff' }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <Typography align="center" sx={{ mt: 2 }}>Loading...</Typography>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {/* Add/Edit Job Card Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Job Card' : 'Add Job Card'}</DialogTitle>
        <DialogContent>
          {/* Show Serial Number if present */}
          {form.serial && (
            <Box mb={2}>
              <TextField
                label="Job Card Serial Number"
                value={form.serial}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Asset Selection */}
            <Typography variant="h6">Asset Selection</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField 
                select 
                label="Search by" 
                value={assetSearchType} 
                onChange={e => setAssetSearchType(e.target.value as any)} 
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="plateNumber">Plate Number</MenuItem>
                <MenuItem value="serialNumber">Serial Number</MenuItem>
                <MenuItem value="fleetNumber">Fleet Number</MenuItem>
                <MenuItem value="chassisNumber">Chassis Number</MenuItem>
              </TextField>
              <TextField 
                label="Search Value" 
                value={assetSearchValue} 
                onChange={e => setAssetSearchValue(e.target.value)} 
                sx={{ flex: 1 }}
                placeholder={`Enter ${assetSearchType.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
              />
            </Box>
            {assetSearchValue && (
              <TextField 
                select 
                label="Select Asset" 
                name="asset" 
                value={form.asset} 
                onChange={e => handleAssetSelect(e.target.value)} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Asset</MenuItem>
                {filteredAssets.map(asset => (
                  <MenuItem key={asset._id} value={asset._id}>
                    {asset.description} - {asset.plateNumber || asset.serialNumber || asset.fleetNumber || asset.chassisNumber || 'No ID'}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Job Details */}
            <Typography variant="h6">Job Details</Typography>
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} required fullWidth />
            <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} required fullWidth>
              <MenuItem value="preventive">Preventive</MenuItem>
              <MenuItem value="corrective">Corrective</MenuItem>
            </TextField>

            {/* Schedule */}
            <Typography variant="h6">Schedule</Typography>
            <Box display="flex" gap={2}>
              <TextField 
                label="Scheduled Date" 
                name="scheduledDate" 
                value={form.scheduledDate} 
                onChange={handleFormChange} 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                required 
                fullWidth 
              />
              <TextField 
                label="Scheduled Time" 
                name="scheduledTime" 
                value={form.scheduledTime} 
                onChange={handleFormChange} 
                type="time" 
                InputLabelProps={{ shrink: true }} 
                required 
                fullWidth 
              />
            </Box>

            {/* Completion */}
            <Typography variant="h6">Completion</Typography>
            <Box display="flex" gap={2}>
              <TextField 
                label="Completed Date" 
                name="completedDate" 
                value={form.completedDate} 
                onChange={handleFormChange} 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
              <TextField 
                label="Completed Time" 
                name="completedTime" 
                value={form.completedTime} 
                onChange={handleFormChange} 
                type="time" 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
            </Box>

            {/* Parts Selection */}
            <Typography variant="h6">Parts Required</Typography>
            <TextField 
              select 
              label="Will you need parts from inventory?" 
              value={needsParts} 
              onChange={(e) => setNeedsParts(e.target.value as 'yes' | 'no')} 
              fullWidth
            >
              <MenuItem value="no">No</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
            </TextField>

                {needsParts === 'yes' && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Search Inventory</Typography>
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField 
                        select 
                        label="Search by" 
                        value={inventorySearchType} 
                        onChange={(e) => setInventorySearchType(e.target.value as any)} 
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="all">All Items</MenuItem>
                        <MenuItem value="description">Description</MenuItem>
                        <MenuItem value="type">Type</MenuItem>
                        <MenuItem value="location">Location</MenuItem>
                      </TextField>
                      <TextField 
                        label="Search Value" 
                        value={inventorySearchValue} 
                        onChange={(e) => setInventorySearchValue(e.target.value)} 
                        sx={{ flex: 1 }}
                        placeholder={`Enter ${inventorySearchType === 'all' ? 'any item detail' : inventorySearchType}`}
                      />
                      <Button 
                        variant="outlined" 
                        onClick={() => setInventorySearchValue('')}
                        size="small"
                      >
                        Clear
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={() => {
                          console.log('Search triggered:', {
                            searchType: inventorySearchType,
                            searchValue: inventorySearchValue,
                            totalItems: inventoryItems.length,
                            filteredItems: filteredInventoryItems.length
                          });
                        }}
                        size="small"
                      >
                        Search
                      </Button>
                    </Box>
                    
                    {/* Show search results count */}
                    {inventorySearchValue.trim() && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        Found {filteredInventoryItems.length} items matching "{inventorySearchValue}"
                      </Typography>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Selected Parts</Typography>
                      <Button startIcon={<AddIcon />} onClick={handleAddPart} variant="outlined" size="small">
                        Add Part
                      </Button>
                    </Box>
                    
                    {form.parts.map((part: MaintenancePart, index: number) => (
                      <Box key={index} display="flex" gap={2} alignItems="center" sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mt: 1 }}>
                        <Typography sx={{ flex: 1 }}>{part.itemName}</Typography>
                        <Typography>Qty: {part.quantity}</Typography>
                        <Typography>Available: {part.availableQuantity || 0}</Typography>
                        <Typography>Cost: {part.cost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                        <IconButton size="small" color="error" onClick={() => handleRemovePart(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}

                    {showPartForm && (
                      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Add Part from Inventory</Typography>
                        <Box display="flex" gap={2}>
                          <TextField 
                            select 
                            label="Part" 
                            name="item" 
                            value={partForm.item} 
                            onChange={handlePartFormChange} 
                            fullWidth 
                            helperText={`${filteredInventoryItems.length} items available`}
                          >
                            <MenuItem value="">Select Part</MenuItem>
                            {filteredInventoryItems.length === 0 ? (
                              <MenuItem disabled>No items found</MenuItem>
                            ) : (
                              filteredInventoryItems.map(item => (
                                <MenuItem key={item._id} value={item._id}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {item.description}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Stock: {item.quantity} {item.uom} | Type: {item.type} | Location: {item.location || 'N/A'}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))
                            )}
                          </TextField>
                          <TextField 
                            label="Quantity" 
                            name="quantity" 
                            value={partForm.quantity} 
                            onChange={handlePartFormChange} 
                            type="number" 
                            fullWidth 
                          />
                        </Box>
                        <Box display="flex" gap={1} sx={{ mt: 1 }}>
                          <Button size="small" onClick={handleAddPartToJob} variant="contained">
                            Add
                          </Button>
                          <Button size="small" onClick={() => setShowPartForm(false)}>
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}

                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      Total Cost: {calculateTotalCost(form.parts).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                  </>
                )}

            <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} fullWidth multiline minRows={2} />
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
        <DialogTitle>Delete Job Card</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this job card?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Add Cancel Reason Modal */}
      <Dialog open={showCancelReasonModal} onClose={() => setShowCancelReasonModal(false)}>
        <DialogTitle>Please Clarify the Reason Of Cancelling The job Card</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for Cancellation"
            value={cancellationReason}
            onChange={e => setCancellationReason(e.target.value)}
            required
            fullWidth
            multiline
            minRows={2}
            autoFocus
            error={!cancellationReason.trim()}
            helperText={!cancellationReason.trim() ? 'This field is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelReasonModal(false)}>Cancel</Button>
          <Button onClick={handleCancelReasonSubmit} variant="contained" color="error" disabled={!cancellationReason.trim()}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* In the job card details dialog, display the cancellation reason if present */}
      {open && form.status === 'cancelled' && form.cancellationReason && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Reason for Cancellation:</strong><br />
          <span>{form.cancellationReason}</span>
        </Alert>
      )}

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

export default MaintenancePage; 
