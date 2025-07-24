import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Button, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Card, CardContent, FormControlLabel, Checkbox, Accordion, AccordionSummary, AccordionDetails, Tooltip as MuiTooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Autocomplete from '@mui/material/Autocomplete';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import countries from '../utils/countries'; // Assume a countries list with { name, code, flagUrl }
import api from '../apiBase';
import dayjs from 'dayjs';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';


const tabLabels = [
  'Employees Record Tracking',
  'Government Document Management',
  'Assets Record Tracking',
  'Government Correspondence Log',
  'Legal Case Management',
  'Company Facility Documents',
  'Dashboard & Reports',
  'Employee Travel Management',
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
  { value: 'GO', label: 'GO' },
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
}

// 1. Add the installment period options at the top:
const installmentPeriodOptions = [3, 6, 12, 15, 18, 24];

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
      passes: [...prev.passes, {
        passType: '',
        issuanceDate: '',
        expiryDate: '',
        sponsor: ''
      }]
    }));
  };

  // Handle removing a pass
  const handleRemovePass = (index: number) => {
    setForm((prev: FormData) => ({
      ...prev,
      passes: prev.passes.filter((_: any, i: number) => i !== index)
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
      });
    } else {
      setCorrespondenceEditing(null);
      setCorrespondenceForm({
        referenceNumber: '', subject: '', description: '', ministry: '', department: '', contactPerson: '', contactPhone: '', contactEmail: '', submissionDate: '', submissionMethod: 'in_person', requestType: 'application', status: 'submitted', expectedResponseDate: '', actualResponseDate: '', responseReceived: false, responseDetails: '', followUpRequired: false, followUpDate: '', followUpNotes: '', priority: 'medium', assignedTo: '', notes: '', documents: {},
      });
    }
    setCorrespondenceOpen(true);
  };

  const handleCorrespondenceClose = () => {
    setCorrespondenceOpen(false);
    setCorrespondenceEditing(null);
    setCorrespondenceForm({
      referenceNumber: '', subject: '', description: '', ministry: '', department: '', contactPerson: '', contactPhone: '', contactEmail: '', submissionDate: '', submissionMethod: 'in_person', requestType: 'application', status: 'submitted', expectedResponseDate: '', actualResponseDate: '', responseReceived: false, responseDetails: '', followUpRequired: false, followUpDate: '', followUpNotes: '', priority: 'medium', assignedTo: '', notes: '', documents: {},
    });
  };

  const handleCorrespondenceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCorrespondenceForm({
      ...correspondenceForm,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
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
      });
    } else {
      setFacilityEditing(null);
      setFacilityForm({
        facilityName: '', facilityType: 'office', address: '', area: '', rentAgreement: { agreementNumber: '', landlordName: '', landlordContact: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', renewalTerms: '', status: 'active' }, municipalityApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active', renewalProcess: '' }, fireDepartmentApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', inspectionDate: '', status: 'active', findings: '', correctiveActions: [] }, mocApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active' }, otherApprovals: [], status: 'active', notes: '',
      });
    }
    setFacilityOpen(true);
  };

  const handleFacilityClose = () => {
    setFacilityOpen(false);
    setFacilityEditing(null);
    setFacilityForm({
      facilityName: '', facilityType: 'office', address: '', area: '', rentAgreement: { agreementNumber: '', landlordName: '', landlordContact: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', renewalTerms: '', status: 'active' }, municipalityApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active', renewalProcess: '' }, fireDepartmentApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', inspectionDate: '', status: 'active', findings: '', correctiveActions: [] }, mocApproval: { approvalNumber: '', approvalDate: '', expiryDate: '', approvalType: '', status: 'active' }, otherApprovals: [], status: 'active', notes: '',
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

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, background: '#00CF95', borderRadius: 2, minHeight: 48 }}
        TabIndicatorProps={{ style: { background: '#fff', height: 4, borderRadius: 2 } }}
      >
        {tabLabels.map((label, idx) => (
          <Tab
            key={label}
            label={<span style={{ color: tab === idx ? (idx === 7 ? '#0b3c75' : '#00CF95') : '#fff', fontWeight: tab === idx ? 700 : 400 }}>{label}</span>}
            sx={{
              minWidth: 180,
              borderRadius: 2,
              mx: 0.5,
              background: tab === idx ? '#fff' : 'transparent',
              color: tab === idx ? (idx === 7 ? '#0b3c75' : '#00CF95') : '#fff',
              fontWeight: tab === idx ? 700 : 400,
              transition: 'background 0.2s, color 0.2s',
            }}
          />
        ))}
      </Tabs>
      <Box>
        {tab === 0 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Employees Record Tracking</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                Add Record
              </Button>
            </Box>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>CO. ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Passport #</TableCell>
                      <TableCell>Passport Expiry</TableCell>
                      <TableCell>Nationality</TableCell>
                      <TableCell>Residency #</TableCell>
                      <TableCell>Residency Expiry</TableCell>
                      <TableCell>Civil ID</TableCell>
                      <TableCell>Civil ID Expiry</TableCell>
                      <TableCell>Visa Type</TableCell>
                      <TableCell>Visa Expiry</TableCell>
                      <TableCell>Sponsor</TableCell>
                      <TableCell>Marital Status</TableCell>
                      <TableCell>Dependents</TableCell>
                      <TableCell>Dependents Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Passes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(records) && records.map((rec) => (
                      <TableRow key={rec._id}>
                        <TableCell>{rec.employee?.name || rec.employee}</TableCell>
                        <TableCell>{rec.coId || '-'}</TableCell>
                        <TableCell>
                          <Chip label={rec.employeeType === 'citizen' ? 'Citizen' : 'Foreigner'} color={rec.employeeType === 'citizen' ? 'primary' : 'secondary'} size="small" />
                        </TableCell>
                        <TableCell>{rec.passportNumber}</TableCell>
                        <TableCell>
                          <Chip label={rec.passportExpiry ? dayjs(rec.passportExpiry).format('YYYY-MM-DD') : '-'} color={getExpiryStatus(rec.passportExpiry)} size="small" />
                        </TableCell>
                        <TableCell>{rec.nationality}</TableCell>
                        <TableCell>{rec.residencyNumber || '-'}</TableCell>
                        <TableCell>
                          <Chip label={rec.residencyExpiry ? dayjs(rec.residencyExpiry).format('YYYY-MM-DD') : '-'} color={getExpiryStatus(rec.residencyExpiry)} size="small" />
                        </TableCell>
                        <TableCell>{rec.civilId || '-'}</TableCell>
                        <TableCell>
                          <Chip label={rec.civilIdExpiry ? dayjs(rec.civilIdExpiry).format('YYYY-MM-DD') : '-'} color={getExpiryStatus(rec.civilIdExpiry)} size="small" />
                        </TableCell>
                        <TableCell>{visaTypes.find(v => v.value === rec.visaType)?.label || rec.visaType}</TableCell>
                        <TableCell>
                          <Chip label={rec.visaExpiry ? dayjs(rec.visaExpiry).format('YYYY-MM-DD') : '-'} color={getExpiryStatus(rec.visaExpiry)} size="small" />
                        </TableCell>
                        <TableCell>{rec.sponsor}</TableCell>
                        <TableCell>{rec.maritalStatus ? maritalStatusOptions.find(ms => ms.value === rec.maritalStatus)?.label || rec.maritalStatus : '-'}</TableCell>
                        <TableCell>{rec.numberOfDependents || '-'}</TableCell>
                        <TableCell>
                          {rec.dependentsLocation ? (
                            rec.dependentsLocation === 'other' ? 
                              `${dependentsLocationOptions.find(dl => dl.value === rec.dependentsLocation)?.label}: ${rec.dependentsLocationOther || 'N/A'}` :
                              dependentsLocationOptions.find(dl => dl.value === rec.dependentsLocation)?.label || rec.dependentsLocation
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label={rec.status} color={statusColors[rec.status] || 'default'} size="small" />
                        </TableCell>
                                              <TableCell>
                        {rec.hasPasses ? (
                          <Box>
                            <Chip label={`${rec.passes?.length || 0} Pass(es)`} color="info" size="small" />
                            {rec.passes && rec.passes.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {rec.passes.map((pass: any, idx: number) => (
                                  <Typography key={idx} variant="caption" display="block">
                                    {pass.passType} - {pass.sponsor}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Chip label="No Passes" color="default" size="small" />
                        )}
                      </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleOpen(rec)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteId(rec._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
              <DialogTitle>{editing ? 'Edit Record' : 'Adding A Record'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField select label="Employee" name="employee" value={form.employee} onChange={handleFormChange} required fullWidth>
                    <MenuItem value="">Select Employee</MenuItem>
                    {Array.isArray(employees) && employees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
                    ))}
                  </TextField>
                  
                  <Box display="flex" gap={2}>
                    <TextField label="CO. ID" name="coId" value={form.coId} onChange={handleFormChange} inputProps={{ maxLength: 5, minLength: 5 }} placeholder="5 digits" fullWidth />
                    <TextField select label="Employee Type" name="employeeType" value={form.employeeType} onChange={handleFormChange} required fullWidth>
                      <MenuItem value="">Select Type</MenuItem>
                      <MenuItem value="citizen">Citizen</MenuItem>
                      <MenuItem value="foreigner">Foreigner</MenuItem>
                    </TextField>
                  </Box>
                  
                  <Box display="flex" gap={2}>
                    <TextField label="Passport Number" name="passportNumber" value={form.passportNumber} onChange={handleFormChange} required fullWidth />
                    <TextField label="Passport Expiry" name="passportExpiry" value={form.passportExpiry} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    {form.employeeType === 'citizen' ? (
                      <TextField select label="Nationality" name="nationality" value={form.nationality} onChange={handleFormChange} required fullWidth>
                        <MenuItem value="">Select Nationality</MenuItem>
                        {nationalities.map(n => <MenuItem key={n.value} value={n.value}>{n.label}</MenuItem>)}
                      </TextField>
                    ) : (
                      <TextField label="Nationality" name="nationality" value={form.nationality} onChange={handleFormChange} required fullWidth />
                    )}
                  </Box>
                  
                  {form.employeeType === 'foreigner' && (
                    <Box display="flex" gap={2}>
                      <TextField label="Residency Number" name="residencyNumber" value={form.residencyNumber} onChange={handleFormChange} required fullWidth />
                      <TextField label="Residency Expiry" name="residencyExpiry" value={form.residencyExpiry} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    </Box>
                  )}
                  
                  {form.employeeType === 'citizen' && (
                    <Box display="flex" gap={2}>
                      <TextField label="Civil ID" name="civilId" value={form.civilId} onChange={handleFormChange} required fullWidth />
                      <TextField label="Civil ID Expiry" name="civilIdExpiry" value={form.civilIdExpiry} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    </Box>
                  )}
                  
                  <Box display="flex" gap={2}>
                    <TextField select label="Visa Type" name="visaType" value={form.visaType} onChange={handleFormChange} required fullWidth>
                      <MenuItem value="">Select Visa Type</MenuItem>
                      {visaTypes.map(v => <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Visa Number" name="visaNumber" value={form.visaNumber} onChange={handleFormChange} required fullWidth />
                    <TextField label="Visa Expiry" name="visaExpiry" value={form.visaExpiry} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  
                  <TextField select label="Sponsor" name="sponsor" value={form.sponsor} onChange={handleFormChange} required fullWidth>
                    <MenuItem value="">Select Sponsor</MenuItem>
                    {sponsors.map((s: any) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                  </TextField>
                  
                  <Box display="flex" gap={2}>
                    <TextField select label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleFormChange} fullWidth>
                      <MenuItem value="">Select Marital Status</MenuItem>
                      {maritalStatusOptions.map(ms => <MenuItem key={ms.value} value={ms.value}>{ms.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Number of Dependents" name="numberOfDependents" value={form.numberOfDependents} onChange={handleFormChange} type="number" inputProps={{ min: 0 }} fullWidth />
                  </Box>
                  
                  <Box display="flex" gap={2}>
                    <TextField select label="Dependents Location" name="dependentsLocation" value={form.dependentsLocation} onChange={handleFormChange} fullWidth>
                      <MenuItem value="">Select Location</MenuItem>
                      {dependentsLocationOptions.map(dl => <MenuItem key={dl.value} value={dl.value}>{dl.label}</MenuItem>)}
                    </TextField>
                    {form.dependentsLocation === 'other' && (
                      <TextField label="Other Location" name="dependentsLocationOther" value={form.dependentsLocationOther} onChange={handleFormChange} required fullWidth />
                    )}
                  </Box>
                  
                  <TextField select label="Status" name="status" value={form.status} onChange={handleFormChange} required fullWidth>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="under_renewal">Under Renewal</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="deported">Deported</MenuItem>
                  </TextField>
                  
                  <TextField select label="Have Any Passes?" name="hasPasses" value={form.hasPasses} onChange={handleFormChange} fullWidth>
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                  </TextField>
                  
                  {form.hasPasses === 'true' && (
                    <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Pass Details</Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<AddIcon />}
                          onClick={handleAddPass}
                        >
                          Add Pass
                        </Button>
                      </Box>
                      
                      {form.passes.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No passes added yet. Click "Add Pass" to add pass details.
                        </Typography>
                      )}
                      
                      {form.passes.map((pass: any, index: number) => (
                        <Box key={index} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, mb: 2, position: 'relative' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">Pass #{index + 1}</Typography>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleRemovePass(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          <Box display="flex" gap={2}>
                            <TextField 
                              select 
                              label="Pass Type" 
                              value={pass.passType || ''} 
                              onChange={(e) => handlePassChange(index, 'passType', e.target.value)} 
                              required 
                              fullWidth
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
                            />
                          </Box>
                          <Box display="flex" gap={2} sx={{ mt: 2 }}>
                            <TextField 
                              label="Expiry Date" 
                              value={pass.expiryDate || ''} 
                              onChange={(e) => handlePassChange(index, 'expiryDate', e.target.value)} 
                              type="date" 
                              InputLabelProps={{ shrink: true }} 
                              required 
                              fullWidth 
                            />
                            <TextField 
                              label="Sponsor" 
                              value={pass.sponsor || ''} 
                              onChange={(e) => handlePassChange(index, 'sponsor', e.target.value)} 
                              required 
                              fullWidth 
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} fullWidth multiline minRows={2} />
                  
                  {/* Document Uploads (stubbed) */}
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Document Uploads (stub - not saved)</Typography>
                  <Box display="flex" gap={2}>
                    <Button variant="outlined" component="label">Passport Copy<input type="file" name="passportCopy" hidden onChange={handleFileChange} /></Button>
                    <Button variant="outlined" component="label">Residency Copy<input type="file" name="residencyCopy" hidden onChange={handleFileChange} /></Button>
                    <Button variant="outlined" component="label">Civil ID Copy<input type="file" name="civilIdCopy" hidden onChange={handleFileChange} /></Button>
                    <Button variant="outlined" component="label">Visa Copy<input type="file" name="visaCopy" hidden onChange={handleFileChange} /></Button>
                  </Box>
                  {error && <Alert severity="error">{error}</Alert>}
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Work Permit Start"
                      name="workPermitStart"
                      value={form.workPermitStart}
                      onChange={handleFormChange}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Work Permit End"
                      name="workPermitEnd"
                      value={form.workPermitEnd}
                      onChange={handleFormChange}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button variant="outlined" component="label">
                      Work Permit Copy
                      <input type="file" name="workPermitCopy" hidden onChange={handleFileChange} />
                    </Button>
                    {form.workPermitCopy && typeof form.workPermitCopy === 'object' && 'name' in form.workPermitCopy && (
                      <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                        {form.workPermitCopy.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">{editing ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
              <DialogTitle>Delete Record</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this record?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
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
        )}
        {tab === 1 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Government Document Management</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleGovDocOpen()}>
                Add Document
              </Button>
            </Box>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {govDocLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : govDocError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{govDocError}</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Number</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Issuing Authority</TableCell>
                      <TableCell>Issue Date</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Renewal Fee</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(govDocs) && govDocs.map((doc) => (
                      <TableRow key={doc._id}>
                        <TableCell>{documentTypes.find(d => d.value === doc.documentType)?.label || doc.documentType}</TableCell>
                        <TableCell>{doc.documentNumber}</TableCell>
                        <TableCell>{doc.title}</TableCell>
                        <TableCell>{doc.issuingAuthority}</TableCell>
                        <TableCell>{doc.issueDate ? dayjs(doc.issueDate).format('YYYY-MM-DD') : '-'}</TableCell>
                        <TableCell>
                          <Chip label={doc.expiryDate ? dayjs(doc.expiryDate).format('YYYY-MM-DD') : '-'} color={getGovDocExpiryStatus(doc.expiryDate)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={doc.status} color={documentStatusColors[doc.status] || 'default'} size="small" />
                        </TableCell>
                        <TableCell>{doc.renewalFee ? doc.renewalFee.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleGovDocOpen(doc)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setGovDocDeleteId(doc._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={govDocOpen} onClose={handleGovDocClose} maxWidth="md" fullWidth>
              <DialogTitle>{govDocEditing ? 'Edit Document' : 'Add Document'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleGovDocSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Box display="flex" gap={2}>
                    <TextField select label="Type" name="documentType" value={govDocForm.documentType} onChange={handleGovDocFormChange} required fullWidth>
                      <MenuItem value="">Select Type</MenuItem>
                      {documentTypes.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Number" name="documentNumber" value={govDocForm.documentNumber} onChange={handleGovDocFormChange} required fullWidth />
                    <TextField label="Title" name="title" value={govDocForm.title} onChange={handleGovDocFormChange} required fullWidth />
                  </Box>
                  <TextField label="Description" name="description" value={govDocForm.description} onChange={handleGovDocFormChange} fullWidth multiline minRows={2} />
                  <Box display="flex" gap={2}>
                    <TextField label="Issuing Authority" name="issuingAuthority" value={govDocForm.issuingAuthority} onChange={handleGovDocFormChange} required fullWidth />
                    <TextField label="Issue Date" name="issueDate" value={govDocForm.issueDate} onChange={handleGovDocFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField label="Expiry Date" name="expiryDate" value={govDocForm.expiryDate} onChange={handleGovDocFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField select label="Status" name="status" value={govDocForm.status} onChange={handleGovDocFormChange} required fullWidth>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                      <MenuItem value="pending_renewal">Pending Renewal</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                    <TextField label="Renewal Fee" name="renewalFee" value={govDocForm.renewalFee} onChange={handleGovDocFormChange} type="number" fullWidth />
                    <TextField label="Renewal Process" name="renewalProcess" value={govDocForm.renewalProcess} onChange={handleGovDocFormChange} fullWidth />
                  </Box>
                  <TextField label="Notes" name="notes" value={govDocForm.notes} onChange={handleGovDocFormChange} fullWidth multiline minRows={2} />
                  {/* Document Uploads (stubbed) */}
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Document Uploads (stub - not saved)</Typography>
                  <Box display="flex" gap={2}>
                    <Button variant="outlined" component="label">Original Document<input type="file" name="originalDocument" hidden onChange={handleGovDocFileChange} /></Button>
                    <Button variant="outlined" component="label">Renewal Application<input type="file" name="renewalApplication" hidden onChange={handleGovDocFileChange} /></Button>
                    <Button variant="outlined" component="label">Supporting Documents<input type="file" name="supportingDocuments" hidden onChange={handleGovDocFileChange} multiple /></Button>
                  </Box>
                  {govDocError && <Alert severity="error">{govDocError}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleGovDocClose}>Cancel</Button>
                <Button onClick={handleGovDocSubmit} variant="contained" color="primary">{govDocEditing ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!govDocDeleteId} onClose={() => setGovDocDeleteId(null)}>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this document?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setGovDocDeleteId(null)}>Cancel</Button>
                <Button onClick={handleGovDocDelete} color="error" variant="contained">Delete</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!govDocSuccess}
              autoHideDuration={3000}
              onClose={() => setGovDocSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{govDocSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Assets Record Tracking</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleVehicleOpen()}>
                Add Vehicle Registration
              </Button>
            </Box>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : vehicleError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{vehicleError}</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Plate Number</TableCell>
                      <TableCell>Chassis Number</TableCell>
                      <TableCell>Registration #</TableCell>
                      <TableCell>Registration Expiry</TableCell>
                      <TableCell>Insurance Company</TableCell>
                      <TableCell>Insurance Expiry</TableCell>
                      <TableCell>Insurance Cost</TableCell>
                      <TableCell>Payment System</TableCell>
                      <TableCell>Installment Period</TableCell>
                      <TableCell>Asset Registration Type</TableCell>
                      <TableCell>Periodic Check Expiry</TableCell>
                      <TableCell>Passes</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(vehicles) && vehicles.map((vehicle) => (
                      <TableRow key={vehicle._id}>
                        <TableCell>{vehicle.vehicle?.description || vehicle.vehicle}</TableCell>
                        <TableCell>{vehicle.plateNumber}</TableCell>
                        <TableCell>{vehicle.chassisNumber}</TableCell>
                        <TableCell>{vehicle.registrationNumber}</TableCell>
                        <TableCell>
                          <Chip label={vehicle.registrationExpiry ? dayjs(vehicle.registrationExpiry).format('YYYY-MM-DD') : '-'} color={getVehicleExpiryStatus(vehicle.registrationExpiry)} size="small" />
                        </TableCell>
                        <TableCell>{vehicle.insuranceCompany}</TableCell>
                        <TableCell>
                          <Chip label={vehicle.insuranceExpiry ? dayjs(vehicle.insuranceExpiry).format('YYYY-MM-DD') : '-'} color={getVehicleExpiryStatus(vehicle.insuranceExpiry)} size="small" />
                        </TableCell>
                        <TableCell>{vehicle.insuranceCost}</TableCell>
                        <TableCell>{vehicle.insurancePaymentSystem}</TableCell>
                        <TableCell>{vehicle.insurancePaymentSystem === 'installments' ? (vehicle.insuranceInstallmentPeriod ? `${vehicle.insuranceInstallmentPeriod} Months` : '-') : '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={vehicle.assetRegistrationType || 'N/A'} 
                            color={vehicle.assetRegistrationType === 'public' ? 'primary' : 'secondary'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={vehicle.periodicCheck?.expiryDate ? dayjs(vehicle.periodicCheck.expiryDate).format('YYYY-MM-DD') : '-'} 
                            color={getVehicleExpiryStatus(vehicle.periodicCheck?.expiryDate)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {vehicle.hasPasses && vehicle.passes && vehicle.passes.length > 0 ? (
                            <MuiTooltip title={vehicle.passes.map((p: any) => p.passType).join(', ')}>
                              <span><Chip label={`${vehicle.passes.length} Pass(es)`} color="info" size="small" /></span>
                            </MuiTooltip>
                          ) : (
                            <Chip label="No Passes" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={vehicle.status} color={statusColors[vehicle.status] || 'default'} size="small" />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleVehicleOpen(vehicle)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setVehicleDeleteId(vehicle._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={vehicleOpen} onClose={handleVehicleClose} maxWidth="lg" fullWidth>
              <DialogTitle>{vehicleEditing ? 'Edit Vehicle Registration' : 'Add Vehicle Registration'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleVehicleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Typography variant="h6">Vehicle Information</Typography>
                  <Box display="flex" gap={2}>
                    <TextField select label="Vehicle" name="vehicle" value={vehicleForm.vehicle} onChange={handleVehicleFormChange} required fullWidth>
                      <MenuItem value="">Select Vehicle</MenuItem>
                      {Array.isArray(assets) && assets.map(asset => (
                        <MenuItem key={asset._id} value={asset._id}>{asset.description} - {asset.plateNumber || asset.serialNumber || asset.fleetNumber}</MenuItem>
                      ))}
                    </TextField>
                    <TextField label="Plate Number" name="plateNumber" value={vehicleForm.plateNumber} onChange={handleVehicleFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Chassis Number" name="chassisNumber" value={vehicleForm.chassisNumber} onChange={handleVehicleFormChange} required fullWidth />
                    <TextField label="Engine Number" name="engineNumber" value={vehicleForm.engineNumber} onChange={handleVehicleFormChange} required fullWidth />
                  </Box>
                  
                  <Typography variant="h6">Registration Details</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Registration Number" name="registrationNumber" value={vehicleForm.registrationNumber} onChange={handleVehicleFormChange} required fullWidth />
                    <TextField label="Registration Expiry" name="registrationExpiry" value={vehicleForm.registrationExpiry} onChange={handleVehicleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  
                  <Typography variant="h6">Insurance Information</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Insurance Company" name="insuranceCompany" value={vehicleForm.insuranceCompany} onChange={handleVehicleFormChange} required fullWidth />
                    <TextField label="Policy Number" name="insurancePolicyNumber" value={vehicleForm.insurancePolicyNumber} onChange={handleVehicleFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Insurance Expiry" name="insuranceExpiry" value={vehicleForm.insuranceExpiry} onChange={handleVehicleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField label="Insurance Cost" name="insuranceCost" value={vehicleForm.insuranceCost} onChange={handleVehicleFormChange} type="number" required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField select label="Insurance Payment System" name="insurancePaymentSystem" value={vehicleForm.insurancePaymentSystem || ''} onChange={handleVehicleFormChange} required fullWidth>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="installments">Installments</MenuItem>
                    </TextField>
                    {vehicleForm.insurancePaymentSystem === 'installments' && (
                      <TextField select label="Installment Period (months)" name="insuranceInstallmentPeriod" value={vehicleForm.insuranceInstallmentPeriod || ''} onChange={handleVehicleFormChange} required fullWidth>
                        {[3, 6, 12, 15, 18, 24].map(period => (
                          <MenuItem key={period} value={period}>{period} months</MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Box>
                  
                  <Typography variant="h6">Registration Card Data</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Country Of Manufacture" name="registrationCardCountry" value={vehicleForm.registrationCardCountry || ''} onChange={handleVehicleFormChange} required fullWidth />
                    <TextField label="Brand" name="registrationCardBrand" value={vehicleForm.registrationCardBrand || ''} onChange={handleVehicleFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Capacity" name="registrationCardCapacity" value={vehicleForm.registrationCardCapacity || ''} onChange={handleVehicleFormChange} required fullWidth />
                    <TextField label="Shape" name="registrationCardShape" value={vehicleForm.registrationCardShape || ''} onChange={handleVehicleFormChange} required fullWidth />
                    <TextField label="Colour" name="registrationCardColour" value={vehicleForm.registrationCardColour || ''} onChange={handleVehicleFormChange} required fullWidth />
                  </Box>
                  
                  <Typography variant="h6">Asset Registration Type</Typography>
                  <TextField 
                    select 
                    label="Asset Registration Type" 
                    name="assetRegistrationType" 
                    value={vehicleForm.assetRegistrationType || 'public'} 
                    onChange={handleVehicleFormChange} 
                    required 
                    fullWidth
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </TextField>
                  
                  <Typography variant="h6">Periodic Check</Typography>
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
                    />
                  </Box>
                  
                  <TextField select label="Status" name="status" value={vehicleForm.status} onChange={handleVehicleFormChange} required fullWidth>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
                  
                  <TextField label="Notes" name="notes" value={vehicleForm.notes} onChange={handleVehicleFormChange} fullWidth multiline minRows={2} />
                  
                  {/* Document Uploads (stubbed) */}
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Document Uploads (stub - not saved)</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button variant="outlined" component="label">Registration Card<input type="file" name="registrationCard" hidden onChange={handleVehicleFileChange} /></Button>
                    <Button variant="outlined" component="label">Insurance Policy<input type="file" name="insurancePolicy" hidden onChange={handleVehicleFileChange} /></Button>
                    <Button variant="outlined" component="label">Customs Clearance<input type="file" name="customsClearance" hidden onChange={handleVehicleFileChange} /></Button>
                    <Button variant="outlined" component="label">Other Documents<input type="file" name="otherDocuments" hidden onChange={handleVehicleFileChange} multiple /></Button>
                  </Box>
                  {vehicleError && <Alert severity="error">{vehicleError}</Alert>}

                  {/* Passes Section */}
                  <TextField
                    select
                    label="Does the Asset Have Any Passes?"
                    name="hasPasses"
                    value={vehicleForm.hasPasses || ''}
                    onChange={handleVehicleFormChange}
                    required
                    fullWidth
                  >
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>

                  {vehicleForm.hasPasses === 'yes' && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Passes</Typography>
                      <Button variant="outlined" onClick={handleVehicleAddPass} sx={{ mb: 2 }}>Add Pass</Button>
                      {vehicleForm.passes && vehicleForm.passes.length > 0 && vehicleForm.passes.map((pass, idx) => (
                        <Box key={idx} display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
                          <TextField
                            select
                            label="Pass Type"
                            value={pass.passType || ''}
                            onChange={e => handleVehiclePassChange(idx, 'passType', e.target.value)}
                            sx={{ minWidth: 160 }}
                            required
                          >
                            <MenuItem value="">Select Type</MenuItem>
                            <MenuItem value="KOC">KOC</MenuItem>
                            <MenuItem value="KNPC">KNPC</MenuItem>
                            <MenuItem value="GO">GO</MenuItem>
                            <MenuItem value="RATQA">RATQA</MenuItem>
                            <MenuItem value="ABDALI">ABDALI</MenuItem>
                            <MenuItem value="WANEET">WANEET</MenuItem>
                          </TextField>
                          <TextField
                            label="Issuance Date"
                            type="date"
                            value={pass.issuanceDate || ''}
                            onChange={e => handleVehiclePassChange(idx, 'issuanceDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                          />
                          <TextField
                            label="Expiry Date"
                            type="date"
                            value={pass.expiryDate || ''}
                            onChange={e => handleVehiclePassChange(idx, 'expiryDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                          />
                          <TextField
                            label="Sponsor"
                            value={pass.sponsor || ''}
                            onChange={e => handleVehiclePassChange(idx, 'sponsor', e.target.value)}
                            required
                          />
                          <Button color="error" variant="outlined" onClick={() => handleVehicleRemovePass(idx)}>Remove</Button>
                        </Box>
                      ))}
                      {vehicleForm.passes && vehicleForm.passes.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No passes added yet.</Typography>
                      )}
                    </Box>
                  )}
                  {vehicleForm.insurancePaymentSystem === 'installments' && (
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField
                        select
                        label="Installment Calculation Mode"
                        name="installmentCalculationMode"
                        value={vehicleForm.installmentCalculationMode || 'auto'}
                        onChange={handleVehicleFormChange}
                        required
                        sx={{ minWidth: 220 }}
                      >
                        <MenuItem value="auto">Calculate Automatically</MenuItem>
                        <MenuItem value="manual">Manual Entry</MenuItem>
                      </TextField>
                      <TextField
                        label="Value of Installment"
                        name="installmentValue"
                        value={vehicleForm.installmentValue || ''}
                        onChange={handleVehicleFormChange}
                        type="number"
                        required
                        sx={{ minWidth: 180 }}
                        InputProps={{
                          readOnly: vehicleForm.installmentCalculationMode === 'auto',
                        }}
                        helperText={vehicleForm.installmentCalculationMode === 'auto' ? 'Calculated as Insurance Cost / Period' : 'Enter value manually'}
                      />
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleVehicleClose}>Cancel</Button>
                <Button onClick={handleVehicleSubmit} variant="contained" color="primary">{vehicleEditing ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!vehicleDeleteId} onClose={() => setVehicleDeleteId(null)}>
              <DialogTitle>Delete Vehicle Registration</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this vehicle registration?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setVehicleDeleteId(null)}>Cancel</Button>
                <Button onClick={handleVehicleDelete} color="error" variant="contained">Delete</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!vehicleSuccess}
              autoHideDuration={3000}
              onClose={() => setVehicleSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{vehicleSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </Box>
        )}
        {tab === 3 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Government Correspondence Log</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleCorrespondenceOpen()}>
                Add Correspondence
              </Button>
            </Box>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : correspondenceError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{correspondenceError}</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference Number</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Ministry</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Submission Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(correspondences) && correspondences.map((corr) => (
                      <TableRow key={corr._id}>
                        <TableCell>{corr.referenceNumber}</TableCell>
                        <TableCell>{corr.subject}</TableCell>
                        <TableCell>{corr.ministry}</TableCell>
                        <TableCell>{corr.department}</TableCell>
                        <TableCell>{corr.submissionDate ? dayjs(corr.submissionDate).format('YYYY-MM-DD') : '-'}</TableCell>
                        <TableCell>
                          <Chip label={corr.status} color={getCorrespondenceStatusColor(corr.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={corr.priority} color={getCorrespondencePriorityColor(corr.priority)} size="small" />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleCorrespondenceOpen(corr)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setCorrespondenceDeleteId(corr._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={correspondenceOpen} onClose={handleCorrespondenceClose} maxWidth="lg" fullWidth>
              <DialogTitle>{correspondenceEditing ? 'Edit Correspondence' : 'Add Correspondence'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleCorrespondenceSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Box display="flex" gap={2}>
                    <TextField label="Reference Number" name="referenceNumber" value={correspondenceForm.referenceNumber} onChange={handleCorrespondenceFormChange} required fullWidth />
                    <TextField label="Subject" name="subject" value={correspondenceForm.subject} onChange={handleCorrespondenceFormChange} required fullWidth />
                  </Box>
                  <TextField label="Description" name="description" value={correspondenceForm.description} onChange={handleCorrespondenceFormChange} fullWidth multiline minRows={2} />
                  <Box display="flex" gap={2}>
                    <TextField label="Ministry" name="ministry" value={correspondenceForm.ministry} onChange={handleCorrespondenceFormChange} required fullWidth />
                    <TextField label="Department" name="department" value={correspondenceForm.department} onChange={handleCorrespondenceFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Contact Person" name="contactPerson" value={correspondenceForm.contactPerson} onChange={handleCorrespondenceFormChange} required fullWidth />
                    <TextField label="Contact Phone" name="contactPhone" value={correspondenceForm.contactPhone} onChange={handleCorrespondenceFormChange} required fullWidth />
                    <TextField label="Contact Email" name="contactEmail" value={correspondenceForm.contactEmail} onChange={handleCorrespondenceFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Submission Date" name="submissionDate" value={correspondenceForm.submissionDate} onChange={handleCorrespondenceFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField select label="Submission Method" name="submissionMethod" value={correspondenceForm.submissionMethod} onChange={handleCorrespondenceFormChange} required fullWidth>
                      <MenuItem value="in_person">In Person</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="fax">Fax</MenuItem>
                      <MenuItem value="post">Post</MenuItem>
                    </TextField>
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField select label="Request Type" name="requestType" value={correspondenceForm.requestType} onChange={handleCorrespondenceFormChange} required fullWidth>
                      <MenuItem value="application">Application</MenuItem>
                      <MenuItem value="query">Query</MenuItem>
                      <MenuItem value="complaint">Complaint</MenuItem>
                      <MenuItem value="information_request">Information Request</MenuItem>
                    </TextField>
                    <TextField select label="Status" name="status" value={correspondenceForm.status} onChange={handleCorrespondenceFormChange} required fullWidth>
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="under_review">Under Review</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="pending_documents">Pending Documents</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </TextField>
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Expected Response Date" name="expectedResponseDate" value={correspondenceForm.expectedResponseDate} onChange={handleCorrespondenceFormChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField label="Actual Response Date" name="actualResponseDate" value={correspondenceForm.actualResponseDate} onChange={handleCorrespondenceFormChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <FormControlLabel
                      control={<Checkbox checked={correspondenceForm.responseReceived} onChange={e => setCorrespondenceForm({ ...correspondenceForm, responseReceived: e.target.checked })} name="responseReceived" />}
                      label="Response Received"
                    />
                    <TextField label="Response Details" name="responseDetails" value={correspondenceForm.responseDetails} onChange={handleCorrespondenceFormChange} fullWidth multiline minRows={2} />
                  </Box>
                  <Box display="flex" gap={2}>
                    <FormControlLabel
                      control={<Checkbox checked={correspondenceForm.followUpRequired} onChange={e => setCorrespondenceForm({ ...correspondenceForm, followUpRequired: e.target.checked })} name="followUpRequired" />}
                      label="Follow Up Required"
                    />
                    <TextField label="Follow Up Date" name="followUpDate" value={correspondenceForm.followUpDate} onChange={handleCorrespondenceFormChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField label="Follow Up Notes" name="followUpNotes" value={correspondenceForm.followUpNotes} onChange={handleCorrespondenceFormChange} fullWidth multiline minRows={2} />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField select label="Priority" name="priority" value={correspondenceForm.priority} onChange={handleCorrespondenceFormChange} required fullWidth>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </TextField>
                    <TextField label="Assigned To" name="assignedTo" value={correspondenceForm.assignedTo} onChange={handleCorrespondenceFormChange} required fullWidth />
                  </Box>
                  <TextField label="Notes" name="notes" value={correspondenceForm.notes} onChange={handleCorrespondenceFormChange} fullWidth multiline minRows={2} />
                  
                  {/* Document Uploads (stubbed) */}
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Document Uploads (stub - not saved)</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button variant="outlined" component="label">Original Document<input type="file" name="originalDocument" hidden onChange={handleCorrespondenceFileChange} /></Button>
                    <Button variant="outlined" component="label">Response Document<input type="file" name="responseDocument" hidden onChange={handleCorrespondenceFileChange} /></Button>
                    <Button variant="outlined" component="label">Supporting Documents<input type="file" name="supportingDocuments" hidden onChange={handleCorrespondenceFileChange} multiple /></Button>
                  </Box>
                  {correspondenceError && <Alert severity="error">{correspondenceError}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCorrespondenceClose}>Cancel</Button>
                <Button onClick={handleCorrespondenceSubmit} variant="contained" color="primary">{correspondenceEditing ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!correspondenceDeleteId} onClose={() => setCorrespondenceDeleteId(null)}>
              <DialogTitle>Delete Correspondence</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this correspondence?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCorrespondenceDeleteId(null)}>Cancel</Button>
                <Button onClick={handleCorrespondenceDelete} color="error" variant="contained">Delete</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!correspondenceSuccess}
              autoHideDuration={3000}
              onClose={() => setCorrespondenceSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{correspondenceSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </Box>
        )}
        {tab === 4 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Legal Case Management</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleLegalCaseOpen()}>
                Add Legal Case
              </Button>
            </Box>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : legalCaseError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{legalCaseError}</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Case Number</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Case Type</TableCell>
                      <TableCell>Court</TableCell>
                      <TableCell>Filing Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Estimated Cost</TableCell>
                      <TableCell>Actual Cost</TableCell>
                      <TableCell>Legal Representative</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(legalCases) && legalCases.map((case_) => (
                      <TableRow key={case_._id}>
                        <TableCell>{case_.caseNumber}</TableCell>
                        <TableCell>{case_.title}</TableCell>
                        <TableCell>{case_.caseType}</TableCell>
                        <TableCell>{case_.court}</TableCell>
                        <TableCell>{case_.filingDate ? dayjs(case_.filingDate).format('YYYY-MM-DD') : '-'}</TableCell>
                        <TableCell>
                          <Chip label={case_.status} color={getLegalCaseStatusColor(case_.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={case_.priority} color={getLegalCasePriorityColor(case_.priority)} size="small" />
                        </TableCell>
                        <TableCell>{case_.estimatedCost?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                        <TableCell>{case_.actualCost?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                        <TableCell>{case_.legalRepresentative?.name || '-'}</TableCell>
                        <TableCell>{case_.serial || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleLegalCaseOpen(case_)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setLegalCaseDeleteId(case_._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={legalCaseOpen} onClose={handleLegalCaseClose} maxWidth="lg" fullWidth>
              <DialogTitle>{legalCaseEditing ? 'Edit Legal Case' : 'Add Legal Case'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleLegalCaseSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Typography variant="h6">Case Information</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Case Number" name="caseNumber" value={legalCaseForm.caseNumber} onChange={handleLegalCaseFormChange} required fullWidth />
                    <TextField label="Title" name="title" value={legalCaseForm.title} onChange={handleLegalCaseFormChange} required fullWidth />
                  </Box>
                  <TextField label="Description" name="description" value={legalCaseForm.description} onChange={handleLegalCaseFormChange} fullWidth multiline minRows={2} />
                  <Box display="flex" gap={2}>
                    <TextField select label="Case Type" name="caseType" value={legalCaseForm.caseType} onChange={handleLegalCaseFormChange} required fullWidth>
                      <MenuItem value="">Select Case Type</MenuItem>
                      <MenuItem value="labour_dispute">Labour Dispute</MenuItem>
                      <MenuItem value="traffic_fine">Traffic Fine</MenuItem>
                      <MenuItem value="contract_dispute">Contract Dispute</MenuItem>
                      <MenuItem value="regulatory_violation">Regulatory Violation</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                    <TextField label="Court" name="court" value={legalCaseForm.court} onChange={handleLegalCaseFormChange} required fullWidth />
                    <TextField label="Court Location" name="courtLocation" value={legalCaseForm.courtLocation} onChange={handleLegalCaseFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Filing Date" name="filingDate" value={legalCaseForm.filingDate} onChange={handleLegalCaseFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField select label="Status" name="status" value={legalCaseForm.status} onChange={handleLegalCaseFormChange} required fullWidth>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="appealed">Appealed</MenuItem>
                    </TextField>
                    <TextField select label="Priority" name="priority" value={legalCaseForm.priority} onChange={handleLegalCaseFormChange} required fullWidth>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </TextField>
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Estimated Cost" name="estimatedCost" value={legalCaseForm.estimatedCost} onChange={handleLegalCaseFormChange} type="number" required fullWidth />
                    <TextField label="Actual Cost" name="actualCost" value={legalCaseForm.actualCost} onChange={handleLegalCaseFormChange} type="number" fullWidth />
                  </Box>
                  
                  <Typography variant="h6">Legal Representative</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Name" name="legalRepresentative.name" value={legalCaseForm.legalRepresentative.name} onChange={handleLegalCaseFormChange} required fullWidth />
                    <TextField label="Firm" name="legalRepresentative.firm" value={legalCaseForm.legalRepresentative.firm} onChange={handleLegalCaseFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Phone" name="legalRepresentative.phone" value={legalCaseForm.legalRepresentative.phone} onChange={handleLegalCaseFormChange} required fullWidth />
                    <TextField label="Email" name="legalRepresentative.email" value={legalCaseForm.legalRepresentative.email} onChange={handleLegalCaseFormChange} required fullWidth />
                  </Box>
                  <TextField label="Contract Amount" name="legalRepresentative.contractAmount" value={legalCaseForm.legalRepresentative.contractAmount} onChange={handleLegalCaseFormChange} type="number" required fullWidth />
                  
                  <Typography variant="h6">Parties</Typography>
                  {legalCaseForm.parties.map((party: any, index: number) => (
                    <Box key={index} display="flex" gap={2} alignItems="center">
                      <TextField label="Name" value={party.name} onChange={(e) => {
                        const newParties = [...legalCaseForm.parties];
                        newParties[index].name = e.target.value;
                        setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                      }} required fullWidth />
                      <TextField select label="Type" value={party.type} onChange={(e) => {
                        const newParties = [...legalCaseForm.parties];
                        newParties[index].type = e.target.value;
                        setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                      }} required fullWidth>
                        <MenuItem value="plaintiff">Plaintiff</MenuItem>
                        <MenuItem value="defendant">Defendant</MenuItem>
                        <MenuItem value="third_party">Third Party</MenuItem>
                      </TextField>
                      <TextField label="Contact Info" value={party.contactInfo} onChange={(e) => {
                        const newParties = [...legalCaseForm.parties];
                        newParties[index].contactInfo = e.target.value;
                        setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                      }} fullWidth />
                      <IconButton color="error" onClick={() => {
                        const newParties = legalCaseForm.parties.filter((_: any, i: number) => i !== index);
                        setLegalCaseForm({ ...legalCaseForm, parties: newParties });
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={() => {
                    setLegalCaseForm({
                      ...legalCaseForm,
                      parties: [...legalCaseForm.parties, { name: '', type: 'plaintiff', contactInfo: '' }]
                    });
                  }}>Add Party</Button>
                  
                  <TextField label="Notes" name="notes" value={legalCaseForm.notes} onChange={handleLegalCaseFormChange} fullWidth multiline minRows={2} />
                  {legalCaseError && <Alert severity="error">{legalCaseError}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleLegalCaseClose}>Cancel</Button>
                <Button onClick={handleLegalCaseSubmit} variant="contained" color="primary">{legalCaseEditing ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!legalCaseDeleteId} onClose={() => setLegalCaseDeleteId(null)}>
              <DialogTitle>Delete Legal Case</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this legal case?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setLegalCaseDeleteId(null)}>Cancel</Button>
                <Button onClick={handleLegalCaseDelete} color="error" variant="contained">Delete</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!legalCaseSuccess}
              autoHideDuration={3000}
              onClose={() => setLegalCaseSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{legalCaseSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </Box>
        )}
        {tab === 5 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Company Facility Documents</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleFacilityOpen()}>
                Add Facility
              </Button>
            </Box>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              ) : facilityError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{facilityError}</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Facility Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Area (sqm)</TableCell>
                      <TableCell>Rent Status</TableCell>
                      <TableCell>Municipality Status</TableCell>
                      <TableCell>Fire Dept Status</TableCell>
                      <TableCell>MOC Status</TableCell>
                      <TableCell>Overall Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(facilities) && facilities.map((facility) => (
                      <TableRow key={facility._id}>
                        <TableCell>{facility.facilityName}</TableCell>
                        <TableCell>{facility.facilityType}</TableCell>
                        <TableCell>{facility.address}</TableCell>
                        <TableCell>{facility.area}</TableCell>
                        <TableCell>
                          <Chip label={facility.rentAgreement?.status || 'N/A'} color={getApprovalStatusColor(facility.rentAgreement?.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={facility.municipalityApproval?.status || 'N/A'} color={getApprovalStatusColor(facility.municipalityApproval?.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={facility.fireDepartmentApproval?.status || 'N/A'} color={getApprovalStatusColor(facility.fireDepartmentApproval?.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={facility.mocApproval?.status || 'N/A'} color={getApprovalStatusColor(facility.mocApproval?.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={facility.status} color={getFacilityStatusColor(facility.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleFacilityOpen(facility)}><EditIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setFacilityDeleteId(facility._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={facilityOpen} onClose={handleFacilityClose} maxWidth="lg" fullWidth>
              <DialogTitle>{facilityEditing ? 'Edit Facility' : 'Add Facility'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleFacilitySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Typography variant="h6">Basic Information</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Facility Name" name="facilityName" value={facilityForm.facilityName} onChange={handleFacilityFormChange} required fullWidth />
                    <TextField select label="Facility Type" name="facilityType" value={facilityForm.facilityType} onChange={handleFacilityFormChange} required fullWidth>
                      <MenuItem value="office">Office</MenuItem>
                      <MenuItem value="warehouse">Warehouse</MenuItem>
                      <MenuItem value="workshop">Workshop</MenuItem>
                      <MenuItem value="showroom">Showroom</MenuItem>
                      <MenuItem value="residential">Residential</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  </Box>
                  <TextField label="Address" name="address" value={facilityForm.address} onChange={handleFacilityFormChange} required fullWidth multiline minRows={2} />
                  <Box display="flex" gap={2}>
                    <TextField label="Area (sqm)" name="area" value={facilityForm.area} onChange={handleFacilityFormChange} type="number" required fullWidth />
                    <TextField select label="Status" name="status" value={facilityForm.status} onChange={handleFacilityFormChange} required fullWidth>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="under_renovation">Under Renovation</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </TextField>
                  </Box>

                  <Typography variant="h6">Rent Agreement</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Agreement Number" name="rentAgreement.agreementNumber" value={facilityForm.rentAgreement.agreementNumber} onChange={handleFacilityFormChange} required fullWidth />
                    <TextField label="Landlord Name" name="rentAgreement.landlordName" value={facilityForm.rentAgreement.landlordName} onChange={handleFacilityFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Landlord Contact" name="rentAgreement.landlordContact" value={facilityForm.rentAgreement.landlordContact} onChange={handleFacilityFormChange} required fullWidth />
                    <TextField label="Monthly Rent" name="rentAgreement.monthlyRent" value={facilityForm.rentAgreement.monthlyRent} onChange={handleFacilityFormChange} type="number" required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Start Date" name="rentAgreement.startDate" value={facilityForm.rentAgreement.startDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField label="End Date" name="rentAgreement.endDate" value={facilityForm.rentAgreement.endDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Security Deposit" name="rentAgreement.securityDeposit" value={facilityForm.rentAgreement.securityDeposit} onChange={handleFacilityFormChange} type="number" required fullWidth />
                    <TextField select label="Status" name="rentAgreement.status" value={facilityForm.rentAgreement.status} onChange={handleFacilityFormChange} required fullWidth>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                      <MenuItem value="pending_renewal">Pending Renewal</MenuItem>
                      <MenuItem value="terminated">Terminated</MenuItem>
                    </TextField>
                  </Box>
                  <TextField label="Renewal Terms" name="rentAgreement.renewalTerms" value={facilityForm.rentAgreement.renewalTerms} onChange={handleFacilityFormChange} fullWidth multiline minRows={2} />

                  <Typography variant="h6">Municipality Approval</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Approval Number" name="municipalityApproval.approvalNumber" value={facilityForm.municipalityApproval.approvalNumber} onChange={handleFacilityFormChange} required fullWidth />
                    <TextField label="Approval Type" name="municipalityApproval.approvalType" value={facilityForm.municipalityApproval.approvalType} onChange={handleFacilityFormChange} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Approval Date" name="municipalityApproval.approvalDate" value={facilityForm.municipalityApproval.approvalDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField label="Expiry Date" name="municipalityApproval.expiryDate" value={facilityForm.municipalityApproval.expiryDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField select label="Status" name="municipalityApproval.status" value={facilityForm.municipalityApproval.status} onChange={handleFacilityFormChange} required fullWidth>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                      <MenuItem value="pending_renewal">Pending Renewal</MenuItem>
                    </TextField>
                    <TextField label="Renewal Process" name="municipalityApproval.renewalProcess" value={facilityForm.municipalityApproval.renewalProcess} onChange={handleFacilityFormChange} fullWidth />
                  </Box>

                  <Typography variant="h6">Fire Department Approval</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Approval Number" name="fireDepartmentApproval.approvalNumber" value={facilityForm.fireDepartmentApproval.approvalNumber} onChange={handleFacilityFormChange} required fullWidth />
                    <TextField label="Inspection Date" name="fireDepartmentApproval.inspectionDate" value={facilityForm.fireDepartmentApproval.inspectionDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Approval Date" name="fireDepartmentApproval.approvalDate" value={facilityForm.fireDepartmentApproval.approvalDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                    <TextField label="Expiry Date" name="fireDepartmentApproval.expiryDate" value={facilityForm.fireDepartmentApproval.expiryDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField select label="Status" name="fireDepartmentApproval.status" value={facilityForm.fireDepartmentApproval.status} onChange={handleFacilityFormChange} required fullWidth>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                      <MenuItem value="pending_renewal">Pending Renewal</MenuItem>
                    </TextField>
                    <TextField label="Findings" name="fireDepartmentApproval.findings" value={facilityForm.fireDepartmentApproval.findings} onChange={handleFacilityFormChange} fullWidth />
                  </Box>
                  <TextField label="Corrective Actions" name="fireDepartmentApproval.correctiveActions" value={facilityForm.fireDepartmentApproval.correctiveActions.join('\n')} onChange={(e) => setFacilityForm({...facilityForm, fireDepartmentApproval: {...facilityForm.fireDepartmentApproval, correctiveActions: e.target.value.split('\n').filter(action => action.trim() !== '')}})} fullWidth multiline minRows={3} />

                  <Typography variant="h6">MOC Approval</Typography>
                  <Box display="flex" gap={2}>
                    <TextField label="Approval Number" name="mocApproval.approvalNumber" value={facilityForm.mocApproval.approvalNumber} onChange={handleFacilityFormChange} fullWidth />
                    <TextField label="Approval Type" name="mocApproval.approvalType" value={facilityForm.mocApproval.approvalType} onChange={handleFacilityFormChange} fullWidth />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField label="Approval Date" name="mocApproval.approvalDate" value={facilityForm.mocApproval.approvalDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField label="Expiry Date" name="mocApproval.expiryDate" value={facilityForm.mocApproval.expiryDate} onChange={handleFacilityFormChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                  </Box>
                  <TextField select label="Status" name="mocApproval.status" value={facilityForm.mocApproval.status} onChange={handleFacilityFormChange} fullWidth>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="pending_renewal">Pending Renewal</MenuItem>
                  </TextField>

                  <Typography variant="h6">Other Approvals</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Other Approvals</Typography>
                    <Button startIcon={<AddIcon />} onClick={() => setShowOtherApprovalForm(true)} variant="outlined" size="small">
                      Add Approval
                    </Button>
                  </Box>
                  {facilityForm.otherApprovals.map((approval: any, index: number) => (
                    <Box key={index} display="flex" gap={2} alignItems="center" sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                      <Typography sx={{ flex: 1 }}>{approval.authority} - {approval.approvalNumber}</Typography>
                      <Chip label={approval.status} color={getApprovalStatusColor(approval.status)} size="small" />
                      <IconButton size="small" color="error" onClick={() => handleRemoveOtherApproval(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  {showOtherApprovalForm && (
                    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>Add Other Approval</Typography>
                      <Box display="flex" gap={2}>
                        <TextField label="Authority" value={newOtherApproval.authority} onChange={(e) => setNewOtherApproval({...newOtherApproval, authority: e.target.value})} fullWidth />
                        <TextField label="Approval Number" value={newOtherApproval.approvalNumber} onChange={(e) => setNewOtherApproval({...newOtherApproval, approvalNumber: e.target.value})} fullWidth />
                      </Box>
                      <Box display="flex" gap={2}>
                        <TextField label="Approval Date" value={newOtherApproval.approvalDate} onChange={(e) => setNewOtherApproval({...newOtherApproval, approvalDate: e.target.value})} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                        <TextField label="Expiry Date" value={newOtherApproval.expiryDate} onChange={(e) => setNewOtherApproval({...newOtherApproval, expiryDate: e.target.value})} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                      </Box>
                      <Box display="flex" gap={2}>
                        <TextField select label="Status" value={newOtherApproval.status} onChange={(e) => setNewOtherApproval({...newOtherApproval, status: e.target.value})} fullWidth>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="expired">Expired</MenuItem>
                          <MenuItem value="pending_renewal">Pending Renewal</MenuItem>
                        </TextField>
                        <TextField label="Notes" value={newOtherApproval.notes} onChange={(e) => setNewOtherApproval({...newOtherApproval, notes: e.target.value})} fullWidth />
                      </Box>
                      <Box display="flex" gap={1} sx={{ mt: 1 }}>
                        <Button size="small" onClick={handleAddOtherApproval} variant="contained">
                          Add
                        </Button>
                        <Button size="small" onClick={() => setShowOtherApprovalForm(false)}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}

                  <TextField label="Notes" name="notes" value={facilityForm.notes} onChange={handleFacilityFormChange} fullWidth multiline minRows={2} />
                  {error && <Alert severity="error">{error}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleFacilityClose}>Cancel</Button>
                <Button onClick={handleFacilitySubmit} variant="contained" color="primary">{facilityEditing ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!facilityDeleteId} onClose={() => setFacilityDeleteId(null)}>
              <DialogTitle>Delete Facility</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this facility?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFacilityDeleteId(null)}>Cancel</Button>
                <Button onClick={handleFacilityDelete} color="error" variant="contained">Delete</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!facilitySuccess}
              autoHideDuration={3000}
              onClose={() => setFacilitySuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{facilitySuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </Box>
        )}
        {tab === 6 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5">Dashboard & Reports</Typography>
              <Box display="flex" gap={1}>
                <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleExportDashboardCSV}>Export Report</Button>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrintDashboard}>Print Report</Button>
              </Box>
            </Box>
            
            {/* Summary Cards */}
            <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
              <Card sx={{ flex: '1 1 200px', minWidth: 200, background: '#1976d2', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2">Total Employees</Typography>
                  <Typography variant="h4">{employees.length}</Typography>
                  <Typography variant="caption">Active Residencies</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: '1 1 200px', minWidth: 200, background: '#388e3c', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2">Active Documents</Typography>
                  <Typography variant="h4">{govDocs.filter(d => d.status === 'active').length}</Typography>
                  <Typography variant="caption">Government Documents</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: '1 1 200px', minWidth: 200, background: '#fbc02d', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2">Active Vehicles</Typography>
                  <Typography variant="h4">{vehicles.filter(v => v.status === 'active').length}</Typography>
                  <Typography variant="caption">Registered Vehicles</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: '1 1 200px', minWidth: 200, background: '#d32f2f', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2">Open Cases</Typography>
                  <Typography variant="h4">{legalCases.filter(c => c.status === 'open').length}</Typography>
                  <Typography variant="caption">Legal Cases</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: '1 1 200px', minWidth: 200, background: '#6d4c41', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2">Active Facilities</Typography>
                  <Typography variant="h4">{facilities.filter(f => f.status === 'active').length}</Typography>
                  <Typography variant="caption">Company Facilities</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: '1 1 200px', minWidth: 200, background: '#0288d1', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2">Pending Items</Typography>
                  <Typography variant="h4">
                    {records.filter(r => r.status === 'pending_renewal').length + 
                     govDocs.filter(d => d.status === 'pending_renewal').length + 
                     vehicles.filter(v => v.status === 'expired').length}
                  </Typography>
                  <Typography variant="caption">Requires Attention</Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Charts Section */}
            <Box display="flex" gap={3} mb={3} flexWrap="wrap">
              {/* Residency Status Chart */}
              <Paper sx={{ p: 2, height: 300, flex: '1 1 400px', minWidth: 400 }}>
                <Typography variant="h6" gutterBottom>Employee Residency Status</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={residencyStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {residencyStatusData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>

              {/* Document Expiry Chart */}
              <Paper sx={{ p: 2, height: 300, flex: '1 1 400px', minWidth: 400 }}>
                <Typography variant="h6" gutterBottom>Document Expiry Timeline</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={documentExpiryData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="expiring" fill="#d32f2f" name="Expiring" />
                    <Bar dataKey="expired" fill="#6d4c41" name="Expired" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Box>

            {/* Legal Cases Overview */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Legal Cases Overview</Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle2" color="primary">Case Status Distribution</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={legalCaseStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                        {legalCaseStatusData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle2" color="primary">Case Priority Distribution</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={legalCasePriorityData}>
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Paper>

            {/* Expiry Alerts */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Expiry Alerts (Next 30 Days)</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Days Remaining</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiryAlerts.map((alert, idx) => (
                    <TableRow key={idx} sx={{ background: alert.daysRemaining <= 7 ? '#ffebee' : alert.daysRemaining <= 15 ? '#fff3e0' : '#f1f8e9' }}>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell>{alert.item}</TableCell>
                      <TableCell>{alert.expiryDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${alert.daysRemaining} days`} 
                          color={alert.daysRemaining <= 7 ? 'error' : alert.daysRemaining <= 15 ? 'warning' : 'success'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={alert.daysRemaining <= 7 ? 'Urgent' : alert.daysRemaining <= 15 ? 'Warning' : 'Normal'} 
                          color={alert.daysRemaining <= 7 ? 'error' : alert.daysRemaining <= 15 ? 'warning' : 'success'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* Recent Activities */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Recent Activities</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((activity, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        <Chip label={activity.type} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={activity.status} 
                          color={activity.status === 'completed' ? 'success' : activity.status === 'pending' ? 'warning' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
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
    </Box>
  );
};

export default AdminPage; 