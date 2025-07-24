import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Divider, CircularProgress } from '@mui/material';
import AccountingSidebar from '../components/AccountingSidebar';
import axios from 'axios';

const reportTabs = [
  { label: 'Trial Balance', endpoint: '/api/accounts/trial-balance' },
  { label: 'Balance Sheet', endpoint: '/api/dashboard/balance-sheet' },
  { label: 'Profit & Loss', endpoint: '/api/dashboard/income-statement' },
  { label: 'Cash Flow', endpoint: '/api/dashboard/cash-flow-statement' },
  { label: 'Tax Reports', endpoint: '/api/invoices/aging-report' }, // Placeholder for tax
];

const AccountingReportsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [tab]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const endpoint = reportTabs[tab].endpoint;
      const res = await axios.get(endpoint);
      setReport(res.data);
    } catch (err: any) {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // Export as JSON (for demo; replace with CSV/PDF as needed)
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${reportTabs[tab].label.replace(/ /g, '_')}.json`);
    dlAnchorElem.click();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafdff' }}>
      <AccountingSidebar />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, ml: '220px', width: '100%' }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" mb={3}>Financial Reports</Typography>
        <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            {reportTabs.map((t, idx) => <Tab key={t.label} label={t.label} />)}
          </Tabs>
          <Divider sx={{ my: 2 }} />
          {/* Filters (future) */}
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <Button variant="outlined">Date Range</Button>
            <Button variant="outlined">Dimension</Button>
            <Button variant="contained" sx={{ fontWeight: 600 }} onClick={fetchReport}>Generate Report</Button>
          </Box>
          {/* Report Viewer */}
          <Box sx={{ minHeight: 200, background: '#fafdff', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b2b2ff', fontSize: 24 }}>
            {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
              <pre style={{ color: '#333', fontSize: 16, width: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'left' }}>{JSON.stringify(report, null, 2)}</pre>
            )}
          </Box>
          <Box mt={2}>
            <Button variant="contained" sx={{ fontWeight: 600, mr: 2 }} onClick={handleExport}>Export JSON</Button>
            {/* <Button variant="contained" sx={{ fontWeight: 600 }}>Export PDF</Button> */}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AccountingReportsPage; 