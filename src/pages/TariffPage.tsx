import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import apiBase from '../apiBase';

interface Tariff {
  _id: string;
  assetType: 'Vehicle' | 'Attachment' | 'Equipment' | 'Building' | 'Furniture' | 'IT' | 'Other';
  mainCategory: string;
  subCategory: string;
  subSubCategory?: string;
  pricingType: 'per_hour' | 'per_day' | 'per_month';
  rate: number;
  currency: string;
  description?: string;
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TariffFormData {
  assetType: string;
  mainCategory: string;
  subCategory: string;
  subSubCategory: string;
  pricingType: string;
  rate: string;
  currency: string;
  description: string;
  isActive: boolean;
  effectiveDate: string;
  expiryDate: string;
  notes: string;
}

const TariffPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [viewingTariff, setViewingTariff] = useState<Tariff | null>(null);
  const [assetCategories, setAssetCategories] = useState<any>({});

  const [formData, setFormData] = useState<TariffFormData>({
    assetType: '',
    mainCategory: '',
    subCategory: '',
    subSubCategory: '',
    pricingType: '',
    rate: '',
    currency: 'KWD',
    description: '',
    isActive: true,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: ''
  });

  // Asset hierarchies for category selection
  const assetHierarchies: Record<string, any> = {
    Vehicle: {
      'Trucks': {
        'Light-Duty Trucks': {
          'Pickup Trucks': ['Single Cab', 'Double Cab', 'Crew Cab'],
          'Mini Trucks': ['Kei Trucks', 'Flatbed Mini Trucks', 'Box Mini Trucks']
        },
        'Medium-Duty Trucks': {
          'Box Trucks': ['Dry Van', 'Refrigerated Box'],
          'Flatbed Trucks': ['Stake Bed', 'Drop-Side Flatbed'],
          'Utility Service Trucks': ['Bucket Trucks', 'Maintenance Trucks']
        },
        'Heavy-Duty Trucks': {
          'Tractor-Trailers (Semi-Trucks)': ['Sleeper Cab', 'Day Cab'],
          'Dump Trucks': ['Standard Dump', 'Articulated Dump'],
          'Tanker Trucks': ['Fuel Tankers', 'Water Tankers', 'Chemical Tankers'],
          'Logging Trucks': ['Long Log', 'Short Log']
        }
      },
      'Vans': {
        'Cargo Vans': ['Standard Roof', 'High Roof', 'Extended Wheelbase'],
        'Passenger Vans': ['8-Seater', '12-Seater', '15-Seater'],
        'Mini Vans': {
          'Family Vans': ['Hybrid', 'Electric'],
          'Taxi Vans': ['Wheelchair Accessible', 'Partitioned Vans']
        },
        'Specialty Vans': ['Refrigerated Vans', 'Mobile Workshop Vans', 'Surveillance Vans']
      }
    },
    Equipment: {
      'Material Handling Equipment': {
        'Conveyors': ['Belt Conveyors', 'Roller Conveyors', 'Chain Conveyors'],
        'Lifting Equipment': ['Scissor Lifts', 'Lift Tables'],
        'Pallet Handling': ['Pallet Jacks', 'Pallet Inverters', 'Pallet Stackers']
      },
      'Safety Equipment': {
        'Personal Protective Equipment (PPE)': ['Head Protection', 'Eye & Face Protection', 'Respiratory Protection'],
        'Fall Protection': ['Safety Harnesses', 'Lanyards & Lifelines'],
        'Fire Safety': ['Fire Extinguishers', 'Fire Blankets', 'Smoke Detectors']
      }
    },
    Attachment: {
      'Flatbed Trailers': {
        'Standard Flatbeds': ['48-ft Flatbed', '53-ft Flatbed'],
        'Extendable Flatbeds': ['Manual Extension', 'Hydraulic Extension'],
        'Drop Deck Flatbeds (Step Decks)': ['Single Drop', 'Double Drop']
      },
      'Enclosed Trailers (Dry Vans)': {
        'Standard Dry Vans': ['53-ft Dry Van', '48-ft Dry Van'],
        'Pup Trailers': ['28-ft Pup'],
        'High Cube Dry Vans': ['Insulated Models']
      }
    }
  };

