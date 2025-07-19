import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiscalYear } from '../context/FiscalYearContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getOpex, saveOpexBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const defaultCategories = [
  'Logistics',
  'G&A',
  'Insurance',
  'Marketing',
  'Other',
];

const defaultCategory = (name = '') => ({
  name,
  costs: Array(12).fill(''),
});

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#f57c00'];

const BudgetOpex: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [categories, setCategories] = useState<any[]>(defaultCategories.map(defaultCategory));
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load OPEX data from backend on mount and fiscalYear change
  useEffect(() => {
    setLoading(true);
    setError('');
    getOpex(fiscalYear)
      .then(res => {
        if (Array.isArray(res.data)) {
          setCategories(res.data.length > 0 ? res.data : defaultCategories.map(defaultCategory));
        } else {
          setCategories(defaultCategories.map(defaultCategory));
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load OPEX data');
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleCategoryChange = (idx: number, field: 'name' | 'costs', value: any, monthIdx?: number) => {
    setCategories(cats => cats.map((cat, i) => {
      if (i !== idx) return cat;
      if (field === 'name') return { ...cat, name: value };
      if (field === 'costs') {
        const arr = [...cat.costs];
        arr[monthIdx!] = value;
        return { ...cat, costs: arr };
      }
      return cat;
    }));
  };

  const handleAddCategory = () => setCategories([...categories, defaultCategory()]);
  const handleRemoveCategory = (idx: number) => setCategories(cats => cats.filter((_, i) => i !== idx));

  // Calculate totals
  const getCategoryTotal = (cat: any) => months.reduce((sum, _, i) => sum + (parseFloat(cat.costs[i]) || 0), 0);
  const getMonthTotal = (monthIdx: number) => categories.reduce((sum, cat) => sum + (parseFloat(cat.costs[monthIdx]) || 0), 0);
  const grandTotal = categories.reduce((sum, cat) => sum + getCategoryTotal(cat), 0);

  // Pie chart data
  const pieData = categories.map(cat => ({ name: cat.name || 'Unnamed', value: getCategoryTotal(cat) })).filter(d => d.value > 0);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveOpexBulk(fiscalYear, categories);
      setSuccess('OPEX forecast saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save OPEX data');
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
          <Typography variant="h5" gutterBottom>OPEX & Cost Forecast ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cost Category</TableCell>
                {months.map(m => <TableCell key={m} align="center">{m}</TableCell>)}
                <TableCell align="center"><b>Total</b></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <TextField value={cat.name} onChange={e => handleCategoryChange(idx, 'name', e.target.value)} placeholder="Category" size="small" />
                  </TableCell>
                  {months.map((_, mIdx) => (
                    <TableCell key={mIdx}>
                      <TextField value={cat.costs[mIdx]} onChange={e => handleCategoryChange(idx, 'costs', e.target.value, mIdx)} size="small" type="number" inputProps={{ min: 0, step: 0.01 }} sx={{ width: 80 }} />
                    </TableCell>
                  ))}
                  <TableCell align="center"><b>{getCategoryTotal(cat).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                  <TableCell><IconButton onClick={() => handleRemoveCategory(idx)} disabled={categories.length === 1}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><b>Total</b></TableCell>
                {months.map((_, mIdx) => (
                  <TableCell key={mIdx}><b>{getMonthTotal(mIdx).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                ))}
                <TableCell align="center"><b>{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddCategory}>Add Category</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save OPEX'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>OPEX Breakdown</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetOpex; 