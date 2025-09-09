import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Avatar, Chip, 
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, IconButton, Tooltip, Fab, Badge, LinearProgress,
  TextField, MenuItem, FormControl, InputLabel, Select, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Switch, FormControlLabel, InputAdornment, Skeleton,
  Container, Stack, useTheme, alpha, Zoom, Slide, Fade, Grow
} from '@mui/material';
import {
  AccessTime as TimeIcon, Person as PersonIcon, Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Warning as WarningIcon,
  Schedule as ScheduleIcon, EventNote as EventNoteIcon, CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon, Analytics as AnalyticsIcon,
  Login as LoginIcon, Logout as LogoutIcon, Pause as PauseIcon,
  PlayArrow as PlayIcon, Stop as StopIcon, Timer as TimerIcon,
  LocationOn as LocationIcon, Fingerprint as FingerprintIcon,
  QrCode as QrCodeIcon, Face as FaceIcon, CameraAlt as CameraIcon,
  Wifi as WifiIcon, BluetoothConnected as BluetoothIcon,
  Security as SecurityIcon, Shield as ShieldIcon, Verified as VerifiedIcon,
  Speed as SpeedIcon, Timeline as TimelineIcon, Assessment as AssessmentIcon,
  Group as GroupIcon, Business as BusinessIcon, Work as WorkIcon,
  Home as HomeIcon, Flight as FlightIcon, Hotel as HotelIcon,
  Restaurant as RestaurantIcon, DirectionsCar as CarIcon,
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
  Refresh as RefreshIcon, Download as DownloadIcon, Upload as UploadIcon,
  FilterList as FilterIcon, Search as SearchIcon, Close as CloseIcon,
  MoreVert as MoreVertIcon, Settings as SettingsIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  Star as StarIcon, EmojiEvents as TrophyIcon, LocalFireDepartment as FireIcon,
  AutoAwesome as MagicIcon, Psychology as BrainIcon, Rocket as RocketIcon,
  FlashOn as LightningIcon, Pets as PetIcon, Celebration as PartyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../apiBase';

// Enhanced interfaces for futuristic attendance system
interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    position: string;
    department: string;
    employeeId: string;
    avatar?: string;
    site?: string;
  };
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  breakDuration: number;
  status: 'present' | 'absent' | 'late' | 'on-leave' | 'half-day' | 'remote' | 'travel';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  device?: {
    type: 'mobile' | 'web' | 'biometric' | 'rfid' | 'facial';
    deviceId: string;
    ipAddress: string;
  };
  biometricData?: {
    fingerprintId?: string;
    faceId?: string;
    confidence: number;
  };
  notes?: string;
  approvedBy?: string;
  isManualEntry: boolean;
  temperature?: number;
  healthCheck: boolean;
  workMode: 'office' | 'remote' | 'hybrid' | 'field' | 'travel';
  projectCode?: string;
  taskCategories?: string[];
  productivity: {
    score: number;
    keystrokes?: number;
    mouseClicks?: number;
    screenshotCount?: number;
    activeMinutes: number;
  };
  mood?: 'excellent' | 'good' | 'neutral' | 'tired' | 'stressed';
  energyLevel: number; // 1-10
  achievements?: string[];
  violations?: string[];
  createdAt: string;
  updatedAt: string;
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  remoteToday: number;
  averageCheckInTime: string;
  averageCheckOutTime: string;
  averageWorkHours: number;
  totalOvertimeHours: number;
  attendanceRate: number;
  punctualityRate: number;
  productivityScore: number;
  healthComplianceRate: number;
  biometricSuccessRate: number;
  topPerformers: Array<{
    employeeId: string;
    name: string;
    score: number;
    avatar?: string;
  }>;
  departmentStats: Array<{
    department: string;
    present: number;
    total: number;
    rate: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    checkIns: number;
    checkOuts: number;
  }>;
}

interface LiveAttendanceUpdate {
  type: 'check-in' | 'check-out' | 'break-start' | 'break-end';
  employee: {
    name: string;
    avatar?: string;
    department: string;
  };
  timestamp: string;
  location?: string;
}

// API Response interfaces
interface AttendanceRecordsResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

interface LiveUpdatesResponse {
  updates: LiveAttendanceUpdate[];
  timestamp: string;
}

const AttendancePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'records' | 'analytics' | 'live'>('dashboard');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [liveUpdates, setLiveUpdates] = useState<LiveAttendanceUpdate[]>([]);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [healthCheckEnabled, setHealthCheckEnabled] = useState(true);
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  // Quick action dialog states
  const [quickActionDialog, setQuickActionDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  // Futuristic animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  // Fetch data
  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceStats();
    
    if (realTimeMode) {
      const interval = setInterval(() => {
        fetchLiveUpdates();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedDate, realTimeMode]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get<AttendanceRecordsResponse>(`/attendance/records?date=${selectedDate}`);
      setAttendanceRecords(response.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await api.get<AttendanceStats>(`/attendance/stats?date=${selectedDate}`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch attendance stats:', err);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      const response = await api.get<LiveUpdatesResponse>('/attendance/live-updates');
      setLiveUpdates(response.data.updates || []);
    } catch (err: any) {
      console.error('Failed to fetch live updates:', err);
    }
  };

  // Quick actions
  const handleQuickCheckIn = async (employeeId: string) => {
    try {
      await api.post(`/attendance/quick-check-in`, { employeeId });
      setSuccess('Quick check-in successful!');
      fetchAttendanceData();
      fetchAttendanceStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick check-in failed');
    }
  };

  const handleBiometricScan = async (type: 'fingerprint' | 'face') => {
    try {
      // Simulate biometric scanning
      setSuccess(`${type} scan initiated...`);
      // In real implementation, this would interface with biometric hardware
    } catch (err: any) {
      setError('Biometric scan failed');
    }
  };

  // Filter and search logic
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesDepartment = !filterDepartment || record.employee.department === filterDepartment;
      const matchesStatus = !filterStatus || record.status === filterStatus;
      const matchesSearch = !searchTerm || 
        record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDepartment && matchesStatus && matchesSearch;
    });
  }, [attendanceRecords, filterDepartment, filterStatus, searchTerm]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(attendanceRecords.map(r => r.employee.department)));
  }, [attendanceRecords]);

  // Utility functions
  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return theme.palette.success.main;
      case 'absent': return theme.palette.error.main;
      case 'late': return theme.palette.warning.main;
      case 'on-leave': return theme.palette.info.main;
      case 'remote': return theme.palette.secondary.main;
      case 'travel': return theme.palette.primary.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon />;
      case 'absent': return <CancelIcon />;
      case 'late': return <WarningIcon />;
      case 'on-leave': return <FlightIcon />;
      case 'remote': return <HomeIcon />;
      case 'travel': return <CarIcon />;
      default: return <PersonIcon />;
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'excellent': return '🚀';
      case 'good': return '😊';
      case 'neutral': return '😐';
      case 'tired': return '😴';
      case 'stressed': return '😰';
      default: return '🤖';
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ p: 3, minHeight: '100vh' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Futuristic Header */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.main} 100%)`,
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                zIndex: 0
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <RocketIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 800, 
                      mb: 1,
                      background: 'linear-gradient(45deg, #fff, #e3f2fd)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      Attendance System
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                      Next-Generation Workforce Intelligence Platform
                    </Typography>
                  </Box>
                </Box>
                
              </Box>

              {/* Real-time status indicators */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<LightningIcon />}
                  label="Live Tracking Active"
                  sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.8)', 
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>

            {/* Animated background elements */}
            <motion.div
              animate={{ 
                x: [0, 100, 0],
                y: [0, -50, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                zIndex: 0
              }}
            />
          </Paper>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 64,
                  '&.Mui-selected': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    borderRadius: 2,
                    margin: 1
                  }
                }
              }}
            >
              <Tab icon={<TimelineIcon />} label="Live Tracking" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="live-tracking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Live Tracking Content */}
              
              {/* Stats Cards at the top */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                {[
                  {
                    title: 'Present Today',
                    value: stats?.presentToday || 0,
                    total: stats?.totalEmployees || 0,
                    icon: <CheckCircleIcon />,
                    color: theme.palette.success.main,
                    gradient: 'linear-gradient(135deg, #4caf50, #81c784)'
                  },
                  {
                    title: 'Remote Workers',
                    value: stats?.remoteToday || 0,
                    total: stats?.totalEmployees || 0,
                    icon: <HomeIcon />,
                    color: theme.palette.info.main,
                    gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)'
                  },
                  {
                    title: 'Late Arrivals',
                    value: stats?.lateToday || 0,
                    total: stats?.totalEmployees || 0,
                    icon: <WarningIcon />,
                    color: theme.palette.warning.main,
                    gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)'
                  },
                  {
                    title: 'On Leave',
                    value: stats?.onLeaveToday || 0,
                    total: stats?.totalEmployees || 0,
                    icon: <FlightIcon />,
                    color: theme.palette.secondary.main,
                    gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)'
                  }
                ].map((stat, index) => (
                  <Box key={index}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card sx={{ 
                        height: '100%',
                        background: stat.gradient,
                        color: 'white',
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '30%',
                          height: '100%',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '50% 0 0 50%'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                              {stat.icon}
                            </Avatar>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                {stat.value}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                of {stat.total}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.9 }}>
                            {stat.title}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(stat.value / stat.total) * 100}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'rgba(255,255,255,0.8)',
                                borderRadius: 3
                              }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
                <Box>
                  <Card sx={{ borderRadius: 3, height: '70vh', overflow: 'hidden' }}>
                    <CardContent sx={{ p: 0, height: '100%' }}>
                      <Box sx={{ 
                        p: 3, 
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <WifiIcon />
                          </motion.div>
                          Live Attendance Feed
                        </Typography>
                      </Box>
                      
                      <Box sx={{ p: 3, height: 'calc(100% - 80px)', overflowY: 'auto' }}>
                        <Stack spacing={2}>
                          {filteredRecords.slice(0, 20).map((record, index) => (
                            <motion.div
                              key={record._id}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Paper sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                background: alpha(getStatusColor(record.status), 0.1),
                                border: `1px solid ${alpha(getStatusColor(record.status), 0.3)}`,
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={record.employee.avatar}
                                    sx={{ 
                                      width: 50, 
                                      height: 50,
                                      border: `2px solid ${getStatusColor(record.status)}`
                                    }}
                                  >
                                    {record.employee.name[0]}
                                  </Avatar>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {record.employee.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {record.employee.department} • {record.employee.position}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                      <Chip
                                        icon={getStatusIcon(record.status)}
                                        label={record.status.replace('-', ' ').toUpperCase()}
                                        size="small"
                                        sx={{ 
                                          bgcolor: getStatusColor(record.status),
                                          color: 'white',
                                          fontWeight: 600
                                        }}
                                      />
                                      {record.checkIn && (
                                        <Chip
                                          icon={<LoginIcon />}
                                          label={formatTime(record.checkIn)}
                                          size="small"
                                          variant="outlined"
                                        />
                                      )}
                                      {record.checkOut && (
                                        <Chip
                                          icon={<LogoutIcon />}
                                          label={formatTime(record.checkOut)}
                                          size="small"
                                          variant="outlined"
                                        />
                                      )}
                                      {record.workMode === 'remote' && (
                                        <Chip
                                          icon={<HomeIcon />}
                                          label="Remote"
                                          size="small"
                                          color="secondary"
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: getStatusColor(record.status) }}>
                                      {record.totalHours}h
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Total Hours
                                    </Typography>
                                    {record.mood && (
                                      <Box sx={{ mt: 1, fontSize: '1.5rem' }}>
                                        {getMoodEmoji(record.mood)}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                                
                                {/* Productivity bar */}
                                <Box sx={{ mt: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Productivity Score
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {record.productivity.score}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={record.productivity.score}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: alpha(theme.palette.grey[300], 0.3),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: record.productivity.score >= 80 ? theme.palette.success.main :
                                                record.productivity.score >= 60 ? theme.palette.warning.main :
                                                theme.palette.error.main,
                                        borderRadius: 3
                                      }
                                    }}
                                  />
                                </Box>
                              </Paper>
                            </motion.div>
                          ))}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box>
                  <Stack spacing={3}>
                    {/* Quick Actions */}
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LightningIcon color="warning" />
                          Quick Actions
                        </Typography>
                        
                        <Stack spacing={2}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<FingerprintIcon />}
                            onClick={() => handleBiometricScan('fingerprint')}
                            sx={{
                              py: 1.5,
                              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #ee5a52, #ff6b6b)'
                              }
                            }}
                          >
                            Fingerprint Scan
                          </Button>
                          
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<FaceIcon />}
                            onClick={() => handleBiometricScan('face')}
                            sx={{
                              py: 1.5,
                              background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #44a08d, #4ecdc4)'
                              }
                            }}
                          >
                            Face Recognition
                          </Button>
                          
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<QrCodeIcon />}
                            sx={{
                              py: 1.5,
                              background: 'linear-gradient(45deg, #667eea, #764ba2)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #764ba2, #667eea)'
                              }
                            }}
                          >
                            QR Code Scan
                          </Button>
                          
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<LocationIcon />}
                            sx={{ py: 1.5 }}
                          >
                            Geo Check-in
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                    
                    {/* Live Updates */}
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshIcon color="primary" />
                          </motion.div>
                          Live Updates
                        </Typography>
                        
                        <Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                          {liveUpdates.map((update, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Box sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                background: alpha(theme.palette.primary.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={update.employee.avatar}
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    {update.employee.name[0]}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {update.employee.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {update.type.replace('-', ' ')} • {update.employee.department}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(update.timestamp).toLocaleTimeString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </motion.div>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Floating Action Buttons */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Fab
              color="primary"
              onClick={() => setQuickActionDialog(true)}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              <LightningIcon />
            </Fab>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Fab
              color="secondary"
              onClick={fetchAttendanceData}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              <RefreshIcon />
            </Fab>
          </motion.div>
        </Box>

        {/* Success/Error Snackbars */}
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default AttendancePage;
