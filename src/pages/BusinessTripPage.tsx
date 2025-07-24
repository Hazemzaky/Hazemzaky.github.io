import React, { useEffect, useState } from 'react';
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
  ClipboardListIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  PaperClipIcon,
  ChartBarIcon,
  LightningBoltIcon,
  CheckCircleIcon,
  DocumentReportIcon,
  CalendarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  RefreshIcon,
  ExclamationIcon
} from '@heroicons/react/outline';
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
import { motion } from 'framer-motion';
import { FaPlaneDeparture, FaHotel, FaMoneyBillWave, FaUserAstronaut, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaSuitcaseRolling } from 'react-icons/fa';
import { useTheme, alpha } from '@mui/material/styles';
import { FaSearch } from 'react-icons/fa';
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
const PER_DIEM_MATRIX: Record<string, Record<string, { perDiem: number; flightClass: string }>> = {
  CEO: { GCC: { perDiem: 270, flightClass: "Business" }, Europe: { perDiem: 400, flightClass: "Business" }, America: { perDiem: 500, flightClass: "Business" }, Asia: { perDiem: 350, flightClass: "Business" }, MENA: { perDiem: 250, flightClass: "Business" } },
  GM: { GCC: { perDiem: 200, flightClass: "Business" }, Europe: { perDiem: 350, flightClass: "Business" }, America: { perDiem: 400, flightClass: "Business" }, Asia: { perDiem: 300, flightClass: "Business" }, MENA: { perDiem: 180, flightClass: "Business" } },
  Supervisor: { GCC: { perDiem: 100, flightClass: "Economy" }, Europe: { perDiem: 150, flightClass: "Economy" }, America: { perDiem: 200, flightClass: "Economy" }, Asia: { perDiem: 100, flightClass: "Economy" }, MENA: { perDiem: 90, flightClass: "Economy" } },
};

