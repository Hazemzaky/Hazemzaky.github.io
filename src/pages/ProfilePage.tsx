import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Paper,
  Chip,
  Divider,

  Container,
  Fade,
  Slide,
  Zoom,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  Verified as VerifiedIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import theme from '../theme';

interface UserProfile {
  _id?: string;
  email: string;
  role: string;
  phone?: string;
  workEmail?: string;
  address?: string;
  position?: string;
  lastSignIn?: string;
  password?: string;
}

// Add a custom JWT decoder function
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Add debugging logs
console.log("ProfilePage loaded");
const token = localStorage.getItem('token');
console.log("Token:", token);
console.log("Decoded user:", decodeJWT(token || ''));

const ProfilePage: React.FC = () => {
  const muiTheme = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [pwDialog, setPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [adminPwDialog, setAdminPwDialog] = useState(false);
  const [adminPwForm, setAdminPwForm] = useState({ password: '', confirm: '' });
  const [adminPwError, setAdminPwError] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get current user info from token
  let currentUser: any = null;
  try {
    if (token) {
      currentUser = decodeJWT(token);
    } else {
      setError('No token found. Please log in again.');
    }
  } catch (e) {
    setError('Failed to decode token. Please log in again.');
    console.error('JWT decode error:', e);
  }
  const isAdmin = currentUser?.role === 'admin';
  const isSelf = !isAdmin || (profile && currentUser?.userId === profile._id);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      setError('No token found. Please log in again.');
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get<UserProfile>('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setEditForm(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        console.error('API error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (isAdmin) {
        await axios.put(`/api/auth/${profile?._id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.put('/api/auth/me', { address: editForm.address }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setSuccess('Profile updated');
      setEditMode(false);
      setProfile({ ...profile, ...editForm });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePwSave = async () => {
    setPwError('');
    if (pwForm.password !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/me', { password: pwForm.password }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Password updated');
      setPwDialog(false);
      setPwForm({ password: '', confirm: '' });
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAdminPwSave = async () => {
    setAdminPwError('');
    if (adminPwForm.password !== adminPwForm.confirm) {
      setAdminPwError('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/${profile?._id}/password`, { password: adminPwForm.password }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Password updated');
      setAdminPwDialog(false);
      setAdminPwForm({ password: '', confirm: '' });
    } catch (err: any) {
      setAdminPwError(err.response?.data?.message || 'Failed to update password');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return theme.palette.error.main;
      case 'manager': return theme.palette.warning.main;
      case 'user': return theme.palette.primary.main;
      default: return theme.palette.neutral?.main || theme.palette.grey[500];
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <AdminIcon />;
      case 'manager': return <WorkIcon />;
      case 'user': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 50%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.02"%3E%3Ccircle cx="20" cy="20" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4,
          zIndex: 0
        }
      }}
    >
      {/* Decorative background elements */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`, zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: -150, left: -150, width: 400, height: 400, borderRadius: '50%', background: `linear-gradient(225deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.info.main, 0.05)})`, zIndex: 0 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Header Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  borderRadius: 24,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    User Profile
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage your account settings and personal information
                  </Typography>
                </Box>
                
                {/* Decorative elements */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', zIndex: 1 }} />
              </Paper>

              {/* Debug Info Modal */}
              <Dialog 
                open={showDebug} 
                onClose={() => setShowDebug(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                  sx: {
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    backdropFilter: 'blur(20px)'
                  }
                }}
              >
                <DialogTitle sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <SettingsIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Debug Information</Typography>
                  </Box>
                  <IconButton
                    aria-label="close"
                    onClick={() => setShowDebug(false)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Token Status:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                        {token || 'No token found'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Decoded User:</Typography>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, fontSize: '0.75rem' }}>
                        {JSON.stringify(decodeJWT(token || ''), null, 2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Profile State:</Typography>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, fontSize: '0.75rem' }}>
                        {profile ? JSON.stringify(profile, null, 2) : 'No profile loaded'}
                      </Typography>
                    </Box>
                    {error && (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {error}
                      </Alert>
                    )}
                  </Stack>
                </DialogContent>
              </Dialog>

              {/* Main Content */}
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      borderRadius: 24,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                    }}
                  >
                    <CircularProgress 
                      size={60} 
                      sx={{ 
                        color: theme.palette.primary.main,
                        mb: 3
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary">
                      Loading your profile...
                    </Typography>
                  </Paper>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 16,
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                      fontSize: '1.1rem'
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              ) : profile ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, 
                      gap: 4 
                    }}
                  >
                    {/* Profile Card */}
                    <Box>
                      <Card
                        elevation={0}
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          borderRadius: 24,
                          overflow: 'hidden',
                          position: 'relative',
                          height: 'fit-content'
                        }}
                      >
                        <Box
                          sx={{
                            height: 120,
                            background: `linear-gradient(135deg, ${getRoleColor(profile.role)} 0%, ${alpha(getRoleColor(profile.role), 0.8)} 100%)`,
                            position: 'relative'
                          }}
                        />
                        
                        <CardContent sx={{ p: 4, pt: 0 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -8 }}>
                            <Badge
                              badgeContent={
                                <Tooltip title={`${profile.role} User`}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: getRoleColor(profile.role),
                                      border: `2px solid ${theme.palette.background.paper}`
                                    }}
                                  >
                                    {getRoleIcon(profile.role)}
                                  </Avatar>
                                </Tooltip>
                              }
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            >
                              <Avatar
                                sx={{
                                  width: 120,
                                  height: 120,
                                  bgcolor: theme.palette.background.paper,
                                  color: getRoleColor(profile.role),
                                  fontSize: '3rem',
                                  fontWeight: 700,
                                  border: `4px solid ${theme.palette.background.paper}`,
                                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`
                                }}
                              >
                                {profile.email?.[0]?.toUpperCase() || 'U'}
                              </Avatar>
                            </Badge>
                            
                            <Typography variant="h5" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                              {profile.email}
                            </Typography>
                            
                            <Chip
                              label={profile.role?.toUpperCase() || 'USER'}
                              icon={getRoleIcon(profile.role)}
                              sx={{
                                bgcolor: alpha(getRoleColor(profile.role), 0.1),
                                color: getRoleColor(profile.role),
                                fontWeight: 600,
                                mb: 2
                              }}
                            />
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                              {profile.position || 'Team Member'}
                            </Typography>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                              {(isAdmin || isSelf) && (
                                <Button
                                  variant="contained"
                                  startIcon={<EditIcon />}
                                  onClick={() => setEditMode(true)}
                                  sx={{
                                    flex: 1,
                                    borderRadius: 12,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                      transform: 'translateY(-2px)'
                                    }
                                  }}
                                >
                                  Edit
                                </Button>
                              )}
                              {isSelf && (
                                <Button
                                  variant="outlined"
                                  startIcon={<LockIcon />}
                                  onClick={() => setPwDialog(true)}
                                  sx={{
                                    flex: 1,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    '&:hover': {
                                      borderWidth: 2,
                                      transform: 'translateY(-2px)'
                                    }
                                  }}
                                >
                                  Password
                                </Button>
                              )}
                            </Stack>

                            {isAdmin && (
                              <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<ShieldIcon />}
                                onClick={() => setAdminPwDialog(true)}
                                fullWidth
                                sx={{
                                  mt: 2,
                                  borderRadius: 12,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2,
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                Admin: Reset Password
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Profile Details */}
                    <Box>
                      <Card
                        elevation={0}
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          borderRadius: 24,
                          height: 'fit-content'
                        }}
                      >
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon sx={{ color: theme.palette.primary.main }} />
                              Profile Information
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setShowDebug(true)}
                              startIcon={<SettingsIcon />}
                              sx={{ borderRadius: 8 }}
                            >
                              Debug
                            </Button>
                          </Box>

                          {editMode ? (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                            >
                              <Stack spacing={3}>
                                {isAdmin && (
                                  <TextField
                                    label="Email Address"
                                    name="email"
                                    value={editForm.email || ''}
                                    onChange={handleEditChange}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: <EmailIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 12,
                                        background: alpha(theme.palette.background.paper, 0.8)
                                      }
                                    }}
                                  />
                                )}
                                <TextField
                                  label="Role"
                                  name="role"
                                  value={editForm.role || ''}
                                  onChange={handleEditChange}
                                  fullWidth
                                  disabled={!isAdmin}
                                  InputProps={{
                                    startAdornment: <AdminIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 12,
                                      background: alpha(theme.palette.background.paper, 0.8)
                                    }
                                  }}
                                />
                                <TextField
                                  label="Phone Number"
                                  name="phone"
                                  value={editForm.phone || ''}
                                  onChange={handleEditChange}
                                  fullWidth
                                  disabled={!isAdmin}
                                  InputProps={{
                                    startAdornment: <PhoneIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 12,
                                      background: alpha(theme.palette.background.paper, 0.8)
                                    }
                                  }}
                                />
                                <TextField
                                  label="Work Email"
                                  name="workEmail"
                                  value={editForm.workEmail || ''}
                                  onChange={handleEditChange}
                                  fullWidth
                                  disabled={!isAdmin}
                                  InputProps={{
                                    startAdornment: <WorkIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 12,
                                      background: alpha(theme.palette.background.paper, 0.8)
                                    }
                                  }}
                                />
                                <TextField
                                  label="Address"
                                  name="address"
                                  value={editForm.address || ''}
                                  onChange={handleEditChange}
                                  fullWidth
                                  disabled={!isAdmin && !isSelf}
                                  multiline
                                  rows={2}
                                  InputProps={{
                                    startAdornment: <HomeIcon sx={{ color: theme.palette.primary.main, mr: 1, mt: 1 }} />
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 12,
                                      background: alpha(theme.palette.background.paper, 0.8)
                                    }
                                  }}
                                />
                                <TextField
                                  label="Position"
                                  name="position"
                                  value={editForm.position || ''}
                                  onChange={handleEditChange}
                                  fullWidth
                                  disabled={!isAdmin}
                                  InputProps={{
                                    startAdornment: <StarIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 12,
                                      background: alpha(theme.palette.background.paper, 0.8)
                                    }
                                  }}
                                />
                                
                                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                                  <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleEditSave}
                                    sx={{
                                      flex: 1,
                                      py: 1.5,
                                      borderRadius: 12,
                                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                                      '&:hover': {
                                        background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={() => { setEditMode(false); setEditForm(profile); }}
                                    sx={{
                                      flex: 1,
                                      py: 1.5,
                                      borderRadius: 12,
                                      borderWidth: 2,
                                      '&:hover': {
                                        borderWidth: 2,
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </Stack>
                              </Stack>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                            >
                              <Stack spacing={3}>
                                {[
                                  { label: 'Email Address', value: profile.email, icon: <EmailIcon /> },
                                  { label: 'Role', value: profile.role, icon: <AdminIcon /> },
                                  { label: 'Phone Number', value: profile.phone || 'Not provided', icon: <PhoneIcon /> },
                                  { label: 'Work Email', value: profile.workEmail || 'Not provided', icon: <WorkIcon /> },
                                  { label: 'Address', value: profile.address || 'Not provided', icon: <HomeIcon /> },
                                  { label: 'Position', value: profile.position || 'Not specified', icon: <StarIcon /> },
                                  { label: 'Last Sign In', value: profile.lastSignIn ? new Date(profile.lastSignIn).toLocaleString() : 'Never', icon: <TimeIcon /> },
                                  { label: 'Account Security', value: '••••••••', icon: <SecurityIcon /> }
                                ].map((item, index) => (
                                  <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                  >
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 3,
                                        borderRadius: 16,
                                        background: alpha(theme.palette.background.paper, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          background: alpha(theme.palette.primary.main, 0.05),
                                          transform: 'translateY(-2px)',
                                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                                        }
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                          sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            width: 40,
                                            height: 40
                                          }}
                                        >
                                          {item.icon}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            {item.label}
                                          </Typography>
                                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                            {item.value}
                                          </Typography>
                                        </Box>
                                        {item.label === 'Role' && (
                                          <Chip
                                            size="small"
                                            label={profile.role?.toUpperCase()}
                                            sx={{
                                              bgcolor: alpha(getRoleColor(profile.role), 0.1),
                                              color: getRoleColor(profile.role),
                                              fontWeight: 600
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Paper>
                                  </motion.div>
                                ))}
                              </Stack>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Enhanced Password Dialogs */}
      <Dialog 
        open={pwDialog} 
        onClose={() => setPwDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 16,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <LockIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Change Password</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <TextField 
              label="New Password" 
              type="password" 
              value={pwForm.password} 
              onChange={e => setPwForm({ ...pwForm, password: e.target.value })} 
              fullWidth 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  background: alpha(theme.palette.background.paper, 0.8)
                }
              }}
            />
            <TextField 
              label="Confirm Password" 
              type="password" 
              value={pwForm.confirm} 
              onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} 
              fullWidth 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  background: alpha(theme.palette.background.paper, 0.8)
                }
              }}
            />
            {pwError && <Alert severity="error" sx={{ borderRadius: 2 }}>{pwError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setPwDialog(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          <Button 
            onClick={handlePwSave} 
            variant="contained" 
            sx={{ 
              borderRadius: 8,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              }
            }}
          >
            Save Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Password Dialog */}
      <Dialog 
        open={adminPwDialog} 
        onClose={() => setAdminPwDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 16,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
              <ShieldIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Admin: Change User Password</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <TextField 
              label="New Password" 
              type="password" 
              value={adminPwForm.password} 
              onChange={e => setAdminPwForm({ ...adminPwForm, password: e.target.value })} 
              fullWidth 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  background: alpha(theme.palette.background.paper, 0.8)
                }
              }}
            />
            <TextField 
              label="Confirm Password" 
              type="password" 
              value={adminPwForm.confirm} 
              onChange={e => setAdminPwForm({ ...adminPwForm, confirm: e.target.value })} 
              fullWidth 
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  background: alpha(theme.palette.background.paper, 0.8)
                }
              }}
            />
            {adminPwError && <Alert severity="error" sx={{ borderRadius: 2 }}>{adminPwError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setAdminPwDialog(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          <Button 
            onClick={handleAdminPwSave} 
            variant="contained" 
            color="warning"
            sx={{ 
              borderRadius: 8,
              background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`
              }
            }}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess('')} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ 
            borderRadius: 12,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.9)} 0%, ${alpha(theme.palette.success.dark, 0.9)} 100%)`,
            color: 'white'
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
