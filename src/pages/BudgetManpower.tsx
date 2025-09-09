import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Snackbar,
  Avatar, useTheme, alpha, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

const defaultManpower = () => ({
  id: Date.now() + Math.random(),
  coId: '',
  employeeName: '',
  position: '',
  hiringDate: '',
  department: '',
  section: '',
  totalExperience: '',
  sponsor: '',
  basicSalary: '',
  allowance: '',
  proposedIncrementPercent: '',
  proposedIncrementAmount: '',
  totalSalary: '',
  indemnity: '',
  residenceFee: '',
  workmenComp: '',
  privateMedicalInsurance: '',
  socialSecurity: '',
  housing: '',
  carTransfer: '',
  petrolCard: '',
  mobileLine: '',
  ticket: '',
  totalMonthlyCost: '',
  lastIncrementAmount: '',
  lastIncrementDate: '',
  previousProposedIncrementPercent: '',
  previousProposedIncrementAmount: '',
  lastYearBonus: '',
  proposedBonus: '',
  required: '',
  start: '',
  end: '',
  apr: '',
  may: '',
  jun: '',
  jul: '',
  aug: '',
  sept: '',
  oct: '',
  nov: '',
  dec: '',
  jan: '',
  feb: '',
  mar: '',
  totalYearCost: ''
});

