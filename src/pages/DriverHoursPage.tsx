import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiBase';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Paper, Snackbar, Alert, MenuItem, Card, CardContent, useTheme, alpha, Avatar, Badge, Divider, LinearProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

interface DriverHour {
  _id: string;
  employee: { _id: string; name: string } | string;
  project: { _id: string; name: string } | string;
  date: string;
  hours: number;
  cost: number;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

const defaultForm = {
  employee: '',
  project: '',
  date: '',
  hours: '',
  cost: '',
};

const DriverHoursPage: React.FC = () => {
  const muiTheme = useTheme();
  const [driverHours, setDriverHours] = useState<DriverHour[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDriverHours();
    fetchProjects();
    fetchEmployees();
  }, [filterProject]);

  const fetchDriverHours = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<DriverHour[]>('/driver-hours', { params: filterProject ? { project: filterProject } : {} });
      setDriverHours(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch driver hours');
    } finally {
      setLoading(false);
    }
  };
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data as any[]);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]); // Ensure projects is always an array
    }
  };
  const fetchEmployees = async () => {
    try {
      const res = await api.get<Employee[]>('/employees');
      setEmployees(res.data as Employee[]);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]); // Ensure employees is always an array
    }
  };

  const handleOpen = (entry?: DriverHour) => {
    if (entry) {
      setEditingId(entry._id);
      setForm({
        employee: typeof entry.employee === 'object' ? entry.employee._id : entry.employee || '',
        project: typeof entry.project === 'object' ? entry.project._id : entry.project || '',
        date: entry.date ? entry.date.slice(0, 10) : '',
        hours: entry.hours.toString(),
        cost: entry.cost.toString(),
      });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/driver-hours/${editingId}`, {
          ...form,
          hours: Number(form.hours),
          cost: Number(form.cost),
        });
        setSuccess('Driver hour updated!');
      } else {
        await api.post('/driver-hours', {
          ...form,
          hours: Number(form.hours),
          cost: Number(form.cost),
        });
        setSuccess('Driver hour created!');
      }
      fetchDriverHours();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save driver hour');
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/driver-hours/${deleteId}`);
      setSuccess('Driver hour deleted!');
      fetchDriverHours();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete driver hour');
    } finally {
      setDeleteId(null);
    }
  };

  const columns = useMemo<ColumnDef<DriverHour>[]>(() => [
    { header: 'Employee', accessorKey: 'employee', cell: info => typeof info.getValue() === 'object' ? (info.getValue() as any)?.name : info.getValue() },
    { header: 'Project', accessorKey: 'project', cell: info => typeof info.getValue() === 'object' ? (info.getValue() as any)?.name : info.getValue() },
    { header: 'Date', accessorKey: 'date', cell: info => info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : '-' },
    { header: 'Hours', accessorKey: 'hours' },
    { header: 'Cost', accessorKey: 'cost', cell: info => Number(info.getValue()).toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleOpen(row.original)}><EditIcon /></IconButton>
          <IconButton color="error" onClick={() => setDeleteId(row.original._id)}><DeleteIcon /></IconButton>
        </Box>
      ),
    },
  ], [projects, employees]);

  const table = useReactTable({
    data: driverHours,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Summary calculations
  const totalHours = driverHours.reduce((sum, entry) => sum + Number(entry.hours), 0);
  const totalCost = driverHours.reduce((sum, entry) => sum + Number(entry.cost), 0);
  const avgCostPerHour = totalHours ? totalCost / totalHours : 0;

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!search.trim()) return driverHours;
    const s = search.trim().toLowerCase();
    return driverHours.filter(entry =>
      (typeof entry.employee === 'object' ? entry.employee.name : entry.employee || '').toLowerCase().includes(s) ||
      (typeof entry.project === 'object' ? entry.project.name : entry.project || '').toLowerCase().includes(s) ||
      (entry.date ? new Date(entry.date).toLocaleDateString().toLowerCase() : '').includes(s)
    );
  }, [driverHours, search]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee', 'Project', 'Date', 'Hours', 'Cost'];
    const rows = filteredEntries.map(dh => [
      typeof dh.employee === 'object' ? dh.employee.name : dh.employee,
      typeof dh.project === 'object' ? dh.project.name : dh.project,
      dh.date ? new Date(dh.date).toLocaleDateString() : '',
      dh.hours,
      dh.cost,
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Driver Hours');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('driver_hours');
    a.click();
    window.URL.revokeObjectURL(url);
  };
  // Print
  const handlePrint = () => {
    const printHeader = addPrintHeader('Driver Hours');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Driver Hours Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printHeader}
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: theme.shape.borderRadius,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <AccessTimeIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Driver Hours Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Track and manage driver working hours and costs
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleOpen()}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Add Driver Hour
                </Button>
              </Box>
            </Box>
            
            {/* Decorative background elements */}
            <Box sx={{ 
              position: 'absolute', 
              top: -50, 
              right: -50, 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -30, 
              left: -30, 
              width: 150, 
              height: 150, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.08)',
              zIndex: 1
            }} />
          </Paper>
        </motion.div>

        {/* Summary KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {[
              {
                title: 'Total Hours',
                value: totalHours.toLocaleString(),
                icon: <AccessTimeIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Cost',
                value: totalCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <AttachMoneyIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Avg. Cost per Hour',
                value: avgCostPerHour.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                icon: <TrendingUpIcon />,
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1)
              },
              {
                title: 'Total Entries',
                value: driverHours.length,
                icon: <PeopleIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    flex: '1 1 200px', 
                    minWidth: 200,
                    background: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(card.color, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 40, height: 40, mr: 1 }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              🔍 Search & Filter
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search employee, project, or date"
                size="small"
                sx={{ 
                  minWidth: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              />
              <TextField
                select
                label="Filter by Project"
                value={filterProject}
                onChange={e => setFilterProject(e.target.value)}
                sx={{ 
                  minWidth: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              >
                                 <MenuItem value="">All Projects</MenuItem>
                 {projects && projects.length > 0 ? projects.map(p => (
                   <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                 )) : (
                   <MenuItem disabled>No projects available</MenuItem>
                 )}
              </TextField>
              <Button 
                variant="outlined" 
                startIcon={<SaveAltIcon />} 
                onClick={handleExportCSV}
                sx={{ 
                  borderColor: theme.palette.primary.main, 
                  color: theme.palette.primary.main,
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    color: theme.palette.primary.dark,
                  }
                }}
              >
                Export CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                onClick={handlePrint}
                sx={{ 
                  borderColor: theme.palette.secondary.main, 
                  color: theme.palette.secondary.main,
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': {
                    borderColor: theme.palette.secondary.dark,
                    color: theme.palette.secondary.dark,
                  }
                }}
              >
                Print
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Data Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} style={{ 
                        padding: 12, 
                        borderBottom: `2px solid ${alpha(theme.palette.divider, 0.3)}`, 
                        textAlign: 'left',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600
                      }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows
                  .filter(row => filteredEntries.includes(row.original))
                  .map(row => (
                    <Box
                      component="tr"
                      key={row.id}
                      sx={{
                        background: row.index % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <Box
                          component="td"
                          key={cell.id}
                          sx={{
                            padding: '12px 8px',
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                            textAlign: 'left'
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Box>
                      ))}
                    </Box>
                  ))}
              </tbody>
            </table>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                <Typography align="center" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                  Loading...
                </Typography>
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </motion.div>
              {/* Add/Edit Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: theme.shadows[24]
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              color: theme.palette.primary.main,
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                <AccessTimeIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {editingId ? 'Edit Driver Hour' : 'Add Driver Hour'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {editingId ? 'Update existing driver hour entry' : 'Create new driver hour record'}
                </Typography>
              </Box>
            </Box>
            
            {/* Decorative background elements */}
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: alpha(theme.palette.primary.main, 0.1),
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -15, 
              left: -15, 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              background: alpha(theme.palette.secondary.main, 0.08),
              zIndex: 1
            }} />
          </DialogTitle>
          
          <DialogContent sx={{ mt: 2, p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                select 
                label="Employee" 
                name="employee" 
                value={form.employee} 
                onChange={handleFormChange} 
                required 
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              >
                                 <MenuItem value="">Select Employee</MenuItem>
                 {employees && employees.length > 0 ? employees.map((e: any) => (
                   <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                 )) : (
                   <MenuItem disabled>No employees available</MenuItem>
                 )}
              </TextField>
              <TextField 
                select 
                label="Project" 
                name="project" 
                value={form.project} 
                onChange={handleFormChange} 
                required 
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              >
                <MenuItem value="">Select Project</MenuItem>
                {projects.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                ))}
              </TextField>
              <TextField 
                label="Date" 
                name="date" 
                value={form.date} 
                onChange={handleFormChange} 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                required 
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              />
              <TextField 
                label="Hours" 
                name="hours" 
                value={form.hours} 
                onChange={handleFormChange} 
                type="number" 
                required 
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              />
              <TextField 
                label="Cost" 
                name="cost" 
                value={form.cost} 
                onChange={handleFormChange} 
                type="number" 
                required 
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                }}
              />
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    '& .MuiAlert-icon': {
                      color: theme.palette.error.main
                    }
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions 
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              gap: 2
            }}
          >
            <Button 
              onClick={handleClose} 
              variant="outlined"
              sx={{
                borderColor: theme.palette.text.secondary,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={!!deleteId} 
          onClose={() => setDeleteId(null)}
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: theme.shadows[24]
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)`,
              color: theme.palette.error.main,
              borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                <DeleteIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Delete Driver Hour
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, p: 3 }}>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
              Are you sure you want to delete this driver hour entry? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions 
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              gap: 2
            }}
          >
            <Button 
              onClick={() => setDeleteId(null)}
              variant="outlined"
              sx={{
                borderColor: theme.palette.text.secondary,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.6)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </AnimatePresence>
    </Box>
  );
};

export default DriverHoursPage; 