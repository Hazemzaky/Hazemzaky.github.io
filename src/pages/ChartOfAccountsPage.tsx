import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Chip, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import api from '../apiBase';

interface Account {
  _id: string;
  name: string;
  code: string;
  type: string;
  parent?: string;
  description?: string;
  active: boolean;
}

const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: '',
    parent: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/accounts');
      if (Array.isArray(res.data)) {
        setAccounts(res.data);
      } else {
        setAccounts([]);
        setError('Unexpected response from server');
        console.error('Expected array, got:', res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = useMemo(() => {
    let data = accounts;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(a =>
        a.name.toLowerCase().includes(s) ||
        a.code.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s)
      );
    }
    return data;
  }, [accounts, search]);

  const handleOpen = (account?: Account) => {
    if (account) {
      setEditingId(account._id);
      setForm({
        name: account.name,
        code: account.code,
        type: account.type,
        parent: account.parent || '',
        description: account.description || '',
      });
    } else {
      setEditingId(null);
      setForm({ name: '', code: '', type: '', parent: '', description: '' });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ name: '', code: '', type: '', parent: '', description: '' });
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/accounts/${editingId}`, form);
        setSuccess('Account updated successfully!');
      } else {
        await api.post('/accounts', form);
        setSuccess('Account created successfully!');
      }
      fetchAccounts();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeactivate = async (id: string) => {
    try {
      await api.delete(`/accounts/${id}`);
      setSuccess('Account deactivated!');
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate account');
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" mb={3} gap={2}>
        <Typography variant="h4" fontWeight={700} color="text.primary">Chart of Accounts</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ fontWeight: 600, borderRadius: 2, minWidth: 140 }}>
          Add Account
        </Button>
      </Box>
      {/* Summary Widget */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4, background: '#fafdff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box display="flex" flexWrap="wrap" gap={3} alignItems="center">
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">Total: {accounts.length}</Typography>
          <Chip label={`Active: ${accounts.filter(a => a.active).length}`} color="success" sx={{ fontWeight: 600 }} />
          <Chip label={`Inactive: ${accounts.filter(a => !a.active).length}`} color="default" sx={{ fontWeight: 600 }} />
          {['asset','liability','equity','revenue','expense'].map(type => (
            <Chip key={type} label={`${type.charAt(0).toUpperCase() + type.slice(1)}: ${accounts.filter(a => a.type === type).length}`} sx={{ fontWeight: 600, background: '#e3e8ee', color: '#333' }} />
          ))}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 2, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <TextField
          size="small"
          placeholder="Search by name, code, or type"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearch('')} size="small">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 260, maxWidth: 400, mb: 1 }}
        />
      </Paper>
      <Paper sx={{ p: 2, overflowX: 'auto', borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ background: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Parent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((a, idx) => (
                  <TableRow key={a._id} sx={{ background: idx % 2 === 0 ? '#fafafa' : '#fff', '&:hover': { background: '#e3e8ee' } }}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.code}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{a.type}</TableCell>
                    <TableCell>{accounts.find(acc => acc._id === a.parent)?.name || '-'}</TableCell>
                    <TableCell>{a.description || '-'}</TableCell>
                    <TableCell>
                      {a.active ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleOpen(a)} sx={{ mr: 1 }}>Edit</Button>
                      {a.active && (
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDeactivate(a._id)}>
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Account' : 'Add Account'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1}>{editingId ? 'Edit Account Details' : 'New Account Details'}</Typography>
            <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} required fullWidth />
            <TextField label="Code" name="code" value={form.code} onChange={handleFormChange} required fullWidth />
            <TextField label="Type" name="type" value={form.type} onChange={handleFormChange} required fullWidth select>
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="asset">Asset</MenuItem>
              <MenuItem value="liability">Liability</MenuItem>
              <MenuItem value="equity">Equity</MenuItem>
              <MenuItem value="revenue">Revenue</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <TextField label="Parent Account" name="parent" value={form.parent} onChange={handleFormChange} fullWidth select>
              <MenuItem value="">None</MenuItem>
              {accounts.filter(a => a._id !== editingId).map(a => (
                <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>{editingId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ChartOfAccountsPage; 