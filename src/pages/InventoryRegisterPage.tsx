import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiBase';
import {
  Box, Button, Card, CardContent, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody,
  Avatar,
  Badge,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Fab,
  InputAdornment
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  GetApp as ExportIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import theme from '../theme';

interface InventoryItem {
  _id: string;
  description: string;
  type: 'spare' | 'tool' | 'consumable' | 'tyres';
  rop?: string;
  quantity: number;
  uom: string;
  location?: string;
  rack?: string;
  aisle?: string;
  bin?: string;
  warranty?: string; // Changed to string to match form values
  warrantyPeriod?: number;
  warrantyStartDate?: string;
  purchaseCost?: number;
  supplier?: string;
  relatedAsset?: string;
  notes?: string;
  serial?: string; // Added serial number field
  costType?: 'direct' | 'depreciated'; // Added cost type field
  depreciationDuration?: number; // Added depreciation duration field
}

interface Asset {
  _id: string;
  description: string;
  brand?: string;
  serialNumber?: string;
  fleetNumber?: string;
  plateNumber?: string;
  chassisNumber?: string;
}

const typeOptions = [
  { value: 'spare', label: 'Spare Part' },
  { value: 'tool', label: 'Tool' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'tyres', label: 'Tyres' },
];

const InventoryRegisterPage: React.FC = () => {
  const muiTheme = useTheme();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [form, setForm] = useState<any>({
    description: '',
    type: '',
    rop: '',
    quantity: '',
    uom: '',
    location: 'Store',
    rack: '',
    aisle: '',
    bin: '',
    warranty: 'false',
    warrantyPeriod: '',
    warrantyStartDate: '',
    purchaseCost: '',
    supplier: '',
    relatedAsset: '',
    notes: '',
    costType: 'direct', // New field
    depreciationDuration: '', // New field
    serial: '', // Added serial field
  });
  const [search, setSearch] = useState('');
  const [assetSearchType, setAssetSearchType] = useState<'brand' | 'serialNumber' | 'fleetNumber' | 'plateNumber' | 'chassisNumber' | 'all'>('all');
  const [assetSearchValue, setAssetSearchValue] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState('');

  // Calculate inventory metrics
  const inventoryMetrics = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + ((item.purchaseCost || 0) * (item.quantity || 0)), 0),
    lowStockItems: items.filter(item => (item.quantity || 0) <= (Number(item.rop) || 0)).length,
    totalTypes: new Set(items.map(item => item.type)).size,
    warrantyItems: items.filter(item => item.warranty === "true").length
  };

  useEffect(() => {
    fetchItems();
    fetchAssets();
  }, []);

  // Dashboard header and metrics section
  const renderDashboardHeader = () => (
    <>
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
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
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
                  <InventoryIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Inventory Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Stock control, asset tracking, and inventory analytics
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={fetchItems} 
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

      {/* Inventory Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
          {[
            { 
              title: 'Total Items', 
              value: inventoryMetrics.totalItems, 
              color: theme.palette.primary.main,
              bgColor: alpha(theme.palette.primary.main, 0.1),
              icon: <InventoryIcon />
            },
            { 
              title: 'Total Value', 
              value: `$${inventoryMetrics.totalValue.toLocaleString()}`, 
              color: theme.palette.success.main,
              bgColor: alpha(theme.palette.success.main, 0.1),
              icon: <TrendingUpIcon />
            },
            { 
              title: 'Low Stock Items', 
              value: inventoryMetrics.lowStockItems, 
              color: theme.palette.warning.main,
              bgColor: alpha(theme.palette.warning.main, 0.1),
              icon: <WarningIcon />
            },
            { 
              title: 'Warranty Items', 
              value: inventoryMetrics.warrantyItems, 
              color: theme.palette.info.main,
              bgColor: alpha(theme.palette.info.main, 0.1),
              icon: <CheckCircleIcon />
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  background: item.bgColor,
                  border: `1px solid ${alpha(item.color, 0.3)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(item.color, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: item.color, width: 40, height: 40, mr: 1 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: item.color, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </>
  );

  // Add refresh on focus to ensure data is up to date
  useEffect(() => {
    const handleFocus = () => {
      fetchItems();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory/items');
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
        setError('Unexpected response from server');
        console.error('Expected array, got:', res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data as Asset[]);
    } catch (err: any) {
      console.error('Failed to fetch assets:', err);
    }
  };

  const handleOpen = (item?: InventoryItem) => {
    if (item) {
      setEditing(item);
      setForm({ 
        ...item, 
        warranty: item.warranty || "false",
        warrantyPeriod: item.warrantyPeriod?.toString() || '',
        warrantyStartDate: item.warrantyStartDate || '',
        costType: item.costType || 'direct',
        depreciationDuration: item.depreciationDuration || '',
        serial: item.serial || '',
      });
    } else {
      setEditing(null);
      setForm({
        description: '', type: '', rop: '', quantity: '', uom: '', location: 'Store', rack: '', aisle: '', bin: '', warranty: 'false', warrantyPeriod: '', warrantyStartDate: '', purchaseCost: '', supplier: '', relatedAsset: '', notes: '', costType: 'direct', depreciationDuration: '', serial: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({
      description: '', type: '', rop: '', quantity: '', uom: '', location: 'Store', rack: '', aisle: '', bin: '', warranty: 'false', warrantyPeriod: '', warrantyStartDate: '', purchaseCost: '', supplier: '', relatedAsset: '', notes: '', costType: 'direct', depreciationDuration: '', serial: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemData = {
        ...form,
        warranty: form.warranty === "true",
        purchaseCost: Number(form.purchaseCost),
        quantity: Number(form.quantity),
        rop: Number(form.rop),
        warrantyPeriod: form.warranty === "true" ? Number(form.warrantyPeriod) : undefined,
        depreciationDuration: form.depreciationDuration ? Number(form.depreciationDuration) : undefined,
        serial: form.serial || undefined,
      };

      if (editing) {
        await api.put(`/inventory/items/${editing._id}`, itemData);
        setSuccess('Item updated successfully!');
      } else {
        await api.post('/inventory/items', itemData);
        setSuccess('Item added successfully!');
      }

      fetchItems();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/inventory/items/${id}`);
      setSuccess('Item deleted!');
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      description: item.description || '',
      type: item.type || '',
      rop: item.rop || '',
      quantity: item.quantity || '',
      uom: item.uom || '',
      location: item.location || 'Store',
      rack: item.rack || '',
      aisle: item.aisle || '',
      bin: item.bin || '',
      warranty: item.warranty || "false",
      warrantyPeriod: item.warrantyPeriod || '',
      warrantyStartDate: item.warrantyStartDate || '',
      purchaseCost: item.purchaseCost || '',
      supplier: item.supplier || '',
      relatedAsset: item.relatedAsset || '',
      notes: item.notes || '',
      costType: item.costType || 'direct',
      depreciationDuration: item.depreciationDuration || '',
      serial: item.serial || '',
    });
    setOpen(true);
  };

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    if (!assetSearchValue) return [];
    if (assetSearchType === 'all') {
      return assets.filter(asset => 
        asset.description.toLowerCase().includes(assetSearchValue.toLowerCase()) ||
        (asset.brand && asset.brand.toLowerCase().includes(assetSearchValue.toLowerCase())) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(assetSearchValue.toLowerCase())) ||
        (asset.fleetNumber && asset.fleetNumber.toLowerCase().includes(assetSearchValue.toLowerCase())) ||
        (asset.plateNumber && asset.plateNumber.toLowerCase().includes(assetSearchValue.toLowerCase())) ||
        (asset.chassisNumber && asset.chassisNumber.toLowerCase().includes(assetSearchValue.toLowerCase()))
      );
    } else {
      const searchField = assetSearchType as keyof Asset;
      return assets.filter(asset => 
        asset[searchField] && 
        asset[searchField]!.toString().toLowerCase().includes(assetSearchValue.toLowerCase())
      );
    }
  }, [assets, assetSearchType, assetSearchValue]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Apply search filter
    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchValue) ||
        item.type.toLowerCase().includes(searchValue) ||
        (item.serial && item.serial.toLowerCase().includes(searchValue)) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchValue)) ||
        (item.location && item.location.toLowerCase().includes(searchValue))
      );
    }
    
    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter(item => 
        item.location && item.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    // Apply stock status filter
    if (filterStockStatus) {
      switch (filterStockStatus) {
        case 'in_stock':
          filtered = filtered.filter(item => (item.quantity || 0) > 0);
          break;
        case 'low_stock':
          filtered = filtered.filter(item => 
            (item.quantity || 0) > 0 && 
            (item.quantity || 0) <= (Number(item.rop) || 0)
          );
          break;
        case 'out_of_stock':
          filtered = filtered.filter(item => (item.quantity || 0) <= 0);
          break;
      }
    }
    
    return filtered;
  }, [items, search, filterType, filterLocation, filterStockStatus]);

  // Compute low stock items based on ROP
  const lowStockItems = useMemo(() => items.filter(i => typeof i.rop === 'number' && i.rop > 0 && i.quantity < i.rop), [items]);

  const handleExportCSV = () => {
    const headers = ['Description', 'Type', 'Serial Number', 'ROP', 'Quantity', 'UOM', 'Location', 'Rack', 'Aisle', 'Bin', 'Warranty', 'Purchase Cost', 'Supplier', 'Notes'];
    const csvData = items.map(item => [
      item.description,
      item.type,
      item.serial || '',
      item.rop || '',
      item.quantity,
      item.uom,
      item.location || '',
      item.rack || '',
      item.aisle || '',
      item.bin || '',
      item.warranty === "true" ? 'Yes' : 'No',
      item.purchaseCost || '',
      item.supplier || '',
      item.notes || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', getExportFileName('inventory-register'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printHeader = addPrintHeader('Inventory Register Report');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Inventory Register Report</title>
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
      p: fullscreen ? 1 : 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {renderDashboardHeader()}
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Inventory Register Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add New Item
              </Button>
            </Box>
      
            {/* Quick Actions Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3, 
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.warning.main, fontWeight: 600 }}>
                ⚡ Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterStockStatus('low_stock');
                    setSearch('');
                    setFilterType('');
                    setFilterLocation('');
                  }}
                  sx={{ 
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1)
                    }
                  }}
                >
                  Show Low Stock
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterType('');
                    setFilterLocation('');
                    setFilterStockStatus('');
                    setSearch('warranty');
                  }}
                  sx={{ 
                    borderColor: theme.palette.success.main,
                    color: theme.palette.success.main,
                    '&:hover': {
                      borderColor: theme.palette.success.dark,
                      backgroundColor: alpha(theme.palette.success.main, 0.1)
                    }
                  }}
                >
                  Show Warranty Items
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterType('');
                    setFilterLocation('');
                    setFilterStockStatus('');
                    setSearch('');
                  }}
                  sx={{ 
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                    '&:hover': {
                      borderColor: theme.palette.info.dark,
                      backgroundColor: alpha(theme.palette.info.main, 0.1)
                    }
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleExportCSV}
                  sx={{ 
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                    }
                  }}
                >
                  Export Data
                </Button>
              </Box>
            </Paper>

            {/* Enhanced Filter/Search Controls */}
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
                🔍 Search & Filter Options
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <TextField 
                  label="Search Items" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by description, type, or supplier..."
                />
                <TextField 
                  select 
                  label="Type Filter" 
                  value={filterType || ''} 
                  onChange={e => setFilterType(e.target.value)} 
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="spare">🔧 Spare Part</MenuItem>
                  <MenuItem value="tool">🛠️ Tool</MenuItem>
                  <MenuItem value="consumable">🧪 Consumable</MenuItem>
                  <MenuItem value="tyres">🚗 Tyres</MenuItem>
                </TextField>
                <TextField 
                  label="Location Filter" 
                  value={filterLocation || ''} 
                  onChange={e => setFilterLocation(e.target.value)} 
                  sx={{ minWidth: 150 }} 
                  placeholder="Filter by location..."
                />
                <TextField 
                  select 
                  label="Stock Status" 
                  value={filterStockStatus || ''} 
                  onChange={e => setFilterStockStatus(e.target.value)} 
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="in_stock">✅ In Stock</MenuItem>
                  <MenuItem value="low_stock">⚠️ Low Stock</MenuItem>
                  <MenuItem value="out_of_stock">❌ Out of Stock</MenuItem>
                </TextField>
                <Button 
                  variant="outlined" 
                  onClick={handleExportCSV}
                  startIcon={<ExportIcon />}
                  sx={{ 
                    borderColor: theme.palette.info.main,
                    color: theme.palette.info.main,
                    '&:hover': {
                      borderColor: theme.palette.info.dark,
                      backgroundColor: alpha(theme.palette.info.main, 0.1)
                    }
                  }}
                >
                  Export CSV
                </Button>
              </Box>
            </Paper>
                  {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  background: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.error.main, width: 32, height: 32 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    ⚠️ Low Stock Alert ({lowStockItems.length} items)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {lowStockItems.map(i => i.description).join(', ')}
                </Typography>
              </Paper>
            )}
      
        {/* Enhanced Inventory Table */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Loading inventory...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we fetch your inventory data
            </Typography>
          </Box>
        ) : (
          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Item Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type & Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Stock Information</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Location & Storage</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Financial Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" color="text.secondary">
                          No inventory items found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create your first inventory item to get started with inventory management
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpen()}
                        >
                          Create First Item
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {item.description}
                          </Typography>
                          {item.serial && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              S/N: {item.serial}
                            </Typography>
                          )}
                          {item.notes && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {item.notes}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip 
                            label={item.type} 
                            color="primary" 
                            size="small" 
                            sx={{ mb: 1 }}
                          />
                          {item.costType && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Cost: {item.costType}
                            </Typography>
                          )}
                          {item.depreciationDuration && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Depreciation: {item.depreciationDuration} months
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            Qty: {item.quantity} {item.uom}
                          </Typography>
                          {item.rop && (
                            <Typography variant="caption" color="text.secondary">
                              ROP: {item.rop}
                            </Typography>
                          )}
                          {(item.quantity || 0) <= (Number(item.rop) || 0) && (
                            <Chip 
                              label="Low Stock" 
                              color="warning" 
                              size="small" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.location || 'Store'}
                          </Typography>
                          {item.rack && (
                            <Typography variant="caption" color="text.secondary">
                              Rack: {item.rack}
                            </Typography>
                          )}
                          {item.aisle && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Aisle: {item.aisle}
                            </Typography>
                          )}
                          {item.bin && (
                            <Typography variant="caption" color="text.secondary">
                              Bin: {item.bin}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {item.purchaseCost ? `$${item.purchaseCost.toLocaleString()}` : '-'}
                          </Typography>
                          {item.supplier && (
                            <Typography variant="caption" color="text.secondary">
                              Supplier: {item.supplier}
                            </Typography>
                          )}
                          {item.warranty === "true" && (
                            <Chip 
                              label="Warranty" 
                              color="info" 
                              size="small" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Tooltip title="Edit Item">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(item)}
                              sx={{ 
                                color: theme.palette.info.main,
                                '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Item">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(item._id)}
                              sx={{ 
                                color: theme.palette.error.main,
                                '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handlePrint()}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                              }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Summary Statistics */}
        {filteredItems.length > 0 && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mt: 3, 
              background: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.success.main, fontWeight: 600 }}>
              📊 Summary Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Items</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {filteredItems.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Value</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  ${filteredItems.reduce((sum, item) => sum + ((item.purchaseCost || 0) * (item.quantity || 0)), 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Average Value</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${(filteredItems.reduce((sum, item) => sum + ((item.purchaseCost || 0) * (item.quantity || 0)), 0) / filteredItems.length).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Low Stock Items</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                  {filteredItems.filter(item => (item.quantity || 0) <= (Number(item.rop) || 0)).length}
                </Typography>
              </Box>
            </Box>
          </Paper>
                    )}
          </Paper>
        </motion.div>

      {/* Enhanced Dialog for Add/Edit Item */}
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
            {editing ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {editing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {editing ? 'Update item details and information' : 'Create a new item in your inventory system'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
                📝 Basic Information
              </Typography>
              <TextField 
                label="Item Description" 
                name="description" 
                value={form.description} 
                onChange={handleFormChange} 
                required 
                fullWidth 
                sx={{ mb: 2 }}
              />
              
              {/* Item Cost Type Dropdown */}
              <TextField
                select
                label="Item Cost Type"
                name="costType"
                value={form.costType}
                onChange={handleFormChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="direct">💰 Direct Cost</MenuItem>
                <MenuItem value="depreciated">📉 Depreciated</MenuItem>
              </TextField>
              
              {/* Depreciation Duration Dropdown (if Depreciated) */}
              {form.costType === 'depreciated' && (
                <TextField
                  select
                  label="Duration of Depreciation (months)"
                  name="depreciationDuration"
                  value={form.depreciationDuration}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">Select Duration</MenuItem>
                  {[...Array(24)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1} month{i === 0 ? '' : 's'}</MenuItem>
                  ))}
                </TextField>
              )}
            </Paper>
            {/* Item Classification & Stock Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                🏷️ Item Classification & Stock
              </Typography>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
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
                  {typeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
                <TextField 
                  label="UOM" 
                  name="uom" 
                  value={form.uom} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField 
                  label="Quantity" 
                  name="quantity" 
                  value={form.quantity} 
                  onChange={handleFormChange} 
                  type="number" 
                  required 
                  fullWidth 
                />
                <TextField 
                  label="ROP (Reorder Point)" 
                  name="rop" 
                  type="number" 
                  value={form.rop} 
                  onChange={handleFormChange} 
                  fullWidth 
                  helperText="Minimum stock level before reordering"
                />
              </Box>
            </Paper>
            {/* Location & Storage Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.success.main, fontWeight: 600 }}>
                📍 Location & Storage
              </Typography>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <TextField 
                  label="Location" 
                  name="location" 
                  value={form.location} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  helperText="Main storage location (e.g., Store, Warehouse)"
                />
                <TextField 
                  label="Rack" 
                  name="rack" 
                  value={form.rack} 
                  onChange={handleFormChange} 
                  fullWidth 
                  helperText="Rack or shelf identifier"
                />
              </Box>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <TextField 
                  label="Aisle" 
                  name="aisle" 
                  value={form.aisle} 
                  onChange={handleFormChange} 
                  fullWidth 
                  helperText="Aisle or corridor identifier"
                />
                <TextField 
                  label="Serial Number" 
                  name="serial" 
                  value={form.serial} 
                  onChange={handleFormChange} 
                  fullWidth 
                  helperText="Unique serial number for tracking"
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField 
                  label="Bin/Rack Label" 
                  name="bin" 
                  value={form.bin} 
                  onChange={handleFormChange} 
                  fullWidth 
                  helperText="Specific bin or compartment label"
                />
              </Box>
            </Paper>
            {/* Warranty Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.warning.main, fontWeight: 600 }}>
                🛡️ Warranty Information
              </Typography>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <TextField 
                  select 
                  label="Warranty" 
                  name="warranty" 
                  value={form.warranty} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth
                  helperText="Does this item have warranty coverage?"
                >
                  <MenuItem value="true">✅ Yes</MenuItem>
                  <MenuItem value="false">❌ No</MenuItem>
                </TextField>
              </Box>
              {form.warranty === "true" && (
                <Box display="flex" gap={2}>
                  <TextField 
                    label="Warranty Period (months)" 
                    name="warrantyPeriod" 
                    value={form.warrantyPeriod} 
                    onChange={handleFormChange} 
                    type="number" 
                    required 
                    fullWidth 
                    helperText="Duration of warranty coverage"
                  />
                  <TextField 
                    label="Warranty Start Date" 
                    name="warrantyStartDate" 
                    value={form.warrantyStartDate} 
                    onChange={handleFormChange} 
                    type="date" 
                    required 
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                    helperText="When warranty coverage begins"
                  />
                </Box>
              )}
            </Paper>
            {/* Financial Information Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.secondary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.secondary.main, fontWeight: 600 }}>
                💰 Financial Information
              </Typography>
              <Box display="flex" gap={2}>
                <TextField 
                  label="Purchase Cost" 
                  name="purchaseCost" 
                  value={form.purchaseCost} 
                  onChange={handleFormChange} 
                  type="number" 
                  required 
                  fullWidth 
                  helperText="Cost per unit when purchased"
                />
                <TextField 
                  label="Supplier" 
                  name="supplier" 
                  value={form.supplier} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  helperText="Vendor or supplier name"
                />
              </Box>
            </Paper>
            
            {/* Asset Linking Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                🔗 Asset Linking (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Link this inventory item to an existing asset for better tracking and management
              </Typography>
              <Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField 
                  select 
                  label="Search by" 
                  value={assetSearchType} 
                  onChange={e => setAssetSearchType(e.target.value as any)} 
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">🔍 All Assets</MenuItem>
                  <MenuItem value="brand">🏷️ Brand</MenuItem>
                  <MenuItem value="serialNumber">📋 Serial Number</MenuItem>
                  <MenuItem value="fleetNumber">🚗 Fleet Number</MenuItem>
                  <MenuItem value="plateNumber">🚙 Plate Number</MenuItem>
                  <MenuItem value="chassisNumber">🔧 Chassis Number</MenuItem>
                </TextField>
                <TextField 
                  label="Search Value" 
                  value={assetSearchValue} 
                  onChange={e => setAssetSearchValue(e.target.value)} 
                  sx={{ flex: 1 }}
                  placeholder={`Enter ${assetSearchType === 'all' ? 'any asset detail' : assetSearchType.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  helperText="Search for assets to link with this item"
                />
              </Box>
              {assetSearchValue && (
                <TextField 
                  select 
                  label="Select Related Asset" 
                  name="relatedAsset" 
                  value={form.relatedAsset} 
                  onChange={handleFormChange} 
                  fullWidth
                  helperText="Choose the asset to link with this inventory item"
                >
                  <MenuItem value="">No Asset Selected</MenuItem>
                  {filteredAssets.map(asset => (
                    <MenuItem key={asset._id} value={asset._id}>
                      {asset.description} - {asset.brand || asset.serialNumber || asset.fleetNumber || asset.plateNumber || asset.chassisNumber || 'No identifier'}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Paper>
            
            {/* Additional Information Section */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                background: alpha(theme.palette.neutral?.main || '#64748b', 0.05),
                border: `1px solid ${alpha(theme.palette.neutral?.main || '#64748b', 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.neutral?.main || '#64748b', fontWeight: 600 }}>
                📝 Additional Information
              </Typography>
              <TextField 
                label="Notes" 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                fullWidth 
                multiline 
                minRows={3}
                placeholder="Enter any additional notes, special instructions, or comments about this item..."
                helperText="Optional notes for internal reference and tracking"
              />
            </Paper>

            {/* Error Display */}
            {error && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Alert severity="error" sx={{ mb: 0 }}>
                  {error}
                </Alert>
              </Paper>
            )}
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
            startIcon={editing ? <EditIcon /> : <AddIcon />}
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
            {editing ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add item"
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
      </AnimatePresence>
    </Box>
  );
};

export default InventoryRegisterPage; 