  useEffect(() => {
    fetchTariffs();
    fetchAssetCategories();
  }, []);

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/api/tariffs`);
      if (!response.ok) throw new Error('Failed to fetch tariffs');
      const data = await response.json();
      setTariffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tariffs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetCategories = async () => {
    try {
      const response = await fetch(`${apiBase}/api/assets/categories`);
      if (!response.ok) throw new Error('Failed to fetch asset categories');
      const data = await response.json();
      setAssetCategories(data);
    } catch (err) {
      console.error('Failed to fetch asset categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTariff 
        ? `${apiBase}/api/tariffs/${editingTariff._id}`
        : `${apiBase}/api/tariffs`;
      
      const method = editingTariff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rate: parseFloat(formData.rate),
          isActive: formData.isActive
        })
      });

      if (!response.ok) throw new Error('Failed to save tariff');
      
      await fetchTariffs();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tariff');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tariff?')) return;
    
    try {
      const response = await fetch(`${apiBase}/api/tariffs/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete tariff');
      
      await fetchTariffs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tariff');
    }
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setFormData({
      assetType: tariff.assetType,
      mainCategory: tariff.mainCategory,
      subCategory: tariff.subCategory,
      subSubCategory: tariff.subSubCategory || '',
      pricingType: tariff.pricingType,
      rate: tariff.rate.toString(),
      currency: tariff.currency,
      description: tariff.description || '',
      isActive: tariff.isActive,
      effectiveDate: new Date(tariff.effectiveDate).toISOString().split('T')[0],
      expiryDate: tariff.expiryDate ? new Date(tariff.expiryDate).toISOString().split('T')[0] : '',
      notes: tariff.notes || ''
    });
    setOpenDialog(true);
  };

  const handleView = (tariff: Tariff) => {
    setViewingTariff(tariff);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTariff(null);
    setFormData({
      assetType: '',
      mainCategory: '',
      subCategory: '',
      subSubCategory: '',
      pricingType: '',
      rate: '',
      currency: 'KWD',
      description: '',
      isActive: true,
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      notes: ''
    });
  };

  const handleCloseViewDialog = () => {
    setViewingTariff(null);
  };

  const getMainCategories = () => {
    if (!formData.assetType) return [];
    const hierarchy = assetHierarchies[formData.assetType as keyof typeof assetHierarchies] as Record<string, any>;
    return hierarchy ? Object.keys(hierarchy) : [];
  };

  const getSubCategories = () => {
    if (!formData.assetType || !formData.mainCategory) return [];
    const hierarchy = assetHierarchies[formData.assetType as keyof typeof assetHierarchies] as Record<string, any>;
    const mainCat = hierarchy?.[formData.mainCategory as string] as Record<string, any>;
    return mainCat ? Object.keys(mainCat) : [];
  };

  const getSubSubCategories = () => {
    if (!formData.assetType || !formData.mainCategory || !formData.subCategory) return [];
    const hierarchy = assetHierarchies[formData.assetType as keyof typeof assetHierarchies] as Record<string, any>;
    const mainCat = hierarchy?.[formData.mainCategory as string] as Record<string, any>;
    const subCat = mainCat?.[formData.subCategory as string];
    return Array.isArray(subCat) ? subCat : (subCat ? Object.keys(subCat) : []);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading tariffs...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tariff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Tariff
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {tariffs.map((tariff) => (
          <Card key={tariff._id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6" component="h2">
                  {tariff.assetType} - {tariff.mainCategory}
                </Typography>
                <Chip 
                  label={tariff.isActive ? 'Active' : 'Inactive'} 
                  color={tariff.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {tariff.subCategory}
                {tariff.subSubCategory && ` > ${tariff.subSubCategory}`}
              </Typography>
              
              <Typography variant="h5" color="primary" gutterBottom>
                {tariff.rate} {tariff.currency}/{tariff.pricingType.replace('per_', '')}
              </Typography>
              
              {tariff.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {tariff.description}
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary">
                Effective: {new Date(tariff.effectiveDate).toLocaleDateString()}
                {tariff.expiryDate && ` | Expires: ${new Date(tariff.expiryDate).toLocaleDateString()}`}
              </Typography>
            </CardContent>
            
            <CardActions>
              <IconButton size="small" onClick={() => handleView(tariff)}>
                <Visibility />
              </IconButton>
              <IconButton size="small" onClick={() => handleEdit(tariff)}>
                <Edit />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(tariff._id)}>
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTariff ? 'Edit Tariff' : 'Add New Tariff'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack direction="row" spacing={2} mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value, mainCategory: '', subCategory: '', subSubCategory: '' })}
                  label="Asset Type"
                >
                  <MenuItem value="Vehicle">Vehicle</MenuItem>
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Attachment">Attachment</MenuItem>
                  <MenuItem value="Building">Building</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth required>
                <InputLabel>Main Category</InputLabel>
                <Select
                  value={formData.mainCategory}
                  onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value, subCategory: '', subSubCategory: '' })}
                  label="Main Category"
                  disabled={!formData.assetType}
                >
                  {getMainCategories().map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            
            <Stack direction="row" spacing={2} mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Sub Category</InputLabel>
                <Select
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value, subSubCategory: '' })}
                  label="Sub Category"
                  disabled={!formData.mainCategory}
                >
                  {getSubCategories().map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Sub-Sub Category</InputLabel>
                <Select
                  value={formData.subSubCategory}
                  onChange={(e) => setFormData({ ...formData, subSubCategory: e.target.value })}
                  label="Sub-Sub Category"
                  disabled={!formData.subCategory}
                >
                  <MenuItem value="">None</MenuItem>
                  {getSubSubCategories().map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            
            <Stack direction="row" spacing={2} mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Pricing Type</InputLabel>
                <Select
                  value={formData.pricingType}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                  label="Pricing Type"
                >
                  <MenuItem value="per_hour">Per Hour</MenuItem>
                  <MenuItem value="per_day">Per Day</MenuItem>
                  <MenuItem value="per_month">Per Month</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>
            
            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                fullWidth
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                required
              />
              
              <TextField
                fullWidth
                label="Effective Date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            
            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Stack>
            
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTariff ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingTariff} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        {viewingTariff && (
          <>
            <DialogTitle>Tariff Details</DialogTitle>
            <DialogContent>
              <Stack direction="row" spacing={2} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Asset Type</Typography>
                  <Typography variant="body1">{viewingTariff.assetType}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Main Category</Typography>
                  <Typography variant="body1">{viewingTariff.mainCategory}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Sub Category</Typography>
                  <Typography variant="body1">{viewingTariff.subCategory}</Typography>
                </Box>
                {viewingTariff.subSubCategory && (
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="text.secondary">Sub-Sub Category</Typography>
                    <Typography variant="body1">{viewingTariff.subSubCategory}</Typography>
                  </Box>
                )}
              </Stack>
              <Stack direction="row" spacing={2} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Pricing Type</Typography>
                  <Typography variant="body1">{viewingTariff.pricingType.replace('per_', 'Per ')}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Rate</Typography>
                  <Typography variant="body1">{viewingTariff.rate} {viewingTariff.currency}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={viewingTariff.isActive ? 'Active' : 'Inactive'} 
                    color={viewingTariff.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Effective Date</Typography>
                  <Typography variant="body1">{new Date(viewingTariff.effectiveDate).toLocaleDateString()}</Typography>
                </Box>
              </Stack>
              {viewingTariff.expiryDate && (
                <Stack direction="row" spacing={2} mb={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1">{new Date(viewingTariff.expiryDate).toLocaleDateString()}</Typography>
                  </Box>
                </Stack>
              )}
              {viewingTariff.description && (
                <Stack direction="row" spacing={2} mb={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{viewingTariff.description}</Typography>
                  </Box>
                </Stack>
              )}
              {viewingTariff.notes && (
                <Stack direction="row" spacing={2} mb={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1">{viewingTariff.notes}</Typography>
                  </Box>
                </Stack>
              )}
              <Stack direction="row" spacing={2} mb={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{new Date(viewingTariff.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1">{new Date(viewingTariff.updatedAt).toLocaleDateString()}</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TariffPage; 