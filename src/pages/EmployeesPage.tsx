import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Snackbar, Alert, Chip, MenuItem, Card, CardContent, Avatar, 
  FormControl, InputLabel, Select, Tabs, Tab, Divider, Badge, Tooltip, Fab, 
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails,
  LinearProgress, Rating, Chip as MuiChip, Checkbox, useTheme, alpha
} from '@mui/material';

import {
  Search as SearchIcon, Close as CloseIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as ViewIcon, FilterList as FilterIcon,
  ViewList as ViewListIcon, ViewModule as ViewModuleIcon, 
  Person as PersonIcon, Work as WorkIcon, AttachMoney as MoneyIcon,
  Event as EventIcon, ExpandMore as ExpandMoreIcon, 
  TrendingUp as TrendingUpIcon, Group as GroupIcon, 
  LocationOn as LocationIcon, Phone as PhoneIcon, Email as EmailIcon,
  CalendarToday as CalendarIcon, Star as StarIcon, Remove as RemoveIcon,
  MoreVert as MoreVertIcon, Download as DownloadIcon, Upload as UploadIcon,
  FilterAlt as FilterAltIcon, Sort as SortIcon, VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon, Error as ErrorIcon,
  Schedule as ScheduleIcon, Assignment as AssignmentIcon, Security as SecurityIcon,
  LocalShipping as LocalShippingIcon, Build as BuildIcon, School as SchoolIcon,
  Assessment as AssessmentIcon, Timeline as TimelineIcon, Notifications as NotificationsIcon,
  Archive as ArchiveIcon, Restore as RestoreIcon, Block as BlockIcon, VerifiedUser as VerifiedUserIcon,
  EmojiEvents as EmojiEventsIcon, Psychology as PsychologyIcon, Analytics as AnalyticsIcon,
  QrCode as QrCodeIcon, Badge as BadgeIcon, WorkHistory as WorkHistoryIcon,
  AccessTime as AccessTimeIcon, LocationCity as LocationCityIcon, Business as BusinessIcon,
  Cancel as CancelIcon, Message as MessageIcon, Login as LoginIcon, Logout as LogoutIcon, EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../apiBase';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentManager from '../components/DocumentManager';

interface Employee {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  benefits: { type: string; value: number }[];
  leaveBalance: number;
  active: boolean;
  hireDate: string;
  terminationDate?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  performanceRating?: number;
  lastReviewDate?: string;
  skills?: string[];
  manager?: string;
  location?: string;
  // Enhanced comprehensive fields
  employeeId?: string;
  personalEmail?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  civilId?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  employmentType?: 'full-time' | 'part-time' | 'contractor' | 'daily';
  jobLevel?: string;
  hourlyRate?: number;
  site?: string; // Main Warehouse, Port Branch, HQ
  status?: 'active' | 'on-leave' | 'resigned' | 'suspended';
  
  // Logistics-specific fields
  driverLicense?: {
    number: string;
    expiryDate: string;
    type: string;
  };
  vehicleAssignment?: {
    vehicleId: string;
    vehicleType: string;
    assignedDate: string;
  };
  workShifts?: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    days: string[];
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    type: 'forklift' | 'hse' | 'hazmat' | 'other';
    issueDate: string;
    expiryDate: string;
    status: 'valid' | 'expired' | 'expiring-soon';
  }>;
  
  // Compensation & Benefits
  compensationHistory?: Array<{
    date: string;
    amount: number;
    type: string;
    reason: string;
  }>;
  bonusRecords?: Array<{
    date: string;
    amount: number;
    type: string;
    description: string;
  }>;
  allowances?: {
    transport: number;
    housing: number;
    meal: number;
    other: number;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
  payrollIncluded: boolean;
  bonusEligible: boolean;
  
  // Leave & Attendance
  leaveBalanceDetails?: {
    vacation: number;
    sick: number;
    personal: number;
    other: number;
  };
  upcomingLeaves?: Array<{
    startDate: string;
    endDate: string;
    type: string;
    status: string;
  }>;
  attendanceLog?: Array<{
    date: string;
    checkIn: string;
    checkOut: string;
    hours: number;
    status: 'present' | 'absent' | 'late' | 'on-leave';
  }>;
  attendancePercentage: number;
  absenceFrequency: number;
  
  // Performance & Development
  performance?: {
    lastReviewDate: string;
    rating: number;
    goals: Array<{
      id: string;
      title: string;
      description: string;
      progress: number;
      dueDate: string;
      status: string;
    }>;
    feedback: Array<{
      date: string;
      reviewer: string;
      rating: number;
      comments: string;
      tags: string[];
    }>;
    kpis?: {
      deliveryTimeliness: number;
      customerComplaints: number;
      vehicleUtilization: number;
      delayPercentage: number;
    };
  };
  
  // Documents & Compliance
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    expiryDate?: string;
    status: 'valid' | 'expired' | 'expiring-soon';
    category: 'id' | 'contract' | 'medical' | 'training' | 'license' | 'other';
  }>;
  compliance?: {
    visaExpiry?: string;
    workPermitExpiry?: string;
    medicalCheckExpiry?: string;
    insuranceStatus: 'active' | 'expired' | 'pending';
  };
  
  // Timeline & History
  timeline?: Array<{
    id: string;
    date: string;
    event: string;
    description: string;
    type: 'join' | 'promotion' | 'leave' | 'warning' | 'training' | 'contract-renewal';
  }>;
  hrActions?: Array<{
    id: string;
    date: string;
    action: string;
    performedBy: string;
    notes: string;
  }>;
  
  // Recognition & Awards
  recognition?: Array<{
    id: string;
    type: 'employee-of-month' | 'safety-milestone' | 'performance-award' | 'peer-compliment';
    title: string;
    date: string;
    description: string;
  }>;
  
  // Equipment & Assets
  equipment?: Array<{
    id: string;
    type: 'laptop' | 'phone' | 'uniform' | 'rfid-badge' | 'vehicle' | 'other';
    name: string;
    assignedDate: string;
    returnDate?: string;
    status: 'assigned' | 'returned' | 'lost';
  }>;
  
  // Private HR Notes
  privateNotes?: string;
  hrNotes?: Array<{
    id: string;
    date: string;
    note: string;
    hrPersonnel: string;
    followUpDate?: string;
  }>;
  
  // Organizational
  orgChart?: {
    manager?: string;
    directReports?: string[];
    peers?: string[];
  };
  skillTags?: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    endorsedBy: string[];
  }>;
  customTags?: string[]; // e.g., "Hazmat Certified", "Forklift Operator"
  attritionRisk?: 'low' | 'medium' | 'high';
  officeLocation?: string;
  workMode?: 'office' | 'remote' | 'hybrid';
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  
  // Readiness Tracker (for drivers/operators)
  readinessTracker?: {
    licenseValid: boolean;
    safetyTraining: boolean;
    medicallyFit: boolean;
    vehicleAssigned: boolean;
    readyForField: boolean;
  };
  
  // Overtime & Hours
  overtime?: {
    weeklyHours: number;
    monthlyHours: number;
    overtimeHours: number;
    overtimePay: number;
  };
  // --- Work Permit fields ---
  workPermitStart?: string;
  workPermitEnd?: string;
  workPermitCopy?: File | string | null;
  // Add new fields for employee type logic
  employeeType?: 'Citizen' | 'Foreigner';
  citizenType?: 'Kuwaiti' | 'Bedoun';
  residencyNumber?: string;
}

const benefitOptions = [
  'Health Insurance',
  'Housing Allowance',
  'Transport Allowance',
  'Bonus',
  'Retirement Plan',
  'Meal Allowance',
  'Education Allowance',
  'Other',
];

const departmentOptions = [
  'Logistics', 'Warehouse', 'Transport', 'Operations', 'HR', 'Finance', 'IT', 'Sales', 'Customer Service', 'Maintenance', 'Security', 'Administration'
];

const positionOptions = [
  'Driver', 'Warehouse Manager', 'Forklift Operator', 'Logistics Coordinator', 'Transport Manager', 'Operations Manager', 'HR Manager', 'Accountant', 'IT Support', 'Sales Representative', 'Customer Service', 'Security Guard', 'Maintenance Technician', 'Administrative Assistant'
];

const siteOptions = [
  'Main Warehouse', 'Port Branch', 'HQ', 'Secondary Warehouse', 'Distribution Center', 'Regional Office'
];

const employmentTypeOptions = [
  'full-time', 'part-time', 'contractor', 'daily'
];

const statusOptions = [
  'active', 'on-leave', 'resigned', 'suspended'
];

const certificationTypes = [
  'forklift', 'hse', 'hazmat', 'other'
];

const documentCategories = [
  'id', 'contract', 'medical', 'training', 'license', 'other'
];

// Attendance API Response Interfaces
interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'present' | 'absent' | 'late' | 'on-leave';
}

interface AttendanceStats {
  attendancePercentage: number;
  absenceFrequency: number;
}

interface CheckInResponse {
  message: string;
  attendance: AttendanceRecord;
  stats: AttendanceStats;
}

interface CheckOutResponse {
  message: string;
  attendance: AttendanceRecord;
  stats: AttendanceStats;
}

interface MarkLeaveResponse {
  message: string;
  attendance: AttendanceRecord;
  leaveBalance?: {
    vacation: number;
    sick: number;
    personal: number;
    other: number;
  };
  stats: AttendanceStats;
}

interface AttendanceHistoryResponse {
  employeeId: string;
  employeeName: string;
  attendanceHistory: AttendanceRecord[];
  totalRecords: number;
  stats: AttendanceStats;
}

