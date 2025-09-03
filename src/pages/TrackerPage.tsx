import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Alert, IconButton, MenuItem, Snackbar, useTheme, alpha, Avatar, Badge, Divider, LinearProgress, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const monthLabels = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

const trackerFields = [
  'SR', 'Departure Month', 'Date', 'TMR', 'From', 'To', 'Department Requester', 'Invoiced Date', 'Field', 'OTM/PO', 'VPN', 'Trailer Number', 'Trailer Type', 'Water Card No.', 'Gallons', 'EMP', 'Name', 'Nationality', 'Passport', 'Residency Number', 'Contact', 'Date Loaded', 'Time Loaded', 'Returned Date', 'Returned Time', 'Duration Trip Time', 'Days In Mission', 'KM at Origin', 'KM Once Returned', 'Total KM Per Trip', 'Trip Allowance In KWD'
];

const numericFields = ['Gallons', 'Days In Mission', 'KM at Origin', 'KM Once Returned', 'Total KM Per Trip', 'Trip Allowance In KWD'];

const getCurrentYear = () => {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

const TrackerPage: React.FC = () => {
  const muiTheme = useTheme();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<{ [month: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({});
  const [isWaterTrip, setIsWaterTrip] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [waterCards, setWaterCards] = useState<any[]>([]);
  const [waterCardsLoading, setWaterCardsLoading] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Authentication check - Token present:', !!token);
    if (!token) {
      console.log('No authentication token found. Please log in.');
      setError('Please log in to access this page');
    }
  }, []);

  const year = getCurrentYear();
  const month = monthLabels[tab];

  // Fetch employees with position 'driver' or 'operator' for EMP dropdown
  useEffect(() => {
    setEmpLoading(true);
    Promise.all([
      api.get('/employees', { params: { position: 'driver' } }),
      api.get('/employees', { params: { position: 'operator' } })
    ])
      .then(([driverRes, operatorRes]) => {
        const driverData = driverRes.data as any;
        const operatorData = operatorRes.data as any;
        const driverList = Array.isArray(driverData.employees)
          ? driverData.employees
          : (Array.isArray(driverData) ? driverData : []);
        const operatorList = Array.isArray(operatorData.employees)
          ? operatorData.employees
          : (Array.isArray(operatorData) ? operatorData : []);
        // Combine and deduplicate by _id
        const combined = [...driverList, ...operatorList].filter((emp, idx, arr) =>
          arr.findIndex(e => e._id === emp._id) === idx
        );
        setEmployees(combined);
      })
      .catch(() => setEmployees([]))
      .finally(() => setEmpLoading(false));
  }, []);

  // Fetch water cards for dropdown
  useEffect(() => {
    const fetchWaterCards = async () => {
      setWaterCardsLoading(true);
      try {
        const res = await api.get('/water-logs/prepaid-cards');
        setWaterCards(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error('Failed to fetch water cards:', err);
        setWaterCards([]);
      } finally {
        setWaterCardsLoading(false);
      }
    };
    fetchWaterCards();
  }, []);

  // Function to refresh water cards
  const refreshWaterCards = async () => {
    try {
      const res = await api.get('/water-logs/prepaid-cards');
      setWaterCards(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to refresh water cards:', err);
    }
  };

  // Fetch tracker data for the selected month
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tracker', { params: { month, year } });
      console.log('Fetched tracker data:', res.data);
      setData(d => ({ ...d, [month]: Array.isArray(res.data) ? res.data : [] }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tracker data');
      setData(d => ({ ...d, [month]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const handleOpenDialog = (row?: any) => {
    setDialogMode(row ? 'edit' : 'add');
    setEditingId(row?._id || null);
    setForm(row ? {
      ...row,
      date: row.date ? row.date.slice(0, 10) : '',
      invoicedDate: row.invoicedDate ? row.invoicedDate.slice(0, 10) : '',
      dateLoaded: row.dateLoaded ? row.dateLoaded.slice(0, 10) : '',
      returnedDate: row.returnedDate ? row.returnedDate.slice(0, 10) : '',
    } : {
      month,
      year,
      SR: '',
      departureMonth: month,
      date: '',
      TMR: '',
      from: '',
      to: '',
      departmentRequester: '',
      invoicedDate: '',
      field: '',
      OTM_PO: '',
      VPN: '',
      trailerNumber: '',
      trailerType: '',
      waterCardNo: '',
      gallons: '',
      isWaterTrip: 'no',
      EMP: '',
      name: '',
      nationality: '',
      passport: '',
      residencyNumber: '',
      contact: '',
      dateLoaded: '',
      timeLoaded: '',
      returnedDate: '',
      returnedTime: '',
      durationTripTime: '',
      daysInMission: '',
      kmAtOrigin: '',
      kmOnceReturned: '',
      totalKmPerTrip: '',
      tripAllowanceInKWD: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({});
    setEditingId(null);
    setError('');
  };

  // Function to calculate duration trip time
  const calculateDurationTripTime = (departureDate: string, departureTime: string, returnDate: string, returnTime: string) => {
    if (!departureDate || !departureTime || !returnDate || !returnTime) {
      return '';
    }
    
    try {
      // Parse time strings to get hours and minutes
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours: hours || 0, minutes: minutes || 0 };
      };
      
      const departureTimeParsed = parseTime(departureTime);
      const returnTimeParsed = parseTime(returnTime);
      
      // Create Date objects using the provided dates
      const departure = new Date(`${departureDate}T${departureTimeParsed.hours.toString().padStart(2, '0')}:${departureTimeParsed.minutes.toString().padStart(2, '0')}:00`);
      const returnDateTime = new Date(`${returnDate}T${returnTimeParsed.hours.toString().padStart(2, '0')}:${returnTimeParsed.minutes.toString().padStart(2, '0')}:00`);
      
      // Calculate difference in milliseconds
      const diffMs = returnDateTime.getTime() - departure.getTime();
      
      if (diffMs <= 0) {
        return ''; // Invalid time range
      }
      
      // Convert to hours and minutes
      const totalHours = diffMs / (1000 * 60 * 60);
      const hours = Math.floor(totalHours);
      const minutes = Math.floor((totalHours - hours) * 60);
      
      // Format as HH:MM
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '';
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'isWaterTrip') setIsWaterTrip(value);
    
    // Auto-fill employee data when EMP is selected
    if (name === 'EMP' && value) {
      const selectedEmployee = employees.find(emp => emp._id === value);
      if (selectedEmployee) {
        console.log('Selected employee:', selectedEmployee); // Debug log
        const updatedForm = {
          ...form,
          [name]: value,
          name: selectedEmployee.name || '',
          nationality: selectedEmployee.nationality || '',
          passport: selectedEmployee.passportNumber || '',
          residencyNumber: selectedEmployee.residencyNumber || '',
          contact: selectedEmployee.phone || '',
        };
        console.log('Updated form:', updatedForm); // Debug log
        setForm(updatedForm);
      }
    }
    
    // Auto-calculate duration trip time when departure or return times change
    if (name === 'dateLoaded' || name === 'timeLoaded' || name === 'returnedDate' || name === 'returnedTime') {
      // Use updated values including the current change
      const updatedForm = { ...form, [name]: value };
      const durationTripTime = calculateDurationTripTime(
        updatedForm.dateLoaded || '',
        updatedForm.timeLoaded || '',
        updatedForm.returnedDate || '',
        updatedForm.returnedTime || ''
      );
      
      if (durationTripTime) {
        setForm((prev: any) => ({ ...prev, [name]: value, durationTripTime }));
      } else {
        setForm((prev: any) => ({ ...prev, [name]: value }));
      }
    }
    
    // Auto-calculate total KM per trip when KM at Origin or KM Once Returned changes
    if (name === 'kmAtOrigin' || name === 'kmOnceReturned') {
      // Use updated values including the current change
      const updatedForm = { ...form, [name]: value };
      const kmAtOrigin = Number(updatedForm.kmAtOrigin) || 0;
      const kmOnceReturned = Number(updatedForm.kmOnceReturned) || 0;
      
      // Calculate total KM (difference between return and origin)
      const totalKmPerTrip = Math.max(0, kmOnceReturned - kmAtOrigin);
      
      setForm((prev: any) => ({ 
        ...prev, 
        [name]: value, 
        totalKmPerTrip: totalKmPerTrip.toString()
      }));
    }
    
    // Auto-calculate days in mission when departure or return dates change
    if (name === 'dateLoaded' || name === 'returnedDate') {
      // Use updated values including the current change
      const updatedForm = { ...form, [name]: value };
      const departureDate = updatedForm.dateLoaded;
      const returnDate = updatedForm.returnedDate;
      
      if (departureDate && returnDate) {
        try {
          const departure = new Date(departureDate);
          const returnDateTime = new Date(returnDate);
          
          // Calculate difference in days
          const diffTime = returnDateTime.getTime() - departure.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Ensure positive value and add 1 to include both departure and return days
          const daysInMission = Math.max(1, diffDays + 1);
          
          setForm((prev: any) => ({ 
            ...prev, 
            [name]: value, 
            daysInMission: daysInMission.toString()
          }));
        } catch (error) {
          console.error('Error calculating days in mission:', error);
          setForm((prev: any) => ({ ...prev, [name]: value }));
        }
      } else {
        setForm((prev: any) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    for (const field of trackerFields) {
      const key = field.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
      
      // Skip validation for water-related fields if not a water trip
      if ((field === 'Water Card No.' || field === 'Gallons') && form.isWaterTrip !== 'yes') {
        continue;
      }
      
      // Skip validation for trip allowance if total KM is less than 40
      if (field === 'Trip Allowance In KWD') {
        const totalKmPerTrip = Number(form.totalKmPerTrip) || 0;
        if (totalKmPerTrip < 40) {
          continue;
        }
      }
      
      // Handle case-sensitive field names
      const fieldMapping: { [key: string]: string } = {
        'Name': 'name',
        'Nationality': 'nationality',
        'Passport': 'passport',
        'ResidencyNumber': 'residencyNumber',
        'Contact': 'contact',
        'DateLoaded': 'dateLoaded',
        'TimeLoaded': 'timeLoaded',
        'ReturnedDate': 'returnedDate',
        'ReturnedTime': 'returnedTime',
        'DurationTripTime': 'durationTripTime',
        'DaysInMission': 'daysInMission',
        'KMatOrigin': 'kmAtOrigin',
        'KMOnceReturned': 'kmOnceReturned',
        'TotalKMPerTrip': 'totalKmPerTrip',
        'TripAllowanceInKWD': 'tripAllowanceInKWD',
        'WaterCardNo': 'waterCardNo',
        'Gallons': 'gallons',
        'DepartureMonth': 'departureMonth',
        'DepartmentRequester': 'departmentRequester',
        'InvoicedDate': 'invoicedDate',
        'OTM_PO': 'OTM_PO',
        'TrailerNumber': 'trailerNumber',
        'TrailerType': 'trailerType',
        'Date': 'date',
        'From': 'from',
        'To': 'to',
        'Field': 'field',
        'VPN': 'VPN',
        'SR': 'SR',
        'TMR': 'TMR'
      };
      
      const formKey = fieldMapping[key] || key;
      
      if ((!form[formKey] || form[formKey] === '') && field !== 'EMP') {
        setError(`Field '${field}' is required`);
        return;
      }
    }
    if (!form.EMP) {
      setError('EMP is required');
      return;
    }
    try {
      // Map form data to correct backend field names
      const payload = {
        month: form.month,
        year: form.year,
        SR: form.SR,
        departureMonth: form.departureMonth,
        date: form.date,
        TMR: form.TMR,
        from: form.from,
        to: form.to,
        departmentRequester: form.departmentRequester,
        invoicedDate: form.invoicedDate,
        field: form.field,
        OTM_PO: form.OTM_PO,
        VPN: form.VPN,
        trailerNumber: form.trailerNumber,
        trailerType: form.trailerType,
        waterCardNo: form.waterCardNo,
        gallons: Number(form.gallons),
        isWaterTrip: form.isWaterTrip,
        EMP: form.EMP,
        name: form.name,
        nationality: form.nationality,
        passport: form.passport,
        residencyNumber: form.residencyNumber,
        contact: form.contact,
        dateLoaded: form.dateLoaded,
        timeLoaded: form.timeLoaded,
        returnedDate: form.returnedDate,
        returnedTime: form.returnedTime,
        durationTripTime: form.durationTripTime,
        daysInMission: Number(form.daysInMission),
        kmAtOrigin: Number(form.kmAtOrigin),
        kmOnceReturned: Number(form.kmOnceReturned),
        totalKmPerTrip: Number(form.totalKmPerTrip),
        tripAllowanceInKWD: Number(form.tripAllowanceInKWD),
      };
      if (dialogMode === 'add') {
        await api.post('/tracker', payload);
        setSuccess('Entry added');
      } else if (editingId) {
        await api.put(`/tracker/${editingId}`, payload);
        setSuccess('Entry updated');
      }
      handleCloseDialog();
      fetchData();
      refreshWaterCards(); // Refresh water cards after successful save
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    setError('');
    try {
      await api.delete(`/tracker/${id}`);
      setSuccess('Entry deleted');
      fetchData();
      refreshWaterCards(); // Refresh water cards after successful delete
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  const getTotals = (rows: any[]) => {
    const totals: any = {};
    numericFields.forEach(f => { totals[f] = 0; });
    rows.forEach(row => {
      numericFields.forEach(f => {
        // Use the same field mapping as table rendering
        const key = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
        const fieldMapping: { [key: string]: string } = {
          'Name': 'name',
          'Nationality': 'nationality',
          'Passport': 'passport',
          'ResidencyNumber': 'residencyNumber',
          'Contact': 'contact',
          'DateLoaded': 'dateLoaded',
          'TimeLoaded': 'timeLoaded',
          'ReturnedDate': 'returnedDate',
          'ReturnedTime': 'returnedTime',
          'DurationTripTime': 'durationTripTime',
          'DaysInMission': 'daysInMission',
          'KMatOrigin': 'kmAtOrigin',
          'KMOnceReturned': 'kmOnceReturned',
          'TotalKMPerTrip': 'totalKmPerTrip',
          'TripAllowanceInKWD': 'tripAllowanceInKWD',
          'WaterCardNo': 'waterCardNo',
          'Gallons': 'gallons',
          'DepartureMonth': 'departureMonth',
          'DepartmentRequester': 'departmentRequester',
          'InvoicedDate': 'invoicedDate',
          'OTM_PO': 'OTM_PO',
          'TrailerNumber': 'trailerNumber',
          'TrailerType': 'trailerType',
          'Date': 'date',
          'From': 'from',
          'To': 'to',
          'Field': 'field',
          'VPN': 'VPN',
          'SR': 'SR',
          'TMR': 'TMR'
        };
        const formKey = fieldMapping[key] || key;
        const value = Number(row[formKey] || row[f] || 0);
        totals[f] += value;
        console.log(`Totals calculation - Field: ${f}, Key: ${key}, FormKey: ${formKey}, Value: ${value}, Running Total: ${totals[f]}`);
      });
    });
    return totals;
  };

  const rows = data[month] || [];
  const totals = getTotals(rows);

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.05)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.05)} 100%)`
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
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: muiTheme.shape.borderRadius,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <RouteIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Trip Tracker
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive trip tracking and mission management system
                    </Typography>
                  </Box>
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

        {/* Summary KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total Trips',
                value: rows.length,
                icon: <RouteIcon />,
                color: muiTheme.palette.primary.main,
                bgColor: alpha(muiTheme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Gallons',
                value: totals['Gallons'] || 0,
                icon: <TimelineIcon />,
                color: muiTheme.palette.success.main,
                bgColor: alpha(muiTheme.palette.success.main, 0.1)
              },
              {
                title: 'Total KM',
                value: totals['Total KM Per Trip'] || 0,
                icon: <LocalShippingIcon />,
                color: muiTheme.palette.warning.main,
                bgColor: alpha(muiTheme.palette.warning.main, 0.1)
              },
              {
                title: 'Total Allowance',
                value: `KWD ${totals['Trip Allowance In KWD'] || 0}`,
                icon: <AssessmentIcon />,
                color: muiTheme.palette.secondary.main,
                bgColor: alpha(muiTheme.palette.secondary.main, 0.1)
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
                    borderRadius: muiTheme.shape.borderRadius,
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

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            sx={{ 
              mb: 2,
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              borderRadius: muiTheme.shape.borderRadius
            }}
          >
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
              {monthLabels.map((m, i) => <Tab key={m} label={m} />)}
            </Tabs>
          </Paper>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box mb={2}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
              sx={{
                background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(muiTheme.palette.primary.main, 0.6)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Add Data
            </Button>
          </Box>
        </motion.div>
              {/* Main Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress size={40} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <Paper sx={{ 
              p: 3, 
              overflowX: 'auto', 
              maxHeight: '70vh', 
              overflowY: 'auto',
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              borderRadius: muiTheme.shape.borderRadius
            }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {trackerFields.map(f => (
                  <TableCell key={f} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    {f}
                  </TableCell>
                ))}
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                console.log('Row data:', row);
                return (
                  <TableRow key={row._id || idx}>
                    {trackerFields.map(f => {
                      if (f === 'EMP') {
                        const emp = employees.find(e => e._id === row.EMP || (row.EMP && row.EMP._id === e._id));
                        return <TableCell key={f}>{emp ? `${emp.name} (${emp.position})` : row.EMP}</TableCell>;
                      }
                      
                      // Use the same field mapping as form validation
                      const key = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                      const fieldMapping: { [key: string]: string } = {
                        'Name': 'name',
                        'Nationality': 'nationality',
                        'Passport': 'passport',
                        'ResidencyNumber': 'residencyNumber',
                        'Contact': 'contact',
                        'DateLoaded': 'dateLoaded',
                        'TimeLoaded': 'timeLoaded',
                        'ReturnedDate': 'returnedDate',
                        'ReturnedTime': 'returnedTime',
                        'DurationTripTime': 'durationTripTime',
                        'DaysInMission': 'daysInMission',
                        'KMatOrigin': 'kmAtOrigin',
                        'KMOnceReturned': 'kmOnceReturned',
                        'TotalKMPerTrip': 'totalKmPerTrip',
                        'TripAllowanceInKWD': 'tripAllowanceInKWD',
                        'WaterCardNo': 'waterCardNo',
                        'Gallons': 'gallons',
                        'DepartureMonth': 'departureMonth',
                        'DepartmentRequester': 'departmentRequester',
                        'InvoicedDate': 'invoicedDate',
                        'OTM_PO': 'OTM_PO',
                        'TrailerNumber': 'trailerNumber',
                        'TrailerType': 'trailerType',
                        'Date': 'date',
                        'From': 'from',
                        'To': 'to',
                        'Field': 'field',
                        'VPN': 'VPN',
                        'SR': 'SR',
                        'TMR': 'TMR'
                      };
                      const formKey = fieldMapping[key] || key;
                      console.log(`Field: ${f}, Key: ${key}, FormKey: ${formKey}, Value: ${row[formKey] || row[f] || ''}`);
                      return <TableCell key={f}>{row[formKey] || row[f] || ''}</TableCell>;
                    })}
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenDialog(row)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
              <Card sx={{ 
                mt: 2, 
                p: 3, 
                background: alpha(muiTheme.palette.info.main, 0.05),
                border: `1px solid ${alpha(muiTheme.palette.info.main, 0.2)}`,
                borderRadius: muiTheme.shape.borderRadius
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: muiTheme.palette.info.main, mb: 2 }}>
                    📊 Totals for {month}
                  </Typography>
                  <Box display="flex" gap={3} flexWrap="wrap">
                    {numericFields.map(f => (
                      <Box key={f} sx={{ 
                        minWidth: 120, 
                        p: 1.5, 
                        background: alpha(muiTheme.palette.info.main, 0.1),
                        borderRadius: 1,
                        border: `1px solid ${alpha(muiTheme.palette.info.main, 0.2)}`
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: muiTheme.palette.info.main }}>
                          {f}:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: muiTheme.palette.info.main }}>
                          {totals[f]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          )}
        </motion.div>
              {/* Add/Edit Data Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: muiTheme.shape.borderRadius,
              background: alpha(muiTheme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              boxShadow: muiTheme.shadows[24]
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.15)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
              color: muiTheme.palette.primary.main,
              borderBottom: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
              <Avatar sx={{ bgcolor: muiTheme.palette.primary.main, width: 40, height: 40 }}>
                <AddIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {dialogMode === 'add' ? 'Add New Trip' : 'Edit Trip'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {dialogMode === 'add' ? 'Create new trip entry' : 'Update existing trip details'}
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
              background: alpha(muiTheme.palette.primary.main, 0.1),
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -15, 
              left: -15, 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              background: muiTheme.palette.secondary.main,
              zIndex: 1
            }} />
          </DialogTitle>
                  <DialogContent sx={{ mt: 2, p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              {trackerFields.map((f, idx) => {
                if (f === 'Trailer Type') {
                  // Render Trailer Type field
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  // Map to lowercase field name for consistency
                  const fieldName = 'trailerType';
                  return (
                    <React.Fragment key={f}>
                      <TextField
                        label={f}
                        name={fieldName}
                        value={form[fieldName] || ''}
                        onChange={handleFormChange}
                        required
                        fullWidth
                      />
                      {/* Water Trip Dropdown */}
                      <TextField
                        select
                        label="Is This Trip A Water Trip?"
                        name="isWaterTrip"
                        value={isWaterTrip}
                        onChange={handleFormChange}
                        required
                        fullWidth
                      >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </TextField>
                    </React.Fragment>
                  );
                }
                // Conditionally render Water Card No. and Gallons
                if ((f === 'Water Card No.' || f === 'Gallons') && isWaterTrip !== 'yes') {
                  return null;
                }
                if (f === 'EMP') {
                  return (
                    <TextField
                      key={f}
                      select
                      label="EMP (Employee ID)"
                      name="EMP"
                      value={form.EMP || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      disabled={empLoading}
                    >
                      <MenuItem value="">Select Employee</MenuItem>
                      {employees.map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>{emp.employeeId || emp._id} - {emp.name} ({emp.position})</MenuItem>
                      ))}
                    </TextField>
                  );
                }
                // Auto-filled fields (read-only)
                if (f === 'Name') {
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name="name"
                      value={form.name || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: '#f5f5f5' }}
                    />
                  );
                }
                if (f === 'Nationality') {
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name="nationality"
                      value={form.nationality || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: '#f5f5f5' }}
                    />
                  );
                }
                if (f === 'Passport') {
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name="passport"
                      value={form.passport || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: '#f5f5f5' }}
                    />
                  );
                }
                if (f === 'Residency Number') {
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name="residencyNumber"
                      value={form.residencyNumber || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: '#f5f5f5' }}
                    />
                  );
                }
                if (f === 'Contact') {
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name="contact"
                      value={form.contact || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={{ backgroundColor: '#f5f5f5' }}
                    />
                  );
                }
                // Date fields
                if ([
                  'Date', 'Invoiced Date', 'Date Loaded', 'Returned Date'
                ].includes(f)) {
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  // Map to lowercase field names for consistency
                  const fieldMapping: { [key: string]: string } = {
                    'Date': 'date',
                    'InvoicedDate': 'invoicedDate',
                    'DateLoaded': 'dateLoaded',
                    'ReturnedDate': 'returnedDate'
                  };
                  const fieldName = fieldMapping[name] || name;
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name={fieldName}
                      type="date"
                      value={form[fieldName] || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }
                // Numeric fields
                if (numericFields.includes(f)) {
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  // Map to lowercase field names for consistency
                  const fieldMapping: { [key: string]: string } = {
                    'Gallons': 'gallons',
                    'DaysInMission': 'daysInMission',
                    'KMatOrigin': 'kmAtOrigin',
                    'KMOnceReturned': 'kmOnceReturned',
                    'TotalKMPerTrip': 'totalKmPerTrip',
                    'TripAllowanceInKWD': 'tripAllowanceInKWD'
                  };
                  const fieldName = fieldMapping[name] || name;
                  
                  // Only show Trip Allowance field when total trip distance is 40 km or greater
                  if (f === 'Trip Allowance In KWD') {
                    const totalKmPerTrip = Number(form.totalKmPerTrip) || 0;
                    if (totalKmPerTrip < 40) {
                      return null; // Don't render the field
                    }
                  }
                  
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name={fieldName}
                      type="number"
                      value={form[fieldName] || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                    />
                  );
                }
                // Time fields
                if (f === 'Time Loaded' || f === 'Returned Time') {
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  // Map to lowercase field names for consistency
                  const fieldMapping: { [key: string]: string } = {
                    'TimeLoaded': 'timeLoaded',
                    'ReturnedTime': 'returnedTime'
                  };
                  const fieldName = fieldMapping[name] || name;
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name={fieldName}
                      type="time"
                      value={form[fieldName] || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }
                
                // Duration Trip Time - Auto-calculated field
                if (f === 'Duration Trip Time') {
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name="durationTripTime"
                      value={form.durationTripTime || ''}
                      onChange={handleFormChange}
                      fullWidth
                      InputProps={{ 
                        readOnly: true,
                        style: { backgroundColor: '#f5f5f5' }
                      }}
                      helperText="Automatically calculated from departure and return times"
                    />
                  );
                }
                // Default text fields
                const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                // Map to lowercase field names for consistency
                const fieldMapping: { [key: string]: string } = {
                  'SR': 'SR',
                  'From': 'from',
                  'To': 'to',
                  'DepartmentRequester': 'departmentRequester',
                  'Field': 'field',
                  'OTM_PO': 'OTM_PO',
                  'VPN': 'VPN',
                  'TrailerNumber': 'trailerNumber',
                  'TrailerType': 'trailerType',
                  'WaterCardNo': 'waterCardNo',
                  'Gallons': 'gallons',
                  'TimeLoaded': 'timeLoaded',
                  'ReturnedTime': 'returnedTime',
                  'DurationTripTime': 'durationTripTime',
                  'DaysInMission': 'daysInMission',
                  'KMatOrigin': 'kmAtOrigin',
                  'KMOnceReturned': 'kmOnceReturned',
                  'TotalKMPerTrip': 'totalKmPerTrip',
                  'TripAllowanceInKWD': 'tripAllowanceInKWD'
                };
                const fieldName = fieldMapping[name] || name;
                
                // Special handling for Water Card No. field
                if (f === 'Water Card No.') {
                  return (
                    <TextField
                      key={f}
                      select
                      label={f}
                      name="waterCardNo"
                      value={form.waterCardNo || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      disabled={waterCardsLoading}
                    >
                      <MenuItem value="">Select Water Card</MenuItem>
                      {waterCards.map(card => (
                        <MenuItem 
                          key={card._id} 
                          value={card.cardId}
                          disabled={card.status === 'Blocked' || card.balance <= 0}
                        >
                          {card.cardId} - {card.client?.name || 'Unknown Client'} 
                          (Balance: {card.balance}) 
                          {card.status === 'Blocked' ? ' - BLOCKED' : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }
                
                return (
                  <TextField
                    key={f}
                    label={f}
                    name={fieldName}
                    value={form[fieldName] || ''}
                    onChange={handleFormChange}
                    required
                    fullWidth
                  />
                );
              })}
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha(muiTheme.palette.background.default, 0.8)} 0%, ${alpha(muiTheme.palette.background.paper, 0.9)} 100%)`,
            borderTop: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
            gap: 2
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderColor: muiTheme.palette.text.secondary,
              color: muiTheme.palette.text.secondary,
              '&:hover': {
                borderColor: muiTheme.palette.text.primary,
                color: muiTheme.palette.text.primary,
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(muiTheme.palette.primary.main, 0.6)}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')} 
        message={success} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: muiTheme.palette.success.main,
            color: 'white'
          }
        }}
      />
      </AnimatePresence>
    </Box>
  );
};

export default TrackerPage; 