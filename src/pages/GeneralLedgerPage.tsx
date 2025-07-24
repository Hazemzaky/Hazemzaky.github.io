import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import AccountingSidebar from '../components/AccountingSidebar';
import axios from 'axios';

const departments = ['All', 'Logistics', 'Finance', 'IT', 'HR'];

const GeneralLedgerPage: React.FC = () => {
  const [accounts, setAccounts] = useState<{ _id: string; name: string; code: string }[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [department, setDepartment] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drillEntry, setDrillEntry] = useState<any | null>(null);
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillLoading, setDrillLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Failed to fetch accounts');
    }
  };

  const fetchLedger = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    setError('');
    try {
      const params: any = { accountId: selectedAccount };
      // Optionally add period/dateRange/department filters
      const res = await axios.get('/api/accounts/general-ledger', { params });
      setLedger(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDown = async (entryId: string) => {
    setDrillLoading(true);
    setDrillOpen(true);
    try {
      const res = await axios.get(`/api/journal-entries`, { params: { _id: entryId } });
      setDrillEntry(Array.isArray(res.data) ? res.data[0] : null);
    } catch (err) {
      setDrillEntry(null);
    } finally {
      setDrillLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafdff' }}>
      <AccountingSidebar />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, ml: '220px', width: '100%' }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" mb={3}>General Ledger Overview</Typography>
        <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', mb: 3 }}>
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <TextField select label="Account" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="">Select Account</MenuItem>
              {accounts.map(acc => <MenuItem key={acc._id} value={acc._id}>{acc.name} ({acc.code})</MenuItem>)}
            </TextField>
            <TextField select label="Department" value={department} onChange={e => setDepartment(e.target.value)} sx={{ minWidth: 160 }}>
              {departments.map(dep => <MenuItem key={dep} value={dep}>{dep}</MenuItem>)}
            </TextField>
            <TextField label="Date Range" value={dateRange} onChange={e => setDateRange(e.target.value)} sx={{ minWidth: 180 }} />
            <Button variant="contained" sx={{ fontWeight: 600 }} onClick={fetchLedger} disabled={!selectedAccount}>Load Ledger</Button>
            <Button variant="contained" sx={{ fontWeight: 600 }}>Export</Button>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Debit</TableCell>
                    <TableCell>Credit</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledger.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.debit}</TableCell>
                      <TableCell>{row.credit}</TableCell>
                      <TableCell>{row.balance}</TableCell>
                      <TableCell>{row.reference || '-'}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => handleDrillDown(row.entryId)}>Drill Down</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </Paper>
        {/* Drill Down Modal */}
        <Dialog open={drillOpen} onClose={() => setDrillOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Journal Entry Details</DialogTitle>
          <DialogContent>
            {drillLoading ? <CircularProgress /> : drillEntry ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Date: {new Date(drillEntry.date).toLocaleDateString()}</Typography>
                <Typography variant="subtitle1">Reference: {drillEntry.reference || '-'}</Typography>
                <Typography variant="subtitle1">Description: {drillEntry.description}</Typography>
                <Divider sx={{ my: 2 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell>Debit</TableCell>
                      <TableCell>Credit</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drillEntry.lines.map((line: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{typeof line.account === 'object' ? line.account.name : line.account}</TableCell>
                        <TableCell>{line.debit}</TableCell>
                        <TableCell>{line.credit}</TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : <Typography>No details found.</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDrillOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default GeneralLedgerPage;
