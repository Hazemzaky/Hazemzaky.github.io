import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, MenuItem, Select, FormControl, InputLabel, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useFiscalYear } from '../context/FiscalYearContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const months = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#f57c00'];

// Simulated data for dashboard
const simulated = {
  revenue: months.map((m, i) => 10000 + i * 500),
  opex: months.map((m, i) => 6000 + i * 200),
  profit: months.map((m, i) => 4000 + i * 300),
  headcount: months.map((m, i) => 20 + (i % 3)),
  pipeline: months.map((m, i) => 20000 - i * 1000),
  categories: [
    { name: 'Equipment Rental', value: 70000 },
    { name: 'Water Sales', value: 50000 },
    { name: 'Logistics', value: 20000 },
    { name: 'G&A', value: 18000 },
  ],
  table: months.map((m, i) => ({
    month: m,
    revenue: 10000 + i * 500,
    opex: 6000 + i * 200,
    profit: 4000 + i * 300,
    headcount: 20 + (i % 3),
    pipeline: 20000 - i * 1000,
  })),
};

const BudgetDashboard: React.FC = () => {
  const { fiscalYear } = useFiscalYear();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');

  // Filtered data (simulate for now)
  const filtered = simulated.table.filter(row => selectedMonth === 'all' || row.month === selectedMonth);
  const totalRevenue = filtered.reduce((sum, row) => sum + row.revenue, 0);
  const totalOpex = filtered.reduce((sum, row) => sum + row.opex, 0);
  const totalProfit = filtered.reduce((sum, row) => sum + row.profit, 0);
  const avgHeadcount = filtered.length ? (filtered.reduce((sum, row) => sum + row.headcount, 0) / filtered.length) : 0;
  const totalPipeline = filtered.reduce((sum, row) => sum + row.pipeline, 0);

  // Export handlers (simulate)
  const handleExportExcel = () => alert('Export to Excel (simulated)');
  const handleExportPDF = () => alert('Export to PDF (simulated)');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Budget Dashboard ({fiscalYear}/{(fiscalYear+1).toString().slice(-2)})</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={handleExportExcel}>Export Excel</Button>
          <Button variant="outlined" onClick={handleExportPDF}>Export PDF</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="month-label">Month</InputLabel>
          <Select labelId="month-label" value={selectedMonth} label="Month" onChange={e => setSelectedMonth(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="module-label">Module</InputLabel>
          <Select labelId="module-label" value={selectedModule} label="Module" onChange={e => setSelectedModule(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="revenue">Revenue</MenuItem>
            <MenuItem value="opex">OPEX</MenuItem>
            <MenuItem value="profit">Profit</MenuItem>
            <MenuItem value="headcount">Headcount</MenuItem>
            <MenuItem value="pipeline">Pipeline</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {/* Card Row */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ display: 'inline-block', width: '19%', minWidth: 220, mr: 2, mb: 2, verticalAlign: 'top' }}>
          <Card><CardContent><Typography variant="subtitle2">Total Revenue</Typography><Typography variant="h5">{totalRevenue.toLocaleString()}</Typography></CardContent></Card>
        </Box>
        <Box sx={{ display: 'inline-block', width: '19%', minWidth: 220, mr: 2, mb: 2, verticalAlign: 'top' }}>
          <Card><CardContent><Typography variant="subtitle2">Total OPEX</Typography><Typography variant="h5">{totalOpex.toLocaleString()}</Typography></CardContent></Card>
        </Box>
        <Box sx={{ display: 'inline-block', width: '19%', minWidth: 220, mr: 2, mb: 2, verticalAlign: 'top' }}>
          <Card><CardContent><Typography variant="subtitle2">Net Profit</Typography><Typography variant="h5">{totalProfit.toLocaleString()}</Typography></CardContent></Card>
        </Box>
        <Box sx={{ display: 'inline-block', width: '19%', minWidth: 220, mr: 2, mb: 2, verticalAlign: 'top' }}>
          <Card><CardContent><Typography variant="subtitle2">Avg. Headcount</Typography><Typography variant="h5">{avgHeadcount.toLocaleString(undefined, { maximumFractionDigits: 1 })}</Typography></CardContent></Card>
        </Box>
        <Box sx={{ display: 'inline-block', width: '19%', minWidth: 220, mb: 2, verticalAlign: 'top' }}>
          <Card><CardContent><Typography variant="subtitle2">Pipeline</Typography><Typography variant="h5">{totalPipeline.toLocaleString()}</Typography></CardContent></Card>
        </Box>
      </Box>
      {/* Chart Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: 350, maxWidth: '48%' }}>
          <Card><CardContent>
            <Typography variant="subtitle1">Revenue vs OPEX</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filtered} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#1976d2" name="Revenue" />
                <Bar dataKey="opex" fill="#fbc02d" name="OPEX" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 350, maxWidth: '48%' }}>
          <Card><CardContent>
            <Typography variant="subtitle1">Profit Trend</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filtered} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#388e3c" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 350, maxWidth: '48%' }}>
          <Card><CardContent>
            <Typography variant="subtitle1">Headcount</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filtered} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="headcount" stroke="#7b1fa2" name="Headcount" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 350, maxWidth: '48%' }}>
          <Card><CardContent>
            <Typography variant="subtitle1">Pipeline</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filtered} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pipeline" stroke="#0288d1" name="Pipeline" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 350, maxWidth: '48%' }}>
          <Card><CardContent>
            <Typography variant="subtitle1">Category Breakdown</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={simulated.categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {simulated.categories.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Box>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Detailed Breakdown</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>OPEX</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>Headcount</TableCell>
              <TableCell>Pipeline</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.month}</TableCell>
                <TableCell>{row.revenue.toLocaleString()}</TableCell>
                <TableCell>{row.opex.toLocaleString()}</TableCell>
                <TableCell>{row.profit.toLocaleString()}</TableCell>
                <TableCell>{row.headcount}</TableCell>
                <TableCell>{row.pipeline.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default BudgetDashboard; 