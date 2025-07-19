import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiscalYear } from '../context/FiscalYearContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getRevenue, saveRevenueBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const defaultBusinessLine = () => ({
  name: '',
  units: Array(12).fill(''),
  price: Array(12).fill(''),
});

const BudgetRevenue: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [lines, setLines] = useState<any[]>([defaultBusinessLine()]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getRevenue(fiscalYear)
      .then(res => {
        if (Array.isArray(res.data)) {
          setLines(res.data.length > 0 ? res.data : [defaultBusinessLine()]);
        } else {
          setLines([defaultBusinessLine()]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load revenue data');
        setLines([defaultBusinessLine()]);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleLineChange = (idx: number, field: 'name' | 'units' | 'price', value: any, monthIdx?: number) => {
    setLines(lines => lines.map((line, i) => {
      if (i !== idx) return line;
      if (field === 'name') return { ...line, name: value };
      if (field === 'units' || field === 'price') {
        const arr = [...line[field]];
        arr[monthIdx!] = value;
        return { ...line, [field]: arr };
      }
      return line;
    }));
  };

  const handleAddLine = () => setLines([...lines, defaultBusinessLine()]);
  const handleRemoveLine = (idx: number) => setLines(lines => lines.filter((_, i) => i !== idx));

  // Calculate revenue per line, per month, and totals
  const getLineRevenue = (line: any, monthIdx: number) => {
    const units = parseFloat(line.units[monthIdx]) || 0;
    const price = parseFloat(line.price[monthIdx]) || 0;
    return units * price;
  };
  const getLineTotal = (line: any) => months.reduce((sum, _, i) => sum + getLineRevenue(line, i), 0);
  const getMonthTotal = (monthIdx: number) => lines.reduce((sum, line) => sum + getLineRevenue(line, monthIdx), 0);
  const grandTotal = lines.reduce((sum, line) => sum + getLineTotal(line), 0);

  // Chart data
  const chartData = months.map((m, i) => ({
    month: m,
    revenue: getMonthTotal(i),
  }));

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveRevenueBulk(fiscalYear, lines);
      setSuccess('Revenue forecast saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save revenue data');
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
          <Typography variant="h5" gutterBottom>Revenue Forecast ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Business Line</TableCell>
                {months.map(m => <TableCell key={m} align="center" colSpan={2}>{m}</TableCell>)}
                <TableCell align="center"><b>Total</b></TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                {months.map((_, i) => [
                  <TableCell key={`u${i}`}>Units</TableCell>,
                  <TableCell key={`p${i}`}>Price</TableCell>
                ])}
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <TextField value={line.name} onChange={e => handleLineChange(idx, 'name', e.target.value)} placeholder="Business Line" size="small" />
                  </TableCell>
                  {months.map((_, mIdx) => [
                    <TableCell key={`u${mIdx}`}> <TextField value={line.units[mIdx]} onChange={e => handleLineChange(idx, 'units', e.target.value, mIdx)} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 70 }} /> </TableCell>,
                    <TableCell key={`p${mIdx}`}> <TextField value={line.price[mIdx]} onChange={e => handleLineChange(idx, 'price', e.target.value, mIdx)} size="small" type="number" inputProps={{ min: 0, step: 0.01 }} sx={{ width: 70 }} /> </TableCell>
                  ])}
                  <TableCell align="center"><b>{getLineTotal(line).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                  <TableCell><IconButton onClick={() => handleRemoveLine(idx)} disabled={lines.length === 1}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><b>Total</b></TableCell>
                {months.map((_, mIdx) => [
                  <TableCell key={`tu${mIdx}`}></TableCell>,
                  <TableCell key={`tr${mIdx}`}><b>{getMonthTotal(mIdx).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                ])}
                <TableCell align="center"><b>{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLine}>Add Business Line</Button>
            <Button variant="contained" onClick={handleSave}>Save Forecast</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 900, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Monthly Revenue Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#1976d2" name="Revenue" />
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

export default BudgetRevenue; 