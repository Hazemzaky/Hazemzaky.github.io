import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import HierarchicalCategorySelector from '../components/HierarchicalCategorySelector';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, MenuItem, Chip, FormControl, InputLabel, Select, OutlinedInput, CircularProgress, Link, Card, CardContent, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
  if (timing && timing.startsWith('12')) timingValue = 12;
  if (timing && timing.startsWith('24')) timingValue = 24;
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
  } as {
    type?: string;
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
    subSubSubCategory?: string;
    subSubSubSubCategory?: string;
  });

  // New state for customer type and clients
  const [customerType, setCustomerType] = useState<'contract' | 'quotation'>('contract');
  const [clientList, setClientList] = useState<any[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [selectedClientInfo, setSelectedClientInfo] = useState<any>(null);

  const theme = useTheme();

  // Helper functions for period calculations
  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    const targetMonth = d.getMonth() + months;
    d.setMonth(targetMonth);
    return d;
  };

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endExclusiveOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  const getWeekStart = (date: Date) => {
    const d = new Date(startOfDay(date));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(d.setDate(diff));
  };

  const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getNextMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);

  const getQuarterStart = (date: Date) => {
    const quarter = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), quarter, 1);
  };
  const getNextQuarterStart = (date: Date) => {
    const start = getQuarterStart(date);
    return new Date(start.getFullYear(), start.getMonth() + 3, 1);
  };

  const getHalfYearStart = (date: Date) => {
    const half = Math.floor(date.getMonth() / 6) * 6;
    return new Date(date.getFullYear(), half, 1);
  };
  const getNextHalfYearStart = (date: Date) => {
    const start = getHalfYearStart(date);
    return new Date(start.getFullYear(), start.getMonth() + 6, 1);
  };

  // Financial year Apr 1 - Mar 31
  const getFinancialYear = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 4 ? year : year - 1;
  };
  const getFinancialYearStart = (fy: number) => new Date(fy, 3, 1); // Apr 1
  const getNextFinancialYearStart = (fy: number) => new Date(fy + 1, 3, 1); // Next Apr 1

  // Calculate revenue for completed projects within a period
  const calculateRevenueForPeriod = (startDate: Date, endDateExclusive: Date): number => {
    return projects
      .filter(project => {
        // Only include completed projects
        if (project.status !== 'completed' || !project.endTime) return false;
        
        const projectEndDate = new Date(project.endTime);
        return projectEndDate >= startDate && projectEndDate < endDateExclusive;
      })
      .reduce((total, project) => total + (project.revenue || 0), 0);
  };

  // Precompute period boundaries and revenue totals
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = endExclusiveOfDay(now);

  const weekStart = getWeekStart(now);
  const nextWeekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);

  const monthStart = getMonthStart(now);
  const nextMonthStart = getNextMonthStart(now);

  const quarterStart = getQuarterStart(now);
  const nextQuarterStart = getNextQuarterStart(now);

  const halfStart = getHalfYearStart(now);
  const nextHalfStart = getNextHalfYearStart(now);

  const currentFY = getFinancialYear(now);
  const fyStart = getFinancialYearStart(currentFY);
  const nextFyStart = getNextFinancialYearStart(currentFY);

  const periodRevenues = useMemo(() => {
    return {
      daily: calculateRevenueForPeriod(todayStart, tomorrowStart),
      weekly: calculateRevenueForPeriod(weekStart, nextWeekStart),
      monthly: calculateRevenueForPeriod(monthStart, nextMonthStart),
      quarterly: calculateRevenueForPeriod(quarterStart, nextQuarterStart),
      halfYearly: calculateRevenueForPeriod(halfStart, nextHalfStart),
      yearly: calculateRevenueForPeriod(fyStart, nextFyStart),
    };
  }, [projects]);

  const getMonthName = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const getQuarterName = (date: Date) => `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
  const getHalfYearName = (date: Date) => `H${Math.floor(date.getMonth() / 6) + 1} ${date.getFullYear()}`;

  useEffect(() => {
    fetchProjects();
    fetchAvailableAssets();
    fetchAssetCategories();
  }, []);

  // Filter assets based on hierarchical category filters
  useEffect(() => {
    let filtered = availableAssets;
    
    if (assetCategoryFilters.type && assetCategoryFilters.type !== '') {
      filtered = filtered.filter(asset => asset.mainCategory && 
        getMainCategoriesForType(assetCategoryFilters.type!).includes(asset.mainCategory));
    }
    
    if (assetCategoryFilters.mainCategory && assetCategoryFilters.mainCategory !== '') {
      filtered = filtered.filter(asset => asset.mainCategory === assetCategoryFilters.mainCategory);
    }
    
    if (assetCategoryFilters.subCategory && assetCategoryFilters.subCategory !== '') {
      filtered = filtered.filter(asset => asset.subCategory === assetCategoryFilters.subCategory);
    }
    
    if (assetCategoryFilters.subSubCategory && assetCategoryFilters.subSubCategory !== '') {
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

  const rentalDuration = getRentalDuration(form.startDate, form.startTime, form.endDate, form.endTime, form.workHours);

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
                    <BusinessIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Orders Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive order tracking and client management
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
                  Add Order
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
                title: 'Total Orders',
                value: projects.length,
                icon: <BusinessIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Active Orders',
                value: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
                icon: <TrendingUpIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Completed Orders',
                value: projects.filter(p => p.status === 'completed').length,
                icon: <CheckCircleIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              },
              {
                title: 'Total Revenue',
                value: projects.reduce((sum, p) => sum + (p.revenue || 0), 0).toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <AttachMoneyIcon />,
                color: theme.palette.secondary.main,
                bgColor: alpha(theme.palette.secondary.main, 0.1)
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

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
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
              📋 Orders Overview
            </Typography>
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
                  <tr key={row.id} style={{ 
                    background: row.index % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8)
                  }}>
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
        </motion.div>

        {/* Revenue Analysis Boxes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mt: 3, 
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              💰 Revenue Analysis by Time Periods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Total revenue from completed projects across different time periods. 
              Only projects with status 'completed' and valid end dates are included in calculations.
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              {/* Daily Revenue Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>📅</Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        Daily Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                      {periodRevenues.daily.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {todayStart.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Revenue Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>📊</Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                        Weekly Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      {periodRevenues.weekly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(nextWeekStart.getTime() - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Revenue Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>📆</Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                        Monthly Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      {periodRevenues.monthly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getMonthName(monthStart)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quarterly Revenue Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>📈</Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                        Quarterly Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.secondary.main }}>
                      {periodRevenues.quarterly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getQuarterName(quarterStart)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Half-Yearly Revenue Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.3 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>📊</Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                        Half-Yearly Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main }}>
                      {periodRevenues.halfYearly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getHalfYearName(halfStart)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Yearly Revenue Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>🗓️</Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        Financial Year Revenue
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      {periodRevenues.yearly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      FY {currentFY} (Apr 1 - Mar 31)
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
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
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {editingId ? 'Edit Project' : 'Add New Project'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {editingId ? 'Update project details and settings' : 'Create a new project with comprehensive details'}
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
            {/* Customer Information Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                🏢 Customer Information
              </Typography>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Type Of The Customer</InputLabel>
                  <Select
                    value={customerType}
                    label="Type Of The Customer"
                    onChange={e => setCustomerType(e.target.value as 'contract' | 'quotation')}
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
                  >
                    <MenuItem value="contract">Contract Based</MenuItem>
                    <MenuItem value="quotation">Quotation Based</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Company Name</InputLabel>
                  <Select
                    value={form.customer}
                    label="Company Name"
                    onChange={e => setForm({ ...form, customer: e.target.value })}
                    disabled={clientLoading || clientList.length === 0}
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
                  >
                    {clientLoading && <MenuItem value=""><CircularProgress size={20} /></MenuItem>}
                    {!clientLoading && clientList.length === 0 && <MenuItem value="">No clients found</MenuItem>}
                    {clientList.map(client => (
                      <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField 
                label="Department Name" 
                name="department" 
                value={form.department} 
                onChange={handleFormChange} 
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

            {/* Client Info Box */}
            {selectedClientInfo && (
              <Box sx={{ 
                background: alpha(theme.palette.info.main, 0.1), 
                borderRadius: 2, 
                p: 2, 
                mb: 2, 
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Typography variant="subtitle1" fontWeight={700} color="info.main" sx={{ mb: 2 }}>
                  📋 Client Information
                </Typography>
                <Typography sx={{ mb: 1 }}><b>Name:</b> {selectedClientInfo.name}</Typography>
                <Typography sx={{ mb: 1 }}><b>Type:</b> {selectedClientInfo.type === 'contract' ? 'Contract Based' : 'Quotation Based'}</Typography>
                {selectedClientInfo.type === 'contract' && selectedClientInfo.contractData && (
                  <>
                    <Typography sx={{ mb: 1 }}><b>Contract Period:</b> {selectedClientInfo.contractData.startDate ? new Date(selectedClientInfo.contractData.startDate).toLocaleDateString() : ''} - {selectedClientInfo.contractData.endDate ? new Date(selectedClientInfo.contractData.endDate).toLocaleDateString() : ''}</Typography>
                    <Typography sx={{ mb: 1 }}><b>Payment Terms:</b> {selectedClientInfo.contractData.paymentTerms}</Typography>
                    <Typography sx={{ mb: 1 }}><b>Status:</b> {selectedClientInfo.contractData.status}</Typography>
                    {selectedClientInfo.contractData.contractFile && (
                      <Typography sx={{ mb: 1 }}><b>Contract File:</b> <Link href={`/${selectedClientInfo.contractData.contractFile}`} target="_blank" rel="noopener">View File</Link></Typography>
                    )}
                    <Typography sx={{ mb: 1 }}><b>Price List:</b></Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedClientInfo.contractData.priceList?.map((item: any, idx: number) => (
                        <li key={idx}>
                          <Typography variant="body2">
                            {item.description} | {item.rentType} | {item.workHours} | Drivers: {item.driversOperators} | Unit Price: {item.unitPrice} | Overtime: {item.overtime}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {selectedClientInfo.type === 'quotation' && selectedClientInfo.quotationData && (
                  <>
                    <Typography sx={{ mb: 1 }}><b>Payment Terms:</b> {selectedClientInfo.quotationData.paymentTerms}</Typography>
                    <Typography sx={{ mb: 1 }}><b>Payment Method:</b> {selectedClientInfo.quotationData.paymentMethod}</Typography>
                    <Typography sx={{ mb: 1 }}><b>Status:</b> {selectedClientInfo.quotationData.approvalStatus}</Typography>
                    {selectedClientInfo.quotationData.quotationFile && (
                      <Typography sx={{ mb: 1 }}><b>Quotation File:</b> <Link href={`/${selectedClientInfo.quotationData.quotationFile}`} target="_blank" rel="noopener">View File</Link></Typography>
                    )}
                    <Typography sx={{ mb: 1 }}><b>Line Items:</b></Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedClientInfo.quotationData.lines?.map((item: any, idx: number) => (
                        <li key={idx}>
                          <Typography variant="body2">
                            {item.description} | Unit Price: {item.unitPrice} | Worktime: {item.worktime} | Qty: {item.quantity} | Total: {item.total}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                
                {/* Decorative background elements */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: -15, 
                  right: -15, 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: alpha(theme.palette.info.main, 0.1),
                  zIndex: 0
                }} />
              </Box>
            )}

            {/* Equipment Details Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                🚜 Equipment & Pricing Details
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Equipment Description" 
                  name="equipmentDescription" 
                  value={form.equipmentDescription} 
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
                />
              </Box>
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
            </Box>

            {/* Hours & Pricing Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                ⏰ Hours & Pricing Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Total Basic Hours" 
                  name="totalBasicHours" 
                  type="number" 
                  value={form.totalBasicHours} 
                  onChange={handleFormChange} 
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
                  label="Total Overtime Hours" 
                  name="totalOvertimeHours" 
                  type="number" 
                  value={form.totalOvertimeHours} 
                  onChange={handleFormChange} 
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Overall Hours" 
                  name="overallHours" 
                  type="number" 
                  value={form.overallHours} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth
                  InputProps={{ readOnly: true }}
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
                  label="Overtime Hours Cost" 
                  name="overtimeHoursCost" 
                  type="number" 
                  value={form.overtimeHoursCost} 
                  onChange={handleFormChange} 
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField 
                  label="Overtime Hours" 
                  name="overtimeHours" 
                  type="number" 
                  value={form.overtimeHours} 
                  onChange={handleFormChange} 
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
                  label="Overtime Price" 
                  name="overtimePrice" 
                  type="number" 
                  value={form.overtimePrice} 
                  onChange={handleFormChange} 
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
            </Box>

            {/* Project Settings Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                ⚙️ Project Settings & Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Rent Type" 
                  name="rentType" 
                  value={form.rentType} 
                  onChange={handleFormChange} 
                  required 
                  fullWidth 
                  select
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
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="call_out">Call Out</MenuItem>
                </TextField>
                <TextField 
                  label="Operators" 
                  name="operators" 
                  value={form.operators} 
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
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Work Hours" 
                  name="workHours" 
                  value={form.workHours} 
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
                />
                <TextField 
                  label="Unit Price" 
                  name="unitPrice" 
                  type="number" 
                  value={form.unitPrice} 
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
                />
              </Box>
              <TextField 
                label="Status" 
                name="status" 
                value={form.status} 
                onChange={handleFormChange} 
                fullWidth 
                select
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Box>

            {/* Timeline Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.secondary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.secondary.main }}>
                📅 Project Timeline & Schedule
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField 
                  label="Start Date" 
                  name="startDate" 
                  type="date" 
                  value={form.startDate} 
                  onChange={handleFormChange} 
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                    },
                  }}
                />
                <TextField 
                  label="Start Time" 
                  name="startTime" 
                  type="time" 
                  value={form.startTime} 
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField 
                  label="End Date" 
                  name="endDate" 
                  type="date" 
                  value={form.endDate} 
                  onChange={handleFormChange} 
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                    },
                  }}
                />
                <TextField 
                  label="End Time" 
                  name="endTime" 
                  type="time" 
                  value={form.endTime} 
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Rental Duration Summary Box */}
            <Box sx={{ 
              background: alpha(theme.palette.secondary.main, 0.1), 
              borderRadius: 2, 
              p: 2, 
              mb: 2, 
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Typography variant="subtitle1" fontWeight={700} color="secondary.main" sx={{ mb: 2 }}>
                📊 Total Duration Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Typography><b>Start:</b> {form.startDate} {form.startTime}</Typography>
                <Typography><b>End:</b> {form.endDate} {form.endTime}</Typography>
                <Typography><b>Total Days:</b> {rentalDuration.days}</Typography>
                <Typography><b>Total Basic Hours:</b> {form.totalBasicHours}</Typography>
                <Typography><b>Total Overtime Hours:</b> {form.totalOvertimeHours}</Typography>
                <Typography><b>Overall Hours:</b> {form.overallHours}</Typography>
                <Typography><b>Total Overtime Hours Cost:</b> {form.overtimeHoursCost}</Typography>
              </Box>
              
              {/* Decorative background elements */}
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                right: -15, 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: alpha(theme.palette.secondary.main, 0.1),
                zIndex: 0
              }} />
            </Box>

            {/* Asset Selection Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                🚗 Asset Assignment & Selection
              </Typography>
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
            </Box>

            {/* Financial & Notes Section */}
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                💰 Financial Details & Additional Information
              </Typography>
              <TextField 
                label="Revenue" 
                name="revenue" 
                value={form.revenue} 
                onChange={handleFormChange} 
                type="number" 
                fullWidth
                size="medium"
                sx={{ mb: 2,
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
                label="Description" 
                name="description" 
                value={form.description} 
                onChange={handleFormChange} 
                fullWidth 
                multiline 
                minRows={2}
                size="medium"
                sx={{ mb: 2,
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
                label="Notes" 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                fullWidth 
                multiline 
                minRows={2}
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
            {editingId ? 'Update Project' : 'Create Project'}
          </Button>
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