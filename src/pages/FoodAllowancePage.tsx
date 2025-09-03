import React, { useEffect, useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  MenuItem, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  CircularProgress, 
  Alert,
  useTheme,
  alpha,
  Avatar,
  Badge,
  Divider,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

interface Employee {
  _id: string;
  name: string;
  position: string;
  company?: string;
}

interface Project {
  _id: string;
  customer: string;
  equipmentDescription?: string;
}

interface FoodAllowanceRecord {
  _id: string;
  rentType: string;
  companyName: string;
  driver: Employee;
  project: Project;
  value: string; // Add value property
  createdAt?: string;
}

const rentTypes = [
  { value: 'callout', label: 'Callout' },
  { value: 'monthly_12h', label: 'Monthly 12H' },
  { value: 'monthly_24h', label: 'Monthly 24H' },
];

const FoodAllowancePage: React.FC = () => {
  const muiTheme = useTheme();
  const [records, setRecords] = useState<FoodAllowanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    rentType: '',
    companyName: '',
    driver: '',
    project: '',
    value: '', // Add value field
  });
  const [submitting, setSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch employees with position 'driver'
    api.get('/employees').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setEmployees(data.filter((e: Employee) => e.position && e.position.toLowerCase().includes('driver')));
    }).catch(() => setEmployees([]));
    // Fetch projects/orders
    api.get('/projects').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setProjects(data);
    }).catch(() => setProjects([]));
    // Fetch food allowance records (stubbed for now)
    setLoading(false);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    // Stub: Add API call to create food allowance record
    setTimeout(() => {
      setRecords([
        ...records,
        {
          _id: Math.random().toString(36).substr(2, 9),
          rentType: form.rentType,
          companyName: form.companyName,
          driver: employees.find(e => e._id === form.driver)!,
          project: projects.find(p => p._id === form.project)!,
          value: form.value, // Add value to record
          createdAt: new Date().toISOString(),
        },
      ]);
      setSubmitting(false);
      setForm({ rentType: '', companyName: '', driver: '', project: '', value: '' });
    }, 500);
  };

  // Calculate totals
  const totalValue = records.reduce((sum, rec) => sum + Number(rec.value || 0), 0);
  const totalRecords = records.length;

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
                    <RestaurantIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Food Allowance Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Comprehensive food allowance tracking and management system
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setOpenForm(true)}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Food Allowance
                </Button>
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
                title: 'Total Records',
                value: totalRecords,
                icon: <RestaurantIcon />,
                color: muiTheme.palette.primary.main,
                bgColor: alpha(muiTheme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Value',
                value: totalValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <AttachMoneyIcon />,
                color: muiTheme.palette.success.main,
                bgColor: alpha(muiTheme.palette.success.main, 0.1)
              },
              {
                title: 'Active Drivers',
                value: employees.length,
                icon: <PeopleIcon />,
                color: muiTheme.palette.warning.main,
                bgColor: alpha(muiTheme.palette.warning.main, 0.1)
              },
              {
                title: 'Active Projects',
                value: projects.length,
                icon: <BusinessIcon />,
                color: muiTheme.palette.info.main,
                bgColor: alpha(muiTheme.palette.info.main, 0.1)
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

        {/* Add Food Allowance Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              borderRadius: muiTheme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: muiTheme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              🍽️ Add Food Allowance Record
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Information Section */}
              <Box sx={{ 
                p: 2, 
                background: alpha(muiTheme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: muiTheme.palette.primary.main }}>
                  📋 Basic Information
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 2 }}>
                                     <TextField
                     select
                     label="Rent Type"
                     name="rentType"
                     value={form.rentType}
                     onChange={handleFormChange}
                     required
                     size="medium"
                     sx={{ 
                       minWidth: 180,
                       '& .MuiOutlinedInput-root': {
                         '&:hover fieldset': {
                           borderColor: muiTheme.palette.primary.main,
                         },
                         '&.Mui-focused fieldset': {
                           borderColor: muiTheme.palette.primary.main,
                         },
                       },
                     }}
                   >
                    <MenuItem value="">Select Rent Type</MenuItem>
                    {rentTypes.map(rt => <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>)}
                  </TextField>
                                     <TextField
                     label="Company Name"
                     name="companyName"
                     value={form.companyName}
                     onChange={handleFormChange}
                     required
                     size="medium"
                     sx={{ 
                       minWidth: 180,
                       '& .MuiOutlinedInput-root': {
                         '&:hover fieldset': {
                           borderColor: muiTheme.palette.primary.main,
                         },
                         '&.Mui-focused fieldset': {
                           borderColor: muiTheme.palette.primary.main,
                         },
                       },
                     }}
                   />
                </Box>
              </Box>

              {/* Driver and Project Section */}
              <Box sx={{ 
                p: 2, 
                background: alpha(muiTheme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(muiTheme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: muiTheme.palette.info.main }}>
                  👤 Driver & Project Details
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 2 }}>
                                     <TextField
                     select
                     label="Driver Name"
                     name="driver"
                     value={form.driver}
                     onChange={handleFormChange}
                     required
                     size="medium"
                     sx={{ 
                       minWidth: 180,
                       '& .MuiOutlinedInput-root': {
                         '&:hover fieldset': {
                           borderColor: muiTheme.palette.info.main,
                         },
                         '&.Mui-focused fieldset': {
                           borderColor: muiTheme.palette.info.main,
                         },
                       },
                     }}
                   >
                    <MenuItem value="">Select Driver</MenuItem>
                    {employees.map(emp => <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>)}
                  </TextField>
                                     <TextField
                     select
                     label="Project"
                     name="project"
                     value={form.project}
                     onChange={handleFormChange}
                     required
                     size="medium"
                     sx={{ 
                       minWidth: 180,
                       '& .MuiOutlinedInput-root': {
                         '&:hover fieldset': {
                           borderColor: muiTheme.palette.info.main,
                         },
                         '&.Mui-focused fieldset': {
                           borderColor: muiTheme.palette.info.main,
                         },
                       },
                     }}
                   >
                    <MenuItem value="">Select Project</MenuItem>
                    {projects.map(proj => <MenuItem key={proj._id} value={proj._id}>{proj.customer} {proj.equipmentDescription ? `- ${proj.equipmentDescription}` : ''}</MenuItem>)}
                  </TextField>
                </Box>
              </Box>

              {/* Allowance Value Section */}
              <Box sx={{ 
                p: 2, 
                background: alpha(muiTheme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(muiTheme.palette.success.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: muiTheme.palette.success.main }}>
                  💰 Allowance Value
                </Typography>
                                 <TextField
                   label="Value"
                   name="value"
                   value={form.value}
                   onChange={handleFormChange}
                   required
                   type="number"
                   inputProps={{ min: 0 }}
                   size="medium"
                   sx={{ 
                     minWidth: 200,
                     '& .MuiOutlinedInput-root': {
                       '&:hover fieldset': {
                         borderColor: muiTheme.palette.success.main,
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: muiTheme.palette.success.main,
                       },
                     },
                   }}
                 />
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={submitting}
                  startIcon={<AddIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 14px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(muiTheme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: muiTheme.palette.action.disabledBackground,
                      color: muiTheme.palette.action.disabled
                    }
                  }}
                >
                  {submitting ? 'Submitting...' : 'Add Food Allowance'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Food Allowance Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            sx={{ 
              p: 3,
              background: alpha(muiTheme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.2)}`,
              borderRadius: muiTheme.shape.borderRadius
            }}
          >
            <Typography variant="h6" mb={3} sx={{ color: muiTheme.palette.text.primary, fontWeight: 600 }}>
              📊 Food Allowance Records
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: muiTheme.palette.text.primary }}>Rent Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: muiTheme.palette.text.primary }}>Company Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: muiTheme.palette.text.primary }}>Driver Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: muiTheme.palette.text.primary }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: muiTheme.palette.text.primary }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: muiTheme.palette.text.primary }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((rec, idx) => (
                    <TableRow 
                      key={rec._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(muiTheme.palette.background.default, 0.5) : alpha(muiTheme.palette.background.paper, 0.8),
                        '&:hover': {
                          background: alpha(muiTheme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <TableCell>
                        <Badge 
                          badgeContent={rentTypes.find(rt => rt.value === rec.rentType)?.label || rec.rentType}
                          color="primary"
                          sx={{ 
                            '& .MuiBadge-badge': {
                              background: muiTheme.palette.primary.main,
                              color: 'white'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{rec.companyName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: muiTheme.palette.info.main }}>
                            <PeopleIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          {rec.driver?.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: muiTheme.palette.warning.main }}>
                            <BusinessIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          {rec.project?.customer}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: muiTheme.palette.success.main, fontWeight: 600 }}>
                          {rec.value || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  '& .MuiAlert-icon': {
                    color: muiTheme.palette.error.main
                  }
                }}
              >
                {error}
              </Alert>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default FoodAllowancePage; 