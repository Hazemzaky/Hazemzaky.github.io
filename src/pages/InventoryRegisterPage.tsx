import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiBase';
import {
  Box, Button, Card, CardContent, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';

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
  warranty?: boolean;
  warrantyPeriod?: number;
  warrantyStartDate?: string;
  purchaseCost?: number;
  supplier?: string;
  relatedAsset?: string;
  notes?: string;
  serial?: string; // Added serial number field
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

const warrantyOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const InventoryRegisterPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
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
    warranty: 'no',
    warrantyPeriod: '',
    warrantyStartDate: '',
    purchaseCost: '',
    supplier: '',
    relatedAsset: '',
    notes: '',
    costType: 'direct', // New field
    depreciationDuration: '', // New field
  });
  const [search, setSearch] = useState('');
  const [assetSearchType, setAssetSearchType] = useState<'brand' | 'serialNumber' | 'fleetNumber' | 'plateNumber' | 'chassisNumber' | 'all'>('all');
  const [assetSearchValue, setAssetSearchValue] = useState('');

  useEffect(() => {
    fetchItems();
    fetchAssets();
  }, []);

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
        warranty: item.warranty ? 'yes' : 'no',
        warrantyPeriod: item.warrantyPeriod?.toString() || '',
        warrantyStartDate: item.warrantyStartDate || '',
      });
    } else {
      setEditing(null);
      setForm({
        description: '', type: '', rop: '', quantity: '', uom: '', location: 'Store', rack: '', aisle: '', bin: '', warranty: 'no', warrantyPeriod: '', warrantyStartDate: '', purchaseCost: '', supplier: '', relatedAsset: '', notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({
      description: '', type: '', rop: '', quantity: '', uom: '', location: 'Store', rack: '', aisle: '', bin: '', warranty: 'no', warrantyPeriod: '', warrantyStartDate: '', purchaseCost: '', supplier: '', relatedAsset: '', notes: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const submitData = {
        ...form,
        quantity: Number(form.quantity),
        warranty: form.warranty === 'yes',
        warrantyPeriod: form.warranty === 'yes' ? Number(form.warrantyPeriod) : undefined,
        purchaseCost: Number(form.purchaseCost),
        // Add costType and depreciationDuration
        costType: form.costType,
        depreciationDuration: form.costType === 'depreciated' ? Number(form.depreciationDuration) : undefined,
      };

      if (editing) {
        await api.put(`/inventory/items/${editing._id}`, submitData);
        setSuccess('Item updated!');
      } else {
        await api.post('/inventory/items', submitData);
        setSuccess('Item submitted successfully!');
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

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.trim().toLowerCase();
    return items.filter(i =>
      i.description.toLowerCase().includes(s) ||
      i.rop?.toLowerCase().includes(s) ||
      i.type.toLowerCase().includes(s) ||
      i.location?.toLowerCase().includes(s) ||
      i.rack?.toLowerCase().includes(s) ||
      i.aisle?.toLowerCase().includes(s) ||
      i.bin?.toLowerCase().includes(s) ||
      i.supplier?.toLowerCase().includes(s)
    );
  }, [items, search]);

  // Filtered assets based on search
  const filteredAssets = useMemo(() => {
    if (!assetSearchValue.trim()) return assets;
    const searchValue = assetSearchValue.trim().toLowerCase();
    
    return assets.filter(asset => {
      switch (assetSearchType) {
        case 'brand':
          return asset.brand?.toLowerCase().includes(searchValue);
        case 'serialNumber':
          return asset.serialNumber?.toLowerCase().includes(searchValue);
        case 'fleetNumber':
          return asset.fleetNumber?.toLowerCase().includes(searchValue);
        case 'plateNumber':
          return asset.plateNumber?.toLowerCase().includes(searchValue);
        case 'chassisNumber':
          return asset.chassisNumber?.toLowerCase().includes(searchValue);
        case 'all':
        default:
          return (
            asset.description.toLowerCase().includes(searchValue) ||
            asset.brand?.toLowerCase().includes(searchValue) ||
            asset.serialNumber?.toLowerCase().includes(searchValue) ||
            asset.fleetNumber?.toLowerCase().includes(searchValue) ||
            asset.plateNumber?.toLowerCase().includes(searchValue) ||
            asset.chassisNumber?.toLowerCase().includes(searchValue)
          );
      }
    });
  }, [assets, assetSearchType, assetSearchValue]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Item Description', 'Type', 'ROP', 'Quantity', 'UOM', 'Location', 'Rack', 'Serial Number', 'Rack Label', 'Warranty', 'Warranty Period', 'Warranty Start Date', 'Purchase Cost', 'Supplier', 'Related Asset', 'Notes'];
    const rows = filteredItems.map(i => [
      i.description, 
      i.type, 
      i.rop, 
      i.quantity, 
      i.uom, 
      i.location, 
      i.rack, 
      i.aisle, 
      i.bin, 
      i.warranty ? 'Yes' : 'No', 
      i.warrantyPeriod, 
      i.warrantyStartDate ? new Date(i.warrantyStartDate).toLocaleDateString() : '', 
      i.purchaseCost, 
      i.supplier, 
      i.relatedAsset, 
      i.notes
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Inventory Register');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('inventory_register');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    const printHeader = addPrintHeader('Inventory Register');
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

  // Compute low stock items based on ROP
  const lowStockItems = useMemo(() => items.filter(i => typeof i.rop === 'number' && i.rop > 0 && i.quantity < i.rop), [items]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Low Stock Alerts based on ROP */}
      {lowStockItems.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, background: '#fffbe6', border: '1px solid #ffe082' }}>
          <Typography variant="h6" color="warning.main" gutterBottom>Low Stock Alerts (ROP)</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>ROP</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.rop}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{item.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Total Items</Typography>
            <Typography variant="h5">{items.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Typography variant="subtitle1">Out of Stock</Typography>
            <Typography variant="h5" color={lowStockItems.length > 0 ? 'warning' : 'inherit'}>{lowStockItems.length}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} sx={{ minWidth: 220 }} />
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchItems}>Refresh</Button>
        <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportCSV}>Export CSV</Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>Submit Item</Button>
      </Box>
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>Low stock: {lowStockItems.map(i => i.description).join(', ')}</Alert>
      )}
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            <tr>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Item Description</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Serial Number</th> {/* New column */}
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>ROP</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Quantity</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>UOM</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Location</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Rack</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Serial Number</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Rack Label</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Warranty</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Purchase Cost</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Supplier</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Related Asset</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Notes</th>
              <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
            </tr>
          </TableHead>
          <TableBody>
            {filteredItems.map((i, idx) => {
              const isLowStock = typeof i.rop === 'number' && i.rop > 0 && i.quantity < i.rop;
              return (
                <tr key={i._id} style={{ background: isLowStock ? '#fffde7' : (idx % 2 === 0 ? '#fafafa' : '#fff') }}>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.description}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.type}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.serial || '-'}</td> {/* Serial Number */}
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.rop}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.quantity}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.uom}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.location}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.rack}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.aisle}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.bin}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.warranty ? 'Yes' : 'No'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.purchaseCost?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.supplier}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.relatedAsset}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{i.notes}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <IconButton color="primary" onClick={() => handleOpen(i)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(i._id)}><DeleteIcon /></IconButton>
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
        {loading && <Typography align="center" sx={{ mt: 2 }}>Loading...</Typography>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Item' : 'Submit Item'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Item Description" name="description" value={form.description} onChange={handleFormChange} required fullWidth />
            {/* Item Cost Type Dropdown */}
            <TextField
              select
              label="Item Cost Type"
              name="costType"
              value={form.costType}
              onChange={handleFormChange}
              required
              fullWidth
            >
              <MenuItem value="direct">Direct Cost</MenuItem>
              <MenuItem value="depreciated">Depreciated</MenuItem>
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
              >
                <MenuItem value="">Select Duration</MenuItem>
                {[...Array(24)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1} month{i === 0 ? '' : 's'}</MenuItem>
                ))}
              </TextField>
            )}
            <Box display="flex" gap={2}>
              <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} required fullWidth>
                <MenuItem value="">Select Type</MenuItem>
                {typeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
              <TextField label="ROP (Reorder Point)" name="rop" type="number" value={form.rop} onChange={handleFormChange} sx={{ width: 120 }} />
              <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleFormChange} type="number" required fullWidth />
              <TextField label="UOM" name="uom" value={form.uom} onChange={handleFormChange} required fullWidth />
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} required fullWidth />
              <TextField label="Rack" name="rack" value={form.rack} onChange={handleFormChange} required fullWidth />
              <TextField label="Serial Number" name="serial" value={form.serial} onChange={handleFormChange} required fullWidth />
              <TextField label="Rack Label" name="bin" value={form.bin} onChange={handleFormChange} required fullWidth />
            </Box>
            <Box display="flex" gap={2}>
              <TextField select label="Warranty" name="warranty" value={form.warranty} onChange={handleFormChange} required fullWidth>
                {warrantyOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
              {form.warranty === 'yes' && (
                <>
                  <TextField label="Warranty Period (months)" name="warrantyPeriod" value={form.warrantyPeriod} onChange={handleFormChange} type="number" required fullWidth />
                  <TextField label="Warranty Start Date" name="warrantyStartDate" value={form.warrantyStartDate} onChange={handleFormChange} type="date" required fullWidth InputLabelProps={{ shrink: true }} />
                </>
              )}
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Purchase Cost" name="purchaseCost" value={form.purchaseCost} onChange={handleFormChange} type="number" required fullWidth />
              <TextField label="Supplier" name="supplier" value={form.supplier} onChange={handleFormChange} required fullWidth />
            </Box>
            
            {/* Asset Linking Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Link to Asset (Optional)</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField 
                select 
                label="Search by" 
                value={assetSearchType} 
                onChange={e => setAssetSearchType(e.target.value as any)} 
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Assets</MenuItem>
                <MenuItem value="brand">Brand</MenuItem>
                <MenuItem value="serialNumber">Serial Number</MenuItem>
                <MenuItem value="fleetNumber">Fleet Number</MenuItem>
                <MenuItem value="plateNumber">Plate Number</MenuItem>
                <MenuItem value="chassisNumber">Chassis Number</MenuItem>
              </TextField>
              <TextField 
                label="Search Value" 
                value={assetSearchValue} 
                onChange={e => setAssetSearchValue(e.target.value)} 
                sx={{ flex: 1 }}
                placeholder={`Enter ${assetSearchType === 'all' ? 'any asset detail' : assetSearchType.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
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
              >
                <MenuItem value="">No Asset Selected</MenuItem>
                {filteredAssets.map(asset => (
                  <MenuItem key={asset._id} value={asset._id}>
                    {asset.description} - {asset.brand || asset.serialNumber || asset.fleetNumber || asset.plateNumber || asset.chassisNumber || 'No identifier'}
                  </MenuItem>
                ))}
              </TextField>
            )}
            
            <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} fullWidth multiline minRows={2} />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{editing ? 'Update' : 'Submit'}</Button>
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

export default InventoryRegisterPage; 