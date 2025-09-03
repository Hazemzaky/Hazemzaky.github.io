import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip as MuiTooltip,
  Avatar,
  Badge,
  useTheme,
  alpha,
  Fade,
  Grow,
  Zoom,
  Slide,
  Fab,
  Divider,
  LinearProgress,
  Skeleton,
  Grid,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  AttachFile as AttachFileIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import countries from '../utils/countries'; // Assume a countries list with { name, code, flagUrl }
import api from '../apiBase';
import dayjs from 'dayjs';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';


const tabLabels = [
  'Employees Record Tracking',
  'Government Document Management',
  'Assets Record Tracking',
  'Government Correspondence Log',
  'Legal Case Management',
  'Company Facility Documents',
  'Dashboard & Reports',
  // 'Employee Travel Management', // HIDDEN
];

const statusColors: Record<string, any> = {
  active: 'success',
  expired: 'error',
  under_renewal: 'warning',
  cancelled: 'default',
  deported: 'error',
};

const visaTypes = [
  { value: 'business_visa', label: 'Business Visa' },
  { value: 'work_visa', label: 'Work Visa' },
  { value: 'family_visa', label: 'Family Visa' },
  { value: 'other', label: 'Other' },
];

const nationalities = [
  { value: 'Kuwaiti', label: 'Kuwaiti' },
  { value: 'Beddon', label: 'Beddon' },
];

const sponsors = [
  { value: 'Masar', label: 'Masar' },
  { value: 'Ajal', label: 'Ajal' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

const passTypes = [
  { value: 'KOC', label: 'KOC' },
  { value: 'KNPC', label: 'KNPC' },
  { value: 'JO', label: 'JO Pass' },
  { value: 'RATQA', label: 'RATQA' },
  { value: 'ABDALI', label: 'ABDALI' },
  { value: 'WANEET', label: 'WANEET' },
];

const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
];

const dependentsLocationOptions = [
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'home_country', label: 'Home Country' },
  { value: 'other', label: 'Other' }
];

const documentTypes = [
  { value: 'commercial_license', label: 'Commercial License' },
  { value: 'import_license', label: 'Import License' },
  { value: 'traffic_license', label: 'Traffic License' },
  { value: 'municipality_license', label: 'Municipality License' },
  { value: 'fire_department_license', label: 'Fire Department License' },
  { value: 'other', label: 'Other' },
];
const documentStatusColors: Record<string, any> = {
  active: 'success',
  expired: 'error',
  pending_renewal: 'warning',
  suspended: 'warning',
  cancelled: 'default',
};

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#6d4c41', '#0288d1'];

// Add at the top, after imports
interface OtherApproval {
  authority: string;
  approvalNumber: string;
  approvalDate: string;
  expiryDate: string;
  status: string;
  notes: string;
}

interface FacilityForm {
  facilityName: string;
  facilityType: string;
  address: string;
  area: string;
  rentAgreement: {
    agreementNumber: string;
    landlordName: string;
    landlordContact: string;
    startDate: string;
    endDate: string;
    monthlyRent: string;
    securityDeposit: string;
    renewalTerms: string;
    status: string;
  };
  municipalityApproval: {
    approvalNumber: string;
    approvalDate: string;
    expiryDate: string;
    approvalType: string;
    status: string;
    renewalProcess: string;
  };
  fireDepartmentApproval: {
    approvalNumber: string;
    approvalDate: string;
    expiryDate: string;
    inspectionDate: string;
    status: string;
    findings: string;
    correctiveActions: string[];
  };
  mocApproval: {
    approvalNumber: string;
    approvalDate: string;
    expiryDate: string;
    approvalType: string;
    status: string;
  };
  otherApprovals: OtherApproval[];
  status: string;
  notes: string;
  // New fields for security deposit logic
  hasSecurityDeposit: string;
  securityDepositAmount: string;
  securityDepositAmortization: string;
}

// Add after imports and before AdminPage component
interface Pass {
  passType: string;
  issuanceDate: string;
  expiryDate: string;
  sponsor: string;
}

interface FormData {
  employee: string;
  employeeType: string;
  coId: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  residencyNumber: string;
  residencyExpiry: string;
  civilId: string;
  civilIdExpiry: string;
  visaType: string;
  visaNumber: string;
  visaExpiry: string;
  workPermitStart?: string;
  workPermitEnd?: string;
  workPermitCopy?: string | File | null;
  sponsor: string;
  status: string;
  hasPasses: string;
  passes: Pass[];
  maritalStatus: string;
  numberOfDependents: string;
  dependentsLocation: string;
  dependentsLocationOther: string;
  notes: string;
  documents: Record<string, any>;
  passCopies?: (File | string | null)[];
}

// 1. Add the installment period options at the top:
const installmentPeriodOptions = [3, 6, 12, 15, 18, 24];

// Add ministry options at the top of the file
const ministryOptions = [
  'Ministry of Petroleum',
  'Ministry of Interior',
  'Ministry of Foreign Affairs',
  'Ministry of Municipality',
  'Ministry A',
  'Ministry B',
  'Ministry C',
];

// Add ministry options at the top of the file
const legalCaseMinistryOptions = [
  'Ministry of Justice',
  'Ministry of Interior',
  'Ministry A',
  'Ministry B',
  'Other',
];
const paidOptions = ['Paid', 'Not Paid'];
const legalRepTypeOptions = ['Internal', 'External'];

