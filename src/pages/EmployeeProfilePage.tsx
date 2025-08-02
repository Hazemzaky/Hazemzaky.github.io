import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Avatar, Chip, Card, CardContent, 
  Tabs, Tab, Divider, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, List, ListItem, ListItemAvatar, ListItemText,
  ListItemSecondaryAction, Badge, Tooltip, LinearProgress, Rating,
  Accordion, AccordionSummary, AccordionDetails, Fab, Menu, MenuItem,
  Alert, Snackbar
} from '@mui/material';
import {
  Edit as EditIcon, LocationOn as LocationIcon, Email as EmailIcon,
  Phone as PhoneIcon, Work as WorkIcon, CalendarToday as CalendarIcon,
  Person as PersonIcon, AttachMoney as MoneyIcon, Assessment as AssessmentIcon,
  Description as DocumentIcon, History as HistoryIcon, Note as NoteIcon,
  ExpandMore as ExpandMoreIcon, Add as AddIcon, Download as DownloadIcon,
  Upload as UploadIcon, Warning as WarningIcon, Cake as CakeIcon,
  Celebration as CelebrationIcon, Schedule as ScheduleIcon, TrendingUp as TrendingUpIcon,
  Group as GroupIcon, Star as StarIcon, Security as SecurityIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import api from '../apiBase';

interface Employee {
  _id: string;
  name: string;
  email: string;
  personalEmail?: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  manager?: string;
  officeLocation: string;
  workMode: 'office' | 'remote' | 'hybrid';
  joinDate: string;
  employmentType: 'full-time' | 'part-time' | 'contractor' | 'intern';
  status: 'active' | 'on-leave' | 'resigned' | 'probation';
  salary?: number;
  hourlyRate?: number;
  jobLevel: string;
  skills: string[];
  leaveBalance: {
    vacation: number;
    sick: number;
    personal: number;
  };
  performance: {
    lastReviewDate?: string;
    rating?: number;
    goals: Array<{
      id: string;
      title: string;
      category: string;
      progress: number;
      target: number;
    }>;
    feedback: Array<{
      id: string;
      from: string;
      comment: string;
      date: string;
      tags: string[];
    }>;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    expiryDate?: string;
    url: string;
  }>;
  timeline: Array<{
    id: string;
    date: string;
    event: string;
    description: string;
    type: 'join' | 'promotion' | 'leave' | 'transfer' | 'warning' | 'achievement';
  }>;
  directReports?: string[];
  birthday?: string;
  workAnniversary?: string;
  nextOneOnOne?: string;
  privateNotes?: string;
}

interface UserRole {
  role: 'admin' | 'hr' | 'finance' | 'manager' | 'employee';
}

const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>({ role: 'employee' }); // Mock user role
  const [showSalary, setShowSalary] = useState(false);
  const [notesDialog, setNotesDialog] = useState(false);
  const [privateNotes, setPrivateNotes] = useState('');
  const [success, setSuccess] = useState('');

  // Remove mockEmployee and setTimeout logic
  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/employees/${id}`)
      .then(res => {
        const data = res.data as Employee;
        setEmployee(data);
        setPrivateNotes(data.privateNotes || '');
        setLoading(false);
      })
      .catch(err => {
        setError('Employee not found');
        setEmployee(null);
        setLoading(false);
      });
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'on-leave': return 'warning';
      case 'resigned': return 'error';
      case 'probation': return 'info';
      default: return 'default';
    }
  };

  const getWorkModeColor = (mode: string) => {
    switch (mode) {
      case 'office': return 'primary';
      case 'remote': return 'secondary';
      case 'hybrid': return 'info';
      default: return 'default';
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'join': return 'primary';
      case 'promotion': return 'success';
      case 'leave': return 'warning';
      case 'transfer': return 'info';
      case 'warning': return 'error';
      case 'achievement': return 'secondary';
      default: return 'default';
    }
  };

  const calculateAttritionRisk = (employee: Employee): 'low' | 'medium' | 'high' => {
    // Mock logic - in real app, this would be more sophisticated
    const daysSinceJoin = Math.floor((Date.now() - new Date(employee.joinDate).getTime()) / (1000 * 60 * 60 * 24));
    const totalLeave = employee.leaveBalance.vacation + employee.leaveBalance.sick + employee.leaveBalance.personal;
    
    if (daysSinceJoin < 365) return 'low';
    if (totalLeave > 20) return 'medium';
    return 'low';
  };

  const getAttritionRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const canEdit = userRole.role === 'admin' || userRole.role === 'hr';
  const canViewSalary = userRole.role === 'admin' || userRole.role === 'hr' || userRole.role === 'finance';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading employee profile...</Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Employee not found</Typography>
      </Box>
    );
  }

  const attritionRisk = calculateAttritionRisk(employee);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                fontSize: '2rem',
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              {employee.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {employee.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                {employee.position}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ID: {employee.employeeId}
                </Typography>
                <Chip 
                  label={employee.status.replace('-', ' ').toUpperCase()} 
                  color={getStatusColor(employee.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip 
                  label={`Risk: ${attritionRisk.toUpperCase()}`}
                  color={getAttritionRiskColor(attritionRisk)}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(!editMode)}
              sx={{ 
                background: 'rgba(255,255,255,0.2)', 
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      {/* Quick Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Leave Balance
            </Typography>
            <Box display="flex" gap={2}>
              <Box>
                <Typography variant="h4">{employee.leaveBalance.vacation}</Typography>
                <Typography variant="caption">Vacation</Typography>
              </Box>
              <Box>
                <Typography variant="h4">{employee.leaveBalance.sick}</Typography>
                <Typography variant="caption">Sick</Typography>
              </Box>
              <Box>
                <Typography variant="h4">{employee.leaveBalance.personal}</Typography>
                <Typography variant="caption">Personal</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Performance Rating
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Rating value={employee.performance.rating || 0} readOnly precision={0.1} />
              <Typography variant="h5">
                {employee.performance.rating?.toFixed(1) || 'N/A'}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary">
              Last review: {employee.performance.lastReviewDate ? new Date(employee.performance.lastReviewDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Upcoming Events
            </Typography>
            <List dense>
              {employee.nextOneOnOne && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <ScheduleIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText 
                    primary="1-on-1 Meeting"
                    secondary={new Date(employee.nextOneOnOne).toLocaleDateString()}
                  />
                </ListItem>
              )}
              {employee.birthday && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <CakeIcon color="secondary" />
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Birthday"
                    secondary={new Date(employee.birthday).toLocaleDateString()}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>

        {canViewSalary && (
          <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="primary" gutterBottom>
                  Compensation
                </Typography>
                <IconButton size="small" onClick={() => setShowSalary(!showSalary)}>
                  {showSalary ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Box>
              {showSalary ? (
                <Box>
                  <Typography variant="h5">
                    ${employee.salary?.toLocaleString() || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Annual Salary
                  </Typography>
                  {employee.hourlyRate && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ${employee.hourlyRate}/hr
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Click to view
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            backgroundColor: '#f8f9fa',
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 500
            }
          }}
        >
          <Tab label="Basic Info" />
          <Tab label="Job & Compensation" />
          <Tab label="Performance" />
          <Tab label="Leave & Attendance" />
          <Tab label="Documents" />
          <Tab label="Timeline" />
          {canEdit && <Tab label="Private Notes" />}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Basic Information */}
            <Card sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <EmailIcon color="primary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Corporate Email"
                      secondary={employee.email}
                    />
                  </ListItem>
                  {employee.personalEmail && (
                    <ListItem>
                      <ListItemAvatar>
                        <EmailIcon color="secondary" />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Personal Email"
                        secondary={employee.personalEmail}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemAvatar>
                      <PhoneIcon color="primary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Phone"
                      secondary={employee.phone}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <WorkIcon color="primary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Department"
                      secondary={employee.department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <PersonIcon color="primary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Manager"
                      secondary={employee.manager || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <LocationIcon color="primary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Office Location"
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {employee.officeLocation}
                          <Chip 
                            label={employee.workMode.toUpperCase()} 
                            color={getWorkModeColor(employee.workMode)}
                            size="small"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <CalendarIcon color="primary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Join Date"
                      secondary={new Date(employee.joinDate).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <WorkIcon color="secondary" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Employment Type"
                      secondary={employee.employmentType.replace('-', ' ').toUpperCase()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card sx={{ flex: '1 1 100%', width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills & Expertise
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {employee.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      color="primary"
                      variant="outlined"
                      size="medium"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Org Chart Widget */}
            <Card sx={{ flex: '1 1 100%', width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Organization Chart
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, py: 3 }}>
                  {/* Manager */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}>
                      {employee.manager?.split(' ').map(n => n[0]).join('') || 'M'}
                    </Avatar>
                    <Typography variant="body2" fontWeight="600">{employee.manager || 'Manager'}</Typography>
                    <Typography variant="caption" color="textSecondary">Manager</Typography>
                  </Box>
                  
                  {/* Connector */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: 2, height: 20, backgroundColor: '#ddd' }} />
                    <Typography variant="caption" color="textSecondary">reports to</Typography>
                  </Box>
                  
                  {/* Employee */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="body2" fontWeight="600">{employee.name}</Typography>
                    <Typography variant="caption" color="textSecondary">You</Typography>
                  </Box>
                  
                  {/* Connector */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: 2, height: 20, backgroundColor: '#ddd' }} />
                    <Typography variant="caption" color="textSecondary">manages</Typography>
                  </Box>
                  
                  {/* Direct Reports */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 1 }}>
                      {employee.directReports?.map((report, index) => (
                        <Avatar key={index} sx={{ width: 40, height: 40 }}>
                          {report.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      )) || (
                        <Typography variant="caption" color="textSecondary">No direct reports</Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {employee.directReports?.length || 0} Direct Reports
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {tabValue === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job & Compensation Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Job Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Job Level"
                        secondary={employee.jobLevel}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Position"
                        secondary={employee.position}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Department"
                        secondary={employee.department}
                      />
                    </ListItem>
                  </List>
                </Box>
                
                {canViewSalary && (
                  <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Compensation
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Annual Salary"
                          secondary={employee.salary ? `$${employee.salary.toLocaleString()}` : 'Not set'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Hourly Rate"
                          secondary={employee.hourlyRate ? `$${employee.hourlyRate}/hr` : 'Not set'}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {tabValue === 2 && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Performance Goals */}
            <Card sx={{ flex: '1 1 500px', minWidth: 500 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Goals
                </Typography>
                {employee.performance.goals.map((goal) => (
                  <Box key={goal.id} sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {goal.progress}/{goal.target}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(goal.progress / goal.target) * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {goal.category}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Feedback
                </Typography>
                {employee.performance.feedback.map((feedback) => (
                  <Box key={feedback.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {feedback.from}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(feedback.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {feedback.comment}
                    </Typography>
                    <Box display="flex" gap={1}>
                      {feedback.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        )}

        {tabValue === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave & Attendance
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Attendance and leave management information will be displayed here.
              </Typography>
            </CardContent>
          </Card>
        )}

        {tabValue === 4 && (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Documents
                </Typography>
                {canEdit && (
                  <Button variant="contained" startIcon={<UploadIcon />}>
                    Upload Document
                  </Button>
                )}
              </Box>
              <List>
                {employee.documents.map((doc) => {
                  const isExpiring = doc.expiryDate && 
                    new Date(doc.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <ListItem key={doc.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                      <ListItemAvatar>
                        <DocumentIcon color="primary" />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {doc.name}
                            {isExpiring && (
                              <Chip 
                                label="Expiring Soon" 
                                color="warning" 
                                size="small" 
                                icon={<WarningIcon />}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                            </Typography>
                            {doc.expiryDate && (
                              <Typography variant="caption" display="block">
                                Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        )}

        {tabValue === 5 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Timeline
              </Typography>
              <Box sx={{ position: 'relative' }}>
                {employee.timeline.map((event, index) => (
                  <Box key={event.id} sx={{ display: 'flex', mb: 3, position: 'relative' }}>
                    {/* Date Column */}
                    <Box sx={{ width: 120, flexShrink: 0, pt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    {/* Timeline Line and Dot */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      mx: 2,
                      position: 'relative'
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: `${getTimelineColor(event.type)}.main`,
                          mb: 1
                        }}
                      >
                        {event.type === 'join' && <PersonIcon />}
                        {event.type === 'promotion' && <TrendingUpIcon />}
                        {event.type === 'leave' && <CalendarIcon />}
                        {event.type === 'transfer' && <LocationIcon />}
                        {event.type === 'warning' && <WarningIcon />}
                        {event.type === 'achievement' && <StarIcon />}
                      </Avatar>
                      {index < employee.timeline.length - 1 && (
                        <Box sx={{ 
                          width: 2, 
                          height: 40, 
                          bgcolor: 'grey.300',
                          borderRadius: 1
                        }} />
                      )}
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ flex: 1, pt: 1 }}>
                      <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                        {event.event}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {event.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {tabValue === 6 && canEdit && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Private Notes (HR/Admin Only)
              </Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder="Add private notes about this employee..."
                variant="outlined"
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={() => setSuccess('Notes saved successfully!')}>
                  Save Notes
                </Button>
                <Button variant="outlined" onClick={() => setPrivateNotes(employee.privateNotes || '')}>
                  Reset
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

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
    </Box>
  );
};

export default EmployeeProfilePage; 