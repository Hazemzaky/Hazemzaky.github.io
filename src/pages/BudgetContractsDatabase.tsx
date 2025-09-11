import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Snackbar, Alert, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiscalYear } from '../context/FiscalYearContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, LineChart } from 'recharts';
import { getContracts, saveContractsBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const defaultContract = () => ({
  name: '',
  client: '',
  value: '',
  probability: '',
  expectedClose: months[0],
  status: 'open',
  notes: '',
});

const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

function getMonthIdx(m: string) {
  return months.indexOf(m);
}

const BudgetContractsDatabase: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [contracts, setContracts] = useState<any[]>([defaultContract()]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getContracts(fiscalYear)
      .then(res => {
        if (Array.isArray(res.data)) {
          setContracts(res.data.length > 0 ? res.data : [defaultContract()]);
        } else {
          setContracts([defaultContract()]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load contracts data');
        setContracts([defaultContract()]);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleContractChange = (idx: number, field: string, value: any) => {
    setContracts(contracts => contracts.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const handleAddContract = () => setContracts([...contracts, defaultContract()]);
  const handleRemoveContract = (idx: number) => setContracts(contracts => contracts.filter((_, i) => i !== idx));

  // Weighted pipeline value per contract
  const getWeightedValue = (c: any) => {
    const value = parseFloat(c.value) || 0;
    const prob = parseFloat(c.probability) || 0;
    return value * prob / 100;
  };
  // Pipeline value per month
  const pipelinePerMonth = months.map((_, mIdx) => contracts.reduce((sum, c) => (getMonthIdx(c.expectedClose) === mIdx && c.status === 'open') ? sum + getWeightedValue(c) : sum, 0));
  // Count of expected closes per month
  const closesPerMonth = months.map((_, mIdx) => contracts.filter(c => getMonthIdx(c.expectedClose) === mIdx && c.status === 'open').length);
  // Chart data
  const chartData = months.map((m, i) => ({ month: m, pipeline: pipelinePerMonth[i], closes: closesPerMonth[i] }));
  const totalWeighted = contracts.reduce((sum, c) => c.status === 'open' ? sum + getWeightedValue(c) : sum, 0);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveContractsBulk(fiscalYear, contracts);
      setSuccess('Contracts pipeline saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save contracts data');
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
          <Typography variant="h5" gutterBottom>Contracts Pipeline ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Probability (%)</TableCell>
                <TableCell>Weighted Value</TableCell>
                <TableCell>Expected Close</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell><TextField value={c.name} onChange={e => handleContractChange(idx, 'name', e.target.value)} placeholder="Contract Name" size="small" /></TableCell>
                  <TableCell><TextField value={c.client} onChange={e => handleContractChange(idx, 'client', e.target.value)} placeholder="Client" size="small" /></TableCell>
                  <TableCell><TextField value={c.value} onChange={e => handleContractChange(idx, 'value', e.target.value)} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 100 }} /></TableCell>
                  <TableCell><TextField value={c.probability} onChange={e => handleContractChange(idx, 'probability', e.target.value)} size="small" type="number" inputProps={{ min: 0, max: 100, step: 1 }} sx={{ width: 80 }} /></TableCell>
                  <TableCell>{getWeightedValue(c).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <TextField select value={c.expectedClose} onChange={e => handleContractChange(idx, 'expectedClose', e.target.value)} size="small">
                      {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select value={c.status} onChange={e => handleContractChange(idx, 'status', e.target.value)} size="small">
                      {statuses.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell><TextField value={c.notes} onChange={e => handleContractChange(idx, 'notes', e.target.value)} size="small" /></TableCell>
                  <TableCell><IconButton onClick={() => handleRemoveContract(idx)} disabled={contracts.length === 1}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4}><b>Total Weighted Pipeline</b></TableCell>
                <TableCell><b>{totalWeighted.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></TableCell>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddContract}>Add Contract</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Pipeline'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 900, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Pipeline & Expected Closes Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="pipeline" stroke="#1976d2" name="Pipeline Value" />
              <Line yAxisId="right" type="monotone" dataKey="closes" stroke="#fbc02d" name="Expected Closes" />
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

export default BudgetContractsDatabase; 