const BudgetManpower: React.FC = () => {
  const [manpowerList, setManpowerList] = useState([defaultManpower()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingManpower, setEditingManpower] = useState<any>(null);
  const [formData, setFormData] = useState(defaultManpower());

  const theme = useTheme();
  const pageColor = '#9c27b0';

  useEffect(() => {
    fetchManpower();
  }, []);

  const fetchManpower = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budget/manpower');
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length > 0) {
        setManpowerList(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch manpower data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManpower = () => {
    setEditingManpower(null);
    setFormData(defaultManpower());
    setOpenDialog(true);
  };

  const handleEditManpower = (manpower: any) => {
    setEditingManpower(manpower);
    setFormData(manpower);
    setOpenDialog(true);
  };

  const handleDeleteManpower = (id: number) => {
    if (manpowerList.length > 1) {
      setManpowerList(manpowerList.filter(manpower => manpower.id !== id));
    }
  };

  const handleSaveManpower = () => {
    if (editingManpower) {
      setManpowerList(manpowerList.map(manpower => 
        manpower.id === editingManpower.id ? { ...formData } : manpower
      ));
    } else {
      setManpowerList([...manpowerList, { ...formData, id: Date.now() + Math.random() }]);
    }
    setOpenDialog(false);
    setSuccess(editingManpower ? 'Manpower updated successfully!' : 'Manpower added successfully!');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return `${parseFloat(value).toLocaleString()} KWD`;
  };

  const getTotalYearCost = () => {
    return manpowerList.reduce((sum, manpower) => {
      return sum + (parseFloat(manpower.totalYearCost) || 0);
    }, 0);
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(pageColor, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
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
              background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
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
                    <Typography sx={{ fontSize: '2rem' }}>⚡</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Manpower
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Manage employee costs, salaries, and benefits by department
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddManpower}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Manpower
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Manpower Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(pageColor, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" sx={{ color: pageColor, fontWeight: 600, mb: 3 }}>
              📊 Manpower Overview
            </Typography>

            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {!loading && (
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ background: alpha(pageColor, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80, textAlign: 'center' }}>Co.ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 150 }}>Employee Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Hiring Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Section</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Experience</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Sponsor</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Basic Salary</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Allowance</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Proposed Increment %</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Proposed Increment Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Total Salary</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Indemnity</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Residence Fee</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Workmen Comp</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Medical Insurance</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Social Security</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Housing</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Car/Transfer</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Petrol Card</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Mobile Line</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Ticket</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Total Monthly Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Last Increment Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Last Increment Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Prev Proposed Increment %</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Prev Proposed Increment Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Last Year Bonus</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Proposed Bonus</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Required</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>Start</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100 }}>End</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Apr</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>May</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Jun</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Jul</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Aug</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Sept</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Oct</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Nov</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Dec</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Jan</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Feb</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 80 }}>Mar</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 120 }}>Total Year Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor, minWidth: 100, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manpowerList.map((manpower, index) => (
                      <TableRow 
                        key={manpower.id}
                        sx={{ 
                          '&:hover': {
                            background: alpha(pageColor, 0.02)
                          }
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {manpower.coId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {manpower.employeeName || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.position || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.hiringDate || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.department || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.section || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.totalExperience || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.sponsor || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.basicSalary)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.allowance)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.proposedIncrementPercent || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.proposedIncrementAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.totalSalary)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.indemnity)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.residenceFee)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.workmenComp)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.privateMedicalInsurance)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.socialSecurity)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.housing)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.carTransfer)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.petrolCard)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.mobileLine)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.ticket)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.totalMonthlyCost)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.lastIncrementAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.lastIncrementDate || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.previousProposedIncrementPercent || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.previousProposedIncrementAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.lastYearBonus)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.proposedBonus)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.required || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.start || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2">
                            {manpower.end || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.apr)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.may)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.jun)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.jul)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.aug)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.sept)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.oct)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.nov)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.dec)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.jan)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.feb)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.mar)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pageColor }}>
                            {formatCurrency(manpower.totalYearCost)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                              onClick={() => handleEditManpower(manpower)}
                              sx={{ 
                                color: pageColor,
                                '&:hover': { 
                                  bgcolor: alpha(pageColor, 0.1),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteManpower(manpower.id)}
                              disabled={manpowerList.length === 1}
                              sx={{ 
                                color: theme.palette.error.main,
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow sx={{ background: alpha(pageColor, 0.05) }}>
                      <TableCell colSpan={42} sx={{ fontWeight: 600, color: pageColor, textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: pageColor }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {formatCurrency(getTotalYearCost().toString())}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>

        {/* Add/Edit Manpower Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle sx={{ color: pageColor, fontWeight: 600 }}>
            {editingManpower ? 'Edit Manpower' : 'Add Manpower'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                <TextField
                  label="Co.ID"
                  value={formData.coId}
                  onChange={(e) => handleFormChange('coId', e.target.value)}
                  fullWidth
                  placeholder="Enter Co.ID..."
                />
                <TextField
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(e) => handleFormChange('employeeName', e.target.value)}
                  fullWidth
                  placeholder="Enter employee name..."
                />
                <TextField
                  label="Position"
                  value={formData.position}
                  onChange={(e) => handleFormChange('position', e.target.value)}
                  fullWidth
                  placeholder="Enter position..."
                />
                <TextField
                  label="Hiring Date"
                  value={formData.hiringDate}
                  onChange={(e) => handleFormChange('hiringDate', e.target.value)}
                  fullWidth
                  placeholder="Enter hiring date..."
                />
                <TextField
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  fullWidth
                  placeholder="Enter department..."
                />
                <TextField
                  label="Section"
                  value={formData.section}
                  onChange={(e) => handleFormChange('section', e.target.value)}
                  fullWidth
                  placeholder="Enter section..."
                />
                <TextField
                  label="Total Experience"
                  value={formData.totalExperience}
                  onChange={(e) => handleFormChange('totalExperience', e.target.value)}
                  fullWidth
                  placeholder="Enter experience..."
                />
                <TextField
                  label="Sponsor"
                  value={formData.sponsor}
                  onChange={(e) => handleFormChange('sponsor', e.target.value)}
                  fullWidth
                  placeholder="Enter sponsor..."
                />
                <TextField
                  label="Basic Salary"
                  value={formData.basicSalary}
                  onChange={(e) => handleFormChange('basicSalary', e.target.value)}
                  fullWidth
                  placeholder="Enter basic salary..."
                />
                <TextField
                  label="Allowance"
                  value={formData.allowance}
                  onChange={(e) => handleFormChange('allowance', e.target.value)}
                  fullWidth
                  placeholder="Enter allowance..."
                />
                <TextField
                  label="Proposed Increment %"
                  value={formData.proposedIncrementPercent}
                  onChange={(e) => handleFormChange('proposedIncrementPercent', e.target.value)}
                  fullWidth
                  placeholder="Enter increment %..."
                />
                <TextField
                  label="Proposed Increment Amount"
                  value={formData.proposedIncrementAmount}
                  onChange={(e) => handleFormChange('proposedIncrementAmount', e.target.value)}
                  fullWidth
                  placeholder="Enter increment amount..."
                />
                <TextField
                  label="Total Salary"
                  value={formData.totalSalary}
                  onChange={(e) => handleFormChange('totalSalary', e.target.value)}
                  fullWidth
                  placeholder="Enter total salary..."
                />
                <TextField
                  label="Indemnity"
                  value={formData.indemnity}
                  onChange={(e) => handleFormChange('indemnity', e.target.value)}
                  fullWidth
                  placeholder="Enter indemnity..."
                />
                <TextField
                  label="Residence Fee"
                  value={formData.residenceFee}
                  onChange={(e) => handleFormChange('residenceFee', e.target.value)}
                  fullWidth
                  placeholder="Enter residence fee..."
                />
                <TextField
                  label="Workmen Comp"
                  value={formData.workmenComp}
                  onChange={(e) => handleFormChange('workmenComp', e.target.value)}
                  fullWidth
                  placeholder="Enter workmen comp..."
                />
                <TextField
                  label="Private Medical Insurance"
                  value={formData.privateMedicalInsurance}
                  onChange={(e) => handleFormChange('privateMedicalInsurance', e.target.value)}
                  fullWidth
                  placeholder="Enter medical insurance..."
                />
                <TextField
                  label="Social Security"
                  value={formData.socialSecurity}
                  onChange={(e) => handleFormChange('socialSecurity', e.target.value)}
                  fullWidth
                  placeholder="Enter social security..."
                />
                <TextField
                  label="Housing"
                  value={formData.housing}
                  onChange={(e) => handleFormChange('housing', e.target.value)}
                  fullWidth
                  placeholder="Enter housing..."
                />
                <TextField
                  label="Car/Transfer"
                  value={formData.carTransfer}
                  onChange={(e) => handleFormChange('carTransfer', e.target.value)}
                  fullWidth
                  placeholder="Enter car/transfer..."
                />
                <TextField
                  label="Petrol Card"
                  value={formData.petrolCard}
                  onChange={(e) => handleFormChange('petrolCard', e.target.value)}
                  fullWidth
                  placeholder="Enter petrol card..."
                />
                <TextField
                  label="Mobile Line"
                  value={formData.mobileLine}
                  onChange={(e) => handleFormChange('mobileLine', e.target.value)}
                  fullWidth
                  placeholder="Enter mobile line..."
                />
                <TextField
                  label="Ticket"
                  value={formData.ticket}
                  onChange={(e) => handleFormChange('ticket', e.target.value)}
                  fullWidth
                  placeholder="Enter ticket..."
                />
                <TextField
                  label="Total Monthly Cost"
                  value={formData.totalMonthlyCost}
                  onChange={(e) => handleFormChange('totalMonthlyCost', e.target.value)}
                  fullWidth
                  placeholder="Enter total monthly cost..."
                />
                <TextField
                  label="Last Increment Amount"
                  value={formData.lastIncrementAmount}
                  onChange={(e) => handleFormChange('lastIncrementAmount', e.target.value)}
                  fullWidth
                  placeholder="Enter last increment amount..."
                />
                <TextField
                  label="Last Increment Date"
                  value={formData.lastIncrementDate}
                  onChange={(e) => handleFormChange('lastIncrementDate', e.target.value)}
                  fullWidth
                  placeholder="Enter last increment date..."
                />
                <TextField
                  label="Previous Proposed Increment %"
                  value={formData.previousProposedIncrementPercent}
                  onChange={(e) => handleFormChange('previousProposedIncrementPercent', e.target.value)}
                  fullWidth
                  placeholder="Enter previous increment %..."
                />
                <TextField
                  label="Previous Proposed Increment Amount"
                  value={formData.previousProposedIncrementAmount}
                  onChange={(e) => handleFormChange('previousProposedIncrementAmount', e.target.value)}
                  fullWidth
                  placeholder="Enter previous increment amount..."
                />
                <TextField
                  label="Last Year Bonus"
                  value={formData.lastYearBonus}
                  onChange={(e) => handleFormChange('lastYearBonus', e.target.value)}
                  fullWidth
                  placeholder="Enter last year bonus..."
                />
                <TextField
                  label="Proposed Bonus"
                  value={formData.proposedBonus}
                  onChange={(e) => handleFormChange('proposedBonus', e.target.value)}
                  fullWidth
                  placeholder="Enter proposed bonus..."
                />
                <TextField
                  label="Required"
                  value={formData.required}
                  onChange={(e) => handleFormChange('required', e.target.value)}
                  fullWidth
                  placeholder="Enter required..."
                />
                <TextField
                  label="Start"
                  value={formData.start}
                  onChange={(e) => handleFormChange('start', e.target.value)}
                  fullWidth
                  placeholder="Enter start..."
                />
                <TextField
                  label="End"
                  value={formData.end}
                  onChange={(e) => handleFormChange('end', e.target.value)}
                  fullWidth
                  placeholder="Enter end..."
                />
                <TextField
                  label="Apr"
                  value={formData.apr}
                  onChange={(e) => handleFormChange('apr', e.target.value)}
                  fullWidth
                  placeholder="Enter Apr..."
                />
                <TextField
                  label="May"
                  value={formData.may}
                  onChange={(e) => handleFormChange('may', e.target.value)}
                  fullWidth
                  placeholder="Enter May..."
                />
                <TextField
                  label="Jun"
                  value={formData.jun}
                  onChange={(e) => handleFormChange('jun', e.target.value)}
                  fullWidth
                  placeholder="Enter Jun..."
                />
                <TextField
                  label="Jul"
                  value={formData.jul}
                  onChange={(e) => handleFormChange('jul', e.target.value)}
                  fullWidth
                  placeholder="Enter Jul..."
                />
                <TextField
                  label="Aug"
                  value={formData.aug}
                  onChange={(e) => handleFormChange('aug', e.target.value)}
                  fullWidth
                  placeholder="Enter Aug..."
                />
                <TextField
                  label="Sept"
                  value={formData.sept}
                  onChange={(e) => handleFormChange('sept', e.target.value)}
                  fullWidth
                  placeholder="Enter Sept..."
                />
                <TextField
                  label="Oct"
                  value={formData.oct}
                  onChange={(e) => handleFormChange('oct', e.target.value)}
                  fullWidth
                  placeholder="Enter Oct..."
                />
                <TextField
                  label="Nov"
                  value={formData.nov}
                  onChange={(e) => handleFormChange('nov', e.target.value)}
                  fullWidth
                  placeholder="Enter Nov..."
                />
                <TextField
                  label="Dec"
                  value={formData.dec}
                  onChange={(e) => handleFormChange('dec', e.target.value)}
                  fullWidth
                  placeholder="Enter Dec..."
                />
                <TextField
                  label="Jan"
                  value={formData.jan}
                  onChange={(e) => handleFormChange('jan', e.target.value)}
                  fullWidth
                  placeholder="Enter Jan..."
                />
                <TextField
                  label="Feb"
                  value={formData.feb}
                  onChange={(e) => handleFormChange('feb', e.target.value)}
                  fullWidth
                  placeholder="Enter Feb..."
                />
                <TextField
                  label="Mar"
                  value={formData.mar}
                  onChange={(e) => handleFormChange('mar', e.target.value)}
                  fullWidth
                  placeholder="Enter Mar..."
                />
                <TextField
                  label="Total Year Cost"
                  value={formData.totalYearCost}
                  onChange={(e) => handleFormChange('totalYearCost', e.target.value)}
                  fullWidth
                  placeholder="Enter total year cost..."
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveManpower}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${pageColor} 100%)`,
                }
              }}
            >
              {editingManpower ? 'Update' : 'Add'} Manpower
            </Button>
          </DialogActions>
        </Dialog>
      </AnimatePresence>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetManpower;
