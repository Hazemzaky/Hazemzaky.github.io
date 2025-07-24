import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Avatar, CircularProgress, useTheme, Snackbar, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import VacationRequestModal from '../components/VacationRequestModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VacationCalendar from '../components/VacationCalendar';

// THEME: Bright, clean, readable, blue-accented
// Placeholder for AI suggestions and sentiment tracker
const AISuggestion = () => (
  <Paper sx={{ p: 2, mt: 2, background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)', color: 'white', borderRadius: 3 }}>
    <Typography variant="subtitle1" fontWeight={600}>AI Suggestion</Typography>
    <Typography variant="body2">Next week has low workload and a public holiday. Consider taking a break!</Typography>
  </Paper>
);

const SentimentTracker = () => (
  <Paper sx={{ p: 2, mt: 2, borderRadius: 3 }}>
    <Typography variant="subtitle2" fontWeight={600}>How are you feeling today?</Typography>
    <Box display="flex" gap={1} mt={1}>
      <Button variant="outlined">😃</Button>
      <Button variant="outlined">🙂</Button>
      <Button variant="outlined">😐</Button>
      <Button variant="outlined">😟</Button>
      <Button variant="outlined">😫</Button>
    </Box>
  </Paper>
);

// Add Leave interface at the top (after imports)
interface Leave {
  _id: string;
  employee: { _id: string; name: string };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  cost: number;
  status: string;
  approvedBy?: { _id: string; name: string };
  requestedAt: string;
  approvedAt?: string;
  department?: string;
  notes?: string;
}

const VacationDashboard: React.FC = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const navigate = useNavigate();

  // Assume userId is available (e.g., from localStorage)
  const userId = localStorage.getItem('userId');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [leaveBalanceDetails, setLeaveBalanceDetails] = useState({ vacation: 0, sick: 0, personal: 0, other: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user leaves and balance
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Fetch leaves
        const leavesRes = await axios.get(`/leave?employee=${userId}`);
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data as Leave[] : []);
        // Fetch employee info
        const empRes = await axios.get(`/employees/${userId}`);
        const emp = empRes.data as { leaveBalance: number; leaveBalanceDetails?: { vacation: number; sick: number; personal: number; other: number } };
        setLeaveBalance(emp.leaveBalance);
        setLeaveBalanceDetails(emp.leaveBalanceDetails || { vacation: 0, sick: 0, personal: 0, other: 0 });
      } catch (err) {
        setError('Failed to load vacation data');
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchData();
  }, [userId]);

  // Submit vacation request
  async function handleVacationRequest(formData: {
    type: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    try {
      await axios.post('/leave', formData);
      setSnackbar('Vacation request submitted!');
      // Refetch leaves and balance
      const leavesRes = await axios.get(`/leave?employee=${userId}`);
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data as Leave[] : []);
      const empRes = await axios.get(`/employees/${userId}`);
      const emp = empRes.data as { leaveBalance: number; leaveBalanceDetails?: { vacation: number; sick: number; personal: number; other: number } };
      setLeaveBalance(emp.leaveBalance);
      setLeaveBalanceDetails(emp.leaveBalanceDetails || { vacation: 0, sick: 0, personal: 0, other: 0 });
    } catch (err) {
      setSnackbar('Failed to submit request');
    }
  }

  // Map leaves to events for VacationCalendar
  const calendarEvents = leaves.map(l => ({
    date: l.startDate,
    name: l.employee?.name || '',
    type: l.type,
    status: l.status,
  }));

  // Instead, use leaveBalance and leaveBalanceDetails from backend:
  const totalVacation = leaveBalanceDetails.vacation || 0;
  const percent = totalVacation > 0 ? (leaveBalance / totalVacation) * 100 : 0;
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#fafdff',
      pb: 4
    }}>
      {/* Greeting Card */}
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 4, mb: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', position: 'relative' }}>
        <Button
          variant="contained"
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
            zIndex: 2,
            '&:hover': {
              background: 'linear-gradient(90deg, #1976d2 0%, #21cbf3 100%)',
            }
          }}
          onClick={() => navigate('/vacation/hr')}
        >
          HR Vacation Management
        </Button>
        <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: 'primary.main' }}>
          {/* Optionally show first letter of user name if available from backend */}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={700} color="text.primary">{greeting} <span role="img" aria-label="wave">👋</span></Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
            Welcome to your Vacation Dashboard
          </Typography>
        </Box>
        <Box>
          {new Date().getHours() < 18 ? <WbSunnyIcon sx={{ color: '#ffd600', fontSize: 32 }} /> : <NightlightIcon sx={{ color: '#90caf9', fontSize: 32 }} />}
        </Box>
      </Paper>
      <Divider sx={{ my: 3, borderColor: '#e3e8ee' }} />
      {/* Leave Balance Widget */}
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 4, mb: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box position="relative" display="inline-flex" mr={3}>
          <CircularProgress variant="determinate" value={percent} size={80} thickness={5} sx={{ color: percent < 30 ? 'error.main' : 'primary.main' }} />
          <Box position="absolute" top={0} left={0} width={80} height={80} display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h5" color="text.primary">{leaveBalance}</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">Vacation Balance</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={400}>{leaveBalance} of {totalVacation} days left</Typography>
        </Box>
      </Paper>
      <Divider sx={{ my: 3, borderColor: '#e3e8ee' }} />
      {/* Calendar + Request Button */}
      <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700} color="text.primary"><CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Your Vacation Calendar</Typography>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, fontWeight: 600, background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(33,150,243,0.08)', '&:hover': { background: 'linear-gradient(90deg, #1976d2 0%, #21cbf3 100%)' } }} onClick={() => setOpenModal(true)}>
            Request Vacation
          </Button>
        </Box>
        <VacationCalendar role="employee" events={calendarEvents} />
      </Paper>
      <Divider sx={{ my: 3, borderColor: '#e3e8ee' }} />
      {/* AI Suggestion & Sentiment Tracker */}
      {/* <AISuggestion /> */}
      {/* <SentimentTracker /> */}
      {/* Vacation Request Modal */}
      <VacationRequestModal open={openModal} onClose={() => setOpenModal(false)} onSuccess={() => { setSnackbar('Vacation request submitted!'); setOpenModal(false); }} />
      {/* Snackbar */}
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    </Box>
  );
};

export default VacationDashboard; 