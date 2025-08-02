import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import HierarchicalCategorySelector from '../components/HierarchicalCategorySelector';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, MenuItem, Chip, FormControl, InputLabel, Select, OutlinedInput, CircularProgress, Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
// REMOVE: import { differenceInDays, differenceInHours, parseISO, isValid } from 'date-fns';

interface Asset {
  _id: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  subSubCategory?: string;
  brand?: string;
  plateNumber?: string;
  serialNumber?: string;
  fleetNumber?: string;
  chassisNumber?: string;
  availability: 'available' | 'assigned' | 'maintenance' | 'out_of_service';
  currentProject?: {
    _id: string;
    customer: string;
    description?: string;
    status?: string;
  };
}

interface Project {
  _id: string;
  customer: string;
  equipmentDescription: string;
  totalBasicHours: number;
  totalOvertimeHours: number;
  overallHours: number;
  overtimeHoursCost: number;
  overtimeHours: number;
  overtimePrice: number;
  rentType: 'monthly' | 'call_out';
  department: string;
  priceListDescription: string;
  operators: string;
  workHours: string;
  unitPrice: number;
  startTime: string;
  endTime: string;
  status?: string;
  description?: string;
  revenue?: number;
  notes?: string;
  assignedAssets?: Asset[];
  serialNumber?: string; // Added serialNumber to the Project interface
}

const defaultForm = {
  startDate: '',
  startTime: '00:00',
  endDate: '',
  endTime: '00:00',
  customer: '',
  equipmentDescription: '',
  totalBasicHours: 0,
  totalOvertimeHours: 0,
  overallHours: 0,
  overtimeHoursCost: 0,
  overtimeHours: 0,
  overtimePrice: 0,
  rentType: 'monthly',
  department: '',
  priceListDescription: '',
  operators: '',
  workHours: '',
  unitPrice: 0,
  status: 'in_progress',
  description: '',
  revenue: '',
  notes: '',
  assignedAssets: [] as string[],
};

// Helper to combine date and time strings into a Date object
function combineDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return null;
  const [hours, minutes] = (timeStr || '00:00').split(':');
  const date = new Date(dateStr);
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date;
}