// Add security deposit and amortization options at the top
const yesNoOptions = ['Yes', 'No'];
const amortizationOptions = Array.from({ length: 60 }, (_, i) => `${i + 1} Month`);

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  // Residency state
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<FormData>({
    employee: '',
    employeeType: '',
    coId: '',
    passportNumber: '',
    passportExpiry: '',
    nationality: '',
    residencyNumber: '',
    residencyExpiry: '',
    civilId: '',
    civilIdExpiry: '',
    visaType: '',
    visaNumber: '',
    visaExpiry: '',
    workPermitStart: '',
    workPermitEnd: '',
    workPermitCopy: null,
    sponsor: '',
    status: 'active',
    hasPasses: 'false',
    passes: [],
    maritalStatus: '',
    numberOfDependents: '',
    dependentsLocation: '',
    dependentsLocationOther: '',
    notes: '',
    documents: {},
    passCopies: [],
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Government Document Management state
  const [govDocs, setGovDocs] = useState<any[]>([]);
  const [govDocLoading, setGovDocLoading] = useState(false);
  const [govDocError, setGovDocError] = useState('');
  const [govDocSuccess, setGovDocSuccess] = useState('');
  const [govDocOpen, setGovDocOpen] = useState(false);
  const [govDocEditing, setGovDocEditing] = useState<any>(null);
  const [govDocForm, setGovDocForm] = useState<any>({
    documentType: '',
    documentNumber: '',
    title: '',
    description: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    status: 'active',
    renewalFee: '',
    renewalProcess: '',
    notes: '',
    documents: {},
  });
  const [govDocDeleteId, setGovDocDeleteId] = useState<string | null>(null);

  // Vehicle Registration & Clearance
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [vehicleForm, setVehicleForm] = useState<{
    vehicle: string;
    plateNumber: string;
    chassisNumber: string;
    engineNumber: string;
    registrationNumber: string;
    registrationExpiry: string;
    insuranceCompany: string;
    insurancePolicyNumber: string;
    insuranceExpiry: string;
    insuranceCost: string;
    insurancePaymentSystem: 'cash' | 'installments';
    insuranceInstallmentPeriod: string;
    status: string;
    renewalReminders: {
      enabled: boolean;
      reminderDays: number[];
      lastReminderSent: string;
    };
    notes: string;
    hasPasses: string; // 'yes' | 'no'
    passes: Array<{
      passType: string;
      issuanceDate: string;
      expiryDate: string;
      sponsor: string;
    }>;
    installmentCalculationMode: 'auto' | 'manual';
    installmentValue: string;
    registrationCardCountry?: string;
    registrationCardBrand?: string;
    registrationCardCapacity?: string;
    registrationCardShape?: string;
    registrationCardColour?: string;
    // New fields for asset registration type and periodic check
    assetRegistrationType: 'public' | 'private';
    periodicCheck: {
      issuanceDate: string;
      expiryDate: string;
    };
  }>(
    {
      vehicle: '',
      plateNumber: '',
      chassisNumber: '',
      engineNumber: '',
      registrationNumber: '',
      registrationExpiry: '',
      insuranceCompany: '',
      insurancePolicyNumber: '',
      insuranceExpiry: '',
      insuranceCost: '',
      insurancePaymentSystem: 'cash',
      insuranceInstallmentPeriod: '',
      status: 'active',
      renewalReminders: {
        enabled: false,
        reminderDays: [],
        lastReminderSent: '',
      },
      notes: '',
      hasPasses: 'false',
      passes: [],
      installmentCalculationMode: 'auto',
      installmentValue: '',
      // New fields for asset registration type and periodic check
      assetRegistrationType: 'public',
      periodicCheck: {
        issuanceDate: '',
        expiryDate: '',
      },
    }
  );
  const [vehicleEditing, setVehicleEditing] = useState<any>(null);
  const [vehicleError, setVehicleError] = useState('');
  const [vehicleSuccess, setVehicleSuccess] = useState('');
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleDeleteId, setVehicleDeleteId] = useState<string | null>(null);

  // Travel Management state
  const [travelRecords, setTravelRecords] = useState<any[]>([]);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelError, setTravelError] = useState('');

  // 1. Add state for itinerary tab, dialog, form, and editing
  const [travelItineraryTab, setTravelItineraryTab] = useState(0);
  const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false);
  const [itineraryEditing, setItineraryEditing] = useState<any>(null);
  const [itineraryForm, setItineraryForm] = useState<any>({
    employee: '',
    destinationCountry: '',
    destinationCity: '',
    purpose: '',
    startDate: '',
    endDate: '',
    flightDetails: '',
    accommodationInfo: '',
    contactAbroad: '',
    travelStatus: 'scheduled',
    notes: '',
  });
  const [itineraryError, setItineraryError] = useState('');
  const [itinerarySuccess, setItinerarySuccess] = useState('');
  const [itineraryDeleteId, setItineraryDeleteId] = useState<string | null>(null);

  // 1. Add state for document dialog
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docTravelRecord, setDocTravelRecord] = useState<any>(null);
  const [docList, setDocList] = useState<any[]>([]);
  const [docUploadType, setDocUploadType] = useState('');
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docUploadLoading, setDocUploadLoading] = useState(false);
  const [docError, setDocError] = useState('');

  // 1. Add state for notifications
  const [travelNotifications, setTravelNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  // 1. Add state for travel management sub-tabs
  const travelSubTabs = [
    'Overview',
    'Travel Requests',
    'Travel Authorization',
    'Itinerary',
    'Documents',
    'Notifications',
    'Expenses & Budgeting',
    'Analytics',
    'Emergency Contacts',
    'Country Guidelines',
  ];
  const [travelTab, setTravelTab] = useState(0);

  // Emergency Contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [emergencyEditing, setEmergencyEditing] = useState<any>(null);
  const [emergencyForm, setEmergencyForm] = useState<any>({
    type: '', name: '', phone: '', email: '', country: '', notes: '',
  });
  const [emergencyError, setEmergencyError] = useState('');
  const [emergencySuccess, setEmergencySuccess] = useState('');

  // Country Guidelines state
  const [countryGuidelines, setCountryGuidelines] = useState<any[]>([]);
  const [guidelineDialogOpen, setGuidelineDialogOpen] = useState(false);
  const [guidelineEditing, setGuidelineEditing] = useState<any>(null);
  const [guidelineForm, setGuidelineForm] = useState<{ country: string; notes: string; tags: string[]; flagIcon: string }>({ country: '', notes: '', tags: [], flagIcon: '' });
  const [guidelineSearch, setGuidelineSearch] = useState('');
  const [guidelineError, setGuidelineError] = useState('');
  const [guidelineSuccess, setGuidelineSuccess] = useState('');

  // Travel Request state
  const [travelRequests, setTravelRequests] = useState<any[]>([]);
  const [travelRequestsLoading, setTravelRequestsLoading] = useState(false);
  const [travelRequestsError, setTravelRequestsError] = useState('');
  const [travelRequestDialogOpen, setTravelRequestDialogOpen] = useState(false);
  const [travelRequestEditing, setTravelRequestEditing] = useState<any>(null);
  const [travelRequestForm, setTravelRequestForm] = useState<any>({
    employee: '',
    travelType: 'domestic',
    purpose: '',
    destination: { country: '', city: '', venue: '' },
    travelDates: { departure: '', return: '', flexibility: '' },
    duration: 0,
    localContact: { name: '', organization: '', phone: '', email: '' },
    plannedItinerary: '',
    estimatedCost: { transport: 0, accommodation: 0, dailyAllowance: 0, miscellaneous: 0, total: 0 },
    budgetCode: '',
    projectCode: '',
    department: '',
    urgency: 'medium',
    notes: ''
  });

  // Travel Authorization state
  const [travelAuthorizations, setTravelAuthorizations] = useState<any[]>([]);
  const [travelAuthorizationsLoading, setTravelAuthorizationsLoading] = useState(false);
  const [travelAuthorizationsError, setTravelAuthorizationsError] = useState('');
  const [travelAuthorizationDialogOpen, setTravelAuthorizationDialogOpen] = useState(false);
  const [travelAuthorizationEditing, setTravelAuthorizationEditing] = useState<any>(null);
  const [travelAuthorizationForm, setTravelAuthorizationForm] = useState<any>({
    travelRequest: '',
    employee: '',
    destination: { country: '', city: '' },
    travelDates: { departure: '', return: '' },
    purpose: '',
    budgetApprovals: [],
    totalBudgetApproved: 0,
    budgetStatus: 'pending',
    visaRequirements: {
      required: false,
      type: '',
      processingTime: 0,
      estimatedCost: 0,
      documentsRequired: [],
      notes: '',
      status: 'not_required'
    },
    workPermit: {
      required: false,
      type: '',
      processingTime: 0,
      estimatedCost: 0,
      documentsRequired: [],
      notes: '',
      status: 'not_required'
    },
    approvedTravelClass: 'economy',
    bookingChannels: [],
    specialRequirements: [],
    safetyBriefing: {
      required: true,
      completed: false,
      notes: ''
    },
    insurance: {
      required: true,
      type: '',
      coverage: '',
      cost: 0,
      status: 'pending'
    },
    status: 'draft',
    notes: ''
  });

  // Missing variables for travel management
  const [selectedTravelId, setSelectedTravelId] = useState<string | null>(null);
  const [user] = useState<any>({ userId: 'current-user', email: 'user@example.com' });
  
  // Travel Request delete state
  const [travelRequestDeleteId, setTravelRequestDeleteId] = useState<string | null>(null);
  const [travelRequestSuccess, setTravelRequestSuccess] = useState('');
  
  // Travel Authorization delete state
  const [travelAuthorizationDeleteId, setTravelAuthorizationDeleteId] = useState<string | null>(null);
  const [travelAuthorizationSuccess, setTravelAuthorizationSuccess] = useState('');
  
  // Travel Overview Dashboard state
  const [travelOverviewData, setTravelOverviewData] = useState({
    activeTrips: [],
    upcomingTrips: [],
    completedTrips: [],
    countryStats: {},
    employeeStats: {},
    totalTrips: 0,
    totalCost: 0,
    avgTripDuration: 0
  });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTravelRecords = () => {
    setTravelLoading(true);
    setTravelError('');
    api.get('/travel')
      .then((res: any) => setTravelRecords(res.data || []))
      .catch((err: any) => setTravelError(err.response?.data?.message || 'Failed to fetch travel records'))
      .then(() => setTravelLoading(false))
      .catch(() => setTravelLoading(false));
  };

  // Fetch travel requests
  const fetchTravelRequests = () => {
    setTravelRequestsLoading(true);
    setTravelRequestsError('');
    api.get('/travel-requests')
      .then((res: any) => setTravelRequests(res.data?.data || []))
      .catch((err: any) => setTravelRequestsError(err.response?.data?.message || 'Failed to fetch travel requests'))
      .then(() => setTravelRequestsLoading(false))
      .catch(() => setTravelRequestsLoading(false));
  };

  // Fetch travel authorizations
  const fetchTravelAuthorizations = () => {
    setTravelAuthorizationsLoading(true);
    setTravelAuthorizationsError('');
    api.get('/travel-authorizations')
      .then((res: any) => setTravelAuthorizations(res.data?.data || []))
      .catch((err: any) => setTravelAuthorizationsError(err.response?.data?.message || 'Failed to fetch travel authorizations'))
      .then(() => setTravelAuthorizationsLoading(false))
      .catch(() => setTravelAuthorizationsLoading(false));
  };

  // Travel Overview Dashboard functions
  const calculateTravelOverview = useMemo(() => {
    if (!travelRecords.length) return {
      activeTrips: [],
      upcomingTrips: [],
      completedTrips: [],
      countryStats: {},
      employeeStats: {},
      totalTrips: 0,
      totalCost: 0,
      avgTripDuration: 0
    };

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activeTrips = travelRecords.filter(trip => 
      trip.travelStatus === 'in_progress' && 
      new Date(trip.startDate) <= now && 
      new Date(trip.endDate) >= now
    );

    const upcomingTrips = travelRecords.filter(trip => 
      trip.travelStatus === 'scheduled' && 
      new Date(trip.startDate) >= now && 
      new Date(trip.startDate) <= monthFromNow
    );

    const completedTrips = travelRecords.filter(trip => 
      trip.travelStatus === 'completed'
    );

    // Country statistics
    const countryStats: any = {};
    travelRecords.forEach(trip => {
      const country = trip.destinationCountry;
      if (!countryStats[country]) {
        countryStats[country] = { count: 0, employees: new Set(), totalCost: 0 };
      }
      countryStats[country].count++;
      countryStats[country].employees.add(trip.employee?.name || trip.employee);
      countryStats[country].totalCost += trip.actualAmount || 0;
    });

    // Employee statistics
    const employeeStats: any = {};
    travelRecords.forEach(trip => {
      const employee = trip.employee?.name || trip.employee;
      if (!employeeStats[employee]) {
        employeeStats[employee] = { count: 0, countries: new Set(), totalCost: 0 };
      }
      employeeStats[employee].count++;
      employeeStats[employee].countries.add(trip.destinationCountry);
      employeeStats[employee].totalCost += trip.actualAmount || 0;
    });

    // Calculate averages
    const totalCost = travelRecords.reduce((sum, trip) => sum + (trip.actualAmount || 0), 0);
    const totalDuration = travelRecords.reduce((sum, trip) => {
      if (trip.startDate && trip.endDate) {
        return sum + (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24);
      }
      return sum;
    }, 0);
    const avgTripDuration = travelRecords.length > 0 ? totalDuration / travelRecords.length : 0;

    return {
      activeTrips,
      upcomingTrips,
      completedTrips,
      countryStats,
      employeeStats,
      totalTrips: travelRecords.length,
      totalCost,
      avgTripDuration
    };
  }, [travelRecords]);

  // Filter functions
  const filteredTravelRecords = useMemo(() => {
    let filtered = travelRecords;

    if (countryFilter) {
      filtered = filtered.filter(trip => 
        trip.destinationCountry.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    if (employeeFilter) {
      filtered = filtered.filter(trip => {
        const employeeName = trip.employee?.name || trip.employee;
        return employeeName.toLowerCase().includes(employeeFilter.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.travelStatus === statusFilter);
    }

    return filtered;
  }, [travelRecords, countryFilter, employeeFilter, statusFilter]);

  const tagSuggestions = [
    'visa required', 'COVID-19', 'high risk', 'vaccination', 'travel ban', 'e-visa', 'no visa', 'currency restriction', 'embassy required', 'insurance required', 'business only', 'tourist allowed', 'PCR required', 'quarantine', 'yellow fever', 'malaria', 'safe', 'danger', 'restricted', 'open', 'closed'
  ];

  // Fetch country guidelines
  const fetchCountryGuidelines = async () => {
    try {
      const res = await api.get('/travel/country-guidelines');
      // Ensure countryGuidelines is always an array
      setCountryGuidelines(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setGuidelineError(err.response?.data?.message || 'Failed to fetch country guidelines');
      // Set empty array on error to prevent .map() errors
      setCountryGuidelines([]);
    }
  };

  useEffect(() => {
    fetchCountryGuidelines();
  }, []);

  const handleOpenGuidelineDialog = (guideline?: any) => {
    if (guideline) {
      setGuidelineEditing(guideline);
      setGuidelineForm({
        country: guideline.country,
        notes: guideline.notes || '',
        tags: guideline.tags || [],
        flagIcon: guideline.flagIcon || '',
      });
    } else {
      setGuidelineEditing(null);
      setGuidelineForm({ country: '', notes: '', tags: [], flagIcon: '' });
    }
    setGuidelineDialogOpen(true);
  };

  const handleCloseGuidelineDialog = () => {
    setGuidelineDialogOpen(false);
    setGuidelineEditing(null);
    setGuidelineForm({ country: '', notes: '', tags: [], flagIcon: '' });
    setGuidelineError('');
  };

  const handleGuidelineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGuidelineForm({ ...guidelineForm, [e.target.name]: e.target.value });
  };

  const handleGuidelineTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuidelineForm({ ...guidelineForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) });
  };

  const handleGuidelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuidelineError('');
    try {
      if (guidelineEditing) {
        await api.put(`/travel/country-guidelines/${guidelineEditing._id}`, guidelineForm);
        setGuidelineSuccess('Guideline updated!');
      } else {
        await api.post('/travel/country-guidelines', guidelineForm);
        setGuidelineSuccess('Guideline added!');
      }
      fetchCountryGuidelines();
      handleCloseGuidelineDialog();
    } catch (err: any) {
      setGuidelineError(err.response?.data?.message || 'Failed to save guideline');
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    try {
      await api.delete(`/travel/country-guidelines/${id}`);
      setGuidelineSuccess('Guideline deleted!');
      fetchCountryGuidelines();
    } catch (err: any) {
      setGuidelineError(err.response?.data?.message || 'Failed to delete guideline');
    }
  };

  const filteredCountryGuidelines = useMemo(() => {
    if (!guidelineSearch.trim()) return countryGuidelines;
    const s = guidelineSearch.trim().toLowerCase();
    return countryGuidelines.filter((g: any) =>
      g.country.toLowerCase().includes(s) ||
      (g.notes && g.notes.toLowerCase().includes(s)) ||
      (g.tags && g.tags.some((tag: string) => tag.toLowerCase().includes(s)))
    );
  }, [countryGuidelines, guidelineSearch]);

  useEffect(() => {
    if (tab === 0) {
      fetchResidencies();
      fetchEmployees();
    } else if (tab === 1) {
      fetchGovDocs();
    } else if (tab === 2) {
      fetchVehicles();
      fetchAssets();
    } else if (tab === 3) {
      fetchCorrespondences();
    } else if (tab === 4) {
      fetchLegalCases();
    } else if (tab === 5) {
      fetchFacilities();
    } else if (tab === tabLabels.length - 1) {
      setTravelLoading(true);
      setTravelError('');
      api.get('/travel')
        .then((res: any) => setTravelRecords(res.data || []))
        .catch((err: any) => setTravelError(err.response?.data?.message || 'Failed to fetch travel records'))
        .then(() => setTravelLoading(false))
        .catch(() => setTravelLoading(false));
      
      // Fetch travel requests and authorizations
      fetchTravelRequests();
      fetchTravelAuthorizations();
    }
  }, [tab]);

  // 2. Fetch notifications when Notifications tab is selected
  useEffect(() => {
    if (tab === tabLabels.length - 1) {
      setNotificationsLoading(true);
      setNotificationsError('');
      api.get('/travel/notifications')
        .then((res: { data: any }) => setTravelNotifications(Array.isArray(res.data.upcomingTrips) ? res.data.upcomingTrips : []))
        .catch((err: any) => setNotificationsError(err.response?.data?.message || 'Failed to fetch notifications'))
        .then(() => setNotificationsLoading(false))
        .catch(() => setNotificationsLoading(false));
      // If .finally is not supported, use then/catch above and setLoading in both
    }
  }, [tab]);

  // Fetch country guidelines when sub-tab is selected
  useEffect(() => {
    if (tab === tabLabels.length - 1 && travelTab === 8) {
      api.get('/travel/country-guidelines')
        .then((res: any) => setCountryGuidelines(res.data || []))
        .catch(() => setCountryGuidelines([]));
    }
  }, [tab, travelTab]);

  // Fetch emergency contacts for selected travel record
  const handleFetchEmergencyContacts = (travelRecordId: string) => {
    const record = travelRecords.find(r => r._id === travelRecordId);
    setEmergencyContacts(record?.emergencyContacts || []);
  };

  const fetchResidencies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/employee-residencies');
      // Ensure records is always an array
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch records');
      // Set empty array on error to prevent .map() errors
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      // Ensure employees is always an array
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      // Set empty array on error to prevent .map() errors
      setEmployees([]);
    }
  };

  const fetchGovDocs = async () => {
    setGovDocLoading(true);
    setGovDocError('');
    try {
      const res = await api.get('/admin/government-documents');
      // Ensure govDocs is always an array
      setGovDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setGovDocError(err.response?.data?.message || 'Failed to fetch documents');
      // Set empty array on error to prevent .map() errors
      setGovDocs([]);
    } finally {
      setGovDocLoading(false);
    }
  };

  const handleOpen = (rec?: any) => {
    if (rec) {
      setEditing(rec);
      const formData = { ...rec, employee: rec.employee?._id || rec.employee };
      formData.hasPasses = rec.hasPasses ? 'true' : 'false';
      if (rec.hasPasses && rec.passes && rec.passes.length > 0) {
        formData.passes = rec.passes.map((pass: any) => ({
          passType: pass.passType,
          issuanceDate: pass.issuanceDate ? dayjs(pass.issuanceDate).format('YYYY-MM-DD') : '',
          expiryDate: pass.expiryDate ? dayjs(pass.expiryDate).format('YYYY-MM-DD') : '',
          sponsor: pass.sponsor
        }));
      } else {
        formData.passes = [];
      }
      // Work Permit fields
      formData.workPermitStart = rec.workPermitStart ? dayjs(rec.workPermitStart).format('YYYY-MM-DD') : '';
      formData.workPermitEnd = rec.workPermitEnd ? dayjs(rec.workPermitEnd).format('YYYY-MM-DD') : '';
      formData.workPermitCopy = null; // File upload is not persisted
      formData.maritalStatus = rec.maritalStatus || '';
      formData.numberOfDependents = rec.numberOfDependents || '';
      formData.dependentsLocation = rec.dependentsLocation || '';
      formData.dependentsLocationOther = rec.dependentsLocationOther || '';
      setForm(formData);
    } else {
      setEditing(null);
      setForm({
        employee: '', employeeType: '', coId: '', passportNumber: '', passportExpiry: '', nationality: '', residencyNumber: '', residencyExpiry: '', civilId: '', civilIdExpiry: '', visaType: '', visaNumber: '', visaExpiry: '', workPermitStart: '', workPermitEnd: '', workPermitCopy: null, sponsor: '', status: 'active', hasPasses: 'false', passes: [], maritalStatus: '', numberOfDependents: '', dependentsLocation: '', dependentsLocationOther: '', notes: '', documents: {},
      });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({
      employee: '', employeeType: '', coId: '', passportNumber: '', passportExpiry: '', nationality: '', residencyNumber: '', residencyExpiry: '', civilId: '', civilIdExpiry: '', visaType: '', visaNumber: '', visaExpiry: '', workPermitStart: '', workPermitEnd: '', workPermitCopy: null, sponsor: '', status: 'active', hasPasses: 'false', passes: [], maritalStatus: '', numberOfDependents: '', dependentsLocation: '', dependentsLocationOther: '', notes: '', documents: {},
    });
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new pass
  const handleAddPass = () => {
    setForm((prev: FormData) => ({
      ...prev,
      passes: [...prev.passes, { passType: '', issuanceDate: '', expiryDate: '', sponsor: '' }],
      passCopies: [...(prev.passCopies || []), null],
    }));
  };

  // Handle removing a pass
  const handleRemovePass = (index: number) => {
    setForm((prev: FormData) => ({
      ...prev,
      passes: prev.passes.filter((_: any, i: number) => i !== index),
      passCopies: (prev.passCopies || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // Handle pass field changes
  const handlePassChange = (index: number, field: string, value: string) => {
    setForm((prev: FormData) => ({
      ...prev,
      passes: prev.passes.map((pass: any, i: number) => 
        i === index ? { ...pass, [field]: value } : pass
      )
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'workPermitCopy') {
      setForm((prev) => ({ ...prev, workPermitCopy: files && files[0] ? files[0] : null }));
    } else {
      setForm((prev) => ({ ...prev, documents: { ...prev.documents, [name]: files?.[0] } }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const submitData: any = { ...form };
      submitData.hasPasses = form.hasPasses === 'true';
      if (form.hasPasses === 'true') {
        submitData.passes = form.passes.filter((pass: any) => pass.passType && pass.issuanceDate && pass.expiryDate && pass.sponsor);
      } else {
        submitData.passes = [];
      }
      submitData.documents = Object.fromEntries(Object.entries(form.documents || {}).map(([k, v]) => [k, (v as any)?.name || '']));
      // Work Permit file
      if (form.workPermitCopy && typeof form.workPermitCopy === 'object' && 'name' in form.workPermitCopy) {
        submitData.workPermitCopy = form.workPermitCopy.name;
      } else if (typeof form.workPermitCopy === 'string') {
        submitData.workPermitCopy = form.workPermitCopy;
      } else {
        submitData.workPermitCopy = '';
      }
      submitData.passCopies = form.passCopies ? form.passCopies.map(f => (typeof f === 'object' && f && 'name' in f ? f.name : f)) : [];
      if (editing) {
        await api.put(`/admin/employee-residencies/${editing._id}`, submitData);
        setSuccess('Record updated!');
      } else {
        await api.post('/admin/employee-residencies', submitData);
        setSuccess('Record created!');
      }
      fetchResidencies();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save record');
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/employee-residencies/${deleteId}`);
      setSuccess('Record deleted!');
      fetchResidencies();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleteId(null);
    }
  };
  const getExpiryStatus = (expiry: string) => {
    if (!expiry) return 'default';
    const days = dayjs(expiry).diff(dayjs(), 'day');
    if (days < 0) return 'error';
    if (days < 30) return 'warning';
    return 'success';
  };

  const handleGovDocOpen = (rec?: any) => {
    if (rec) {
      setGovDocEditing(rec);
      setGovDocForm({ ...rec });
    } else {
      setGovDocEditing(null);
      setGovDocForm({
        documentType: '', documentNumber: '', title: '', description: '', issuingAuthority: '', issueDate: '', expiryDate: '', status: 'active', renewalFee: '', renewalProcess: '', notes: '', documents: {},
      });
    }
    setGovDocOpen(true);
  };
  const handleGovDocClose = () => {
    setGovDocOpen(false);
    setGovDocEditing(null);
    setGovDocForm({
      documentType: '', documentNumber: '', title: '', description: '', issuingAuthority: '', issueDate: '', expiryDate: '', status: 'active', renewalFee: '', renewalProcess: '', notes: '', documents: {},
    });
  };
  const handleGovDocFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGovDocForm({ ...govDocForm, [e.target.name]: e.target.value });
  };
  const handleGovDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setGovDocForm({ ...govDocForm, documents: { ...govDocForm.documents, [name]: files?.[0] } });
  };
  const handleGovDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGovDocError('');
    try {
      // For now, skip file upload, just send file names
      const submitData = { ...govDocForm, documents: Object.fromEntries(Object.entries(govDocForm.documents || {}).map(([k, v]) => [k, (v as any)?.name || ''])) };
      if (govDocEditing) {
        await api.put(`/admin/government-documents/${govDocEditing._id}`, submitData);
        setGovDocSuccess('Document updated!');
      } else {
        await api.post('/admin/government-documents', submitData);
        setGovDocSuccess('Document created!');
      }
      fetchGovDocs();
      handleGovDocClose();
    } catch (err: any) {
      setGovDocError(err.response?.data?.message || 'Failed to save document');
    }
  };
  const handleGovDocDelete = async () => {
    if (!govDocDeleteId) return;
    try {
      await api.delete(`/admin/government-documents/${govDocDeleteId}`);
      setGovDocSuccess('Document deleted!');
      fetchGovDocs();
    } catch (err: any) {
      setGovDocError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setGovDocDeleteId(null);
    }
  };
  const getGovDocExpiryStatus = (expiry: string) => {
    if (!expiry) return 'default';
    const days = dayjs(expiry).diff(dayjs(), 'day');
    if (days < 0) return 'error';
    if (days < 30) return 'warning';
    return 'success';
  };

  // Vehicle Registration functions
  const fetchVehicles = async () => {
    setLoading(true);
    setVehicleError('');
    try {
      const res = await api.get('/admin/vehicle-registrations');
      // Ensure vehicles is always an array
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setVehicleError(err.response?.data?.message || 'Failed to fetch vehicles');
      // Set empty array on error to prevent .map() errors
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get('/admin/assets');
      // Ensure assets is always an array
      setAssets(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch assets:', err);
      // Set empty array on error to prevent .map() errors
      setAssets([]);
    }
  };

  // Government Correspondence Log
  const [correspondences, setCorrespondences] = useState<any[]>([]);
  const [correspondenceForm, setCorrespondenceForm] = useState<any>({
    referenceNumber: '', subject: '', description: '', ministry: '', department: '', contactPerson: '', contactPhone: '', contactEmail: '', submissionDate: '', submissionMethod: 'in_person', requestType: 'application', status: 'submitted', expectedResponseDate: '', actualResponseDate: '', responseReceived: false, responseDetails: '', followUpRequired: false, followUpDate: '', followUpNotes: '', priority: 'medium', assignedTo: '', notes: '', documents: {},
    assignedEmployee: '', // new
    hasFee: '',           // new
    amortization: '',     // new
    fee: '',              // new
  });
  const [correspondenceOpen, setCorrespondenceOpen] = useState(false);
  const [correspondenceEditing, setCorrespondenceEditing] = useState<any>(null);
  const [correspondenceDeleteId, setCorrespondenceDeleteId] = useState<string | null>(null);
  const [correspondenceSuccess, setCorrespondenceSuccess] = useState('');
  const [correspondenceError, setCorrespondenceError] = useState('');

  // Legal Case Management
  const [legalCases, setLegalCases] = useState<any[]>([]);
  const [legalCaseForm, setLegalCaseForm] = useState({
    caseNumber: '',
    title: '',
    description: '',
    caseType: '',
    court: '',
    courtLocation: '',
    filingDate: '',
    status: 'open',
    priority: 'medium',
    estimatedCost: '',
    actualCost: '',
    legalRepresentative: {
      name: '',
      firm: '',
      phone: '',
      email: '',
      contractAmount: '',
    },
    parties: [{ name: '', type: 'plaintiff', contactInfo: '' }],
    notes: '',
    serial: '',
    paidStatus: '',
    legalRepType: '',
    coId: '',
  });
  const [legalCaseOpen, setLegalCaseOpen] = useState(false);
  const [legalCaseEditing, setLegalCaseEditing] = useState<any>(null);
  const [legalCaseDeleteId, setLegalCaseDeleteId] = useState<string | null>(null);
  const [legalCaseSuccess, setLegalCaseSuccess] = useState('');
  const [legalCaseError, setLegalCaseError] = useState('');

  const fetchCorrespondences = async () => {
    setLoading(true);
    setCorrespondenceError('');
    try {
      const res = await api.get('/admin/government-correspondence');
      // Ensure correspondences is always an array
      setCorrespondences(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setCorrespondenceError(err.response?.data?.message || 'Failed to fetch correspondences');
      // Set empty array on error to prevent .map() errors
      setCorrespondences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrespondenceOpen = (rec?: any) => {
    if (rec) {
      setCorrespondenceEditing(rec);
      setCorrespondenceForm({
        referenceNumber: rec.referenceNumber || '',
        subject: rec.subject || '',
        description: rec.description || '',
        ministry: rec.ministry || '',
        department: rec.department || '',
        contactPerson: rec.contactPerson || '',
        contactPhone: rec.contactPhone || '',
        contactEmail: rec.contactEmail || '',
        submissionDate: rec.submissionDate ? rec.submissionDate.slice(0, 10) : '',
        submissionMethod: rec.submissionMethod || 'in_person',
        requestType: rec.requestType || 'application',
        status: rec.status || 'submitted',
        expectedResponseDate: rec.expectedResponseDate ? rec.expectedResponseDate.slice(0, 10) : '',
        actualResponseDate: rec.actualResponseDate ? rec.actualResponseDate.slice(0, 10) : '',
        responseReceived: rec.responseReceived || false,
        responseDetails: rec.responseDetails || '',
        followUpRequired: rec.followUpRequired || false,
        followUpDate: rec.followUpDate ? rec.followUpDate.slice(0, 10) : '',
        followUpNotes: rec.followUpNotes || '',
        priority: rec.priority || 'medium',
        assignedTo: rec.assignedTo || '',
        notes: rec.notes || '',
        documents: rec.documents || {},
        assignedEmployee: rec.assignedEmployee || '',
        hasFee: rec.hasFee || '',
        amortization: rec.amortization || '',
        fee: rec.fee || '',
      });
    } else {
      setCorrespondenceEditing(null);
      setCorrespondenceForm({
        referenceNumber: '', subject: '', description: '', ministry: '', department: '', contactPerson: '', contactPhone: '', contactEmail: '', submissionDate: '', submissionMethod: 'in_person', requestType: 'application', status: 'submitted', expectedResponseDate: '', actualResponseDate: '', responseReceived: false, responseDetails: '', followUpRequired: false, followUpDate: '', followUpNotes: '', priority: 'medium', assignedTo: '', notes: '', documents: {},
        assignedEmployee: '',
        hasFee: '',
        amortization: '',
        fee: '',
      });
    }
    setCorrespondenceOpen(true);
  };

  const handleCorrespondenceClose = () => {
    setCorrespondenceOpen(false);
    setCorrespondenceEditing(null);
    setCorrespondenceForm({
      referenceNumber: '', subject: '', description: '', ministry: '', department: '', contactPerson: '', contactPhone: '', contactEmail: '', submissionDate: '', submissionMethod: 'in_person', requestType: 'application', status: 'submitted', expectedResponseDate: '', actualResponseDate: '', responseReceived: false, responseDetails: '', followUpRequired: false, followUpDate: '', followUpNotes: '', priority: 'medium', assignedTo: '', notes: '', documents: {},
      assignedEmployee: '',
      hasFee: '',
      amortization: '',
      fee: '',
    });
  };

  const handleCorrespondenceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setCorrespondenceForm((prev: any) => ({ ...prev, [name!]: value }));
  };

  const handleCorrespondenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setCorrespondenceForm({ ...correspondenceForm, documents: { ...correspondenceForm.documents, [name]: files?.[0] } });
  };

  const handleCorrespondenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (correspondenceEditing) {
        await api.put(`/admin/government-correspondence/${correspondenceEditing._id}`, correspondenceForm);
        setCorrespondenceSuccess('Correspondence updated!');
      } else {
        await api.post('/admin/government-correspondence', correspondenceForm);
        setCorrespondenceSuccess('Correspondence created!');
      }
      fetchCorrespondences();
      handleCorrespondenceClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save correspondence');
    }
  };

  const handleCorrespondenceDelete = async () => {
    if (!correspondenceDeleteId) return;
    try {
      await api.delete(`/admin/government-correspondence/${correspondenceDeleteId}`);
      setCorrespondenceSuccess('Correspondence deleted!');
      fetchCorrespondences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete correspondence');
    } finally {
      setCorrespondenceDeleteId(null);
    }
  };

  const getCorrespondenceStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'under_review': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending_documents': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getCorrespondencePriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  // Legal Case Management functions
  const fetchLegalCases = async () => {
    setLoading(true);
    setLegalCaseError('');
    try {
      const res = await api.get('/admin/legal-cases');
      // Ensure legalCases is always an array
      setLegalCases(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setLegalCaseError(err.response?.data?.message || 'Failed to fetch legal cases');
      // Set empty array on error to prevent .map() errors
      setLegalCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLegalCaseOpen = (rec?: any) => {
    if (rec) {
      setLegalCaseEditing(rec);
      setLegalCaseForm({
        caseNumber: rec.caseNumber,
        title: rec.title,
        description: rec.description,
        caseType: rec.caseType,
        court: rec.court,
        courtLocation: rec.courtLocation,
        filingDate: rec.filingDate ? rec.filingDate.slice(0, 10) : '',
        status: rec.status,
        priority: rec.priority,
        estimatedCost: rec.estimatedCost?.toString() || '',
        actualCost: rec.actualCost?.toString() || '',
        legalRepresentative: {
          name: rec.legalRepresentative?.name || '',
          firm: rec.legalRepresentative?.firm || '',
          phone: rec.legalRepresentative?.phone || '',
          email: rec.legalRepresentative?.email || '',
          contractAmount: rec.legalRepresentative?.contractAmount?.toString() || '',
        },
        parties: rec.parties || [{ name: '', type: 'plaintiff', contactInfo: '' }],
        notes: rec.notes || '',
        serial: rec.serial || '',
        paidStatus: rec.paidStatus || '',
        legalRepType: rec.legalRepType || '',
        coId: rec.coId || '',
      });
    } else {
      setLegalCaseEditing(null);
      setLegalCaseForm({
        caseNumber: '',
        title: '',
        description: '',
        caseType: '',
        court: '',
        courtLocation: '',
        filingDate: '',
        status: 'open',
        priority: 'medium',
        estimatedCost: '',
        actualCost: '',
        legalRepresentative: {
          name: '',
          firm: '',
          phone: '',
          email: '',
          contractAmount: '',
        },
        parties: [{ name: '', type: 'plaintiff', contactInfo: '' }],
        notes: '',
        serial: '',
        paidStatus: '',
        legalRepType: '',
        coId: '',
      });
    }
    setLegalCaseOpen(true);
  };

  const handleLegalCaseClose = () => {
    setLegalCaseOpen(false);
    setLegalCaseEditing(null);
    setLegalCaseForm({
      caseNumber: '',
      title: '',
      description: '',
      caseType: '',
      court: '',
      courtLocation: '',
      filingDate: '',
      status: 'open',
      priority: 'medium',
      estimatedCost: '',
      actualCost: '',
      legalRepresentative: {
        name: '',
        firm: '',
        phone: '',
        email: '',
        contractAmount: '',
      },
      parties: [{ name: '', type: 'plaintiff', contactInfo: '' }],
      notes: '',
      serial: '',
      paidStatus: '',
      legalRepType: '',
      coId: '',
    });
  };

  const handleLegalCaseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setLegalCaseForm({
      ...legalCaseForm,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleLegalCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLegalCaseError('');
    try {
      const submitData = {
        ...legalCaseForm,
        estimatedCost: Number(legalCaseForm.estimatedCost),
        actualCost: Number(legalCaseForm.actualCost),
        legalRepresentative: {
          ...legalCaseForm.legalRepresentative,
          contractAmount: Number(legalCaseForm.legalRepresentative.contractAmount),
        },
      };

      if (legalCaseEditing) {
        await api.put(`/admin/legal-cases/${legalCaseEditing._id}`, submitData);
        setLegalCaseSuccess('Legal case updated!');
      } else {
        await api.post('/admin/legal-cases', submitData);
        setLegalCaseSuccess('Legal case created!');
      }
      fetchLegalCases();
      handleLegalCaseClose();
    } catch (err: any) {
      setLegalCaseError(err.response?.data?.message || 'Failed to save legal case');
    }
  };

  const handleLegalCaseDelete = async () => {
    if (!legalCaseDeleteId) return;
    try {
      await api.delete(`/admin/legal-cases/${legalCaseDeleteId}`);
      setLegalCaseSuccess('Legal case deleted!');
      fetchLegalCases();
    } catch (err: any) {
      setLegalCaseError(err.response?.data?.message || 'Failed to delete legal case');
    } finally {
      setLegalCaseDeleteId(null);
    }
  };

  const getLegalCaseStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'appealed': return 'secondary';
      default: return 'default';
    }
  };

  const getLegalCasePriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  // Company Facility Documents functions
  const fetchFacilities = async () => {
    setLoading(true);
    setFacilityError('');
    try {
      const res = await api.get('/admin/company-facilities');
      // Ensure facilities is always an array
      setFacilities(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setFacilityError(err.response?.data?.message || 'Failed to fetch facilities');
      // Set empty array on error to prevent .map() errors
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityOpen = (rec?: any) => {
    if (rec) {
      setFacilityEditing(rec);
      setFacilityForm({
        facilityName: rec.facilityName || '',
        facilityType: rec.facilityType || 'office',
        address: rec.address || '',
        area: rec.area?.toString() || '',
        rentAgreement: {
          agreementNumber: rec.rentAgreement?.agreementNumber || '',
          landlordName: rec.rentAgreement?.landlordName || '',
          landlordContact: rec.rentAgreement?.landlordContact || '',
          startDate: rec.rentAgreement?.startDate ? rec.rentAgreement.startDate.slice(0, 10) : '',
          endDate: rec.rentAgreement?.endDate ? rec.rentAgreement.endDate.slice(0, 10) : '',
          monthlyRent: rec.rentAgreement?.monthlyRent?.toString() || '',
          securityDeposit: rec.rentAgreement?.securityDeposit?.toString() || '',
          renewalTerms: rec.rentAgreement?.renewalTerms || '',
          status: rec.rentAgreement?.status || 'active',
        },
        municipalityApproval: {
          approvalNumber: rec.municipalityApproval?.approvalNumber || '',
          approvalDate: rec.municipalityApproval?.approvalDate ? rec.municipalityApproval.approvalDate.slice(0, 10) : '',
          expiryDate: rec.municipalityApproval?.expiryDate ? rec.municipalityApproval.expiryDate.slice(0, 10) : '',
          approvalType: rec.municipalityApproval?.approvalType || '',
          status: rec.municipalityApproval?.status || 'active',
          renewalProcess: rec.municipalityApproval?.renewalProcess || '',
        },
        fireDepartmentApproval: {
          approvalNumber: rec.fireDepartmentApproval?.approvalNumber || '',
          approvalDate: rec.fireDepartmentApproval?.approvalDate ? rec.fireDepartmentApproval.approvalDate.slice(0, 10) : '',
          expiryDate: rec.fireDepartmentApproval?.expiryDate ? rec.fireDepartmentApproval.expiryDate.slice(0, 10) : '',
          inspectionDate: rec.fireDepartmentApproval?.inspectionDate ? rec.fireDepartmentApproval.inspectionDate.slice(0, 10) : '',
          status: rec.fireDepartmentApproval?.status || 'active',
          findings: rec.fireDepartmentApproval?.findings || '',
          correctiveActions: rec.fireDepartmentApproval?.correctiveActions || [],
        },
        mocApproval: {
          approvalNumber: rec.mocApproval?.approvalNumber || '',
          approvalDate: rec.mocApproval?.approvalDate ? rec.mocApproval.approvalDate.slice(0, 10) : '',
          expiryDate: rec.mocApproval?.expiryDate ? rec.mocApproval.expiryDate.slice(0, 10) : '',
          approvalType: rec.mocApproval?.approvalType || '',
          status: rec.mocApproval?.status || 'active',
        },
        otherApprovals: rec.otherApprovals || [],
        status: rec.status || 'active',
        notes: rec.notes || '',
        // New fields for security deposit logic
        hasSecurityDeposit: rec.hasSecurityDeposit || '',
        securityDepositAmount: rec.securityDepositAmount || '',
        securityDepositAmortization: rec.securityDepositAmortization || '',
      });
    } else {
      setFacilityEditing(null);
      setFacilityForm({
        facilityName: '', facilityType: 'office', address: '', area: '', rentAgreement: { agreementNumber: '', landlordName: '', landlordContact: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', renewalTerms: '', status: 'active' }, municipalityApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active', renewalProcess: '' }, fireDepartmentApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', inspectionDate: '', status: 'active', findings: '', correctiveActions: [] }, mocApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active' }, otherApprovals: [], status: 'active', notes: '',
        // New fields for security deposit logic
        hasSecurityDeposit: '',
        securityDepositAmount: '',
        securityDepositAmortization: '',
      });
    }
    setFacilityOpen(true);
  };

  const handleFacilityClose = () => {
    setFacilityOpen(false);
    setFacilityEditing(null);
    setFacilityForm({
      facilityName: '', facilityType: 'office', address: '', area: '', rentAgreement: { agreementNumber: '', landlordName: '', landlordContact: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', renewalTerms: '', status: 'active' }, municipalityApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active', renewalProcess: '' }, fireDepartmentApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', inspectionDate: '', status: 'active', findings: '', correctiveActions: [] }, mocApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active' }, otherApprovals: [], status: 'active', notes: '',
      // New fields for security deposit logic
      hasSecurityDeposit: '',
      securityDepositAmount: '',
      securityDepositAmortization: '',
    });
  };

  const handleFacilityFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFacilityForm({
        ...facilityForm,
        [section]: {
          ...((facilityForm[section as keyof typeof facilityForm] || {}) as object),
          [field]: value,
        },
      });
    } else {
      setFacilityForm({ ...facilityForm, [name]: value });
    }
  };

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const submitData = {
        ...facilityForm,
        area: Number(facilityForm.area),
        rentAgreement: {
          ...facilityForm.rentAgreement,
          monthlyRent: Number(facilityForm.rentAgreement.monthlyRent),
          securityDeposit: Number(facilityForm.rentAgreement.securityDeposit),
        },
        fireDepartmentApproval: {
          ...facilityForm.fireDepartmentApproval,
          correctiveActions: facilityForm.fireDepartmentApproval.correctiveActions.filter((action: string) => action.trim() !== ''),
        },
      };
      if (facilityEditing) {
        await api.put(`/admin/company-facilities/${facilityEditing._id}`, submitData);
        setFacilitySuccess('Facility updated!');
      } else {
        await api.post('/admin/company-facilities', submitData);
        setFacilitySuccess('Facility created!');
      }
      fetchFacilities();
      handleFacilityClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save facility');
    }
  };

  const handleFacilityDelete = async () => {
    if (!facilityDeleteId) return;
    try {
      await api.delete(`/admin/company-facilities/${facilityDeleteId}`);
      setFacilitySuccess('Facility deleted!');
      fetchFacilities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete facility');
    } finally {
      setFacilityDeleteId(null);
    }
  };

  const handleAddOtherApproval = () => {
    if (!newOtherApproval.authority || !newOtherApproval.approvalNumber) return;
    setFacilityForm({
      ...facilityForm,
      otherApprovals: [...facilityForm.otherApprovals, { ...newOtherApproval }],
    });
    setNewOtherApproval({ authority: '', approvalNumber: '', approvalDate: '', expiryDate: '', status: 'active', notes: '' });
    setShowOtherApprovalForm(false);
  };

  const handleRemoveOtherApproval = (index: number) => {
    const updatedApprovals = facilityForm.otherApprovals.filter((_: any, i: number) => i !== index);
    setFacilityForm({ ...facilityForm, otherApprovals: updatedApprovals });
  };

  const getFacilityStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'under_renovation': return 'warning';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'pending_renewal': return 'warning';
      default: return 'default';
    }
  };

  // Company Facility Documents state
  const [facilities, setFacilities] = useState<any[]>([]);
  const [facilitySuccess, setFacilitySuccess] = useState('');
  const [facilityError, setFacilityError] = useState('');
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [facilityEditing, setFacilityEditing] = useState<any>(null);
  const [facilityForm, setFacilityForm] = useState<FacilityForm>({
    facilityName: '',
    facilityType: 'office',
    address: '',
    area: '',
    rentAgreement: { agreementNumber: '', landlordName: '', landlordContact: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', renewalTerms: '', status: 'active' },
    municipalityApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active', renewalProcess: '' },
    fireDepartmentApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', inspectionDate: '', status: 'active', findings: '', correctiveActions: [] },
    mocApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active' },
    otherApprovals: [],
    status: 'active',
    notes: '',
    // New fields for security deposit logic
    hasSecurityDeposit: '',
    securityDepositAmount: '',
    securityDepositAmortization: '',
  });
  const [facilityDeleteId, setFacilityDeleteId] = useState<string | null>(null);
  const [newOtherApproval, setNewOtherApproval] = useState({ authority: '', approvalNumber: '', approvalDate: '', expiryDate: '', status: 'active', notes: '' });
  const [showOtherApprovalForm, setShowOtherApprovalForm] = useState(false);

  // Dashboard data calculations
  const residencyStatusData = useMemo(() => {
    const statusCounts = records.reduce((acc, residency) => {
      acc[residency.status] = (acc[residency.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count
    }));
  }, [records]);

  const documentExpiryData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthIndex = (currentMonth + index) % 12;
      const expiring = govDocs.filter(doc => {
        if (!doc.expiryDate) return false;
        const expiryMonth = new Date(doc.expiryDate).getMonth();
        return expiryMonth === monthIndex && doc.status === 'active';
      }).length;
      
      const expired = govDocs.filter(doc => {
        if (!doc.expiryDate) return false;
        const expiryMonth = new Date(doc.expiryDate).getMonth();
        return expiryMonth === monthIndex && doc.status === 'expired';
      }).length;
      
      return { month, expiring, expired };
    });
  }, [govDocs]);

  const legalCaseStatusData = useMemo(() => {
    const statusCounts = legalCases.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count
    }));
  }, [legalCases]);

  const legalCasePriorityData = useMemo(() => {
    const priorityCounts = legalCases.reduce((acc, case_) => {
      acc[case_.priority] = (acc[case_.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count
    }));
  }, [legalCases]);

  const expiryAlerts = useMemo(() => {
    const alerts: Array<{
      type: string;
      item: string;
      expiryDate: string;
      daysRemaining: number;
    }> = [];
    
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Check residencies
    records.forEach(residency => {
      if (residency.residencyExpiry) {
        const expiryDate = new Date(residency.residencyExpiry);
        if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
          const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            type: 'Residency',
            item: `Employee ${residency.employee || 'Unknown'}`,
            expiryDate: expiryDate.toLocaleDateString(),
            daysRemaining
          });
        }
      }
    });
    
    // Check government documents
    govDocs.forEach(doc => {
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate);
        if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
          const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            type: 'Document',
            item: doc.title,
            expiryDate: expiryDate.toLocaleDateString(),
            daysRemaining
          });
        }
      }
    });
    
    // Check vehicles
    vehicles.forEach(vehicle => {
      if (vehicle.registrationExpiry) {
        const expiryDate = new Date(vehicle.registrationExpiry);
        if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
          const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            type: 'Vehicle',
            item: vehicle.plateNumber || 'Unknown',
            expiryDate: expiryDate.toLocaleDateString(),
            daysRemaining
          });
        }
      }
    });
    
    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [records, govDocs, vehicles]);

  const recentActivities = useMemo(() => {
    const activities: Array<{
      date: string;
      description: string;
      type: string;
      status: string;
    }> = [];
    
    // Add recent activities based on data
    records.forEach(residency => {
      activities.push({
        date: new Date(residency.createdAt || Date.now()).toLocaleDateString(),
        description: `Residency created for employee`,
        type: 'Residency',
        status: residency.status === 'active' ? 'completed' : 'pending'
      });
    });
    
    govDocs.forEach(doc => {
      activities.push({
        date: new Date(doc.createdAt || Date.now()).toLocaleDateString(),
        description: `Document ${doc.title} registered`,
        type: 'Document',
        status: doc.status === 'active' ? 'completed' : 'pending'
      });
    });
    
    legalCases.forEach(case_ => {
      activities.push({
        date: new Date(case_.createdAt || Date.now()).toLocaleDateString(),
        description: `Legal case ${case_.caseNumber} opened`,
        type: 'Legal',
        status: case_.status === 'open' ? 'pending' : 'completed'
      });
    });
    
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [records, govDocs, legalCases]);

  const handleExportDashboardCSV = () => {
    const headers = ['Metric', 'Value', 'Status'];
    const rows = [
      ['Total Employees', employees.length.toString(), 'Active'],
      ['Active Documents', govDocs.filter(d => d.status === 'active').length.toString(), 'Active'],
      ['Active Vehicles', vehicles.filter(v => v.status === 'active').length.toString(), 'Active'],
      ['Open Legal Cases', legalCases.filter(c => c.status === 'open').length.toString(), 'Pending'],
      ['Active Facilities', facilities.filter(f => f.status === 'active').length.toString(), 'Active'],
      ['Pending Items', (records.filter(r => r.status === 'pending_renewal').length + 
                        govDocs.filter(d => d.status === 'pending_renewal').length + 
                        vehicles.filter(v => v.status === 'expired').length).toString(), 'Requires Attention']
    ];
    
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Admin Dashboard Report');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('admin_dashboard');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintDashboard = () => {
    const printHeader = addPrintHeader('Admin Dashboard Report');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Admin Dashboard Report</title>
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

  const handleVehicleOpen = (rec?: any) => {
    if (rec) {
      setVehicleEditing(rec);
      setVehicleForm(rec);
    } else {
      setVehicleEditing(null);
      setVehicleForm({
        vehicle: '',
        plateNumber: '',
        chassisNumber: '',
        engineNumber: '',
        registrationNumber: '',
        registrationExpiry: '',
        insuranceCompany: '',
        insurancePolicyNumber: '',
        insuranceExpiry: '',
        insuranceCost: '',
        insurancePaymentSystem: 'cash',
        insuranceInstallmentPeriod: '',
        status: 'active',
        renewalReminders: {
          enabled: false,
          reminderDays: [],
          lastReminderSent: '',
        },
        notes: '',
        hasPasses: 'false',
        passes: [],
        installmentCalculationMode: 'auto',
        installmentValue: '',
        registrationCardCountry: '',
        registrationCardBrand: '',
        registrationCardCapacity: '',
        registrationCardShape: '',
        registrationCardColour: '',
        // New fields for asset registration type and periodic check
        assetRegistrationType: 'public',
        periodicCheck: {
          issuanceDate: '',
          expiryDate: '',
        },
      });
    }
    setVehicleOpen(true);
  };

  const handleVehicleClose = () => {
    setVehicleOpen(false);
    setVehicleEditing(null);
    setVehicleForm({
      vehicle: '',
      plateNumber: '',
      chassisNumber: '',
      engineNumber: '',
      registrationNumber: '',
      registrationExpiry: '',
      insuranceCompany: '',
      insurancePolicyNumber: '',
      insuranceExpiry: '',
      insuranceCost: '',
      insurancePaymentSystem: 'cash',
      insuranceInstallmentPeriod: '',
      status: 'active',
      renewalReminders: {
        enabled: false,
        reminderDays: [],
        lastReminderSent: '',
      },
      notes: '',
      hasPasses: 'false',
      passes: [],
      installmentCalculationMode: 'auto',
      installmentValue: '',
      registrationCardCountry: '',
      registrationCardBrand: '',
      registrationCardCapacity: '',
      registrationCardShape: '',
      registrationCardColour: '',
      // New fields for asset registration type and periodic check
      assetRegistrationType: 'public',
      periodicCheck: {
        issuanceDate: '',
        expiryDate: '',
      },
    });
    setVehicleError('');
  };

  const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('renewalReminders.')) {
      const key = name.replace('renewalReminders.', '');
      setVehicleForm((prev: any) => ({
        ...prev,
        renewalReminders: { ...prev.renewalReminders, [key]: value },
      }));
    } else if (name.startsWith('periodicCheck.')) {
      const key = name.replace('periodicCheck.', '');
      setVehicleForm((prev: any) => ({
        ...prev,
        periodicCheck: { ...prev.periodicCheck, [key]: value },
      }));
    } else if (name === 'insuranceInstallmentPeriod') {
      setVehicleForm((prev: any) => ({ ...prev, [name]: value ? Number(value) : '' }));
    } else if (name === 'installmentCalculationMode') {
      setVehicleForm((prev: any) => ({ ...prev, [name]: value }));
    } else if (name === 'installmentValue') {
      setVehicleForm((prev: any) => ({ ...prev, [name]: value }));
    } else if (name === 'registrationCardCountry' || name === 'registrationCardBrand' || name === 'registrationCardCapacity' || name === 'registrationCardShape' || name === 'registrationCardColour') {
      setVehicleForm((prev: any) => ({ ...prev, [name]: value }));
    } else if (name === 'assetRegistrationType') {
      setVehicleForm((prev: any) => ({ ...prev, [name]: value }));
    } else {
      setVehicleForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleVehicleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Stub: handle file uploads if needed
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare payload
    let submitData = { ...vehicleForm };
    if (vehicleForm.insurancePaymentSystem !== 'installments') {
      submitData.installmentValue = '';
      submitData.installmentCalculationMode = 'auto';
    } else {
      // If auto, ensure value is calculated
      if (vehicleForm.installmentCalculationMode === 'auto') {
        const cost = parseFloat(vehicleForm.insuranceCost);
        const period = parseInt(vehicleForm.insuranceInstallmentPeriod, 10);
        if (!isNaN(cost) && !isNaN(period) && period > 0) {
          submitData.installmentValue = (cost / period).toFixed(2);
        } else {
          submitData.installmentValue = '';
        }
      }
      // If manual, use entered value (already in form)
    }
    // TODO: Send submitData to backend (implement actual API call)
    setVehicleOpen(false);
  };

  const handleVehicleDelete = async () => {
    // Stub: implement delete logic
    setVehicleDeleteId(null);
  };

  const getVehicleExpiryStatus = (expiry: string) => {
    if (!expiry) return 'default';
    const today = new Date();
    const exp = new Date(expiry);
    if (exp < today) return 'error';
    const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 30) return 'warning';
    return 'success';
  };

  // Compute dashboard stats
  const now = new Date();
  const activeTrips = travelRecords.filter(r => new Date(r.startDate) <= now && new Date(r.endDate) >= now && r.travelStatus !== 'completed' && r.travelStatus !== 'cancelled');
  const upcomingTrips = travelRecords.filter(r => new Date(r.startDate) > now && r.travelStatus !== 'completed' && r.travelStatus !== 'cancelled');
  const completedTrips = travelRecords.filter(r => r.travelStatus === 'completed');

  // 2. Add handler functions for itinerary dialog
  const handleItineraryOpen = (rec?: any) => {
    if (rec) {
      setItineraryEditing(rec);
      setItineraryForm({
        employee: rec.employee?._id || rec.employee || '',
        destinationCountry: rec.destinationCountry || '',
        destinationCity: rec.destinationCity || '',
        purpose: rec.purpose || '',
        startDate: rec.startDate ? rec.startDate.slice(0, 10) : '',
        endDate: rec.endDate ? rec.endDate.slice(0, 10) : '',
        flightDetails: rec.flightDetails || '',
        accommodationInfo: rec.accommodationInfo || '',
        contactAbroad: rec.contactAbroad || '',
        travelStatus: rec.travelStatus || 'scheduled',
        notes: rec.notes || '',
      });
    } else {
      setItineraryEditing(null);
      setItineraryForm({
        employee: '', destinationCountry: '', destinationCity: '', purpose: '', startDate: '', endDate: '', flightDetails: '', accommodationInfo: '', contactAbroad: '', travelStatus: 'scheduled', notes: '',
      });
    }
    setItineraryDialogOpen(true);
  };
  const handleItineraryClose = () => {
    setItineraryDialogOpen(false);
    setItineraryEditing(null);
    setItineraryForm({
      employee: '', destinationCountry: '', destinationCity: '', purpose: '', startDate: '', endDate: '', flightDetails: '', accommodationInfo: '', contactAbroad: '', travelStatus: 'scheduled', notes: '',
    });
    setItineraryError('');
  };
  const handleItineraryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItineraryForm({ ...itineraryForm, [e.target.name]: e.target.value });
  };
  const handleItinerarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setItineraryError('');
    try {
      const submitData = { ...itineraryForm };
      if (itineraryEditing) {
        await api.put(`/travel/${itineraryEditing._id}`, submitData);
        setItinerarySuccess('Travel record updated!');
      } else {
        await api.post('/travel', submitData);
        setItinerarySuccess('Travel record created!');
      }
      // Refresh records
      setTravelLoading(true);
      api.get('/travel')
        .then((res: any) => setTravelRecords(res.data || []))
        .catch((err: any) => setTravelError(err.response?.data?.message || 'Failed to fetch travel records'))
        .then(() => setTravelLoading(false))
        .catch(() => setTravelLoading(false));
      handleItineraryClose();
    } catch (err: any) {
      setItineraryError(err.response?.data?.message || 'Failed to save travel record');
    }
  };
  const handleItineraryDelete = async () => {
    if (!itineraryDeleteId) return;
    try {
      await api.delete(`/travel/${itineraryDeleteId}`);
      setItinerarySuccess('Travel record deleted!');
      setTravelLoading(true);
      api.get('/travel')
        .then((res: any) => setTravelRecords(res.data || []))
        .catch((err: any) => setTravelError(err.response?.data?.message || 'Failed to fetch travel records'))
        .then(() => setTravelLoading(false))
        .catch(() => setTravelLoading(false));
    } catch (err: any) {
      setItineraryError(err.response?.data?.message || 'Failed to delete travel record');
    } finally {
      setItineraryDeleteId(null);
    }
  };

  // 3. Implement handleOpenDocDialog
  const handleOpenDocDialog = async (record: any) => {
    setDocTravelRecord(record);
    setDocDialogOpen(true);
    setDocError('');
    setDocUploadType('');
    setDocUploadFile(null);
    setDocUploadLoading(false);
    // Fetch latest record to get documents
    try {
      const res = await api.get(`/travel/${record._id}`);
      setDocList(((res.data as any).documents || []));
    } catch (err: any) {
      setDocList([]);
      setDocError('Failed to fetch documents');
    }
  };

  // 4. Implement document upload handler
  const handleDocUpload = async () => {
    if (!docUploadType || !docUploadFile) {
      setDocError('Please select type and file');
      return;
    }
    setDocUploadLoading(true);
    setDocError('');
    const formData = new FormData();
    formData.append('type', docUploadType);
    formData.append('file', docUploadFile);
    try {
      await api.post(`/travel/${docTravelRecord._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refresh document list
      const res = await api.get(`/travel/${docTravelRecord._id}`);
      setDocList(((res.data as any).documents || []));
      setDocUploadType('');
      setDocUploadFile(null);
    } catch (err: any) {
      setDocError(err.response?.data?.message || 'Upload failed');
    } finally {
      setDocUploadLoading(false);
    }
  };

  // 5. Implement document download and delete handlers
  const handleDocDownload = (fileUrl: string) => {
    window.open(`/${fileUrl.replace(/^uploads[\\/]/, 'uploads/')}`, '_blank');
  };
  const handleDocDelete = async (idx: number) => {
    // Remove from record and update
    try {
      const updatedDocs = docList.filter((_, i) => i !== idx);
      await api.put(`/travel/${docTravelRecord._id}`, { documents: updatedDocs });
      setDocList(updatedDocs);
    } catch (err: any) {
      setDocError('Delete failed');
    }
  };

  // Emergency contact dialog handlers (stubs)
  const handleEmergencyDialogOpen = (contact?: any) => {
    setEmergencyEditing(contact || null);
    setEmergencyForm(contact || { type: '', name: '', phone: '', email: '', country: '', notes: '' });
    setEmergencyDialogOpen(true);
  };
  const handleEmergencyDialogClose = () => {
    setEmergencyDialogOpen(false);
    setEmergencyEditing(null);
    setEmergencyForm({ type: '', name: '', phone: '', email: '', country: '', notes: '' });
    setEmergencyError('');
  };
  const handleEmergencyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmergencyForm({ ...emergencyForm, [e.target.name]: e.target.value });
  };
  const handleEmergencySubmit = (travelId: string) => {
    // Implement submit logic here
    setEmergencyDialogOpen(false);
  };
  const handleEmergencyDelete = (travelId: string, idx: number) => {
    // Implement delete logic here
  };

  // Travel Request handlers
  const handleTravelRequestOpen = (request?: any) => {
    if (request) {
      setTravelRequestEditing(request);
      setTravelRequestForm({
        employee: request.employee?._id || request.employee,
        travelType: request.travelType,
        purpose: request.purpose,
        destination: request.destination,
        travelDates: request.travelDates,
        duration: request.duration,
        localContact: request.localContact,
        plannedItinerary: request.plannedItinerary,
        estimatedCost: request.estimatedCost,
        budgetCode: request.budgetCode,
        projectCode: request.projectCode,
        department: request.department,
        urgency: request.urgency,
        notes: request.notes
      });
    } else {
      setTravelRequestEditing(null);
      setTravelRequestForm({
        employee: '',
        travelType: 'domestic',
        purpose: '',
        destination: { country: '', city: '', venue: '' },
        travelDates: { departure: '', return: '', flexibility: '' },
        duration: 0,
        localContact: { name: '', organization: '', phone: '', email: '' },
        plannedItinerary: '',
        estimatedCost: { transport: 0, accommodation: 0, dailyAllowance: 0, miscellaneous: 0, total: 0 },
        budgetCode: '',
        projectCode: '',
        department: '',
        urgency: 'medium',
        notes: ''
      });
    }
    setTravelRequestDialogOpen(true);
  };

  const handleTravelRequestClose = () => {
    setTravelRequestDialogOpen(false);
    setTravelRequestEditing(null);
    setTravelRequestForm({
      employee: '',
      travelType: 'domestic',
      purpose: '',
      destination: { country: '', city: '', venue: '' },
      travelDates: { departure: '', return: '', flexibility: '' },
      duration: 0,
      localContact: { name: '', organization: '', phone: '', email: '' },
      plannedItinerary: '',
      estimatedCost: { transport: 0, accommodation: 0, dailyAllowance: 0, miscellaneous: 0, total: 0 },
      budgetCode: '',
      projectCode: '',
      department: '',
      urgency: 'medium',
      notes: ''
    });
  };

  const handleTravelRequestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTravelRequestForm({
        ...travelRequestForm,
        [parent]: {
          ...travelRequestForm[parent],
          [child]: value
        }
      });
    } else {
      setTravelRequestForm({ ...travelRequestForm, [name]: value });
    }
  };

  const handleTravelRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTravelRequestsError('');
    try {
      if (travelRequestEditing) {
        await api.put(`/travel-requests/${travelRequestEditing._id}`, travelRequestForm);
        setTravelRequestSuccess('Travel request updated successfully!');
      } else {
        await api.post('/travel-requests', travelRequestForm);
        setTravelRequestSuccess('Travel request created successfully!');
      }
      fetchTravelRequests();
      handleTravelRequestClose();
    } catch (err: any) {
      setTravelRequestsError(err.response?.data?.message || 'Failed to save travel request');
    }
  };

  const handleTravelRequestDelete = async () => {
    if (!travelRequestDeleteId) return;
    try {
      await api.delete(`/travel-requests/${travelRequestDeleteId}`);
      setTravelRequestSuccess('Travel request deleted successfully!');
      fetchTravelRequests();
    } catch (err: any) {
      setTravelRequestsError(err.response?.data?.message || 'Failed to delete travel request');
    } finally {
      setTravelRequestDeleteId(null);
    }
  };

  // Travel Authorization handlers
  const handleTravelAuthorizationOpen = (auth?: any) => {
    if (auth) {
      setTravelAuthorizationEditing(auth);
      setTravelAuthorizationForm({
        travelRequest: auth.travelRequest?._id || auth.travelRequest,
        employee: auth.employee?._id || auth.employee,
        destination: auth.destination,
        travelDates: auth.travelDates,
        purpose: auth.purpose,
        budgetApprovals: auth.budgetApprovals,
        totalBudgetApproved: auth.totalBudgetApproved,
        budgetStatus: auth.budgetStatus,
        visaRequirements: auth.visaRequirements,
        workPermit: auth.workPermit,
        approvedTravelClass: auth.approvedTravelClass,
        bookingChannels: auth.bookingChannels,
        specialRequirements: auth.specialRequirements,
        safetyBriefing: auth.safetyBriefing,
        insurance: auth.insurance,
        status: auth.status,
        notes: auth.notes
      });
    } else {
      setTravelAuthorizationEditing(null);
      setTravelAuthorizationForm({
        travelRequest: '',
        employee: '',
        destination: { country: '', city: '' },
        travelDates: { departure: '', return: '' },
        purpose: '',
        budgetApprovals: [],
        totalBudgetApproved: 0,
        budgetStatus: 'pending',
        visaRequirements: {
          required: false,
          type: '',
          processingTime: 0,
          estimatedCost: 0,
          documentsRequired: [],
          notes: '',
          status: 'not_required'
        },
        workPermit: {
          required: false,
          type: '',
          processingTime: 0,
          estimatedCost: 0,
          documentsRequired: [],
          notes: '',
          status: 'not_required'
        },
        approvedTravelClass: 'economy',
        bookingChannels: [],
        specialRequirements: [],
        safetyBriefing: {
          required: true,
          completed: false,
          notes: ''
        },
        insurance: {
          required: true,
          type: '',
          coverage: '',
          cost: 0,
          status: 'pending'
        },
        status: 'draft',
        notes: ''
      });
    }
    setTravelAuthorizationDialogOpen(true);
  };

  const handleTravelAuthorizationClose = () => {
    setTravelAuthorizationDialogOpen(false);
    setTravelAuthorizationEditing(null);
    setTravelAuthorizationForm({
      travelRequest: '',
      employee: '',
      destination: { country: '', city: '' },
      travelDates: { departure: '', return: '' },
      purpose: '',
      budgetApprovals: [],
      totalBudgetApproved: 0,
      budgetStatus: 'pending',
      visaRequirements: {
        required: false,
        type: '',
        processingTime: 0,
        estimatedCost: 0,
        documentsRequired: [],
        notes: '',
        status: 'not_required'
      },
      workPermit: {
        required: false,
        type: '',
        processingTime: 0,
        estimatedCost: 0,
        documentsRequired: [],
        notes: '',
        status: 'not_required'
      },
      approvedTravelClass: 'economy',
      bookingChannels: [],
      specialRequirements: [],
      safetyBriefing: {
        required: true,
        completed: false,
        notes: ''
      },
      insurance: {
        required: true,
        type: '',
        coverage: '',
        cost: 0,
        status: 'pending'
      },
      status: 'draft',
      notes: ''
    });
  };

  const handleTravelAuthorizationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTravelAuthorizationForm({
        ...travelAuthorizationForm,
        [parent]: {
          ...travelAuthorizationForm[parent],
          [child]: value
        }
      });
    } else {
      setTravelAuthorizationForm({ ...travelAuthorizationForm, [name]: value });
    }
  };

  const handleTravelAuthorizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTravelAuthorizationsError('');
    try {
      if (travelAuthorizationEditing) {
        await api.put(`/travel-authorizations/${travelAuthorizationEditing._id}`, travelAuthorizationForm);
        setTravelAuthorizationSuccess('Travel authorization updated successfully!');
      } else {
        await api.post('/travel-authorizations', travelAuthorizationForm);
        setTravelAuthorizationSuccess('Travel authorization created successfully!');
      }
      fetchTravelAuthorizations();
      handleTravelAuthorizationClose();
    } catch (err: any) {
      setTravelAuthorizationsError(err.response?.data?.message || 'Failed to save travel authorization');
    }
  };

  const handleTravelAuthorizationDelete = async () => {
    if (!travelAuthorizationDeleteId) return;
    try {
      await api.delete(`/travel-authorizations/${travelAuthorizationDeleteId}`);
      setTravelAuthorizationSuccess('Travel authorization deleted successfully!');
      fetchTravelAuthorizations();
    } catch (err: any) {
      setTravelAuthorizationsError(err.response?.data?.message || 'Failed to delete travel authorization');
    } finally {
      setTravelAuthorizationDeleteId(null);
    }
  };

  // 1. Add useEffect to recalculate installmentValue if needed
  React.useEffect(() => {
    if (
      vehicleForm.insurancePaymentSystem === 'installments' &&
      vehicleForm.installmentCalculationMode === 'auto' &&
      vehicleForm.insuranceCost &&
      vehicleForm.insuranceInstallmentPeriod
    ) {
      const cost = parseFloat(vehicleForm.insuranceCost);
      const period = parseInt(vehicleForm.insuranceInstallmentPeriod, 10);
      if (!isNaN(cost) && !isNaN(period) && period > 0) {
        const value = (cost / period).toFixed(2);
        if (vehicleForm.installmentValue !== value) {
          setVehicleForm((prev: any) => ({ ...prev, installmentValue: value }));
        }
      }
    }
    // If mode is manual and value is empty, clear it
    if (
      vehicleForm.insurancePaymentSystem === 'installments' &&
      vehicleForm.installmentCalculationMode === 'manual' &&
      !vehicleForm.installmentValue
    ) {
      setVehicleForm((prev: any) => ({ ...prev, installmentValue: '' }));
    }
    // eslint-disable-next-line
  }, [vehicleForm.insuranceCost, vehicleForm.insuranceInstallmentPeriod, vehicleForm.installmentCalculationMode, vehicleForm.insurancePaymentSystem]);

  // 1. Add handleVehicleAddPass, handleVehicleRemovePass, handleVehiclePassChange for vehicleForm
  const handleVehicleAddPass = () => {
    setVehicleForm((prev: any) => ({
      ...prev,
      passes: [...(prev.passes || []), { passType: '', issuanceDate: '', expiryDate: '', sponsor: '' }],
    }));
  };
  const handleVehicleRemovePass = (index: number) => {
    setVehicleForm((prev: any) => ({
      ...prev,
      passes: prev.passes.filter((_: any, i: number) => i !== index),
    }));
  };
  const handleVehiclePassChange = (index: number, field: string, value: string) => {
    setVehicleForm((prev: any) => ({
      ...prev,
      passes: prev.passes.map((pass: any, i: number) =>
        i === index ? { ...pass, [field]: value } : pass
      ),
    }));
  };

  const handlePassCopyChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setForm((prev: FormData) => {
      const newPassCopies = [...(prev.passCopies || [])];
      newPassCopies[idx] = file;
      return { ...prev, passCopies: newPassCopies };
    });
  };

  // ... add helper at the top ...
  function isFileWithName(val: unknown): val is File {
    return typeof val === 'object' && val !== null && 'name' in val && typeof (val as any).name === 'string';
  }

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
                    <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Admin Panel
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive management system for all business operations
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <MuiTooltip title="Refresh Data">
                    <IconButton 
                      onClick={() => window.location.reload()} 
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </MuiTooltip>
                  <MuiTooltip title="Settings">
                    <IconButton 
                      sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </MuiTooltip>
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

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Tabs 
              value={tab} 
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 60,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  color: theme.palette.text.secondary,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                    color: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                      borderRadius: '0 0 2px 2px'
                    }
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.info.main, 0.15)} 100%)`,
                    fontWeight: 700,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 50%, ${theme.palette.secondary.main} 100%)`,
                      borderRadius: '0 0 2px 2px'
                    }
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '2px 2px 0 0',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 50%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              {tabLabels.map((label, idx) => {
                const tabIcons = [
                  <PeopleIcon key="people" />,
                  <DescriptionIcon key="description" />,
                  <LocalShippingIcon key="shipping" />,
                  <BusinessIcon key="business" />,
                  <SecurityIcon key="security" />,
                  <BuildIcon key="build" />,
                  <DashboardIcon key="dashboard" />
                ];
                
                return (
                  <Tab 
                    key={label} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          background: tab === idx 
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`
                            : alpha(theme.palette.text.secondary, 0.3),
                          transition: 'all 0.3s ease'
                        }} />
                        {tabIcons[idx]}
                        <span>{label}</span>
                      </Box>
                    } 
                  />
                );
              })}
            </Tabs>
          </Paper>
        </motion.div>
      </AnimatePresence>
      <Box>
        {tab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Header */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      Employees Record Tracking
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Manage employee documents, compliance, and access passes
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.info.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add Employee Record
                </Button>
              </Box>
            </Paper>

            {/* Main Display */}
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
              </Box>
            ) : error ? (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                {error}
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                  gap: 3,
                }}
              >
                {Array.isArray(records) && records.map((rec, index) => (
                  <motion.div
                    key={rec._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        p: 3,
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {/* Decorative Background */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 100,
                          height: 100,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                          borderRadius: '0 0 0 100%',
                          zIndex: 0,
                        }}
                      />
                      
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: rec.employeeType === 'citizen' ? theme.palette.primary.main : theme.palette.secondary.main,
                                width: 40,
                                height: 40
                              }}
                            >
                              <PeopleIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {rec.employee?.name || rec.employee}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                CO ID: {rec.coId || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={rec.employeeType === 'citizen' ? 'Citizen' : 'Foreigner'} 
                            color={rec.employeeType === 'citizen' ? 'primary' : 'secondary'} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        {/* Document Status Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              Passport
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rec.passportNumber}
                            </Typography>
                            <Chip 
                              label={rec.passportExpiry ? dayjs(rec.passportExpiry).format('MMM DD, YYYY') : 'N/A'} 
                              color={getExpiryStatus(rec.passportExpiry)} 
                              size="small"
                              sx={{ mt: 0.5, fontSize: '0.7rem' }}
                            />
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              {rec.employeeType === 'citizen' ? 'Civil ID' : 'Residency'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rec.employeeType === 'citizen' ? (rec.civilId || 'N/A') : (rec.residencyNumber || 'N/A')}
                            </Typography>
                            <Chip 
                              label={rec.employeeType === 'citizen' 
                                ? (rec.civilIdExpiry ? dayjs(rec.civilIdExpiry).format('MMM DD, YYYY') : 'N/A')
                                : (rec.residencyExpiry ? dayjs(rec.residencyExpiry).format('MMM DD, YYYY') : 'N/A')
                              } 
                              color={getExpiryStatus(rec.employeeType === 'citizen' ? rec.civilIdExpiry : rec.residencyExpiry)} 
                              size="small"
                              sx={{ mt: 0.5, fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>

                        {/* Visa Information */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Visa Information
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {visaTypes.find(v => v.value === rec.visaType)?.label || rec.visaType}
                            </Typography>
                            <Chip 
                              label={rec.visaExpiry ? dayjs(rec.visaExpiry).format('MMM DD, YYYY') : 'N/A'} 
                              color={getExpiryStatus(rec.visaExpiry)} 
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>

                        {/* Personal Information */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              Nationality
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rec.nationality}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                              Sponsor
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rec.sponsor}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Status and Passes */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Chip 
                            label={rec.status} 
                            color={statusColors[rec.status] || 'default'} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {rec.hasPasses ? (
                              <Chip 
                                label={`${rec.passes?.length || 0} Pass(es)`} 
                                color="info" 
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              <Chip 
                                label="No Passes" 
                                color="default" 
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpen(rec)}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => setDeleteId(rec._id)}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: theme.palette.error.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            {/* Add/Edit Dialog */}
            <Dialog 
              open={open} 
              onClose={handleClose} 
              maxWidth="lg" 
              fullWidth
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 3,
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                }
              }}
            >
              <DialogTitle
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {editing ? 'Edit Employee Record' : 'Add New Employee Record'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {editing ? 'Update employee information and documents' : 'Create a new employee record with all required information'}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              
              <DialogContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Employee Selection Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <PeopleIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Employee Selection
                      </Typography>
                    </Box>
                    <TextField 
                      select 
                      label="Employee" 
                      name="employee" 
                      value={form.employee} 
                      onChange={handleFormChange} 
                      required 
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Select Employee</MenuItem>
                      {Array.isArray(employees) && employees.map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                      ))}
                    </TextField>
                  </Paper>

                  {/* Basic Information Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                        <PeopleIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Basic Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="CO. ID" 
                        name="coId" 
                        value={form.coId} 
                        onChange={handleFormChange} 
                        inputProps={{ maxLength: 5, minLength: 5 }} 
                        placeholder="5 digits" 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        select 
                        label="Employee Type" 
                        name="employeeType" 
                        value={form.employeeType} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        <MenuItem value="citizen">🇰🇼 Citizen</MenuItem>
                        <MenuItem value="foreigner">🌍 Foreigner</MenuItem>
                      </TextField>
                    </Box>
                  </Paper>

                  {/* Passport Information Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <DescriptionIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Passport Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Passport Number" 
                        name="passportNumber" 
                        value={form.passportNumber} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Passport Expiry" 
                        name="passportExpiry" 
                        value={form.passportExpiry} 
                        onChange={handleFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      {form.employeeType === 'citizen' ? (
                        <TextField 
                          select 
                          label="Nationality" 
                          name="nationality" 
                          value={form.nationality} 
                          onChange={handleFormChange} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.info.main,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">Select Nationality</MenuItem>
                          {nationalities.map(n => <MenuItem key={n.value} value={n.value}>{n.label}</MenuItem>)}
                        </TextField>
                      ) : (
                        <TextField 
                          label="Nationality" 
                          name="nationality" 
                          value={form.nationality} 
                          onChange={handleFormChange} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.info.main,
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Paper>

                  {/* Residency Information Section (Foreigners) */}
                  {form.employeeType === 'foreigner' && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                          <SecurityIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          Residency Information
                        </Typography>
                      </Box>
                      <Box display="flex" gap={2}>
                        <TextField 
                          label="Residency Number" 
                          name="residencyNumber" 
                          value={form.residencyNumber} 
                          onChange={handleFormChange} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.warning.main,
                              },
                            },
                          }}
                        />
                        <TextField 
                          label="Residency Expiry" 
                          name="residencyExpiry" 
                          value={form.residencyExpiry} 
                          onChange={handleFormChange} 
                          type="date" 
                          InputLabelProps={{ shrink: true }} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.warning.main,
                              },
                            },
                          }}
                        />
                      </Box>
                    </Paper>
                  )}

                  {/* Civil ID Information Section (Citizens) */}
                  {form.employeeType === 'citizen' && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.success.main, width: 32, height: 32 }}>
                          <PeopleIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          Civil ID Information
                        </Typography>
                      </Box>
                      <Box display="flex" gap={2}>
                        <TextField 
                          label="Civil ID" 
                          name="civilId" 
                          value={form.civilId} 
                          onChange={handleFormChange} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.success.main,
                              },
                            },
                          }}
                        />
                        <TextField 
                          label="Civil ID Expiry" 
                          name="civilIdExpiry" 
                          value={form.civilIdExpiry} 
                          onChange={handleFormChange} 
                          type="date" 
                          InputLabelProps={{ shrink: true }} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.success.main,
                              },
                            },
                          }}
                        />
                      </Box>
                    </Paper>
                  )}

                  {/* Visa Information Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.error.main, width: 32, height: 32 }}>
                        <DescriptionIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Visa Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        select 
                        label="Visa Type" 
                        name="visaType" 
                        value={form.visaType} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Visa Type</MenuItem>
                        {visaTypes.map(v => <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>)}
                      </TextField>
                      <TextField 
                        label="Visa Number" 
                        name="visaNumber" 
                        value={form.visaNumber} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Visa Expiry" 
                        name="visaExpiry" 
                        value={form.visaExpiry} 
                        onChange={handleFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>

                  {/* Personal Information Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <PeopleIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Personal Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} sx={{ mb: 2 }}>
                      <TextField 
                        select 
                        label="Sponsor" 
                        name="sponsor" 
                        value={form.sponsor} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Sponsor</MenuItem>
                        {sponsors.map((s: any) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                      </TextField>
                      <TextField 
                        select 
                        label="Marital Status" 
                        name="maritalStatus" 
                        value={form.maritalStatus} 
                        onChange={handleFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Marital Status</MenuItem>
                        {maritalStatusOptions.map(ms => <MenuItem key={ms.value} value={ms.value}>{ms.label}</MenuItem>)}
                      </TextField>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Number of Dependents" 
                        name="numberOfDependents" 
                        value={form.numberOfDependents} 
                        onChange={handleFormChange} 
                        type="number" 
                        inputProps={{ min: 0 }} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        select 
                        label="Dependents Location" 
                        name="dependentsLocation" 
                        value={form.dependentsLocation} 
                        onChange={handleFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Location</MenuItem>
                        {dependentsLocationOptions.map(dl => <MenuItem key={dl.value} value={dl.value}>{dl.label}</MenuItem>)}
                      </TextField>
                    </Box>
                    {form.dependentsLocation === 'other' && (
                      <TextField 
                        label="Other Location" 
                        name="dependentsLocationOther" 
                        value={form.dependentsLocationOther} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                    )}
                  </Paper>

                  {/* Status and Passes Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                        <SecurityIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Status and Access Passes
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} sx={{ mb: 2 }}>
                      <TextField 
                        select 
                        label="Status" 
                        name="status" 
                        value={form.status} 
                        onChange={handleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="active">✅ Active</MenuItem>
                        <MenuItem value="expired">⚠️ Expired</MenuItem>
                        <MenuItem value="under_renewal">🔄 Under Renewal</MenuItem>
                        <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                        <MenuItem value="deported">🚫 Deported</MenuItem>
                      </TextField>
                      <TextField 
                        select 
                        label="Have Any Passes?" 
                        name="hasPasses" 
                        value={form.hasPasses} 
                        onChange={handleFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="false">❌ No</MenuItem>
                        <MenuItem value="true">✅ Yes</MenuItem>
                      </TextField>
                    </Box>
                  
                    {/* Passes Management */}
                    {form.hasPasses === 'true' && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          borderRadius: 2,
                          mt: 2,
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            Access Passes Management
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<AddIcon />}
                            onClick={handleAddPass}
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            Add Pass
                          </Button>
                        </Box>
                        
                        {form.passes.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', py: 2 }}>
                            No passes added yet. Click "Add Pass" to add pass details.
                          </Typography>
                        )}
                        
                        {form.passes.map((pass: any, index: number) => (
                          <Paper
                            key={index}
                            elevation={0}
                            sx={{
                              p: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              borderRadius: 2,
                              mb: 2,
                              position: 'relative',
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                Pass #{index + 1}
                              </Typography>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRemovePass(index)}
                                sx={{
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box display="flex" gap={2} sx={{ mb: 2 }}>
                              <TextField 
                                select 
                                label="Pass Type" 
                                value={pass.passType || ''} 
                                onChange={(e) => handlePassChange(index, 'passType', e.target.value)} 
                                required 
                                fullWidth
                                size="small"
                              >
                                <MenuItem value="">Select Pass Type</MenuItem>
                                {passTypes.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                              </TextField>
                              <TextField 
                                label="Issuance Date" 
                                value={pass.issuanceDate || ''} 
                                onChange={(e) => handlePassChange(index, 'issuanceDate', e.target.value)} 
                                type="date" 
                                InputLabelProps={{ shrink: true }} 
                                required 
                                fullWidth 
                                size="small"
                              />
                            </Box>
                            <Box display="flex" gap={2} sx={{ mb: 2 }}>
                              <TextField 
                                label="Expiry Date" 
                                value={pass.expiryDate || ''} 
                                onChange={(e) => handlePassChange(index, 'expiryDate', e.target.value)} 
                                type="date" 
                                InputLabelProps={{ shrink: true }} 
                                required 
                                fullWidth 
                                size="small"
                              />
                              <TextField 
                                label="Sponsor" 
                                value={pass.sponsor || ''} 
                                onChange={(e) => handlePassChange(index, 'sponsor', e.target.value)} 
                                required 
                                fullWidth 
                                size="small"
                              />
                            </Box>
                            <TextField
                              label="Pass Copy"
                              name={`passCopy_${index}`}
                              type="file"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePassCopyChange(index, e)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                            {form.passCopies && form.passCopies[index] && (
                              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                                <AttachFileIcon color="action" fontSize="small" />
                                {typeof form.passCopies[index] === 'string' && form.passCopies[index] !== '' && (
                                  <Typography variant="caption">{form.passCopies[index] as string}</Typography>
                                )}
                                {isFileWithName(form.passCopies[index]) && (
                                  <Typography variant="caption">{(form.passCopies[index] as File).name}</Typography>
                                )}
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Paper>
                    )}
                  </Paper>

                  {/* Work Permit Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                        <DescriptionIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Work Permit Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} sx={{ mb: 2 }}>
                      <TextField
                        label="Work Permit Start"
                        name="workPermitStart"
                        value={form.workPermitStart}
                        onChange={handleFormChange}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Work Permit End"
                        name="workPermitEnd"
                        value={form.workPermitEnd}
                        onChange={handleFormChange}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.warning.main,
                          color: theme.palette.warning.main,
                          '&:hover': {
                            borderColor: theme.palette.warning.dark,
                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          },
                        }}
                      >
                        Work Permit Copy
                        <input type="file" name="workPermitCopy" hidden onChange={handleFileChange} />
                      </Button>
                      {form.workPermitCopy && typeof form.workPermitCopy === 'object' && 'name' in form.workPermitCopy && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          📎 {form.workPermitCopy.name}
                        </Typography>
                      )}
                    </Box>
                  </Paper>

                  {/* Notes Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <DescriptionIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Additional Notes
                      </Typography>
                    </Box>
                    <TextField 
                      label="Notes" 
                      name="notes" 
                      value={form.notes} 
                      onChange={handleFormChange} 
                      fullWidth 
                      multiline 
                      minRows={3}
                      placeholder="Enter any additional notes or comments about this employee record..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.info.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {/* Document Uploads Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                        <AttachFileIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Document Uploads
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      Upload copies of important documents (Note: File uploads are currently stubbed and not saved)
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        📄 Passport Copy
                        <input type="file" name="passportCopy" hidden onChange={handleFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        📄 Residency Copy
                        <input type="file" name="residencyCopy" hidden onChange={handleFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        📄 Civil ID Copy
                        <input type="file" name="civilIdCopy" hidden onChange={handleFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        📄 Visa Copy
                        <input type="file" name="visaCopy" hidden onChange={handleFileChange} />
                      </Button>
                    </Box>
                  </Paper>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
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
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Button 
                  onClick={handleClose}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.divider, 0.1),
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.info.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {editing ? 'Update Record' : 'Add Record'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog 
              open={!!deleteId} 
              onClose={() => setDeleteId(null)}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  borderRadius: 3,
                  boxShadow: `0 20px 40px ${alpha(theme.palette.error.main, 0.2)}`,
                }
              }}
            >
              <DialogTitle
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                    <DeleteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      Delete Employee Record
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      This action cannot be undone
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              
              <DialogContent sx={{ p: 3 }}>
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    '& .MuiAlert-icon': {
                      color: theme.palette.warning.main,
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    ⚠️ Warning: This will permanently delete the employee record
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    All associated data including documents, passes, and personal information will be removed from the system. 
                    This action cannot be undone.
                  </Typography>
                </Alert>
                
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  Are you sure you want to delete this employee record?
                </Typography>
              </DialogContent>
              
              <DialogActions
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Button 
                  onClick={() => setDeleteId(null)}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.divider, 0.1),
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  🗑️ Delete Record
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!success}
              autoHideDuration={3000}
              onClose={() => setSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 0.5 }}>
                      📋 Government Document Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive tracking of government licenses, permits, and compliance documents
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleGovDocOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.info.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Add Document
                </Button>
              </Box>
            </Paper>

            {govDocLoading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: theme.shape.borderRadius }} />
                ))}
              </Box>
            ) : govDocError ? (
              <Alert severity="error" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
                {govDocError}
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
                {Array.isArray(govDocs) && govDocs.map((doc, index) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                              <DescriptionIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                {doc.documentNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {documentTypes.find(d => d.value === doc.documentType)?.label || doc.documentType}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={doc.status} 
                              color={documentStatusColors[doc.status] || 'default'} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip 
                              label={doc.expiryDate ? dayjs(doc.expiryDate).format('YYYY-MM-DD') : 'No Expiry'} 
                              color={getGovDocExpiryStatus(doc.expiryDate)} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📄 {doc.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            🏛️ {doc.issuingAuthority}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📅 Issued: {doc.issueDate ? dayjs(doc.issueDate).format('YYYY-MM-DD') : 'N/A'}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Expiry Date
                            </Typography>
                            <Chip 
                              label={doc.expiryDate ? dayjs(doc.expiryDate).format('YYYY-MM-DD') : 'No Expiry'} 
                              color={getGovDocExpiryStatus(doc.expiryDate)} 
                              size="small"
                              sx={{ fontWeight: 600, mt: 0.5 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Renewal Fee
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.warning.main }}>
                              {doc.renewalFee ? doc.renewalFee.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>

                        {doc.description && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Description
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                              {doc.description.length > 100 ? `${doc.description.substring(0, 100)}...` : doc.description}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleGovDocOpen(doc)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => setGovDocDeleteId(doc._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            {/* Add/Edit Dialog */}
            <Dialog 
              open={govDocOpen} 
              onClose={handleGovDocClose} 
              maxWidth="md" 
              fullWidth
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                    {govDocEditing ? '✏️ Edit Government Document' : '📋 Add New Government Document'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {govDocEditing ? 'Update document information and compliance details' : 'Create a new government document with comprehensive tracking'}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleGovDocSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Document Information Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        📋 Document Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Type" 
                        name="documentType" 
                        value={govDocForm.documentType} 
                        onChange={handleGovDocFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        {documentTypes.map(d => <MenuItem key={d.value} value={d.value}>📄 {d.label}</MenuItem>)}
                      </TextField>
                      <TextField 
                        label="Number" 
                        name="documentNumber" 
                        value={govDocForm.documentNumber} 
                        onChange={handleGovDocFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Title" 
                        name="title" 
                        value={govDocForm.title} 
                        onChange={handleGovDocFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Description" 
                      name="description" 
                      value={govDocForm.description} 
                      onChange={handleGovDocFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Paper>
                  {/* Authority & Dates Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        🏛️ Authority & Dates
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Issuing Authority" 
                        name="issuingAuthority" 
                        value={govDocForm.issuingAuthority} 
                        onChange={handleGovDocFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Issue Date" 
                        name="issueDate" 
                        value={govDocForm.issueDate} 
                        onChange={handleGovDocFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Expiry Date" 
                        name="expiryDate" 
                        value={govDocForm.expiryDate} 
                        onChange={handleGovDocFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                  {/* Status & Renewal Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                        <SecurityIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                        🔄 Status & Renewal
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Status" 
                        name="status" 
                        value={govDocForm.status} 
                        onChange={handleGovDocFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="active">✅ Active</MenuItem>
                        <MenuItem value="expired">⏰ Expired</MenuItem>
                        <MenuItem value="pending_renewal">🔄 Pending Renewal</MenuItem>
                        <MenuItem value="suspended">⏸️ Suspended</MenuItem>
                        <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                      </TextField>
                      <TextField 
                        label="Renewal Fee (KWD)" 
                        name="renewalFee" 
                        value={govDocForm.renewalFee} 
                        onChange={handleGovDocFormChange} 
                        type="number" 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Renewal Process" 
                      name="renewalProcess" 
                      value={govDocForm.renewalProcess} 
                      onChange={handleGovDocFormChange} 
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {/* Notes Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.neutral.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                        📝 Additional Notes
                      </Typography>
                    </Box>
                    <TextField 
                      label="Notes" 
                      name="notes" 
                      value={govDocForm.notes} 
                      onChange={handleGovDocFormChange} 
                      fullWidth 
                      multiline 
                      minRows={3}
                      placeholder="Enter any additional information, requirements, or special notes about this document..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.secondary.main,
                          },
                        },
                      }}
                    />
                  </Paper>
                  {/* Document Uploads Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <AttachFileIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        📎 Document Uploads
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Upload relevant documents for government compliance (stub - not saved)
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        📄 Original Document
                        <input type="file" name="originalDocument" hidden onChange={handleGovDocFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        📋 Renewal Application
                        <input type="file" name="renewalApplication" hidden onChange={handleGovDocFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        📁 Supporting Documents
                        <input type="file" name="supportingDocuments" hidden onChange={handleGovDocFileChange} multiple />
                      </Button>
                    </Box>
                  </Paper>
                  
                  {govDocError && <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>{govDocError}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                p: 2
              }}>
                <Button 
                  onClick={handleGovDocClose}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      background: alpha(theme.palette.text.secondary, 0.1)
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGovDocSubmit} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.info.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {govDocEditing ? '✏️ Update Document' : '📋 Add Document'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog 
              open={!!govDocDeleteId} 
              onClose={() => setGovDocDeleteId(null)}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    🗑️ Delete Government Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    ⚠️ Warning: This will permanently delete the government document
                  </Typography>
                  <Typography variant="body2">
                    Are you sure you want to delete this government document? This action cannot be undone and will remove all associated data including compliance records, renewal information, and uploaded documents.
                  </Typography>
                </Alert>
              </DialogContent>
              <DialogActions sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                p: 2
              }}>
                <Button 
                  onClick={() => setGovDocDeleteId(null)}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      background: alpha(theme.palette.text.secondary, 0.1)
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGovDocDelete} 
                  color="error" 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🗑️ Delete Document
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!govDocSuccess}
              autoHideDuration={3000}
              onClose={() => setGovDocSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{govDocSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </motion.div>
        )}
        {tab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
                    <LocalShippingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 0.5 }}>
                      🚗 Assets Record Tracking
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive vehicle registration, insurance, and compliance management
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleVehicleOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Add Vehicle Registration
                </Button>
              </Box>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: theme.shape.borderRadius }} />
                ))}
              </Box>
            ) : vehicleError ? (
              <Alert severity="error" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
                {vehicleError}
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 3 }}>
                {Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.15)}`,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}>
                              <LocalShippingIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                {vehicle.plateNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {vehicle.vehicle?.description || vehicle.vehicle}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={vehicle.status} 
                              color={statusColors[vehicle.status] || 'default'} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            {vehicle.hasPasses && vehicle.passes && vehicle.passes.length > 0 ? (
                              <MuiTooltip title={vehicle.passes.map((p: any) => p.passType).join(', ')}>
                                <Chip label={`${vehicle.passes.length} Passes`} color="info" size="small" sx={{ fontWeight: 600 }} />
                              </MuiTooltip>
                            ) : (
                              <Chip label="No Passes" color="default" size="small" sx={{ fontWeight: 600 }} />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            🏷️ {vehicle.registrationNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            🔧 {vehicle.chassisNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🏢 {vehicle.assetRegistrationType?.toUpperCase() || 'N/A'}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Registration Expiry
                            </Typography>
                            <Chip 
                              label={vehicle.registrationExpiry ? dayjs(vehicle.registrationExpiry).format('YYYY-MM-DD') : 'N/A'} 
                              color={getVehicleExpiryStatus(vehicle.registrationExpiry)} 
                              size="small"
                              sx={{ fontWeight: 600, mt: 0.5 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Insurance Expiry
                            </Typography>
                            <Chip 
                              label={vehicle.insuranceExpiry ? dayjs(vehicle.insuranceExpiry).format('YYYY-MM-DD') : 'N/A'} 
                              color={getVehicleExpiryStatus(vehicle.insuranceExpiry)} 
                              size="small"
                              sx={{ fontWeight: 600, mt: 0.5 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Insurance Company
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {vehicle.insuranceCompany || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Insurance Cost
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.warning.main }}>
                              {vehicle.insuranceCost ? `KWD ${vehicle.insuranceCost}` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Payment System
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {vehicle.insurancePaymentSystem?.toUpperCase() || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Periodic Check
                            </Typography>
                            <Chip 
                              label={vehicle.periodicCheck?.expiryDate ? dayjs(vehicle.periodicCheck.expiryDate).format('YYYY-MM-DD') : 'N/A'} 
                              color={getVehicleExpiryStatus(vehicle.periodicCheck?.expiryDate)} 
                              size="small"
                              sx={{ fontWeight: 600, mt: 0.5 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleVehicleOpen(vehicle)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => setVehicleDeleteId(vehicle._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            {/* Add/Edit Dialog */}
            <Dialog 
              open={vehicleOpen} 
              onClose={handleVehicleClose} 
              maxWidth="lg" 
              fullWidth
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.success.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}>
                  <LocalShippingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                    {vehicleEditing ? '✏️ Edit Vehicle Registration' : '🚗 Add New Vehicle Registration'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicleEditing ? 'Update vehicle registration and compliance information' : 'Create a new vehicle registration with comprehensive tracking'}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleVehicleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Vehicle Information Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, width: 32, height: 32 }}>
                        <LocalShippingIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                        🚗 Vehicle Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Vehicle" 
                        name="vehicle" 
                        value={vehicleForm.vehicle} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Vehicle</MenuItem>
                        {Array.isArray(assets) && assets.map(asset => (
                          <MenuItem key={asset._id} value={asset._id}>🚗 {asset.description} - {asset.plateNumber || asset.serialNumber || asset.fleetNumber}</MenuItem>
                        ))}
                      </TextField>
                      <TextField 
                        label="Plate Number" 
                        name="plateNumber" 
                        value={vehicleForm.plateNumber} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Chassis Number" 
                        name="chassisNumber" 
                        value={vehicleForm.chassisNumber} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Engine Number" 
                        name="engineNumber" 
                        value={vehicleForm.engineNumber} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                  
                  {/* Registration Details Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        📋 Registration Details
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Registration Number" 
                        name="registrationNumber" 
                        value={vehicleForm.registrationNumber} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Registration Expiry" 
                        name="registrationExpiry" 
                        value={vehicleForm.registrationExpiry} 
                        onChange={handleVehicleFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                  
                  {/* Insurance Information Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <SecurityIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        🛡️ Insurance Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Insurance Company" 
                        name="insuranceCompany" 
                        value={vehicleForm.insuranceCompany} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Policy Number" 
                        name="insurancePolicyNumber" 
                        value={vehicleForm.insurancePolicyNumber} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Insurance Expiry" 
                        name="insuranceExpiry" 
                        value={vehicleForm.insuranceExpiry} 
                        onChange={handleVehicleFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Insurance Cost" 
                        name="insuranceCost" 
                        value={vehicleForm.insuranceCost} 
                        onChange={handleVehicleFormChange} 
                        type="number" 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        select 
                        label="Insurance Payment System" 
                        name="insurancePaymentSystem" 
                        value={vehicleForm.insurancePaymentSystem || ''} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="cash">💰 Cash</MenuItem>
                        <MenuItem value="installments">📅 Installments</MenuItem>
                      </TextField>
                      {vehicleForm.insurancePaymentSystem === 'installments' && (
                        <TextField 
                          select 
                          label="Installment Period (months)" 
                          name="insuranceInstallmentPeriod" 
                          value={vehicleForm.insuranceInstallmentPeriod || ''} 
                          onChange={handleVehicleFormChange} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.info.main,
                              },
                            },
                          }}
                        >
                          {[3, 6, 12, 15, 18, 24].map(period => (
                            <MenuItem key={period} value={period}>📅 {period} months</MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Box>
                  </Paper>
                  
                  {/* Registration Card Data Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                        📄 Registration Card Data
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Country Of Manufacture" 
                        name="registrationCardCountry" 
                        value={vehicleForm.registrationCardCountry || ''} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Brand" 
                        name="registrationCardBrand" 
                        value={vehicleForm.registrationCardBrand || ''} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Capacity" 
                        name="registrationCardCapacity" 
                        value={vehicleForm.registrationCardCapacity || ''} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Shape" 
                        name="registrationCardShape" 
                        value={vehicleForm.registrationCardShape || ''} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Colour" 
                        name="registrationCardColour" 
                        value={vehicleForm.registrationCardColour || ''} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>

                  {/* Asset Registration Type & Status Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                        🏢 Asset Registration Type & Status
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Asset Registration Type" 
                        name="assetRegistrationType" 
                        value={vehicleForm.assetRegistrationType || 'public'} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="public">🌐 Public</MenuItem>
                        <MenuItem value="private">🔒 Private</MenuItem>
                      </TextField>
                      <TextField 
                        select 
                        label="Status" 
                        name="status" 
                        value={vehicleForm.status} 
                        onChange={handleVehicleFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="active">✅ Active</MenuItem>
                        <MenuItem value="expired">⏰ Expired</MenuItem>
                        <MenuItem value="suspended">⏸️ Suspended</MenuItem>
                        <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                      </TextField>
                    </Box>
                    <TextField 
                      label="Notes" 
                      name="notes" 
                      value={vehicleForm.notes} 
                      onChange={handleVehicleFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {/* Periodic Check Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.neutral.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.neutral.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.neutral.main, width: 32, height: 32 }}>
                        <BuildIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.neutral.main, fontWeight: 600 }}>
                        🔧 Periodic Check
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Issuance Date" 
                        name="periodicCheck.issuanceDate" 
                        value={vehicleForm.periodicCheck?.issuanceDate || ''} 
                        onChange={handleVehicleFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.neutral.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Expiry Date" 
                        name="periodicCheck.expiryDate" 
                        value={vehicleForm.periodicCheck?.expiryDate || ''} 
                        onChange={handleVehicleFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.neutral.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                  
                  {/* Document Uploads Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <AttachFileIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        📎 Document Uploads
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Upload relevant documents for vehicle registration (stub - not saved)
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button 
                        variant="outlined" 
                        component="label" 
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        📄 Registration Documents
                        <input type="file" name="vehicleDocs.registration" hidden onChange={handleVehicleFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label" 
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        🛡️ Insurance Documents
                        <input type="file" name="vehicleDocs.insurance" hidden onChange={handleVehicleFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label" 
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        🔧 Inspection Documents
                        <input type="file" name="vehicleDocs.inspection" hidden onChange={handleVehicleFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label" 
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        📋 Other Documents
                        <input type="file" name="vehicleDocs.other" hidden onChange={handleVehicleFileChange} />
                      </Button>
                    </Box>
                  </Paper>
                  
                  {vehicleError && <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>{vehicleError}</Alert>}

                  {/* Passes Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <SecurityIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        🎫 Access Passes Management
                      </Typography>
                    </Box>
                    <TextField
                      select
                      label="Does the Asset Have Any Passes?"
                      name="hasPasses"
                      value={vehicleForm.hasPasses || ''}
                      onChange={handleVehicleFormChange}
                      required
                      fullWidth
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    >
                      <MenuItem value="no">❌ No</MenuItem>
                      <MenuItem value="yes">✅ Yes</MenuItem>
                    </TextField>

                    {vehicleForm.hasPasses === 'yes' && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 3, 
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, 
                        borderRadius: theme.shape.borderRadius, 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                            🎫 Vehicle Access Passes
                          </Typography>
                          <Button 
                            variant="contained" 
                            onClick={handleVehicleAddPass}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.success.dark} 100%)`,
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            ➕ Add Pass
                          </Button>
                        </Box>
                        {vehicleForm.passes && vehicleForm.passes.length > 0 && vehicleForm.passes.map((pass, idx) => (
                          <Paper 
                            key={idx} 
                            elevation={0}
                            sx={{ 
                              p: 2, 
                              mb: 2, 
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              borderRadius: theme.shape.borderRadius,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                            }}
                          >
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                              <TextField
                                select
                                label="Pass Type"
                                value={pass.passType || ''}
                                onChange={e => handleVehiclePassChange(idx, 'passType', e.target.value)}
                                sx={{ minWidth: 160 }}
                                required
                                size="small"
                              >
                                <MenuItem value="">Select Type</MenuItem>
                                <MenuItem value="KOC">🏭 KOC</MenuItem>
                                <MenuItem value="KNPC">⛽ KNPC</MenuItem>
                                <MenuItem value="GO">🏛️ GO</MenuItem>
                                <MenuItem value="RATQA">🏗️ RATQA</MenuItem>
                                <MenuItem value="ABDALI">🏢 ABDALI</MenuItem>
                                <MenuItem value="WANEET">🏭 WANEET</MenuItem>
                              </TextField>
                              <TextField
                                label="Issuance Date"
                                type="date"
                                value={pass.issuanceDate || ''}
                                onChange={e => handleVehiclePassChange(idx, 'issuanceDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                                size="small"
                              />
                              <TextField
                                label="Expiry Date"
                                type="date"
                                value={pass.expiryDate || ''}
                                onChange={e => handleVehiclePassChange(idx, 'expiryDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                                size="small"
                              />
                              <TextField
                                label="Sponsor"
                                value={pass.sponsor || ''}
                                onChange={e => handleVehiclePassChange(idx, 'sponsor', e.target.value)}
                                required
                                size="small"
                              />
                              <Button 
                                color="error" 
                                variant="outlined" 
                                onClick={() => handleVehicleRemovePass(idx)}
                                size="small"
                                sx={{
                                  '&:hover': {
                                    background: alpha(theme.palette.error.main, 0.1),
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                🗑️ Remove
                              </Button>
                            </Box>
                          </Paper>
                        ))}
                        {vehicleForm.passes && vehicleForm.passes.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No passes added yet. Click "Add Pass" to get started.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                  {/* Installment Management Section */}
                  {vehicleForm.insurancePaymentSystem === 'installments' && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        borderRadius: theme.shape.borderRadius
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                          <AttachMoneyIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                          💰 Installment Management
                        </Typography>
                      </Box>
                      <Box display="flex" gap={2} alignItems="center">
                        <TextField
                          select
                          label="Installment Calculation Mode"
                          name="installmentCalculationMode"
                          value={vehicleForm.installmentCalculationMode || 'auto'}
                          onChange={handleVehicleFormChange}
                          required
                          sx={{ 
                            minWidth: 220,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.warning.main,
                              },
                            },
                          }}
                        >
                          <MenuItem value="auto">🤖 Calculate Automatically</MenuItem>
                          <MenuItem value="manual">✏️ Manual Entry</MenuItem>
                        </TextField>
                        <TextField
                          label="Value of Installment"
                          name="installmentValue"
                          value={vehicleForm.installmentValue || ''}
                          onChange={handleVehicleFormChange}
                          type="number"
                          required
                          sx={{ 
                            minWidth: 180,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.warning.main,
                              },
                            },
                          }}
                          InputProps={{
                            readOnly: vehicleForm.installmentCalculationMode === 'auto',
                          }}
                          helperText={vehicleForm.installmentCalculationMode === 'auto' ? 'Calculated as Insurance Cost / Period' : 'Enter value manually'}
                        />
                      </Box>
                    </Paper>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                p: 2
              }}>
                <Button 
                  onClick={handleVehicleClose}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      background: alpha(theme.palette.text.secondary, 0.1)
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVehicleSubmit} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {vehicleEditing ? '✏️ Update Vehicle' : '🚗 Add Vehicle'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog 
              open={!!vehicleDeleteId} 
              onClose={() => setVehicleDeleteId(null)}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    🗑️ Delete Vehicle Registration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    ⚠️ Warning: This will permanently delete the vehicle registration
                  </Typography>
                  <Typography variant="body2">
                    Are you sure you want to delete this vehicle registration? This action cannot be undone and will remove all associated data including insurance information, passes, and compliance records.
                  </Typography>
                </Alert>
              </DialogContent>
              <DialogActions sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                p: 2
              }}>
                <Button 
                  onClick={() => setVehicleDeleteId(null)}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      background: alpha(theme.palette.text.secondary, 0.1)
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVehicleDelete} 
                  color="error" 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🗑️ Delete Vehicle
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!vehicleSuccess}
              autoHideDuration={3000}
              onClose={() => setVehicleSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{vehicleSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </motion.div>
        )}
        {tab === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 0.5 }}>
                      📋 Government Correspondence Log
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive tracking of government communications and submissions
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleCorrespondenceOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Add Correspondence
                </Button>
              </Box>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: theme.shape.borderRadius }} />
                ))}
              </Box>
            ) : correspondenceError ? (
              <Alert severity="error" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
                {correspondenceError}
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 3 }}>
                {Array.isArray(correspondences) && correspondences.map((corr, index) => (
                  <motion.div
                    key={corr._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.info.main, 0.15)}`,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                              <DescriptionIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                                {corr.referenceNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {corr.subject}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={corr.status} 
                              color={getCorrespondenceStatusColor(corr.status)} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip 
                              label={corr.priority} 
                              color={getCorrespondencePriorityColor(corr.priority)} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            🏛️ {corr.ministry}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            🏢 {corr.department}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📅 {corr.submissionDate ? dayjs(corr.submissionDate).format('YYYY-MM-DD') : 'No date'}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Contact Person
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {corr.contactPerson || 'Not assigned'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Request Type
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {corr.requestType?.replace('_', ' ').toUpperCase() || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Submission Method
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {corr.submissionMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Fee Status
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: corr.hasFee === 'yes' ? theme.palette.warning.main : theme.palette.success.main }}>
                              {corr.hasFee === 'yes' ? '💰 Has Fee' : '✅ No Fee'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCorrespondenceOpen(corr)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => setCorrespondenceDeleteId(corr._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            {/* Add/Edit Dialog */}
            <Dialog 
              open={correspondenceOpen} 
              onClose={handleCorrespondenceClose} 
              maxWidth="lg" 
              fullWidth
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.info.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                    {correspondenceEditing ? '✏️ Edit Correspondence' : '📋 Add New Correspondence'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {correspondenceEditing ? 'Update government correspondence information' : 'Create a new government correspondence record'}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleCorrespondenceSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Basic Information Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        📋 Basic Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Reference Number" 
                        name="referenceNumber" 
                        value={correspondenceForm.referenceNumber} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Subject" 
                        name="subject" 
                        value={correspondenceForm.subject} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Description" 
                      name="description" 
                      value={correspondenceForm.description} 
                      onChange={handleCorrespondenceFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.info.main,
                          },
                        },
                      }}
                    />
                  </Paper>
                  {/* Government Details Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        🏛️ Government Details
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Ministry" 
                        name="ministry" 
                        value={correspondenceForm.ministry} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        {ministryOptions.map(option => (
                          <MenuItem key={option} value={option}>🏛️ {option}</MenuItem>
                        ))}
                      </TextField>
                      <TextField 
                        label="Department" 
                        name="department" 
                        value={correspondenceForm.department} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Assigned Government Employee" 
                        name="contactPerson" 
                        value={correspondenceForm.contactPerson} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Contact Phone" 
                        name="contactPhone" 
                        value={correspondenceForm.contactPhone} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Contact Email" 
                        name="contactEmail" 
                        value={correspondenceForm.contactEmail} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                  {/* Assignment & Financial Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                        👥 Assignment & Financial
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Assigned Employee" 
                        name="assignedEmployee" 
                        value={correspondenceForm.assignedEmployee} 
                        onChange={handleCorrespondenceFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">None</MenuItem>
                        {employees.map(emp => (
                          <MenuItem key={emp._id} value={emp._id}>👤 {emp.name}</MenuItem>
                        ))}
                      </TextField>
                      <TextField 
                        select 
                        label="Does The Correspondence Have Any Fee" 
                        name="hasFee" 
                        value={correspondenceForm.hasFee} 
                        onChange={handleCorrespondenceFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.secondary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="no">❌ No</MenuItem>
                        <MenuItem value="yes">💰 Yes</MenuItem>
                      </TextField>
                    </Box>
                    {correspondenceForm.hasFee === 'yes' && (
                      <Box display="flex" gap={2}>
                        <TextField 
                          select 
                          label="Amortization" 
                          name="amortization" 
                          value={correspondenceForm.amortization} 
                          onChange={handleCorrespondenceFormChange} 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.secondary.main,
                              },
                            },
                          }}
                        >
                          {[...Array(36)].map((_, i) => (
                            <MenuItem key={i+1} value={`${i+1} Month`}>📅 {i+1} Month</MenuItem>
                          ))}
                        </TextField>
                        <TextField 
                          label="Fee" 
                          name="fee" 
                          value={correspondenceForm.fee} 
                          onChange={handleCorrespondenceFormChange} 
                          type="number" 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.secondary.main,
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Paper>
                  {/* Submission Details Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                        📤 Submission Details
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Submission Date" 
                        name="submissionDate" 
                        value={correspondenceForm.submissionDate} 
                        onChange={handleCorrespondenceFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        select 
                        label="Submission Method" 
                        name="submissionMethod" 
                        value={correspondenceForm.submissionMethod} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="in_person">👤 In Person</MenuItem>
                        <MenuItem value="email">📧 Email</MenuItem>
                        <MenuItem value="fax">📠 Fax</MenuItem>
                        <MenuItem value="post">📮 Post</MenuItem>
                        <MenuItem value="online">🌐 Online</MenuItem>
                      </TextField>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        select 
                        label="Request Type" 
                        name="requestType" 
                        value={correspondenceForm.requestType} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="application">📋 Application</MenuItem>
                        <MenuItem value="query">❓ Query</MenuItem>
                        <MenuItem value="complaint">⚠️ Complaint</MenuItem>
                        <MenuItem value="information_request">ℹ️ Information Request</MenuItem>
                      </TextField>
                      <TextField 
                        select 
                        label="Status" 
                        name="status" 
                        value={correspondenceForm.status} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="submitted">📤 Submitted</MenuItem>
                        <MenuItem value="under_review">🔍 Under Review</MenuItem>
                        <MenuItem value="approved">✅ Approved</MenuItem>
                        <MenuItem value="rejected">❌ Rejected</MenuItem>
                        <MenuItem value="pending_documents">📄 Pending Documents</MenuItem>
                        <MenuItem value="completed">🎉 Completed</MenuItem>
                      </TextField>
                    </Box>
                  </Paper>
                  {/* Response Management Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                        📨 Response Management
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Expected Response Date" 
                        name="expectedResponseDate" 
                        value={correspondenceForm.expectedResponseDate} 
                        onChange={handleCorrespondenceFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Actual Response Date" 
                        name="actualResponseDate" 
                        value={correspondenceForm.actualResponseDate} 
                        onChange={handleCorrespondenceFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <FormControlLabel
                        control={<Checkbox checked={correspondenceForm.responseReceived} onChange={e => setCorrespondenceForm({ ...correspondenceForm, responseReceived: e.target.checked })} name="responseReceived" />}
                        label="Response Received"
                        sx={{ minWidth: 'fit-content' }}
                      />
                      <TextField 
                        label="Response Details" 
                        name="responseDetails" 
                        value={correspondenceForm.responseDetails} 
                        onChange={handleCorrespondenceFormChange} 
                        fullWidth 
                        multiline 
                        minRows={2}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <FormControlLabel
                        control={<Checkbox checked={correspondenceForm.followUpRequired} onChange={e => setCorrespondenceForm({ ...correspondenceForm, followUpRequired: e.target.checked })} name="followUpRequired" />}
                        label="Follow Up Required"
                        sx={{ minWidth: 'fit-content' }}
                      />
                      <TextField 
                        label="Follow Up Date" 
                        name="followUpDate" 
                        value={correspondenceForm.followUpDate} 
                        onChange={handleCorrespondenceFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Follow Up Notes" 
                      name="followUpNotes" 
                      value={correspondenceForm.followUpNotes} 
                      onChange={handleCorrespondenceFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {/* Priority & Assignment Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.neutral.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.neutral.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.neutral.main, width: 32, height: 32 }}>
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.neutral.main, fontWeight: 600 }}>
                        ⚡ Priority & Assignment
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Priority" 
                        name="priority" 
                        value={correspondenceForm.priority} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.neutral.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="low">🟢 Low</MenuItem>
                        <MenuItem value="medium">🟡 Medium</MenuItem>
                        <MenuItem value="high">🟠 High</MenuItem>
                        <MenuItem value="urgent">🔴 Urgent</MenuItem>
                      </TextField>
                      <TextField 
                        label="Assigned To" 
                        name="assignedTo" 
                        value={correspondenceForm.assignedTo} 
                        onChange={handleCorrespondenceFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.neutral.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Notes" 
                      name="notes" 
                      value={correspondenceForm.notes} 
                      onChange={handleCorrespondenceFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.neutral.main,
                          },
                        },
                      }}
                    />
                  </Paper>
                  
                  {/* Document Uploads Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        📎 Document Uploads
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Document uploads are currently stubbed and not saved to the database
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1),
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        📄 Original Document
                        <input type="file" name="originalDocument" hidden onChange={handleCorrespondenceFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1),
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        📨 Response Document
                        <input type="file" name="responseDocument" hidden onChange={handleCorrespondenceFileChange} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        sx={{
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          '&:hover': {
                            borderColor: theme.palette.info.dark,
                            background: alpha(theme.palette.info.main, 0.1),
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        📋 Supporting Documents
                        <input type="file" name="supportingDocuments" hidden onChange={handleCorrespondenceFileChange} multiple />
                      </Button>
                    </Box>
                  </Paper>

                  {correspondenceError && <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>{correspondenceError}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Button 
                  onClick={handleCorrespondenceClose}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCorrespondenceSubmit} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {correspondenceEditing ? '✏️ Update' : '📋 Add'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog 
              open={!!correspondenceDeleteId} 
              onClose={() => setCorrespondenceDeleteId(null)}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    🗑️ Delete Correspondence
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Alert severity="warning" sx={{ flex: 1, borderRadius: theme.shape.borderRadius }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Are you sure you want to delete this correspondence? This will permanently remove all associated data including submission details, response information, and follow-up records.
                    </Typography>
                  </Alert>
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Button 
                  onClick={() => setCorrespondenceDeleteId(null)}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCorrespondenceDelete} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🗑️ Delete
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!correspondenceSuccess}
              autoHideDuration={3000}
              onClose={() => setCorrespondenceSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{correspondenceSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </motion.div>
        )}
        {tab === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.error.main, width: 48, height: 48 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: 600, mb: 0.5 }}>
                      ⚖️ Legal Case Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive legal case tracking with court proceedings and cost management
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleLegalCaseOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Add Legal Case
                </Button>
              </Box>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: theme.shape.borderRadius }} />
                ))}
              </Box>
            ) : legalCaseError ? (
              <Alert severity="error" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
                {legalCaseError}
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 3 }}>
                {Array.isArray(legalCases) && legalCases.map((case_, index) => (
                  <motion.div
                    key={case_._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.error.main, 0.15)}`,
                          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                              <SecurityIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                                {case_.caseNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {case_.title}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={case_.status} 
                              color={getLegalCaseStatusColor(case_.status)} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip 
                              label={case_.priority} 
                              color={getLegalCasePriorityColor(case_.priority)} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            🏛️ {case_.court}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📋 {case_.caseType?.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📅 {case_.filingDate ? dayjs(case_.filingDate).format('YYYY-MM-DD') : 'No date'}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Estimated Cost
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                              {case_.estimatedCost?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Actual Cost
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                              {case_.actualCost?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Legal Representative
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {case_.legalRepresentative?.name || 'Not assigned'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Serial Number
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {case_.serial || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleLegalCaseOpen(case_)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => setLegalCaseDeleteId(case_._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            {/* Add/Edit Dialog */}
            <Dialog 
              open={legalCaseOpen} 
              onClose={handleLegalCaseClose} 
              maxWidth="lg" 
              fullWidth
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    {legalCaseEditing ? '✏️ Edit Legal Case' : '⚖️ Add New Legal Case'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {legalCaseEditing ? 'Update legal case information and proceedings' : 'Create a new legal case with comprehensive tracking'}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleLegalCaseSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Case Information Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.error.main, width: 32, height: 32 }}>
                        <SecurityIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                        ⚖️ Case Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Case Number" 
                        name="caseNumber" 
                        value={legalCaseForm.caseNumber} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Title" 
                        name="title" 
                        value={legalCaseForm.title} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Description" 
                      name="description" 
                      value={legalCaseForm.description} 
                      onChange={handleLegalCaseFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.error.main,
                          },
                        },
                      }}
                    />
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Case Type" 
                        name="caseType" 
                        value={legalCaseForm.caseType} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Case Type</MenuItem>
                        <MenuItem value="labour_dispute">⚖️ Labour Dispute</MenuItem>
                        <MenuItem value="traffic_fine">🚗 Traffic Fine</MenuItem>
                        <MenuItem value="contract_dispute">📋 Contract Dispute</MenuItem>
                        <MenuItem value="regulatory_violation">⚠️ Regulatory Violation</MenuItem>
                        <MenuItem value="other">📄 Other</MenuItem>
                      </TextField>
                      <TextField 
                        select 
                        label="Ministry" 
                        name="court" 
                        value={legalCaseForm.court} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        {legalCaseMinistryOptions.map(option => (
                          <MenuItem key={option} value={option}>🏛️ {option}</MenuItem>
                        ))}
                      </TextField>
                      <TextField 
                        label="Case Review Location" 
                        name="courtLocation" 
                        value={legalCaseForm.courtLocation} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Paid or Not Paid" 
                        name="paidStatus" 
                        value={legalCaseForm.paidStatus} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        {paidOptions.map(option => (
                          <MenuItem key={option} value={option}>{option === 'Paid' ? '✅ Paid' : '❌ Not Paid'}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Status" 
                        name="status" 
                        value={legalCaseForm.status} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="open">🔴 Open</MenuItem>
                        <MenuItem value="pending">⏳ Pending</MenuItem>
                        <MenuItem value="in_progress">🔄 In Progress</MenuItem>
                        <MenuItem value="resolved">✅ Resolved</MenuItem>
                        <MenuItem value="closed">🔒 Closed</MenuItem>
                        <MenuItem value="appealed">📤 Appealed</MenuItem>
                      </TextField>
                      <TextField 
                        select 
                        label="Priority" 
                        name="priority" 
                        value={legalCaseForm.priority} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="low">🟢 Low</MenuItem>
                        <MenuItem value="medium">🟡 Medium</MenuItem>
                        <MenuItem value="high">🟠 High</MenuItem>
                        <MenuItem value="urgent">🔴 Urgent</MenuItem>
                      </TextField>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Estimated Cost" 
                        name="estimatedCost" 
                        value={legalCaseForm.estimatedCost} 
                        onChange={handleLegalCaseFormChange} 
                        type="number" 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Actual Cost" 
                        name="actualCost" 
                        value={legalCaseForm.actualCost} 
                        onChange={handleLegalCaseFormChange} 
                        type="number" 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                  
                  {/* Legal Representative Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        👨‍💼 Legal Representative
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Type Of Legal Representative" 
                        name="legalRepType" 
                        value={legalCaseForm.legalRepType} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        {legalRepTypeOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option === 'Internal' ? '🏢 Internal' : '🏛️ External'}
                          </MenuItem>
                        ))}
                      </TextField>
                      {legalCaseForm.legalRepType === 'Internal' ? (
                        <TextField 
                          label="Co ID" 
                          name="coId" 
                          value={legalCaseForm.coId} 
                          onChange={e => {
                            handleLegalCaseFormChange(e);
                            // Auto-fill name if Co ID matches
                            const emp = employees.find(emp => emp.employeeId === e.target.value);
                            if (emp) setLegalCaseForm((prev: any) => ({
                              ...prev,
                              legalRepresentative: { ...prev.legalRepresentative, name: emp.name }
                            }));
                          }} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                          }}
                        />
                      ) : (
                        <TextField 
                          label="Firm" 
                          name="legalRepresentative.firm" 
                          value={legalCaseForm.legalRepresentative.firm} 
                          onChange={handleLegalCaseFormChange} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Name" 
                        name="legalRepresentative.name" 
                        value={legalCaseForm.legalRepresentative.name} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth 
                        disabled={legalCaseForm.legalRepType === 'Internal'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Phone" 
                        name="legalRepresentative.phone" 
                        value={legalCaseForm.legalRepresentative.phone} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Email" 
                        name="legalRepresentative.email" 
                        value={legalCaseForm.legalRepresentative.email} 
                        onChange={handleLegalCaseFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Contract Amount" 
                      name="legalRepresentative.contractAmount" 
                      value={legalCaseForm.legalRepresentative.contractAmount} 
                      onChange={handleLegalCaseFormChange} 
                      type="number" 
                      required 
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Paper>
                  
                  {/* Parties Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                          <PeopleIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                          👥 Parties
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained"
                        onClick={() => {
                          setLegalCaseForm({
                            ...legalCaseForm,
                            parties: [...legalCaseForm.parties, { name: '', type: 'plaintiff', contactInfo: '' }]
                          });
                        }}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.success.main} 100%)`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.success.dark} 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.3)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Add Party
                      </Button>
                    </Box>
                    
                    {legalCaseForm.parties.map((party: any, index: number) => (
                      <Box 
                        key={index} 
                        display="flex" 
                        gap={2} 
                        alignItems="center" 
                        sx={{ 
                          p: 2, 
                          mb: 2,
                          background: alpha(theme.palette.background.paper, 0.8),
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, 
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: alpha(theme.palette.secondary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <TextField 
                          label="Name" 
                          value={party.name} 
                          onChange={(e) => {
                            const newParties = [...legalCaseForm.parties];
                            newParties[index].name = e.target.value;
                            setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                          }} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.secondary.main,
                              },
                            },
                          }}
                        />
                        <TextField 
                          select 
                          label="Type" 
                          value={party.type} 
                          onChange={(e) => {
                            const newParties = [...legalCaseForm.parties];
                            newParties[index].type = e.target.value;
                            setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                          }} 
                          required 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.secondary.main,
                              },
                            },
                          }}
                        >
                          <MenuItem value="plaintiff">⚖️ Plaintiff</MenuItem>
                          <MenuItem value="defendant">🛡️ Defendant</MenuItem>
                          <MenuItem value="third_party">👤 Third Party</MenuItem>
                        </TextField>
                        <TextField 
                          label="Contact Info" 
                          value={party.contactInfo} 
                          onChange={(e) => {
                            const newParties = [...legalCaseForm.parties];
                            newParties[index].contactInfo = e.target.value;
                            setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                          }} 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: theme.palette.secondary.main,
                              },
                            },
                          }}
                        />
                        <IconButton 
                          color="error" 
                          onClick={() => {
                            const newParties = legalCaseForm.parties.filter((_: any, i: number) => i !== index);
                            setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                          }}
                          sx={{
                            '&:hover': {
                              background: alpha(theme.palette.error.main, 0.1),
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}

                    <TextField 
                      label="Notes" 
                      name="notes" 
                      value={legalCaseForm.notes} 
                      onChange={handleLegalCaseFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.secondary.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {legalCaseError && <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>{legalCaseError}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Button 
                  onClick={handleLegalCaseClose}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLegalCaseSubmit} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {legalCaseEditing ? '✏️ Update' : '⚖️ Add'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog 
              open={!!legalCaseDeleteId} 
              onClose={() => setLegalCaseDeleteId(null)}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    🗑️ Delete Legal Case
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Alert severity="warning" sx={{ flex: 1, borderRadius: theme.shape.borderRadius }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Are you sure you want to delete this legal case? This will permanently remove all associated data including case details, parties, and legal representative information.
                    </Typography>
                  </Alert>
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Button 
                  onClick={() => setLegalCaseDeleteId(null)}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLegalCaseDelete} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🗑️ Delete
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!legalCaseSuccess}
              autoHideDuration={3000}
              onClose={() => setLegalCaseSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{legalCaseSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </motion.div>
        )}
        {tab === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.neutral?.main || '#795548', 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.neutral?.main || '#795548', 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.neutral?.main || '#795548', width: 48, height: 48 }}>
                    <BuildIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.neutral?.main || '#795548', fontWeight: 600, mb: 0.5 }}>
                      🏢 Company Facility Documents
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive facility management with approvals and documentation
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleFacilityOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.neutral?.main || '#795548'} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.neutral?.dark || '#5D4037'} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.neutral?.main || '#795548', 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Add Facility
                </Button>
              </Box>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: theme.shape.borderRadius }} />
                ))}
              </Box>
            ) : facilityError ? (
              <Alert severity="error" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
                {facilityError}
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
                {Array.isArray(facilities) && facilities.map((facility, index) => (
                  <motion.div
                    key={facility._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.neutral?.main || '#795548', 0.15)}`,
                          border: `1px solid ${alpha(theme.palette.neutral?.main || '#795548', 0.3)}`
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.neutral?.main || '#795548', width: 40, height: 40 }}>
                              <BuildIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.neutral?.main || '#795548' }}>
                                {facility.facilityName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {facility.facilityType}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={facility.status} 
                            color={getFacilityStatusColor(facility.status)} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📍 {facility.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📏 {facility.area} sqm
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Rent Agreement
                            </Typography>
                            <Chip 
                              label={facility.rentAgreement?.status || 'N/A'} 
                              color={getApprovalStatusColor(facility.rentAgreement?.status)} 
                              size="small"
                              sx={{ ml: 1, fontWeight: 600 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Municipality
                            </Typography>
                            <Chip 
                              label={facility.municipalityApproval?.status || 'N/A'} 
                              color={getApprovalStatusColor(facility.municipalityApproval?.status)} 
                              size="small"
                              sx={{ ml: 1, fontWeight: 600 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Fire Department
                            </Typography>
                            <Chip 
                              label={facility.fireDepartmentApproval?.status || 'N/A'} 
                              color={getApprovalStatusColor(facility.fireDepartmentApproval?.status)} 
                              size="small"
                              sx={{ ml: 1, fontWeight: 600 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              MOC Approval
                            </Typography>
                            <Chip 
                              label={facility.mocApproval?.status || 'N/A'} 
                              color={getApprovalStatusColor(facility.mocApproval?.status)} 
                              size="small"
                              sx={{ ml: 1, fontWeight: 600 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleFacilityOpen(facility)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => setFacilityDeleteId(facility._id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            {/* Add/Edit Dialog */}
            <Dialog 
              open={facilityOpen} 
              onClose={handleFacilityClose} 
              maxWidth="lg" 
              fullWidth
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.neutral?.main || '#795548', 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.neutral?.main || '#795548', 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.neutral?.main || '#795548', 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.neutral?.main || '#795548', width: 40, height: 40 }}>
                  <BuildIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.neutral?.main || '#795548', fontWeight: 600 }}>
                    {facilityEditing ? '✏️ Edit Facility' : '🏢 Add New Facility'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {facilityEditing ? 'Update facility information and approvals' : 'Create a new facility with all required documentation'}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleFacilitySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Basic Information Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        📋 Basic Information
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Facility Name" 
                        name="facilityName" 
                        value={facilityForm.facilityName} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        select 
                        label="Facility Type" 
                        name="facilityType" 
                        value={facilityForm.facilityType} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="office">🏢 Office</MenuItem>
                        <MenuItem value="warehouse">🏭 Warehouse</MenuItem>
                        <MenuItem value="workshop">🔧 Workshop</MenuItem>
                        <MenuItem value="showroom">🏪 Showroom</MenuItem>
                        <MenuItem value="residential">🏠 Residential</MenuItem>
                        <MenuItem value="other">📦 Other</MenuItem>
                      </TextField>
                    </Box>
                    <TextField 
                      label="Address" 
                      name="address" 
                      value={facilityForm.address} 
                      onChange={handleFacilityFormChange} 
                      required 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    <Box display="flex" gap={2}>
                      <TextField 
                        label="Area (sqm)" 
                        name="area" 
                        value={facilityForm.area} 
                        onChange={handleFacilityFormChange} 
                        type="number" 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        select 
                        label="Status" 
                        name="status" 
                        value={facilityForm.status} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="active">✅ Active</MenuItem>
                        <MenuItem value="inactive">⏸️ Inactive</MenuItem>
                        <MenuItem value="under_renovation">🔨 Under Renovation</MenuItem>
                        <MenuItem value="closed">❌ Closed</MenuItem>
                      </TextField>
                    </Box>
                  </Paper>

                  {/* Rent Agreement Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, width: 32, height: 32 }}>
                        <AttachMoneyIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                        💰 Rent Agreement
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Agreement Number" 
                        name="rentAgreement.agreementNumber" 
                        value={facilityForm.rentAgreement.agreementNumber} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Landlord Name" 
                        name="rentAgreement.landlordName" 
                        value={facilityForm.rentAgreement.landlordName} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Landlord Contact" 
                        name="rentAgreement.landlordContact" 
                        value={facilityForm.rentAgreement.landlordContact} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Monthly Rent" 
                        name="rentAgreement.monthlyRent" 
                        value={facilityForm.rentAgreement.monthlyRent} 
                        onChange={handleFacilityFormChange} 
                        type="number" 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Start Date" 
                        name="rentAgreement.startDate" 
                        value={facilityForm.rentAgreement.startDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="End Date" 
                        name="rentAgreement.endDate" 
                        value={facilityForm.rentAgreement.endDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Is There Any Security Deposit?" 
                        name="hasSecurityDeposit" 
                        value={facilityForm.hasSecurityDeposit} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.success.main,
                            },
                          },
                        }}
                      >
                        {yesNoOptions.map(option => (
                          <MenuItem key={option} value={option}>{option === 'Yes' ? '✅ Yes' : '❌ No'}</MenuItem>
                        ))}
                      </TextField>
                      {facilityForm.hasSecurityDeposit === 'Yes' && (
                        <>
                          <TextField 
                            label="Amount" 
                            name="securityDepositAmount" 
                            value={facilityForm.securityDepositAmount} 
                            onChange={handleFacilityFormChange} 
                            type="number" 
                            required 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                            }}
                          />
                          <TextField 
                            select 
                            label="Amortization" 
                            name="securityDepositAmortization" 
                            value={facilityForm.securityDepositAmortization} 
                            onChange={handleFacilityFormChange} 
                            required 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.success.main,
                                },
                              },
                            }}
                          >
                            {amortizationOptions.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </TextField>
                        </>
                      )}
                    </Box>
                    <TextField 
                      label="Renewal Terms" 
                      name="rentAgreement.renewalTerms" 
                      value={facilityForm.rentAgreement.renewalTerms} 
                      onChange={handleFacilityFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.success.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {/* Municipality Approval Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                        🏛️ Municipality Approval
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Approval Number" 
                        name="municipalityApproval.approvalNumber" 
                        value={facilityForm.municipalityApproval.approvalNumber} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Approval Type" 
                        name="municipalityApproval.approvalType" 
                        value={facilityForm.municipalityApproval.approvalType} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Approval Date" 
                        name="municipalityApproval.approvalDate" 
                        value={facilityForm.municipalityApproval.approvalDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Expiry Date" 
                        name="municipalityApproval.expiryDate" 
                        value={facilityForm.municipalityApproval.expiryDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField 
                        select 
                        label="Status" 
                        name="municipalityApproval.status" 
                        value={facilityForm.municipalityApproval.status} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="active">✅ Active</MenuItem>
                        <MenuItem value="expired">❌ Expired</MenuItem>
                        <MenuItem value="pending_renewal">⏳ Pending Renewal</MenuItem>
                      </TextField>
                      <TextField 
                        label="Renewal Place" 
                        name="municipalityApproval.renewalProcess" 
                        value={facilityForm.municipalityApproval.renewalProcess} 
                        onChange={handleFacilityFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.info.main,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>

                  {/* Fire Department Approval Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.error.main, width: 32, height: 32 }}>
                        <SecurityIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                        🚒 Fire Department Approval
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Approval Number" 
                        name="fireDepartmentApproval.approvalNumber" 
                        value={facilityForm.fireDepartmentApproval.approvalNumber} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Inspection Date" 
                        name="fireDepartmentApproval.inspectionDate" 
                        value={facilityForm.fireDepartmentApproval.inspectionDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Approval Date" 
                        name="fireDepartmentApproval.approvalDate" 
                        value={facilityForm.fireDepartmentApproval.approvalDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Expiry Date" 
                        name="fireDepartmentApproval.expiryDate" 
                        value={facilityForm.fireDepartmentApproval.expiryDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        select 
                        label="Status" 
                        name="fireDepartmentApproval.status" 
                        value={facilityForm.fireDepartmentApproval.status} 
                        onChange={handleFacilityFormChange} 
                        required 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value="active">✅ Active</MenuItem>
                        <MenuItem value="expired">❌ Expired</MenuItem>
                        <MenuItem value="pending_renewal">⏳ Pending Renewal</MenuItem>
                      </TextField>
                      <TextField 
                        label="Findings" 
                        name="fireDepartmentApproval.findings" 
                        value={facilityForm.fireDepartmentApproval.findings} 
                        onChange={handleFacilityFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.error.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      label="Corrective Actions" 
                      name="fireDepartmentApproval.correctiveActions" 
                      value={facilityForm.fireDepartmentApproval.correctiveActions.join('\n')} 
                      onChange={(e) => setFacilityForm({...facilityForm, fireDepartmentApproval: {...facilityForm.fireDepartmentApproval, correctiveActions: e.target.value.split('\n').filter(action => action.trim() !== '')}})} 
                      fullWidth 
                      multiline 
                      minRows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.error.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {/* MOC Approval Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                        <AdminPanelSettingsIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                        🏛️ Ministry Of (ABC)
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Approval Number" 
                        name="mocApproval.approvalNumber" 
                        value={facilityForm.mocApproval.approvalNumber} 
                        onChange={handleFacilityFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Approval Type" 
                        name="mocApproval.approvalType" 
                        value={facilityForm.mocApproval.approvalType} 
                        onChange={handleFacilityFormChange} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField 
                        label="Approval Date" 
                        name="mocApproval.approvalDate" 
                        value={facilityForm.mocApproval.approvalDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                      <TextField 
                        label="Expiry Date" 
                        name="mocApproval.expiryDate" 
                        value={facilityForm.mocApproval.expiryDate} 
                        onChange={handleFacilityFormChange} 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    </Box>
                    <TextField 
                      select 
                      label="Status" 
                      name="mocApproval.status" 
                      value={facilityForm.mocApproval.status} 
                      onChange={handleFacilityFormChange} 
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      }}
                    >
                      <MenuItem value="active">✅ Active</MenuItem>
                      <MenuItem value="expired">❌ Expired</MenuItem>
                      <MenuItem value="pending_renewal">⏳ Pending Renewal</MenuItem>
                    </TextField>
                  </Paper>

                  {/* Other Approvals Section */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.neutral?.main || '#795548', 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                          <AddIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                          📋 Other Approvals
                        </Typography>
                      </Box>
                      <Button 
                        startIcon={<AddIcon />} 
                        onClick={() => setShowOtherApprovalForm(true)} 
                        variant="contained"
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.neutral?.main || '#795548'} 100%)`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.neutral?.dark || '#5D4037'} 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.3)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Add Approval
                      </Button>
                    </Box>
                    
                    {facilityForm.otherApprovals.map((approval: any, index: number) => (
                      <Box 
                        key={index} 
                        display="flex" 
                        gap={2} 
                        alignItems="center" 
                        sx={{ 
                          p: 2, 
                          mb: 2,
                          background: alpha(theme.palette.background.paper, 0.8),
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, 
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: alpha(theme.palette.secondary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Typography sx={{ flex: 1, fontWeight: 500 }}>
                          {approval.authority} - {approval.approvalNumber}
                        </Typography>
                        <Chip 
                          label={approval.status} 
                          color={getApprovalStatusColor(approval.status)} 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleRemoveOtherApproval(index)}
                          sx={{
                            '&:hover': {
                              background: alpha(theme.palette.error.main, 0.1),
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    
                    {showOtherApprovalForm && (
                      <Box sx={{ 
                        p: 3, 
                        background: alpha(theme.palette.background.paper, 0.9),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`, 
                        borderRadius: theme.shape.borderRadius, 
                        mt: 2 
                      }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.secondary.main, fontWeight: 600, mb: 2 }}>
                          ➕ Add Other Approval
                        </Typography>
                        <Box display="flex" gap={2} mb={2}>
                          <TextField 
                            label="Authority" 
                            value={newOtherApproval.authority} 
                            onChange={(e) => setNewOtherApproval({...newOtherApproval, authority: e.target.value})} 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.secondary.main,
                                },
                              },
                            }}
                          />
                          <TextField 
                            label="Approval Number" 
                            value={newOtherApproval.approvalNumber} 
                            onChange={(e) => setNewOtherApproval({...newOtherApproval, approvalNumber: e.target.value})} 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.secondary.main,
                                },
                              },
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={2} mb={2}>
                          <TextField 
                            label="Approval Date" 
                            value={newOtherApproval.approvalDate} 
                            onChange={(e) => setNewOtherApproval({...newOtherApproval, approvalDate: e.target.value})} 
                            type="date" 
                            InputLabelProps={{ shrink: true }} 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.secondary.main,
                                },
                              },
                            }}
                          />
                          <TextField 
                            label="Expiry Date" 
                            value={newOtherApproval.expiryDate} 
                            onChange={(e) => setNewOtherApproval({...newOtherApproval, expiryDate: e.target.value})} 
                            type="date" 
                            InputLabelProps={{ shrink: true }} 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.secondary.main,
                                },
                              },
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={2} mb={2}>
                          <TextField 
                            select 
                            label="Status" 
                            value={newOtherApproval.status} 
                            onChange={(e) => setNewOtherApproval({...newOtherApproval, status: e.target.value})} 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.secondary.main,
                                },
                              },
                            }}
                          >
                            <MenuItem value="active">✅ Active</MenuItem>
                            <MenuItem value="expired">❌ Expired</MenuItem>
                            <MenuItem value="pending_renewal">⏳ Pending Renewal</MenuItem>
                          </TextField>
                          <TextField 
                            label="Notes" 
                            value={newOtherApproval.notes} 
                            onChange={(e) => setNewOtherApproval({...newOtherApproval, notes: e.target.value})} 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: theme.palette.secondary.main,
                                },
                              },
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={1}>
                          <Button 
                            size="small" 
                            onClick={handleAddOtherApproval} 
                            variant="contained"
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.secondary.main} 100%)`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Add
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => setShowOtherApprovalForm(false)}
                            sx={{
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}

                    <TextField 
                      label="Notes" 
                      name="notes" 
                      value={facilityForm.notes} 
                      onChange={handleFacilityFormChange} 
                      fullWidth 
                      multiline 
                      minRows={2}
                      sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.secondary.main,
                          },
                        },
                      }}
                    />
                  </Paper>

                  {error && <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>{error}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.neutral?.main || '#795548', 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Button 
                  onClick={handleFacilityClose}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFacilitySubmit} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.neutral?.main || '#795548'} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.neutral?.dark || '#5D4037'} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.neutral?.main || '#795548', 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {facilityEditing ? '✏️ Update' : '🏢 Add'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog 
              open={!!facilityDeleteId} 
              onClose={() => setFacilityDeleteId(null)}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.error.main, 0.1)}`
                }
              }}
            >
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    🗑️ Delete Facility
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Alert severity="warning" sx={{ flex: 1, borderRadius: theme.shape.borderRadius }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Are you sure you want to delete this facility? This will permanently remove all associated data including approvals and documentation.
                    </Typography>
                  </Alert>
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Button 
                  onClick={() => setFacilityDeleteId(null)}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFacilityDelete} 
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.warning.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🗑️ Delete
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!facilitySuccess}
              autoHideDuration={3000}
              onClose={() => setFacilitySuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{facilitySuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </motion.div>
        )}
        {tab === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
                    <DashboardIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 0.5 }}>
                      📊 Dashboard & Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive analytics and insights for all business operations
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveAltIcon />} 
                    onClick={handleExportDashboardCSV}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.info.dark} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Export Report
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<PrintIcon />} 
                    onClick={handlePrintDashboard}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Print Report
                  </Button>
                </Box>
              </Box>
            </Paper>
            
            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
              {[
                {
                  title: 'Total Employees',
                  value: employees.length,
                  subtitle: 'Active Residencies',
                  icon: <PeopleIcon sx={{ fontSize: 32 }} />,
                  gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  color: theme.palette.primary.main
                },
                {
                  title: 'Active Documents',
                  value: govDocs.filter(d => d.status === 'active').length,
                  subtitle: 'Government Documents',
                  icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
                  gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                  color: theme.palette.success.main
                },
                {
                  title: 'Active Vehicles',
                  value: vehicles.filter(v => v.status === 'active').length,
                  subtitle: 'Registered Vehicles',
                  icon: <LocalShippingIcon sx={{ fontSize: 32 }} />,
                  gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
                  color: theme.palette.warning.main
                },
                {
                  title: 'Open Cases',
                  value: legalCases.filter(c => c.status === 'open').length,
                  subtitle: 'Legal Cases',
                  icon: <SecurityIcon sx={{ fontSize: 32 }} />,
                  gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
                  color: theme.palette.error.main
                },
                {
                  title: 'Active Facilities',
                  value: facilities.filter(f => f.status === 'active').length,
                  subtitle: 'Company Facilities',
                  icon: <BuildIcon sx={{ fontSize: 32 }} />,
                  gradient: `linear-gradient(135deg, ${theme.palette.neutral?.main || '#795548'} 0%, ${theme.palette.neutral?.light || '#8D6E63'} 100%)`,
                  color: theme.palette.neutral?.main || '#795548'
                },
                {
                  title: 'Pending Items',
                  value: records.filter(r => r.status === 'pending_renewal').length + 
                         govDocs.filter(d => d.status === 'pending_renewal').length + 
                         vehicles.filter(v => v.status === 'expired').length,
                  subtitle: 'Requires Attention',
                  icon: <WarningIcon sx={{ fontSize: 32 }} />,
                  gradient: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.light} 100%)`,
                  color: theme.palette.info.main
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      background: card.gradient,
                      color: 'white',
                      borderRadius: theme.shape.borderRadius,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${alpha(card.color, 0.3)}`
                      }
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                      {card.icon}
                    </Box>
                    <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                          {card.icon}
                        </Avatar>
                        <Typography variant="h3" sx={{ fontWeight: 700, opacity: 0.9 }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {card.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>

            {/* Charts Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 3, mb: 4 }}>
              {/* Residency Status Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: 400,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      👥 Employee Residency Status
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie 
                        data={residencyStatusData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label={(entry: any) => entry.name}
                        labelLine={false}
                      >
                        {residencyStatusData.map((entry, idx) => (
                          <Cell 
                            key={entry.name} 
                            fill={`hsl(${idx * 60}, 70%, 60%)`}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{
                          background: alpha(theme.palette.background.paper, 0.9),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderRadius: theme.shape.borderRadius,
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </motion.div>

              {/* Document Expiry Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: 400,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 40, height: 40 }}>
                      <DescriptionIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                      📅 Document Expiry Timeline
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={documentExpiryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
                      />
                      <RechartsTooltip 
                        contentStyle={{
                          background: alpha(theme.palette.background.paper, 0.9),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                          borderRadius: theme.shape.borderRadius,
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="expiring" 
                        fill={theme.palette.warning.main} 
                        name="Expiring"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="expired" 
                        fill={theme.palette.error.main} 
                        name="Expired"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </motion.div>
            </Box>

            {/* Legal Cases Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    ⚖️ Legal Cases Overview
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: theme.palette.error.main, fontWeight: 600, mb: 2 }}>
                      Case Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie 
                          data={legalCaseStatusData} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80}
                          label={(entry: any) => entry.name}
                          labelLine={false}
                        >
                          {legalCaseStatusData.map((entry, idx) => (
                            <Cell 
                              key={entry.name} 
                              fill={`hsl(${idx * 45 + 200}, 70%, 60%)`}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{
                            background: alpha(theme.palette.background.paper, 0.9),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            borderRadius: theme.shape.borderRadius,
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: theme.palette.error.main, fontWeight: 600, mb: 2 }}>
                      Case Priority Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={legalCasePriorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="priority" 
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            background: alpha(theme.palette.background.paper, 0.9),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            borderRadius: theme.shape.borderRadius,
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill={theme.palette.error.main}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Paper>
            </motion.div>

            {/* Expiry Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 40, height: 40 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                    ⚠️ Expiry Alerts (Next 30 Days)
                  </Typography>
                </Box>
                <Box sx={{ 
                  background: alpha(theme.palette.background.paper, 0.8),
                  borderRadius: theme.shape.borderRadius,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Expiry Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Days Remaining</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiryAlerts.map((alert, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <TableRow sx={{ 
                            background: alert.daysRemaining <= 7 
                              ? alpha(theme.palette.error.main, 0.1) 
                              : alert.daysRemaining <= 15 
                                ? alpha(theme.palette.warning.main, 0.1) 
                                : alpha(theme.palette.success.main, 0.1),
                            '&:hover': {
                              background: alert.daysRemaining <= 7 
                                ? alpha(theme.palette.error.main, 0.15) 
                                : alert.daysRemaining <= 15 
                                  ? alpha(theme.palette.warning.main, 0.15) 
                                  : alpha(theme.palette.success.main, 0.15),
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            }
                          }}>
                            <TableCell sx={{ fontWeight: 500 }}>{alert.type}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{alert.item}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{alert.expiryDate}</TableCell>
                            <TableCell>
                              <Chip 
                                label={`${alert.daysRemaining} days`} 
                                color={alert.daysRemaining <= 7 ? 'error' : alert.daysRemaining <= 15 ? 'warning' : 'success'} 
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={alert.daysRemaining <= 7 ? 'Urgent' : alert.daysRemaining <= 15 ? 'Warning' : 'Normal'} 
                                color={alert.daysRemaining <= 7 ? 'error' : alert.daysRemaining <= 15 ? 'warning' : 'success'} 
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}>
                    <NotificationsIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                    📋 Recent Activities
                  </Typography>
                </Box>
                <Box sx={{ 
                  background: alpha(theme.palette.background.paper, 0.8),
                  borderRadius: theme.shape.borderRadius,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Activity</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentActivities.map((activity, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <TableRow sx={{ 
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.05),
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            }
                          }}>
                            <TableCell sx={{ fontWeight: 500 }}>{activity.date}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{activity.description}</TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.type} 
                                size="small" 
                                sx={{
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.status} 
                                color={activity.status === 'completed' ? 'success' : activity.status === 'pending' ? 'warning' : 'default'} 
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>
        )}
        {tab === tabLabels.length - 1 && (
          <Box>
            <Tabs
              value={travelTab}
              onChange={(_, v) => setTravelTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2, background: '#0b3c75', borderRadius: 2, minHeight: 40 }}
              TabIndicatorProps={{ style: { background: '#fff', height: 4, borderRadius: 2 } }}
            >
              {travelSubTabs.map((label, idx) => (
                <Tab
                  key={label}
                  label={<span style={{ color: travelTab === idx ? '#0b3c75' : '#fff', fontWeight: travelTab === idx ? 700 : 400 }}>{label}</span>}
                  sx={{
                    minWidth: 160,
                    borderRadius: 2,
                    mx: 0.5,
                    background: travelTab === idx ? '#fff' : 'transparent',
                    color: travelTab === idx ? '#0b3c75' : '#fff',
                    fontWeight: travelTab === idx ? 700 : 400,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                />
              ))}
            </Tabs>
            {travelTab === 0 && (
              <Box>
                {/* Travel Overview Dashboard */}
                <Typography variant="h4" gutterBottom sx={{ color: '#00CF95', fontWeight: 600 }}>
                  Travel Overview Dashboard
                </Typography>
                
                {/* Summary Cards */}
                <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                  <Card sx={{ flex: '1 1 200px', minWidth: 200, background: 'linear-gradient(135deg, #00CF95 0%, #00B894 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6">Total Trips</Typography>
                      <Typography variant="h3">{calculateTravelOverview.totalTrips}</Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', minWidth: 200, background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6">Active Trips</Typography>
                      <Typography variant="h3">{calculateTravelOverview.activeTrips.length}</Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', minWidth: 200, background: 'linear-gradient(135deg, #4ECDC4 0%, #26A69A 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6">Upcoming Trips</Typography>
                      <Typography variant="h3">{calculateTravelOverview.upcomingTrips.length}</Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', minWidth: 200, background: 'linear-gradient(135deg, #45B7D1 0%, #2196F3 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6">Total Cost</Typography>
                      <Typography variant="h3">${calculateTravelOverview.totalCost.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Filters</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Filter by Country"
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    />
                    <TextField
                      label="Filter by Employee"
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    />
                    <TextField
                      select
                      label="Filter by Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                  </Box>
                </Paper>

                {/* Active Trips Section */}
                {calculateTravelOverview.activeTrips.length > 0 && (
                  <Paper sx={{ p: 2, mb: 3, border: '2px solid #FF6B6B' }}>
                    <Typography variant="h6" color="error" gutterBottom>
                      🚨 Active Trips (Currently Abroad)
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Destination</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Days Remaining</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {calculateTravelOverview.activeTrips.map((trip) => {
                          const endDate = new Date(trip.endDate);
                          const now = new Date();
                          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <TableRow key={trip._id} sx={{ background: '#FFF5F5' }}>
                              <TableCell>{trip.employee?.name || trip.employee}</TableCell>
                              <TableCell>{trip.destinationCountry}, {trip.destinationCity}</TableCell>
                              <TableCell>{trip.purpose}</TableCell>
                              <TableCell>{dayjs(trip.startDate).format('YYYY-MM-DD')}</TableCell>
                              <TableCell>{dayjs(trip.endDate).format('YYYY-MM-DD')}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${daysRemaining} days`} 
                                  color={daysRemaining <= 3 ? 'error' : daysRemaining <= 7 ? 'warning' : 'success'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton size="small" color="primary" onClick={() => handleItineraryOpen(trip)}>
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                )}

                {/* Upcoming Trips Section */}
                {calculateTravelOverview.upcomingTrips.length > 0 && (
                  <Paper sx={{ p: 2, mb: 3, border: '2px solid #4ECDC4' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      📅 Upcoming Trips (Next 30 Days)
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Destination</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Days Until Start</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {calculateTravelOverview.upcomingTrips.map((trip) => {
                          const startDate = new Date(trip.startDate);
                          const now = new Date();
                          const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <TableRow key={trip._id} sx={{ background: '#F0F9FF' }}>
                              <TableCell>{trip.employee?.name || trip.employee}</TableCell>
                              <TableCell>{trip.destinationCountry}, {trip.destinationCity}</TableCell>
                              <TableCell>{trip.purpose}</TableCell>
                              <TableCell>{dayjs(trip.startDate).format('YYYY-MM-DD')}</TableCell>
                              <TableCell>{dayjs(trip.endDate).format('YYYY-MM-DD')}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${daysUntilStart} days`} 
                                  color={daysUntilStart <= 3 ? 'error' : daysUntilStart <= 7 ? 'warning' : 'success'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton size="small" color="primary" onClick={() => handleItineraryOpen(trip)}>
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                )}

                {/* Country Statistics */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>🌍 Travel by Country</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Country</TableCell>
                        <TableCell>Total Trips</TableCell>
                        <TableCell>Employees Visited</TableCell>
                        <TableCell>Total Cost</TableCell>
                        <TableCell>Average Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(calculateTravelOverview.countryStats)
                        .sort(([,a], [,b]) => (b as any).count - (a as any).count)
                        .map(([country, stats]: [string, any]) => (
                          <TableRow key={country}>
                            <TableCell><strong>{country}</strong></TableCell>
                            <TableCell>{stats.count}</TableCell>
                            <TableCell>{Array.from(stats.employees).join(', ')}</TableCell>
                            <TableCell>${stats.totalCost.toLocaleString()}</TableCell>
                            <TableCell>${(stats.totalCost / stats.count).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Paper>

                {/* Employee Statistics */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>👥 Travel by Employee</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Total Trips</TableCell>
                        <TableCell>Countries Visited</TableCell>
                        <TableCell>Total Cost</TableCell>
                        <TableCell>Average Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(calculateTravelOverview.employeeStats)
                        .sort(([,a], [,b]) => (b as any).count - (a as any).count)
                        .map(([employee, stats]: [string, any]) => (
                          <TableRow key={employee}>
                            <TableCell><strong>{employee}</strong></TableCell>
                            <TableCell>{stats.count}</TableCell>
                            <TableCell>{Array.from(stats.countries).join(', ')}</TableCell>
                            <TableCell>${stats.totalCost.toLocaleString()}</TableCell>
                            <TableCell>${(stats.totalCost / stats.count).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Paper>

                {/* All Travel Records with Filters */}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>📋 All Travel Records</Typography>
                  {travelLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                      <CircularProgress />
                    </Box>
                  ) : travelError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{travelError}</Alert>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Destination</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Cost</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTravelRecords.map((trip) => (
                          <TableRow key={trip._id}>
                            <TableCell>{trip.employee?.name || trip.employee}</TableCell>
                            <TableCell>{trip.destinationCountry}, {trip.destinationCity}</TableCell>
                            <TableCell>{trip.purpose}</TableCell>
                            <TableCell>{trip.startDate ? dayjs(trip.startDate).format('YYYY-MM-DD') : '-'}</TableCell>
                            <TableCell>{trip.endDate ? dayjs(trip.endDate).format('YYYY-MM-DD') : '-'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={trip.travelStatus} 
                                color={
                                  trip.travelStatus === 'completed' ? 'success' : 
                                  trip.travelStatus === 'in_progress' ? 'warning' : 
                                  trip.travelStatus === 'cancelled' ? 'error' : 'default'
                                } 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>${(trip.actualAmount || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" onClick={() => handleItineraryOpen(trip)}>
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              </Box>
            )}
            {travelTab === 1 && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5">Travel Requests</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleTravelRequestOpen()}>
                    Create Travel Request
                  </Button>
                </Box>
                <Paper sx={{ p: 2, overflowX: 'auto' }}>
                  {travelRequestsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                      <CircularProgress />
                    </Box>
                  ) : travelRequestsError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{travelRequestsError}</Alert>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Request #</TableCell>
                          <TableCell>Employee</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Destination</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Dates</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(travelRequests || []).map((request) => (
                          <TableRow key={request._id}>
                            <TableCell>{request.requestNumber}</TableCell>
                            <TableCell>{request.employee?.name || request.employee}</TableCell>
                            <TableCell>
                              <Chip 
                                label={request.travelType} 
                                color={request.travelType === 'international' ? 'warning' : 'default'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>{request.destination?.country}, {request.destination?.city}</TableCell>
                            <TableCell>{request.purpose}</TableCell>
                            <TableCell>
                              {dayjs(request.travelDates?.departure).format('MMM DD')} - {dayjs(request.travelDates?.return).format('MMM DD')}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={request.status} 
                                color={
                                  request.status === 'approved' ? 'success' : 
                                  request.status === 'rejected' ? 'error' : 
                                  request.status === 'under_review' ? 'warning' : 'default'
                                } 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>{request.serial || '-'}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" onClick={() => handleTravelRequestOpen(request)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => setTravelRequestDeleteId(request._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
                {/* Add/Edit Travel Request Dialog */}
                <Dialog open={travelRequestDialogOpen} onClose={handleTravelRequestClose} maxWidth="md" fullWidth>
                  <DialogTitle>{travelRequestEditing ? 'Edit Travel Request' : 'Create Travel Request'}</DialogTitle>
                  <DialogContent>
                    <Box component="form" onSubmit={handleTravelRequestSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                      <TextField select label="Employee" name="employee" value={travelRequestForm.employee} onChange={handleTravelRequestFormChange} required fullWidth>
                        <MenuItem value="">Select Employee</MenuItem>
                        {employees.map(emp => (
                          <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                        ))}
                      </TextField>
                      <TextField select label="Travel Type" name="travelType" value={travelRequestForm.travelType} onChange={handleTravelRequestFormChange} required fullWidth>
                        <MenuItem value="domestic">Domestic</MenuItem>
                        <MenuItem value="international">International</MenuItem>
                      </TextField>
                      <Box display="flex" gap={2}>
                        <TextField label="Destination Country" name="destination.country" value={travelRequestForm.destination.country} onChange={handleTravelRequestFormChange} required fullWidth />
                        <TextField label="Destination City" name="destination.city" value={travelRequestForm.destination.city} onChange={handleTravelRequestFormChange} required fullWidth />
                        <TextField label="Venue" name="destination.venue" value={travelRequestForm.destination.venue} onChange={handleTravelRequestFormChange} fullWidth />
                      </Box>
                      <TextField label="Purpose" name="purpose" value={travelRequestForm.purpose} onChange={handleTravelRequestFormChange} required fullWidth />
                      <Box display="flex" gap={2}>
                        <TextField label="Departure Date" name="travelDates.departure" value={travelRequestForm.travelDates.departure} onChange={handleTravelRequestFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                        <TextField label="Return Date" name="travelDates.return" value={travelRequestForm.travelDates.return} onChange={handleTravelRequestFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                        <TextField label="Flexibility" name="travelDates.flexibility" value={travelRequestForm.travelDates.flexibility} onChange={handleTravelRequestFormChange} fullWidth />
                      </Box>
                      <TextField label="Duration (days)" name="duration" value={travelRequestForm.duration} onChange={handleTravelRequestFormChange} type="number" required fullWidth />
                      <Box display="flex" gap={2}>
                        <TextField label="Local Contact Name" name="localContact.name" value={travelRequestForm.localContact.name} onChange={handleTravelRequestFormChange} fullWidth />
                        <TextField label="Organization" name="localContact.organization" value={travelRequestForm.localContact.organization} onChange={handleTravelRequestFormChange} fullWidth />
                        <TextField label="Phone" name="localContact.phone" value={travelRequestForm.localContact.phone} onChange={handleTravelRequestFormChange} fullWidth />
                        <TextField label="Email" name="localContact.email" value={travelRequestForm.localContact.email} onChange={handleTravelRequestFormChange} fullWidth />
                      </Box>
                      <TextField label="Planned Itinerary" name="plannedItinerary" value={travelRequestForm.plannedItinerary} onChange={handleTravelRequestFormChange} fullWidth multiline minRows={2} />
                      <Box display="flex" gap={2}>
                        <TextField label="Transport Cost" name="estimatedCost.transport" value={travelRequestForm.estimatedCost.transport} onChange={handleTravelRequestFormChange} type="number" fullWidth />
                        <TextField label="Accommodation Cost" name="estimatedCost.accommodation" value={travelRequestForm.estimatedCost.accommodation} onChange={handleTravelRequestFormChange} type="number" fullWidth />
                        <TextField label="Daily Allowance" name="estimatedCost.dailyAllowance" value={travelRequestForm.estimatedCost.dailyAllowance} onChange={handleTravelRequestFormChange} type="number" fullWidth />
                        <TextField label="Miscellaneous" name="estimatedCost.miscellaneous" value={travelRequestForm.estimatedCost.miscellaneous} onChange={handleTravelRequestFormChange} type="number" fullWidth />
                        <TextField label="Total" name="estimatedCost.total" value={travelRequestForm.estimatedCost.total} onChange={handleTravelRequestFormChange} type="number" fullWidth />
                      </Box>
                      <TextField label="Budget Code" name="budgetCode" value={travelRequestForm.budgetCode} onChange={handleTravelRequestFormChange} fullWidth />
                      <TextField label="Project Code" name="projectCode" value={travelRequestForm.projectCode} onChange={handleTravelRequestFormChange} fullWidth />
                      <TextField label="Department" name="department" value={travelRequestForm.department} onChange={handleTravelRequestFormChange} fullWidth />
                      <TextField select label="Urgency" name="urgency" value={travelRequestForm.urgency} onChange={handleTravelRequestFormChange} required fullWidth>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </TextField>
                      <TextField label="Notes" name="notes" value={travelRequestForm.notes} onChange={handleTravelRequestFormChange} fullWidth multiline minRows={2} />
                      {travelRequestsError && <Alert severity="error">{travelRequestsError}</Alert>}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleTravelRequestClose}>Cancel</Button>
                    <Button onClick={handleTravelRequestSubmit} variant="contained" color="primary">{travelRequestEditing ? 'Update' : 'Add'}</Button>
                  </DialogActions>
                </Dialog>
                {/* Delete Dialog */}
                <Dialog open={!!travelRequestDeleteId} onClose={() => setTravelRequestDeleteId(null)}>
                  <DialogTitle>Delete Travel Request</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to delete this travel request?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setTravelRequestDeleteId(null)}>Cancel</Button>
                    <Button onClick={handleTravelRequestDelete} color="error" variant="contained">Delete</Button>
                  </DialogActions>
                </Dialog>
                <Snackbar
                  open={!!travelRequestSuccess}
                  autoHideDuration={3000}
                  onClose={() => setTravelRequestSuccess('')}
                  message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{travelRequestSuccess}</span>}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                />
              </Box>
            )}
            {travelTab === 2 && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5">Travel Authorization</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleTravelAuthorizationOpen()}>
                    Create Authorization
                  </Button>
                </Box>
                <Paper sx={{ p: 2, overflowX: 'auto' }}>
                  {travelAuthorizationsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                      <CircularProgress />
                    </Box>
                  ) : travelAuthorizationsError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{travelAuthorizationsError}</Alert>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Auth #</TableCell>
                          <TableCell>Employee</TableCell>
                          <TableCell>Destination</TableCell>
                          <TableCell>Budget Status</TableCell>
                          <TableCell>Visa Status</TableCell>
                          <TableCell>Policy</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(travelAuthorizations || []).map((auth) => (
                          <TableRow key={auth._id}>
                            <TableCell>{auth.authorizationNumber}</TableCell>
                            <TableCell>{auth.employee?.name || auth.employee}</TableCell>
                            <TableCell>{auth.destination?.country}, {auth.destination?.city}</TableCell>
                            <TableCell>
                              <Chip 
                                label={auth.budgetStatus} 
                                color={auth.budgetStatus === 'approved' ? 'success' : auth.budgetStatus === 'rejected' ? 'error' : 'warning'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={auth.visaRequirements?.status || 'not_required'} 
                                color={
                                  auth.visaRequirements?.status === 'approved' ? 'success' : 
                                  auth.visaRequirements?.status === 'rejected' ? 'error' : 
                                  auth.visaRequirements?.status === 'not_required' ? 'default' : 'warning'
                                } 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={auth.policyAcknowledgment ? 'Acknowledged' : 'Pending'} 
                                color={auth.policyAcknowledgment ? 'success' : 'warning'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={auth.status} 
                                color={
                                  auth.status === 'authorized' ? 'success' : 
                                  auth.status === 'rejected' ? 'error' : 
                                  auth.status === 'pending_budget' || auth.status === 'pending_visa' || auth.status === 'pending_policy' ? 'warning' : 'default'
                                } 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>{auth.serial || '-'}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" onClick={() => handleTravelAuthorizationOpen(auth)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => setTravelAuthorizationDeleteId(auth._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
                {/* Add/Edit Travel Authorization Dialog */}
                <Dialog open={travelAuthorizationDialogOpen} onClose={handleTravelAuthorizationClose} maxWidth="md" fullWidth>
                  <DialogTitle>{travelAuthorizationEditing ? 'Edit Travel Authorization' : 'Create Travel Authorization'}</DialogTitle>
                  <DialogContent>
                    <Box component="form" onSubmit={handleTravelAuthorizationSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                      {/* Add fields for travel authorization form here, similar to travel request */}
                      <TextField select label="Employee" name="employee" value={travelAuthorizationForm.employee} onChange={handleTravelAuthorizationFormChange} required fullWidth>
                        <MenuItem value="">Select Employee</MenuItem>
                        {employees.map(emp => (
                          <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                        ))}
                      </TextField>
                      <Box display="flex" gap={2}>
                        <TextField label="Destination Country" name="destination.country" value={travelAuthorizationForm.destination.country} onChange={handleTravelAuthorizationFormChange} required fullWidth />
                        <TextField label="Destination City" name="destination.city" value={travelAuthorizationForm.destination.city} onChange={handleTravelAuthorizationFormChange} required fullWidth />
                      </Box>
                      <TextField label="Purpose" name="purpose" value={travelAuthorizationForm.purpose} onChange={handleTravelAuthorizationFormChange} required fullWidth />
                      <Box display="flex" gap={2}>
                        <TextField label="Departure Date" name="travelDates.departure" value={travelAuthorizationForm.travelDates.departure} onChange={handleTravelAuthorizationFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                        <TextField label="Return Date" name="travelDates.return" value={travelAuthorizationForm.travelDates.return} onChange={handleTravelAuthorizationFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                      </Box>
                      {/* Add more fields as needed for budget, visa, policy, etc. */}
                      <TextField label="Notes" name="notes" value={travelAuthorizationForm.notes} onChange={handleTravelAuthorizationFormChange} fullWidth multiline minRows={2} />
                      {travelAuthorizationsError && <Alert severity="error">{travelAuthorizationsError}</Alert>}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleTravelAuthorizationClose}>Cancel</Button>
                    <Button onClick={handleTravelAuthorizationSubmit} variant="contained" color="primary">{travelAuthorizationEditing ? 'Update' : 'Add'}</Button>
                  </DialogActions>
                </Dialog>
                {/* Delete Dialog */}
                <Dialog open={!!travelAuthorizationDeleteId} onClose={() => setTravelAuthorizationDeleteId(null)}>
                  <DialogTitle>Delete Travel Authorization</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to delete this travel authorization?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setTravelAuthorizationDeleteId(null)}>Cancel</Button>
                    <Button onClick={handleTravelAuthorizationDelete} color="error" variant="contained">Delete</Button>
                  </DialogActions>
                </Dialog>
                <Snackbar
                  open={!!travelAuthorizationSuccess}
                  autoHideDuration={3000}
                  onClose={() => setTravelAuthorizationSuccess('')}
                  message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{travelAuthorizationSuccess}</span>}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                />
              </Box>
            )}
            {travelTab === 3 && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5">Travel Itinerary</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleItineraryOpen()}>
                    Add Travel Record
                  </Button>
                </Box>
                <Paper sx={{ p: 2, overflowX: 'auto' }}>
                  {travelLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                      <CircularProgress />
                    </Box>
                  ) : travelError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{travelError}</Alert>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Destination</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {travelRecords.map((rec) => (
                          <TableRow key={rec._id}>
                            <TableCell>{rec.employee?.name || rec.employee}</TableCell>
                            <TableCell>{rec.destinationCountry}, {rec.destinationCity}</TableCell>
                            <TableCell>{rec.purpose}</TableCell>
                            <TableCell>{rec.startDate ? dayjs(rec.startDate).format('YYYY-MM-DD') : '-'}</TableCell>
                            <TableCell>{rec.endDate ? dayjs(rec.endDate).format('YYYY-MM-DD') : '-'}</TableCell>
                            <TableCell>
                              <Chip label={rec.travelStatus} color={rec.travelStatus === 'completed' ? 'success' : rec.travelStatus === 'in_progress' ? 'warning' : rec.travelStatus === 'cancelled' ? 'error' : 'default'} size="small" />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" onClick={() => handleItineraryOpen(rec)}><EditIcon /></IconButton>
                              <IconButton size="small" color="error" onClick={() => setItineraryDeleteId(rec._id)}><DeleteIcon /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
                {/* Add/Edit Dialog */}
                <Dialog open={itineraryDialogOpen} onClose={handleItineraryClose} maxWidth="md" fullWidth>
                  <DialogTitle>{itineraryEditing ? 'Edit Travel Record' : 'Add Travel Record'}</DialogTitle>
                  <DialogContent>
                    <Box component="form" onSubmit={handleItinerarySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                      <TextField select label="Employee" name="employee" value={itineraryForm.employee} onChange={handleItineraryFormChange} required fullWidth>
                        <MenuItem value="">Select Employee</MenuItem>
                        {employees.map(emp => (
                          <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                        ))}
                      </TextField>
                      <Box display="flex" gap={2}>
                        <TextField label="Destination Country" name="destinationCountry" value={itineraryForm.destinationCountry} onChange={handleItineraryFormChange} required fullWidth />
                        <TextField label="Destination City" name="destinationCity" value={itineraryForm.destinationCity} onChange={handleItineraryFormChange} required fullWidth />
                      </Box>
                      <TextField label="Purpose" name="purpose" value={itineraryForm.purpose} onChange={handleItineraryFormChange} required fullWidth />
                      <Box display="flex" gap={2}>
                        <TextField label="Start Date" name="startDate" value={itineraryForm.startDate} onChange={handleItineraryFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                        <TextField label="End Date" name="endDate" value={itineraryForm.endDate} onChange={handleItineraryFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                      </Box>
                      <TextField label="Flight Details" name="flightDetails" value={itineraryForm.flightDetails} onChange={handleItineraryFormChange} fullWidth />
                      <TextField label="Accommodation Info" name="accommodationInfo" value={itineraryForm.accommodationInfo} onChange={handleItineraryFormChange} fullWidth />
                      <TextField label="Contact Abroad" name="contactAbroad" value={itineraryForm.contactAbroad} onChange={handleItineraryFormChange} fullWidth />
                      <TextField select label="Status" name="travelStatus" value={itineraryForm.travelStatus} onChange={handleItineraryFormChange} required fullWidth>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </TextField>
                      <TextField label="Notes" name="notes" value={itineraryForm.notes} onChange={handleItineraryFormChange} fullWidth multiline minRows={2} />
                      {itineraryError && <Alert severity="error">{itineraryError}</Alert>}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleItineraryClose}>Cancel</Button>
                    <Button onClick={handleItinerarySubmit} variant="contained" color="primary">{itineraryEditing ? 'Update' : 'Add'}</Button>
                  </DialogActions>
                </Dialog>
                {/* Delete Dialog */}
                <Dialog open={!!itineraryDeleteId} onClose={() => setItineraryDeleteId(null)}>
                  <DialogTitle>Delete Travel Record</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to delete this travel record?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setItineraryDeleteId(null)}>Cancel</Button>
                    <Button onClick={handleItineraryDelete} color="error" variant="contained">Delete</Button>
                  </DialogActions>
                </Dialog>
                <Snackbar
                  open={!!itinerarySuccess}
                  autoHideDuration={3000}
                  onClose={() => setItinerarySuccess('')}
                  message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{itinerarySuccess}</span>}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                />
              </Box>
            )}
            {travelTab === 4 && (
              <Box p={2}>
                <Typography variant="h6" gutterBottom>Upcoming Trips & Reminders</Typography>
                {notificationsLoading && <Typography>Loading...</Typography>}
                {notificationsError && <Alert severity="error">{notificationsError}</Alert>}
                {travelNotifications.length === 0 && !notificationsLoading && <Typography>No upcoming trips or reminders.</Typography>}
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {travelNotifications.map((trip: any) => (
                    <Card key={trip._id} sx={{ minWidth: 300 }}>
                      <CardContent>
                        <Typography variant="subtitle1">{trip.employee?.name || 'Employee'}</Typography>
                        <Typography>Destination: {trip.destinationCountry}, {trip.destinationCity}</Typography>
                        <Typography>Purpose: {trip.purpose}</Typography>
                        <Typography>Start: {trip.startDate ? new Date(trip.startDate).toLocaleString() : ''}</Typography>
                        <Typography>Status: {trip.travelStatus}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
            {travelTab === 5 && (
              <Box>
                {/* Expenses & Budgeting Tab Content */}
                <Typography variant="h6" sx={{ mb: 2 }}>Expenses & Budgeting</Typography>
                <Alert severity="info">This feature is under development.</Alert>
              </Box>
            )}
            {travelTab === 6 && (
              <Box>
                {/* Travel History & Analytics Tab Content */}
                <Typography variant="h6" sx={{ mb: 2 }}>Travel History & Analytics</Typography>
                <Alert severity="info">This feature is under development.</Alert>
              </Box>
            )}
            {travelTab === 7 && (
              <Box>
                {/* Emergency Contacts Tab Content */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Emergency Contacts</Typography>
                  {/* Select travel record to manage contacts for */}
                  <TextField
                    select
                    label="Select Travel Record"
                    value={docTravelRecord?._id || ''}
                    onChange={e => {
                      const rec = travelRecords.find(r => r._id === e.target.value);
                      setDocTravelRecord(rec);
                      handleFetchEmergencyContacts(e.target.value);
                    }}
                    sx={{ minWidth: 300, mb: 2 }}
                  >
                    <MenuItem value="">Select Record</MenuItem>
                    {travelRecords.map(r => (
                      <MenuItem key={r._id} value={r._id}>
                        {r.destinationCountry} - {r.purpose} ({dayjs(r.startDate).format('YYYY-MM-DD')})
                      </MenuItem>
                    ))}
                  </TextField>
                  {docTravelRecord && (
                    <>
                      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => handleEmergencyDialogOpen()}>Add Contact</Button>
                      <Paper sx={{ p: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Country</TableCell>
                              <TableCell>Notes</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {emergencyContacts.map((c, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{c.type}</TableCell>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.phone}</TableCell>
                                <TableCell>{c.email}</TableCell>
                                <TableCell>{c.country}</TableCell>
                                <TableCell>{c.notes}</TableCell>
                                <TableCell>
                                  <IconButton size="small" color="primary" onClick={() => handleEmergencyDialogOpen(c)}><EditIcon /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleEmergencyDelete(docTravelRecord._id, idx)}><DeleteIcon /></IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    </>
                  )}
                  {/* Add/Edit Dialog */}
                  <Dialog open={emergencyDialogOpen} onClose={handleEmergencyDialogClose} maxWidth="sm" fullWidth>
                    <DialogTitle>{emergencyEditing ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
                    <DialogContent>
                      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField select label="Type" name="type" value={emergencyForm.type} onChange={handleEmergencyFormChange} required fullWidth>
                          <MenuItem value="employee">Employee</MenuItem>
                          <MenuItem value="embassy">Embassy</MenuItem>
                          <MenuItem value="insurance">Insurance</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </TextField>
                        <TextField label="Name" name="name" value={emergencyForm.name} onChange={handleEmergencyFormChange} required fullWidth />
                        <TextField label="Phone" name="phone" value={emergencyForm.phone} onChange={handleEmergencyFormChange} required fullWidth />
                        <TextField label="Email" name="email" value={emergencyForm.email} onChange={handleEmergencyFormChange} fullWidth />
                        <TextField label="Country" name="country" value={emergencyForm.country} onChange={handleEmergencyFormChange} fullWidth />
                        <TextField label="Notes" name="notes" value={emergencyForm.notes} onChange={handleEmergencyFormChange} fullWidth multiline minRows={2} />
                        {emergencyError && <Alert severity="error">{emergencyError}</Alert>}
                      </Box>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleEmergencyDialogClose}>Cancel</Button>
                      <Button onClick={() => handleEmergencySubmit(docTravelRecord._id)} variant="contained" color="primary">{emergencyEditing ? 'Update' : 'Add'}</Button>
                    </DialogActions>
                  </Dialog>
                  <Snackbar
                    open={!!emergencySuccess}
                    autoHideDuration={3000}
                    onClose={() => setEmergencySuccess('')}
                    message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{emergencySuccess}</span>}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  />
                </Box>
              </Box>
            )}
            {travelTab === 8 && (
              <Box sx={{ p: 2 }}>
                <Box display="flex" gap={2} mb={2} alignItems="center">
                  <TextField label="Search" value={guidelineSearch} onChange={e => setGuidelineSearch(e.target.value)} sx={{ minWidth: 220 }} />
                  <Button variant="contained" color="primary" onClick={() => handleOpenGuidelineDialog()}>Add Guideline</Button>
                </Box>
                <Paper sx={{ p: 2, overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Flag</TableCell>
                        <TableCell>Country</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell>Tags</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCountryGuidelines.map((g: any, idx: number) => (
                        <TableRow key={g._id || idx}>
                          <TableCell>{g.flagIcon ? <img src={g.flagIcon} alt="flag" style={{ width: 32, height: 20, objectFit: 'cover' }} /> : '-'}</TableCell>
                          <TableCell>{g.country}</TableCell>
                          <TableCell>{g.notes}</TableCell>
                          <TableCell>
                            {g.tags && g.tags.map((tag: string, i: number) => (
                              <Chip key={i} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                          </TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleOpenGuidelineDialog(g)}><EditIcon /></IconButton>
                            <IconButton color="error" onClick={() => handleDeleteGuideline(g._id)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {guidelineError && <Alert severity="error" sx={{ mt: 2 }}>{guidelineError}</Alert>}
                </Paper>
                <Dialog open={guidelineDialogOpen} onClose={handleCloseGuidelineDialog} maxWidth="sm" fullWidth>
                  <DialogTitle>{guidelineEditing ? 'Edit Guideline' : 'Add Guideline'}</DialogTitle>
                  <DialogContent>
                    <Box component="form" onSubmit={handleGuidelineSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                      <Autocomplete
                        options={countries}
                        getOptionLabel={option => option.name}
                        value={countries.find(c => c.name === guidelineForm.country) || null}
                        onChange={(_, value) => {
                          setGuidelineForm({
                            ...guidelineForm,
                            country: value ? value.name : '',
                            flagIcon: value ? value.flagUrl : ''
                          });
                        }}
                        renderInput={params => <TextField {...params} label="Country" required />}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                      />
                      <TextField label="Notes/Guidelines" name="notes" value={guidelineForm.notes} onChange={handleGuidelineFormChange} fullWidth multiline minRows={2} />
                      <Box>
                        <TextField label="Tags (comma separated)" name="tags" value={guidelineForm.tags.join(', ')} onChange={handleGuidelineTagsChange} fullWidth />
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {tagSuggestions.map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              color={guidelineForm.tags.includes(tag) ? 'primary' : 'default'}
                              onClick={() => {
                                if (!guidelineForm.tags.includes(tag)) {
                                  setGuidelineForm({ ...guidelineForm, tags: [...guidelineForm.tags, tag] });
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <TextField label="Flag Icon URL" name="flagIcon" value={guidelineForm.flagIcon} onChange={handleGuidelineFormChange} fullWidth placeholder="https://..." />
                      {/* Live Preview */}
                      <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
                        <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          {guidelineForm.flagIcon && <img src={guidelineForm.flagIcon} alt="flag" style={{ width: 32, height: 20, objectFit: 'cover' }} />}
                          <Typography variant="h6">{guidelineForm.country || 'Country'}</Typography>
                        </Box>
                        <Typography sx={{ mt: 1 }}>{guidelineForm.notes || 'No notes yet.'}</Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {guidelineForm.tags.map((tag: string, i: number) => (
                            <Chip key={i} label={tag} size="small" />
                          ))}
                        </Box>
                      </Box>
                      {guidelineError && <Alert severity="error">{guidelineError}</Alert>}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseGuidelineDialog}>Cancel</Button>
                    <Button onClick={handleGuidelineSubmit} variant="contained" color="primary" disabled={!guidelineForm.country}> {guidelineEditing ? 'Update' : 'Add'} </Button>
                  </DialogActions>
                </Dialog>
                <Snackbar
                  open={!!guidelineSuccess}
                  autoHideDuration={3000}
                  onClose={() => setGuidelineSuccess('')}
                  message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{guidelineSuccess}</span>}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        onClick={() => window.location.reload()}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
            transform: 'scale(1.1)'
          }
        }}
      >
        <RefreshIcon />
      </Fab>

      {/* Enhanced Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success"
          sx={{
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            color: theme.palette.success.dark
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            {success}
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!govDocSuccess}
        autoHideDuration={4000}
        onClose={() => setGovDocSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setGovDocSuccess('')} 
          severity="success"
          sx={{
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            color: theme.palette.success.dark
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            {govDocSuccess}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage; 