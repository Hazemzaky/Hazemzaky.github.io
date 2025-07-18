import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, Alert, Tabs, Tab
} from '@mui/material';
import dayjs from 'dayjs';
import Countdown from 'react-countdown';
import AddIcon from '@mui/icons-material/Add';

const tabCategories = [
  'Budget Assumptions', 'Summary', 'Variance', 'Expected Sales', 'Sales', 'Other', 'Logistics Cost',
  'Cost Of Water Sale', 'Cost Of Rental Equipment', 'GA', 'OPEX', 'Staff', 'Costs', 'Manpower', 'Capex'
];

const getNextBudgetDate = (year: number) => dayjs(`${year}-04-01T00:00:00`);

const BudgetsPage: React.FC = () => {
  const [budgetsByTab, setBudgetsByTab] = useState<{ [tab: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedTab, setSelectedTab] = useState(0);
  const [form, setForm] = useState<any>({
    department: '',
    project: '',
    period: '',
    accountCode: '',
    amount: '',
    forecast: '',
    scenarios: { best: '', worst: '', expected: '' },
    notes: '',
    subCategory: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all budgets for the selected year, grouped by tab
  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/budgets?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Group by category/tab
        const grouped: { [tab: string]: any[] } = {};
        tabCategories.forEach(tab => grouped[tab] = []);
        data.forEach((b: any) => {
          if (grouped[b.category]) grouped[b.category].push(b);
        });
        setBudgetsByTab(grouped);
        // Update years list
        const allYears = new Set<number>([selectedYear, ...data.map((b: any) => b.year)]);
        setYears(Array.from(allYears).sort());
      } catch (err: any) {
        setError('Failed to fetch budgets');
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [selectedYear]);

  // Add new year
  const handleAddYear = () => {
    const nextYear = Math.max(...years, dayjs().year()) + 1;
    setYears([...years, nextYear]);
    setSelectedYear(nextYear);
  };

  // Add Budget handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleScenarioChange = (field: string, value: string) => {
    setForm({ ...form, scenarios: { ...form.scenarios, [field]: value } });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          year: selectedYear,
          category: tabCategories[selectedTab],
          amount: Number(form.amount),
          forecast: Number(form.forecast),
          scenarios: {
            best: Number(form.scenarios.best),
            worst: Number(form.scenarios.worst),
            expected: Number(form.scenarios.expected),
          },
        }),
      });
      setSuccess('Budget entry added!');
      setForm({
        department: '',
        project: '',
        period: '',
        accountCode: '',
        amount: '',
        forecast: '',
        scenarios: { best: '', worst: '', expected: '' },
        notes: '',
        subCategory: '',
      });
      // Refetch
      const res = await fetch(`/api/budgets?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const grouped: { [tab: string]: any[] } = {};
      tabCategories.forEach(tab => grouped[tab] = []);
      data.forEach((b: any) => {
        if (grouped[b.category]) grouped[b.category].push(b);
      });
      setBudgetsByTab(grouped);
    } catch (err: any) {
      setError('Failed to add budget entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Table totals for current tab
  const currentTabBudgets = budgetsByTab[tabCategories[selectedTab]] || [];
  const totalAmount = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.amount || 0), 0), [currentTabBudgets]);
  const totalForecast = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.forecast || 0), 0), [currentTabBudgets]);
  const totalActual = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.actual || 0), 0), [currentTabBudgets]);
  const totalVariance = useMemo(() => currentTabBudgets.reduce((sum, b) => sum + (b.variance || 0), 0), [currentTabBudgets]);

  return (
    <Box p={3}>
      {/* Year Selector and Countdown */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <TextField
          select
          label="Year"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          sx={{ minWidth: 120 }}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </TextField>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddYear}>Add Year</Button>
        <Box ml={2}>
          <Typography variant="subtitle1">Next Budget Cycle:</Typography>
          <Countdown date={getNextBudgetDate(selectedYear).toDate()} />
        </Box>
      </Box>
      {/* Tab Bar */}
      <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {tabCategories.map((cat, idx) => <Tab key={cat} label={cat} />)}
      </Tabs>
      {/* Add Data Form */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <TextField label="Department" name="department" value={form.department} onChange={handleFormChange} required sx={{ minWidth: 160 }} />
          <TextField label="Project" name="project" value={form.project} onChange={handleFormChange} sx={{ minWidth: 120 }} />
          <TextField label="Period" name="period" value={form.period} onChange={handleFormChange} required sx={{ minWidth: 100 }} />
          <TextField label="Account Code" name="accountCode" value={form.accountCode} onChange={handleFormChange} sx={{ minWidth: 120 }} />
          <TextField label="Amount" name="amount" value={form.amount} onChange={handleFormChange} type="number" required sx={{ minWidth: 100 }} />
          <TextField label="Forecast" name="forecast" value={form.forecast} onChange={handleFormChange} type="number" required sx={{ minWidth: 100 }} />
          <TextField label="Best" name="best" value={form.scenarios.best} onChange={e => handleScenarioChange('best', e.target.value)} type="number" required sx={{ minWidth: 80 }} />
          <TextField label="Worst" name="worst" value={form.scenarios.worst} onChange={e => handleScenarioChange('worst', e.target.value)} type="number" required sx={{ minWidth: 80 }} />
          <TextField label="Expected" name="expected" value={form.scenarios.expected} onChange={e => handleScenarioChange('expected', e.target.value)} type="number" required sx={{ minWidth: 80 }} />
          <TextField label="Notes" name="notes" value={form.notes} onChange={handleFormChange} sx={{ minWidth: 160 }} />
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>Add Entry</Button>
        </form>
      </Paper>
      {/* Table for Selected Tab/Year */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>{tabCategories[selectedTab]} ({selectedYear})</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Account Code</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Forecast</TableCell>
                  <TableCell>Best</TableCell>
                  <TableCell>Worst</TableCell>
                  <TableCell>Expected</TableCell>
                  <TableCell>Actual</TableCell>
                  <TableCell>Variance</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTabBudgets.map((b, idx) => (
                  <TableRow key={b._id} sx={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <TableCell>{b.department}</TableCell>
                    <TableCell>{b.project || '-'}</TableCell>
                    <TableCell>{b.period}</TableCell>
                    <TableCell>{b.accountCode || '-'}</TableCell>
                    <TableCell>{b.amount?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                    <TableCell>{b.forecast?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                    <TableCell>{b.scenarios?.best}</TableCell>
                    <TableCell>{b.scenarios?.worst}</TableCell>
                    <TableCell>{b.scenarios?.expected}</TableCell>
                    <TableCell>{b.actual?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                    <TableCell>{b.variance?.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</TableCell>
                    <TableCell>{b.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Totals Card */}
        <Card sx={{ mt: 2, background: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle1">Totals</Typography>
            <Box display="flex" gap={4} flexWrap="wrap">
              <Typography>Total Amount: <b>{totalAmount.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</b></Typography>
              <Typography>Total Forecast: <b>{totalForecast.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</b></Typography>
              <Typography>Total Actual: <b>{totalActual.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</b></Typography>
              <Typography>Total Variance: <b>{totalVariance.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</b></Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    </Box>
  );
};

export default BudgetsPage; 