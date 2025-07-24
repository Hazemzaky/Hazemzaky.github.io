import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { getBusinessTripById } from '../services/businessTripApi';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { updateBusinessTrip } from '../services/businessTripApi';
import Snackbar from '@mui/material/Snackbar';
import api from '../apiBase';
import { FaSuitcaseRolling } from 'react-icons/fa';
import { motion } from 'framer-motion';
import FlightIcon from '@mui/icons-material/Flight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Avatar from '@mui/material/Avatar';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinearProgress from '@mui/material/LinearProgress';

const ViewTripPage: React.FC = () => {
  const { id } = useParams();
  const [tab, setTab] = React.useState(0);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  // Move saving state up here to avoid conditional hook call
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/employees');
        const data = res.data as any;
        setEmployees(Array.isArray(data.employees) ? data.employees : data);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  function getEmployeeName(employeeId: string) {
    const emp = employees.find((e: any) => e._id === employeeId);
    return emp ? emp.name : '';
  }

  // Add state for tab-specific editing
  const [expenses, setExpenses] = useState(trip?.expenses || []);
  const [claimSheet, setClaimSheet] = useState<File | null>(null);
  const [requestedAmount, setRequestedAmount] = useState(trip?.requestedAmount || '');
  const [allowedAmount, setAllowedAmount] = useState(trip?.allowedAmount || '');
  const [financeApproved, setFinanceApproved] = useState(trip?.financeApproved || false);
  const [financeComment, setFinanceComment] = useState(trip?.financeComment || '');
  const [approvalComments, setApprovalComments] = useState(trip?.approvalComments || {
    manager: '',
    hr: '',
    dceo: '',
    gceo: '',
  });
  const [postTripSummary, setPostTripSummary] = useState<File | null>(null);
  const [boardingPass, setBoardingPass] = useState<File | null>(null);
  const [signedClaimForm, setSignedClaimForm] = useState<File | null>(null);

  // Expenses tab handlers
  const handleAddReceipt = async (type: string, file: File) => {
    await updateTrip({ expenses: [...expenses, { type, name: file.name }] }, { [`receipt_${type}`]: file });
  };
  const handleRemoveReceipt = (idx: number) => {
    setExpenses(expenses.filter((_: any, i: number) => i !== idx));
  };
  const handleClaimSheetChange = async (file: File) => {
    await updateTrip({}, { claimSheet: file });
  };
  // Local state for other fields, update only on Save
  const handleRequestedAmountChange = (value: string) => setRequestedAmount(value);
  const handleAllowedAmountChange = (value: string) => setAllowedAmount(value);
  const handleFinanceApprovedChange = (value: boolean) => setFinanceApproved(value);
  const handleFinanceCommentChange = (value: string) => setFinanceComment(value);

  // Approvals tab handler (backend)
  const handleApprovalCommentChange = (key: string, value: string) => {
    setApprovalComments((prev: any) => ({ ...prev, [key]: value }));
  };

  // Attachments tab handlers (backend)
  const handleAttachmentUpload = async (setter: (f: File | null) => void, key: string, file: File) => {
    await updateTrip({}, { [key]: file });
    setter(file);
  };
  const handleRemoveAttachment = async (setter: (f: File | null) => void, key: string) => {
    await updateTrip({ [key]: null });
    setter(null);
  };

  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Helper to update trip and refetch
  const updateTrip = async (data: any, files?: { [key: string]: File | null }) => {
    if (!trip?._id) return;
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      if (files) {
        Object.entries(files).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });
      }
      await updateBusinessTrip(trip._id, formData);
      setSnackbar({ open: true, message: 'Trip updated successfully', severity: 'success' });
      // Refetch trip
      const res = await getBusinessTripById(trip._id);
      setTrip(res.data);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Update failed', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await getBusinessTripById(id);
        setTrip(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trip');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" mt={8}><Typography color="error">{error}</Typography></Box>;
  if (!trip) return null;

  // Save handlers for each tab
  const handleSaveExpenses = async () => {
    setSaving(true);
    await updateTrip({
      expenses,
      requestedAmount,
      allowedAmount,
      financeApproved,
      financeComment,
    });
    setSaving(false);
  };
  const handleSaveApprovals = async () => {
    setSaving(true);
    await updateTrip({ approvalComments });
    setSaving(false);
  };
  // Attachments are still uploaded immediately

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 40%, #a1c4fd 100%)',
      backgroundAttachment: 'fixed',
      py: { xs: 2, md: 6 },
      px: { xs: 0, md: 0 },
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    }}>
      <Paper
        sx={{
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          p: { xs: 2, md: 4 },
          borderRadius: 6,
          boxShadow: '0 8px 40px 0 rgba(76,110,245,0.10)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 60%, rgba(118,75,162,0.12) 100%)',
          backdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
        elevation={0}
      >
      {/* Animated Trip Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        style={{ position: 'absolute', top: 24, right: 32, zIndex: 1, opacity: 0.12 }}
      >
        {FaSuitcaseRolling({ size: 180, color: "#764ba2" })}
      </motion.div>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={3} mb={3}>
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', boxShadow: 3 }}>
            <FlightIcon sx={{ fontSize: 44, color: 'white' }} />
          </Avatar>
        </motion.div>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(90deg, #1976d2 30%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 0.5
          }}>Business Trip Details</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={trip.status}
              sx={{
                fontWeight: 700,
                fontSize: 16,
                px: 2.5,
                py: 1,
                background: trip.status === 'Approved'
                  ? 'linear-gradient(90deg, #42e695 0%, #3bb2b8 100%)'
                  : trip.status === 'Completed'
                  ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)'
                  : trip.status === 'Under Review'
                  ? 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)'
                  : trip.status === 'Rejected'
                  ? 'linear-gradient(90deg, #f85032 0%, #e73827 100%)'
                  : trip.status === 'Reimbursed'
                  ? 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)'
                  : 'linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)',
                color: 'white',
                boxShadow: 2,
                borderRadius: 2,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            />
            <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
              Trip ID: {trip._id}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Info Bar */}
      <Box display="flex" flexWrap="wrap" gap={4} mb={4}>
        <Box minWidth={220}>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={0.5}>
            <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {trip.airportOrCity || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            <EventIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
            {trip.departureDate} → {trip.returnDate}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            <AttachMoneyIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
            Per Diem: <b>KD {trip.perDiem}</b>
          </Typography>
        </Box>
        <Box minWidth={220}>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={0.5}>
            Employee: {getEmployeeName(trip.employee) || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Trip Type: {trip.tripType}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Region: {trip.region}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Country: {trip.country || '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Flight Class: {trip.flightClass}
          </Typography>
        </Box>
      </Box>
      <Tabs
        value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}
        TabIndicatorProps={{
          style: {
            background: 'linear-gradient(90deg, #1976d2 0%, #764ba2 100%)',
            height: 4,
            borderRadius: 2,
          }
        }}
      >
        <Tab icon={<AttachMoneyIcon sx={{ mr: 1 }} />} iconPosition="start" label="Expenses" />
        <Tab icon={<EventIcon sx={{ mr: 1 }} />} iconPosition="start" label="Approvals" />
        <Tab icon={<FlightIcon sx={{ mr: 1 }} />} iconPosition="start" label="Attachments" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <Typography variant="h6" mb={2} sx={{ fontWeight: 700, color: 'primary.main' }}>Reimbursable Expenses</Typography>
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Box sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)',
              boxShadow: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              flexWrap: 'wrap',
            }}>
              <CheckCircleIcon color={financeApproved ? 'success' : 'disabled'} sx={{ fontSize: 40 }} />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  Total Receipts: {expenses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requested: <b>KD {requestedAmount || 0}</b> &nbsp; | &nbsp; Allowed: <b>KD {allowedAmount || 0}</b>
                </Typography>
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={financeApproved ? 100 : 60}
                    sx={{ height: 8, borderRadius: 2, background: '#e3e3e3', '& .MuiLinearProgress-bar': { background: financeApproved ? '#43cea2' : '#1976d2' } }}
                  />
                </Box>
              </Box>
              <Chip
                label={financeApproved ? 'Finance Approved' : 'Pending Approval'}
                color={financeApproved ? 'success' : 'warning'}
                sx={{ fontWeight: 700, fontSize: 16, px: 2, py: 1, borderRadius: 2 }}
              />
            </Box>
          </motion.div>
          {/* Upload Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {['Visa', 'Taxi', 'Insurance', 'Meeting Costs'].map(type => (
              <motion.div
                key={type}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                style={{ display: 'inline-block' }}
              >
                <Button variant="outlined" component="label" size="small" startIcon={<InsertDriveFileIcon />} sx={{ borderRadius: 2, fontWeight: 600 }}>
                  Upload {type} Receipt
                  <input type="file" hidden onChange={e => e.target.files && handleAddReceipt(type, e.target.files[0])} />
                </Button>
              </motion.div>
            ))}
          </Box>
          {/* Receipts List */}
          <Box mt={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {expenses.length === 0 ? (
              <Typography>No receipts uploaded.</Typography>
            ) : (
              expenses.map((r: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ scale: 1.04, boxShadow: '0 4px 24px rgba(25,118,210,0.10)' }}
                  style={{ display: 'inline-block', minWidth: 220 }}
                >
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(25,118,210,0.07)',
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1,
                  }}>
                    <InsertDriveFileIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.type}</Typography>
                    </Box>
                    <motion.div whileTap={{ scale: 0.85 }}>
                      <Button size="small" color="error" variant="outlined" sx={{ borderRadius: 2 }} onClick={() => handleRemoveReceipt(idx)}>
                        Remove
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>
              ))
            )}
          </Box>
          {/* Claim Sheet Upload */}
          <Box mt={2}>
            <Button variant="outlined" component="label" size="small" startIcon={<InsertDriveFileIcon />} sx={{ borderRadius: 2, fontWeight: 600 }}>
              Upload Claim Sheet
              <input type="file" hidden onChange={e => e.target.files && handleClaimSheetChange(e.target.files[0])} />
            </Button>
            {claimSheet && <Typography variant="body2" sx={{ ml: 2 }}>{claimSheet.name}</Typography>}
          </Box>
          {/* Amounts and Finance Controls */}
          <Box mt={2} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label="Requested Amount" type="number" value={requestedAmount} onChange={e => handleRequestedAmountChange(e.target.value)} sx={{ minWidth: 180 }} />
            <TextField label="Allowed Amount" type="number" value={allowedAmount} onChange={e => handleAllowedAmountChange(e.target.value)} sx={{ minWidth: 180 }} />
          </Box>
          <Box mt={2}>
            <FormControlLabel control={<Checkbox checked={financeApproved} onChange={e => handleFinanceApprovedChange(e.target.checked)} />} label="Finance Approved" />
            <TextField label="Finance Comment" value={financeComment} onChange={e => handleFinanceCommentChange(e.target.value)} fullWidth multiline minRows={2} sx={{ mt: 1 }} />
          </Box>
          {/* Animated Save Button */}
          <Box mt={3}>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button variant="contained" color="primary" onClick={handleSaveExpenses} disabled={saving} sx={{ borderRadius: 3, fontWeight: 700, px: 4, py: 1.5, fontSize: 18 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </motion.div>
          </Box>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" mb={2}>Approval Workflow</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {['manager', 'hr', 'dceo', 'gceo'].map(key => (
              <Box key={key} sx={{ minWidth: 220 }}>
                <Typography variant="subtitle2">{key.toUpperCase()}</Typography>
                <TextField
                  label="Comment / Feedback"
                  value={approvalComments[key]}
                  onChange={e => handleApprovalCommentChange(key, e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Box>
          <Box mt={3}>
            <Button variant="contained" color="primary" onClick={handleSaveApprovals} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      )}
      {tab === 2 && (
        <Box>
          <Typography variant="h6" mb={2}>Attachments</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Button variant="outlined" component="label" size="small">
                Upload Post-Trip Summary
                <input type="file" hidden onChange={e => e.target.files && handleAttachmentUpload(setPostTripSummary, 'postTripSummary', e.target.files[0])} />
              </Button>
              {postTripSummary && <Typography variant="body2">{postTripSummary.name} <Button size="small" color="error" onClick={() => handleRemoveAttachment(setPostTripSummary, 'postTripSummary')}>Remove</Button></Typography>}
            </Box>
            <Box>
              <Button variant="outlined" component="label" size="small">
                Upload Boarding Pass
                <input type="file" hidden onChange={e => e.target.files && handleAttachmentUpload(setBoardingPass, 'boardingPass', e.target.files[0])} />
              </Button>
              {boardingPass && <Typography variant="body2">{boardingPass.name} <Button size="small" color="error" onClick={() => handleRemoveAttachment(setBoardingPass, 'boardingPass')}>Remove</Button></Typography>}
            </Box>
            <Box>
              <Button variant="outlined" component="label" size="small">
                Upload Signed Claim Form
                <input type="file" hidden onChange={e => e.target.files && handleAttachmentUpload(setSignedClaimForm, 'signedClaimForm', e.target.files[0])} />
              </Button>
              {signedClaimForm && <Typography variant="body2">{signedClaimForm.name} <Button size="small" color="error" onClick={() => handleRemoveAttachment(setSignedClaimForm, 'signedClaimForm')}>Remove</Button></Typography>}
            </Box>
          </Box>
        </Box>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} ContentProps={{ style: { background: snackbar.severity === 'success' ? '#43a047' : '#e53935', color: '#fff' } }} />
    </Paper>
    </Box>
  );
};

export default ViewTripPage; 