interface AttendanceStatsResponse {
  employeeId: string;
  employeeName: string;
  period: string;
  statistics: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    totalHours: number;
    averageHours: number;
    attendanceRate: number;
    attendancePercentage: number;
    absenceFrequency: number;
  };
  recentRecords: AttendanceRecord[];
}

// Add a type for the form state
interface EmployeeFormState {
  _id?: string;
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  salary?: string;
  benefits?: { type: string; value: number }[];
  leaveBalance?: string;
  active?: boolean;
  hireDate?: string;
  terminationDate?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  performanceRating?: number;
  lastReviewDate?: string;
  skills?: string[];
  manager?: string;
  location?: string;
  employeeId?: string;
  personalEmail?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  civilId?: string;
  gender?: 'male' | 'female' | 'other' | '';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | '';
  employmentType?: 'full-time' | 'part-time' | 'contractor' | 'daily' | '';
  jobLevel?: string;
  hourlyRate?: string;
  site?: string;
  status?: 'active' | 'on-leave' | 'resigned' | 'suspended' | '';
  driverLicense?: {
    number: string;
    expiryDate: string;
    type: string;
  };
  vehicleAssignment?: {
    vehicleId: string;
    vehicleType: string;
    assignedDate: string;
  };
  workShifts?: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    days: string[];
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    type: 'forklift' | 'hse' | 'hazmat' | 'other';
    issueDate: string;
    expiryDate: string;
    status: 'valid' | 'expired' | 'expiring-soon';
  }>;
  compensationHistory?: Array<{
    date: string;
    amount: number;
    type: string;
    reason: string;
  }>;
  bonusRecords?: Array<{
    date: string;
    amount: number;
    type: string;
    description: string;
  }>;
  allowances?: {
    transport: number;
    housing: number;
    meal: number;
    other: number;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
  payrollIncluded?: boolean;
  bonusEligible?: boolean;
  leaveBalanceDetails?: {
    vacation: number;
    sick: number;
    personal: number;
    other: number;
  };
  upcomingLeaves?: Array<{
    startDate: string;
    endDate: string;
    type: string;
    status: string;
  }>;
  attendanceLog?: Array<{
    date: string;
    checkIn: string;
    checkOut: string;
    hours: number;
    status: 'present' | 'absent' | 'late' | 'on-leave';
  }>;
  attendancePercentage?: number;
  absenceFrequency?: number;
  performance?: {
    lastReviewDate: string;
    rating: number;
    goals: Array<{
      id: string;
      title: string;
      description: string;
      progress: number;
      dueDate: string;
      status: string;
    }>;
    feedback: Array<{
      date: string;
      reviewer: string;
      rating: number;
      comments: string;
      tags: string[];
    }>;
    kpis?: {
      deliveryTimeliness: number;
      customerComplaints: number;
      vehicleUtilization: number;
      delayPercentage: number;
    };
  };
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    expiryDate?: string;
    status: 'valid' | 'expired' | 'expiring-soon';
    category: 'id' | 'contract' | 'medical' | 'training' | 'license' | 'other';
  }>;
  compliance?: {
    visaExpiry?: string;
    workPermitExpiry?: string;
    medicalCheckExpiry?: string;
    insuranceStatus: 'active' | 'expired' | 'pending';
  };
  timeline?: Array<{
    id: string;
    date: string;
    event: string;
    description: string;
    type: 'join' | 'promotion' | 'leave' | 'warning' | 'training' | 'contract-renewal';
  }>;
  hrActions?: Array<{
    id: string;
    date: string;
    action: string;
    performedBy: string;
    notes: string;
  }>;
  recognition?: Array<{
    id: string;
    type: 'employee-of-month' | 'safety-milestone' | 'performance-award' | 'peer-compliment';
    title: string;
    date: string;
    description: string;
  }>;
  equipment?: Array<{
    id: string;
    type: 'laptop' | 'phone' | 'uniform' | 'rfid-badge' | 'vehicle' | 'other';
    name: string;
    assignedDate: string;
    returnDate?: string;
    status: 'assigned' | 'returned' | 'lost';
  }>;
  privateNotes?: string;
  hrNotes?: Array<{
    id: string;
    date: string;
    note: string;
    hrPersonnel: string;
    followUpDate?: string;
  }>;
  orgChart?: {
    manager?: string;
    directReports?: string[];
    peers?: string[];
  };
  skillTags?: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    endorsedBy: string[];
  }>;
  customTags?: string[];
  attritionRisk?: 'low' | 'medium' | 'high' | '';
  officeLocation?: string;
  workMode?: 'office' | 'remote' | 'hybrid' | '';
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  readinessTracker?: {
    licenseValid: boolean;
    safetyTraining: boolean;
    medicallyFit: boolean;
    vehicleAssigned: boolean;
    readyForField: boolean;
  };
  overtime?: {
    weeklyHours: number;
    monthlyHours: number;
    overtimeHours: number;
    overtimePay: number;
  };
  workPermitStart?: string;
  workPermitEnd?: string;
  workPermitCopy?: string | File | null;
  employeeType?: 'Citizen' | 'Foreigner' | '';
  citizenType?: 'Kuwaiti' | 'Bedoun' | '';
  residencyNumber?: string;
}

