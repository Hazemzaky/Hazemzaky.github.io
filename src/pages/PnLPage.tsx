import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Chip, Divider, TextField, MenuItem, Switch, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import axios from 'axios';

const PnLPage = () => {
  // Filters
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [department, setDepartment] = useState('');
  const [site, setSite] = useState('');
  const [branch, setBranch] = useState('');
  const [operationType, setOperationType] = useState('');
  const [vsBudget, setVsBudget] = useState(false);
  const [vsLastYear, setVsLastYear] = useState(false);
  // Data
  const [summary, setSummary] = useState<any>(null);
  const [table, setTable] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all data from backend
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [dateRange, department, site, branch, operationType, vsBudget, vsLastYear]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with your backend endpoints
      const [summaryRes, tableRes, chartsRes, analysisRes] = await Promise.all([
        axios.get('/api/pnl/summary', { params: { dateRange, department, site, branch, operationType, vsBudget, vsLastYear } }),
        axios.get('/api/pnl/table', { params: { dateRange, department, site, branch, operationType, vsBudget, vsLastYear } }),
        axios.get('/api/pnl/charts', { params: { dateRange, department, site, branch, operationType, vsBudget, vsLastYear } }),
        axios.get('/api/pnl/analysis', { params: { dateRange, department, site, branch, operationType, vsBudget, vsLastYear } }),
      ]);
      setSummary(summaryRes.data);
      setTable(Array.isArray(tableRes.data) ? tableRes.data : []);
      setCharts(chartsRes.data);
      setAnalysis(analysisRes.data);
    } catch (err: any) {
      setError('Failed to load P&L data');
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={3}>Profit & Loss (P&L) Statement</Typography>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4, background: '#fafdff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField label="Department" value={department} onChange={e => setDepartment(e.target.value)} select size="small" sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {/* Populate from backend if needed */}
            <MenuItem value="Logistics">Logistics</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>
          <TextField label="Site" value={site} onChange={e => setSite(e.target.value)} select size="small" sx={{ minWidth: 140 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Main">Main</MenuItem>
            <MenuItem value="Branch1">Branch 1</MenuItem>
          </TextField>
          <TextField label="Branch" value={branch} onChange={e => setBranch(e.target.value)} select size="small" sx={{ minWidth: 140 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="North">North</MenuItem>
            <MenuItem value="South">South</MenuItem>
          </TextField>
          <TextField label="Operation Type" value={operationType} onChange={e => setOperationType(e.target.value)} select size="small" sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Transport">Transport</MenuItem>
            <MenuItem value="Storage">Storage</MenuItem>
          </TextField>
          <FormControlLabel control={<Switch checked={vsBudget} onChange={e => setVsBudget(e.target.checked)} />} label="Vs Budget" />
          <FormControlLabel control={<Switch checked={vsLastYear} onChange={e => setVsLastYear(e.target.checked)} />} label="Vs Last Year" />
          {/* Date Range Picker (replace with MUI DatePicker as needed) */}
          <TextField label="Start Date" type="date" size="small" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" type="date" size="small" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
        </Box>
      </Paper>
      {/* Summary Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
        {loading ? <CircularProgress /> : summary && (
          <>
            <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" color="text.secondary">Revenue</Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">${summary.revenue?.toLocaleString() || 0}</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" color="text.secondary">Expenses</Typography>
              <Typography variant="h5" fontWeight={700} color="error.main">${summary.expenses?.toLocaleString() || 0}</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" color="text.secondary">Gross Profit</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">${summary.grossProfit?.toLocaleString() || 0}</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" color="text.secondary">Net Profit</Typography>
              <Typography variant="h5" fontWeight={700} color={summary.netProfit >= 0 ? 'success.main' : 'error.main'}>${summary.netProfit?.toLocaleString() || 0}</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 180, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" color="text.secondary">Gross Margin %</Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">{summary.grossMarginPct ? `${summary.grossMarginPct}%` : '-'}</Typography>
            </Paper>
          </>
        )}
      </Box>
      {/* P&L Table */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>P&L Table</Typography>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Line Item</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Amount</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>% of Revenue</th>
                  <th style={{ textAlign: 'center', padding: 8 }}>Trend</th>
                  <th style={{ textAlign: 'center', padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row: any, idx: number) => (
                  <tr key={row.id || idx} style={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: 8 }}>{row.label}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: row.amount >= 0 ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>${row.amount?.toLocaleString() || 0}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{row.pctOfRevenue ? `${row.pctOfRevenue}%` : '-'}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{row.trend === 'up' ? <TrendingUpIcon color="success" /> : row.trend === 'down' ? <TrendingDownIcon color="error" /> : '-'}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      {row.expandable && <Button size="small" variant="outlined">Drill Down</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
      {/* Charts */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
        <Paper sx={{ p: 2, flex: '1 1 320px', minWidth: 320, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Net Profit Over Time</Typography>
          <Box sx={{ height: 220 }}>
            {loading ? <CircularProgress /> : charts && charts.netProfitOverTime && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.netProfitOverTime}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="netProfit" stroke="#1976d2" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 320px', minWidth: 320, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Revenue vs Expense vs Net</Typography>
          <Box sx={{ height: 220 }}>
            {loading ? <CircularProgress /> : charts && charts.revenueVsExpense && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.revenueVsExpense}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1976d2" />
                  <Bar dataKey="expense" fill="#d32f2f" />
                  <Bar dataKey="net" fill="#388e3c" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 320px', minWidth: 320, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Margin Trend</Typography>
          <Box sx={{ height: 220 }}>
            {loading ? <CircularProgress /> : charts && charts.marginTrend && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.marginTrend}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="margin" stroke="#388e3c" fill="#c8e6c9" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
      </Box>
      {/* Smart Analysis */}
      {analysis && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Smart Analysis</Typography>
          {analysis.anomalies && analysis.anomalies.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>Anomalies detected: {analysis.anomalies.join(', ')}</Alert>
          )}
          {analysis.risingCostCenters && analysis.risingCostCenters.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>Rising cost centers: {analysis.risingCostCenters.join(', ')}</Alert>
          )}
          {analysis.marginDrop && (
            <Alert severity="error" sx={{ mb: 2 }}>Margin dropped by {analysis.marginDrop}%! Recommend manager review.</Alert>
          )}
        </Paper>
      )}
      {/* Export & Share */}
      <Box display="flex" gap={2} mb={3}>
        <Button variant="contained" startIcon={<DownloadIcon />} sx={{ fontWeight: 600, borderRadius: 2 }}>
          Export PDF
        </Button>
        <Button variant="contained" startIcon={<DownloadIcon />} sx={{ fontWeight: 600, borderRadius: 2 }}>
          Export Excel
        </Button>
        <Button variant="contained" startIcon={<ShareIcon />} sx={{ fontWeight: 600, borderRadius: 2 }}>
          Share
        </Button>
      </Box>
    </Box>
  );
};

export default PnLPage; 