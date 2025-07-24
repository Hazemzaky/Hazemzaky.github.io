import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, TextField, Alert, CircularProgress } from '@mui/material';
import api from '../apiBase';

interface Period {
  _id: string;
  period: string;
  closed: boolean;
  closedAt?: string;
  closedBy?: string;
}

const PeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [closedPeriods, setClosedPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPeriod, setNewPeriod] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeriods();
    fetchClosedPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await api.get<Period[]>('/periods');
      setPeriods(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError('Failed to fetch periods');
    }
  };

  const fetchClosedPeriods = async () => {
    try {
      const response = await api.get<Period[]>('/periods/closed');
      setClosedPeriods(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const closePeriod = async () => {
    if (!newPeriod) return;
    try {
      await api.post('/periods/close', { period: newPeriod, closedBy: 'admin' });
      setNewPeriod('');
      fetchPeriods();
      fetchClosedPeriods();
    } catch (error) {
      setError('Failed to close period');
    }
  };

  const openPeriod = async (period: string) => {
    try {
      await api.put(`/periods/${period}/open`);
      fetchPeriods();
      fetchClosedPeriods();
    } catch (error) {
      setError('Failed to open period');
    }
  };

  const openCount = periods.filter(p => !p.closed).length;
  const closedCount = periods.filter(p => p.closed).length;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={3}>Period Management</Typography>
      {/* Summary Widget */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4, background: '#fafdff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">Total: {periods.length}</Typography>
          <Chip label={`Open: ${openCount}`} color="success" sx={{ fontWeight: 600 }} />
          <Chip label={`Closed: ${closedCount}`} color="error" sx={{ fontWeight: 600 }} />
        </Box>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {/* Close Period Form */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Close Period</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            type="month"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
            label="Period (YYYY-MM)"
            size="small"
            sx={{ minWidth: 180 }}
          />
          <Button variant="contained" color="error" onClick={closePeriod} sx={{ fontWeight: 600, borderRadius: 2 }}>
            Close Period
          </Button>
        </Box>
      </Paper>
      {/* Closed Periods */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Closed Periods</Typography>
        {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}><CircularProgress /></Box> : closedPeriods.length === 0 ? (
          <Typography color="text.secondary">No closed periods found.</Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {closedPeriods.map((period) => (
              <Box key={period._id} display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="#fff5f5" borderRadius={2} border="1px solid #ffcdd2">
                <Box>
                  <Typography fontWeight={600}>{period.period}</Typography>
                  <Typography variant="caption" color="text.secondary" ml={1}>
                    Closed by: {period.closedBy} on {period.closedAt ? new Date(period.closedAt).toLocaleDateString() : ''}
                  </Typography>
                </Box>
                <Button variant="contained" color="success" size="small" onClick={() => openPeriod(period.period)} sx={{ fontWeight: 600, borderRadius: 2 }}>
                  Open Period
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
      {/* All Periods */}
      <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>All Periods</Typography>
        {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}><CircularProgress /></Box> : periods.length === 0 ? (
          <Typography color="text.secondary">No periods found.</Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {periods.map((period) => (
              <Box key={period._id} display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius={2} border={`1px solid ${period.closed ? '#ffcdd2' : '#c8e6c9'}`} bgcolor={period.closed ? '#fff5f5' : '#f1fff1'}>
                <Box>
                  <Typography fontWeight={600}>{period.period}</Typography>
                  <Chip label={period.closed ? 'CLOSED' : 'OPEN'} color={period.closed ? 'error' : 'success'} size="small" sx={{ ml: 1 }} />
                </Box>
                {period.closed && (
                  <Button variant="contained" color="success" size="small" onClick={() => openPeriod(period.period)} sx={{ fontWeight: 600, borderRadius: 2 }}>
                    Open Period
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PeriodsPage; 