// Helper to calculate rental duration using native JS
function getRentalDuration(startDate: string, startTime: string, endDate: string, endTime: string, timing: string) {
  if (!startDate || !endDate || !startTime || !endTime) return { days: 0, totalHours: 0, minutes: 0 };
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return { days: 0, totalHours: 0, minutes: 0 };
  const msDiff = end.getTime() - start.getTime();
  const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  const totalMinutes = Math.floor(msDiff / (1000 * 60));
  let timingValue = 8;
  if (timing.startsWith('12')) timingValue = 12;
  if (timing.startsWith('24')) timingValue = 24;
  const totalHours = timingValue * days;
  return { days, totalHours, minutes: totalMinutes };
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [assetCategories, setAssetCategories] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  // Refactor form state
  const [form, setForm] = useState<any>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Asset selection state
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [assetCategoryFilters, setAssetCategoryFilters] = useState({
    type: '',
    mainCategory: '',
    subCategory: '',
    subSubCategory: '',
    subSubSubCategory: '',
    subSubSubSubCategory: ''
  });

  // New state for customer type and clients
  const [customerType, setCustomerType] = useState<'contract' | 'quotation'>('contract');
  const [clientList, setClientList] = useState<any[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [selectedClientInfo, setSelectedClientInfo] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    fetchAvailableAssets();
    fetchAssetCategories();
  }, []);

  // Filter assets based on hierarchical category filters
  useEffect(() => {
    let filtered = availableAssets;
    
    if (assetCategoryFilters.type) {
      filtered = filtered.filter(asset => asset.mainCategory && 
        getMainCategoriesForType(assetCategoryFilters.type).includes(asset.mainCategory));
    }
    
    if (assetCategoryFilters.mainCategory) {
      filtered = filtered.filter(asset => asset.mainCategory === assetCategoryFilters.mainCategory);
    }
    
    if (assetCategoryFilters.subCategory) {
      filtered = filtered.filter(asset => asset.subCategory === assetCategoryFilters.subCategory);
    }
    
    if (assetCategoryFilters.subSubCategory) {
      filtered = filtered.filter(asset => asset.subSubCategory === assetCategoryFilters.subSubCategory);
    }
    
    setFilteredAssets(filtered);
  }, [availableAssets, assetCategoryFilters]);

  // Helper function to get main categories for a type
  const getMainCategoriesForType = (type: string) => {
    const AssetMainCategories = {
      'Vehicle': ['Truck', 'Car', 'Van', 'Bus', 'Trailer', 'Motorcycle', 'Forklift'],
      'Attachment': ['Trailer Hitch', 'Crane Attachment', 'Bucket Attachment', 'Fork Attachment', 'Grapple Attachment'],
      'Equipment': ['Crane', 'Excavator', 'Bulldozer', 'Generator', 'Compressor', 'Welder', 'Drill'],
      'Building': ['Office', 'Warehouse', 'Workshop', 'Showroom', 'Storage Facility', 'Maintenance Bay'],
      'Furniture': ['Desk', 'Chair', 'Cabinet', 'Table', 'Shelf', 'Filing Cabinet', 'Conference Table'],
      'IT': ['Computer', 'Laptop', 'Printer', 'Server', 'Network Device', 'Scanner', 'Projector'],
      'Other': ['Tools', 'Safety Equipment', 'Office Supplies', 'Miscellaneous']
    };
    return AssetMainCategories[type as keyof typeof AssetMainCategories] || [];
  };

  // Fetch clients when customerType changes
  useEffect(() => {
    setClientLoading(true);
    setClientList([] as any[]);
    setForm((prev: any) => ({ ...prev, customer: '' }));
    setSelectedClientInfo(null);
    (api.get(`/clients?type=${customerType}`) as Promise<any>)
      .then(res => setClientList(res.data))
      .catch(() => setClientList([] as any[]))
      .finally(() => setClientLoading(false));
  }, [customerType, open]);

  // Fetch client info when customer changes
  useEffect(() => {
    if (form.customer) {
      setSelectedClientInfo(null);
      api.get(`/clients/${form.customer}`)
        .then(res => setSelectedClientInfo(res.data))
        .catch(() => setSelectedClientInfo(null));
    } else {
      setSelectedClientInfo(null);
    }
  }, [form.customer]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<Project[]>('/projects');
      setProjects(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const res = await api.get<Asset[]>('/assets/available');
      setAvailableAssets(res.data);
    } catch (err: any) {
      console.error('Failed to fetch available assets:', err);
    }
  };

  const fetchAssetCategories = async () => {
    try {
      const res = await api.get('/assets/categories');
      setAssetCategories(res.data);
    } catch (err: any) {
      console.error('Failed to fetch asset categories:', err);
    }
  };

  const handleOpen = (project?: Project) => {
    if (project) {
      setEditingId(project._id);
      setForm({ ...defaultForm, ...project });
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
      const updatedForm = { ...prev, [name]: value };
      
      // Auto-calculate overall hours when basic hours or overtime hours change
      if (name === 'totalBasicHours' || name === 'totalOvertimeHours') {
        const basicHours = name === 'totalBasicHours' ? Number(value) : Number(prev.totalBasicHours);
        const overtimeHours = name === 'totalOvertimeHours' ? Number(value) : Number(prev.totalOvertimeHours);
        updatedForm.overallHours = basicHours + overtimeHours;
      }
      
      return updatedForm;
    });
  };

  const handleAssetChange = (event: any) => {
    const value = event.target.value;
    setForm((prev: any) => ({ ...prev, assignedAssets: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleMainCategoryChange = (event: any) => {
    setSelectedMainCategory(event.target.value);
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
  };

  const handleSubCategoryChange = (event: any) => {
    setSelectedSubCategory(event.target.value);
    setSelectedSubSubCategory('');
  };

  const handleSubSubCategoryChange = (event: any) => {
    setSelectedSubSubCategory(event.target.value);
  };

  const handleAssetCategoryFilterChange = (categories: {
    type?: string;
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
    subSubSubCategory?: string;
    subSubSubSubCategory?: string;
  }) => {
    setAssetCategoryFilters(categories);
  };

  const handlePriceListSearch = (description: string) => {
    if (!selectedClientInfo) return;
    
    let priceList: any[] = [];
    if (selectedClientInfo.type === 'contract' && selectedClientInfo.contractData?.priceList) {
      priceList = selectedClientInfo.contractData.priceList;
    } else if (selectedClientInfo.type === 'quotation' && selectedClientInfo.quotationData?.lines) {
      priceList = selectedClientInfo.quotationData.lines;
    }
    
    const matchingItem = priceList.find(item => 
      item.description.toLowerCase().includes(description.toLowerCase())
    );
    
    if (matchingItem) {
      setForm((prev: any) => ({
        ...prev,
        priceListDescription: matchingItem.description,
        rentType: matchingItem.rentType || matchingItem.worktime || 'monthly',
        overtimePrice: matchingItem.overtime || 0,
        // Add other fields as needed
      }));
    }
  };

  const handlePriceListSelection = (selectedDescription: string) => {
    console.log('handlePriceListSelection called with:', selectedDescription);
    console.log('selectedClientInfo:', selectedClientInfo);
    
    if (!selectedClientInfo || !selectedDescription) {
      console.log('Early return - no client info or description');
      return;
    }
    
    let priceList: any[] = [];
    if (selectedClientInfo.type === 'contract' && selectedClientInfo.contractData?.priceList) {
      priceList = selectedClientInfo.contractData.priceList;
      console.log('Using contract price list:', priceList);
    } else if (selectedClientInfo.type === 'quotation' && selectedClientInfo.quotationData?.lines) {
      priceList = selectedClientInfo.quotationData.lines;
      console.log('Using quotation lines:', priceList);
    }
    
    const selectedItem = priceList.find(item => item.description === selectedDescription);
    console.log('Found selected item:', selectedItem);
    
    if (selectedItem) {
      console.log('About to update form with selected item:', selectedItem);
      
      const updatedForm = {
        equipmentDescription: selectedItem.description,
        priceListDescription: selectedItem.description,
        rentType: selectedItem.rentType || selectedItem.worktime || 'monthly',
        operators: selectedItem.driversOperators || selectedItem.quantity || '',
        workHours: selectedItem.workHours || selectedItem.worktime || '',
        unitPrice: selectedItem.unitPrice || 0,
        overtimePrice: selectedItem.overtime || 0,
        department: selectedItem.driversOperators ? `Drivers/Operators: ${selectedItem.driversOperators}` : 
                   selectedItem.quantity ? `Quantity: ${selectedItem.quantity}` : '',
      };
      
      console.log('Updated form data:', updatedForm);
      
      setForm((prev: any) => ({
        ...prev,
        ...updatedForm,
      }));
      
      // Log for debugging
      console.log('Selected item:', selectedItem);
      console.log('Auto-filled form fields:', {
        equipmentDescription: selectedItem.description,
        rentType: selectedItem.rentType || selectedItem.worktime || 'monthly',
        operators: selectedItem.driversOperators || selectedItem.quantity || '',
        workHours: selectedItem.workHours || selectedItem.worktime || '',
        unitPrice: selectedItem.unitPrice || 0,
        overtimePrice: selectedItem.overtime || 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const submitData = {
        ...form,
        revenue: form.revenue ? Number(form.revenue) : undefined,
        status: form.endDate ? (form.status || 'completed') : 'in_progress',
        startTime: form.startDate + 'T' + form.startTime,
        endTime: form.endDate + 'T' + form.endTime,
      };
      if (editingId) {
        await api.put(`/projects/${editingId}`, submitData);
        setSuccess('Project updated!');
      } else {
        await api.post('/projects', submitData);
        setSuccess('Project created!');
      }
      fetchProjects();
      fetchAvailableAssets(); // Refresh available assets
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/projects/${deleteId}`);
      setSuccess('Project deleted!');
      fetchProjects();
      fetchAvailableAssets(); // Refresh available assets
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      await api.put(`/projects/${projectId}/complete`);
      setSuccess('Project completed and assets released!');
      fetchProjects();
      fetchAvailableAssets(); // Refresh available assets
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete project');
    }
  };

  const handleMarkCompleted = async (project: Project) => {
    try {
      const now = new Date();
      const endTime = now.toISOString();
      // Optionally, calculate revenue here if needed
      await api.put(`/projects/${project._id}`, {
        ...project,
        endTime,
        status: 'completed',
      });
      setSuccess('Project marked as completed!');
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as completed');
    }
  };

  const handleShowDetails = async (id: string) => {
    setDetailsOpen(true);
    setDetails(null);
    try {
      const res = await api.get(`/projects/${id}/profitability`);
      setDetails(res.data);
    } catch (err: any) {
      setDetails({ error: err.response?.data?.message || 'Failed to fetch details' });
    }
  };

  // TanStack Table setup
  const columns = useMemo<ColumnDef<Project>[]>(() => [
    { header: 'Customer', accessorKey: 'customer' },
    { header: 'Equipment Description', accessorKey: 'equipmentDescription' },
    { header: 'Serial Number', accessorKey: 'serialNumber', cell: info => {
      const value = info.getValue();
      return value || '-';
    }},
    { header: 'Rent Type', accessorKey: 'rentType', cell: info => {
      const value = info.getValue();
      return value === 'monthly' ? 'Monthly' : value === 'call_out' ? 'Call Out' : value || '-';
    }},
    { header: 'Timing', accessorKey: 'timing', cell: info => {
      const timing = info.getValue() as string;
      if (!timing) return '-';
      return timing.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }},
    { header: 'Operator/Driver', accessorKey: 'operatorDriver', cell: info => {
      const value = info.getValue();
      if (!value) return '-';
      return `${value} ${Number(value) === 1 ? 'Person' : 'People'}`;
    }},
    { header: 'Assigned Assets', accessorKey: 'assignedAssets', cell: info => {
      const assets = info.getValue() as Asset[];
      if (!assets || assets.length === 0) return '-';
      return (
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {assets.map(asset => (
            <Chip 
              key={asset._id} 
              label={asset.description} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          ))}
        </Box>
      );
    }},
    { header: 'Start Time', accessorKey: 'startTime', cell: info => {
      const value = info.getValue() as string;
      return value ? new Date(value).toLocaleDateString() : '-';
    }},
    { header: 'End Time', accessorKey: 'endTime', cell: info => {
      const value = info.getValue() as string;
      return value ? new Date(value).toLocaleDateString() : '-';
    }},
    { header: 'Status', accessorKey: 'status', cell: info => {
      const value = info.getValue() as string;
      if (value === 'in_progress') {
        return <Chip label="In Progress" color="warning" icon={<DoneAllIcon sx={{ color: 'orange' }} />} />;
      }
      return value || '-';
    }},
    { header: 'Revenue', accessorKey: 'revenue', cell: info => {
      const value = info.getValue();
      return value ? Number(value).toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '-';
    }},
    {
      header: 'Actions',
      cell: ({ row }) => {
        const project = row.original;
        const showMarkCompleted = (!project.endTime || project.status === 'in_progress') && project.status !== 'completed';
        return (
        <Box display="flex" gap={1}>
            <IconButton color="primary" onClick={() => handleOpen(project)}><EditIcon /></IconButton>
            <IconButton color="error" onClick={() => setDeleteId(project._id)}><DeleteIcon /></IconButton>
            <Button size="small" variant="outlined" onClick={() => handleShowDetails(project._id)}>Details</Button>
            {showMarkCompleted && (
              <IconButton color="warning" onClick={() => handleMarkCompleted(project)} title="Mark as Completed">
                <DoneAllIcon />
              </IconButton>
            )}
            {project.status === 'active' && (
            <IconButton 
              color="success" 
                onClick={() => handleCompleteProject(project._id)}
              title="Complete Project"
            >
              <CheckCircleIcon />
            </IconButton>
          )}
        </Box>
        );
      },
    },
  ], [handleMarkCompleted]);

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rentalDuration = getRentalDuration(form.startDate, form.startTime, form.endDate, form.endTime, form.timing);

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Projects/ Clients</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Project
        </Button>
      </Box>
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
            {table.getRowModel().rows.map(row => (
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
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Customer Type Dropdown */}
            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Type Of The Customer</InputLabel>
                <Select
                  value={customerType}
                  label="Type Of The Customer"
                  onChange={e => setCustomerType(e.target.value as 'contract' | 'quotation')}
                >
                  <MenuItem value="contract">Contract Based</MenuItem>
                  <MenuItem value="quotation">Quotation Based</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Company Name Dropdown */}
            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Company Name</InputLabel>
                <Select
                  value={form.customer}
                  label="Company Name"
                  onChange={e => setForm({ ...form, customer: e.target.value })}
                  disabled={clientLoading || clientList.length === 0}
                >
                  {clientLoading && <MenuItem value=""><CircularProgress size={20} /></MenuItem>}
                  {!clientLoading && clientList.length === 0 && <MenuItem value="">No clients found</MenuItem>}
                  {clientList.map(client => (
                    <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* Department Name Field */}
            <Box display="flex" gap={2} mb={2}>
              <TextField 
                label="Department Name" 
                name="department" 
                value={form.department} 
                onChange={handleFormChange} 
                required 
                fullWidth 
              />
            </Box>
            {/* Client Info Box */}
            {selectedClientInfo && (
              <Box sx={{ background: '#e3f2fd', borderRadius: 2, p: 2, mb: 2, border: '1px solid #90caf9' }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">Client Information</Typography>
                <Typography><b>Name:</b> {selectedClientInfo.name}</Typography>
                <Typography><b>Type:</b> {selectedClientInfo.type === 'contract' ? 'Contract Based' : 'Quotation Based'}</Typography>
                {selectedClientInfo.type === 'contract' && selectedClientInfo.contractData && (
                  <>
                    <Typography><b>Contract Period:</b> {selectedClientInfo.contractData.startDate ? new Date(selectedClientInfo.contractData.startDate).toLocaleDateString() : ''} - {selectedClientInfo.contractData.endDate ? new Date(selectedClientInfo.contractData.endDate).toLocaleDateString() : ''}</Typography>
                    <Typography><b>Payment Terms:</b> {selectedClientInfo.contractData.paymentTerms}</Typography>
                    <Typography><b>Status:</b> {selectedClientInfo.contractData.status}</Typography>
                    {selectedClientInfo.contractData.contractFile && (
                      <Typography><b>Contract File:</b> <Link href={`/${selectedClientInfo.contractData.contractFile}`} target="_blank" rel="noopener">View File</Link></Typography>
                    )}
                    <Typography><b>Price List:</b></Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedClientInfo.contractData.priceList?.map((item: any, idx: number) => (
                        <li key={idx}>{item.description} | {item.rentType} | {item.workHours} | Drivers/Operators: {item.driversOperators} | Unit Price: {item.unitPrice} | Overtime: {item.overtime}</li>
                      ))}
                    </ul>
                  </>
                )}
                {selectedClientInfo.type === 'quotation' && selectedClientInfo.quotationData && (
                  <>
                    <Typography><b>Payment Terms:</b> {selectedClientInfo.quotationData.paymentTerms}</Typography>
                    <Typography><b>Payment Method:</b> {selectedClientInfo.quotationData.paymentMethod}</Typography>
                    <Typography><b>Status:</b> {selectedClientInfo.quotationData.approvalStatus}</Typography>
                    {selectedClientInfo.quotationData.quotationFile && (
                      <Typography><b>Quotation File:</b> <Link href={`/${selectedClientInfo.quotationData.quotationFile}`} target="_blank" rel="noopener">View File</Link></Typography>
                    )}
                    <Typography><b>Line Items:</b></Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedClientInfo.quotationData.lines?.map((item: any, idx: number) => (
                        <li key={idx}>{item.description} | Unit Price: {item.unitPrice} | Worktime: {item.worktime} | Qty: {item.quantity} | Total: {item.total}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Box>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: '1 1 100%' }}>
                <TextField label="Equipment Description" name="equipmentDescription" value={form.equipmentDescription} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <FormControl fullWidth required>
                  <InputLabel>Price List Item</InputLabel>
                  <Select
                    value={form.priceListDescription}
                    onChange={(e) => {
                      const selectedDescription = e.target.value;
                      console.log('Price list selection changed:', selectedDescription);
                      handlePriceListSelection(selectedDescription);
                    }}
                    input={<OutlinedInput label="Price List Item" />}
                  >
                    <MenuItem value="">
                      <em>Select a price list item...</em>
                    </MenuItem>
                    {selectedClientInfo && selectedClientInfo.type === 'contract' && selectedClientInfo.contractData?.priceList?.map((item: any, idx: number) => (
                      <MenuItem key={`contract-${idx}`} value={item.description}>
                        {item.description} | {item.rentType} | {item.workHours} | Drivers: {item.driversOperators} | Unit Price: {item.unitPrice} | Overtime: {item.overtime}
                      </MenuItem>
                    ))}
                    {selectedClientInfo && selectedClientInfo.type === 'quotation' && selectedClientInfo.quotationData?.lines?.map((item: any, idx: number) => (
                      <MenuItem key={`quotation-${idx}`} value={item.description}>
                        {item.description} | Unit Price: {item.unitPrice} | Worktime: {item.worktime} | Qty: {item.quantity} | Total: {item.total}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Total Basic Hours" name="totalBasicHours" type="number" value={form.totalBasicHours} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Total Overtime Hours" name="totalOvertimeHours" type="number" value={form.totalOvertimeHours} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Overall Hours" name="overallHours" type="number" value={form.overallHours} onChange={handleFormChange} required fullWidth InputProps={{ readOnly: true }} />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Overtime Hours Cost" name="overtimeHoursCost" type="number" value={form.overtimeHoursCost} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Overtime Hours" name="overtimeHours" type="number" value={form.overtimeHours} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Overtime Price" name="overtimePrice" type="number" value={form.overtimePrice} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Rent Type" name="rentType" value={form.rentType} onChange={handleFormChange} required fullWidth select>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="call_out">Call Out</MenuItem>
                </TextField>
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Operators" name="operators" value={form.operators} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Work Hours" name="workHours" value={form.workHours} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Unit Price" name="unitPrice" type="number" value={form.unitPrice} onChange={handleFormChange} required fullWidth />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Status" name="status" value={form.status} onChange={handleFormChange} fullWidth select>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleFormChange} sx={{ minWidth: 300 }} />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleFormChange} />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="End Date" name="endDate" type="date" value={form.endDate} onChange={handleFormChange} sx={{ minWidth: 300 }} />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <TextField label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleFormChange} />
              </div>
              {/* Rental Duration Summary Box */}
              <Box sx={{ background: '#f3e5f5', borderRadius: 2, p: 2, mb: 2, border: '1px solid #ce93d8' }}>
                <Typography variant="subtitle1" fontWeight={700} color="secondary.main">Total Duration</Typography>
                <Typography>Start: <b>{form.startDate} {form.startTime}</b></Typography>
                <Typography>End: <b>{form.endDate} {form.endTime}</b></Typography>
                <Typography>Total Days: <b>{rentalDuration.days}</b></Typography>
                <Typography>Total Basic Hours: <b>{form.totalBasicHours}</b></Typography>
                <Typography>Total Overtime Hours: <b>{form.totalOvertimeHours}</b></Typography>
                <Typography>Overall Hours: <b>{form.overallHours}</b></Typography>
                <Typography>Total Overtime Hours Cost: <b>{form.overtimeHoursCost}</b></Typography>
              </Box>
              <div style={{ flex: '1 1 100%' }}>
                <Typography variant="subtitle2" gutterBottom>Asset Selection</Typography>
                <Box mb={2}>
                  <HierarchicalCategorySelector
                    value={assetCategoryFilters}
                    onChange={handleAssetCategoryFilterChange}
                  />
                </Box>
                
                <FormControl fullWidth>
                  <InputLabel>Assign Assets</InputLabel>
                  <Select
                    multiple
                    value={form.assignedAssets}
                    onChange={handleAssetChange}
                    input={<OutlinedInput label="Assign Assets" />}
                    renderValue={(selected: string[]) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value: string) => {
                          const asset = availableAssets.find(a => a._id === value);
                          return (
                            <Chip key={value} label={asset?.description || value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {filteredAssets.map((asset) => (
                      <MenuItem key={asset._id} value={asset._id}>
                        {asset.description} - {asset.mainCategory} {'>'} {asset.subCategory} 
                        {asset.subSubCategory && ` > ${asset.subSubCategory}`}
                        {asset.plateNumber && ` (${asset.plateNumber})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <TextField label="Revenue" name="revenue" value={form.revenue} onChange={handleFormChange} type="number" fullWidth />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth multiline minRows={2} />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} fullWidth multiline minRows={2} />
              </div>
            </div>
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
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this project?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Project Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Project Profitability</DialogTitle>
        <DialogContent>
          {details ? details.error ? (
            <Alert severity="error">{details.error}</Alert>
          ) : (
            <Box>
              <Typography>Revenue: {details.revenue?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              <Typography>Expenses: {details.expenses?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              <Typography>Payroll: {details.payroll?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              <Typography>Fuel: {details.fuel?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              <Typography>Driver Hours: {details.driverHours?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              <Typography>Total Cost: {details.totalCost?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              <Typography fontWeight={700} color={details.profit >= 0 ? 'success.main' : 'error.main'}>
                Profit: {details.profit?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
              </Typography>
              <Box mt={3}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { name: 'Revenue', value: details.revenue },
                    { name: 'Expenses', value: details.expenses },
                    { name: 'Payroll', value: details.payroll },
                    { name: 'Fuel', value: details.fuel },
                    { name: 'Driver Hours', value: details.driverHours },
                    { name: 'Profit', value: details.profit },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
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

export default ProjectsPage; 