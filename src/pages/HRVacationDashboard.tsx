import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, TextField, MenuItem, Drawer, IconButton, Checkbox, Snackbar, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import VacationAnalytics from '../components/VacationAnalytics';
import VacationCalendar from '../components/VacationCalendar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Add Leave and Employee interfaces at the top (after imports)
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

interface Employee {
  _id: string;
  name: string;
  department?: string;
}

const leaveTypes = ['Annual', 'Sick', 'Emergency', 'Unpaid'];
const departments = ['Logistics', 'Finance', 'IT', 'HR'];
const statuses = ['Pending', 'Approved', 'Rejected'];

const HRVacationDashboard: React.FC = () => {
  const [filters, setFilters] = useState({ type: '', department: '', status: '', employee: '', date: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<{ open: boolean; leave: Leave | null }>({ open: false, leave: null });
  const [snackbar, setSnackbar] = useState('');
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all leaves and employees (with filters)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.department) params.append('department', filters.department);
        if (filters.status) params.append('status', filters.status);
        if (filters.employee) params.append('employee', filters.employee);
        // Fetch leaves
        const leavesRes = await axios.get(`/leave?${params.toString()}`);
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data as Leave[] : []);
        // Fetch employees
        const empRes = await axios.get('/employees');
        setEmployees(Array.isArray(empRes.data) ? empRes.data as Employee[] : []);
      } catch (err) {
        setError('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  // Approve leave
  async function handleApprove(id: string) {
    try {
      await axios.post(`/leave/${id}/approve`);
      setSnackbar('Request approved!');
      // Refetch leaves
      const res = await axios.get('/leave');
      setLeaves(Array.isArray(res.data) ? res.data as Leave[] : []);
    } catch (err) {
      setSnackbar('Failed to approve request');
    }
  }

  // Reject leave
  async function handleReject(id: string) {
    try {
      await axios.post(`/leave/${id}/reject`);
      setSnackbar('Request rejected!');
      // Refetch leaves
      const res = await axios.get('/leave');
      setLeaves(Array.isArray(res.data) ? res.data as Leave[] : []);
    } catch (err) {
      setSnackbar('Failed to reject request');
    }
  }

  const filteredLeaves = leaves.filter(l =>
    (!filters.type || l.type === filters.type) &&
    (!filters.department || l.department === filters.department) &&
    (!filters.status || l.status === filters.status) &&
    (!filters.employee || l.employee.name.toLowerCase().includes(filters.employee.toLowerCase()))
  );

  const handleBulk = (action: 'approve' | 'reject') => {
    setSnackbar(`${action === 'approve' ? 'Approved' : 'Rejected'} ${selected.length} requests!`);
    setSelected([]);
  };

  // Helper: Map leaves to events for VacationCalendar
  const calendarEvents = leaves.map(l => ({
    date: l.startDate,
    name: l.employee.name,
    type: l.type,
    status: l.status,
  }));

  // Helper: Analytics data for VacationAnalytics
  const barData = (() => {
    // Group leaves by month
    const map = new Map<string, number>();
    leaves.forEach(l => {
      const month = new Date(l.startDate).toLocaleString('default', { month: 'short' });
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from(map.entries()).map(([month, leaves]) => ({ month, leaves }));
  })();

  const pieData = (() => {
    // Group leaves by type
    const map = new Map<string, number>();
    leaves.forEach(l => {
      map.set(l.type, (map.get(l.type) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  })();

  const lineData: { month: string; burnout: number }[] = [];
  // Optionally, you can compute a burnout risk metric if you have the data

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafdff', pb: 4 }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" mb={2}>HR Vacation Management</Typography>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', position: 'relative' }}>
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
            onClick={() => navigate('/vacation')}
          >
            Employee Vacation
          </Button>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField select label="Type" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} sx={{ minWidth: 120 }}><MenuItem value="">All</MenuItem>{leaveTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
            <TextField select label="Department" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} sx={{ minWidth: 120 }}><MenuItem value="">All</MenuItem>{departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
            <TextField select label="Status" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} sx={{ minWidth: 120 }}><MenuItem value="">All</MenuItem>{statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
            <TextField label="Employee" value={filters.employee} onChange={e => setFilters(f => ({ ...f, employee: e.target.value }))} sx={{ minWidth: 140 }} />
            <Button startIcon={<FilterAltIcon />} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Filter</Button>
          </Box>
        </Paper>
      </motion.div>
      <Divider sx={{ my: 3, borderColor: '#e3e8ee' }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" color="text.primary" fontWeight={700}><GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Leave Requests</Typography>
            <Box display="flex" gap={1}>
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} disabled={selected.length === 0} onClick={() => handleBulk('approve')} sx={{ borderRadius: 2, fontWeight: 600 }}>Bulk Approve</Button>
              <Button variant="contained" color="error" startIcon={<CancelIcon />} disabled={selected.length === 0} onClick={() => handleBulk('reject')} sx={{ borderRadius: 2, fontWeight: 600 }}>Bulk Reject</Button>
            </Box>
          </Box>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ background: '#f5f6fa' }}>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}> </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Dates</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Approver</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Notes</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Loading leave requests...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" color="error">{error}</TableCell>
                  </TableRow>
                ) : filteredLeaves.map((l, idx) => (
                  <TableRow 
                    key={l._id} 
                    sx={{ background: idx % 2 === 0 ? '#fafdff' : '#fff', cursor: 'pointer' }} 
                    onClick={() => setDrawer({ open: true, leave: l })}
                  >
                    <TableCell><Checkbox checked={selected.includes(l._id)} onChange={e => setSelected(sel => e.target.checked ? [...sel, l._id] : sel.filter(id => id !== l._id))} onClick={e => e.stopPropagation()} /></TableCell>
                    <TableCell>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', display: 'inline-flex' }}>{l.employee.name[0]}</Avatar> {l.employee.name}
                    </TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 400 }}>{l.type}</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 400 }}>{l.startDate} - {l.endDate}</TableCell>
                    <TableCell>
                      <Chip label={l.status} color={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'error' : 'warning'} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 400 }}>{l.approvedBy?.name || '-'}</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 400 }}>{l.notes || '-'}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={e => { e.stopPropagation(); setDrawer({ open: true, leave: l }); }} sx={{ borderRadius: 2, fontWeight: 600 }}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
      <Divider sx={{ my: 3, borderColor: '#e3e8ee' }} />
      {/* Side Panel Drawer for Quick Review/Approval */}
      <Drawer anchor="right" open={drawer.open} onClose={() => setDrawer({ open: false, leave: null })} PaperProps={{ sx: { width: 400, background: '#fff' } }}>
        {drawer.leave && (
          <Box p={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" color="text.primary">Review Request</Typography>
              <IconButton onClick={() => setDrawer({ open: false, leave: null })} sx={{ color: 'text.primary' }}><CloseIcon /></IconButton>
            </Box>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mb: 2 }}>{drawer.leave.employee.name[0]}</Avatar>
            <Typography variant="subtitle1" color="text.secondary">{drawer.leave.employee.name}</Typography>
            <Typography variant="body2" color="text.primary" mb={1}>Type: {drawer.leave.type}</Typography>
            <Typography variant="body2" color="text.primary" mb={1}>Dates: {drawer.leave.startDate} - {drawer.leave.endDate}</Typography>
            <Typography variant="body2" color="text.primary" mb={1}>Department: {drawer.leave.department}</Typography>
            <Typography variant="body2" color="text.primary" mb={1}>Notes: {drawer.leave.notes}</Typography>
            <Box mt={3} display="flex" gap={1}>
              <Button variant="contained" color="success" onClick={() => drawer.leave && handleApprove(drawer.leave._id)} disabled={!drawer.leave}>Approve</Button>
              <Button variant="contained" color="error" onClick={() => drawer.leave && handleReject(drawer.leave._id)} disabled={!drawer.leave}>Reject</Button>
            </Box>
            <Box mt={4}>
              <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
              <Paper sx={{ p: 2, mt: 1, background: 'rgba(50,50,100,0.95)' }}>
                <Typography variant="body2" color="text.primary">Requested: {drawer.leave.requestedAt}</Typography>
                <Typography variant="body2" color="text.primary">Reviewed: {drawer.leave.approvedAt || '-'}</Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Drawer>
      {/* Leave Heatmap & Analytics */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
        <Box display="flex" gap={3} flexWrap="wrap" mt={4}>
          <Box flex={2} minWidth={400}>
            <VacationCalendar role="hr" events={calendarEvents} />
          </Box>
          <Box flex={1} minWidth={320}>
            <VacationAnalytics barData={barData} pieData={pieData} lineData={lineData} />
            <Paper sx={{ p: 2, mt: 3, background: '#fff', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">AI Suggestion</Typography>
              <Typography variant="body2" fontWeight={400} color="text.secondary">Consider staggering leaves for Team A in Q4 to avoid low coverage.</Typography>
            </Paper>
            <Paper sx={{ p: 2, mt: 3, background: '#fafdff', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">Notify Manager</Typography>
              <Button variant="contained" sx={{ mt: 1, background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)', color: '#fff', borderRadius: 2, fontWeight: 600, '&:hover': { background: 'linear-gradient(90deg, #1976d2 0%, #21cbf3 100%)' } }}>Send Slack/Teams Notification</Button>
            </Paper>
          </Box>
        </Box>
      </motion.div>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    </Box>
  );
};

export default HRVacationDashboard; 