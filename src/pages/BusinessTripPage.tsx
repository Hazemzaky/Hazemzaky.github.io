import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import {
  getBusinessTrips,
  createBusinessTrip,
  updateBusinessTrip,
  deleteBusinessTrip,
  getBusinessTripById
} from '../services/businessTripApi';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import api from '../apiBase';
// 1. Import Framer Motion, react-icons, and MUI theme utilities
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';
import CostAnalysisDashboard from '../components/CostAnalysisDashboard';
// 1. Add state for stepper
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
// Add icons for select fields
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LuggageIcon from '@mui/icons-material/Luggage';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TRIP_TYPES = [
  "Internal Meeting & Visiting Offices",
  "Negotiation With Suppliers",
  "Sales",
  "Conference",
  "Training & Development",
  "Other",
  "Meeting",
  "Training",
  "Seminar"
];
const REGIONS = ["GCC", "MENA", "Europe", "America", "Asia"];
const FLIGHT_CLASSES = ["Economy", "Business", "First"];
const FLIGHT_CLASS_MATRIX: Record<string, Record<string, string>> = {
  CEO: { GCC: "Business", Europe: "Business", America: "Business", Asia: "Business", MENA: "Business" },
  GM: { GCC: "Business", Europe: "Business", America: "Business", Asia: "Business", MENA: "Business" },
  Supervisor: { GCC: "Economy", Europe: "Economy", America: "Economy", Asia: "Economy", MENA: "Economy" },
};

function getFlightClass(role: string, region: string) {
  if (FLIGHT_CLASS_MATRIX[role] && FLIGHT_CLASS_MATRIX[role][region]) {
    return FLIGHT_CLASS_MATRIX[role][region];
  }
  return "Economy";
}

// Helper for status color
function getStatusColor(status: string) {
  switch (status) {
    case 'Draft': return 'default';
    case 'Under Review': return 'warning';
    case 'Approved': return 'primary';
    case 'Completed': return 'success';
    case 'Reimbursed': return 'info';
    case 'Rejected': return 'error';
    default: return 'default';
  }
}

// Add a helper to render a valid ReactElement for Chip icon
function renderStatusIcon(statusColor: string) {
  if (statusColor === 'success') return <span><CheckCircleIcon sx={{ color: '#43a047' }} /></span>;
  if (statusColor === 'primary') return <span><PersonAddIcon sx={{ color: '#1976d2' }} /></span>;
  if (statusColor === 'warning') return <span><WarningIcon sx={{ color: '#ffa726' }} /></span>;
  if (statusColor === 'error') return <span><ErrorIcon sx={{ color: '#e53935' }} /></span>;
  if (statusColor === 'info') return <span><InfoIcon sx={{ color: '#0288d1' }} /></span>;
  return undefined;
}

// Helper for status icon and color
const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft', icon: <FiberManualRecordIcon sx={{ color: '#bdbdbd', fontSize: 18, mr: 1 }} />, color: '#757575' },
  { value: 'Under Review', label: 'Under Review', icon: <HourglassEmptyIcon sx={{ color: '#ffa726', fontSize: 18, mr: 1 }} />, color: '#ffa726' },
  { value: 'Approved', label: 'Approved', icon: <TaskAltIcon sx={{ color: '#1976d2', fontSize: 18, mr: 1 }} />, color: '#1976d2' },
  { value: 'Completed', label: 'Completed', icon: <DoneAllIcon sx={{ color: '#43a047', fontSize: 18, mr: 1 }} />, color: '#43a047' },
  { value: 'Reimbursed', label: 'Reimbursed', icon: <MonetizationOnIcon sx={{ color: '#0288d1', fontSize: 18, mr: 1 }} />, color: '#0288d1' },
  { value: 'Rejected', label: 'Rejected', icon: <CancelIcon sx={{ color: '#e53935', fontSize: 18, mr: 1 }} />, color: '#e53935' },
];

const STATUS_CHIP_OPTIONS: Record<string, { color: any; icon: React.ReactNode }> = {
  'Draft': { color: 'default', icon: <FiberManualRecordIcon sx={{ color: '#bdbdbd', fontSize: 16, mr: 0.5 }} /> },
  'Under Review': { color: 'warning', icon: <HourglassEmptyIcon sx={{ color: '#ffa726', fontSize: 16, mr: 0.5 }} /> },
  'Approved': { color: 'primary', icon: <TaskAltIcon sx={{ color: '#1976d2', fontSize: 16, mr: 0.5 }} /> },
  'Completed': { color: 'success', icon: <DoneAllIcon sx={{ color: '#43a047', fontSize: 16, mr: 0.5 }} /> },
  'Reimbursed': { color: 'info', icon: <MonetizationOnIcon sx={{ color: '#0288d1', fontSize: 16, mr: 0.5 }} /> },
  'Rejected': { color: 'error', icon: <CancelIcon sx={{ color: '#e53935', fontSize: 16, mr: 0.5 }} /> },
};

