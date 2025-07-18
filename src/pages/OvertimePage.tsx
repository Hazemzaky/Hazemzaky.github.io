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
  employee: '',
  salary: '',
  dailySalary: '',
  hourlyRate: '',
  normalRate: '',
  normalHours: '',
  normalSalary: '',
  fridayRate: '',
  fridayHours: '',
  fridaySalary: '',
  holidayRate: '',
  holidayHours: '',
  holidaySalary: '',
  totalOvertimeHours: '',
  totalCost: '',
};

const getYearForTab = (tabIdx: number) => {
  const now = new Date();
  const fiscalStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  // April (0) to December (8) is fiscalStart, Jan/Feb/Mar is fiscalStart+1
  return tabIdx <= 8 ? fiscalStart : fiscalStart + 1;
};

const OvertimePage: React.FC = () => {
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
      const res = await fetch('/api/payroll/employees?position=driver,operator');
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
      const res = await fetch(`/api/overtime?month=${monthIdx}&year=${year}`);
      const json = await res.json();
      setMonthData(json);
    } catch (err: any) {
      setError('Failed to load overtime data');
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
        salary: Number(form.salary),
        dailySalary: Number(form.dailySalary),
        hourlyRate: Number(form.hourlyRate),
        normalRate: Number(form.normalRate),
        normalHours: Number(form.normalHours),
        normalSalary: Number(form.normalSalary),
        fridayRate: Number(form.fridayRate),
        fridayHours: Number(form.fridayHours),
        fridaySalary: Number(form.fridaySalary),
        holidayRate: Number(form.holidayRate),
        holidayHours: Number(form.holidayHours),
        holidaySalary: Number(form.holidaySalary),
        totalOvertimeHours: Number(form.totalOvertimeHours),
        totalCost: Number(form.totalCost),
      };
      const res = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setForm(defaultRow);
      setOpenForm(false);
      fetchMonthData();
    } catch (err: any) {
      setError('Failed to save overtime data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/overtime/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchMonthData();
    } catch {
      setError('Failed to delete overtime record');
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals for each column
  const totals = {
    salary: monthData.reduce((sum, r) => sum + Number(r.salary || 0), 0),
    dailySalary: monthData.reduce((sum, r) => sum + Number(r.dailySalary || 0), 0),
    hourlyRate: monthData.reduce((sum, r) => sum + Number(r.hourlyRate || 0), 0),
    normalSalary: monthData.reduce((sum, r) => sum + Number(r.normalSalary || 0), 0),
    fridaySalary: monthData.reduce((sum, r) => sum + Number(r.fridaySalary || 0), 0),
    holidaySalary: monthData.reduce((sum, r) => sum + Number(r.holidaySalary || 0), 0),
    totalOvertimeHours: monthData.reduce((sum, r) => sum + Number(r.totalOvertimeHours || 0), 0),
    totalCost: monthData.reduce((sum, r) => sum + Number(r.totalCost || 0), 0),
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Overtime</Typography>
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
              <TableCell>Employee Name</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Daily Salary</TableCell>
              <TableCell>Hourly Rate</TableCell>
              <TableCell sx={{ bgcolor: 'white' }}>Normal Day Rate</TableCell>
              <TableCell sx={{ bgcolor: 'white' }}>Normal Day Hours</TableCell>
              <TableCell sx={{ bgcolor: 'white' }}>Normal Day Salary</TableCell>
              <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Rate</TableCell>
              <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Hours</TableCell>
              <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Salary</TableCell>
              <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Rate</TableCell>
              <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Hours</TableCell>
              <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Salary</TableCell>
              <TableCell>Total Overtime Hours</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthData.map((row, idx) => (
              <TableRow key={row._id || idx}>
                <TableCell>{employees.find(e => e._id === row.employee || (row.employee && row.employee._id))?.name || ''}</TableCell>
                <TableCell>{row.salary}</TableCell>
                <TableCell>{row.dailySalary}</TableCell>
                <TableCell>{row.hourlyRate}</TableCell>
                <TableCell sx={{ bgcolor: 'white' }}>{row.normalRate}</TableCell>
                <TableCell sx={{ bgcolor: 'white' }}>{row.normalHours}</TableCell>
                <TableCell sx={{ bgcolor: 'white' }}>{row.normalSalary}</TableCell>
                <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridayRate}</TableCell>
                <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridayHours}</TableCell>
                <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridaySalary}</TableCell>
                <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidayRate}</TableCell>
                <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidayHours}</TableCell>
                <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidaySalary}</TableCell>
                <TableCell>{row.totalOvertimeHours}</TableCell>
                <TableCell>{row.totalCost}</TableCell>
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
        <Card><CardContent><Typography>Total Normal Salary: {totals.normalSalary}</Typography></CardContent></Card>
        <Card><CardContent><Typography>Total Friday Salary: {totals.fridaySalary}</Typography></CardContent></Card>
        <Card><CardContent><Typography>Total Holiday Salary: {totals.holidaySalary}</Typography></CardContent></Card>
        <Card><CardContent><Typography>Total Overtime Hours: {totals.totalOvertimeHours}</Typography></CardContent></Card>
        <Card><CardContent><Typography>Total Cost: {totals.totalCost}</Typography></CardContent></Card>
      </Box>
      {/* Add Data Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Overtime Data</DialogTitle>
        <DialogContent>
          <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            <FormControl fullWidth required>
              <InputLabel>Employee</InputLabel>
              <Select
                name="employee"
                value={form.employee}
                label="Employee"
                onChange={handleFormChange}
              >
                {Array.isArray(employees) && employees.map(e => (
                  <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Salary" name="salary" value={form.salary} onChange={handleFormChange} required fullWidth />
            <TextField label="Daily Salary" name="dailySalary" value={form.dailySalary} onChange={handleFormChange} required fullWidth />
            <TextField label="Hourly Rate" name="hourlyRate" value={form.hourlyRate} onChange={handleFormChange} required fullWidth />
            {/* Normal Day (white) */}
            <TextField label="Normal Day Rate" name="normalRate" value={form.normalRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
            <TextField label="Normal Day Hours" name="normalHours" value={form.normalHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
            <TextField label="Normal Day Salary" name="normalSalary" value={form.normalSalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
            {/* Friday (red) */}
            <TextField label="Friday Rate" name="fridayRate" value={form.fridayRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
            <TextField label="Friday Hours" name="fridayHours" value={form.fridayHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
            <TextField label="Friday Salary" name="fridaySalary" value={form.fridaySalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
            {/* Public Holiday (green) */}
            <TextField label="Public Holiday Rate" name="holidayRate" value={form.holidayRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
            <TextField label="Public Holiday Hours" name="holidayHours" value={form.holidayHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
            <TextField label="Public Holiday Salary" name="holidaySalary" value={form.holidaySalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
            <TextField label="Total Overtime Hours" name="totalOvertimeHours" value={form.totalOvertimeHours} onChange={handleFormChange} required fullWidth />
            <TextField label="Total Cost" name="totalCost" value={form.totalCost} onChange={handleFormChange} required fullWidth />
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

export default OvertimePage; 