import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, Card, CardContent, MenuItem, Chip, Avatar, useTheme, alpha, Tooltip, Fab, InputAdornment, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExportIcon from '@mui/icons-material/GetApp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

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
  // Optional breakdowns if backend supplies them
  depreciatedCost?: number;
  amortizedCost?: number;
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
  const muiTheme = useTheme();
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
  const [fullscreen, setFullscreen] = useState(false);

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

  // Calculate additional metrics for dashboard
  const scheduledJobs = maintenance.filter(m => m.status === 'scheduled').length;
  const inProgressJobs = maintenance.filter(m => m.status === 'in_progress').length;
  const completedJobs = maintenance.filter(m => m.status === 'completed').length;
  const cancelledJobs = maintenance.filter(m => m.status === 'cancelled').length;

  // Render Dashboard Header
  const renderDashboardHeader = () => (
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
              <BuildIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Maintenance Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Comprehensive maintenance job card system for asset management
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={fetchMaintenance} 
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton 
                onClick={handleExportCSV}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton 
                onClick={() => setFullscreen(!fullscreen)}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Metrics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {maintenance.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Job Cards
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.light }}>
                {scheduledJobs + inProgressJobs}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active Jobs
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.light }}>
                {completedJobs}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Completed Jobs
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: theme.shape.borderRadius
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.light }}>
                {cancelledJobs}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Cancelled Jobs
              </Typography>
            </CardContent>
          </Card>
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
  );

  // ===== Periodic Cost Calculations =====
  const getRecordDate = (m: Maintenance) => new Date(m.completedDate || m.scheduledDate);

  const calcTotalsInRange = (start: Date, end: Date) => {
    const inRange = maintenance.filter(m => {
      const d = getRecordDate(m);
      return d >= start && d <= end;
    });
    const total = inRange.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const depreciated = inRange.reduce((sum, m) => sum + ((m as any).depreciatedCost || 0), 0);
    const amortized = inRange.reduce((sum, m) => sum + ((m as any).amortizedCost || 0), 0);
    return { total, depreciated, amortized };
  };

  const now = new Date();

  // Day
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1);
  const dayTotals = calcTotalsInRange(startOfDay, endOfDay);

  // Week (Mon-Sun)
  const dayIdx = (now.getDay() + 6) % 7; // Monday=0
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - dayIdx);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  endOfWeek.setMilliseconds(endOfWeek.getMilliseconds() - 1);
  const weekTotals = calcTotalsInRange(startOfWeek, endOfWeek);

  // Month (calendar month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);
  const monthTotals = calcTotalsInRange(startOfMonth, endOfMonth);
  const monthName = startOfMonth.toLocaleString(undefined, { month: 'long' });

  // Fiscal helpers (FY starts Apr 1)
  const getFiscalYearStart = (date: Date) => {
    const y = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
    return new Date(y, 3, 1); // Apr 1
  };
  const fyStart = getFiscalYearStart(now);
  const fyEnd = new Date(fyStart.getFullYear() + 1, 3, 1);
  fyEnd.setMilliseconds(fyEnd.getMilliseconds() - 1);

  // Quarter within fiscal year
  const monthsSinceFyStart = (now.getFullYear() - fyStart.getFullYear()) * 12 + (now.getMonth() - 3);
  const quarterIndex = Math.floor(monthsSinceFyStart / 3); // 0..3
  const quarterStart = new Date(fyStart.getFullYear(), 3 + quarterIndex * 3, 1);
  const quarterEnd = new Date(fyStart.getFullYear(), 3 + (quarterIndex + 1) * 3, 1);
  quarterEnd.setMilliseconds(quarterEnd.getMilliseconds() - 1);
  const quarterTotals = calcTotalsInRange(quarterStart, quarterEnd);
  const quarterLabel = `Q${quarterIndex + 1}`;

  // Half-year (H1: Apr-Sep, H2: Oct-Mar)
  const isH1 = monthsSinceFyStart < 6;
  const halfStart = new Date(fyStart.getFullYear(), isH1 ? 3 : 9, 1);
  const halfEnd = new Date(fyStart.getFullYear(), isH1 ? 9 : 12 + 3, 1);
  halfEnd.setMilliseconds(halfEnd.getMilliseconds() - 1);
  const halfTotals = calcTotalsInRange(halfStart, halfEnd);
  const halfLabel = isH1 ? 'H1' : 'H2';

  // Fiscal Year totals
  const yearTotals = calcTotalsInRange(fyStart, fyEnd);
  const fyLabel = `FY ${fyStart.getFullYear()}/${(fyEnd.getFullYear() % 100).toString().padStart(2, '0')}`;

  return (
    <Box sx={{ 
      p: fullscreen ? 1 : 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderDashboardHeader()}
        </motion.div>
              {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            {/* Action Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Job Card Management
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleOpen()}
                startIcon={<AddIcon />}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add Job Card
              </Button>
            </Box>

            {/* Enhanced Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                    {maintenance.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Job Cards
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                    {totalCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                    {totalTime.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Time (hrs)
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                    {avgCostPerJob.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Cost per Job
                  </Typography>
                </CardContent>
              </Card>
            </Box>

                        {/* Search Field */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                label="Search by Job Card Serial Number"
                value={serialSearch}
                onChange={e => setSerialSearch(e.target.value)}
                sx={{ minWidth: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Enhanced Filters */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                🔍 Filter & Search Options
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SaveAltIcon />} 
                    onClick={handleExportCSV}
                    sx={{ 
                      borderColor: theme.palette.success.main,
                      color: theme.palette.success.main,
                      '&:hover': {
                        borderColor: theme.palette.success.dark,
                        backgroundColor: alpha(theme.palette.success.main, 0.1)
                      }
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<PrintIcon />} 
                    onClick={handlePrint}
                    sx={{ 
                      borderColor: theme.palette.info.main,
                      color: theme.palette.info.main,
                      '&:hover': {
                        borderColor: theme.palette.info.dark,
                        backgroundColor: alpha(theme.palette.info.main, 0.1)
                      }
                    }}
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Enhanced Job Cards Table */}
            <Paper 
              elevation={0}
              sx={{ 
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  📊 Job Cards Details ({filteredMaintenance.length} records)
                </Typography>
              </Box>
              
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} style={{ 
                            padding: '16px', 
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, 
                            textAlign: 'left', 
                            fontWeight: 600, 
                            color: theme.palette.text.primary,
                            background: alpha(theme.palette.primary.main, 0.05)
                          }}>
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
                        <tr 
                          key={row.id} 
                          style={{ 
                            background: row.index % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.05);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = row.index % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8);
                          }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} style={{ 
                              padding: '16px', 
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                            }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {loading && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">Loading job cards...</Typography>
                    </Box>
                  )}
                  
                  {error && (
                    <Box sx={{ p: 2 }}>
                      <Alert severity="error">{error}</Alert>
                    </Box>
                  )}
                  
                  {filteredMaintenance.length === 0 && !loading && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No job cards found matching the current filters.</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Paper>
          </motion.div>
 
          {/* Periodic Cost Summary (Bottom Section) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mt: 3,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Periodic Maintenance Cost Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
                {/* Day */}
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Today</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {dayTotals.total.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    {(dayTotals.depreciated || dayTotals.amortized) ? (
                      <Typography variant="caption" color="text.secondary">
                        Dep: {dayTotals.depreciated.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} · Amo: {dayTotals.amortized.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
                {/* Week */}
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">This Week</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {weekTotals.total.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    {(weekTotals.depreciated || weekTotals.amortized) ? (
                      <Typography variant="caption" color="text.secondary">
                        Dep: {weekTotals.depreciated.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} · Amo: {weekTotals.amortized.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
                {/* Month */}
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{monthName}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                      {monthTotals.total.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    {(monthTotals.depreciated || monthTotals.amortized) ? (
                      <Typography variant="caption" color="text.secondary">
                        Dep: {monthTotals.depreciated.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} · Amo: {monthTotals.amortized.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
                {/* Quarter */}
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{quarterLabel}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                      {quarterTotals.total.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    {(quarterTotals.depreciated || quarterTotals.amortized) ? (
                      <Typography variant="caption" color="text.secondary">
                        Dep: {quarterTotals.depreciated.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} · Amo: {quarterTotals.amortized.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
                {/* Half Year */}
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{halfLabel}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                      {halfTotals.total.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    {(halfTotals.depreciated || halfTotals.amortized) ? (
                      <Typography variant="caption" color="text.secondary">
                        Dep: {halfTotals.depreciated.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} · Amo: {halfTotals.amortized.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
                {/* Fiscal Year */}
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.neutral?.main || theme.palette.text.primary, 0.2)}` }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{fyLabel}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {yearTotals.total.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    {(yearTotals.depreciated || yearTotals.amortized) ? (
                      <Typography variant="caption" color="text.secondary">
                        Dep: {yearTotals.depreciated.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} · Amo: {yearTotals.amortized.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add job card"
          onClick={() => handleOpen()}
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

        {/* Enhanced Add/Edit Job Card Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: theme.shadows[8]
            }
          }}
        >
          {/* Enhanced Dialog Header */}
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
              <AddIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {editingId ? 'Edit Job Card' : 'Add New Job Card'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {editingId ? 'Update existing maintenance job card details' : 'Create a new maintenance job card'}
              </Typography>
            </Box>
          </DialogTitle>
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
          {/* Enhanced Dialog Actions */}
          <DialogActions sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            backdropFilter: 'blur(10px)',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleClose}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderColor: theme.palette.grey[400],
                  color: theme.palette.text.secondary,
                  borderRadius: theme.shape.borderRadius,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: theme.palette.grey[600],
                    backgroundColor: alpha(theme.palette.grey[400], 0.1),
                    transform: 'translateY(-1px)',
                    boxShadow: 2
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </Button>
            </Box>
            
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: theme.shape.borderRadius,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                },
                transition: 'all 0.3s ease'
              }}
            >
              {editingId ? 'Update Job Card' : 'Create Job Card'}
            </Button>
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

      {/* Enhanced Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success"
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: 28
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="success">✅</span>
            {success}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaintenancePage; 
