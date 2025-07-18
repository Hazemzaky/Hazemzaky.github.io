import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Snackbar, Alert, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiscalYear } from '../context/FiscalYearContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getStaffing, saveStaffingBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const defaultStaff = () => ({
  name: '',
  department: '',
  position: '',
  salary: '',
  benefits: '',
  start: `${months[0]}`,
  end: `${months[11]}`,
});

const departments = [
  'Operations',
  'Finance',
  'Sales',
  'HR',
  'IT',
  'Other',
];

const BudgetStaffing: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [staff, setStaff] = useState<any[]>([defaultStaff()]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getStaffing(fiscalYear)
      .then(res => {
        if (Array.isArray(res.data)) {
          setStaff(res.data.length > 0 ? res.data : [defaultStaff()]);
        } else {
          setStaff([defaultStaff()]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load staffing data');
        setStaff([defaultStaff()]);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleStaffChange = (idx: number, field: string, value: any) => {
    setStaff(staff => staff.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const handleAddStaff = () => setStaff([...staff, defaultStaff()]);
  const handleRemoveStaff = (idx: number) => setStaff(staff => staff.filter((_, i) => i !== idx));

  // Helper: get month index from name
  const getMonthIdx = (m: string) => months.indexOf(m);

  // Calculate payroll per staff per month
  const getPayroll = (s: any, mIdx: number) => {
    const startIdx = getMonthIdx(s.start);
    const endIdx = getMonthIdx(s.end);
    if (mIdx < startIdx || mIdx > endIdx) return 0;
    const salary = parseFloat(s.salary) || 0;
    const benefits = parseFloat(s.benefits) || 0;
    return salary + benefits;
  };
  // Calculate totals
  const getStaffTotal = (s: any) => months.reduce((sum, _, i) => sum + getPayroll(s, i), 0);
  const getMonthTotal = (mIdx: number) => staff.reduce((sum, s) => sum + getPayroll(s, mIdx), 0);
  const grandTotal = staff.reduce((sum, s) => sum + getStaffTotal(s), 0);
  // Headcount per month
  const getHeadcount = (mIdx: number) => staff.filter(s => mIdx >= getMonthIdx(s.start) && mIdx <= getMonthIdx(s.end)).length;

  // Chart data
  const chartData = months.map((m, i) => ({
    month: m,
    headcount: getHeadcount(i),
    payroll: getMonthTotal(i),
  }));

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveStaffingBulk(fiscalYear, staff);
      setSuccess('Staffing & payroll forecast saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save staffing data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading...</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ maxWidth: 1200, margin: '0 auto', mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Staffing & Payroll Forecast ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Benefits</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                {months.map(m => <TableCell key={m} align="center">{m}</TableCell>)}
                <TableCell align="center"><b>Total</b></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell><TextField value={s.name} onChange={e => handleStaffChange(idx, 'name', e.target.value)} placeholder="Name" size="small" /></TableCell>
                  <TableCell>
                    <TextField select value={s.department} onChange={e => handleStaffChange(idx, 'department', e.target.value)} size="small">
                      <MenuItem value="">Select</MenuItem>
                      {departments.map(dep => <MenuItem key={dep} value={dep}>{dep}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell><TextField value={s.position} onChange={e => handleStaffChange(idx, 'position', e.target.value)} placeholder="Position" size="small" /></TableCell>
                  <TableCell><TextField value={s.salary} onChange={e => handleStaffChange(idx, 'salary', e.target.value)} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 90 }} /></TableCell>
                  <TableCell><TextField value={s.benefits} onChange={e => handleStaffChange(idx, 'benefits', e.target.value)} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 90 }} /></TableCell>
                  <TableCell>
                    <TextField select value={s.start} onChange={e => handleStaffChange(idx, 'start', e.target.value)} size="small">
                      {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select value={s.end} onChange={e => handleStaffChange(idx, 'end', e.target.value)} size="small">
                      {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  {months.map((_, mIdx) => (
                    <TableCell key={mIdx} align="center">{getPayroll(s, mIdx).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  ))}
                  <TableCell align="center"><b>{getStaffTotal(s).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                  <TableCell><IconButton onClick={() => handleRemoveStaff(idx)} disabled={staff.length === 1}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={7}><b>Total</b></TableCell>
                {months.map((_, mIdx) => (
                  <TableCell key={mIdx} align="center"><b>{getMonthTotal(mIdx).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                ))}
                <TableCell align="center"><b>{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddStaff}>Add Staff</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Staffing'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 900, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Headcount & Payroll Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="headcount" stroke="#1976d2" name="Headcount" />
              <Line yAxisId="right" type="monotone" dataKey="payroll" stroke="#fbc02d" name="Payroll" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetStaffing; 