const EmployeesPage: React.FC = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    position: '',
    site: '',
    employmentType: '',
    dateRange: '',
    searchBy: 'name' as 'name' | 'id' | 'email' | 'phone'
  });
  
  const [form, setForm] = useState<EmployeeFormState>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    benefits: [],
    leaveBalance: '',
    hireDate: '',
    address: '',
    emergencyContact: '',
    skills: [],
    manager: '',
    location: '',
    // Enhanced comprehensive fields
    employeeId: '',
    personalEmail: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    civilId: '',
    gender: 'male' as 'male' | 'female' | 'other',
    maritalStatus: 'single' as 'single' | 'married' | 'divorced' | 'widowed',
    employmentType: 'full-time' as 'full-time' | 'part-time' | 'contractor' | 'daily',
    jobLevel: '',
    hourlyRate: '',
    site: '',
    status: 'active' as 'active' | 'on-leave' | 'resigned' | 'suspended',
    officeLocation: '',
    workMode: 'office' as 'office' | 'remote' | 'hybrid',
    
    // Logistics-specific fields
    driverLicense: { number: '', expiryDate: '', type: '' },
    vehicleAssignment: { vehicleId: '', vehicleType: '', assignedDate: '' },
    workShifts: [],
    certifications: [],
    
    // Compensation & Benefits
    allowances: { transport: 0, housing: 0, meal: 0, other: 0 },
    bankInfo: { bankName: '', accountNumber: '', iban: '' },
    payrollIncluded: true,
    bonusEligible: true,
    
    // Emergency Contacts & Skills
    emergencyContacts: [],
    skillTags: [],
    customTags: [],
    
    // Notes & Risk
    privateNotes: '',
    attritionRisk: 'low' as 'low' | 'medium' | 'high',
    
    // Readiness Tracker
    readinessTracker: {
      licenseValid: false,
      safetyTraining: false,
      medicallyFit: false,
      vehicleAssigned: false,
      readyForField: false
    },
    
    // Leave & Attendance
    leaveBalanceDetails: { vacation: 0, sick: 0, personal: 0, other: 0 },
    upcomingLeaves: [],
    attendanceLog: [],
    attendancePercentage: 0,
    absenceFrequency: 0,
    
    // Performance
    performance: {
      lastReviewDate: '',
      rating: 0,
      goals: [],
      feedback: [],
      kpis: {
        deliveryTimeliness: 0,
        customerComplaints: 0,
        vehicleUtilization: 0,
        delayPercentage: 0
      }
    },
    
    // Documents & Compliance
    documents: [],
    compliance: {
      visaExpiry: '',
      workPermitExpiry: '',
      medicalCheckExpiry: '',
      insuranceStatus: 'active' as 'active' | 'expired' | 'pending'
    },
    
    // Timeline & History
    timeline: [],
    hrActions: [],
    
    // Recognition & Awards
    recognition: [],
    
    // Equipment & Assets
    equipment: [],
    
    // HR Notes
    hrNotes: [],
    
    // Organizational
    orgChart: { manager: '', directReports: [], peers: [] },
    
    // Overtime & Hours
    overtime: { weeklyHours: 0, monthlyHours: 0, overtimeHours: 0, overtimePay: 0 },
    workPermitStart: '',
    workPermitEnd: '',
    workPermitCopy: null,
    employeeType: '',
    citizenType: '',
    residencyNumber: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ open: boolean; action: string }>({ open: false, action: '' });
  const [timelineView, setTimelineView] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [bulkActionSubmitting, setBulkActionSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    resigned: 0,
    suspended: 0
  });

  // Attendance tracking
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/employees');
      // Handle new response structure with employees array and stats
      if (res.data && typeof res.data === 'object' && 'employees' in res.data) {
        setEmployees(Array.isArray((res.data as any).employees) ? (res.data as any).employees : []);
        if ((res.data as any).stats) {
          setStats((res.data as any).stats);
        }
      } else if (Array.isArray(res.data)) {
        // Fallback for old response structure
        setEmployees(res.data);
      } else {
        setEmployees([]);
        setError('Unexpected response from server');
        console.error('Expected array or object with employees, got:', res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    let data = employees;
    
    // Search filter
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(e => {
        switch (filters.searchBy) {
          case 'id':
            return e.employeeId?.toLowerCase().includes(s);
          case 'email':
            return e.email.toLowerCase().includes(s);
          case 'phone':
            return e.phone?.toLowerCase().includes(s);
          default:
            return e.name.toLowerCase().includes(s) ||
                   e.email.toLowerCase().includes(s) ||
                   e.position.toLowerCase().includes(s) ||
                   e.department.toLowerCase().includes(s) ||
                   e.employeeId?.toLowerCase().includes(s) ||
                   (e.phone && e.phone.includes(s));
        }
      });
    }
    
    // Department filter
    if (filters.department) {
      data = data.filter(e => e.department === filters.department);
    }
    
    // Status filter
    if (filters.status) {
      data = data.filter(e => e.status === filters.status);
    }
    
    // Position filter
    if (filters.position) {
      data = data.filter(e => e.position === filters.position);
    }
    
    // Site filter
    if (filters.site) {
      data = data.filter(e => e.site === filters.site);
    }
    
    // Employment type filter
    if (filters.employmentType) {
      data = data.filter(e => e.employmentType === filters.employmentType);
    }
    
    return data;
  }, [employees, search, filters]);

  // Enhanced Statistics with backend data
  const enhancedStats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const onLeave = employees.filter(e => e.status === 'on-leave').length;
    const resigned = employees.filter(e => e.status === 'resigned').length;
    const suspended = employees.filter(e => e.status === 'suspended').length;
    const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const avgSalary = total > 0 ? totalSalary / total : 0;
    
    const departmentStats = employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const siteStats = employees.reduce((acc, e) => {
      if (e.site) {
        acc[e.site] = (acc[e.site] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const employmentTypeStats = employees.reduce((acc, e) => {
      acc[e.employmentType || 'full-time'] = (acc[e.employmentType || 'full-time'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Readiness tracker stats
    const readyForField = employees.filter(e => e.readinessTracker?.readyForField).length;
    const needsAttention = employees.filter(e => 
      e.documents?.some(d => d.status === 'expired' || d.status === 'expiring-soon') ||
      e.certifications?.some(c => c.status === 'expired' || c.status === 'expiring-soon')
    ).length;
    
    return { 
      total, 
      active, 
      onLeave, 
      resigned, 
      suspended, 
      totalSalary, 
      avgSalary, 
      departmentStats, 
      siteStats, 
      employmentTypeStats,
      readyForField,
      needsAttention
    };
  }, [employees]);

  const handleOpen = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee._id);
      setForm({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        position: employee.position,
        department: employee.department,
        salary: String(employee.salary),
        benefits: employee.benefits || [],
        leaveBalance: String(employee.leaveBalance),
        hireDate: employee.hireDate.slice(0, 10),
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || '',
        skills: employee.skills || [],
        manager: employee.manager || '',
        location: employee.location || '',
        // Enhanced comprehensive fields
        employeeId: employee.employeeId || '',
        personalEmail: employee.personalEmail || '',
        dateOfBirth: employee.dateOfBirth || '',
        nationality: employee.nationality || '',
        passportNumber: employee.passportNumber || '',
        civilId: employee.civilId || '',
        gender: employee.gender || 'male',
        maritalStatus: employee.maritalStatus || 'single',
        employmentType: employee.employmentType || 'full-time',
        jobLevel: employee.jobLevel || '',
        hourlyRate: employee.hourlyRate ? String(employee.hourlyRate) : '',
        site: employee.site || '',
        status: employee.status || 'active',
        officeLocation: employee.officeLocation || '',
        workMode: employee.workMode || 'office',
        
        // Logistics-specific fields
        driverLicense: employee.driverLicense || { number: '', expiryDate: '', type: '' },
        vehicleAssignment: employee.vehicleAssignment || { vehicleId: '', vehicleType: '', assignedDate: '' },
        workShifts: employee.workShifts || [],
        certifications: employee.certifications || [],
        
        // Compensation & Benefits
        allowances: employee.allowances || { transport: 0, housing: 0, meal: 0, other: 0 },
        bankInfo: employee.bankInfo || { bankName: '', accountNumber: '', iban: '' },
        payrollIncluded: employee.payrollIncluded ?? true,
        bonusEligible: employee.bonusEligible ?? true,
        
        // Emergency Contacts & Skills
        emergencyContacts: employee.emergencyContacts || [],
        skillTags: employee.skillTags || [],
        customTags: employee.customTags || [],
        
        // Notes & Risk
        privateNotes: employee.privateNotes || '',
        attritionRisk: employee.attritionRisk || 'low',
        
        // Readiness Tracker
        readinessTracker: employee.readinessTracker || {
          licenseValid: false,
          safetyTraining: false,
          medicallyFit: false,
          vehicleAssigned: false,
          readyForField: false
        },
        
        // Leave & Attendance
        leaveBalanceDetails: employee.leaveBalanceDetails || { vacation: 0, sick: 0, personal: 0, other: 0 },
        upcomingLeaves: employee.upcomingLeaves || [],
        attendanceLog: employee.attendanceLog || [],
        attendancePercentage: employee.attendancePercentage || 0,
        absenceFrequency: employee.absenceFrequency || 0,
        
        // Performance
        performance: {
          lastReviewDate: employee.performance?.lastReviewDate || '',
          rating: employee.performance?.rating || 0,
          goals: employee.performance?.goals || [],
          feedback: employee.performance?.feedback || [],
          kpis: {
            deliveryTimeliness: employee.performance?.kpis?.deliveryTimeliness || 0,
            customerComplaints: employee.performance?.kpis?.customerComplaints || 0,
            vehicleUtilization: employee.performance?.kpis?.vehicleUtilization || 0,
            delayPercentage: employee.performance?.kpis?.delayPercentage || 0
          }
        },
        
        // Documents & Compliance
        documents: employee.documents || [],
        compliance: {
          visaExpiry: employee.compliance?.visaExpiry || '',
          workPermitExpiry: employee.compliance?.workPermitExpiry || '',
          medicalCheckExpiry: employee.compliance?.medicalCheckExpiry || '',
          insuranceStatus: (employee.compliance?.insuranceStatus as 'active' | 'expired' | 'pending') || 'active'
        },
        
        // Timeline & History
        timeline: employee.timeline || [],
        hrActions: employee.hrActions || [],
        
        // Recognition & Awards
        recognition: employee.recognition || [],
        
        // Equipment & Assets
        equipment: employee.equipment || [],
        
        // HR Notes
        hrNotes: employee.hrNotes || [],
        
        // Organizational
        orgChart: {
          manager: employee.orgChart?.manager || '',
          directReports: employee.orgChart?.directReports || [],
          peers: employee.orgChart?.peers || []
        },
        
        // Overtime & Hours
        overtime: {
          weeklyHours: employee.overtime?.weeklyHours || 0,
          monthlyHours: employee.overtime?.monthlyHours || 0,
          overtimeHours: employee.overtime?.overtimeHours || 0,
          overtimePay: employee.overtime?.overtimePay || 0
        },
        workPermitStart: employee.workPermitStart || '',
        workPermitEnd: employee.workPermitEnd || '',
        workPermitCopy: typeof employee.workPermitCopy === 'string' && employee.workPermitCopy ? employee.workPermitCopy : null,
        employeeType: employee.employeeType || '',
        citizenType: employee.citizenType || '',
        residencyNumber: employee.residencyNumber || '',
      });
      
      // Initialize attendance data
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = employee?.attendanceLog?.find((record: any) => record.date === today);
      setTodayAttendance(todayRecord || null);
      setAttendanceHistory(employee?.attendanceLog || []);
    } else {
      setEditingId(null);
      setForm({ 
        name: '', email: '', phone: '', position: '', department: '', 
        salary: '', benefits: [], leaveBalance: '', hireDate: '', 
        address: '', emergencyContact: '', skills: [], manager: '', location: '',
        // Enhanced comprehensive fields
        employeeId: '', personalEmail: '', dateOfBirth: '', nationality: '',
        passportNumber: '', civilId: '', gender: 'male', maritalStatus: 'single',
        employmentType: 'full-time', jobLevel: '', hourlyRate: '',
        site: '', status: 'active', officeLocation: '', workMode: 'office',
        
        // Logistics-specific fields
        driverLicense: { number: '', expiryDate: '', type: '' },
        vehicleAssignment: { vehicleId: '', vehicleType: '', assignedDate: '' },
        workShifts: [], certifications: [],
        
        // Compensation & Benefits
        allowances: { transport: 0, housing: 0, meal: 0, other: 0 },
        bankInfo: { bankName: '', accountNumber: '', iban: '' },
        payrollIncluded: true, bonusEligible: true,
        
        // Emergency Contacts & Skills
        emergencyContacts: [], skillTags: [], customTags: [],
        
        // Notes & Risk
        privateNotes: '', attritionRisk: 'low',
        
        // Readiness Tracker
        readinessTracker: {
          licenseValid: false,
          safetyTraining: false,
          medicallyFit: false,
          vehicleAssigned: false,
          readyForField: false
        },
        
        // Leave & Attendance
        leaveBalanceDetails: { vacation: 0, sick: 0, personal: 0, other: 0 },
        upcomingLeaves: [],
        attendanceLog: [],
        attendancePercentage: 0,
        absenceFrequency: 0,
        
        // Performance
        performance: {
          lastReviewDate: '',
          rating: 0,
          goals: [],
          feedback: [],
          kpis: { deliveryTimeliness: 0, customerComplaints: 0, vehicleUtilization: 0, delayPercentage: 0 }
        },
        
        // Documents & Compliance
        documents: [],
        compliance: {
          visaExpiry: '',
          workPermitExpiry: '',
          medicalCheckExpiry: '',
          insuranceStatus: 'active'
        },
        
        // Timeline & History
        timeline: [],
        hrActions: [],
        
        // Recognition & Awards
        recognition: [],
        
        // Equipment & Assets
        equipment: [],
        
        // HR Notes
        hrNotes: [],
        
        // Organizational
        orgChart: { manager: '', directReports: [], peers: [] },
        
        // Overtime & Hours
        overtime: { weeklyHours: 0, monthlyHours: 0, overtimeHours: 0, overtimePay: 0 },
        workPermitStart: '',
        workPermitEnd: '',
        workPermitCopy: null,
        employeeType: '',
        citizenType: '',
        residencyNumber: '',
      });
      setTodayAttendance(null);
      setAttendanceHistory([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ 
      name: '', email: '', phone: '', position: '', department: '', 
      salary: '', benefits: [], leaveBalance: '', hireDate: '', 
      address: '', emergencyContact: '', skills: [], manager: '', location: '',
      // Enhanced comprehensive fields
      employeeId: '', personalEmail: '', dateOfBirth: '', nationality: '',
      passportNumber: '', civilId: '', gender: 'male', maritalStatus: 'single',
      employmentType: 'full-time', jobLevel: '', hourlyRate: '',
      site: '', status: 'active', officeLocation: '', workMode: 'office',
      
      // Logistics-specific fields
      driverLicense: { number: '', expiryDate: '', type: '' },
      vehicleAssignment: { vehicleId: '', vehicleType: '', assignedDate: '' },
      workShifts: [], certifications: [],
      
      // Compensation & Benefits
      allowances: { transport: 0, housing: 0, meal: 0, other: 0 },
      bankInfo: { bankName: '', accountNumber: '', iban: '' },
      payrollIncluded: true, bonusEligible: true,
      
      // Emergency Contacts & Skills
      emergencyContacts: [], skillTags: [], customTags: [],
      
      // Notes & Risk
      privateNotes: '', attritionRisk: 'low',
      
      // Readiness Tracker
      readinessTracker: {
        licenseValid: false,
        safetyTraining: false,
        medicallyFit: false,
        vehicleAssigned: false,
        readyForField: false
      },
      
      // Leave & Attendance
      leaveBalanceDetails: { vacation: 0, sick: 0, personal: 0, other: 0 },
      upcomingLeaves: [],
      attendanceLog: [],
      attendancePercentage: 0,
      absenceFrequency: 0,
      
      // Performance
      performance: {
        lastReviewDate: '',
        rating: 0,
        goals: [],
        feedback: [],
        kpis: { deliveryTimeliness: 0, customerComplaints: 0, vehicleUtilization: 0, delayPercentage: 0 }
      },
      
      // Documents & Compliance
      documents: [],
      compliance: {
        visaExpiry: '',
        workPermitExpiry: '',
        medicalCheckExpiry: '',
        insuranceStatus: 'active'
      },
      
      // Timeline & History
      timeline: [],
      hrActions: [],
      
      // Recognition & Awards
      recognition: [],
      
      // Equipment & Assets
      equipment: [],
      
      // HR Notes
      hrNotes: [],
      
      // Organizational
      orgChart: { manager: '', directReports: [], peers: [] },
      
      // Overtime & Hours
      overtime: { weeklyHours: 0, monthlyHours: 0, overtimeHours: 0, overtimePay: 0 },
      workPermitStart: '',
      workPermitEnd: '',
      workPermitCopy: null,
      employeeType: '',
      citizenType: '',
      residencyNumber: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleBenefitsChange = (event: any) => {
    const { value } = event.target;
    setForm((prev) => {
      const newBenefits = (typeof value === 'string' ? value.split(',') : value).map((type: string) => {
        const existing = (prev.benefits ?? []).find((b) => b.type === type);
        return existing ? existing : { type, value: 0 };
      });
      return { ...prev, benefits: newBenefits };
    });
  };

  const handleBenefitValueChange = (type: string, newValue: number) => {
    setForm((prev) => ({
      ...prev,
      benefits: (prev.benefits ?? []).map((b) => b.type === type ? { ...b, value: newValue } : b),
    }));
  };

  const handleEmergencyContactChange = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts ?? []).map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const addEmergencyContact = () => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts ?? []), { name: '', relationship: '', phone: '', email: '' }],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleSkillTagChange = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      skillTags: (prev.skillTags ?? []).map((tag, i) => 
        i === index ? { ...tag, [field]: value } : tag
      ),
    }));
  };

  const addSkillTag = () => {
    setForm((prev) => ({
      ...prev,
      skillTags: [...(prev.skillTags ?? []), { name: '', level: 'beginner', endorsedBy: [] }],
    }));
  };

  const removeSkillTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      skillTags: (prev.skillTags ?? []).filter((_, i) => i !== index),
    }));
  };

  // Bulk Actions
  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp._id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEmployees.length === 0) {
      setError('Please select employees first');
      return;
    }

    setBulkActionSubmitting(true);
    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedEmployees.map(id => 
            api.put(`/employees/${id}`, { active: true })
          ));
          setSuccess(`${selectedEmployees.length} employees activated`);
          break;
        case 'deactivate':
          await Promise.all(selectedEmployees.map(id => 
            api.put(`/employees/${id}`, { active: false })
          ));
          setSuccess(`${selectedEmployees.length} employees deactivated`);
          break;
        case 'export':
          setExportDialog(true);
          break;
        case 'send-message':
          setSuccess(`Message sent to ${selectedEmployees.length} employees`);
          break;
        case 'assign-role':
          setSuccess(`Role assigned to ${selectedEmployees.length} employees`);
          break;
        default:
          setError('Invalid action');
      }
      setSelectedEmployees([]);
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk action failed');
    } finally {
      setBulkActionSubmitting(false);
      setBulkActionDialog({ open: false, action: '' });
    }
  };

  // Export functionality
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const selectedData = employees.filter(emp => selectedEmployees.includes(emp._id));
      const data = selectedData.map(emp => ({
        'Employee ID': emp.employeeId || 'N/A',
        'Full Name': emp.name,
        'Email': emp.email,
        'Position': emp.position,
        'Department': emp.department,
        'Status': emp.status || 'active',
        'Employment Type': emp.employmentType || 'full-time',
        'Site': emp.site || 'N/A',
        'Hire Date': emp.hireDate,
        'Salary': emp.salary,
        'Phone': emp.phone || 'N/A'
      }));

      if (format === 'csv') {
        const csvContent = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      setSuccess(`Exported ${selectedData.length} employees to ${format.toUpperCase()}`);
      setExportDialog(false);
    } catch (err) {
      setError('Export failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
        leaveBalance: Number(form.leaveBalance),
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        skills: form.skills,
        emergencyContacts: form.emergencyContacts,
        skillTags: form.skillTags,
        workPermitCopy: (typeof form.workPermitCopy === 'object' && form.workPermitCopy !== null && 'name' in form.workPermitCopy)
          ? form.workPermitCopy.name
          : typeof form.workPermitCopy === 'string'
            ? form.workPermitCopy
            : '',
        // Only send relevant fields
        civilId: form.employeeType === 'Citizen' ? form.civilId : undefined,
        citizenType: form.employeeType === 'Citizen' ? form.citizenType : undefined,
        residencyNumber: form.employeeType === 'Foreigner' ? form.residencyNumber : undefined,
        nationality: form.employeeType === 'Foreigner' ? form.nationality : undefined,
      };

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
        setSuccess('Employee updated successfully!');
      } else {
        await api.post('/employees', payload);
        setSuccess('Employee created successfully!');
      }
      fetchEmployees();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.put(`/employees/${id}/deactivate`, {});
      setSuccess('Employee deactivated!');
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate employee');
    }
  };

  const handleViewDetails = (employee: Employee) => {
    navigate(`/employees/${employee._id}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'success' : 'default';
  };

  // Attendance handlers
  const handleCheckIn = async () => {
    if (!editingId) return;
    
    try {
      const response = await api.post<CheckInResponse>(`/employees/${editingId}/attendance/check-in`);
      
      if (response.data.attendance) {
        setTodayAttendance(response.data.attendance);
        
        // Update attendance history
        setAttendanceHistory(prev => {
          const filtered = prev.filter(record => record.date !== response.data.attendance.date);
          return [...filtered, response.data.attendance];
        });
        
        // Update form attendance log
        setForm(prev => ({
          ...prev,
          attendanceLog: [
            ...(prev.attendanceLog || []).filter(record => record.date !== response.data.attendance.date),
            response.data.attendance
          ],
          attendancePercentage: response.data.stats.attendancePercentage,
          absenceFrequency: response.data.stats.absenceFrequency
        }));
      }
    } catch (error) {
      console.error('Error checking in:', error);
      // Fallback to local state update if API fails
      const now = new Date();
      const checkInTime = now.toLocaleTimeString();
      const today = now.toISOString().split('T')[0];
      
      const newAttendance = {
        date: today,
        checkIn: checkInTime,
        checkOut: '',
        hours: 0,
        status: 'present' as const
      };
      
      setTodayAttendance(newAttendance);
      setAttendanceHistory(prev => {
        const filtered = prev.filter(record => record.date !== today);
        return [...filtered, newAttendance];
      });
    }
  };

  const handleCheckOut = async () => {
    if (!editingId || !todayAttendance?.checkIn) return;
    
    try {
      const response = await api.post<CheckOutResponse>(`/employees/${editingId}/attendance/check-out`);
      
      if (response.data.attendance) {
        setTodayAttendance(response.data.attendance);
        
        // Update attendance history
        setAttendanceHistory(prev => 
          prev.map(record => 
            record.date === response.data.attendance.date ? response.data.attendance : record
          )
        );
        
        // Update form attendance log
        setForm(prev => ({
          ...prev,
          attendanceLog: (prev.attendanceLog || []).map(record => 
            record.date === response.data.attendance.date ? response.data.attendance : record
          ),
          attendancePercentage: response.data.stats.attendancePercentage,
          absenceFrequency: response.data.stats.absenceFrequency
        }));
      }
    } catch (error) {
      console.error('Error checking out:', error);
      // Fallback to local state update if API fails
      const now = new Date();
      const checkOutTime = now.toLocaleTimeString();
      const checkInTime = new Date(`2000-01-01T${todayAttendance.checkIn}`);
      const checkOutDateTime = new Date(`2000-01-01T${checkOutTime}`);
      
      // Calculate hours worked
      const hoursWorked = (checkOutDateTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      
      const updatedAttendance = {
        ...todayAttendance,
        checkOut: checkOutTime,
        hours: Math.round(hoursWorked * 100) / 100
      };
      
      setTodayAttendance(updatedAttendance);
      setAttendanceHistory(prev => 
        prev.map(record => 
          record.date === updatedAttendance.date ? updatedAttendance : record
        )
      );
    }
  };

  const handleMarkLeave = async () => {
    if (!editingId) return;
    
    try {
      const response = await api.post<MarkLeaveResponse>(`/employees/${editingId}/attendance/mark-leave`);
      
      if (response.data.attendance) {
        setTodayAttendance(response.data.attendance);
        
        // Update attendance history
        setAttendanceHistory(prev => {
          const filtered = prev.filter(record => record.date !== response.data.attendance.date);
          return [...filtered, response.data.attendance];
        });
        
        // Update form attendance log and leave balance
        setForm(prev => ({
          ...prev,
          attendanceLog: [
            ...(prev.attendanceLog || []).filter(record => record.date !== response.data.attendance.date),
            response.data.attendance
          ],
          leaveBalanceDetails: response.data.leaveBalance || prev.leaveBalanceDetails,
          attendancePercentage: response.data.stats.attendancePercentage,
          absenceFrequency: response.data.stats.absenceFrequency
        }));
      }
    } catch (error) {
      console.error('Error marking leave:', error);
      // Fallback to local state update if API fails
      const today = new Date().toISOString().split('T')[0];
      
      const leaveAttendance = {
        date: today,
        checkIn: '',
        checkOut: '',
        hours: 0,
        status: 'on-leave' as const
      };
      
      setTodayAttendance(leaveAttendance);
      setAttendanceHistory(prev => {
        const filtered = prev.filter(record => record.date !== today);
        return [...filtered, leaveAttendance];
      });
    }
  };

  const handleEditAttendance = (index: number) => {
    // This would open a dialog to edit attendance record
    console.log('Edit attendance record:', attendanceHistory[index]);
  };

  const generateAttendanceHeatmap = () => {
    const days = [];
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    for (let i = 0; i < 31; i++) {
      const date = new Date(startOfMonth);
      date.setDate(date.getDate() + i);
      
      if (date.getMonth() !== today.getMonth()) break;
      
      const dateStr = date.toISOString().split('T')[0];
      const record = attendanceHistory.find(r => r.date === dateStr);
      
      let color = '#e0e0e0'; // Default gray
      let status = 'No Record';
      
      if (record) {
        switch (record.status) {
          case 'present':
            color = '#4caf50';
            status = 'Present';
            break;
          case 'absent':
            color = '#f44336';
            status = 'Absent';
            break;
          case 'late':
            color = '#ff9800';
            status = 'Late';
            break;
          case 'on-leave':
            color = '#2196f3';
            status = 'On Leave';
            break;
        }
      }
      
      days.push({
        day: date.getDate(),
        date: dateStr,
        color,
        status
      });
    }
    
    return days;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'workPermitCopy') {
      setForm((prev: any) => ({ ...prev, workPermitCopy: files && files[0] ? files[0] : null }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: files?.[0] }));
    }
  };

  // Helper function to calculate readiness status
  const calculateReadinessStatus = (readinessTracker: any) => {
    const { licenseValid, safetyTraining, medicallyFit, vehicleAssigned } = readinessTracker;
    return licenseValid && safetyTraining && medicallyFit && vehicleAssigned;
  };

    return (
    <>
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
                    <GroupIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Employee Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage your workforce with advanced HR tools and logistics tracking
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  <Button
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    startIcon={<ViewListIcon />}
                    onClick={() => setViewMode('table')}
                    sx={{ 
                      bgcolor: viewMode === 'table' ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Table View
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                    startIcon={<ViewModuleIcon />}
                    onClick={() => setViewMode('cards')}
                    sx={{ 
                      bgcolor: viewMode === 'cards' ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Card View
                  </Button>
                  <Button
                    variant={timelineView ? 'contained' : 'outlined'}
                    startIcon={<TimelineIcon />}
                    onClick={() => setTimelineView(!timelineView)}
                    sx={{ 
                      bgcolor: timelineView ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Timeline View
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ 
                      ml: 1,
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Add Employee
                  </Button>
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
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {enhancedStats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Total Employees
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: 2,
                    p: 1.5
                  }}>
                    <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {enhancedStats.active}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Active
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                    borderRadius: 2,
                    p: 1.5
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {enhancedStats.readyForField}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Ready for Field
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                    borderRadius: 2,
                    p: 1.5
                  }}>
                    <VerifiedUserIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #f44336, #e91e63)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {enhancedStats.needsAttention}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Need Attention
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #f44336, #e91e63)',
                    borderRadius: 2,
                    p: 1.5
                  }}>
                    <WarningIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #2196f3, #03a9f4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {enhancedStats.avgSalary.toLocaleString(undefined, { style: 'currency', currency: 'KWD', maximumFractionDigits: 0 })}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Avg Salary
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #2196f3, #03a9f4)',
                    borderRadius: 2,
                    p: 1.5
                  }}>
                    <MoneyIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: alpha(muiTheme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
            borderRadius: muiTheme.shape.borderRadius
          }}>
            <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
            {/* Search Section */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: '1 1 400px' }}>
              <TextField
                placeholder="Search employees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearch('')} size="small">
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }
                }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={filters.searchBy}
                  onChange={(e) => setFilters({ ...filters, searchBy: e.target.value as any })}
                  label="Search By"
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="id">Employee ID</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Results Count */}
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: 'text.secondary',
              background: 'rgba(25, 118, 210, 0.1)',
              px: 2,
              py: 1,
              borderRadius: 2
            }}>
              {filteredEmployees.length} of {employees.length} employees
            </Typography>
            
            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: showFilters ? 'linear-gradient(45deg, #1976d2, #42a5f5)' : 'transparent',
                '&:hover': {
                  background: showFilters ? 'linear-gradient(45deg, #1565c0, #1976d2)' : 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Advanced Filters
            </Button>
          </Box>

          {showFilters && (
            <Box sx={{ 
              mt: 3, 
              pt: 3, 
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 2,
              p: 2
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Filter Options
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                      label="Department"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {departmentOptions.map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      label="Status"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="on-leave">On Leave</MenuItem>
                      <MenuItem value="resigned">Resigned</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Position</InputLabel>
                    <Select
                      value={filters.position}
                      onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                      label="Position"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      <MenuItem value="">All Positions</MenuItem>
                      {positionOptions.map(pos => (
                        <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Site</InputLabel>
                    <Select
                      value={filters.site}
                      onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                      label="Site"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      <MenuItem value="">All Sites</MenuItem>
                      {siteOptions.map(site => (
                        <MenuItem key={site} value={site}>{site}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      value={filters.employmentType}
                      onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
                      label="Employment Type"
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {employmentTypeOptions.map(type => (
                        <MenuItem key={type} value={type}>{type.replace('-', ' ').toUpperCase()}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setFilters({ department: '', status: '', position: '', site: '', employmentType: '', dateRange: '', searchBy: 'name' })}
                    startIcon={<FilterAltIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      {selectedEmployees.length > 0 && (
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {selectedEmployees.length} employee(s) selected
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedEmployees([])}
                sx={{ borderRadius: 2 }}
              >
                Clear Selection
              </Button>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleBulkAction('activate')}
                disabled={bulkActionSubmitting}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  '&:hover': { background: 'linear-gradient(45deg, #388e3c, #4caf50)' }
                }}
              >
                Activate
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkActionSubmitting}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #f44336, #ef5350)',
                  '&:hover': { background: 'linear-gradient(45deg, #d32f2f, #f44336)' }
                }}
              >
                Deactivate
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleBulkAction('export')}
                disabled={bulkActionSubmitting}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  '&:hover': { background: 'linear-gradient(45deg, #f57c00, #ff9800)' }
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<MessageIcon />}
                onClick={() => handleBulkAction('send-message')}
                disabled={bulkActionSubmitting}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                  '&:hover': { background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)' }
                }}
              >
                Send Message
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AssignmentIcon />}
                onClick={() => handleBulkAction('assign-role')}
                disabled={bulkActionSubmitting}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #607d8b, #90a4ae)',
                  '&:hover': { background: 'linear-gradient(45deg, #455a64, #607d8b)' }
                }}
              >
                Assign Role
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress size={60} />
        </Box>
      ) : viewMode === 'cards' ? (
        // Enhanced Cards View
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {filteredEmployees.map((employee) => (
            <Box key={employee._id} sx={{ flex: '1 1 350px', minWidth: 350, maxWidth: 450 }}>
              <Card sx={{ 
                height: '100%', 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header with Photo and Basic Info */}
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mr: 3,
                        background: employee.active ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'linear-gradient(45deg, #9e9e9e, #bdbdbd)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      {getInitials(employee.name)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {employee.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {employee.position}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip 
                          label={employee.employeeId || 'No ID'} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            fontWeight: 500
                          }}
                        />
                        <Chip 
                          label={employee.status === 'active' ? 'Active' : 
                                 employee.status === 'on-leave' ? 'On Leave' :
                                 employee.status === 'resigned' ? 'Resigned' :
                                 employee.status === 'suspended' ? 'Suspended' :
                                 employee.active ? 'Active' : 'Inactive'} 
                          color={employee.status === 'active' || employee.active ? 'success' : 
                                 employee.status === 'on-leave' ? 'warning' :
                                 employee.status === 'resigned' ? 'error' : 'default'} 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Contact and Department Info */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon sx={{ fontSize: 18, mr: 1.5, color: '#1976d2' }} />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {employee.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <WorkIcon sx={{ fontSize: 18, mr: 1.5, color: '#1976d2' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.department}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationIcon sx={{ fontSize: 18, mr: 1.5, color: '#1976d2' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.site || employee.location || 'Location Not Assigned'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <BusinessIcon sx={{ fontSize: 18, mr: 1.5, color: '#1976d2' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.employmentType ? employee.employmentType.replace('-', ' ').toUpperCase() : 'FULL-TIME'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Readiness Tracker (for drivers/operators) */}
                  {employee.readinessTracker && (
                    <Box sx={{ mb: 3, p: 2, background: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                        Readiness Status
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip 
                          label="License" 
                          size="small" 
                          color={employee.readinessTracker.licenseValid ? 'success' : 'error'}
                          icon={employee.readinessTracker.licenseValid ? <CheckCircleIcon /> : <CancelIcon />}
                        />
                        <Chip 
                          label="Training" 
                          size="small" 
                          color={employee.readinessTracker.safetyTraining ? 'success' : 'error'}
                          icon={employee.readinessTracker.safetyTraining ? <CheckCircleIcon /> : <CancelIcon />}
                        />
                        <Chip 
                          label="Medical" 
                          size="small" 
                          color={employee.readinessTracker.medicallyFit ? 'success' : 'error'}
                          icon={employee.readinessTracker.medicallyFit ? <CheckCircleIcon /> : <CancelIcon />}
                        />
                        <Chip 
                          label="Vehicle" 
                          size="small" 
                          color={employee.readinessTracker.vehicleAssigned ? 'success' : 'error'}
                          icon={employee.readinessTracker.vehicleAssigned ? <CheckCircleIcon /> : <CancelIcon />}
                        />
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={employee.readinessTracker.readyForField ? 'Ready for Field' : 'Not Ready'} 
                          size="small" 
                          color={employee.readinessTracker.readyForField ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Certifications */}
                  {employee.certifications && employee.certifications.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                        Certifications
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {employee.certifications.slice(0, 3).map((cert, idx) => (
                          <Chip 
                            key={cert.id || idx} 
                            label={cert.name} 
                            size="small" 
                            variant="outlined"
                            color={cert.status === 'valid' ? 'success' : 
                                   cert.status === 'expired' ? 'error' : 'warning'}
                          />
                        ))}
                        {employee.certifications.length > 3 && (
                          <Chip 
                            label={`+${employee.certifications.length - 3} more`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Quick Stats */}
                  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {employee.leaveBalance || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Leave Days
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, background: 'rgba(25, 118, 210, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {employee.attendancePercentage || 0}%
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Attendance
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        {employee.salary?.toLocaleString(undefined, { style: 'currency', currency: 'KWD', maximumFractionDigits: 0 }) || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Salary
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(employee)}
                      fullWidth
                      sx={{ 
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                        }
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpen(employee)}
                      sx={{ 
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        '&:hover': {
                          borderColor: '#388e3c',
                          background: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        // Modern Table View
        <Paper sx={{ 
          overflowX: 'auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
                  }
                }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < filteredEmployees.length}
                      onChange={handleSelectAll}
                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                    />
                  </TableCell>
                  <TableCell>Photo</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Employment Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((e, idx) => (
                  <TableRow 
                    key={e._id} 
                    sx={{ 
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        background: 'rgba(25, 118, 210, 0.05)',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(e._id)}
                        onChange={() => handleSelectEmployee(e._id)}
                        sx={{ 
                          color: '#1976d2',
                          '&.Mui-checked': { color: '#1976d2' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          background: e.active ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'linear-gradient(45deg, #9e9e9e, #bdbdbd)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        {getInitials(e.name)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {e.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {e.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                        {e.employeeId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {e.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={e.department} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {e.site || e.location || 'Not Assigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={e.employmentType ? e.employmentType.replace('-', ' ').toUpperCase() : 'FULL-TIME'} 
                        size="small"
                        sx={{ 
                          background: e.employmentType === 'full-time' ? '#e3f2fd' : 
                                   e.employmentType === 'part-time' ? '#fff3e0' :
                                   e.employmentType === 'contractor' ? '#f3e5f5' : '#e8f5e8',
                          color: e.employmentType === 'full-time' ? '#1976d2' :
                                 e.employmentType === 'part-time' ? '#f57c00' :
                                 e.employmentType === 'contractor' ? '#7b1fa2' : '#388e3c',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {e.status === 'active' ? (
                        <Chip label="Active" color="success" size="small" sx={{ fontWeight: 600 }} />
                      ) : e.status === 'on-leave' ? (
                        <Chip label="On Leave" color="warning" size="small" sx={{ fontWeight: 600 }} />
                      ) : e.status === 'resigned' ? (
                        <Chip label="Resigned" color="error" size="small" sx={{ fontWeight: 600 }} />
                      ) : e.status === 'suspended' ? (
                        <Chip label="Suspended" color="default" size="small" sx={{ fontWeight: 600 }} />
                      ) : (
                        <Chip label={e.active ? 'Active' : 'Inactive'} color={e.active ? 'success' : 'default'} size="small" sx={{ fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Profile">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(e)}
                            sx={{ 
                              color: '#1976d2',
                              '&:hover': { background: 'rgba(25, 118, 210, 0.1)' }
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Employee">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpen(e)}
                            sx={{ 
                              color: '#4caf50',
                              '&:hover': { background: 'rgba(76, 175, 80, 0.1)' }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {e.active && (
                          <Tooltip title="Deactivate Employee">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeactivate(e._id)}
                              sx={{ 
                                '&:hover': { background: 'rgba(244, 67, 54, 0.1)' }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Timeline View */}
      {timelineView && (
        <Paper sx={{ 
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
            Employee Timeline
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredEmployees.map((employee, index) => (
              <Card key={employee._id} sx={{ 
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                      background: employee.active ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'linear-gradient(45deg, #9e9e9e, #bdbdbd)'
                    }}>
                      {getInitials(employee.name)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {employee.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {employee.position} • {employee.department}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip 
                          label={employee.status || 'Active'} 
                          size="small" 
                          color={employee.status === 'active' ? 'success' : 'default'}
                        />
                        <Chip 
                          label={employee.employmentType || 'Full-time'} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(employee)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpen(employee)}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* Enhanced Add/Edit Employee Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth 
        scroll="paper"
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingId ? 'Edit Employee' : 'Add New Employee'}
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Tabbed Interface */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 120
                  }
                }}
              >
                <Tab label="Personal Info" />
                <Tab label="Employment" />
                <Tab label="Logistics" />
                <Tab label="Compensation" />
                <Tab label="Emergency & Skills" />
                <Tab label="Readiness" />
                <Tab label="Attendance" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
              {/* Personal Info Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Full Name" 
                        name="name" 
                        value={form.name} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Employee ID" 
                        name="employeeId" 
                        value={form.employeeId} 
                        onChange={handleFormChange} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Corporate Email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        type="email" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Personal Email" 
                        name="personalEmail" 
                        value={form.personalEmail} 
                        onChange={handleFormChange} 
                        fullWidth 
                        type="email" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Phone" 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleFormChange} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Date of Birth" 
                        name="dateOfBirth" 
                        value={form.dateOfBirth} 
                        onChange={handleFormChange} 
                        fullWidth 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Gender" 
                        name="gender" 
                        value={form.gender} 
                        onChange={handleFormChange} 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Marital Status" 
                        name="maritalStatus" 
                        value={form.maritalStatus} 
                        onChange={handleFormChange} 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="single">Single</MenuItem>
                        <MenuItem value="married">Married</MenuItem>
                        <MenuItem value="divorced">Divorced</MenuItem>
                        <MenuItem value="widowed">Widowed</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Passport Number" 
                        name="passportNumber" 
                        value={form.passportNumber} 
                        onChange={handleFormChange} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 100%', width: '100%' }}>
                      <TextField 
                        label="Address" 
                        name="address" 
                        value={form.address} 
                        onChange={handleFormChange} 
                        fullWidth 
                        multiline 
                        rows={2}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField
                        select
                        label="Employee Type"
                        name="employeeType"
                        value={form.employeeType || ''}
                        onChange={handleFormChange}
                        required
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="Citizen">Citizen</MenuItem>
                        <MenuItem value="Foreigner">Foreigner</MenuItem>
                      </TextField>
                    </Box>
                    {/* Conditional fields based on Employee Type */}
                    {form.employeeType === 'Citizen' && (
                      <>
                        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                          <TextField
                            label="Civil ID"
                            name="civilId"
                            value={form.civilId || ''}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                          <TextField
                            select
                            label="Citizen Type"
                            name="citizenType"
                            value={form.citizenType || ''}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            <MenuItem value="Kuwaiti">Kuwaiti</MenuItem>
                            <MenuItem value="Bedoun">Bedoun</MenuItem>
                          </TextField>
                        </Box>
                      </>
                    )}
                    {form.employeeType === 'Foreigner' && (
                      <>
                        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                          <TextField
                            label="Residency No."
                            name="residencyNumber"
                            value={form.residencyNumber || ''}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                          <TextField
                            label="Nationality"
                            name="nationality"
                            value={form.nationality || ''}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        </Box>
                      </>
                    )}
                    {/* Removed extra conditional nationality field for non-citizens to avoid duplicate */}
                  </Box>
                </Box>
              )}

              {/* Employment Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Employment Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Position" 
                        name="position" 
                        value={form.position} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        {positionOptions.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Department" 
                        name="department" 
                        value={form.department} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        {departmentOptions.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Employment Type" 
                        name="employmentType" 
                        value={form.employmentType} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="full-time">Full-time</MenuItem>
                        <MenuItem value="part-time">Part-time</MenuItem>
                        <MenuItem value="contractor">Contractor</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Job Level" 
                        name="jobLevel" 
                        value={form.jobLevel} 
                        onChange={handleFormChange} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Hire Date" 
                        name="hireDate" 
                        value={form.hireDate} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Site" 
                        name="site" 
                        value={form.site} 
                        onChange={handleFormChange} 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="Main Warehouse">Main Warehouse</MenuItem>
                        <MenuItem value="Port Branch">Port Branch</MenuItem>
                        <MenuItem value="HQ">HQ</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Status" 
                        name="status" 
                        value={form.status} 
                        onChange={handleFormChange} 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="on-leave">On Leave</MenuItem>
                        <MenuItem value="resigned">Resigned</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Office Location" 
                        name="officeLocation" 
                        value={form.officeLocation} 
                        onChange={handleFormChange} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Work Mode" 
                        name="workMode" 
                        value={form.workMode} 
                        onChange={handleFormChange} 
                        fullWidth 
                        select
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="office">Office</MenuItem>
                        <MenuItem value="remote">Remote</MenuItem>
                        <MenuItem value="hybrid">Hybrid</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Manager" 
                        name="manager" 
                        value={form.manager} 
                        onChange={handleFormChange} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Work Permit Start Date"
                        name="workPermitStart"
                        value={form.workPermitStart}
                        onChange={handleFormChange}
                        fullWidth
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Work Permit End Date"
                        name="workPermitEnd"
                        value={form.workPermitEnd}
                        onChange={handleFormChange}
                        fullWidth
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300, display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ minWidth: 180, height: 56, alignSelf: 'center', mb: 2 }}
                      >
                        Upload Work Permit Copy
                        <input type="file" name="workPermitCopy" hidden onChange={handleFileChange} />
                      </Button>
                      {form.workPermitCopy && typeof form.workPermitCopy === 'object' && form.workPermitCopy !== null && 'name' in (form.workPermitCopy as File) && (
                        <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
                          {(form.workPermitCopy as File).name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Logistics Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Logistics & Operations
                  </Typography>
                  
                  {/* Driver License */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                    Driver License Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="License Number" 
                        name="driverLicense.number" 
                        value={form.driverLicense?.number ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          driverLicense: { ...(form.driverLicense ?? { number: '', expiryDate: '', type: '' }), number: e.target.value, expiryDate: form.driverLicense?.expiryDate ?? '', type: form.driverLicense?.type ?? '' }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="License Type" 
                        name="driverLicense.type" 
                        value={form.driverLicense?.type ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          driverLicense: { ...(form.driverLicense ?? { number: '', expiryDate: '', type: '' }), number: form.driverLicense?.number ?? '', expiryDate: form.driverLicense?.expiryDate ?? '', type: e.target.value }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Expiry Date" 
                        name="driverLicense.expiryDate" 
                        value={form.driverLicense?.expiryDate ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          driverLicense: { ...(form.driverLicense ?? { number: '', expiryDate: '', type: '' }), number: form.driverLicense?.number ?? '', expiryDate: e.target.value, type: form.driverLicense?.type ?? '' }
                        })} 
                        fullWidth 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>

                  {/* Vehicle Assignment */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                    Vehicle Assignment
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Vehicle ID" 
                        name="vehicleAssignment.vehicleId" 
                        value={form.vehicleAssignment?.vehicleId ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          vehicleAssignment: { ...(form.vehicleAssignment ?? { vehicleId: '', vehicleType: '', assignedDate: '' }), vehicleId: e.target.value, vehicleType: form.vehicleAssignment?.vehicleType ?? '', assignedDate: form.vehicleAssignment?.assignedDate ?? '' }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Vehicle Type" 
                        name="vehicleAssignment.vehicleType" 
                        value={form.vehicleAssignment?.vehicleType ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          vehicleAssignment: { ...(form.vehicleAssignment ?? { vehicleId: '', vehicleType: '', assignedDate: '' }), vehicleId: form.vehicleAssignment?.vehicleId ?? '', vehicleType: e.target.value, assignedDate: form.vehicleAssignment?.assignedDate ?? '' }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Assigned Date" 
                        name="vehicleAssignment.assignedDate" 
                        value={form.vehicleAssignment?.assignedDate ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          vehicleAssignment: { ...(form.vehicleAssignment ?? { vehicleId: '', vehicleType: '', assignedDate: '' }), vehicleId: form.vehicleAssignment?.vehicleId ?? '', vehicleType: form.vehicleAssignment?.vehicleType ?? '', assignedDate: e.target.value }
                        })} 
                        fullWidth 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Compensation Tab */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Compensation & Benefits
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Salary (KWD)" 
                        name="salary" 
                        value={form.salary} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Hourly Rate (KWD)" 
                        name="hourlyRate" 
                        value={form.hourlyRate} 
                        onChange={handleFormChange} 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Leave Balance" 
                        name="leaveBalance" 
                        value={form.leaveBalance} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>

                  {/* Allowances */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                    Allowances
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                      <TextField 
                        label="Transport Allowance" 
                        name="allowances.transport" 
                        value={form.allowances?.transport ?? 0} 
                        onChange={(e) => setForm({
                          ...form,
                          allowances: { ...(form.allowances ?? { transport: 0, housing: 0, meal: 0, other: 0 }), transport: Number(e.target.value), housing: form.allowances?.housing ?? 0, meal: form.allowances?.meal ?? 0, other: form.allowances?.other ?? 0 }
                        })} 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                      <TextField 
                        label="Housing Allowance" 
                        name="allowances.housing" 
                        value={form.allowances?.housing ?? 0} 
                        onChange={(e) => setForm({
                          ...form,
                          allowances: { ...(form.allowances ?? { transport: 0, housing: 0, meal: 0, other: 0 }), transport: form.allowances?.transport ?? 0, housing: Number(e.target.value), meal: form.allowances?.meal ?? 0, other: form.allowances?.other ?? 0 }
                        })} 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                      <TextField 
                        label="Meal Allowance" 
                        name="allowances.meal" 
                        value={form.allowances?.meal ?? 0} 
                        onChange={(e) => setForm({
                          ...form,
                          allowances: { ...(form.allowances ?? { transport: 0, housing: 0, meal: 0, other: 0 }), transport: form.allowances?.transport ?? 0, housing: form.allowances?.housing ?? 0, meal: Number(e.target.value), other: form.allowances?.other ?? 0 }
                        })} 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                      <TextField 
                        label="Other Allowance" 
                        name="allowances.other" 
                        value={form.allowances?.other ?? 0} 
                        onChange={(e) => setForm({
                          ...form,
                          allowances: { ...(form.allowances ?? { transport: 0, housing: 0, meal: 0, other: 0 }), transport: form.allowances?.transport ?? 0, housing: form.allowances?.housing ?? 0, meal: form.allowances?.meal ?? 0, other: Number(e.target.value) }
                        })} 
                        fullWidth 
                        type="number" 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>

                  {/* Bank Information */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                    Bank Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Bank Name" 
                        name="bankInfo.bankName" 
                        value={form.bankInfo?.bankName ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          bankInfo: { ...(form.bankInfo ?? { bankName: '', accountNumber: '', iban: '' }), bankName: e.target.value, accountNumber: form.bankInfo?.accountNumber ?? '', iban: form.bankInfo?.iban ?? '' }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="Account Number" 
                        name="bankInfo.accountNumber" 
                        value={form.bankInfo?.accountNumber ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          bankInfo: { ...(form.bankInfo ?? { bankName: '', accountNumber: '', iban: '' }), bankName: form.bankInfo?.bankName ?? '', accountNumber: e.target.value, iban: form.bankInfo?.iban ?? '' }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                      <TextField 
                        label="IBAN" 
                        name="bankInfo.iban" 
                        value={form.bankInfo?.iban ?? ''} 
                        onChange={(e) => setForm({
                          ...form,
                          bankInfo: { ...(form.bankInfo ?? { bankName: '', accountNumber: '', iban: '' }), bankName: form.bankInfo?.bankName ?? '', accountNumber: form.bankInfo?.accountNumber ?? '', iban: e.target.value }
                        })} 
                        fullWidth 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Emergency & Skills Tab */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Emergency Contacts & Skills
                  </Typography>
                  
                  {/* Emergency Contacts */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                    Emergency Contacts
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {(form.emergencyContacts ?? []).map((contact, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <TextField
                            label="Name"
                            value={contact.name}
                            onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <TextField
                            label="Relationship"
                            value={contact.relationship}
                            onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <TextField
                            label="Phone"
                            value={contact.phone}
                            onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <TextField
                            label="Email"
                            value={contact.email}
                            onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                            fullWidth
                            size="small"
                            type="email"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            onClick={() => removeEmergencyContact(index)}
                            color="error"
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addEmergencyContact}
                      size="small"
                    >
                      Add Emergency Contact
                    </Button>
                  </Box>

                  {/* Skill Tags */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                    Skill Tags
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {(form.skillTags ?? []).map((tag, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <TextField
                            label="Skill Name"
                            value={tag.name}
                            onChange={(e) => handleSkillTagChange(index, 'name', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <TextField
                            select
                            label="Level"
                            value={tag.level}
                            onChange={(e) => handleSkillTagChange(index, 'level', e.target.value)}
                            fullWidth
                            size="small"
                          >
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                            <MenuItem value="expert">Expert</MenuItem>
                          </TextField>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            onClick={() => removeSkillTag(index)}
                            color="error"
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addSkillTag}
                      size="small"
                    >
                      Add Skill Tag
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Readiness Tab */}
              {activeTab === 5 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Readiness Tracker
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.readinessTracker?.licenseValid ?? false}
                          onChange={(e) => {
                            const updatedReadinessTracker = {
                              ...(form.readinessTracker ?? { licenseValid: false, safetyTraining: false, medicallyFit: false, vehicleAssigned: false, readyForField: false }),
                              licenseValid: e.target.checked
                            };
                            setForm(prev => ({
                              ...prev,
                              readinessTracker: {
                                ...updatedReadinessTracker,
                                readyForField: calculateReadinessStatus(updatedReadinessTracker)
                              }
                            }));
                          }}
                          color="success"
                        />
                      }
                      label="License Valid"
                      sx={{ minWidth: 150 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.readinessTracker?.safetyTraining ?? false}
                          onChange={(e) => {
                            const updatedReadinessTracker = {
                              ...(form.readinessTracker ?? { licenseValid: false, safetyTraining: false, medicallyFit: false, vehicleAssigned: false, readyForField: false }),
                              safetyTraining: e.target.checked
                            };
                            setForm(prev => ({
                              ...prev,
                              readinessTracker: {
                                ...updatedReadinessTracker,
                                readyForField: calculateReadinessStatus(updatedReadinessTracker)
                              }
                            }));
                          }}
                          color="success"
                        />
                      }
                      label="Safety Training"
                      sx={{ minWidth: 150 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.readinessTracker?.medicallyFit ?? false}
                          onChange={(e) => {
                            const updatedReadinessTracker = {
                              ...(form.readinessTracker ?? { licenseValid: false, safetyTraining: false, medicallyFit: false, vehicleAssigned: false, readyForField: false }),
                              medicallyFit: e.target.checked
                            };
                            setForm(prev => ({
                              ...prev,
                              readinessTracker: {
                                ...updatedReadinessTracker,
                                readyForField: calculateReadinessStatus(updatedReadinessTracker)
                              }
                            }));
                          }}
                          color="success"
                        />
                      }
                      label="Medically Fit"
                      sx={{ minWidth: 150 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.readinessTracker?.vehicleAssigned ?? false}
                          onChange={(e) => {
                            const updatedReadinessTracker = {
                              ...(form.readinessTracker ?? { licenseValid: false, safetyTraining: false, medicallyFit: false, vehicleAssigned: false, readyForField: false }),
                              vehicleAssigned: e.target.checked
                            };
                            setForm(prev => ({
                              ...prev,
                              readinessTracker: {
                                ...updatedReadinessTracker,
                                readyForField: calculateReadinessStatus(updatedReadinessTracker)
                              }
                            }));
                          }}
                          color="success"
                        />
                      }
                      label="Vehicle Assigned"
                      sx={{ minWidth: 150 }}
                    />
                  </Box>
                  
                  {/* Readiness Status */}
                  <Paper sx={{ p: 2, background: form.readinessTracker?.readyForField ? '#e8f5e8' : '#fff3e0' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: form.readinessTracker?.readyForField ? '#2e7d32' : '#f57c00' }}>
                        Ready for Field: {form.readinessTracker?.readyForField ? '✅' : '❌'}
                      </Typography>
                      <Chip 
                        label={form.readinessTracker?.readyForField ? 'READY' : 'NOT READY'} 
                        color={form.readinessTracker?.readyForField ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}

              {/* Attendance Tab */}
              {activeTab === 6 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
                    Attendance Management
                  </Typography>
                  
                  {/* Today's Attendance */}
                  <Paper sx={{ p: 3, mb: 3, background: 'rgba(255, 255, 255, 0.8)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                      Today's Attendance - {new Date().toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<LoginIcon />}
                        onClick={() => handleCheckIn()}
                        disabled={todayAttendance?.checkIn}
                        sx={{ 
                          background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                          '&:hover': { background: 'linear-gradient(45deg, #388e3c, #4caf50)' }
                        }}
                      >
                        Check In
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<LogoutIcon />}
                        onClick={() => handleCheckOut()}
                        disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut}
                        sx={{ 
                          background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                          '&:hover': { background: 'linear-gradient(45deg, #f57c00, #ff9800)' }
                        }}
                      >
                        Check Out
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<EventNoteIcon />}
                        onClick={() => handleMarkLeave()}
                        sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                      >
                        Mark Leave
                      </Button>
                    </Box>
                    
                    {/* Today's Status */}
                    {todayAttendance && (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Check In: ${todayAttendance.checkIn || 'Not checked in'}`}
                          color={todayAttendance.checkIn ? 'success' : 'default'}
                          variant="outlined"
                        />
                        <Chip 
                          label={`Check Out: ${todayAttendance.checkOut || 'Not checked out'}`}
                          color={todayAttendance.checkOut ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        <Chip 
                          label={`Hours: ${todayAttendance.hours || 0}h`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`Status: ${todayAttendance.status}`}
                          color={
                            todayAttendance.status === 'present' ? 'success' :
                            todayAttendance.status === 'absent' ? 'error' :
                            todayAttendance.status === 'late' ? 'warning' : 'info'
                          }
                        />
                      </Box>
                    )}
                  </Paper>

                  {/* Attendance Statistics */}
                  <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <Paper sx={{ p: 2, flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {form.attendancePercentage || 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Attendance Rate (This Month)
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00' }}>
                        {form.absenceFrequency || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Absences (This Month)
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {form.leaveBalanceDetails?.vacation || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Vacation Days Left
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Attendance History */}
                  <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.8)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                      Attendance History (Last 30 Days)
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Check In</TableCell>
                            <TableCell>Check Out</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendanceHistory.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell>{record.checkIn || '-'}</TableCell>
                              <TableCell>{record.checkOut || '-'}</TableCell>
                              <TableCell>{record.hours || 0}h</TableCell>
                              <TableCell>
                                <Chip 
                                  label={record.status}
                                  size="small"
                                  color={
                                    record.status === 'present' ? 'success' :
                                    record.status === 'absent' ? 'error' :
                                    record.status === 'late' ? 'warning' : 'info'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditAttendance(index)}
                                  sx={{ color: '#1976d2' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>

                  {/* Attendance Heatmap */}
                  <Paper sx={{ p: 3, mt: 3, background: 'rgba(255, 255, 255, 0.8)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                      Attendance Heatmap (This Month)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {generateAttendanceHeatmap().map((day, index) => (
                        <Tooltip key={index} title={`${day.date}: ${day.status}`}>
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 1,
                              backgroundColor: day.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: '1px solid rgba(0,0,0,0.1)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: day.color === '#4caf50' ? 'white' : 'black'
                            }}
                          >
                            {day.day}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', borderRadius: 0.5 }} />
                        <Typography variant="caption">Present</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, backgroundColor: '#f44336', borderRadius: 0.5 }} />
                        <Typography variant="caption">Absent</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, backgroundColor: '#ff9800', borderRadius: 0.5 }} />
                        <Typography variant="caption">Late</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, backgroundColor: '#2196f3', borderRadius: 0.5 }} />
                        <Typography variant="caption">On Leave</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, background: 'rgba(25, 118, 210, 0.05)' }}>
          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeTab > 0 && (
                <Button 
                  onClick={() => setActiveTab(activeTab - 1)}
                  variant="outlined"
                >
                  Previous
                </Button>
              )}
              {activeTab < 6 && (
                <Button 
                  onClick={() => setActiveTab(activeTab + 1)}
                  variant="outlined"
                >
                  Next
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                color="primary" 
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
                sx={{
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  }
                }}
              >
                {editingId ? 'Update Employee' : 'Create Employee'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white'
        }}>
          Export Employee Data
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" gutterBottom>
            Export {selectedEmployees.length} selected employee(s) to:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              sx={{ 
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                '&:hover': { background: 'linear-gradient(45deg, #388e3c, #4caf50)' }
              }}
            >
              CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('excel')}
              sx={{ 
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                '&:hover': { background: 'linear-gradient(45deg, #f57c00, #ff9800)' }
              }}
            >
              Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('pdf')}
              sx={{ 
                background: 'linear-gradient(45deg, #f44336, #ef5350)',
                '&:hover': { background: 'linear-gradient(45deg, #d32f2f, #f44336)' }
              }}
            >
              PDF
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add employee"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpen()}
      >
        <AddIcon />
      </Fab>
      </Box>
    </>
  );
};

export default EmployeesPage; 