const BusinessTripPage: React.FC = () => {
  const theme = useTheme();
  // --- State for form ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    employee: '',
    employeeRole: '',
    tripType: '',
    region: '',
    agendaFile: null as File | null,
    agendaFileName: '',
    departureDate: '',
    returnDate: '',
    requiresVisa: false,
    seminarFile: null as File | null,
    seminarFileName: '',
    cost: 0,
    flightClass: '',
    travelArrangedBy: '',
    costPaid: false,
    costPaymentDate: '',
    status: 'Draft',
    // Reset amortization fields
    costAmortization: false,
    amortizationPeriod: '',
    amortizationStartDate: '',
    amortizationEndDate: '',
    totalTripCost: 0,
    customPeriod: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- State for Dashboard Data ---
  const [dashboardTrips, setDashboardTrips] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalTrips: 0,
    pendingApprovals: 0,
    upcomingDepartures: 0,
    costPaidYTD: 0,
  });
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [apiError, setApiError] = useState('');

  // Add new state for hotel and flight quotes
  const [hotelQuotes, setHotelQuotes] = useState<File[]>([]);
  const [flightQuotes, setFlightQuotes] = useState<File[]>([]);

  // Add new state for receipts, claim sheet, finance approval
  const [receipts, setReceipts] = useState<{ file: File; type: string }[]>([]);
  const [claimSheet, setClaimSheet] = useState<File | null>(null);
  const [financeApproved, setFinanceApproved] = useState(false);
  const [financeComment, setFinanceComment] = useState('');

  // Add new state for approval comments
  const [approvalComments, setApprovalComments] = useState({
    manager: '',
    hr: '',
    dceo: '',
    gceo: '',
  });

  // Add new state for reporting & attachments
  const [postTripSummary, setPostTripSummary] = useState<File | null>(null);
  const [boardingPass, setBoardingPass] = useState<File | null>(null);
  const [signedClaimForm, setSignedClaimForm] = useState<File | null>(null);

  const APPROVAL_CHAIN = [
    { key: 'manager', label: 'Dept. Manager' },
    { key: 'hr', label: 'HR' },
    { key: 'dceo', label: 'DCEO' },
    { key: 'gceo', label: 'GCEO' },
  ];

  const handleApprovalCommentChange = (key: string, value: string) => {
    setApprovalComments(prev => ({ ...prev, [key]: value }));
  };

  const RECEIPT_TYPES = ['Visa', 'Taxi', 'Insurance', 'Meeting Costs'];

  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');
  const handleCalendarView = (_: any, newView: 'week' | 'month') => {
    if (newView) setCalendarView(newView);
  };

  // Add state for flight class simulator
  const [simRole, setSimRole] = useState('GM');
  const [simRegion, setSimRegion] = useState('GCC');
  const simFlightClass = getFlightClass(simRole, simRegion);
  const [showFlightClassSimulator, setShowFlightClassSimulator] = useState(false);

  // Trip Repetition Shortcut
  const repeatLastTrip = () => {
    const lastTrip = dashboardTrips.find(t => t.employee === form.employeeId);
    if (lastTrip) {
      setForm(f => ({
        ...f,
        tripType: lastTrip.tripType,
        region: lastTrip.region,
        departureDate: lastTrip.departureDate,
        returnDate: lastTrip.returnDate,
        cost: lastTrip.cost,
        flightClass: lastTrip.flightClass,
        travelArrangedBy: lastTrip.travelArrangedBy || '',
      }));
    }
  };

  // Compliance Alert System
  // Remove compliance alerts since smart suggestions are removed
  // const complianceAlerts: string[] = [];
  // if (flightQuotes.length < 2) complianceAlerts.push('Less than 2 flight quotes uploaded.');
  // if (form.tripType === 'Seminar' && !form.seminarFile) complianceAlerts.push('Seminar registration upload required.');
  // if (form.departureDate && !form.perDiemPaid) {
  //   const dep = new Date(form.departureDate);
  //   if (dep > new Date()) complianceAlerts.push('Per diem not marked as paid before departure.');
  // }

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setEmployees([]);
      setApiError('');
      try {
        const res = await api.get('/employees');
        if (res.data && typeof res.data === 'object' && 'employees' in res.data) {
          setEmployees(Array.isArray(res.data.employees) ? res.data.employees : []);
        } else if (Array.isArray(res.data)) {
          setEmployees(res.data);
        } else {
          setEmployees([]);
          setApiError('Unexpected response from server');
        }
      } catch (err: any) {
        setApiError(err.response?.data?.message || 'Failed to fetch employees');
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, []);

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

  // Calculate business trip costs for a period
  const calculateCostForPeriod = (startDate: Date, endDateExclusive: Date): number => {
    return dashboardTrips
      .filter(trip => {
        const tripDate = new Date(trip.departureDate);
        return tripDate >= startDate && tripDate < endDateExclusive;
      })
      .reduce((total, trip) => {
        // Calculate total trip cost
        const tripCost = trip.cost || 0;
        return total + tripCost;
      }, 0);
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

  async function fetchTrips() {
    setLoadingTrips(true);
    setApiError('');
    try {
      const res = await getBusinessTrips();
      const trips = res.data as any[];
      setDashboardTrips(trips);
      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const tripsThisMonth = trips.filter((t: any) => new Date(t.departureDate).getMonth() === thisMonth && new Date(t.departureDate).getFullYear() === thisYear);
      const pendingApprovals = trips.filter((t: any) => t.status === 'Under Review' || t.status === 'Pending').length;
      const upcomingDepartures = trips.filter((t: any) => new Date(t.departureDate) > now).length;
      const costPaidYTD = trips.filter((t: any) => t.costPaid && new Date(t.departureDate).getFullYear() === thisYear).reduce((sum: number, t: any) => sum + (t.cost || 0), 0);
      setDashboardStats({
        totalTrips: tripsThisMonth.length,
        pendingApprovals,
        upcomingDepartures,
        costPaidYTD,
      });
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch business trips');
    } finally {
      setLoadingTrips(false);
    }
  }

  // --- Handle employee select ---
  const handleEmployeeChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    const emp = employees.find((emp: any) => emp._id === value);
    setForm(f => ({
      ...f,
      employeeId: value,
      employee: emp?.name || '', // <-- set employee name
      employeeRole: emp?.position || '',
    }));
  };

  // --- Handle trip type, region, etc. ---
  const handleChange = (e: React.ChangeEvent<any>) => {
    // MUI TextField/Select: e.target.name, e.target.value, e.target.type, e.target.checked
    const target = e.target;
    const name = target.name as string;
    if (!name) return;
    if (target.type === 'checkbox') {
      setForm(f => ({ ...f, [name]: target.checked }));
    } else {
      setForm(f => ({ ...f, [name]: target.value }));
    }
  };

  // --- Handle file uploads ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setForm(f => ({
        ...f,
        [name]: files[0],
        [`${name}Name`]: files[0].name,
      }));
    }
  };

  // Helper functions for quote uploads
  const handleHotelQuoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHotelQuotes(prev => [...prev, e.target.files![0]]);
    }
  };
  const handleFlightQuoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFlightQuotes(prev => [...prev, e.target.files![0]]);
    }
  };
  const removeHotelQuote = (idx: number) => setHotelQuotes(prev => prev.filter((_, i) => i !== idx));
  const removeFlightQuote = (idx: number) => setFlightQuotes(prev => prev.filter((_, i) => i !== idx));

  // Helper functions for receipt uploads
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setReceipts(prev => [...prev, { file: e.target.files![0], type }]);
    }
  };
  const removeReceipt = (idx: number) => setReceipts(prev => prev.filter((_, i) => i !== idx));
  const handleClaimSheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setClaimSheet(e.target.files[0]);
    }
  };

  // Helper functions for attachment uploads
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };
  const removeAttachment = (setter: (f: File | null) => void) => setter(null);

  // --- Dynamic logic for flight class ---
  useEffect(() => {
    if (form.employeeRole && form.region) {
      const flightClass = getFlightClass(form.employeeRole, form.region);
      setForm(f => ({
        ...f,
        flightClass,
      }));
    }
  }, [form.employeeRole, form.region]);

  // --- Visa logic ---
  useEffect(() => {
    if (["Europe", "America"].includes(form.region)) {
      setForm(f => ({ ...f, requiresVisa: true }));
    }
  }, [form.region]);

  // --- Validation ---
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!form.employeeId) newErrors.employeeId = 'Employee is required';
    if (!form.tripType) newErrors.tripType = 'Trip type is required';
    if (!form.region) newErrors.region = 'Destination region is required';
    if (!form.departureDate) newErrors.departureDate = 'Departure date is required';
    if (!form.returnDate) newErrors.returnDate = 'Return date is required';
    if (form.tripType === 'Seminar' && !form.seminarFile) newErrors.seminarFile = 'Seminar registration upload required';
    setErrors(newErrors);
  }, [form]);

  // --- Handle form submit for creating a new business trip ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    setSubmitting(true);
    console.log('Submitting trip', form);
    try {
      const formData = new FormData();
      formData.append('employee', form.employeeId); // Changed from employeeId to employee
      formData.append('tripType', form.tripType);
      formData.append('region', form.region);
      formData.append('departureDate', form.departureDate);
      formData.append('returnDate', form.returnDate);
      formData.append('requiresVisa', form.requiresVisa.toString());
      formData.append('cost', form.cost.toString());
      formData.append('flightClass', form.flightClass);
      formData.append('travelArrangedBy', form.travelArrangedBy);
      formData.append('costPaid', form.costPaid.toString());
      if (form.costPaid && form.costPaymentDate) {
        formData.append('costPaymentDate', form.costPaymentDate);
      }
      formData.append('status', form.status);
      
      // Add amortization fields
      formData.append('costAmortization', form.costAmortization.toString());
      if (form.costAmortization) {
        formData.append('totalTripCost', form.totalTripCost.toString());
        formData.append('amortizationPeriod', form.amortizationPeriod);
        if (form.amortizationPeriod === 'custom' && form.customPeriod) {
          formData.append('customPeriod', form.customPeriod.toString());
        }
        if (form.amortizationStartDate) {
          formData.append('amortizationStartDate', form.amortizationStartDate);
        }
        if (form.amortizationEndDate) {
          formData.append('amortizationEndDate', form.amortizationEndDate);
        }
      }
      hotelQuotes.forEach((file, idx) => formData.append(`hotelQuotes`, file));
      flightQuotes.forEach((file, idx) => formData.append(`flightQuotes`, file));
      receipts.forEach((r, idx) => {
        formData.append(`receipts`, r.file);
        formData.append(`receiptTypes`, r.type);
      });
      if (claimSheet) formData.append('claimSheet', claimSheet);
      formData.append('financeApproval', financeApproved ? 'approved' : 'pending');
      formData.append('financeComments', financeComment);
      formData.append('approvalComments', JSON.stringify(approvalComments));
      if (postTripSummary) formData.append('postTripSummary', postTripSummary);
      if (boardingPass) formData.append('boardingPass', boardingPass);
      if (signedClaimForm) formData.append('signedClaimForm', signedClaimForm);
      if (editingTripId) {
        await updateBusinessTrip(editingTripId, formData);
      } else {
        await createBusinessTrip(formData);
      }
      await fetchTrips();
      setOpenDialog(false);
      setEditingTripId(null);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit business trip');
    } finally {
      setSubmitting(false);
    }
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Add this helper function near the top of the component:
  function getEmployeeName(employeeId: string) {
    const emp = employees.find((e: any) => e._id === employeeId);
    return emp ? emp.name : '';
  }

  // Add new state for country, airport/city, purpose, arrangementType, and agent fields
  const [details, setDetails] = useState({
    country: '',
    airportOrCity: '',
    purpose: '',
  });
  const [arrangementType, setArrangementType] = useState('Self Reserved');
  const [agent, setAgent] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landline: '',
  });

  // Add new state for search/filter
  const [search, setSearch] = useState('');
  // Add quick filter state
  const [statusFilter, setStatusFilter] = useState('');
  // Add employee and date filter state
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filtered trips
  const filteredTrips = dashboardTrips.filter(trip =>
    (statusFilter ? trip.status === statusFilter : true) &&
    (employeeFilter ? trip.employeeId === employeeFilter : true) &&
    (dateFilter ? (trip.departureDate && trip.departureDate.startsWith(dateFilter)) : true)
  );

  // 1. Add state for stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Trip Details',
    'Arrangements',
    'Cost Management',
    'Expenses',
    'Approvals',
    'Attachments',
    'Review & Submit',
  ];

  function handleNext() {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  }
  function handleBack() {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }
  function handleStepSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeStep < steps.length - 1) {
      handleNext();
    } else {
      handleSubmit(e);
    }
  }

  // --- Handle Edit Trip ---
  const handleEditTrip = (trip: any) => {
    setEditingTripId(trip._id);
    setForm({
      employeeId: trip.employeeId || '',
      employee: trip.employee || '', // <-- set employee name
      employeeRole: trip.employeeRole || '',
      tripType: trip.tripType || '',
      region: trip.region || '',
      agendaFile: null,
      agendaFileName: trip.agendaFileName || '',
      departureDate: trip.departureDate || '',
      returnDate: trip.returnDate || '',
      requiresVisa: trip.requiresVisa || false,
      seminarFile: null,
      seminarFileName: trip.seminarFileName || '',
      cost: trip.cost || 0,
      flightClass: trip.flightClass || '',
      travelArrangedBy: trip.travelArrangedBy || '',
      costPaid: trip.costPaid || false,
      costPaymentDate: trip.costPaymentDate || '',
      status: trip.status || 'Draft',
      // Set amortization fields from trip data
      costAmortization: trip.costAmortization || false,
      amortizationPeriod: trip.amortizationPeriod || '',
      amortizationStartDate: trip.amortizationStartDate || '',
      amortizationEndDate: trip.amortizationEndDate || '',
      totalTripCost: trip.totalTripCost || 0,
      customPeriod: trip.customPeriod || '',
    });
    // Set other related state as needed (details, arrangementType, agent, etc.)
    setOpenDialog(true);
  };

  // --- Handle Delete Trip ---
  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this business trip?')) {
      try {
        await deleteBusinessTrip(tripId);
        await fetchTrips();
        setApiError('Trip deleted successfully.');
      } catch (err: any) {
        setApiError(err.message || 'Failed to delete trip');
      }
    }
  };

  // --- Render ---
  // Helper to map statusColor to a valid palette key (must be inside component to access theme)
  function getPaletteColor(statusColor: string): keyof typeof theme.palette {
    if (statusColor === 'default') return 'grey';
    return statusColor as keyof typeof theme.palette;
  }
  const navigate = useNavigate();
  // Move these above the render/return so they are in scope
  const completedCount = dashboardTrips.filter((t: any) => t.status === 'Completed').length;
  const approvedCount = dashboardTrips.filter((t: any) => t.status === 'Approved').length;

  // Add this helper function inside the component, before the return:
  function getStatusIcon(status: string): React.ReactElement {
    const icon = STATUS_CHIP_OPTIONS[status as keyof typeof STATUS_CHIP_OPTIONS]?.icon;
    if (React.isValidElement(icon)) return icon;
    return <FiberManualRecordIcon sx={{ color: '#bdbdbd', fontSize: 16, mr: 0.5 }} />;
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: theme.shape.borderRadius,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 64, 
                      height: 64,
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <LuggageIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      ✈️ Business Trip Management
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      Comprehensive travel planning and expense management system
                    </Typography>
                  </Box>
                </Box>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => setOpenDialog(true)}
                    size="large"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '2px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 25px rgba(0,0,0,0.3)'
                      }
                    }}
                    startIcon={<AssignmentIcon sx={{ fontSize: 24 }} />}
                  >
                    New Trip Request
                  </Button>
                </motion.div>
              </Box>
              
              {/* Enhanced Stats Row */}
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Trips', value: dashboardStats.totalTrips, icon: <GroupIcon /> },
                  { label: 'Pending', value: dashboardStats.pendingApprovals, icon: <HourglassEmptyIcon /> },
                  { label: 'Completed', value: completedCount, icon: <DoneAllIcon /> },
                  { label: 'Cost YTD', value: dashboardStats.costPaidYTD.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }), icon: <MonetizationOnIcon /> }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                        {stat.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
            
            {/* Enhanced decorative background elements */}
            <Box sx={{ 
              position: 'absolute', 
              top: -80, 
              right: -80, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1,
              animation: 'float 6s ease-in-out infinite'
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -60, 
              left: -60, 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.08)',
              zIndex: 1,
              animation: 'float 8s ease-in-out infinite reverse'
            }} />
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              right: '20%', 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.05)',
              zIndex: 1,
              animation: 'float 10s ease-in-out infinite'
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
                title: 'Total Trips',
                value: dashboardStats.totalTrips,
                icon: <GroupIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Pending Approvals',
                value: dashboardStats.pendingApprovals,
                icon: <HourglassEmptyIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Completed',
                value: completedCount,
                icon: <DoneAllIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Approved',
                value: approvedCount,
                icon: <TaskAltIcon />,
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

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                <SearchIcon />
              </Avatar>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                🔍 Search & Filters
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <TextField 
                  label="Search trips..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search by employee, destination, or trip type..."
                  sx={{ 
                    minWidth: 350,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': { background: alpha(theme.palette.background.paper, 0.9) }
                    }
                  }}
                  size="medium"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                />
              </motion.div>
              
              {/* Enhanced Quick filter bar */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {[
                  { value: '', label: 'All Status', icon: <CheckCircleIcon /> },
                  ...Object.entries(STATUS_CHIP_OPTIONS).map(([status, config]) => ({
                    value: status,
                    label: status,
                    icon: config.icon,
                    color: config.color
                  }))
                ].map((filter, index) => (
                  <motion.div
                    key={filter.value}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                  >
                    <Button 
                      size="medium" 
                      variant={statusFilter === filter.value ? 'contained' : 'outlined'} 
                      onClick={() => setStatusFilter(filter.value)}
                      startIcon={filter.icon}
                      sx={{ 
                        borderRadius: 3, 
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        boxShadow: statusFilter === filter.value ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                        }
                      }}
                    >
                      {filter.label}
                    </Button>
                  </motion.div>
                ))}
              </Box>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                <TextField
                  select
                  size="medium"
                  label="Employee"
                  value={employeeFilter}
                  onChange={e => setEmployeeFilter(e.target.value)}
                  sx={{ 
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.8)
                    }
                  }}
                  InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> }}
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((emp: any) => (
                    <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                  ))}
                </TextField>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.3 }}
              >
                <TextField
                  type="month"
                  size="medium"
                  label="Departure Month"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  sx={{ 
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: alpha(theme.palette.background.paper, 0.8)
                    }
                  }}
                  InputProps={{ startAdornment: <DateRangeIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> }}
                />
              </motion.div>
            </Box>
          </Paper>
        </motion.div>

        {/* Enhanced Trips Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              overflowX: 'auto',
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                <AssignmentIcon />
              </Avatar>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                📊 Business Trips Overview
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${filteredTrips.length} trips`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`${dashboardStats.totalTrips} this month`} 
                  color="success" 
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
            
            {loadingTrips ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
                </motion.div>
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      '& .MuiTableCell-head': {
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: theme.palette.primary.main,
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }
                    }}>
                      <TableCell>👤 Employee</TableCell>
                      <TableCell>✈️ Trip Type</TableCell>
                      <TableCell>🌍 Region</TableCell>
                      <TableCell>📅 Departure</TableCell>
                      <TableCell>📅 Return</TableCell>
                      <TableCell>💰 Cost</TableCell>
                      <TableCell>🛫 Flight Class</TableCell>
                      <TableCell>📊 Status</TableCell>
                      <TableCell>📈 Amortization</TableCell>
                      <TableCell align="right">⚙️ Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTrips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Box sx={{ textAlign: 'center' }}>
                              <Avatar sx={{ 
                                bgcolor: alpha(theme.palette.grey[400], 0.2), 
                                width: 80, 
                                height: 80, 
                                mx: 'auto', 
                                mb: 2 
                              }}>
                                <AssignmentIcon sx={{ fontSize: 40, color: theme.palette.grey[400] }} />
                              </Avatar>
                              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                                No trips found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Try adjusting your search criteria or create a new trip
                              </Typography>
                            </Box>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTrips.map((trip, idx) => (
                        <motion.tr
                          key={trip._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.03 * idx }}
                          whileHover={{ 
                            scale: 1.005, 
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                          }}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: theme.palette.primary.main, 
                                fontWeight: 700,
                                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                              }}>
                                {trip.employeeName ? trip.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                                  {trip.employeeName || '-'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  {trip.employeeRole || ''}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={trip.tripType} 
                              size="small" 
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 2,
                                background: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {trip.region}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {trip.departureDate ? new Date(trip.departureDate).toLocaleDateString() : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {trip.returnDate ? new Date(trip.returnDate).toLocaleDateString() : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 700, 
                              color: theme.palette.success.main,
                              background: alpha(theme.palette.success.main, 0.1),
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              display: 'inline-block'
                            }}>
                              {trip.cost ? trip.cost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '0'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={trip.flightClass} 
                              size="small" 
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 2,
                                background: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={trip.status}
                              color={STATUS_CHIP_OPTIONS[trip.status as keyof typeof STATUS_CHIP_OPTIONS]?.color || 'default'}
                              icon={getStatusIcon(trip.status)}
                              sx={{ 
                                fontWeight: 700, 
                                borderRadius: 3, 
                                px: 2,
                                py: 0.5,
                                boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={trip.costAmortization ? 'Yes' : 'No'} 
                              size="small" 
                              color={trip.costAmortization ? 'success' : 'default'}
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 2
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                              <Tooltip title="View Trip Details">
                                <IconButton 
                                  color="primary" 
                                  onClick={() => navigate(`/business-trips/${trip._id}`)}
                                  sx={{ 
                                    '&:hover': { 
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Trip">
                                <IconButton 
                                  color="success" 
                                  onClick={() => handleEditTrip(trip)}
                                  sx={{ 
                                    '&:hover': { 
                                      bgcolor: alpha(theme.palette.success.main, 0.1),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Trip">
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleDeleteTrip(trip._id)}
                                  sx={{ 
                                    '&:hover': { 
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
          </Paper>
        </motion.div>

        {/* Trip Cards View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center' }}>
            {dashboardTrips.map((trip, idx) => (
              <motion.div
                key={trip._id || idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card sx={{ 
                  minWidth: 320, 
                  maxWidth: 400, 
                  borderRadius: 4, 
                  boxShadow: 6, 
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(8px)', 
                  border: `1px solid ${alpha(theme.palette.primary.light, 0.15)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[12]
                  }
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <FlightTakeoffIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                      <Typography variant="h6" fontWeight={700}>{getEmployeeName(trip.employee)}</Typography>
                      <Chip
                        label={trip.status}
                        color={getStatusColor(trip.status)}
                        size="small"
                        icon={trip.status === 'Approved' ? <TaskAltIcon sx={{ color: '#1976d2', fontSize: 16, mr: 0.5 }} /> : undefined}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">Type: <b>{trip.tripType}</b></Typography>
                    <Typography variant="body2" color="text.secondary">Region: <b>{trip.region}</b></Typography>
                    <Typography variant="body2" color="text.secondary">Country: <b>{trip.country || '-'}</b></Typography>
                    <Typography variant="body2" color="text.secondary">Airport/City: <b>{trip.airportOrCity || '-'}</b></Typography>
                    <Typography variant="body2" color="text.secondary">Departure: <b>{trip.departureDate}</b></Typography>
                    <Typography variant="body2" color="text.secondary">Return: <b>{trip.returnDate}</b></Typography>
                    <Typography variant="body2" color="text.secondary">Cost: <b>{trip.cost ? trip.cost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '0'}</b></Typography>
                  </CardContent>
                  <Box display="flex" justifyContent="flex-end" gap={1} p={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEditTrip(trip)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small" 
                      onClick={() => navigate(`/business-trips/${trip._id}`)}
                    >
                      View Trip
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Enhanced Cost Analysis Dashboard with P&L Integration */}
        <CostAnalysisDashboard
          title="Business Trip Cost Analysis by Time Periods"
          subtitle="Total business trip costs across different time periods based on trip departure dates. Costs include trip expenses and total trip costs for each business trip."
          emoji="✈️"
          module="businessTrip"
          records={dashboardTrips}
          dateField="departureDate"
          costField="cost"
          loading={loadingTrips}
          enablePnLIntegration={false}
          onDataChange={useCallback((data: any) => {
            console.log('Business Trip cost data changed:', data);
            // Additional handling if needed
          }, [])}
        />
      </AnimatePresence>

      {/* Enhanced Trip Request Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
            maxHeight: '90vh',
            overflow: 'hidden'
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
              <FlightTakeoffIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                New Business Trip Request
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Create comprehensive travel request with approval workflow
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
        
        <DialogContent sx={{ mt: 2, p: 4, overflow: 'auto', maxHeight: '70vh' }}>
          <Box sx={{ mb: 4 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                '& .MuiStepLabel-root': {
                  '& .MuiStepLabel-label': {
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }
                }
              }}
            >
              {steps.map((label, idx) => (
                <Step key={label}>
                  <StepLabel
                    icon={
                      <Avatar sx={{ 
                        bgcolor: activeStep >= idx ? theme.palette.primary.main : alpha(theme.palette.grey[400], 0.3),
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem'
                      }}>
                        {idx === 0 ? <PersonIcon sx={{ fontSize: 18 }} /> :
                         idx === 1 ? <AssignmentIcon sx={{ fontSize: 18 }} /> :
                         idx === 2 ? <MonetizationOnIcon sx={{ fontSize: 18 }} /> :
                         idx === 3 ? <PublicIcon sx={{ fontSize: 18 }} /> :
                         idx === 4 ? <TaskAltIcon sx={{ fontSize: 18 }} /> :
                         idx === 5 ? <EventIcon sx={{ fontSize: 18 }} /> :
                         <FiberManualRecordIcon sx={{ fontSize: 18 }} />}
                      </Avatar>
                    }
                  >
                    <span style={{ fontWeight: 700, color: activeStep >= idx ? theme.palette.primary.main : theme.palette.text.secondary }}>
                      {label}
                    </span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <Box component="form" onSubmit={handleStepSubmit} sx={{ mt: 2 }}>
              {/* Step 1: Trip Details */}
              {activeStep === 0 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Enter the core details of your business trip.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        select
                        label="Employee"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleEmployeeChange}
                        fullWidth
                        required
                        error={!!errors.employeeId}
                        helperText={errors.employeeId}
                        disabled={loadingEmployees}
                        aria-label="Select employee"
                        aria-required="true"
                        InputProps={{
                          startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />,
                          sx: { transition: 'box-shadow 0.2s', boxShadow: errors.employeeId ? '0 0 0 2px #e53935' : undefined }
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 3, 
                            background: alpha(theme.palette.background.paper, 0.8), 
                            '&:hover': { 
                              background: alpha(theme.palette.background.paper, 0.9),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          } 
                        }}
                      >
                        <MenuItem value="" aria-label="Select employee">Select employee...</MenuItem>
                        {employees.map((emp: any) => (
                          <MenuItem key={emp._id} value={emp._id} aria-label={`Select ${emp.name}`}>
                            {emp.name} ({emp.position}, {emp.department})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    {/* Read-only fields for Employee ID and Role */}
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Employee ID"
                        value={form.employeeId}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Employee Role"
                        value={form.employeeRole}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        select
                        label="Trip Type"
                        name="tripType"
                        value={form.tripType}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.tripType}
                        helperText={errors.tripType}
                        aria-label="Select trip type"
                        aria-required="true"
                        InputProps={{ startAdornment: <CategoryIcon color="primary" sx={{ mr: 1 }} /> }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 3, 
                            background: alpha(theme.palette.background.paper, 0.8), 
                            '&:hover': { 
                              background: alpha(theme.palette.background.paper, 0.9),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          } 
                        }}
                      >
                        <MenuItem value="" aria-label="Select type">Select type...</MenuItem>
                        {TRIP_TYPES.map(type => <MenuItem key={type} value={type} aria-label={`Select ${type}`}>{type}</MenuItem>)}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        select
                        label="Destination Region"
                        name="region"
                        value={form.region}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.region}
                        helperText={errors.region}
                        aria-label="Select destination region"
                        aria-required="true"
                        InputProps={{ startAdornment: <PublicIcon color="primary" sx={{ mr: 1 }} /> }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 3, 
                            background: alpha(theme.palette.background.paper, 0.8), 
                            '&:hover': { 
                              background: alpha(theme.palette.background.paper, 0.9),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          } 
                        }}
                      >
                        <MenuItem value="" aria-label="Select region">Select region...</MenuItem>
                        {REGIONS.map(region => <MenuItem key={region} value={region} aria-label={`Select ${region}`}>{region}</MenuItem>)}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Country of Destination"
                        name="country"
                        value={details.country}
                        onChange={e => setDetails(d => ({ ...d, country: e.target.value }))}
                        fullWidth
                        required
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Destination Airport or City"
                        name="airportOrCity"
                        value={details.airportOrCity}
                        onChange={e => setDetails(d => ({ ...d, airportOrCity: e.target.value }))}
                        fullWidth
                        required
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Purpose & Agenda"
                        name="purpose"
                        value={details.purpose}
                        onChange={e => setDetails(d => ({ ...d, purpose: e.target.value }))}
                        fullWidth
                        required
                        multiline
                        minRows={2}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Purpose & Agenda"
                        name="agendaFile"
                        type="file"
                        onChange={handleFileChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        aria-label="Upload agenda file"
                      />
                      {form.agendaFileName && <Typography variant="caption" color="text.secondary">{form.agendaFileName}</Typography>}
                      {errors.agendaFile && <Typography variant="caption" color="error.main">{errors.agendaFile}</Typography>}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Departure Date"
                        name="departureDate"
                        type="date"
                        value={form.departureDate}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.departureDate}
                        helperText={errors.departureDate}
                        aria-label="Select departure date"
                        aria-required="true"
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Return Date"
                        name="returnDate"
                        type="date"
                        value={form.returnDate}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.returnDate}
                        helperText={errors.returnDate}
                        aria-label="Select return date"
                        aria-required="true"
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <input
                        type="checkbox"
                        name="requiresVisa"
                        checked={form.requiresVisa}
                        onChange={handleChange}
                        id="visa-toggle"
                        aria-label="Requires visa"
                      />
                      <label htmlFor="visa-toggle" style={{ fontSize: 14 }}>Requires Visa</label>
                    </Box>
                    {form.tripType === 'Seminar' && (
                      <Box sx={{ flex: 1, minWidth: 250 }}>
                        <TextField
                          label="Seminar Registration"
                          name="seminarFile"
                          type="file"
                          onChange={handleFileChange}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          aria-label="Upload seminar registration file"
                        />
                        {form.seminarFileName && <Typography variant="caption" color="text.secondary">{form.seminarFileName}</Typography>}
                        {errors.seminarFile && <Typography variant="caption" color="error.main">{errors.seminarFile}</Typography>}
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        select
                        label="Status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        fullWidth
                        required
                        aria-label="Select status"
                        aria-required="true"
                        InputProps={{ startAdornment: <TaskAltIcon color="primary" sx={{ mr: 1 }} /> }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 3, 
                            background: alpha(theme.palette.background.paper, 0.8), 
                            '&:hover': { 
                              background: alpha(theme.palette.background.paper, 0.9),
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          } 
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ color: opt.color, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            {opt.icon}
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 250, display: 'flex', gap: 4, alignItems: 'center', mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Flight Class</Typography>
                        <Typography variant="h6" color="primary">{form.flightClass}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  {/* The Flight & Hotel Arrangement section is moved to Step 2 */}
                </>
              )}
              {/* Step 2: Arrangements */}
              {activeStep === 1 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Arrange your travel and accommodation.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <TextField
                        select
                        label="Arrangement Type"
                        name="arrangementType"
                        value={arrangementType}
                        onChange={e => setArrangementType(e.target.value)}
                        fullWidth
                        required
                      >
                        <MenuItem value="Self Reserved">Self Reserved</MenuItem>
                        <MenuItem value="Agent">Agent</MenuItem>
                      </TextField>
                    </Box>
                    {arrangementType === 'Agent' && (
                      <>
                        <Box sx={{ flex: 1, minWidth: 220 }}>
                          <TextField label="Agent Name" value={agent.name} onChange={e => setAgent(a => ({ ...a, name: e.target.value }))} fullWidth required />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 220 }}>
                          <TextField label="Agent Phone" value={agent.phone} onChange={e => setAgent(a => ({ ...a, phone: e.target.value }))} fullWidth required />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 220 }}>
                          <TextField label="Agent Email" value={agent.email} onChange={e => setAgent(a => ({ ...a, email: e.target.value }))} fullWidth required />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 220 }}>
                          <TextField label="Agent Address" value={agent.address} onChange={e => setAgent(a => ({ ...a, address: e.target.value }))} fullWidth required />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 220 }}>
                          <TextField label="Agent Landline Phone" value={agent.landline} onChange={e => setAgent(a => ({ ...a, landline: e.target.value }))} fullWidth required />
                        </Box>
                      </>
                    )}
                  </Box>
                  <Box sx={{ width: '100%', mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, boxShadow: 0 }}>
                    <Typography variant="h6" color="primary" gutterBottom>Flight & Hotel Arrangement</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <TextField
                          select
                          label="Travel Arranged By"
                          name="travelArrangedBy"
                          value={form.travelArrangedBy}
                          onChange={handleChange}
                          fullWidth
                          required
                          aria-label="Select travel arranged by"
                          aria-required="true"
                        >
                          <MenuItem value="" aria-label="Select travel arranged by">Select...</MenuItem>
                          <MenuItem value="Admin Assistant" aria-label="Select Admin Assistant">Admin Assistant</MenuItem>
                          <MenuItem value="Dept. Secretary" aria-label="Select Dept. Secretary">Dept. Secretary</MenuItem>
                        </TextField>
                      </Box>
                      <Box sx={{ flex: 2, minWidth: 220 }}>
                        <Typography variant="body2" color="text.secondary">
                          Hotel Budget Guidance: {form.region ? (
                            form.region === 'GCC' ? 'Max KD 80/night' :
                            form.region === 'MENA' ? 'Max KD 60/night' :
                            form.region === 'Europe' ? 'Max KD 120/night' :
                            form.region === 'America' ? 'Max KD 150/night' :
                            form.region === 'Asia' ? 'Max KD 70/night' :
                            'N/A') : 'Select region to view guidance.'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="subtitle2">Hotel Quotes</Typography>
                        <Button variant="outlined" component="label" size="small" sx={{ mt: 1, mb: 1 }}>
                          Upload Hotel Quote
                          <input type="file" hidden onChange={handleHotelQuoteUpload} />
                        </Button>
                        <Box>
                          {hotelQuotes.map((file, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Typography variant="body2">{file.name}</Typography>
                              <Button size="small" color="error" onClick={() => removeHotelQuote(idx)}>Remove</Button>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="subtitle2">Flight Quotes</Typography>
                        <Button variant="outlined" component="label" size="small" sx={{ mt: 1, mb: 1 }}>
                          Upload Flight Quote
                          <input type="file" hidden onChange={handleFlightQuoteUpload} />
                        </Button>
                        <Box>
                          {flightQuotes.map((file, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Typography variant="body2">{file.name}</Typography>
                              <Button size="small" color="error" onClick={() => removeFlightQuote(idx)}>Remove</Button>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              {/* Step 3: Cost Management */}
              {activeStep === 2 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Enter and confirm your trip cost.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <TextField
                        label="Trip Cost (KD)"
                        name="cost"
                        type="number"
                        value={form.cost}
                        onChange={handleChange}
                        fullWidth
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                        aria-label="Enter trip cost"
                        aria-required="true"
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="costPaid"
                            checked={form.costPaid}
                            onChange={handleChange}
                            aria-label="Is cost paid"
                          />
                        }
                        label="Cost Paid?"
                      />
                    </Box>
                    {form.costPaid && (
                      <Box sx={{ flex: '1', minWidth: 220 }}>
                        <TextField
                          label="Payment Date"
                          name="costPaymentDate"
                          type="date"
                          value={form.costPaymentDate}
                          onChange={handleChange}
                          fullWidth
                          required
                          InputLabelProps={{ shrink: true }}
                          aria-label="Select cost payment date"
                          aria-required="true"
                        />
                      </Box>
                    )}
                  </Box>
                  
                  {/* Cost Amortization Section */}
                  <Box sx={{ width: '100%', mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="h6" color="primary" gutterBottom>Cost Amortization</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Choose how to amortize the total trip cost over time
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="costAmortization"
                            checked={form.costAmortization}
                            onChange={handleChange}
                            aria-label="Enable cost amortization"
                          />
                        }
                        label="Enable Cost Amortization"
                      />
                    </Box>
                    
                    {form.costAmortization && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <TextField
                          label="Total Trip Cost (KD)"
                          name="totalTripCost"
                          type="number"
                          value={form.totalTripCost}
                          onChange={handleChange}
                          fullWidth
                          sx={{ minWidth: 200 }}
                          inputProps={{ min: 0, step: 0.01 }}
                          aria-label="Enter total trip cost"
                        />
                        
                        <TextField
                          select
                          label="Amortization Period"
                          name="amortizationPeriod"
                          value={form.amortizationPeriod}
                          onChange={handleChange}
                          fullWidth
                          sx={{ minWidth: 200 }}
                          aria-label="Select amortization period"
                        >
                          <MenuItem value="">Select Period</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly</MenuItem>
                          <MenuItem value="semi_annually">Semi-Annually</MenuItem>
                          <MenuItem value="annually">Annually</MenuItem>
                          <MenuItem value="custom">Custom Period</MenuItem>
                        </TextField>
                        
                        {form.amortizationPeriod === 'custom' && (
                          <>
                            <TextField
                              label="Custom Period (months)"
                              name="customPeriod"
                              type="number"
                              value={form.customPeriod || ''}
                              onChange={handleChange}
                              sx={{ minWidth: 200 }}
                              inputProps={{ min: 1, max: 120 }}
                              aria-label="Enter custom period in months"
                            />
                          </>
                        )}
                        
                        <TextField
                          label="Amortization Start Date"
                          name="amortizationStartDate"
                          type="date"
                          value={form.amortizationStartDate}
                          onChange={handleChange}
                          fullWidth
                          sx={{ minWidth: 200 }}
                          InputLabelProps={{ shrink: true }}
                          aria-label="Select amortization start date"
                        />
                        
                        <TextField
                          label="Amortization End Date"
                          name="amortizationEndDate"
                          type="date"
                          value={form.amortizationEndDate}
                          onChange={handleChange}
                          fullWidth
                          sx={{ minWidth: 200 }}
                          InputLabelProps={{ shrink: true }}
                          aria-label="Select amortization end date"
                        />
                      </Box>
                    )}
                    
                    {/* Amortization Preview */}
                    {form.costAmortization && form.totalTripCost && form.amortizationPeriod && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Amortization Preview</Typography>
                        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Total Cost</Typography>
                            <Typography variant="h6" color="primary">KD {form.totalTripCost}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Period</Typography>
                            <Typography variant="h6" color="primary">{form.amortizationPeriod}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Monthly Amount</Typography>
                            <Typography variant="h6" color="success.main">
                              KD {form.totalTripCost > 0 ? (form.totalTripCost / 12).toFixed(2) : '0.00'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              )}
              {/* Step 4: Expenses */}
              {activeStep === 3 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Upload and review your reimbursable expenses.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Upload Receipts</Typography>
                      {RECEIPT_TYPES.map(type => (
                        <Box key={type} sx={{ mb: 1 }}>
                          <Button variant="outlined" component="label" size="small">
                            Upload {type} Receipt
                            <input type="file" hidden onChange={e => handleReceiptUpload(e, type)} />
                          </Button>
                        </Box>
                      ))}
                      <Box>
                        {receipts.map((r, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="body2">{r.file.name} ({r.type})</Typography>
                            <Button size="small" color="error" onClick={() => removeReceipt(idx)}>Remove</Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Claim Sheet</Typography>
                      <Button variant="outlined" component="label" size="small" sx={{ mt: 1, mb: 1 }}>
                        Upload Claim Sheet
                        <input type="file" hidden onChange={handleClaimSheetUpload} />
                      </Button>
                      {claimSheet && <Typography variant="body2">{claimSheet.name}</Typography>}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <FormControlLabel
                        control={<Checkbox checked={financeApproved} onChange={e => setFinanceApproved(e.target.checked)} aria-label="Is finance approved" />}
                        label="Finance Approved"
                      />
                      <TextField
                        label="Finance Comment"
                        value={financeComment}
                        onChange={e => setFinanceComment(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={{ mt: 1 }}
                        aria-label="Enter finance comment"
                      />
                    </Box>
                  </Box>
                </>
              )}
              {/* Step 5: Approvals */}
              {activeStep === 4 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Approval workflow and comments.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {APPROVAL_CHAIN.map((stage) => (
                      <Box key={stage.key} sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="subtitle2">{stage.label}</Typography>
                        <Chip label="Pending" color="warning" size="small" sx={{ mb: 1, mt: 1 }} aria-label="Approval pending" />
                        <Typography variant="caption" color="text.secondary">Timestamp: --</Typography>
                        <TextField
                          label="Comment / Feedback"
                          value={approvalComments[stage.key as keyof typeof approvalComments]}
                          onChange={e => handleApprovalCommentChange(stage.key, e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                          sx={{ mt: 1 }}
                          aria-label="Enter approval comment"
                        />
                      </Box>
                    ))}
                  </Box>
                </>
              )}
              {/* Step 6: Attachments */}
              {activeStep === 5 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Upload post-trip summary and required documents.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Post-Trip Summary</Typography>
                      <Button variant="outlined" component="label" size="small" sx={{ mt: 1, mb: 1 }}>
                        Upload Summary
                        <input type="file" hidden onChange={e => handleAttachmentUpload(e, setPostTripSummary)} />
                      </Button>
                      {postTripSummary && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{postTripSummary.name}</Typography>
                          <Button size="small" color="error" onClick={() => removeAttachment(setPostTripSummary)}>Remove</Button>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Boarding Pass</Typography>
                      <Button variant="outlined" component="label" size="small" sx={{ mt: 1, mb: 1 }}>
                        Upload Boarding Pass
                        <input type="file" hidden onChange={e => handleAttachmentUpload(e, setBoardingPass)} />
                      </Button>
                      {boardingPass && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{boardingPass.name}</Typography>
                          <Button size="small" color="error" onClick={() => removeAttachment(setBoardingPass)}>Remove</Button>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Signed Claim Form</Typography>
                      <Button variant="outlined" component="label" size="small" sx={{ mt: 1, mb: 1 }}>
                        Upload Signed Claim
                        <input type="file" hidden onChange={e => handleAttachmentUpload(e, setSignedClaimForm)} />
                      </Button>
                      {signedClaimForm && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{signedClaimForm.name}</Typography>
                          <Button size="small" color="error" onClick={() => removeAttachment(setSignedClaimForm)}>Remove</Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {/* Archive Table - Will be populated with real data when available */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachment Archive</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Trip ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Attachment</TableCell>
                            <TableCell>File Name</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Real attachment data will be populated here */}
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No attachments found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}
              {/* Step 7: Review & Submit */}
              {activeStep === 6 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Review all details before submitting your request.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Employee: {employees.find(emp => emp._id === form.employeeId)?.name || 'N/A'}</Typography>
                      <Typography variant="subtitle2">Trip Type: {form.tripType}</Typography>
                      <Typography variant="subtitle2">Region: {form.region}</Typography>
                      <Typography variant="subtitle2">Departure Date: {form.departureDate}</Typography>
                      <Typography variant="subtitle2">Return Date: {form.returnDate}</Typography>
                      <Typography variant="subtitle2">Requires Visa: {form.requiresVisa ? 'Yes' : 'No'}</Typography>
                      {form.tripType === 'Seminar' && (
                        <Typography variant="subtitle2">Seminar Registration: {form.seminarFileName || 'N/A'}</Typography>
                      )}
                      <Typography variant="subtitle2">Trip Cost: KD {form.cost}</Typography>
                      <Typography variant="subtitle2">Flight Class: {form.flightClass}</Typography>
                      <Typography variant="subtitle2">Travel Arranged By: {form.travelArrangedBy}</Typography>
                      <Typography variant="subtitle2">Cost Paid: {form.costPaid ? 'Yes' : 'No'}</Typography>
                      <Typography variant="subtitle2">Payment Date: {form.costPaid ? form.costPaymentDate : 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Flight & Hotel Arrangement</Typography>
                      <Typography variant="subtitle2">Hotel Quotes: {hotelQuotes.length} files</Typography>
                      <Typography variant="subtitle2">Flight Quotes: {flightQuotes.length} files</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Reimbursable Expense Claim</Typography>
                      <Typography variant="subtitle2">Receipts: {receipts.length} files</Typography>
                      <Typography variant="subtitle2">Claim Sheet: {claimSheet ? claimSheet.name : 'N/A'}</Typography>
                      <Typography variant="subtitle2">Finance Approved: {financeApproved ? 'Yes' : 'No'}</Typography>
                      <Typography variant="subtitle2">Finance Comment: {financeComment}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Approval Workflow</Typography>
                      {APPROVAL_CHAIN.map((stage) => (
                        <Box key={stage.key} sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">{stage.label}</Typography>
                          <Chip label="Pending" color="warning" size="small" aria-label="Approval pending" />
                          <Typography variant="caption" color="text.secondary">Timestamp: --</Typography>
                          <Typography variant="body2">Comment: {approvalComments[stage.key as keyof typeof approvalComments]}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Typography variant="subtitle2">Reporting & Attachments</Typography>
                      <Typography variant="subtitle2">Post-Trip Summary: {postTripSummary ? postTripSummary.name : 'N/A'}</Typography>
                      <Typography variant="subtitle2">Boarding Pass: {boardingPass ? boardingPass.name : 'N/A'}</Typography>
                      <Typography variant="subtitle2">Signed Claim Form: {signedClaimForm ? signedClaimForm.name : 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ flex: '1', minWidth: 300 }}>
                      <Typography variant="subtitle2">Cost Management</Typography>
                      <Typography variant="subtitle2">Trip Cost: KD {form.cost}</Typography>
                      <Typography variant="subtitle2">Flight Class: {form.flightClass}</Typography>
                      <Typography variant="subtitle2">Travel Arranged By: {form.travelArrangedBy || 'N/A'}</Typography>
                      <Typography variant="subtitle2">Cost Paid: {form.costPaid ? 'Yes' : 'No'}</Typography>
                      {form.costPaid && form.costPaymentDate && (
                        <Typography variant="subtitle2">Payment Date: {new Date(form.costPaymentDate).toLocaleDateString()}</Typography>
                      )}
                      <Typography variant="subtitle2">Cost Amortization: {form.costAmortization ? 'Yes' : 'No'}</Typography>
                      {form.costAmortization && (
                        <>
                          <Typography variant="subtitle2">Total Trip Cost: KD {form.totalTripCost?.toFixed(2) || '0.00'}</Typography>
                          <Typography variant="subtitle2">Amortization Period: {form.amortizationPeriod || 'N/A'}</Typography>
                          {form.amortizationPeriod === 'custom' && form.customPeriod && (
                            <Typography variant="subtitle2">Custom Period: {form.customPeriod} months</Typography>
                          )}
                          {form.amortizationStartDate && (
                            <Typography variant="subtitle2">Start Date: {new Date(form.amortizationStartDate).toLocaleDateString()}</Typography>
                          )}
                          {form.amortizationEndDate && (
                            <Typography variant="subtitle2">End Date: {new Date(form.amortizationEndDate).toLocaleDateString()}</Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                  {apiError && <Typography color="error" sx={{ mt: 2 }}>{apiError}</Typography>}
                </>
              )}
              {/* Enhanced navigation buttons at the bottom of the form */}
              <Box display="flex" justifyContent="space-between" mt={6} sx={{ 
                p: 3, 
                background: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleBack} 
                    disabled={activeStep <= 0}
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Back
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={submitting}
                    size="large"
                    sx={{ 
                      borderRadius: 3,
                      px: 6,
                      py: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                      }
                    }}
                  >
                    {submitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Submitting...
                      </Box>
                    ) : (
                      activeStep === steps.length - 1 ? 'Submit Trip Request' : 'Next Step'
                    )}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Floating Action Button */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <Fab
          color="primary"
          aria-label="Open Flight Class Simulator"
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32, 
            zIndex: 1300, 
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            border: `2px solid rgba(255,255,255,0.2)`,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.6)}`,
            }
          }}
          onClick={() => setShowFlightClassSimulator(true)}
        >
          <PersonAddIcon sx={{ fontSize: 32, color: 'white' }} />
        </Fab>
      </motion.div>

      {/* Flight Class Simulator Dialog */}
      <Dialog
        open={showFlightClassSimulator}
        onClose={() => setShowFlightClassSimulator(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: theme.shadows[24],
            p: 3,
            minWidth: 320,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          pb: 1,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.light, 0.1)} 100%)`,
          color: theme.palette.info.main,
          borderRadius: theme.shape.borderRadius,
          mb: 2
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" color="primary">Flight Class Simulator</Typography>
          </Box>
          <IconButton onClick={() => setShowFlightClassSimulator(false)} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField 
            select 
            label="Role" 
            value={simRole} 
            onChange={e => setSimRole(e.target.value)} 
            fullWidth 
            sx={{ mb: 2 }} 
            aria-label="Select role"
          >
            {Object.keys(FLIGHT_CLASS_MATRIX).map(role => <MenuItem key={role} value={role} aria-label={`Select ${role}`}>{role}</MenuItem>)}
          </TextField>
          <TextField 
            select 
            label="Region" 
            value={simRegion} 
            onChange={e => setSimRegion(e.target.value)} 
            fullWidth 
            sx={{ mb: 3 }} 
            aria-label="Select region"
          >
            {REGIONS.map(region => <MenuItem key={region} value={region} aria-label={`Select ${region}`}>{region}</MenuItem>)}
          </TextField>
          <Box sx={{ p: 2, background: alpha(theme.palette.success.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Flight Class: <b>{simFlightClass}</b></Typography>
            <Typography variant="body2">Visa Required: <b>{['Europe','America'].includes(simRegion) ? 'Yes' : 'No'}</b></Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BusinessTripPage; 