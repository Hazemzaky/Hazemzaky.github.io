import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useFiscalYear } from '../context/FiscalYearContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getVariance, saveVarianceBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const modules = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'opex', label: 'OPEX' },
  { value: 'staffing', label: 'Staffing' },
  { value: 'capex', label: 'CAPEX' },
];

const defaultData: { [key: string]: any[] } = {
  revenue: [
    { name: 'Equipment Rental', budget: Array(12).fill(10000), actual: Array(12).fill('') },
    { name: 'Water Sales', budget: Array(12).fill(8000), actual: Array(12).fill('') },
  ],
  opex: [
    { name: 'Logistics', budget: Array(12).fill(2000), actual: Array(12).fill('') },
    { name: 'G&A', budget: Array(12).fill(1500), actual: Array(12).fill('') },
  ],
  staffing: [
    { name: 'Operations', budget: Array(12).fill(3000), actual: Array(12).fill('') },
    { name: 'Finance', budget: Array(12).fill(1200), actual: Array(12).fill('') },
  ],
  capex: [
    { name: 'Equipment', budget: Array(12).fill(5000), actual: Array(12).fill('') },
    { name: 'Vehicles', budget: Array(12).fill(4000), actual: Array(12).fill('') },
  ],
};

const BudgetVariance: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [selectedModule, setSelectedModule] = useState<string>('revenue');
  const [data, setData] = useState<any>(defaultData);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getVariance(fiscalYear, selectedModule)
      .then((res: any) => {
        if (Array.isArray(res.data)) {
          setData((prev: any) => ({ ...prev, [selectedModule]: res.data.length > 0 ? res.data : defaultData[selectedModule] }));
        } else {
          setData((prev: any) => ({ ...prev, [selectedModule]: defaultData[selectedModule] }));
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Failed to load variance data');
        setData((prev: any) => ({ ...prev, [selectedModule]: defaultData[selectedModule] }));
        setLoading(false);
      });
  }, [fiscalYear, selectedModule]);

  const handleActualChange = (rowIdx: number, mIdx: number, value: any) => {
    setData((prev: any) => {
      const updated = { ...prev };
      updated[selectedModule] = updated[selectedModule].map((row: any, i: number) => {
        if (i !== rowIdx) return row;
        const actual = [...row.actual];
        actual[mIdx] = value;
        return { ...row, actual };
      });
      return updated;
    });
  };

  // Calculate variance and variance %
  const getRowVariance = (row: any, mIdx: number) => {
    const budget = parseFloat(row.budget[mIdx]) || 0;
    const actual = parseFloat(row.actual[mIdx]) || 0;
    return actual - budget;
  };
  const getVariancePct = (row: any, mIdx: number) => {
    const budget = parseFloat(row.budget[mIdx]) || 0;
    if (!budget) return '';
    return (((parseFloat(row.actual[mIdx]) || 0) - budget) / budget * 100).toFixed(1);
  };

  // Chart data: total variance per month
  const chartData = months.map((m, mIdx) => {
    const totalBudget = data[selectedModule].reduce((sum: number, row: any) => sum + (parseFloat(row.budget[mIdx]) || 0), 0);
    const totalActual = data[selectedModule].reduce((sum: number, row: any) => sum + (parseFloat(row.actual[mIdx]) || 0), 0);
    return {
      month: m,
      budget: totalBudget,
      actual: totalActual,
      variance: totalActual - totalBudget,
    };
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveVarianceBulk(fiscalYear, selectedModule, data[selectedModule]);
      setSuccess('Variance data saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save variance data');
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
          <Typography variant="h5" gutterBottom>Variance Analysis ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <FormControl sx={{ minWidth: 200, mb: 2 }} size="small">
            <InputLabel id="module-label">Module</InputLabel>
            <Select labelId="module-label" value={selectedModule} label="Module" onChange={e => setSelectedModule(e.target.value)}>
              {modules.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item/Category</TableCell>
                {months.map(m => <TableCell key={m} align="center">{m}</TableCell>)}
                <TableCell align="center"><b>Total Budget</b></TableCell>
                <TableCell align="center"><b>Total Actual</b></TableCell>
                <TableCell align="center"><b>Total Variance</b></TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                {months.map((_, mIdx) => [
                  <TableCell key={`b${mIdx}`}>Budget</TableCell>,
                  <TableCell key={`a${mIdx}`}>Actual</TableCell>,
                  <TableCell key={`v${mIdx}`}>Variance</TableCell>,
                  <TableCell key={`p${mIdx}`}>Var %</TableCell>,
                ])}
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data[selectedModule].map((row: any, rowIdx: number) => {
                const totalBudget = row.budget.reduce((a: number, b: any) => a + (parseFloat(b) || 0), 0);
                const totalActual = row.actual.reduce((a: number, b: any) => a + (parseFloat(b) || 0), 0);
                const totalVariance = totalActual - totalBudget;
                return (
                  <TableRow key={rowIdx}>
                    <TableCell>{row.name}</TableCell>
                    {months.map((_, mIdx) => [
                      <TableCell key={`b${mIdx}`}>{row.budget[mIdx]}</TableCell>,
                      <TableCell key={`a${mIdx}`}> <TextField value={row.actual[mIdx]} onChange={e => handleActualChange(rowIdx, mIdx, e.target.value)} size="small" type="number" sx={{ width: 80 }} /> </TableCell>,
                      <TableCell key={`v${mIdx}`}>{getRowVariance(row, mIdx)}</TableCell>,
                      <TableCell key={`p${mIdx}`}>{getVariancePct(row, mIdx)}%</TableCell>,
                    ])}
                    <TableCell align="center"><b>{totalBudget}</b></TableCell>
                    <TableCell align="center"><b>{totalActual}</b></TableCell>
                    <TableCell align="center"><b>{totalVariance}</b></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Variance'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 900, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Variance Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#1976d2" name="Budget" />
              <Bar dataKey="actual" fill="#388e3c" name="Actual" />
              <Bar dataKey="variance" fill="#d32f2f" name="Variance" />
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

export default BudgetVariance; 