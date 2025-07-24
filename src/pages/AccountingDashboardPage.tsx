import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Divider, CircularProgress } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountingSidebar from '../components/AccountingSidebar';
import axios from 'axios';

const cardStyle = {
  p: 3,
  borderRadius: 4,
  background: '#fff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  minHeight: 140,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const AccountingDashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [aging, setAging] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [kpiRes, agingRes, invRes] = await Promise.all([
        axios.get('/api/dashboard/kpis'),
        axios.get('/api/invoices/aging-report'),
        axios.get('/api/invoices'),
      ]);
      setKpis(kpiRes.data);
      setAging(agingRes.data);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate AR/AP Aging total
  const arapTotal = aging ? Object.values(aging).flat().reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0) : 0;
  // Open invoices total
  const openInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  const openInvoicesTotal = openInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafdff' }}>
      <AccountingSidebar />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, ml: '220px', width: '100%' }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" mb={3}>Accounting Dashboard</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error" mt={2}>{error}</Typography>
        ) : (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* Cash Position (using netProfit as a proxy) */}
          <Box flex="1 1 300px" minWidth={260} maxWidth={400}>
            <Paper sx={cardStyle}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><MonetizationOnIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Cash Position</Typography>
                  <Typography variant="h5" fontWeight={700} color="text.primary">${kpis?.netProfit?.toLocaleString() || 0}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
          {/* AR/AP Aging */}
          <Box flex="1 1 300px" minWidth={260} maxWidth={400}>
            <Paper sx={cardStyle}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}><ReceiptLongIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">AR/AP Aging</Typography>
                  <Typography variant="h5" fontWeight={700} color="text.primary">${arapTotal.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
          {/* Open Invoices */}
          <Box flex="1 1 300px" minWidth={260} maxWidth={400}>
            <Paper sx={cardStyle}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}><TrendingUpIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Open Invoices</Typography>
                  <Typography variant="h5" fontWeight={700} color="text.primary">${openInvoicesTotal.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
          {/* Profitability by Vehicle/Department (placeholder) */}
          <Box flex="2 1 400px" minWidth={320} maxWidth={600}>
            <Paper sx={cardStyle}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}><PieChartIcon /></Avatar>
                <Typography variant="subtitle2" color="text.secondary">Profitability by Vehicle / Department</Typography>
              </Box>
              <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b2b2ff', fontSize: 24 }}>
                [Profitability Chart Here]
              </Box>
            </Paper>
          </Box>
          {/* Alerts */}
          <Box flex="2 1 400px" minWidth={320} maxWidth={600}>
            <Paper sx={cardStyle}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}><WarningAmberIcon /></Avatar>
                <Typography variant="subtitle2" color="text.secondary">Alerts</Typography>
              </Box>
              <Box>
                <Chip label="Unposted Journals" color="warning" sx={{ mr: 1, fontWeight: 600 }} />
                <Chip label="Overdue Receivables" color="error" sx={{ fontWeight: 600 }} />
              </Box>
            </Paper>
          </Box>
        </Box>
        )}
        <Divider sx={{ my: 4, borderColor: '#e3e8ee' }} />
        {/* Add more widgets or charts as needed */}
      </Box>
    </Box>
  );
};

export default AccountingDashboardPage; 