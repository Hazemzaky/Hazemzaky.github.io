import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  alpha,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Badge,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { getBusinessTripById, deleteBusinessTrip } from '../services/businessTripApi';
import theme from '../theme';

interface BusinessTrip {
  _id: string;
  employee: {
    _id: string;
    name: string;
    position: string;
    department: string;
  };
  tripType: string;
  region: string;
  departureDate: string;
  returnDate: string;
  cost: number;
  flightClass: string;
  status: string;
  costAmortization: boolean;
  totalTripCost?: number;
  amortizationPeriod?: string;
  requiresVisa: boolean;
  travelArrangedBy?: string;
  costPaid: boolean;
  costPaymentDate?: string;
  financeApproval?: string;
  financeComments?: string;
  approvalChain?: Array<{
    role: string;
    name: string;
    status: string;
    timestamp?: string;
    comment?: string;
  }>;
  agendaFile?: string;
  seminarFile?: string;
  hotelQuotes?: string[];
  flightQuotes?: string[];
  receipts?: string[];
  claimSheet?: string;
  postTripSummary?: string;
  boardingPass?: string;
  signedClaimForm?: string;
  createdAt: string;
  updatedAt: string;
}

const BusinessTripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const [trip, setTrip] = useState<BusinessTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getBusinessTripById(id);
        setTrip(response.data as BusinessTrip);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleDelete = async () => {
    if (!trip || !window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await deleteBusinessTrip(trip._id);
      navigate('/business-trips');
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Under Review': return 'warning';
      case 'Approved': return 'success';
      case 'Completed': return 'info';
      case 'Reimbursed': return 'primary';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <PendingIcon />;
      case 'Under Review': return <WarningIcon />;
      case 'Approved': return <CheckCircleIcon />;
      case 'Completed': return <CheckCircleIcon />;
      case 'Reimbursed': return <AttachMoneyIcon />;
      case 'Rejected': return <CancelIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        </motion.div>
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Trip not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/business-trips')}>
          Back to Trips
        </Button>
      </Box>
    );
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
        {/* Header Section */}
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
                      <FlightTakeoffIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                  </motion.div>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      ✈️ Trip Details
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      {trip.tripType} - {trip.region}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/business-trips')}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.5)' }
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/business-trips/${trip._id}/edit`)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
              
              {/* Status and Key Info */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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
                  <Chip
                    label={trip.status}
                    color={getStatusColor(trip.status) as any}
                    icon={getStatusIcon(trip.status)}
                    sx={{ 
                      fontWeight: 700, 
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }}
                  />
                </Box>
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
                  <AttachMoneyIcon />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCurrency(trip.cost)}
                  </Typography>
                </Box>
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
                  <BusinessIcon />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {trip.flightClass}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Decorative background elements */}
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
          </Paper>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Left Column - Trip Information */}
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              {/* Employee Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        👤 Employee Information
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Employee Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {trip.employee.name}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Position
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {trip.employee.position}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Department
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {trip.employee.department}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Employee ID
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {trip.employee._id}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trip Details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.1)}`
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
                        <FlightTakeoffIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                        ✈️ Trip Details
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Trip Type
                        </Typography>
                        <Chip 
                          label={trip.tripType} 
                          sx={{ 
                            fontWeight: 600,
                            background: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }} 
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Destination Region
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {trip.region}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Departure Date
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {new Date(trip.departureDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Return Date
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {new Date(trip.returnDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Flight Class
                        </Typography>
                        <Chip 
                          label={trip.flightClass} 
                          sx={{ 
                            fontWeight: 600,
                            background: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main
                          }} 
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Visa Required
                        </Typography>
                        <Chip 
                          label={trip.requiresVisa ? 'Yes' : 'No'} 
                          color={trip.requiresVisa ? 'warning' : 'success'}
                          sx={{ fontWeight: 600 }} 
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Cost Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.1)}`
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}>
                        <AttachMoneyIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                        💰 Cost Information
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Trip Cost
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.success.main,
                          background: alpha(theme.palette.success.main, 0.1),
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          display: 'inline-block'
                        }}>
                          {formatCurrency(trip.cost)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Cost Paid
                        </Typography>
                        <Chip 
                          label={trip.costPaid ? 'Yes' : 'No'} 
                          color={trip.costPaid ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }} 
                        />
                      </Box>
                      {trip.costPaid && trip.costPaymentDate && (
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Payment Date
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {new Date(trip.costPaymentDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Cost Amortization
                        </Typography>
                        <Chip 
                          label={trip.costAmortization ? 'Yes' : 'No'} 
                          color={trip.costAmortization ? 'info' : 'default'}
                          sx={{ fontWeight: 600 }} 
                        />
                      </Box>
                      {trip.costAmortization && trip.totalTripCost && (
                        <>
                          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Total Trip Cost
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {formatCurrency(trip.totalTripCost)}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Amortization Period
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {trip.amortizationPeriod || 'N/A'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>

            {/* Right Column - Approval Workflow & Actions */}
            <Box sx={{ flex: { xs: 1, md: 1 } }}>
              {/* Approval Workflow */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.1)}`
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 40, height: 40 }}>
                        <TimelineIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                        📋 Approval Workflow
                      </Typography>
                    </Box>
                    <Stepper orientation="vertical" sx={{ pl: 0 }}>
                      {trip.approvalChain?.map((step, index) => (
                        <Step key={index} active={true}>
                          <StepLabel
                            icon={
                              <Avatar sx={{ 
                                bgcolor: step.status === 'Approved' ? theme.palette.success.main : 
                                        step.status === 'Rejected' ? theme.palette.error.main : 
                                        theme.palette.warning.main,
                                width: 32,
                                height: 32
                              }}>
                                {step.status === 'Approved' ? <CheckCircleIcon /> :
                                 step.status === 'Rejected' ? <CancelIcon /> :
                                 <PendingIcon />}
                              </Avatar>
                            }
                          >
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {step.role}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {step.name || 'Pending Assignment'}
                              </Typography>
                              <Chip 
                                label={step.status} 
                                size="small"
                                color={step.status === 'Approved' ? 'success' : 
                                       step.status === 'Rejected' ? 'error' : 'warning'}
                                sx={{ mt: 1 }}
                              />
                              {step.comment && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  {step.comment}
                                </Typography>
                              )}
                            </Box>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.info.main, 0.1)}`
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                        ⚙️ Actions
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/business-trips/${trip._id}/edit`)}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Edit Trip
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Print Details
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Share Trip
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Download Documents
                      </Button>
                      <Divider sx={{ my: 1 }} />
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Delete Trip
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default BusinessTripDetailPage;
