import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Snackbar, Alert, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiscalYear } from '../context/FiscalYearContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getCapex, saveCapexBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const defaultCapex = () => ({
  name: '',
  category: '',
  amount: '',
  purchaseMonth: months[0],
  depreciation: 'none',
  duration: '',
  notes: '',
});

const categories = [
  'Equipment',
  'Vehicles',
  'IT',
  'Furniture',
  'Other',
];

const depreciationMethods = [
  { value: 'none', label: 'None' },
  { value: 'straight', label: 'Straight-Line' },
];

function getMonthIdx(m: string) {
  return months.indexOf(m);
}

function getDepreciationSchedule(item: any) {
  if (item.depreciation === 'none') return Array(12).fill(0);
  const amount = parseFloat(item.amount) || 0;
  const duration = parseInt(item.duration) || 0;
  if (!amount || !duration) return Array(12).fill(0);
  const startIdx = getMonthIdx(item.purchaseMonth);
  const monthly = amount / duration;
  const schedule = Array(12).fill(0);
  for (let i = 0; i < duration; i++) {
    const mIdx = (startIdx + i) % 12;
    if (mIdx >= 0 && mIdx < 12) schedule[mIdx] += monthly;
  }
  return schedule;
}

const BudgetCapex: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [capex, setCapex] = useState<any[]>([defaultCapex()]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getCapex(fiscalYear)
      .then(res => {
        if (Array.isArray(res.data)) {
          setCapex(res.data.length > 0 ? res.data : [defaultCapex()]);
        } else {
          setCapex([defaultCapex()]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load CAPEX data');
        setCapex([defaultCapex()]);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleCapexChange = (idx: number, field: string, value: any) => {
    setCapex(capex => capex.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const handleAddCapex = () => setCapex([...capex, defaultCapex()]);
  const handleRemoveCapex = (idx: number) => setCapex(capex => capex.filter((_, i) => i !== idx));

  // CAPEX outflow per month
  const capexOutflow = months.map((_, mIdx) => capex.reduce((sum, c) => sum + (getMonthIdx(c.purchaseMonth) === mIdx ? (parseFloat(c.amount) || 0) : 0), 0));
  // Depreciation per month
  const depreciationTotals = months.map((_, mIdx) => capex.reduce((sum, c) => sum + getDepreciationSchedule(c)[mIdx], 0));
  const grandTotal = capex.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  // Chart data
  const chartData = months.map((m, i) => ({ month: m, capex: capexOutflow[i], depreciation: depreciationTotals[i] }));

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveCapexBulk(fiscalYear, capex);
      setSuccess('CAPEX forecast saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save CAPEX data');
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
          <Typography variant="h5" gutterBottom>CAPEX Planning ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Purchase Month</TableCell>
                <TableCell>Depreciation</TableCell>
                <TableCell>Duration (mo)</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {capex.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell><TextField value={c.name} onChange={e => handleCapexChange(idx, 'name', e.target.value)} placeholder="Item Name" size="small" /></TableCell>
                  <TableCell>
                    <TextField select value={c.category} onChange={e => handleCapexChange(idx, 'category', e.target.value)} size="small">
                      <MenuItem value="">Select</MenuItem>
                      {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell><TextField value={c.amount} onChange={e => handleCapexChange(idx, 'amount', e.target.value)} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 100 }} /></TableCell>
                  <TableCell>
                    <TextField select value={c.purchaseMonth} onChange={e => handleCapexChange(idx, 'purchaseMonth', e.target.value)} size="small">
                      {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select value={c.depreciation} onChange={e => handleCapexChange(idx, 'depreciation', e.target.value)} size="small">
                      {depreciationMethods.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField value={c.duration} onChange={e => handleCapexChange(idx, 'duration', e.target.value)} size="small" type="number" inputProps={{ min: 1 }} sx={{ width: 80 }} disabled={c.depreciation === 'none'} />
                  </TableCell>
                  <TableCell><TextField value={c.notes} onChange={e => handleCapexChange(idx, 'notes', e.target.value)} size="small" /></TableCell>
                  <TableCell><IconButton onClick={() => handleRemoveCapex(idx)} disabled={capex.length === 1}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2}><b>Total</b></TableCell>
                <TableCell><b>{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                <TableCell colSpan={5}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddCapex}>Add CAPEX</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save CAPEX'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 900, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>CAPEX & Depreciation Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="capex" fill="#1976d2" name="CAPEX" />
              <Bar dataKey="depreciation" fill="#fbc02d" name="Depreciation" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetCapex; 