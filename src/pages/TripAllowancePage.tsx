import React, { useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, MenuItem, Card, CardContent, Typography, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, CircularProgress, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const months = [
  'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'
];

const getCurrentFiscalMonth = () => {
  const now = new Date();
  const month = now.getMonth();
  // Fiscal year starts in April (3)
  return month >= 3 ? month - 3 : month + 9;
};

const defaultRow = {
  srJobTitle: '',
  name: '',
  nationality: '',
  residencyNo: '',
  allowance: '',
  remark: '',
};

const getYearForTab = (tabIdx: number) => {
  const now = new Date();
  const fiscalStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  // April (0) to December (8) is fiscalStart, Jan/Feb/Mar is fiscalStart+1
  return tabIdx <= 8 ? fiscalStart : fiscalStart + 1;
};

const TripAllowancePage: React.FC = () => {
  const [tab, setTab] = useState(getCurrentFiscalMonth());
  const [employees, setEmployees] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(defaultRow);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchMonthData();
    // eslint-disable-next-line
  }, [tab]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/payroll/employees');
      const json = await res.json();
      setEmployees(Array.isArray(json) ? json : []);
    } catch {
      setEmployees([]);
    }
  };

  const fetchMonthData = async () => {
    setLoading(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      const res = await fetch(`/api/trip-allowance?month=${monthIdx}&year=${year}`);
      const json = await res.json();
      setMonthData(json);
    } catch (err: any) {
      setError('Failed to load trip allowance data');
      setMonthData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddData = async () => {
    for (const key of Object.keys(defaultRow)) {
      if (!form[key]) {
        setError('All fields are required');
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      const payload = {
        ...form,
        month: monthIdx,
        year,
        allowance: Number(form.allowance),
      };
      const res = await fetch('/api/trip-allowance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setForm(defaultRow);
      setOpenForm(false);
      fetchMonthData();
    } catch (err: any) {
      setError('Failed to save trip allowance data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/trip-allowance/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchMonthData();
    } catch {
      setError('Failed to delete trip allowance record');
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals for each column
  const safeMonthData = Array.isArray(monthData) ? monthData : [];
  const totals = {
    allowance: safeMonthData.reduce((sum, r) => sum + Number(r.allowance || 0), 0),
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Trip Allowance</Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {months.map((m, i) => <Tab key={m} label={m} />)}
        </Tabs>
      </Paper>
      <Box mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          Add Data
        </Button>
      </Box>
      {loading ? <CircularProgress /> : (
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR Job Title</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Nationality</TableCell>
              <TableCell>Residency No.</TableCell>
              <TableCell>Allowance</TableCell>
              <TableCell>Remark</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeMonthData.map((row, idx) => (
              <TableRow key={row._id || idx}>
                <TableCell>{row.srJobTitle}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.nationality}</TableCell>
                <TableCell>{row.residencyNo}</TableCell>
                <TableCell>{row.allowance}</TableCell>
                <TableCell>{row.remark}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      )}
      {/* Totals Cards */}
      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <Card><CardContent><Typography>Total Allowance: {totals.allowance.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography></CardContent></Card>
      </Box>
      {/* Add Data Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Trip Allowance Data</DialogTitle>
        <DialogContent>
          <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            <TextField label="SR Job Title" name="srJobTitle" value={form.srJobTitle} onChange={handleFormChange} required fullWidth />
            <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} required fullWidth />
            <TextField label="Nationality" name="nationality" value={form.nationality} onChange={handleFormChange} required fullWidth />
            <TextField label="Residency No." name="residencyNo" value={form.residencyNo} onChange={handleFormChange} required fullWidth />
            <TextField label="Allowance" name="allowance" value={form.allowance} onChange={handleFormChange} type="number" required fullWidth />
            <TextField label="Remark" name="remark" value={form.remark} onChange={handleFormChange} required fullWidth multiline minRows={2} />
          </Box>
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </DialogContent>
        <Box display="flex" justifyContent="flex-end" p={2}>
          <Button onClick={() => setOpenForm(false)} sx={{ mr: 2 }}>Cancel</Button>
          <Button onClick={handleAddData} variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default TripAllowancePage; 