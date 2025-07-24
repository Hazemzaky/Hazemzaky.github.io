import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import AccountingSidebar from '../components/AccountingSidebar';
import axios from 'axios';

const journalTypes = ['All', 'Sales', 'Purchase', 'Misc'];
const statuses = ['All', 'Draft', 'Posted'];

const JournalEntriesPage: React.FC = () => {
  const [journalType, setJournalType] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: '', description: '', period: '', reference: '', lines: [{ account: '', debit: 0, credit: 0, description: '' }] });
  const [submitting, setSubmitting] = useState(false);
  const [viewEntry, setViewEntry] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [accounts, setAccounts] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
  }, [journalType, status]);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (status !== 'All') params.status = status.toLowerCase();
      // Optionally add journalType/dateRange filters
      const res = await axios.get('/api/journal-entries', { params });
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleOpen = () => {
    setForm({ date: '', description: '', period: '', reference: '', lines: [{ account: '', debit: 0, credit: 0, description: '' }] });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setError('');
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleLineChange = (idx: number, field: string, value: any) => {
    const newLines = [...form.lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    setForm({ ...form, lines: newLines });
  };
  const handleAddLine = () => {
    setForm({ ...form, lines: [...form.lines, { account: '', debit: 0, credit: 0, description: '' }] });
  };
  const handleRemoveLine = (idx: number) => {
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  };
  const totalDebit = form.lines.reduce((sum, l) => sum + Number(l.debit), 0);
  const totalCredit = form.lines.reduce((sum, l) => sum + Number(l.credit), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setError('Debits and credits must be equal and non-zero.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/journal-entries', form);
      fetchEntries();
      handleClose();
    } catch (err: any) {
      setError('Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (entry: any) => {
    setViewEntry(entry);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
    setViewEntry(null);
  };

  // TODO: Implement Edit and Delete actions

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafdff' }}>
      <AccountingSidebar />
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, ml: '220px', width: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" fontWeight={700} color="text.primary">Manual Journal Entries</Typography>
          <Button variant="contained" sx={{ fontWeight: 600, borderRadius: 2 }} onClick={handleOpen}>+ New Journal Entry</Button>
        </Box>
        <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', mb: 3 }}>
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <TextField select label="Journal Type" value={journalType} onChange={e => setJournalType(e.target.value)} sx={{ minWidth: 160 }}>
              {journalTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
              {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField label="Date Range" value={dateRange} onChange={e => setDateRange(e.target.value)} sx={{ minWidth: 180 }} />
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Entry Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Debit Total</TableCell>
                    <TableCell>Credit Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map(row => (
                    <TableRow key={row._id}>
                      <TableCell>{row.serial || row._id}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{row.reference}</TableCell>
                      <TableCell>{row.lines.reduce((sum: number, l: any) => sum + Number(l.debit), 0)}</TableCell>
                      <TableCell>{row.lines.reduce((sum: number, l: any) => sum + Number(l.credit), 0)}</TableCell>
                      <TableCell><Chip label={row.status} color={row.status === 'posted' ? 'success' : 'warning'} /></TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => handleView(row)}>View</Button>
                        {/* <Button size="small" variant="outlined" sx={{ ml: 1 }}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }}>Delete</Button> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </Paper>
        {/* New Journal Entry Modal */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Add Journal Entry</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Date" name="date" value={form.date} onChange={handleFormChange} required fullWidth type="date" InputLabelProps={{ shrink: true }} />
              <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} required fullWidth />
              <TextField label="Period" name="period" value={form.period} onChange={handleFormChange} required fullWidth placeholder="e.g. 2024-Q2 or 2024-05" />
              <TextField label="Reference" name="reference" value={form.reference} onChange={handleFormChange} fullWidth />
              <Typography variant="subtitle1" fontWeight={600} mt={2}>Lines</Typography>
              {form.lines.map((line, idx) => (
                <Box key={idx} display="flex" gap={2} alignItems="center" mb={1}>
                  <TextField
                    label="Account"
                    value={line.account}
                    onChange={e => handleLineChange(idx, 'account', e.target.value)}
                    required
                    select
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="">Select Account</MenuItem>
                    {accounts.map(a => (
                      <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Debit" type="number" value={line.debit} onChange={e => handleLineChange(idx, 'debit', Number(e.target.value))} required sx={{ maxWidth: 120 }} />
                  <TextField label="Credit" type="number" value={line.credit} onChange={e => handleLineChange(idx, 'credit', Number(e.target.value))} required sx={{ maxWidth: 120 }} />
                  <TextField label="Line Description" value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} sx={{ minWidth: 200 }} />
                  <Button onClick={() => handleRemoveLine(idx)} color="error" disabled={form.lines.length === 1}>Remove</Button>
                </Box>
              ))}
              <Button onClick={handleAddLine} variant="outlined" color="primary" sx={{ width: 180, mb: 2 }}>Add Line</Button>
              <Typography variant="body2" color={isBalanced ? 'success.main' : 'error.main'}>
                Total Debit: {totalDebit} | Total Credit: {totalCredit} {isBalanced ? '(Balanced)' : '(Not Balanced)'}
              </Typography>
              {error && <Typography color="error">{error}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting || !isBalanced}>Create Entry</Button>
          </DialogActions>
        </Dialog>
        {/* View Entry Modal */}
        <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
          <DialogTitle>Journal Entry Details</DialogTitle>
          <DialogContent>
            {viewEntry ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Date: {new Date(viewEntry.date).toLocaleDateString()}</Typography>
                <Typography variant="subtitle1">Reference: {viewEntry.reference || '-'}</Typography>
                <Typography variant="subtitle1">Description: {viewEntry.description}</Typography>
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
                    {viewEntry.lines.map((line: any, idx: number) => (
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
            <Button onClick={handleViewClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default JournalEntriesPage; 