import React, { useEffect, useState } from 'react';
import {
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Button, 
  TextField, 
  MenuItem, 
  Card, 
  CardContent, 
  Typography, 
  Select, 
  InputLabel, 
  FormControl, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  CircularProgress, 
  IconButton,
  Avatar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const months = [
  'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'
];

const getCurrentFiscalMonth = () => {
  const now = new Date();
  const month = now.getMonth();
  // Fiscal year starts in April (3)
  return month >= 3 ? month - 3 : month + 9;
};

const defaultRow = {
  srJobTitle: '',
  name: '',
  nationality: '',
  residencyNo: '',
  allowance: '',
  remark: '',
};

const getYearForTab = (tabIdx: number) => {
  const now = new Date();
  const fiscalStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  // April (0) to December (8) is fiscalStart, Jan/Feb/Mar is fiscalStart+1
  return tabIdx <= 8 ? fiscalStart : fiscalStart + 1;
};

const TripAllowancePage: React.FC = () => {
  const [tab, setTab] = useState(getCurrentFiscalMonth());
  const [employees, setEmployees] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(defaultRow);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eligibleTrips, setEligibleTrips] = useState<any[]>([]);
  const [additionalAllowances, setAdditionalAllowances] = useState<{ [tripId: string]: number }>({});
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const theme = useTheme();

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/payroll/employees');
      const data = res.data as any;
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    }
  };

  const fetchMonthData = async () => {
    setLoading(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      console.log('Fetching trip allowance data for month:', monthIdx, 'year:', year);
      console.log('API URL:', `/trip-allowance?month=${monthIdx}&year=${year}`);
      const res = await api.get(`/trip-allowance?month=${monthIdx}&year=${year}`);
      const data = res.data as any;
      console.log('Received trip allowance data:', data);
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
      setMonthData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching trip allowance data:', err);
      setError('Failed to load trip allowance data');
      setMonthData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleTrips = async () => {
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      const monthName = months[monthIdx]; // Convert index to month name
      console.log('Fetching eligible trips for month:', monthName, 'year:', year);
      console.log('API URL:', `/tracker/trip-allowance-eligible?month=${monthIdx}&year=${year}`);
      
      const res = await api.get(`/tracker/trip-allowance-eligible?month=${monthIdx}&year=${year}`);
      const data = res.data as any;
      console.log('Received eligible trips:', data);
      console.log('Eligible trips count:', Array.isArray(data) ? data.length : 'Not an array');
      
      if (Array.isArray(data)) {
        setEligibleTrips(data);
        console.log('Eligible trips set successfully:', data.length);
      } else {
        console.log('No eligible trips found or invalid data format');
        setEligibleTrips([]);
      }
    } catch (err: any) {
      console.error('Error fetching eligible trips:', err);
      console.error('Error details:', err.response?.data || err.message);
      setEligibleTrips([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered - tab changed to:', tab, 'month name:', months[tab]);
    fetchMonthData();
    fetchEligibleTrips(); // Also fetch eligible trips when tab changes
    // eslint-disable-next-line
  }, [tab]);

  // Debug useEffect for eligible trips
  useEffect(() => {
    console.log('Eligible trips state changed:', eligibleTrips);
    console.log('Eligible trips length:', eligibleTrips.length);
    if (eligibleTrips.length > 0) {
      console.log('First eligible trip:', eligibleTrips[0]);
    }
  }, [eligibleTrips]);

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

  // Calculate trip allowance costs for a period
  const calculateCostForPeriod = (startDate: Date, endDateExclusive: Date): number => {
    return monthData
      .filter(record => {
        // For trip allowance records, we'll use the current month's data
        // Since the data is already filtered by month, we'll include all records
        // in the current month that fall within the period
        const recordDate = new Date();
        return recordDate >= startDate && recordDate < endDateExclusive;
      })
      .reduce((total, record) => total + (Number(record.allowance) || 0), 0);
  };

  // Precompute period boundaries and cost totals
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

  const periodCosts = {
    daily: calculateCostForPeriod(todayStart, tomorrowStart),
    weekly: calculateCostForPeriod(weekStart, nextWeekStart),
    monthly: calculateCostForPeriod(monthStart, nextMonthStart),
    quarterly: calculateCostForPeriod(quarterStart, nextQuarterStart),
    halfYearly: calculateCostForPeriod(halfStart, nextHalfStart),
    yearly: calculateCostForPeriod(fyStart, nextFyStart),
  };

  const getMonthName = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const getQuarterName = (date: Date) => `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
  const getHalfYearName = (date: Date) => `H${Math.floor(date.getMonth() / 6) + 1} ${date.getFullYear()}`;

  const handleTabChange = (_: any, newValue: number) => {
    console.log('Tab change requested - old tab:', tab, 'new tab:', newValue);
    console.log('Old month:', months[tab], 'New month:', months[newValue]);
    setTab(newValue);
    console.log('Tab changed to:', months[newValue]);
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddData = async () => {
    for (const key of Object.keys(defaultRow)) {
      if (!form[key]) {
        setError('All fields are required');
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      const payload = {
        ...form,
        month: monthIdx,
        year,
        allowance: Number(form.allowance),
      };
      const res = await api.post('/trip-allowance', payload);
      if (res.status !== 200) throw new Error('Failed to save');
      setForm(defaultRow);
      setOpenForm(false);
      fetchMonthData();
    } catch (err: any) {
      setError('Failed to save trip allowance data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await api.delete(`/trip-allowance/${id}`);
      if (res.status !== 200) throw new Error('Failed to delete');
      fetchMonthData();
    } catch {
      setError('Failed to delete trip allowance record');
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals for each column
  const safeMonthData = Array.isArray(monthData) ? monthData : [];
  const totals = {
    allowance: safeMonthData.reduce((sum, r) => sum + Number(r.allowance || 0), 0),
  };

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <LocalShippingIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Trip Allowance Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Comprehensive trip allowance tracking and management system
                  </Typography>
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
              {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            sx={{ 
              mb: 2,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              {months.map((m, i) => <Tab key={m} label={m} />)}
            </Tabs>
          </Paper>
        </motion.div>
              {/* Add Data Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
            <Box mb={2} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setOpenForm(true)}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Add Data
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  console.log('Manual fetch of eligible trips...');
                  fetchEligibleTrips();
                }}
                sx={{ minWidth: 120 }}
              >
                Debug Eligible Trips
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                size="small"
                disabled={eligibleTrips.length === 0}
                onClick={async () => {
                  console.log('Converting eligible trips to trip allowance entries...');
                  try {
                    const monthIdx = tab;
                    const year = getYearForTab(tab);
                    let successCount = 0;
                    let errorCount = 0;
                    
                    for (const trip of eligibleTrips) {
                      try {
                        const payload = {
                          month: monthIdx,
                          year: year,
                          srJobTitle: trip.SR || 'N/A',
                          name: trip.name || 'N/A',
                          nationality: trip.nationality || 'N/A',
                          residencyNo: trip.residencyNumber || 'N/A',
                          allowance: 3, // Default allowance
                          remark: `Auto-generated from trip ${trip.SR} (${trip.totalKmPerTrip}km)`,
                        };
                        
                        await api.post('/trip-allowance', payload);
                        successCount++;
                        console.log(`Created trip allowance for ${trip.name}`);
                      } catch (err) {
                        errorCount++;
                        console.error(`Failed to create trip allowance for ${trip.name}:`, err);
                      }
                    }
                    
                    console.log(`Conversion complete: ${successCount} success, ${errorCount} errors`);
                    if (successCount > 0) {
                      fetchMonthData(); // Refresh the main data
                    }
                  } catch (err) {
                    console.error('Error converting eligible trips:', err);
                  }
                }}
                sx={{ minWidth: 180 }}
              >
                Convert to Trip Allowance ({eligibleTrips.length})
              </Button>
              <Typography variant="caption" color="text.secondary">
                Eligible trips: {eligibleTrips.length}
              </Typography>
            </Box>
        </motion.div>
              {/* Eligible Tracker Trips for Trip Allowance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            sx={{ 
              mb: 2, 
              p: 2, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" mb={2} sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              🚛 Eligible Trips (from Tracker) - {eligibleTrips.length} found
            </Typography>
            {eligibleTrips.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No eligible trips found for {months[tab]} {getYearForTab(tab)}. 
                Eligible trips must have totalKmPerTrip ≥ 40km.
              </Alert>
            )}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Nationality</TableCell>
              <TableCell>Residency No.</TableCell>
              <TableCell>EMP</TableCell>
              <TableCell>Total KM Per Trip</TableCell>
              <TableCell>Default Allowance</TableCell>
              <TableCell>Additional Allowance</TableCell>
              <TableCell>Total Allowance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eligibleTrips.map(trip => {
              const additional = additionalAllowances[trip._id] || 0;
              const isEditing = editingTripId === trip._id;
              return (
                <TableRow key={trip._id}>
                  <TableCell>{trip.SR}</TableCell>
                  <TableCell>{trip.name}</TableCell>
                  <TableCell>{trip.nationality}</TableCell>
                  <TableCell>{trip.residencyNumber}</TableCell>
                  <TableCell>{typeof trip.EMP === 'object' && trip.EMP ? `${trip.EMP.name} (${trip.EMP.employeeId})` : trip.EMP}</TableCell>
                  <TableCell>{trip.totalKmPerTrip}</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        sx={{ width: 80 }}
                      />
                    ) : (
                      additional || '-'
                    )}
                  </TableCell>
                  <TableCell>{3 + (additional ? Number(additional) : 0)}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setAdditionalAllowances(prev => ({ ...prev, [trip._id]: Number(inputValue) }));
                          setEditingTripId(null);
                          setInputValue('');
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingTripId(trip._id);
                          setInputValue(additional ? String(additional) : '');
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
          </Paper>
        </motion.div>
        
        {/* Main Trip Allowance Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR Job Title</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Nationality</TableCell>
              <TableCell>Residency No.</TableCell>
              <TableCell>Allowance</TableCell>
              <TableCell>Remark</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeMonthData.map((row, idx) => (
              <TableRow key={row._id || idx}>
                <TableCell>{row.srJobTitle}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.nationality}</TableCell>
                <TableCell>{row.residencyNo}</TableCell>
                <TableCell>{row.allowance}</TableCell>
                <TableCell>{row.remark}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
              </Paper>
            </motion.div>
          )}
          
          {/* Totals Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Box display="flex" gap={2} mt={2} flexWrap="wrap">
              <Card 
                sx={{ 
                  background: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.2)}`
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                    Total Allowance: {totals.allowance.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </motion.div>

        {/* Cost Analysis Boxes */}
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
              🚛 Trip Allowance Cost Analysis by Time Periods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Total trip allowance costs across different time periods based on current month's allowance data. 
              Costs are calculated from the allowance field of each trip allowance record.
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              {/* Daily Cost Box */}
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
                        Daily Trip Allowance Cost
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                      {periodCosts.daily.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {todayStart.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Cost Box */}
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
                        Weekly Trip Allowance Cost
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      {periodCosts.weekly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(nextWeekStart.getTime() - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Cost Box */}
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
                        Monthly Trip Allowance Cost
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      {periodCosts.monthly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getMonthName(monthStart)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quarterly Cost Box */}
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
                        Quarterly Trip Allowance Cost
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.secondary.main }}>
                      {periodCosts.quarterly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getQuarterName(quarterStart)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Half-Yearly Cost Box */}
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
                        Half-Yearly Trip Allowance Cost
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main }}>
                      {periodCosts.halfYearly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getHalfYearName(halfStart)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Yearly Cost Box */}
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
                        Financial Year Trip Allowance Cost
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      {periodCosts.yearly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
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
      {/* Add Data Dialog */}
      <AnimatePresence>
        <Dialog 
          open={openForm} 
          onClose={() => setOpenForm(false)} 
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
                <LocalShippingIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Add Trip Allowance Data
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Enter new trip allowance information
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
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddData(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Employee Information Section */}
              <Box sx={{
                p: 2,
                background: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                  👤 Employee Information
                </Typography>
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <TextField 
                    label="SR Job Title" 
                    name="srJobTitle" 
                    value={form.srJobTitle} 
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
                  <TextField 
                    label="Name" 
                    name="name" 
                    value={form.name} 
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
                <Box display="flex" gap={2}>
                  <TextField 
                    label="Nationality" 
                    name="nationality" 
                    value={form.nationality} 
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
                  <TextField 
                    label="Residency No." 
                    name="residencyNo" 
                    value={form.residencyNo} 
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
              </Box>
              
              {/* Allowance Details Section */}
              <Box sx={{
                p: 2,
                background: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                  💰 Allowance Details
                </Typography>
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <TextField 
                    label="Allowance" 
                    name="allowance" 
                    value={form.allowance} 
                    onChange={handleFormChange} 
                    type="number" 
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
                <TextField 
                  label="Remark" 
                  name="remark" 
                  value={form.remark} 
                  onChange={handleFormChange} 
                  required 
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
                <Typography 
                  color="error" 
                  sx={{ 
                    mt: 2,
                    p: 2,
                    background: alpha(theme.palette.error.main, 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                  }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </DialogContent>
          
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            p={3}
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              gap: 2
            }}
          >
            <Button 
              onClick={() => setOpenForm(false)} 
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
              onClick={handleAddData} 
              variant="contained" 
              disabled={saving}
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
              {saving ? 'Saving...' : 'Add'}
            </Button>
          </Box>
        </Dialog>
      </AnimatePresence>
        </AnimatePresence>
      </Box>
    );
  };

export default TripAllowancePage; 