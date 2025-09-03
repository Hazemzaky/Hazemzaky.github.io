import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiBase';
import {
  Box, Button, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, useTheme, alpha, Avatar, Badge, Divider, LinearProgress, Chip, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import WarningIcon from '@mui/icons-material/Warning';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

const passTypes = [
  { value: 'KOC', label: 'KOC' },
  { value: 'KNPC', label: 'KNPC' },
  { value: 'GO', label: 'GO' },
  { value: 'RATQA', label: 'RATQA' },
  { value: 'ABDALI', label: 'ABDALI' },
  { value: 'WANEET', label: 'WANEET' },
];

const EmployeePassesPage: React.FC = () => {
  const muiTheme = useTheme();
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    passType: '',
    passNumber: '',
    issuanceDate: '',
    expiryDate: '',
    certificate: undefined,
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch all employees with position driver or operator on mount
  useEffect(() => {
    Promise.all([
      api.get('/employees', { params: { position: 'driver' } }),
      api.get('/employees', { params: { position: 'operator' } })
    ]).then(([driverRes, operatorRes]) => {
      const driverList = Array.isArray(driverRes.data) ? driverRes.data : [];
      const operatorList = Array.isArray(operatorRes.data) ? operatorRes.data : [];
      // Combine and deduplicate by _id
      const combined = [...driverList, ...operatorList].filter((emp, idx, arr) =>
        arr.findIndex(e => e._id === emp._id) === idx
      );
      setEmployees(combined);
    });
  }, []);

  // Fetch passes for selected employee
  useEffect(() => {
    if (selectedEmployee && selectedEmployee._id) {
      setLoading(true);
      api.get('/employee-passes', { params: { employee: selectedEmployee._id } })
        .then(res => {
          setPasses(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch(() => {
          setPasses([]);
          setLoading(false);
        });
    } else {
      setPasses([]);
    }
  }, [selectedEmployee]);

  // Filter employees by Co Id
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const s = employeeSearch.trim().toLowerCase();
    return employees.filter(e => (e.coId || '').toLowerCase().includes(s));
  }, [employees, employeeSearch]);

  const handleEmployeeSelect = (id: string) => {
    const emp = employees.find(e => e._id === id);
    setSelectedEmployee(emp || null);
  };

  const handleOpen = (pass?: any) => {
    if (pass) {
      setEditing(pass);
      setForm({
        passType: pass.passType,
        passNumber: pass.passNumber,
        issuanceDate: pass.issuanceDate ? pass.issuanceDate.slice(0, 10) : '',
        expiryDate: pass.expiryDate ? pass.expiryDate.slice(0, 10) : '',
        certificate: undefined,
      });
    } else {
      setEditing(null);
      setForm({ passType: '', passNumber: '', issuanceDate: '', expiryDate: '', certificate: undefined });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ passType: '', passNumber: '', issuanceDate: '', expiryDate: '', certificate: undefined });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm({ ...form, certificate: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!selectedEmployee || !selectedEmployee._id) {
        setError('Please select an employee');
        setSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append('employee', selectedEmployee._id);
      formData.append('passType', form.passType);
      formData.append('passNumber', form.passNumber);
      formData.append('issuanceDate', form.issuanceDate);
      formData.append('expiryDate', form.expiryDate);
      if (form.certificate) formData.append('certificate', form.certificate);
      if (editing) {
        await api.put(`/employee-passes/${editing._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Pass updated!');
      } else {
        await api.post('/employee-passes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Pass added!');
      }
      setOpen(false);
      setEditing(null);
      setForm({ passType: '', passNumber: '', issuanceDate: '', expiryDate: '', certificate: undefined });
      // Refetch passes
      const res = await api.get('/employee-passes', { params: { employee: selectedEmployee._id } });
      setPasses(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/employee-passes/${deleteId}`);
      setSuccess('Pass deleted!');
      setDeleteId(null);
      // Refetch passes
      if (selectedEmployee && selectedEmployee._id) {
        const res = await api.get('/employee-passes', { params: { employee: selectedEmployee._id } });
        setPasses(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err: any) {
      setError('Failed to delete pass');
    }
  };

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Employee Passes Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage security passes and certificates for all employees
                  </Typography>
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total Employees',
                value: employees.length,
                icon: <PeopleIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Passes',
                value: passes.length,
                icon: <SecurityIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Active Passes',
                value: passes.filter(p => p.expiryDate && new Date(p.expiryDate) > new Date()).length,
                icon: <AssignmentIndIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              },
              {
                title: 'Expired Passes',
                value: passes.filter(p => p.expiryDate && new Date(p.expiryDate) <= new Date()).length,
                icon: <WarningIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
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

        {/* Employee Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              🔍 Search Employee by Co Id
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Co Id"
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
                sx={{ minWidth: 200 }}
                size="small"
              />
              <TextField
                select
                label="Select Employee"
                value={selectedEmployee?._id || ''}
                onChange={e => handleEmployeeSelect(e.target.value)}
                sx={{ minWidth: 300 }}
                size="small"
              >
                <MenuItem value="">Select Employee</MenuItem>
                {filteredEmployees.map(emp => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name} - {emp.coId || 'No Co Id'} ({emp.position})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Paper>
        </motion.div>
              {/* Selected Employee Passes Section */}
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1 }}>
                    👤 Passes for: {selectedEmployee.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Employee ID: {selectedEmployee.coId || 'No Co Id'} | Position: {selectedEmployee.position}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleOpen()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Add Pass
                </Button>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Table sx={{ 
                  '& .MuiTableCell-root': {
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Pass Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Pass Number</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Issuance Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Expiry Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Certificate</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {passes.map((pass, idx) => {
                      const isExpired = pass.expiryDate && new Date(pass.expiryDate) <= new Date();
                      return (
                        <TableRow 
                          key={pass._id} 
                          sx={{ 
                            background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8),
                            opacity: isExpired ? 0.7 : 1
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={pass.passType} 
                              size="small" 
                              color={isExpired ? 'error' : 'primary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{pass.passNumber}</TableCell>
                          <TableCell>{pass.issuanceDate ? new Date(pass.issuanceDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {pass.expiryDate ? new Date(pass.expiryDate).toLocaleDateString() : '-'}
                              {isExpired && (
                                <Chip 
                                  label="Expired" 
                                  size="small" 
                                  color="error" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {pass.certificate ? (
                              <Button 
                                variant="outlined" 
                                size="small" 
                                component="a" 
                                href={pass.certificate} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ borderColor: theme.palette.info.main, color: theme.palette.info.main }}
                              >
                                Download
                              </Button>
                            ) : (
                              <Typography variant="body2" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                color="primary" 
                                onClick={() => handleOpen(pass)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                  } 
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => setDeleteId(pass._id)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1) 
                                  } 
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </motion.div>
        )}
              {/* Add/Edit Pass Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: theme.shadows[24]
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
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {editing ? 'Edit Pass' : 'Add Pass'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {editing ? 'Update existing pass details' : 'Create new security pass'}
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
          
          <DialogContent sx={{ mt: 2, p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Pass Type"
                name="passType"
                value={form.passType}
                onChange={handleFormChange}
                required
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <MenuItem value="">Select Pass Type</MenuItem>
                {passTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
              <TextField
                label="Pass Number"
                name="passNumber"
                value={form.passNumber}
                onChange={handleFormChange}
                required
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Issuance Date"
                  name="issuanceDate"
                  value={form.issuanceDate}
                  onChange={handleFormChange}
                  type="date"
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
                <TextField
                  label="Expiry Date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleFormChange}
                  type="date"
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ 
                p: 2, 
                background: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                  📄 Certificate Upload
                </Typography>
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="certificate-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="certificate-upload">
                  <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderColor: theme.palette.info.main,
                      color: theme.palette.info.main,
                      '&:hover': {
                        borderColor: theme.palette.info.dark,
                        color: theme.palette.info.dark,
                      }
                    }}
                  >
                    {form.certificate ? (typeof form.certificate === 'string' ? 'Change Certificate' : form.certificate.name) : 'Upload Certificate'}
                  </Button>
                </label>
                {editing && editing.certificate && (
                  <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                    Existing: <a href={editing.certificate} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.info.main }}>Download</a>
                  </Typography>
                )}
              </Box>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    '& .MuiAlert-icon': {
                      color: theme.palette.error.main
                    }
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
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              gap: 2
            }}
          >
            <Button 
              onClick={handleClose} 
              disabled={submitting}
              variant="outlined"
              sx={{
                borderColor: theme.palette.text.secondary,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary" 
              disabled={submitting}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}
            >
              {submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </Dialog>
              {/* Delete Confirmation Dialog */}
        <Dialog 
          open={!!deleteId} 
          onClose={() => setDeleteId(null)}
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: theme.shadows[24]
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)`,
              color: theme.palette.error.main,
              borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                <DeleteIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Delete Pass
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, p: 3 }}>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
              Are you sure you want to delete this pass? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions 
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              gap: 2
            }}
          >
            <Button 
              onClick={() => setDeleteId(null)}
              variant="outlined"
              sx={{
                borderColor: theme.palette.text.secondary,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.6)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </AnimatePresence>
    </Box>
  );
};

export default EmployeePassesPage; 