import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Alert, IconButton, MenuItem, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../apiBase';

const monthLabels = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

const trackerFields = [
  'SR', 'Departure Month', 'Date', 'TMR', 'From', 'To', 'Department Requester', 'Invoiced Date', 'Field', 'OTM/PO', 'VPN', 'Transfer Number', 'Transfer Type', 'Water Card No.', 'Gallons', 'EMP', 'Name', 'Nationality', 'Passport', 'Residency Number', 'Contact', 'Date Loaded', 'Time Loaded', 'Returned Date', 'Returned Time', 'Duration Trip Time', 'Days In Mission', 'KM at Origin', 'KM Once Returned', 'Total KM Per Trip', 'Trip Allowance In KWD'
];

const numericFields = ['Gallons', 'Days In Mission', 'KM at Origin', 'KM Once Returned', 'Total KM Per Trip', 'Trip Allowance In KWD'];

const getCurrentYear = () => {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

const TrackerPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<{ [month: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  const year = getCurrentYear();
  const month = monthLabels[tab];

  // Fetch employees with position 'driver' or 'operator' for EMP dropdown
  useEffect(() => {
    setEmpLoading(true);
    Promise.all([
      api.get('/employees', { params: { position: 'driver' } }),
      api.get('/employees', { params: { position: 'operator' } })
    ])
      .then(([driverRes, operatorRes]) => {
        const driverList = Array.isArray(driverRes.data) ? driverRes.data : [];
        const operatorList = Array.isArray(operatorRes.data) ? operatorRes.data : [];
        // Combine and deduplicate by _id
        const combined = [...driverList, ...operatorList].filter((emp, idx, arr) =>
          arr.findIndex(e => e._id === emp._id) === idx
        );
        setEmployees(combined);
      })
      .catch(() => setEmployees([]))
      .finally(() => setEmpLoading(false));
  }, []);

  // Fetch tracker data for the selected month
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tracker', { params: { month, year } });
      setData(d => ({ ...d, [month]: Array.isArray(res.data) ? res.data : [] }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tracker data');
      setData(d => ({ ...d, [month]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const handleOpenDialog = (row?: any) => {
    setDialogMode(row ? 'edit' : 'add');
    setEditingId(row?._id || null);
    setForm(row ? {
      ...row,
      date: row.date ? row.date.slice(0, 10) : '',
      invoicedDate: row.invoicedDate ? row.invoicedDate.slice(0, 10) : '',
      dateLoaded: row.dateLoaded ? row.dateLoaded.slice(0, 10) : '',
      returnedDate: row.returnedDate ? row.returnedDate.slice(0, 10) : '',
    } : {
      month,
      year,
      SR: '',
      departureMonth: month,
      date: '',
      TMR: '',
      from: '',
      to: '',
      departmentRequester: '',
      invoicedDate: '',
      field: '',
      OTM_PO: '',
      VPN: '',
      transferNumber: '',
      transferType: '',
      waterCardNo: '',
      gallons: '',
      EMP: '',
      name: '',
      nationality: '',
      passport: '',
      residencyNumber: '',
      contact: '',
      dateLoaded: '',
      timeLoaded: '',
      returnedDate: '',
      returnedTime: '',
      durationTripTime: '',
      daysInMission: '',
      kmAtOrigin: '',
      kmOnceReturned: '',
      totalKmPerTrip: '',
      tripAllowanceInKWD: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({});
    setEditingId(null);
    setError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate required fields
    for (const field of trackerFields) {
      const key = field.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
      if (!form[field] && field !== 'EMP') {
        setError(`Field '${field}' is required`);
        return;
      }
    }
    if (!form.EMP) {
      setError('EMP is required');
      return;
    }
    try {
      const payload = {
        ...form,
        gallons: Number(form.gallons),
        daysInMission: Number(form.daysInMission),
        kmAtOrigin: Number(form.kmAtOrigin),
        kmOnceReturned: Number(form.kmOnceReturned),
        totalKmPerTrip: Number(form.totalKmPerTrip),
        tripAllowanceInKWD: Number(form.tripAllowanceInKWD),
      };
      if (dialogMode === 'add') {
        await api.post('/tracker', payload);
        setSuccess('Entry added');
      } else if (editingId) {
        await api.put(`/tracker/${editingId}`, payload);
        setSuccess('Entry updated');
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    setError('');
    try {
      await api.delete(`/tracker/${id}`);
      setSuccess('Entry deleted');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  const getTotals = (rows: any[]) => {
    const totals: any = {};
    numericFields.forEach(f => { totals[f] = 0; });
    rows.forEach(row => {
      numericFields.forEach(f => {
        const key = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
        totals[f] += Number(row[key] || row[f] || 0);
      });
    });
    return totals;
  };

  const rows = data[month] || [];
  const totals = getTotals(rows);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Tracker</Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        {monthLabels.map((m, i) => <Tab key={m} label={m} />)}
      </Tabs>
      <Box mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Data</Button>
      </Box>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ p: 2, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {trackerFields.map(f => <TableCell key={f}>{f}</TableCell>)}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={row._id || idx}>
                  {trackerFields.map(f => {
                    if (f === 'EMP') {
                      const emp = employees.find(e => e._id === row.EMP || (row.EMP && row.EMP._id === e._id));
                      return <TableCell key={f}>{emp ? `${emp.name} (${emp.position})` : row.EMP}</TableCell>;
                    }
                    return <TableCell key={f}>{row[f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD')] || row[f] || ''}</TableCell>;
                  })}
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog(row)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card sx={{ mt: 2, p: 2, background: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle1">Totals for this month:</Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                {numericFields.map(f => (
                  <Box key={f} minWidth={120}><b>{f}:</b> {totals[f]}</Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Paper>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Add Data' : 'Edit Data'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              {trackerFields.map(f => {
                if (f === 'EMP') {
                  return (
                    <TextField
                      key={f}
                      select
                      label="EMP (Employee)"
                      name="EMP"
                      value={form.EMP || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      disabled={empLoading}
                    >
                      <MenuItem value="">Select Employee</MenuItem>
                      {employees.map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>{emp.name} ({emp.position})</MenuItem>
                      ))}
                    </TextField>
                  );
                }
                // Date fields
                if ([
                  'Date', 'Invoiced Date', 'Date Loaded', 'Returned Date'
                ].includes(f)) {
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name={name}
                      type="date"
                      value={form[name] || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }
                // Numeric fields
                if (numericFields.includes(f)) {
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name={name}
                      type="number"
                      value={form[name] || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                    />
                  );
                }
                // Time fields
                if (f === 'Time Loaded' || f === 'Returned Time' || f === 'Duration Trip Time') {
                  const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                  return (
                    <TextField
                      key={f}
                      label={f}
                      name={name}
                      type="time"
                      value={form[name] || ''}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }
                // Default text fields
                const name = f.replace(/ /g, '').replace(/\//g, '_').replace(/\./g, '').replace(/-/g, '').replace(/KWD/g, 'KWD');
                return (
                  <TextField
                    key={f}
                    label={f}
                    name={name}
                    value={form[name] || ''}
                    onChange={handleFormChange}
                    required
                    fullWidth
                  />
                );
              })}
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{dialogMode === 'add' ? 'Add' : 'Update'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    </Box>
  );
};

export default TrackerPage; 