function getPerDiemAndFlightClass(role: string, region: string) {
  if (PER_DIEM_MATRIX[role] && PER_DIEM_MATRIX[role][region]) {
    return PER_DIEM_MATRIX[role][region];
  }
  return { perDiem: 0, flightClass: "Economy" };
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
  if (statusColor === 'success') return <span>{FaCheckCircle({ style: { color: '#43a047' } })}</span>;
  if (statusColor === 'primary') return <span>{FaUserAstronaut({ style: { color: '#1976d2' } })}</span>;
  if (statusColor === 'warning') return <span>{FaExclamationTriangle({ style: { color: '#ffa726' } })}</span>;
  if (statusColor === 'error') return <span>{FaExclamationTriangle({ style: { color: '#e53935' } })}</span>;
  if (statusColor === 'info') return <span>{FaCalendarAlt({ style: { color: '#0288d1' } })}</span>;
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
    perDiem: 0,
    flightClass: '',
    overrideFlightClass: false,
    overrideFlightClassValue: '',
    travelArrangedBy: '',
    totalPerDiem: 0,
    perDiemPaid: false,
    perDiemPaymentDate: '',
    status: 'Draft',
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
    perDiemPaidYTD: 0,
  });
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [apiError, setApiError] = useState('');

  // Add new state for hotel and flight quotes
  const [hotelQuotes, setHotelQuotes] = useState<File[]>([]);
  const [flightQuotes, setFlightQuotes] = useState<File[]>([]);

  // Add new state for receipts, claim sheet, amounts, finance approval
  const [receipts, setReceipts] = useState<{ file: File; type: string }[]>([]);
  const [claimSheet, setClaimSheet] = useState<File | null>(null);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [allowedAmount, setAllowedAmount] = useState('');
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

  // Add state for entitlement simulator
  const [simRole, setSimRole] = useState('GM');
  const [simRegion, setSimRegion] = useState('GCC');
  const simEntitlement = getPerDiemAndFlightClass(simRole, simRegion);
  const [showEntitlementSimulator, setShowEntitlementSimulator] = useState(false);

  // Frequent Traveler Profile (mocked)
  const frequentTravelers = [
    { name: 'John Doe', count: 7, flag: 'High Travel Frequency' },
    { name: 'Jane Smith', count: 5, flag: 'Over-budgeted 3x this year' },
    { name: 'Ali Ahmad', count: 4, flag: 'No-Show' },
  ];

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
        perDiem: lastTrip.perDiem,
        flightClass: lastTrip.flightClass,
        travelArrangedBy: lastTrip.travelArrangedBy || '',
      }));
    }
  };

  // Compliance Alert System
  const complianceAlerts: string[] = [];
  if (flightQuotes.length < 2) complianceAlerts.push('Less than 2 flight quotes uploaded.');
  if (form.overrideFlightClass && form.flightClass !== form.overrideFlightClassValue) complianceAlerts.push('Flight class changed manually. Justification required.');
  if (form.departureDate && !form.perDiemPaid) {
    const dep = new Date(form.departureDate);
    if (dep > new Date()) complianceAlerts.push('Per diem not marked as paid before departure.');
  }

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
      const perDiemPaidYTD = trips.filter((t: any) => t.perDiemPaid && new Date(t.departureDate).getFullYear() === thisYear).reduce((sum: number, t: any) => sum + (t.perDiem || 0), 0);
      setDashboardStats({
        totalTrips: tripsThisMonth.length,
        pendingApprovals,
        upcomingDepartures,
        perDiemPaidYTD,
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

  // --- Dynamic logic for per diem and flight class ---
  useEffect(() => {
    if (form.employeeRole && form.region) {
      const { perDiem, flightClass } = getPerDiemAndFlightClass(form.employeeRole, form.region);
      setForm(f => ({
        ...f,
        perDiem,
        flightClass,
        overrideFlightClassValue: flightClass,
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
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'employee') return; // Skip the employee name
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value as any);
        }
      });
      // Explicitly append the employee ObjectId
      formData.append('employee', form.employeeId);
      hotelQuotes.forEach((file, idx) => formData.append(`hotelQuotes`, file));
      flightQuotes.forEach((file, idx) => formData.append(`flightQuotes`, file));
      receipts.forEach((r, idx) => {
        formData.append(`receipts`, r.file);
        formData.append(`receiptTypes`, r.type);
      });
      if (claimSheet) formData.append('claimSheet', claimSheet);
      formData.append('requestedAmount', requestedAmount);
      formData.append('allowedAmount', allowedAmount);
      formData.append('financeApproved', financeApproved ? 'true' : 'false');
      formData.append('financeComment', financeComment);
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
    'Per Diem',
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
      perDiem: trip.perDiem || 0,
      flightClass: trip.flightClass || '',
      overrideFlightClass: trip.overrideFlightClass || false,
      overrideFlightClassValue: trip.overrideFlightClassValue || '',
      travelArrangedBy: trip.travelArrangedBy || '',
      totalPerDiem: trip.totalPerDiem || 0,
      perDiemPaid: trip.perDiemPaid || false,
      perDiemPaymentDate: trip.perDiemPaymentDate || '',
      status: trip.status || 'Draft',
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
  const theme = useTheme();
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
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 40%, #a1c4fd 100%)',
      backgroundAttachment: 'fixed',
      py: { xs: 2, md: 6 },
      px: { xs: 0, md: 0 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
        style={{ width: '100%', maxWidth: 1200, marginBottom: 32 }}
      >
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {FaSuitcaseRolling({ size: 56, color: '#764ba2' })}
          </motion.div>
          <Typography variant="h3" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #1976d2 30%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 0.5
          }}>Business Trip Management</Typography>
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} style={{ marginLeft: 'auto' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AssignmentIcon />}
              sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.5, fontSize: 18, boxShadow: 3 }}
              onClick={() => setOpenDialog(true)}
            >
              New Trip Request
            </Button>
          </motion.div>
        </Box>
        {/* Stat Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <motion.div whileHover={{ scale: 1.04 }} style={{ flex: '1 1 200px', minWidth: 200 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              border: '1px solid rgba(255,255,255,0.2)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <GroupIcon sx={{ fontSize: 36, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>{dashboardStats.totalTrips}</Typography>
                <Typography variant="body2" color="text.secondary">Total Trips</Typography>
              </Box>
            </Box>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} style={{ flex: '1 1 200px', minWidth: 200 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              border: '1px solid rgba(255,255,255,0.2)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <HourglassEmptyIcon sx={{ fontSize: 36, color: '#ffa726' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>{dashboardStats.pendingApprovals}</Typography>
                <Typography variant="body2" color="text.secondary">Pending Approvals</Typography>
              </Box>
            </Box>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} style={{ flex: '1 1 200px', minWidth: 200 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              border: '1px solid rgba(255,255,255,0.2)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <DoneAllIcon sx={{ fontSize: 36, color: '#43a047' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>{completedCount}</Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </Box>
            </Box>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} style={{ flex: '1 1 200px', minWidth: 200 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              border: '1px solid rgba(255,255,255,0.2)',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <TaskAltIcon sx={{ fontSize: 36, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>{approvedCount}</Typography>
                <Typography variant="body2" color="text.secondary">Approved</Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
      {/* Frequent Traveler Leaderboard & Smart Suggestions */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 1200 }}>
        {/* Frequent Traveler Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ flex: '1 1 320px', minWidth: 320 }}>
          <Box sx={{ background: 'rgba(255,255,255,0.92)', borderRadius: 3, boxShadow: 2, p: 3, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmojiEventsIcon color="warning" />
              <Typography variant="h6" fontWeight={700}>Frequent Travelers</Typography>
            </Box>
            {frequentTravelers.map((traveler, idx) => (
              <Box key={traveler.name} display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar sx={{ bgcolor: idx === 0 ? 'warning.main' : 'primary.main', fontWeight: 700, width: 32, height: 32 }}>{traveler.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</Avatar>
                <Typography variant="body2" fontWeight={700}>{traveler.name}</Typography>
                <Chip label={traveler.flag} color={idx === 0 ? 'warning' : 'primary'} size="small" />
                <Typography variant="caption" color="text.secondary">Trips: {traveler.count}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
        {/* Smart Suggestions Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ flex: '1 1 320px', minWidth: 320 }}>
          <Box sx={{ background: 'rgba(255,255,255,0.92)', borderRadius: 3, boxShadow: 2, p: 3, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <LightbulbIcon color="info" />
              <Typography variant="h6" fontWeight={700}>Smart Suggestions</Typography>
            </Box>
            {complianceAlerts.length === 0 ? (
              <Typography variant="body2" color="success.main">All compliance checks passed!</Typography>
            ) : (
              complianceAlerts.map((alert, idx) => (
                <motion.div key={alert} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }}>
                  <Chip icon={<LightbulbIcon color="warning" sx={{ fontSize: 18 }} />} label={alert} color="warning" sx={{ mb: 1, fontWeight: 600 }} />
                </motion.div>
              ))
            )}
          </Box>
        </motion.div>
      </Box>
      {/* Trip Table */}
      <Box sx={{ width: '100%', mt: 3, mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.10)', borderRadius: 4, boxShadow: 4, backdropFilter: 'blur(8px)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" color="primary">Trips</Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search trips..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, minWidth: 220, boxShadow: 1 }}
            InputProps={{ startAdornment: FaSearch({ style: { marginRight: 8, color: '#888' } }) }}
          />
        </Box>
        {/* Quick filter bar above table */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">Filter by:</Typography>
          <Button size="small" variant={statusFilter === '' ? 'contained' : 'outlined'} onClick={() => setStatusFilter('')}>All Status</Button>
          {Object.keys(STATUS_CHIP_OPTIONS).map(status => (
            <Button
              key={status}
              size="small"
              variant={statusFilter === status ? 'contained' : 'outlined'}
              color={STATUS_CHIP_OPTIONS[status].color}
              onClick={() => setStatusFilter(status)}
              startIcon={STATUS_CHIP_OPTIONS[status].icon}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {status}
            </Button>
          ))}
          <TextField
            select
            size="small"
            label="Employee"
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            sx={{ minWidth: 160, background: 'rgba(255,255,255,0.8)', borderRadius: 2 }}
            InputProps={{ startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} /> }}
          >
            <MenuItem value="">All Employees</MenuItem>
            {employees.map((emp: any) => (
              <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            type="month"
            size="small"
            label="Departure Month"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            sx={{ minWidth: 160, background: 'rgba(255,255,255,0.8)', borderRadius: 2 }}
            InputProps={{ startAdornment: <DateRangeIcon color="primary" sx={{ mr: 1 }} /> }}
          />
        </Box>
        {/* Enhanced table */}
        <TableContainer sx={{ borderRadius: 4, boxShadow: 3, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #764ba2 100%)', '& .MuiTableCell-head': { color: 'white', fontWeight: 700 } }}>
                <TableCell>Employee</TableCell>
                <TableCell>Trip Type</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Departure</TableCell>
                <TableCell>Return</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">No trips found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip, idx) => (
                  <motion.tr
                    key={trip._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * idx }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(25,118,210,0.07)' }}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontWeight: 700 }}>
                          {trip.employeeName ? trip.employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{trip.employeeName || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">{trip.employeeRole || ''}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{trip.tripType}</TableCell>
                    <TableCell>{trip.region}</TableCell>
                    <TableCell>{trip.departureDate ? new Date(trip.departureDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{trip.returnDate ? new Date(trip.returnDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={trip.status}
                        color={STATUS_CHIP_OPTIONS[trip.status as keyof typeof STATUS_CHIP_OPTIONS]?.color || 'default'}
                        icon={getStatusIcon(trip.status)}
                        sx={{ fontWeight: 700, borderRadius: 2, px: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Trip">
                        <IconButton color="primary" onClick={() => navigate(`/business-trips/${trip._id}`)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Trip">
                        <IconButton color="success" onClick={() => handleEditTrip(trip)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Trip">
                        <IconButton color="error" onClick={() => handleDeleteTrip(trip._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Timeline/Calendar strip */}
        <Box sx={{ mt: 4, p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.13)', boxShadow: 2, display: 'flex', overflowX: 'auto', gap: 3 }}>
          {filteredTrips.slice(0, 10).map((trip, idx) => {
            const statusColor = getStatusColor(trip.status);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Box sx={{ minWidth: 120, p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.18)', boxShadow: 1, textAlign: 'center', border: `2px solid ${(theme.palette[getPaletteColor(statusColor)] as any).main || '#ccc'}` }}>
                  <Typography variant="caption" color="text.secondary">{trip.departureDate}</Typography>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    {FaPlaneDeparture({ size: 28, color: (theme.palette[getPaletteColor(statusColor)] as any).main || '#1976d2' })}
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{getEmployeeName(trip.employee)}</Typography>
                  <Chip
                    label={trip.status}
                    color={statusColor}
                    size="small"
                    icon={trip.status === 'Approved' ? <TaskAltIcon sx={{ color: '#1976d2', fontSize: 16, mr: 0.5 }} /> : undefined}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Box>
      {/* Trip Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{
        sx: {
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 60%, rgba(118,75,162,0.13) 100%)',
          boxShadow: '0 16px 64px rgba(76,110,245,0.18)',
          backdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          overflow: 'hidden',
        }
      }}>
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          px: 4, py: 3
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
              {FaPlaneDeparture({ size: 32, color: 'white' })}
            </motion.div>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 1 }}>New Business Trip Request</Typography>
          </Box>
          <Box mt={2}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, idx) => (
                <Step key={label}>
                  <StepLabel
                    icon={
                      idx === 0 ? <PersonIcon /> :
                      idx === 1 ? <AssignmentIcon /> :
                      idx === 2 ? <MonetizationOnIcon /> :
                      idx === 3 ? <PublicIcon /> :
                      idx === 4 ? <TaskAltIcon /> :
                      idx === 5 ? <EventIcon /> :
                      <FiberManualRecordIcon />
                    }
                  >
                    <span style={{ fontWeight: 700 }}>{label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogTitle>
        <DialogContent>
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.8)', '&:hover': { background: 'rgba(255,255,255,0.9)' } } }}
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.8)', '&:hover': { background: 'rgba(255,255,255,0.9)' } } }}
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.8)', '&:hover': { background: 'rgba(255,255,255,0.9)' } } }}
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.8)', '&:hover': { background: 'rgba(255,255,255,0.9)' } } }}
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
                        <Typography variant="caption" color="text.secondary">Per Diem Rate</Typography>
                        <Typography variant="h6" color="primary">KD {form.perDiem}/day</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Flight Class</Typography>
                        <Typography variant="h6" color="primary">{form.flightClass}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <input
                          type="checkbox"
                          checked={form.overrideFlightClass}
                          onChange={handleChange}
                          id="flight-class-override"
                          aria-label="Override flight class"
                        />
                        <label htmlFor="flight-class-override" style={{ fontSize: 14 }}>Override</label>
                        {form.overrideFlightClass && (
                          <Select
                            name="overrideFlightClassValue"
                            value={form.overrideFlightClassValue}
                            onChange={handleSelectChange}
                            size="small"
                            sx={{ ml: 1 }}
                            aria-label="Select flight class override"
                          >
                            {FLIGHT_CLASSES.map(fc => <MenuItem key={fc} value={fc} aria-label={`Select ${fc}`}>{fc}</MenuItem>)}
                          </Select>
                        )}
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
              {/* Step 3: Per Diem */}
              {activeStep === 2 && (
                <>
                  <Typography variant="subtitle1" color="primary" mb={2}>Preview and confirm your per diem.</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Per Diem</Typography>
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        KD {form.totalPerDiem.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="perDiemPaid"
                            checked={form.perDiemPaid}
                            onChange={handleChange}
                            aria-label="Is per diem paid"
                          />
                        }
                        label="Per Diem Paid?"
                      />
                    </Box>
                    {form.perDiemPaid && (
                      <Box sx={{ flex: 1, minWidth: 220 }}>
                        <TextField
                          label="Payment Date"
                          name="perDiemPaymentDate"
                          type="date"
                          value={form.perDiemPaymentDate}
                          onChange={handleChange}
                          fullWidth
                          required
                          InputLabelProps={{ shrink: true }}
                          aria-label="Select per diem payment date"
                          aria-required="true"
                        />
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
                      <TextField
                        label="Requested Amount"
                        type="number"
                        value={requestedAmount}
                        onChange={e => setRequestedAmount(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                        aria-label="Enter requested amount"
                      />
                      <TextField
                        label="Allowed Amount"
                        type="number"
                        value={allowedAmount}
                        onChange={e => setAllowedAmount(e.target.value)}
                        fullWidth
                        aria-label="Enter allowed amount"
                      />
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
                  {/* Archive Table (mocked for now) */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachment Archive (Sample)</Typography>
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
                          {/* Example row, replace with real data if available */}
                          <TableRow>
                            <TableCell>TRIP-001</TableCell>
                            <TableCell>2024-05-01</TableCell>
                            <TableCell>Post-Trip Summary</TableCell>
                            <TableCell>summary.pdf</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>TRIP-001</TableCell>
                            <TableCell>2024-05-01</TableCell>
                            <TableCell>Boarding Pass</TableCell>
                            <TableCell>boardingpass.jpg</TableCell>
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
                      <Typography variant="subtitle2">Per Diem Rate: KD {form.perDiem}/day</Typography>
                      <Typography variant="subtitle2">Flight Class: {form.flightClass}</Typography>
                      <Typography variant="subtitle2">Travel Arranged By: {form.travelArrangedBy}</Typography>
                      <Typography variant="subtitle2">Total Per Diem: KD {form.totalPerDiem.toFixed(2)}</Typography>
                      <Typography variant="subtitle2">Per Diem Paid: {form.perDiemPaid ? 'Yes' : 'No'}</Typography>
                      <Typography variant="subtitle2">Payment Date: {form.perDiemPaid ? form.perDiemPaymentDate : 'N/A'}</Typography>
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
                      <Typography variant="subtitle2">Requested Amount: KD {requestedAmount}</Typography>
                      <Typography variant="subtitle2">Allowed Amount: KD {allowedAmount}</Typography>
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
                  </Box>
                  {apiError && <Typography color="error" sx={{ mt: 2 }}>{apiError}</Typography>}
                </>
              )}
              {/* Always show navigation buttons at the bottom of the form */}
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button onClick={handleBack} disabled={activeStep <= 0}>Back</Button>
                <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : (activeStep === steps.length - 1 ? 'Submit' : 'Next')}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </DialogContent>
      </Dialog>
      <Fab
        color="primary"
        aria-label="Open Entitlement Simulator"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300, boxShadow: 6 }}
        onClick={() => setShowEntitlementSimulator(true)}
      >
        {FaUserAstronaut({ size: 28 })}
      </Fab>
      <Dialog
        open={showEntitlementSimulator}
        onClose={() => setShowEntitlementSimulator(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 60%, ${alpha(theme.palette.primary.light, 0.18)})`,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            p: 3,
            minWidth: 320,
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {FaUserAstronaut({ size: 24 })}
            <Typography variant="h6" color="primary">Entitlement Simulator</Typography>
          </Box>
          <IconButton onClick={() => setShowEntitlementSimulator(false)} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField select label="Role" value={simRole} onChange={e => setSimRole(e.target.value)} fullWidth sx={{ mb: 1 }} aria-label="Select entitlement role">
            {Object.keys(PER_DIEM_MATRIX).map(role => <MenuItem key={role} value={role} aria-label={`Select ${role}`}>{role}</MenuItem>)}
          </TextField>
          <TextField select label="Region" value={simRegion} onChange={e => setSimRegion(e.target.value)} fullWidth sx={{ mb: 2 }} aria-label="Select entitlement region">
            {REGIONS.map(region => <MenuItem key={region} value={region} aria-label={`Select ${region}`}>{region}</MenuItem>)}
          </TextField>
          <Typography variant="body2" sx={{ mb: 1 }}>Per Diem: <b>KD {simEntitlement.perDiem}</b></Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>Flight Class: <b>{simEntitlement.flightClass}</b></Typography>
          <Typography variant="body2">Visa Required: <b>{['Europe','America'].includes(simRegion) ? 'Yes' : 'No'}</b></Typography>
        </DialogContent>
      </Dialog>
      {/* Below the dashboard cards, add: */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center' }}>
        {dashboardTrips.map((trip, idx) => (
          <Card key={trip._id || idx} sx={{ minWidth: 320, maxWidth: 400, borderRadius: 4, boxShadow: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: `1px solid ${alpha(theme.palette.primary.light, 0.15)}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {FaPlaneDeparture({ size: 28, color: theme.palette.primary.main })}
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
              <Typography variant="body2" color="text.secondary">Per Diem: <b>KD {trip.perDiem}</b></Typography>
            </CardContent>
            <Box display="flex" justifyContent="flex-end" gap={1} p={2}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
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
                    perDiem: trip.perDiem || 0,
                    flightClass: trip.flightClass || '',
                    overrideFlightClass: trip.overrideFlightClass || false,
                    overrideFlightClassValue: trip.overrideFlightClassValue || '',
                    travelArrangedBy: trip.travelArrangedBy || '',
                    totalPerDiem: trip.totalPerDiem || 0,
                    perDiemPaid: trip.perDiemPaid || false,
                    perDiemPaymentDate: trip.perDiemPaymentDate || '',
                    status: trip.status || 'Draft',
                  });
                  // Set other related state as needed (details, arrangementType, agent, etc.)
                  setOpenDialog(true);
                }}
              >
                Edit
              </Button>
              <Button variant="contained" color="primary" size="small" onClick={() => navigate(`/business-trips/${trip._id}`)}>View Trip</Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default BusinessTripPage; 