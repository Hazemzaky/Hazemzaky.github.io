import React, { useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, MenuItem, Card, CardContent, Typography, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, CircularProgress, IconButton, Alert, useTheme, alpha, Avatar, Badge, Divider, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';
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
  employee: '',
  salary: '',
  dailySalary: '',
  hourlyRate: '',
  normalRate: '',
  normalHours: '',
  normalSalary: '',
  fridayRate: '',
  fridayHours: '',
  fridaySalary: '',
  holidayRate: '',
  holidayHours: '',
  holidaySalary: '',
  totalOvertimeHours: '',
  totalCost: '',
};

const overtimeAttendanceDefaultRow = {
  site: '',
  coId: '',
  employeeName: '',
  position: '',
  manager: '',
  date: '',
  day: '',
  dayType: '',
  from: '',
  to: '',
  totalHours: '',
  remarks: '',
};

const getYearForTab = (tabIdx: number) => {
  const now = new Date();
  const fiscalStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  // April (0) to December (8) is fiscalStart, Jan/Feb/Mar is fiscalStart+1
  return tabIdx <= 8 ? fiscalStart : fiscalStart + 1;
};

const OvertimePage: React.FC = () => {
  const muiTheme = useTheme();
  const [tab, setTab] = useState(getCurrentFiscalMonth());
  const [employees, setEmployees] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(defaultRow);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceTab, setAttendanceTab] = useState(0); // 0: Overtime, 1: Overtime Attendance
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceForm, setAttendanceForm] = useState<any>(overtimeAttendanceDefaultRow);
  const [openAttendanceForm, setOpenAttendanceForm] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  // Overtime Attendance search/filter state
  const [attendanceSearch, setAttendanceSearch] = useState({
    coId: '',
    employeeName: '',
    dayType: '',
    manager: '',
    position: '',
  });

  // Filtered attendance data
  const filteredAttendanceData = attendanceData.filter(row =>
    (!attendanceSearch.coId || row.coId.toLowerCase().includes(attendanceSearch.coId.toLowerCase())) &&
    (!attendanceSearch.employeeName || row.employeeName.toLowerCase().includes(attendanceSearch.employeeName.toLowerCase())) &&
    (!attendanceSearch.dayType || row.dayType === attendanceSearch.dayType) &&
    (!attendanceSearch.manager || row.manager.toLowerCase().includes(attendanceSearch.manager.toLowerCase())) &&
    (!attendanceSearch.position || row.position.toLowerCase().includes(attendanceSearch.position.toLowerCase()))
  );

  // Totals for filtered data
  const totalNormal = filteredAttendanceData.filter(r => r.dayType === 'Normal Day').reduce((sum, r) => sum + Number(r.totalHours || 0), 0);
  const totalFriday = filteredAttendanceData.filter(r => r.dayType === 'Friday day').reduce((sum, r) => sum + Number(r.totalHours || 0), 0);
  const totalHoliday = filteredAttendanceData.filter(r => r.dayType === 'Holiday Days').reduce((sum, r) => sum + Number(r.totalHours || 0), 0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchMonthData();
    // eslint-disable-next-line
  }, [tab]);

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

  // Calculate overtime costs for a period
  const calculateCostForPeriod = (startDate: Date, endDateExclusive: Date): number => {
    return monthData
      .filter(record => {
        // For overtime records, we'll use the current month's data
        // Since the data is already filtered by month, we'll include all records
        // in the current month that fall within the period
        const recordDate = new Date();
        return recordDate >= startDate && recordDate < endDateExclusive;
      })
      .reduce((total, record) => total + (record.totalCost || 0), 0);
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

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees for overtime...');
      
      // Use regular employees endpoint (same as EmployeesPage)
      const res = await api.get('/employees');
      console.log('Employees response:', res.data);
      
      let employeesData = [];
      
      // Handle new response structure with employees array and stats (same as EmployeesPage)
      if (res.data && typeof res.data === 'object' && 'employees' in res.data) {
        employeesData = Array.isArray(res.data.employees) ? res.data.employees : [];
        console.log('Using nested employees structure:', employeesData.length, 'employees');
      } else if (Array.isArray(res.data)) {
        // Fallback for old response structure
        employeesData = res.data;
        console.log('Using direct array structure:', employeesData.length, 'employees');
      } else {
        console.error('Unexpected response structure:', res.data);
        setEmployees([]);
        return;
      }
      
      if (employeesData.length > 0) {
        console.log('First employee structure:', employeesData[0]);
        
        // Filter for drivers and operators
        let filteredEmployees = employeesData.filter((emp: any) => 
          emp.position && (emp.position.toLowerCase().includes('driver') || emp.position.toLowerCase().includes('operator'))
        );
        console.log('Filtered employees (drivers/operators):', filteredEmployees.length);
        
        // If no drivers/operators found, show all employees for debugging
        if (filteredEmployees.length === 0) {
          console.log('No drivers/operators found, showing all employees for debugging');
          filteredEmployees = employeesData.slice(0, 10); // Show first 10 for debugging
        }
        
        console.log('Final employees to set:', filteredEmployees);
        setEmployees(filteredEmployees);
      } else {
        console.log('No employees found');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const fetchMonthData = async () => {
    setLoading(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      console.log('Fetching overtime data for month:', monthIdx, 'year:', year);
      const res = await api.get(`/overtime?month=${monthIdx}&year=${year}`);
      const data = res.data as any;
      console.log('Received overtime data:', data);
      setMonthData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching overtime data:', err);
      setError('Failed to load overtime data');
      setMonthData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

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
        salary: Number(form.salary),
        dailySalary: Number(form.dailySalary),
        hourlyRate: Number(form.hourlyRate),
        normalRate: Number(form.normalRate),
        normalHours: Number(form.normalHours),
        normalSalary: Number(form.normalSalary),
        fridayRate: Number(form.fridayRate),
        fridayHours: Number(form.fridayHours),
        fridaySalary: Number(form.fridaySalary),
        holidayRate: Number(form.holidayRate),
        holidayHours: Number(form.holidayHours),
        holidaySalary: Number(form.holidaySalary),
        totalOvertimeHours: Number(form.totalOvertimeHours),
        totalCost: Number(form.totalCost),
      };
      console.log('Submitting overtime data:', payload);
      const res = await api.post('/overtime', payload);
      console.log('Overtime data saved successfully:', res.data);
      setForm(defaultRow);
      setOpenForm(false);
      fetchMonthData();
    } catch (err: any) {
      setError('Failed to save overtime data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      console.log('Deleting overtime data with ID:', id);
      const res = await api.delete(`/overtime/${id}`);
      console.log('Overtime data deleted successfully');
      fetchMonthData();
    } catch {
      setError('Failed to delete overtime record');
    } finally {
      setSaving(false);
    }
  };

  // Overtime Attendance handlers
  const handleAttendanceFormChange = (e: any) => {
    const { name, value } = e.target;
    let newForm = { ...attendanceForm, [name]: value };
    // Auto-calculate day from date
    if (name === 'date' && value) {
      const d = new Date(value);
      newForm.day = d.toLocaleDateString(undefined, { weekday: 'long' });
    }
    // Auto-calculate total hours
    if ((name === 'from' || name === 'to') && newForm.from && newForm.to) {
      const fromParts = newForm.from.split(':');
      const toParts = newForm.to.split(':');
      if (fromParts.length === 2 && toParts.length === 2) {
        const fromDate = new Date(0, 0, 0, Number(fromParts[0]), Number(fromParts[1]));
        const toDate = new Date(0, 0, 0, Number(toParts[0]), Number(toParts[1]));
        let diff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24; // handle overnight
        newForm.totalHours = diff.toFixed(2);
      }
    }
    setAttendanceForm(newForm);
  };

  const handleAddAttendance = async () => {
    for (const key of Object.keys(overtimeAttendanceDefaultRow)) {
      if (!attendanceForm[key] && key !== 'remarks') {
        setAttendanceError('All fields except remarks are required');
        return;
      }
    }
    setAttendanceSaving(true);
    setAttendanceError('');
    try {
      setAttendanceData(prev => [...prev, { ...attendanceForm }]);
      setAttendanceForm(overtimeAttendanceDefaultRow);
      setOpenAttendanceForm(false);
    } catch (err: any) {
      setAttendanceError('Failed to save overtime attendance data');
    } finally {
      setAttendanceSaving(false);
    }
  };

  // Calculate totals for each column
  const totals = {
    salary: monthData.reduce((sum, r) => sum + Number(r.salary || 0), 0),
    dailySalary: monthData.reduce((sum, r) => sum + Number(r.dailySalary || 0), 0),
    hourlyRate: monthData.reduce((sum, r) => sum + Number(r.hourlyRate || 0), 0),
    normalSalary: monthData.reduce((sum, r) => sum + Number(r.normalSalary || 0), 0),
    fridaySalary: monthData.reduce((sum, r) => sum + Number(r.fridaySalary || 0), 0),
    holidaySalary: monthData.reduce((sum, r) => sum + Number(r.holidaySalary || 0), 0),
    totalOvertimeHours: monthData.reduce((sum, r) => sum + Number(r.totalOvertimeHours || 0), 0),
    totalCost: monthData.reduce((sum, r) => sum + Number(r.totalCost || 0), 0),
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <AccessTimeIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Overtime Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive overtime tracking and payroll management
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
                title: 'Total Employees',
                value: employees.length,
                icon: <PeopleIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Overtime Hours',
                value: totals.totalOvertimeHours,
                icon: <AccessTimeIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Total Cost',
                value: totals.totalCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <AttachMoneyIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Active Projects',
                value: monthData.length,
                icon: <WorkIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
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

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper 
            sx={{ 
              mb: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Tabs 
              value={attendanceTab} 
              onChange={(_, v) => setAttendanceTab(v)} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            >
              <Tab label="Overtime" />
              <Tab label="Overtime Attendance" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Overtime Tab Content */}
        {attendanceTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Box mb={3} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  console.log('Current employees state:', employees);
                  console.log('Employees length:', employees.length);
                  fetchEmployees();
                }}
                sx={{ minWidth: 120 }}
              >
                Debug Employees
              </Button>
              <Typography variant="caption" color="text.secondary">
                Employees loaded: {employees.length}
              </Typography>
              {employees.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  First: {employees[0]?.name || 'No Name'} (ID: {employees[0]?.employeeId || employees[0]?._id || 'No ID'})
                </Typography>
              )}
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                <CircularProgress />
              </Box>
            ) : (
            <Paper sx={{ 
              p: 2, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Daily Salary</TableCell>
                    <TableCell>Hourly Rate</TableCell>
                    <TableCell sx={{ bgcolor: 'white' }}>Normal Day Rate</TableCell>
                    <TableCell sx={{ bgcolor: 'white' }}>Normal Day Hours</TableCell>
                    <TableCell sx={{ bgcolor: 'white' }}>Normal Day Salary</TableCell>
                    <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Rate</TableCell>
                    <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Hours</TableCell>
                    <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Salary</TableCell>
                    <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Rate</TableCell>
                    <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Hours</TableCell>
                    <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Salary</TableCell>
                    <TableCell>Total Overtime Hours</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthData.map((row, idx) => (
                    <TableRow key={row._id || idx}>
                      <TableCell>{employees.find(e => e._id === row.employee || (row.employee && row.employee._id))?.name || ''}</TableCell>
                      <TableCell>{row.salary}</TableCell>
                      <TableCell>{row.dailySalary}</TableCell>
                      <TableCell>{row.hourlyRate}</TableCell>
                      <TableCell sx={{ bgcolor: 'white' }}>{row.normalRate}</TableCell>
                      <TableCell sx={{ bgcolor: 'white' }}>{row.normalHours}</TableCell>
                      <TableCell sx={{ bgcolor: 'white' }}>{row.normalSalary}</TableCell>
                      <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridayRate}</TableCell>
                      <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridayHours}</TableCell>
                      <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridaySalary}</TableCell>
                      <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidayRate}</TableCell>
                      <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidayHours}</TableCell>
                      <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidaySalary}</TableCell>
                      <TableCell>{row.totalOvertimeHours}</TableCell>
                      <TableCell>{row.totalCost}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            )}
            {/* Totals Cards */}
            <Box display="flex" gap={2} mt={3} flexWrap="wrap">
              {[
                { title: 'Total Normal Salary', value: totals.normalSalary, color: theme.palette.success.main },
                { title: 'Total Friday Salary', value: totals.fridaySalary, color: theme.palette.warning.main },
                { title: 'Total Holiday Salary', value: totals.holidaySalary, color: theme.palette.info.main },
                { title: 'Total Overtime Hours', value: totals.totalOvertimeHours, color: theme.palette.primary.main },
                { title: 'Total Cost', value: totals.totalCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }), color: theme.palette.secondary.main }
              ].map((card, index) => (
                <Card 
                  key={card.title}
                  sx={{ 
                    background: alpha(card.color, 0.1),
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 15px ${alpha(card.color, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: card.color, fontWeight: 600, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h6" sx={{ color: card.color, fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            {/* Add Data Dialog */}
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
                    <AddIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Add Overtime Data
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Enter employee overtime information and rates
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
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <FormControl fullWidth required>
                    <InputLabel>Employee</InputLabel>
                    <Select
                      name="employee"
                      value={form.employee}
                      label="Employee"
                      onChange={handleFormChange}
                    >
                      {Array.isArray(employees) && employees.length > 0 ? (
                        employees.map(e => {
                          console.log('Rendering employee in overtime dropdown:', e);
                          const displayName = e.name || 'No Name';
                          const displayId = e.employeeId || e._id;
                          return (
                            <MenuItem key={e._id} value={e._id}>
                              {displayName} ({displayId})
                            </MenuItem>
                          );
                        })
                      ) : (
                        <MenuItem disabled>No employees available (drivers/operators only)</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <TextField label="Salary" name="salary" value={form.salary} onChange={handleFormChange} required fullWidth />
                  <TextField label="Daily Salary" name="dailySalary" value={form.dailySalary} onChange={handleFormChange} required fullWidth />
                  <TextField label="Hourly Rate" name="hourlyRate" value={form.hourlyRate} onChange={handleFormChange} required fullWidth />
                  {/* Normal Day (white) */}
                  <TextField label="Normal Day Rate" name="normalRate" value={form.normalRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
                  <TextField label="Normal Day Hours" name="normalHours" value={form.normalHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
                  <TextField label="Normal Day Salary" name="normalSalary" value={form.normalSalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
                  {/* Friday (red) */}
                  <TextField label="Friday Rate" name="fridayRate" value={form.fridayRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
                  <TextField label="Friday Hours" name="fridayHours" value={form.fridayHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
                  <TextField label="Friday Salary" name="fridaySalary" value={form.fridaySalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
                  {/* Public Holiday (green) */}
                  <TextField label="Public Holiday Rate" name="holidayRate" value={form.holidayRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
                  <TextField label="Public Holiday Hours" name="holidayHours" value={form.holidayHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
                  <TextField label="Public Holiday Salary" name="holidaySalary" value={form.holidaySalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
                  <TextField label="Total Overtime Hours" name="totalOvertimeHours" value={form.totalOvertimeHours} onChange={handleFormChange} required fullWidth />
                  <TextField label="Total Cost" name="totalCost" value={form.totalCost} onChange={handleFormChange} required fullWidth />
                </Box>
                {error && <Typography color="error" mt={2}>{error}</Typography>}
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
          </motion.div>
        )}

        {/* Overtime Attendance Tab Content */}
        {attendanceTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Box mb={3} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setOpenAttendanceForm(true)}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Add Overtime Attendance
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  console.log('Current employees for attendance:', employees);
                  console.log('Employees length:', employees.length);
                  fetchEmployees();
                }}
                sx={{ minWidth: 120 }}
              >
                Debug Employees
              </Button>
              <Typography variant="caption" color="text.secondary">
                Employees loaded: {employees.length}
              </Typography>
              {employees.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  First: {employees[0]?.name || 'No Name'} (ID: {employees[0]?.employeeId || employees[0]?._id || 'No ID'})
                </Typography>
              )}
            </Box>
            {/* Search/Filter Controls */}
            <Paper sx={{ 
              p: 2, 
              mb: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField label="Co. ID" value={attendanceSearch.coId} onChange={e => setAttendanceSearch(s => ({ ...s, coId: e.target.value }))} size="small" />
                <TextField label="Employee Name" value={attendanceSearch.employeeName} onChange={e => setAttendanceSearch(s => ({ ...s, employeeName: e.target.value }))} size="small" />
                <TextField label="Manager" value={attendanceSearch.manager} onChange={e => setAttendanceSearch(s => ({ ...s, manager: e.target.value }))} size="small" />
                <TextField label="Position" value={attendanceSearch.position} onChange={e => setAttendanceSearch(s => ({ ...s, position: e.target.value }))} size="small" />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Day Type</InputLabel>
                  <Select
                    value={attendanceSearch.dayType}
                    label="Day Type"
                    onChange={e => setAttendanceSearch(s => ({ ...s, dayType: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Holiday Days">Holiday Days</MenuItem>
                    <MenuItem value="Friday day">Friday day</MenuItem>
                    <MenuItem value="Normal Day">Normal Day</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
            <Paper sx={{ 
              p: 2, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Site</TableCell>
                    <TableCell>Co. ID</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Day Type</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendanceData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.site}</TableCell>
                      <TableCell>{row.coId}</TableCell>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{row.position}</TableCell>
                      <TableCell>{row.manager}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.day}</TableCell>
                      <TableCell>{row.dayType}</TableCell>
                      <TableCell>{row.from}</TableCell>
                      <TableCell>{row.to}</TableCell>
                      <TableCell>{row.totalHours}</TableCell>
                      <TableCell>{row.remarks}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow>
                    <TableCell colSpan={10} align="right"><b>Total Normal Day Hours:</b></TableCell>
                    <TableCell colSpan={2}><b>{totalNormal}</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={10} align="right"><b>Total Friday Hours:</b></TableCell>
                    <TableCell colSpan={2}><b>{totalFriday}</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={10} align="right"><b>Total Holiday Hours:</b></TableCell>
                    <TableCell colSpan={2}><b>{totalHoliday}</b></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
            <Dialog 
              open={openAttendanceForm} 
              onClose={() => setOpenAttendanceForm(false)} 
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
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                  color: theme.palette.success.main,
                  borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}>
                    <AddIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Add Overtime Attendance
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Record employee overtime attendance details
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
                  background: alpha(theme.palette.success.main, 0.1),
                  zIndex: 1
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: -15, 
                  left: -15, 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: alpha(theme.palette.info.main, 0.08),
                  zIndex: 1
                }} />
              </DialogTitle>
              <DialogContent sx={{ mt: 2, p: 3 }}>
                <Box component="form" onSubmit={handleAddAttendance} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                      <FormControl fullWidth required>
                        <InputLabel>Co. ID</InputLabel>
                        <Select
                          name="coId"
                          value={attendanceForm.coId}
                          label="Co. ID"
                          onChange={e => {
                            const selectedId = e.target.value;
                            console.log('Selected employee ID:', selectedId);
                            console.log('Available employees:', employees);
                            const emp = employees.find((emp: any) => (emp.employeeId || emp._id) === selectedId);
                            console.log('Found employee:', emp);
                            setAttendanceForm((prev: any) => ({
                              ...prev,
                              coId: selectedId,
                              employeeName: emp ? emp.name : '',
                              position: emp ? emp.position : '',
                            }));
                          }}
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
                          {Array.isArray(employees) && employees.length > 0 ? (
                            employees.map(emp => {
                              console.log('Rendering employee in attendance dropdown:', emp);
                              const empId = emp.employeeId || emp._id;
                              const empName = emp.name || 'No Name';
                              return (
                                <MenuItem key={emp._id} value={empId}>
                                  {empId} - {empName}
                                </MenuItem>
                              );
                            })
                          ) : (
                            <MenuItem disabled>No employees available (drivers/operators only)</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      <TextField 
                        label="Employee Name" 
                        name="employeeName" 
                        value={attendanceForm.employeeName} 
                        fullWidth 
                        required 
                        disabled 
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
                        label="Position" 
                        name="position" 
                        value={attendanceForm.position} 
                        onChange={handleAttendanceFormChange} 
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
                        label="Manager" 
                        name="manager" 
                        value={attendanceForm.manager} 
                        onChange={handleAttendanceFormChange} 
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

                  {/* Attendance Details Section */}
                  <Box sx={{
                    p: 2,
                    background: alpha(theme.palette.success.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                      📅 Attendance Details
                    </Typography>
                    <Box display="flex" gap={2} sx={{ mb: 2 }}>
                      <TextField 
                        label="Date" 
                        name="date" 
                        type="date" 
                        value={attendanceForm.date} 
                        onChange={handleAttendanceFormChange} 
                        required 
                        fullWidth 
                        InputLabelProps={{ shrink: true }} 
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
                        label="Day" 
                        name="day" 
                        value={attendanceForm.day} 
                        onChange={handleAttendanceFormChange} 
                        required 
                        fullWidth 
                        disabled 
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
                    <FormControl fullWidth required sx={{ mb: 2 }}>
                      <InputLabel>Day Type</InputLabel>
                      <Select
                        name="dayType"
                        value={attendanceForm.dayType}
                        label="Day Type"
                        onChange={handleAttendanceFormChange}
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
                      >
                        <MenuItem value="Holiday Days">Holiday Days</MenuItem>
                        <MenuItem value="Friday day">Friday day</MenuItem>
                        <MenuItem value="Normal Day">Normal Day</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Time Tracking Section */}
                  <Box sx={{
                    p: 2,
                    background: alpha(theme.palette.info.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                      ⏰ Time Tracking
                    </Typography>
                    <Box display="flex" gap={2} sx={{ mb: 2 }}>
                      <TextField 
                        label="From" 
                        name="from" 
                        type="time" 
                        value={attendanceForm.from} 
                        onChange={handleAttendanceFormChange} 
                        required 
                        fullWidth 
                        InputLabelProps={{ shrink: true }} 
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
                        label="To" 
                        name="to" 
                        type="time" 
                        value={attendanceForm.to} 
                        onChange={handleAttendanceFormChange} 
                        required 
                        fullWidth 
                        InputLabelProps={{ shrink: true }} 
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
                      label="Total Hours" 
                      name="totalHours" 
                      value={attendanceForm.totalHours} 
                      onChange={handleAttendanceFormChange} 
                      required 
                      fullWidth 
                      disabled 
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

                  {/* Additional Information Section */}
                  <Box sx={{
                    p: 2,
                    background: alpha(theme.palette.warning.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                      📝 Additional Information
                    </Typography>
                    <TextField 
                      label="Site" 
                      name="site" 
                      value={attendanceForm.site} 
                      onChange={handleAttendanceFormChange} 
                      required 
                      fullWidth 
                      size="medium"
                      sx={{ mb: 2,
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
                    <TextField 
                      label="Remarks" 
                      name="remarks" 
                      value={attendanceForm.remarks} 
                      onChange={handleAttendanceFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
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

                  {attendanceError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 2,
                        '& .MuiAlert-icon': {
                          color: theme.palette.error.main
                        }
                      }}
                    >
                      {attendanceError}
                    </Alert>
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
                  onClick={() => setOpenAttendanceForm(false)} 
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
                  onClick={handleAddAttendance} 
                  variant="contained" 
                  disabled={attendanceSaving}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled
                    }
                  }}
                >
                  {attendanceSaving ? 'Saving...' : 'Add'}
                </Button>
              </Box>
            </Dialog>
          </motion.div>
        )}

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
              ⏰ Overtime Cost Analysis by Time Periods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Total overtime costs across different time periods based on current month's overtime data. 
              Costs are calculated from the totalCost field of each overtime record.
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
                        Daily Overtime Cost
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
                        Weekly Overtime Cost
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
                        Monthly Overtime Cost
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
                        Quarterly Overtime Cost
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
                        Half-Yearly Overtime Cost
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
                        Financial Year Overtime Cost
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
      </AnimatePresence>
    </Box>
  );
};

export default OvertimePage; 