import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Card, CardContent, Typography, Snackbar, Alert } from '@mui/material';
import { useFiscalYear } from '../context/FiscalYearContext';
import { getAssumptions, saveAssumptions } from '../services/budgetApi';

const defaultAssumptions = {
  inflation: 3,
  costMultiplier: 1,
  exchangeRate: 3.3,
  salesGrowth: 5,
};

const BudgetAssumptions: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getAssumptions(fiscalYear)
      .then(res => {
        if (res.data && typeof res.data === 'object' && 'inflation' in res.data && 'costMultiplier' in res.data && 'exchangeRate' in res.data && 'salesGrowth' in res.data) {
          setAssumptions({
            inflation: Number(res.data.inflation),
            costMultiplier: Number(res.data.costMultiplier),
            exchangeRate: Number(res.data.exchangeRate),
            salesGrowth: Number(res.data.salesGrowth),
          });
        } else {
          setAssumptions(defaultAssumptions);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load assumptions');
        setAssumptions(defaultAssumptions);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssumptions({ ...assumptions, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveAssumptions({ ...assumptions, year: fiscalYear });
      setSuccess('Assumptions saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save assumptions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Budget Assumptions ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
        {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading...</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Inflation (%)" name="inflation" value={assumptions.inflation} onChange={handleChange} type="number" />
          <TextField label="Cost Multiplier" name="costMultiplier" value={assumptions.costMultiplier} onChange={handleChange} type="number" />
          <TextField label="Exchange Rate" name="exchangeRate" value={assumptions.exchangeRate} onChange={handleChange} type="number" />
          <TextField label="Sales Growth (%)" name="salesGrowth" value={assumptions.salesGrowth} onChange={handleChange} type="number" />
        </Box>
        <Button variant="contained" sx={{ mt: 3 }} onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Assumptions'}</Button>
      </CardContent>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Card>
  );
};

export default BudgetAssumptions; 