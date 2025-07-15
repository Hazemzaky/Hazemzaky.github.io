import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert } from '@mui/material';
import api from '../apiBase';

interface Employee {
  _id: string;
  name: string;
  position: string;
  company?: string;
}

interface Project {
  _id: string;
  customer: string;
  equipmentDescription?: string;
}

interface FoodAllowanceRecord {
  _id: string;
  rentType: string;
  companyName: string;
  driver: Employee;
  project: Project;
  value: string; // Add value property
  createdAt?: string;
}

const rentTypes = [
  { value: 'callout', label: 'Callout' },
  { value: 'monthly_12h', label: 'Monthly 12H' },
  { value: 'monthly_24h', label: 'Monthly 24H' },
];

const FoodAllowancePage: React.FC = () => {
  const [records, setRecords] = useState<FoodAllowanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    rentType: '',
    companyName: '',
    driver: '',
    project: '',
    value: '', // Add value field
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch employees with position 'driver'
    api.get('/employees').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setEmployees(data.filter((e: Employee) => e.position && e.position.toLowerCase().includes('driver')));
    }).catch(() => setEmployees([]));
    // Fetch projects/orders
    api.get('/projects').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setProjects(data);
    }).catch(() => setProjects([]));
    // Fetch food allowance records (stubbed for now)
    setLoading(false);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    // Stub: Add API call to create food allowance record
    setTimeout(() => {
      setRecords([
        ...records,
        {
          _id: Math.random().toString(36).substr(2, 9),
          rentType: form.rentType,
          companyName: form.companyName,
          driver: employees.find(e => e._id === form.driver)!,
          project: projects.find(p => p._id === form.project)!,
          value: form.value, // Add value to record
          createdAt: new Date().toISOString(),
        },
      ]);
      setSubmitting(false);
      setForm({ rentType: '', companyName: '', driver: '', project: '', value: '' });
    }, 500);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Food Allowance</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField
              select
              label="Rent Type"
              name="rentType"
              value={form.rentType}
              onChange={handleFormChange}
              required
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Select Rent Type</MenuItem>
              {rentTypes.map(rt => <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>)}
            </TextField>
            <TextField
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={handleFormChange}
              required
              sx={{ minWidth: 180 }}
            />
            <TextField
              select
              label="Driver Name"
              name="driver"
              value={form.driver}
              onChange={handleFormChange}
              required
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Select Driver</MenuItem>
              {employees.map(emp => <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Project"
              name="project"
              value={form.project}
              onChange={handleFormChange}
              required
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Select Project</MenuItem>
              {projects.map(proj => <MenuItem key={proj._id} value={proj._id}>{proj.customer} {proj.equipmentDescription ? `- ${proj.equipmentDescription}` : ''}</MenuItem>)}
            </TextField>
            <TextField
              label="Value"
              name="value"
              value={form.value}
              onChange={handleFormChange}
              required
              type="number"
              sx={{ minWidth: 120 }}
              inputProps={{ min: 0 }}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Add Food Allowance'}
          </Button>
        </form>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Food Allowance Records</Typography>
        {loading ? <CircularProgress /> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rent Type</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Driver Name</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(rec => (
                <TableRow key={rec._id}>
                  <TableCell>{rentTypes.find(rt => rt.value === rec.rentType)?.label || rec.rentType}</TableCell>
                  <TableCell>{rec.companyName}</TableCell>
                  <TableCell>{rec.driver?.name}</TableCell>
                  <TableCell>{rec.project?.customer}</TableCell>
                  <TableCell>{rec.value || '-'}</TableCell>
                  <TableCell>{rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
};

export default FoodAllowancePage; 