import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiBase';
import {
  Box, Button, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const passTypes = [
  { value: 'KOC', label: 'KOC' },
  { value: 'KNPC', label: 'KNPC' },
  { value: 'GO', label: 'GO' },
  { value: 'RATQA', label: 'RATQA' },
  { value: 'ABDALI', label: 'ABDALI' },
  { value: 'WANEET', label: 'WANEET' },
];

const EmployeePassesPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    passType: '',
    passNumber: '',
    issuanceDate: '',
    expiryDate: '',
    certificate: undefined,
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch all employees with position driver or operator on mount
  useEffect(() => {
    Promise.all([
      api.get('/employees', { params: { position: 'driver' } }),
      api.get('/employees', { params: { position: 'operator' } })
    ]).then(([driverRes, operatorRes]) => {
      const driverList = Array.isArray(driverRes.data) ? driverRes.data : [];
      const operatorList = Array.isArray(operatorRes.data) ? operatorRes.data : [];
      // Combine and deduplicate by _id
      const combined = [...driverList, ...operatorList].filter((emp, idx, arr) =>
        arr.findIndex(e => e._id === emp._id) === idx
      );
      setEmployees(combined);
    });
  }, []);

  // Fetch passes for selected employee
  useEffect(() => {
    if (selectedEmployee && selectedEmployee._id) {
      setLoading(true);
      api.get('/employee-passes', { params: { employee: selectedEmployee._id } })
        .then(res => {
          setPasses(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch(() => {
          setPasses([]);
          setLoading(false);
        });
    } else {
      setPasses([]);
    }
  }, [selectedEmployee]);

  // Filter employees by Co Id
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const s = employeeSearch.trim().toLowerCase();
    return employees.filter(e => (e.coId || '').toLowerCase().includes(s));
  }, [employees, employeeSearch]);

  const handleEmployeeSelect = (id: string) => {
    const emp = employees.find(e => e._id === id);
    setSelectedEmployee(emp || null);
  };

  const handleOpen = (pass?: any) => {
    if (pass) {
      setEditing(pass);
      setForm({
        passType: pass.passType,
        passNumber: pass.passNumber,
        issuanceDate: pass.issuanceDate ? pass.issuanceDate.slice(0, 10) : '',
        expiryDate: pass.expiryDate ? pass.expiryDate.slice(0, 10) : '',
        certificate: undefined,
      });
    } else {
      setEditing(null);
      setForm({ passType: '', passNumber: '', issuanceDate: '', expiryDate: '', certificate: undefined });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ passType: '', passNumber: '', issuanceDate: '', expiryDate: '', certificate: undefined });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm({ ...form, certificate: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!selectedEmployee || !selectedEmployee._id) {
        setError('Please select an employee');
        setSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append('employee', selectedEmployee._id);
      formData.append('passType', form.passType);
      formData.append('passNumber', form.passNumber);
      formData.append('issuanceDate', form.issuanceDate);
      formData.append('expiryDate', form.expiryDate);
      if (form.certificate) formData.append('certificate', form.certificate);
      if (editing) {
        await api.put(`/employee-passes/${editing._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Pass updated!');
      } else {
        await api.post('/employee-passes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Pass added!');
      }
      setOpen(false);
      setEditing(null);
      setForm({ passType: '', passNumber: '', issuanceDate: '', expiryDate: '', certificate: undefined });
      // Refetch passes
      const res = await api.get('/employee-passes', { params: { employee: selectedEmployee._id } });
      setPasses(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/employee-passes/${deleteId}`);
      setSuccess('Pass deleted!');
      setDeleteId(null);
      // Refetch passes
      if (selectedEmployee && selectedEmployee._id) {
        const res = await api.get('/employee-passes', { params: { employee: selectedEmployee._id } });
        setPasses(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err: any) {
      setError('Failed to delete pass');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Employee Passes</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" mb={1}>Search Employee by Co Id</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Co Id"
            value={employeeSearch}
            onChange={e => setEmployeeSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            label="Select Employee"
            value={selectedEmployee?._id || ''}
            onChange={e => handleEmployeeSelect(e.target.value)}
            sx={{ minWidth: 300 }}
          >
            <MenuItem value="">Select Employee</MenuItem>
            {filteredEmployees.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>
                {emp.name} - {emp.coId || 'No Co Id'} ({emp.position})
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>
      {selectedEmployee && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Passes for: {selectedEmployee.name} ({selectedEmployee.coId})</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
              Add Pass
            </Button>
          </Box>
          {loading ? <CircularProgress /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pass Type</TableCell>
                  <TableCell>Pass Number</TableCell>
                  <TableCell>Issuance Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Certificate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {passes.map(pass => (
                  <TableRow key={pass._id}>
                    <TableCell>{pass.passType}</TableCell>
                    <TableCell>{pass.passNumber}</TableCell>
                    <TableCell>{pass.issuanceDate ? new Date(pass.issuanceDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{pass.expiryDate ? new Date(pass.expiryDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {pass.certificate ? (
                        <a href={pass.certificate} target="_blank" rel="noopener noreferrer">Download</a>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(pass)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(pass._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Pass' : 'Add Pass'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Pass Type"
              name="passType"
              value={form.passType}
              onChange={handleFormChange}
              required
              fullWidth
            >
              <MenuItem value="">Select Pass Type</MenuItem>
              {passTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
            <TextField
              label="Pass Number"
              name="passNumber"
              value={form.passNumber}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <TextField
              label="Issuance Date"
              name="issuanceDate"
              value={form.issuanceDate}
              onChange={handleFormChange}
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Expiry Date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleFormChange}
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Box>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="certificate-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="certificate-upload">
                <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                  {form.certificate ? (typeof form.certificate === 'string' ? 'Change Certificate' : form.certificate.name) : 'Upload Certificate'}
                </Button>
              </label>
              {editing && editing.certificate && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Existing: <a href={editing.certificate} target="_blank" rel="noopener noreferrer">Download</a>
                </Typography>
              )}
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>{editing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Pass</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this pass?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
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

export default EmployeePassesPage; 