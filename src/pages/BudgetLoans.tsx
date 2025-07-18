import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Snackbar, Alert, MenuItem, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFiscalYear } from '../context/FiscalYearContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getLoans, saveLoansBulk } from '../services/budgetApi';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const defaultLoan = () => ({
  name: '',
  amount: '',
  start: months[0],
  rate: '',
  term: '',
  type: 'annuity',
  notes: '',
  expanded: false,
});

const loanTypes = [
  { value: 'annuity', label: 'Annuity' },
  { value: 'straight', label: 'Straight-Line' },
];

function getMonthIdx(m: string) {
  return months.indexOf(m);
}

// Amortization calculation
function getAmortization(loan: any) {
  const amount = parseFloat(loan.amount) || 0;
  const rate = (parseFloat(loan.rate) || 0) / 100 / 12;
  const term = parseInt(loan.term) || 0;
  if (!amount || !term) return [];
  let schedule = [];
  let balance = amount;
  if (loan.type === 'annuity') {
    // Annuity formula
    const payment = rate === 0 ? amount / term : (amount * rate) / (1 - Math.pow(1 + rate, -term));
    for (let i = 0; i < term; i++) {
      const interest = balance * rate;
      const principal = payment - interest;
      balance -= principal;
      schedule.push({
        month: i + 1,
        payment: payment,
        principal: principal,
        interest: interest,
        balance: Math.max(balance, 0),
      });
    }
  } else {
    // Straight-line
    const principal = amount / term;
    for (let i = 0; i < term; i++) {
      const interest = (amount - principal * i) * rate;
      const payment = principal + interest;
      balance -= principal;
      schedule.push({
        month: i + 1,
        payment: payment,
        principal: principal,
        interest: interest,
        balance: Math.max(balance, 0),
      });
    }
  }
  return schedule;
}

const BudgetLoans: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [loans, setLoans] = useState<any[]>([defaultLoan()]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getLoans(fiscalYear)
      .then(res => {
        if (Array.isArray(res.data)) {
          setLoans(res.data.length > 0 ? res.data : [defaultLoan()]);
        } else {
          setLoans([defaultLoan()]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load loans data');
        setLoans([defaultLoan()]);
        setLoading(false);
      });
  }, [fiscalYear]);

  const handleLoanChange = (idx: number, field: string, value: any) => {
    setLoans(loans => loans.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };
  const handleAddLoan = () => setLoans([...loans, defaultLoan()]);
  const handleRemoveLoan = (idx: number) => setLoans(loans => loans.filter((_, i) => i !== idx));
  const handleToggleExpand = (idx: number) => setLoans(loans => loans.map((l, i) => i === idx ? { ...l, expanded: !l.expanded } : l));

  // For each loan, map amortization to fiscal year months
  function getLoanMonthlyOutflow(loan: any) {
    const startIdx = getMonthIdx(loan.start);
    const schedule = getAmortization(loan);
    const outflow = Array(12).fill(0);
    for (let i = 0; i < schedule.length; i++) {
      const mIdx = (startIdx + i) % 12;
      if (mIdx >= 0 && mIdx < 12) outflow[mIdx] += schedule[i].payment;
    }
    return outflow;
  }
  // Combined outflow per month
  const monthTotals = months.map((_, mIdx) => loans.reduce((sum, loan) => sum + (getLoanMonthlyOutflow(loan)[mIdx] || 0), 0));
  const grandTotal = monthTotals.reduce((a, b) => a + b, 0);
  // Chart data
  const chartData = months.map((m, i) => ({ month: m, outflow: monthTotals[i] }));

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await saveLoansBulk(fiscalYear, loans);
      setSuccess('Loan forecast saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save loans data');
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
          <Typography variant="h5" gutterBottom>Loan Management ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>Rate (%)</TableCell>
                <TableCell>Term (mo)</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Amortization</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((l, idx) => (
                <React.Fragment key={idx}>
                  <TableRow>
                    <TableCell><TextField value={l.name} onChange={e => handleLoanChange(idx, 'name', e.target.value)} placeholder="Loan Name" size="small" /></TableCell>
                    <TableCell><TextField value={l.amount} onChange={e => handleLoanChange(idx, 'amount', e.target.value)} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 100 }} /></TableCell>
                    <TableCell>
                      <TextField select value={l.start} onChange={e => handleLoanChange(idx, 'start', e.target.value)} size="small">
                        {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    <TableCell><TextField value={l.rate} onChange={e => handleLoanChange(idx, 'rate', e.target.value)} size="small" type="number" inputProps={{ min: 0, step: 0.01 }} sx={{ width: 80 }} /></TableCell>
                    <TableCell><TextField value={l.term} onChange={e => handleLoanChange(idx, 'term', e.target.value)} size="small" type="number" inputProps={{ min: 1 }} sx={{ width: 80 }} /></TableCell>
                    <TableCell>
                      <TextField select value={l.type} onChange={e => handleLoanChange(idx, 'type', e.target.value)} size="small">
                        {loanTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    <TableCell><TextField value={l.notes} onChange={e => handleLoanChange(idx, 'notes', e.target.value)} size="small" /></TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleToggleExpand(idx)}>{l.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                    </TableCell>
                    <TableCell><IconButton onClick={() => handleRemoveLoan(idx)} disabled={loans.length === 1}><DeleteIcon /></IconButton></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                      <Collapse in={l.expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, background: '#f9f9f9' }}>
                          <Typography variant="subtitle1">Amortization Table</Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Principal</TableCell>
                                <TableCell>Interest</TableCell>
                                <TableCell>Balance</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {getAmortization(l).map((row, i) => (
                                <TableRow key={i}>
                                  <TableCell>{row.month}</TableCell>
                                  <TableCell>{row.payment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell>{row.principal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell>{row.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell>{row.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLoan}>Add Loan</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Loans'}</Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ maxWidth: 900, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Monthly Loan Outflow</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="outflow" fill="#1976d2" name="Outflow" />
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

export default BudgetLoans; 