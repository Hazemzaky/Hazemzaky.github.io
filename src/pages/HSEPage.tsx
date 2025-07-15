import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Button, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SearchIcon from '@mui/icons-material/Search';
import AlertIcon from '@mui/icons-material/Warning';
import api from '../apiBase';
import axios from 'axios';

const HSE_MODULES = [
  'Incident Reporting',
  'Risk Assessment',
  'PPE Tracking',
  'Safety Inspections',
  'Training & Certifications',
  'Environment & Waste',
  'Reports Dashboard',
];

const HSE_DASHBOARD_CARDS = [
  { label: 'Total Incidents (Month/Year)', key: 'totalIncidents', color: 'error' },
  { label: 'Lost Time Injuries (LTI)', key: 'lti', color: 'warning' },
  { label: 'Near Misses', key: 'nearMisses', color: 'info' },
  { label: 'Vehicle Accidents', key: 'vehicleAccidents', color: 'secondary' },
  { label: 'Open Safety Actions', key: 'openActions', color: 'primary' },
  { label: 'Expiring Trainings', key: 'expiringTrainings', color: 'warning' },
  { label: 'Audit Score', key: 'auditScore', color: 'success' },
  { label: 'Site Risk Level', key: 'siteRisk', color: 'error' },
];

const HSE_QUICK_ACTIONS = [
  { label: 'Report Incident', icon: <AddIcon />, action: () => {} },
  { label: 'Start Audit', icon: <EditIcon />, action: () => {} },
  { label: 'View Training Matrix', icon: <VisibilityIcon />, action: () => {} },
  { label: 'Export HSE Report', icon: <SaveAltIcon />, action: () => {} },
  { label: 'Launch Emergency Plan', icon: <AlertIcon />, action: () => {} },
  { label: 'Add New Hazard', icon: <AddIcon />, action: () => {} },
  { label: 'Search Safety Docs', icon: <SearchIcon />, action: () => {} },
];

const HSE_SECTIONS = [
  'Dashboard',
  'Incidents & Near Miss Log',
  'Emergency Readiness',
  'Training & Competency Summary',
  'Audit & Inspection Status',
  'Active Hazards / Risk Register',
  'Behavior-Based Safety (BBS) Tracking',
  'HSE Document Library',
  'Vehicle / Driver Safety Snapshot',
];

const IncidentReporting: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    severity: '',
    location: '',
    date: '',
    immediateActions: '',
    involvedPersons: '',
    witnesses: '',
    estimatedCost: '',
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/incidents');
      setIncidents(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (incident?: any) => {
    if (incident) {
      setEditingId(incident._id);
      setForm({
        title: incident.title,
        description: incident.description,
        type: incident.type,
        severity: incident.severity,
        location: incident.location,
        date: incident.date ? incident.date.slice(0, 10) : '',
        immediateActions: incident.immediateActions,
        involvedPersons: incident.involvedPersons?.join(', ') || '',
        witnesses: incident.witnesses?.join(', ') || '',
        estimatedCost: incident.estimatedCost?.toString() || '',
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        type: '',
        severity: '',
        location: '',
        date: '',
        immediateActions: '',
        involvedPersons: '',
        witnesses: '',
        estimatedCost: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      type: '',
      severity: '',
      location: '',
      date: '',
      immediateActions: '',
      involvedPersons: '',
      witnesses: '',
      estimatedCost: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...form,
        involvedPersons: form.involvedPersons.split(',').map(p => p.trim()).filter(p => p),
        witnesses: form.witnesses.split(',').map(w => w.trim()).filter(w => w),
        estimatedCost: Number(form.estimatedCost) || undefined,
      };

      if (editingId) {
        await api.put(`/incidents/${editingId}`, submitData);
        setSuccess('Incident updated successfully!');
      } else {
        await api.post('/incidents', submitData);
        setSuccess('Incident reported successfully!');
      }
      fetchIncidents();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save incident');
    }
  };

  const handleView = (incident: any) => {
    setSelectedIncident(incident);
    setViewOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/incidents/${deleteId}`);
      setSuccess('Incident deleted successfully!');
      fetchIncidents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete incident');
    } finally {
      setDeleteId(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'investigating': return 'warning';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Incident Reporting & Tracking</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Report Incident
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Reported By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc._id}>
                  <TableCell>{inc.title}</TableCell>
                  <TableCell>{inc.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={inc.severity} 
                      color={getSeverityColor(inc.severity) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={inc.status} 
                      color={getStatusColor(inc.status) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{inc.date ? new Date(inc.date).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{inc.location}</TableCell>
                  <TableCell>{inc.reportedBy?.email || '-'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary" onClick={() => handleView(inc)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleOpen(inc)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(inc._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add/Edit Incident Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Incident' : 'Report Incident'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} required fullWidth multiline minRows={3} />
            <Box display="flex" gap={2}>
              <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} required fullWidth>
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="injury">Injury</MenuItem>
                <MenuItem value="accident">Accident</MenuItem>
                <MenuItem value="near_miss">Near Miss</MenuItem>
                <MenuItem value="property_damage">Property Damage</MenuItem>
                <MenuItem value="environmental">Environmental</MenuItem>
              </TextField>
              <TextField select label="Severity" name="severity" value={form.severity} onChange={handleFormChange} required fullWidth>
                <MenuItem value="">Select Severity</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} required fullWidth />
              <TextField label="Date" name="date" value={form.date} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
            </Box>
            <TextField label="Immediate Actions Taken" name="immediateActions" value={form.immediateActions} onChange={handleFormChange} required fullWidth multiline minRows={2} />
            <TextField label="Involved Persons (comma separated)" name="involvedPersons" value={form.involvedPersons} onChange={handleFormChange} fullWidth />
            <TextField label="Witnesses (comma separated)" name="witnesses" value={form.witnesses} onChange={handleFormChange} fullWidth />
            <TextField label="Estimated Cost" name="estimatedCost" value={form.estimatedCost} onChange={handleFormChange} type="number" fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{editingId ? 'Update' : 'Submit'}</Button>
        </DialogActions>
      </Dialog>

      {/* View Incident Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Incident Details</DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>{selectedIncident.title}</Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle2">Basic Information</Typography>
                  <Typography>Type: {selectedIncident.type}</Typography>
                  <Typography>Severity: {selectedIncident.severity}</Typography>
                  <Typography>Status: {selectedIncident.status}</Typography>
                  <Typography>Location: {selectedIncident.location}</Typography>
                  <Typography>Date: {selectedIncident.date ? new Date(selectedIncident.date).toLocaleDateString() : '-'}</Typography>
                  <Typography>Reported By: {selectedIncident.reportedBy?.email || '-'}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Typography variant="subtitle2">Details</Typography>
                  <Typography>Description: {selectedIncident.description}</Typography>
                  <Typography>Immediate Actions: {selectedIncident.immediateActions}</Typography>
                  <Typography>Involved Persons: {selectedIncident.involvedPersons?.join(', ') || '-'}</Typography>
                  <Typography>Witnesses: {selectedIncident.witnesses?.join(', ') || '-'}</Typography>
                  <Typography>Estimated Cost: {selectedIncident.estimatedCost ? selectedIncident.estimatedCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '-'}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Incident</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this incident?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

const RiskAssessment: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    department: '',
    assessmentDate: '',
    nextReviewDate: '',
    overallRiskLevel: '',
    summary: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/risk-assessments');
      setAssessments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch risk assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/risk-assessments', form);
      setSuccess('Risk assessment created successfully!');
      fetchAssessments();
      setOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create risk assessment');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Risk Assessment Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Create Assessment
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assessment Date</TableCell>
                <TableCell>Next Review</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment._id}>
                  <TableCell>{assessment.title}</TableCell>
                  <TableCell>{assessment.location}</TableCell>
                  <TableCell>{assessment.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={assessment.overallRiskLevel} 
                      color={assessment.overallRiskLevel === 'critical' ? 'error' : assessment.overallRiskLevel === 'high' ? 'warning' : 'success'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assessment.status} 
                      color={assessment.status === 'approved' ? 'success' : assessment.status === 'pending_approval' ? 'warning' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{assessment.nextReviewDate ? new Date(assessment.nextReviewDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Risk Assessment</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
            <Box display="flex" gap={2}>
              <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} required fullWidth />
              <TextField label="Department" name="department" value={form.department} onChange={handleFormChange} required fullWidth />
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Assessment Date" name="assessmentDate" value={form.assessmentDate} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
              <TextField label="Next Review Date" name="nextReviewDate" value={form.nextReviewDate} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
            </Box>
            <TextField select label="Overall Risk Level" name="overallRiskLevel" value={form.overallRiskLevel} onChange={handleFormChange} required fullWidth>
              <MenuItem value="">Select Risk Level</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
            <TextField label="Summary" name="summary" value={form.summary} onChange={handleFormChange} required fullWidth multiline minRows={3} />
            <TextField label="Recommendations" name="recommendations" value={form.recommendations} onChange={handleFormChange} fullWidth multiline minRows={2} />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

const PPETracking: React.FC = () => {
  const [ppeItems, setPpeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employee: '',
    ppeItems: [{
    type: '',
      description: '',
      issuedDate: '',
    expiryDate: '',
      condition: 'new',
      status: 'active',
      notes: ''
    }],
    issueDate: '',
    totalValue: '',
    notes: '',
  });

  useEffect(() => {
    fetchPPE();
  }, []);

  const fetchPPE = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/ppe');
      setPpeItems(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch PPE items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...form,
        employee: form.employee,
        ppeItems: form.ppeItems.map(item => ({
          ...item,
          issuedDate: item.issuedDate ? new Date(item.issuedDate) : new Date(),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        })),
        issueDate: form.issueDate ? new Date(form.issueDate) : new Date(),
        totalValue: Number(form.totalValue) || 0,
      };
      
      await api.post('/ppe', submitData);
      setSuccess('PPE item added successfully!');
      fetchPPE();
      setOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add PPE item');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePPEItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...form.ppeItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setForm({ ...form, ppeItems: updatedItems });
  };

  const addPPEItem = () => {
    setForm({
      ...form,
      ppeItems: [...form.ppeItems, {
        type: '',
        description: '',
        issuedDate: '',
        expiryDate: '',
        condition: 'new',
        status: 'active',
        notes: ''
      }]
    });
  };

  const removePPEItem = (index: number) => {
    if (form.ppeItems.length > 1) {
      const updatedItems = form.ppeItems.filter((_, i) => i !== index);
      setForm({ ...form, ppeItems: updatedItems });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'maintenance': return 'warning';
      case 'retired': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">PPE Tracking</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add PPE Item
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>PPE Items Count</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ppeItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.employee?.name || item.employee || '-'}</TableCell>
                  <TableCell>{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>${item.totalValue?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{item.ppeItems?.length || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.ppeItems?.some((ppe: any) => ppe.status === 'active') ? 'Active' : 'Inactive'} 
                      color={item.ppeItems?.some((ppe: any) => ppe.status === 'active') ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add PPE Record</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="Employee ID" 
              name="employee" 
              value={form.employee} 
              onChange={handleFormChange} 
              required 
              fullWidth 
              helperText="Enter the employee ID"
            />
            <TextField 
              label="Issue Date" 
              name="issueDate" 
              value={form.issueDate} 
              onChange={handleFormChange} 
              type="date" 
              InputLabelProps={{ shrink: true }} 
              required 
              fullWidth 
            />
            <TextField 
              label="Total Value" 
              name="totalValue" 
              value={form.totalValue} 
              onChange={handleFormChange} 
              type="number" 
              required 
              fullWidth 
              helperText="Total value of all PPE items"
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>PPE Items</Typography>
            {form.ppeItems.map((item, index) => (
              <Box key={index} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1">Item {index + 1}</Typography>
                  {form.ppeItems.length > 1 && (
                    <Button size="small" color="error" onClick={() => removePPEItem(index)}>
                      Remove
                    </Button>
                  )}
                </Box>
                <Box display="flex" gap={2} mb={2}>
                  <TextField 
                    select 
                    label="Type" 
                    value={item.type} 
                    onChange={(e) => handlePPEItemChange(index, 'type', e.target.value)} 
                    required 
                    fullWidth
                  >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="helmet">Helmet</MenuItem>
                <MenuItem value="safety_glasses">Safety Glasses</MenuItem>
                <MenuItem value="ear_protection">Ear Protection</MenuItem>
                <MenuItem value="respirator">Respirator</MenuItem>
                <MenuItem value="safety_shoes">Safety Shoes</MenuItem>
                <MenuItem value="gloves">Gloves</MenuItem>
                <MenuItem value="vest">Safety Vest</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
                  <TextField 
                    label="Description" 
                    value={item.description} 
                    onChange={(e) => handlePPEItemChange(index, 'description', e.target.value)} 
                    required 
                    fullWidth 
                  />
            </Box>
                <Box display="flex" gap={2} mb={2}>
                  <TextField 
                    label="Issued Date" 
                    value={item.issuedDate} 
                    onChange={(e) => handlePPEItemChange(index, 'issuedDate', e.target.value)} 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Expiry Date" 
                    value={item.expiryDate} 
                    onChange={(e) => handlePPEItemChange(index, 'expiryDate', e.target.value)} 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    fullWidth 
                  />
            </Box>
                <Box display="flex" gap={2} mb={2}>
                  <TextField 
                    select 
                    label="Condition" 
                    value={item.condition} 
                    onChange={(e) => handlePPEItemChange(index, 'condition', e.target.value)} 
                    required 
                    fullWidth
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                    <MenuItem value="damaged">Damaged</MenuItem>
                  </TextField>
                  <TextField 
                    select 
                    label="Status" 
                    value={item.status} 
                    onChange={(e) => handlePPEItemChange(index, 'status', e.target.value)} 
                    required 
                    fullWidth
                  >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="damaged">Damaged</MenuItem>
                    <MenuItem value="lost">Lost</MenuItem>
                    <MenuItem value="returned">Returned</MenuItem>
            </TextField>
            </Box>
                <TextField 
                  label="Notes" 
                  value={item.notes} 
                  onChange={(e) => handlePPEItemChange(index, 'notes', e.target.value)} 
                  fullWidth 
                  multiline 
                  minRows={1} 
                />
              </Box>
            ))}
            <Button onClick={addPPEItem} variant="outlined" sx={{ mt: 1 }}>
              Add Another PPE Item
            </Button>
            
            <TextField 
              label="General Notes" 
              name="notes" 
              value={form.notes} 
              onChange={handleFormChange} 
              fullWidth 
              multiline 
              minRows={2} 
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Add PPE Record</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

const SafetyInspections: React.FC = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    inspector: '',
    inspectionDate: '',
    type: '',
    status: '',
    overallScore: '',
    findings: '',
    recommendations: '',
    nextInspectionDate: '',
  });

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/safety-inspections');
      setInspections(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch safety inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/safety-inspections', form);
      setSuccess('Safety inspection created successfully!');
      fetchInspections();
      setOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create safety inspection');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  // --- SafetyInspections summary cards and filters ---
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const filteredInspections = useMemo(() => {
    return inspections.filter(i => {
      if (filterType && i.type !== filterType) return false;
      if (filterStatus && i.status !== filterStatus) return false;
      if (filterLocation && !i.location.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterFrom && new Date(i.inspectionDate) < new Date(filterFrom)) return false;
      if (filterTo && new Date(i.inspectionDate) > new Date(filterTo)) return false;
      return true;
    });
  }, [inspections, filterType, filterStatus, filterLocation, filterFrom, filterTo]);

  const totalInspections = inspections.length;
  const openActions = inspections.reduce((sum, i) => sum + (Array.isArray(i.items) ? i.items.filter((a: any) => ['open','in_progress','overdue'].includes(a.actionStatus)).length : 0), 0);
  const avgScore = inspections.length ? (inspections.reduce((sum, i) => sum + (Number(i.overallScore) || 0), 0) / inspections.length).toFixed(1) : '0.0';
  const overdueInspections = inspections.filter(i => i.status === 'overdue' || (i.nextInspectionDate && new Date(i.nextInspectionDate) < new Date())).length;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Safety Inspections</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Schedule Inspection
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Inspector</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Inspection Date</TableCell>
                <TableCell>Overall Score</TableCell>
                <TableCell>Next Inspection</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInspections.map((inspection) => (
                <TableRow key={inspection._id}>
                  <TableCell>{inspection.title}</TableCell>
                  <TableCell>{inspection.location}</TableCell>
                  <TableCell>{inspection.inspector?.name || inspection.inspector?.email || inspection.inspector || '-'}</TableCell>
                  <TableCell>{inspection.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={inspection.status} 
                      color={getStatusColor(inspection.status) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${inspection.overallScore}%`} 
                      color={getScoreColor(inspection.overallScore) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{inspection.nextInspectionDate ? new Date(inspection.nextInspectionDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Safety Inspection</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
            <Box display="flex" gap={2}>
              <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} required fullWidth />
              <TextField label="Inspector" name="inspector" value={form.inspector} onChange={handleFormChange} required fullWidth />
            </Box>
            <Box display="flex" gap={2}>
              <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} required fullWidth>
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="special">Special</MenuItem>
              </TextField>
              <TextField select label="Status" name="status" value={form.status} onChange={handleFormChange} required fullWidth>
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="Inspection Date" name="inspectionDate" value={form.inspectionDate} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
              <TextField label="Next Inspection Date" name="nextInspectionDate" value={form.nextInspectionDate} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
            </Box>
            <TextField label="Overall Score (%)" name="overallScore" value={form.overallScore} onChange={handleFormChange} type="number" fullWidth />
            <TextField label="Findings" name="findings" value={form.findings} onChange={handleFormChange} fullWidth multiline minRows={3} />
            <TextField label="Recommendations" name="recommendations" value={form.recommendations} onChange={handleFormChange} fullWidth multiline minRows={2} />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Schedule</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

const TrainingCertifications: React.FC = () => {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employee: '',
    trainingType: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: '',
    provider: '',
    location: '',
    instructor: '',
    status: 'scheduled',
    cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrainings();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/employees');
      setEmployees(res.data);
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchTrainings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/training');
      setTrainings(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const trainingData = {
        ...form,
        duration: Number(form.duration),
        cost: Number(form.cost),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      };
      await api.post('/training', trainingData);
      setSuccess('Training created successfully!');
      fetchTrainings();
      setOpen(false);
      setForm({
        employee: '',
        trainingType: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: '',
        provider: '',
        location: '',
        instructor: '',
        status: 'scheduled',
        cost: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create training');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Training & Certifications</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Create Training
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trainings.map((training) => (
                <TableRow key={training._id}>
                  <TableCell>{training.employee?.name || training.employee || '-'}</TableCell>
                  <TableCell>{training.title}</TableCell>
                  <TableCell>{training.trainingType}</TableCell>
                  <TableCell>{training.startDate ? new Date(training.startDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{training.endDate ? new Date(training.endDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{training.duration} hours</TableCell>
                  <TableCell>{training.provider || '-'}</TableCell>
                  <TableCell>{training.instructor || '-'}</TableCell>
                  <TableCell>${training.cost?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={training.status} 
                      color={training.status === 'completed' ? 'success' : training.status === 'in_progress' ? 'warning' : 'info'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Training</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              select 
              label="Employee" 
              name="employee" 
              value={form.employee} 
              onChange={handleFormChange} 
              required 
              fullWidth
            >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
            
            <TextField 
              select 
              label="Training Type" 
              name="trainingType" 
              value={form.trainingType} 
              onChange={handleFormChange} 
              required 
              fullWidth
            >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="safety">Safety Training</MenuItem>
                <MenuItem value="first_aid">First Aid</MenuItem>
                <MenuItem value="fire_safety">Fire Safety</MenuItem>
                <MenuItem value="emergency_response">Emergency Response</MenuItem>
              <MenuItem value="technical">Technical Training</MenuItem>
              <MenuItem value="compliance">Compliance Training</MenuItem>
                <MenuItem value="other">Other</MenuItem>
            </TextField>
            
            <TextField 
              label="Description" 
              name="description" 
              value={form.description} 
              onChange={handleFormChange} 
              multiline 
              rows={3}
              required 
              fullWidth 
            />
            
            <Box display="flex" gap={2}>
              <TextField 
                label="Start Date" 
                name="startDate" 
                value={form.startDate} 
                onChange={handleFormChange} 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                required 
                fullWidth 
              />
              <TextField 
                label="End Date" 
                name="endDate" 
                value={form.endDate} 
                onChange={handleFormChange} 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                required 
                fullWidth 
              />
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField 
                label="Duration (hours)" 
                name="duration" 
                value={form.duration} 
                onChange={handleFormChange} 
                type="number" 
                required 
                fullWidth 
              />
              <TextField 
                label="Cost" 
                name="cost" 
                value={form.cost} 
                onChange={handleFormChange} 
                type="number" 
                required 
                fullWidth 
              />
            </Box>
            
            <TextField 
              label="Provider" 
              name="provider" 
              value={form.provider} 
              onChange={handleFormChange} 
              required 
              fullWidth 
            />
            
            <TextField 
              label="Location" 
              name="location" 
              value={form.location} 
              onChange={handleFormChange} 
              required 
              fullWidth 
            />
            
            <TextField 
              label="Instructor" 
              name="instructor" 
              value={form.instructor} 
              onChange={handleFormChange} 
              required 
              fullWidth 
            />
            
            <TextField 
              select 
              label="Status" 
              name="status" 
              value={form.status} 
              onChange={handleFormChange} 
              required 
              fullWidth
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            
            <TextField 
              label="Notes" 
              name="notes" 
              value={form.notes} 
              onChange={handleFormChange} 
              multiline 
              rows={2}
              fullWidth 
            />
            
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

const EnvironmentWaste: React.FC = () => {
  const [wasteTypes, setWasteTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: '',
    location: '',
    date: '',
    description: '',
    status: 'active',
    environmentalImpact: '',
    cost: '',
    mitigationMeasures: '',
  });

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  const fetchWasteTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/environmental');
      setWasteTypes(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch environmental data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const environmentalData = {
        ...form,
        cost: Number(form.cost),
        date: new Date(form.date),
        mitigationMeasures: form.mitigationMeasures.split(',').map(m => m.trim()).filter(m => m),
      };
      await api.post('/environmental', environmentalData);
      setSuccess('Environmental record added successfully!');
      fetchWasteTypes();
      setOpen(false);
      setForm({
        title: '',
        type: '',
        location: '',
        date: '',
        description: '',
        status: 'active',
        environmentalImpact: '',
        cost: '',
        mitigationMeasures: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add environmental record');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Environment & Waste Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Environmental Record
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wasteTypes.map((waste) => (
                <TableRow key={waste._id}>
                  <TableCell>{waste.title}</TableCell>
                  <TableCell>{waste.type}</TableCell>
                  <TableCell>{waste.location}</TableCell>
                  <TableCell>{waste.date ? new Date(waste.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>${waste.cost?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={waste.status} 
                      color={waste.status === 'resolved' ? 'success' : waste.status === 'active' ? 'warning' : 'info'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Environmental Record</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
            <Box display="flex" gap={2}>
              <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} required fullWidth>
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="waste_management">Waste Management</MenuItem>
                <MenuItem value="emission_tracking">Emission Tracking</MenuItem>
                <MenuItem value="compliance_documentation">Compliance Documentation</MenuItem>
                <MenuItem value="environmental_incident">Environmental Incident</MenuItem>
              </TextField>
            <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} required fullWidth />
            </Box>
            <TextField label="Date" name="date" value={form.date} onChange={handleFormChange} type="date" InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} required fullWidth multiline minRows={3} />
            <TextField 
              label="Environmental Impact" 
              name="environmentalImpact" 
              value={form.environmentalImpact} 
              onChange={handleFormChange} 
              required 
              fullWidth 
              multiline 
              minRows={2}
              helperText="Describe the environmental impact of this activity"
            />
            <TextField 
              label="Cost" 
              name="cost" 
              value={form.cost} 
              onChange={handleFormChange} 
              type="number" 
              required 
              fullWidth 
              helperText="Total cost associated with this environmental activity"
            />
            <TextField 
              label="Mitigation Measures (comma separated)" 
              name="mitigationMeasures" 
              value={form.mitigationMeasures} 
              onChange={handleFormChange} 
              fullWidth 
              multiline 
              minRows={2}
              helperText="List measures taken to mitigate environmental impact"
            />
            <TextField select label="Status" name="status" value={form.status} onChange={handleFormChange} required fullWidth>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="pending_review">Pending Review</MenuItem>
            </TextField>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

const ReportsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<any>('/dashboard');
      setDashboardData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch HSE dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>HSE Dashboard Overview</Typography>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : dashboardData ? (
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
              <Typography variant="h6" color="primary">Incidents</Typography>
              <Typography variant="h4">{dashboardData.incidents?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.incidents?.open || 0} open incidents
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
              <Typography variant="h6" color="warning.main">Risk Assessments</Typography>
              <Typography variant="h4">{dashboardData.riskAssessments?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.riskAssessments?.pending || 0} pending approval
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
              <Typography variant="h6" color="success.main">PPE Records</Typography>
              <Typography variant="h4">{dashboardData.ppe?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.ppe?.expiring || 0} expiring soon
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f3e5f5' }}>
              <Typography variant="h6" color="secondary.main">Safety Inspections</Typography>
              <Typography variant="h4">{dashboardData.inspections?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.inspections?.pending || 0} pending inspections
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff8e1' }}>
              <Typography variant="h6" color="info.main">Training Records</Typography>
              <Typography variant="h4">{dashboardData.training?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.training?.expiring || 0} certifications expiring
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e0f2f1' }}>
              <Typography variant="h6" color="success.main">Environmental</Typography>
              <Typography variant="h4">{dashboardData.environmental?.total || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.environmental?.active || 0} active cases
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>No dashboard data available</Typography>
        )}
      </Paper>
    </Box>
  );
};

const HSEDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/hse/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch HSE dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Helper to get stat value safely
  const getStat = (key: string) => {
    switch (key) {
      case 'totalIncidents': return stats.incidents?.total ?? '-';
      case 'lti': return stats.incidents?.lti ?? '-';
      case 'nearMisses': return stats.incidents?.nearMiss ?? '-';
      case 'vehicleAccidents': return stats.incidents?.vehicleAccident ?? '-';
      case 'openActions': return stats.openSafetyActions ?? '-';
      case 'expiringTrainings': return stats.training?.expiring ?? '-';
      case 'auditScore': return stats.auditScore ?? '-';
      case 'siteRisk': return stats.siteRiskLevels ? Object.entries(stats.siteRiskLevels).map(([loc, lvl]) => `${loc}: ${lvl}`).join(', ') : '-';
      default: return '-';
    }
  };

  // Emergency Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState('');
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState<{
    title: string;
    type: string;
    file: File | null | string;
    description: string;
    effectiveDate: string;
    expiryDate: string;
    notes: string;
  }>({
    title: '',
    type: '',
    file: null,
    description: '',
    effectiveDate: '',
    expiryDate: '',
    notes: '',
  });
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planSuccess, setPlanSuccess] = useState('');
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Emergency Contacts state
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '', email: '', location: '', notes: '' });
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  // Fetch plans
  const fetchPlans = async () => {
    setPlansLoading(true);
    setPlansError('');
    try {
      const res = await api.get('/hse/emergency-plans');
      setPlans(res.data as any[]);
    } catch (err: any) {
      setPlansError(err.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setPlansLoading(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    setContactsLoading(true);
    setContactsError('');
    try {
      const res = await api.get('/hse/emergency-contacts');
      setContacts(res.data as any[]);
    } catch (err: any) {
      setContactsError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchContacts();
  }, []);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    const s = contactSearch.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c: any) =>
      c.name?.toLowerCase().includes(s) ||
      c.role?.toLowerCase().includes(s) ||
      c.location?.toLowerCase().includes(s)
    );
  }, [contacts, contactSearch]);

  // Add plan modal handlers
  const handleOpenPlanModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        title: plan.title,
        type: plan.type,
        file: null,
        description: plan.description,
        effectiveDate: plan.effectiveDate ? plan.effectiveDate.slice(0, 10) : '',
        expiryDate: plan.expiryDate ? plan.expiryDate.slice(0, 10) : '',
        notes: plan.notes || '',
      });
    } else {
      setEditingPlan(null);
      setPlanForm({ title: '', type: '', file: null, description: '', effectiveDate: '', expiryDate: '', notes: '' });
    }
    setPlanModalOpen(true);
  };

  // Training & Competency Summary state
  const [trainings, setTrainings] = useState<any[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [trainingsError, setTrainingsError] = useState('');
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [viewingTraining, setViewingTraining] = useState<any>(null);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [trainingForm, setTrainingForm] = useState({
    employee: '',
    trainingType: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: '',
    provider: '',
    location: '',
    instructor: '',
    status: 'scheduled',
    score: '',
    result: 'not_applicable',
    cost: '',
    notes: '',
  });
  const [trainingSubmitting, setTrainingSubmitting] = useState(false);
  const [trainingSuccess, setTrainingSuccess] = useState('');
  const [deleteTrainingId, setDeleteTrainingId] = useState<string | null>(null);

  // 2. Fetch real training data
  useEffect(() => {
    const fetchTrainings = async () => {
      setTrainingsLoading(true);
      setTrainingsError('');
      try {
        const res = await api.get('/hse/training');
        setTrainings(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setTrainingsError(err.response?.data?.message || 'Failed to fetch trainings');
      } finally {
        setTrainingsLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  // 3. Update summary cards and table to use real data
  const totalTrainings = trainings.length;
  const expiringCerts = trainings.filter(t => t.certificates?.some((c: any) => c.status === 'pending_renewal' || (c.expiryDate && new Date(c.expiryDate) < new Date(Date.now() + 30*24*60*60*1000)))).length;
  const completedTrainings = trainings.filter(t => t.status === 'completed').length;
  const pendingTrainings = trainings.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;

  // 4. Add modal handlers for view/edit
  const handleOpenTrainingModal = (training?: any) => {
    if (training) {
      setEditingTraining(training);
      setTrainingForm({
        employee: training.employee?._id || training.employee || '',
        trainingType: training.trainingType || '',
        title: training.title || '',
        description: training.description || '',
        startDate: training.startDate ? training.startDate.slice(0, 10) : '',
        endDate: training.endDate ? training.endDate.slice(0, 10) : '',
        duration: training.duration?.toString() || '',
        provider: training.provider || '',
        location: training.location || '',
        instructor: training.instructor || '',
        status: training.status || 'scheduled',
        score: training.score?.toString() || '',
        result: training.result || 'not_applicable',
        cost: training.cost?.toString() || '',
        notes: training.notes || '',
      });
    } else {
      setEditingTraining(null);
      setTrainingForm({
        employee: '', trainingType: '', title: '', description: '', startDate: '', endDate: '', duration: '', provider: '', location: '', instructor: '', status: 'scheduled', score: '', result: 'not_applicable', cost: '', notes: '',
      });
    }
    setTrainingModalOpen(true);
  };
  const handleCloseTrainingModal = () => {
    setTrainingModalOpen(false);
    setEditingTraining(null);
    setTrainingForm({ employee: '', trainingType: '', title: '', description: '', startDate: '', endDate: '', duration: '', provider: '', location: '', instructor: '', status: 'scheduled', score: '', result: 'not_applicable', cost: '', notes: '' });
  };
  const handleTrainingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTrainingForm({ ...trainingForm, [e.target.name]: e.target.value });
  };
  const handleSubmitTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrainingSubmitting(true);
    setTrainingsError('');
    try {
      const submitData = {
        ...trainingForm,
        duration: Number(trainingForm.duration),
        cost: Number(trainingForm.cost),
        score: trainingForm.score ? Number(trainingForm.score) : undefined,
        startDate: trainingForm.startDate ? new Date(trainingForm.startDate) : undefined,
        endDate: trainingForm.endDate ? new Date(trainingForm.endDate) : undefined,
      };
      if (editingTraining) {
        await api.put(`/hse/training/${editingTraining._id}`, submitData);
        setTrainingSuccess('Training updated!');
      } else {
        await api.post('/hse/training', submitData);
        setTrainingSuccess('Training created!');
      }
      setTrainingModalOpen(false);
      setTrainingForm({ employee: '', trainingType: '', title: '', description: '', startDate: '', endDate: '', duration: '', provider: '', location: '', instructor: '', status: 'scheduled', score: '', result: 'not_applicable', cost: '', notes: '' });
      setEditingTraining(null);
      setTrainingsLoading(true);
      const res = await api.get('/hse/training');
      setTrainings(Array.isArray(res.data) ? res.data : []);
      setTrainingsLoading(false);
    } catch (err: any) {
      setTrainingsError(err.response?.data?.message || 'Failed to save training');
    } finally {
      setTrainingSubmitting(false);
    }
  };

  // 1. Add employees state and fetch logic near the other useState/useEffect hooks in HSEDashboard:
  const [employees, setEmployees] = useState<any[]>([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchEmployees();
  }, []);

  return (
    <Box p={3}>
      {/* Top Dashboard Cards */}
      {loading ? (
        <Typography>Loading dashboard...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          {HSE_DASHBOARD_CARDS.map(card => (
            <Paper key={card.key} sx={{ p: 2, background: `${card.color}.100`, flex: '1 1 220px', minWidth: 220 }}>
              <Typography variant="subtitle2">{card.label}</Typography>
              <Typography variant="h5" color={card.color + '.main'}>
                {getStat(card.key)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
      {/* Quick Action Buttons */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {HSE_QUICK_ACTIONS.map((action, idx) => (
          <Button key={action.label} variant="contained" color="primary" startIcon={action.icon} onClick={action.action} sx={{ minWidth: 180 }}>
            {action.label}
          </Button>
        ))}
      </Box>
      {/* Main Sections as Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {HSE_SECTIONS.map((section, idx) => (
          <Tab key={section} label={section} />
        ))}
      </Tabs>
      {/* Section Content Placeholder */}
      <Box>
        {tab === 0 && <IncidentsNearMissLog />}
        {tab === 1 && <Typography>Emergency Readiness Snapshot (to be implemented)</Typography>}
        {tab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>Emergency Readiness Snapshot</Typography>
            {/* Snapshot summary cards */}
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Paper sx={{ p: 2, flex: '1 1 220px', minWidth: 220 }}>
                <Typography variant="subtitle2">Drills Conducted</Typography>
                <Typography variant="h5">3</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: '1 1 220px', minWidth: 220 }}>
                <Typography variant="subtitle2">Emergency Plans</Typography>
                <Typography variant="h5">2</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: '1 1 220px', minWidth: 220 }}>
                <Typography variant="subtitle2">Site Maps</Typography>
                <Typography variant="h5">5</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: '1 1 220px', minWidth: 220 }}>
                <Typography variant="subtitle2">Contacts</Typography>
                <Typography variant="h5">6</Typography>
              </Paper>
            </Box>
            {/* Emergency Plans Table */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Emergency Plans</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenPlanModal()}>Add Plan</Button>
              </Box>
              {plansLoading ? (
                <Typography>Loading...</Typography>
              ) : plansError ? (
                <Alert severity="error">{plansError}</Alert>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Title</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>File</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Effective</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Expiry</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(plans as any[]).map((plan: any) => (
                      <tr key={plan._id}>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{plan.title}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{plan.type}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{plan.fileUrl ? <a href={plan.fileUrl} target="_blank" rel="noopener noreferrer">Download</a> : '-'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{plan.effectiveDate ? new Date(plan.effectiveDate).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                          <IconButton color="primary" onClick={() => handleOpenPlanModal(plan)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => setDeletePlanId(plan._id)}><DeleteIcon /></IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Paper>
            {/* Add/Edit Plan Modal */}
            <Dialog open={planModalOpen} onClose={() => setPlanModalOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
              <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField label="Title" name="title" value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} required fullWidth />
                  <TextField label="Type" name="type" value={planForm.type} onChange={e => setPlanForm({ ...planForm, type: e.target.value })} required fullWidth />
                  <Button variant="outlined" component="label">{planForm.file && planForm.file instanceof File ? planForm.file.name : 'Upload File'}<input type="file" hidden onChange={e => setPlanForm({ ...planForm, file: e.target.files?.[0] || null })} /></Button>
                  <TextField label="Description" name="description" value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} fullWidth multiline minRows={2} />
                  <TextField label="Effective Date" name="effectiveDate" type="date" value={planForm.effectiveDate} onChange={e => setPlanForm({ ...planForm, effectiveDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
                  <TextField label="Expiry Date" name="expiryDate" type="date" value={planForm.expiryDate} onChange={e => setPlanForm({ ...planForm, expiryDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
                  <TextField label="Notes" name="notes" value={planForm.notes} onChange={e => setPlanForm({ ...planForm, notes: e.target.value })} fullWidth multiline minRows={2} />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPlanModalOpen(false)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    setPlanSubmitting(true);
                    try {
                      const formData = new FormData();
                      formData.append('title', planForm.title);
                      formData.append('type', planForm.type);
                      if (planForm.file) formData.append('file', planForm.file);
                      formData.append('description', planForm.description || '');
                      formData.append('effectiveDate', planForm.effectiveDate || '');
                      formData.append('expiryDate', planForm.expiryDate || '');
                      formData.append('notes', planForm.notes || '');
                      if (editingPlan) {
                        await api.put(`/hse/emergency-plans/${editingPlan._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setPlanSuccess('Plan updated!');
                      } else {
                        await api.post('/hse/emergency-plans', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setPlanSuccess('Plan added!');
                      }
                      setPlanModalOpen(false);
                      setPlanForm({ title: '', type: '', file: null, description: '', effectiveDate: '', expiryDate: '', notes: '' });
                      setEditingPlan(null);
                      setPlansLoading(true);
                      const res = await api.get('/hse/emergency-plans');
                      setPlans(res.data as any[]);
                      setPlansLoading(false);
                    } catch (err: any) {
                      setPlanSuccess('Failed to save plan');
                    } finally {
                      setPlanSubmitting(false);
                    }
                  }}
                  variant="contained"
                  color="primary"
                  disabled={planSubmitting}
                >
                  {editingPlan ? 'Update' : 'Add'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Plan Dialog */}
            <Dialog open={!!deletePlanId} onClose={() => setDeletePlanId(null)}>
              <DialogTitle>Delete Plan</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this plan?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeletePlanId(null)}>Cancel</Button>
                <Button color="error" variant="contained" onClick={async () => {
                  try {
                    await api.delete(`/hse/emergency-plans/${deletePlanId}`);
                    setPlanSuccess('Plan deleted!');
                    setDeletePlanId(null);
                    setPlansLoading(true);
                    const res = await api.get('/hse/emergency-plans');
                    setPlans(res.data as any[]);
                    setPlansLoading(false);
                  } catch {
                    setPlanSuccess('Failed to delete plan');
                  }
                }}>Delete</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!planSuccess}
              autoHideDuration={3000}
              onClose={() => setPlanSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{planSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
            {/* Emergency Contacts Table */}
            <Paper sx={{ p: 2, mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Emergency Contacts</Typography>
                <TextField size="small" placeholder="Search contacts..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} sx={{ minWidth: 220, mr: 2 }} />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingContact(null); setContactForm({ name: '', role: '', phone: '', email: '', location: '', notes: '' }); setContactModalOpen(true); }}>Add Contact</Button>
              </Box>
              {contactsLoading ? (
                <Typography>Loading...</Typography>
              ) : contactsError ? (
                <Alert severity="error">{contactsError}</Alert>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Location</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredContacts as any[]).map((c: any) => (
                      <tr key={c._id}>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.name}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.role}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.phone}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.email}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.location}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                          <IconButton color="primary" onClick={() => { setEditingContact(c); setContactForm({ name: c.name, role: c.role, phone: c.phone, email: c.email, location: c.location, notes: c.notes }); setContactModalOpen(true); }}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => setDeleteContactId(c._id)}><DeleteIcon /></IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Paper>
            {/* ...existing modals for contacts... */}
          </Box>
        )}
        {tab === 3 && (
          <Box sx={{ mt: 3 }}>
            {/* Summary Cards */}
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Card sx={{ flex: '1 1 220px', minWidth: 220 }}><CardContent><Typography variant="subtitle1">Total Trainings</Typography><Typography variant="h5">{totalTrainings}</Typography></CardContent></Card>
              <Card sx={{ flex: '1 1 220px', minWidth: 220 }}><CardContent><Typography variant="subtitle1">Expiring Certifications</Typography><Typography variant="h5">{expiringCerts}</Typography></CardContent></Card>
              <Card sx={{ flex: '1 1 220px', minWidth: 220 }}><CardContent><Typography variant="subtitle1">Completed Trainings</Typography><Typography variant="h5">{completedTrainings}</Typography></CardContent></Card>
              <Card sx={{ flex: '1 1 220px', minWidth: 220 }}><CardContent><Typography variant="subtitle1">Pending Trainings</Typography><Typography variant="h5">{pendingTrainings}</Typography></CardContent></Card>
            </Box>
            {/* Search/Filter Bar */}
            <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
              <TextField size="small" label="Search Employee or Title" value={''} onChange={e => {}} sx={{ minWidth: 220 }} />
              <TextField size="small" select label="Type" value={''} onChange={e => {}} sx={{ minWidth: 160 }}>
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Safety">Safety</MenuItem>
                <MenuItem value="First Aid">First Aid</MenuItem>
                <MenuItem value="Equipment">Equipment</MenuItem>
              </TextField>
              <TextField size="small" select label="Status" value={''} onChange={e => {}} sx={{ minWidth: 160 }}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="expiring">Expiring</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Box>
            {/* Training Table */}
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Employee</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Title</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Start</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>End</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Expiry</th>
                    <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.map((t, idx) => (
                    <tr key={t._id} style={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.employee?.name || t.employee || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.trainingType}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.title}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.startDate ? new Date(t.startDate).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.endDate ? new Date(t.endDate).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.expiryDate ? new Date(t.expiryDate).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <Button size="small" variant="outlined" onClick={() => handleOpenTrainingModal(t)}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => setDeleteTrainingId(t._id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trainings.length === 0 && <Typography align="center" sx={{ mt: 2 }}>No training records found.</Typography>}
            </Paper>
            {/* Add/Edit Training Modal */}
            <Dialog open={trainingModalOpen} onClose={handleCloseTrainingModal} maxWidth="sm" fullWidth>
              <DialogTitle>{editingTraining ? 'Edit Training' : 'Add Training'}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleSubmitTraining} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField 
                    select 
                    label="Employee" 
                    name="employee" 
                    value={trainingForm.employee} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth
                  >
                    <MenuItem value="">Select Employee</MenuItem>
                    {Array.isArray(employees) && employees.map((emp: any) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField label="Title" name="title" value={trainingForm.title} onChange={handleTrainingFormChange} required fullWidth />
                  
                  <TextField 
                    select 
                    label="Training Type" 
                    name="trainingType" 
                    value={trainingForm.trainingType} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth
                  >
                      <MenuItem value="">Select Type</MenuItem>
                      <MenuItem value="safety">Safety Training</MenuItem>
                      <MenuItem value="first_aid">First Aid</MenuItem>
                      <MenuItem value="fire_safety">Fire Safety</MenuItem>
                      <MenuItem value="emergency_response">Emergency Response</MenuItem>
                    <MenuItem value="technical">Technical Training</MenuItem>
                    <MenuItem value="compliance">Compliance Training</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                  </TextField>
                  
                  <TextField 
                    label="Description" 
                    name="description" 
                    value={trainingForm.description} 
                    onChange={handleTrainingFormChange} 
                    multiline 
                    rows={3}
                    required 
                    fullWidth 
                  />
                  
                  <Box display="flex" gap={2}>
                    <TextField 
                      label="Start Date" 
                      name="startDate" 
                      value={trainingForm.startDate} 
                      onChange={handleTrainingFormChange} 
                      type="date" 
                      InputLabelProps={{ shrink: true }} 
                      required 
                      fullWidth 
                    />
                    <TextField 
                      label="End Date" 
                      name="endDate" 
                      value={trainingForm.endDate} 
                      onChange={handleTrainingFormChange} 
                      type="date" 
                      InputLabelProps={{ shrink: true }} 
                      required 
                      fullWidth 
                    />
                  </Box>
                  
                  <Box display="flex" gap={2}>
                    <TextField 
                      label="Duration (hours)" 
                      name="duration" 
                      value={trainingForm.duration} 
                      onChange={handleTrainingFormChange} 
                      type="number" 
                      required 
                      fullWidth 
                    />
                    <TextField 
                      label="Cost" 
                      name="cost" 
                      value={trainingForm.cost} 
                      onChange={handleTrainingFormChange} 
                      type="number" 
                      required 
                      fullWidth 
                    />
                  </Box>
                  
                  <TextField 
                    label="Provider" 
                    name="provider" 
                    value={trainingForm.provider} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth 
                  />
                  
                  <TextField 
                    label="Location" 
                    name="location" 
                    value={trainingForm.location} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth 
                  />
                  
                  <TextField 
                    label="Instructor" 
                    name="instructor" 
                    value={trainingForm.instructor} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth 
                  />
                  
                  <TextField 
                    select 
                    label="Status" 
                    name="status" 
                    value={trainingForm.status} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
                  
                  <TextField 
                    label="Score" 
                    name="score" 
                    value={trainingForm.score} 
                    onChange={handleTrainingFormChange} 
                    type="number" 
                    fullWidth 
                    helperText="Enter score out of 100"
                  />
                  
                  <TextField 
                    select 
                    label="Result" 
                    name="result" 
                    value={trainingForm.result} 
                    onChange={handleTrainingFormChange} 
                    required 
                    fullWidth
                  >
                    <MenuItem value="not_applicable">Not Applicable</MenuItem>
                    <MenuItem value="pass">Pass</MenuItem>
                    <MenuItem value="fail">Fail</MenuItem>
                  </TextField>
                  
                  <TextField 
                    label="Notes" 
                    name="notes" 
                    value={trainingForm.notes} 
                    onChange={handleTrainingFormChange} 
                    multiline 
                    rows={2}
                    fullWidth 
                  />
                  
                  {error && <Alert severity="error">{error}</Alert>}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseTrainingModal}>Cancel</Button>
                <Button
                  onClick={handleSubmitTraining}
                  variant="contained"
                  color="primary"
                  disabled={trainingSubmitting}
                >
                  {editingTraining ? 'Update' : 'Add'}
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={!!trainingSuccess}
              autoHideDuration={3000}
              onClose={() => setTrainingSuccess('')}
              message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{trainingSuccess}</span>}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
            {/* Add Delete confirmation dialog for training records */}
            <Dialog open={!!deleteTrainingId} onClose={() => setDeleteTrainingId(null)}>
              <DialogTitle>Delete Training Record</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this training record?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteTrainingId(null)}>Cancel</Button>
                <Button color="error" variant="contained" onClick={async () => {
                  try {
                    await api.delete(`/hse/training/${deleteTrainingId}`);
                    setTrainingSuccess('Training deleted!');
                    setDeleteTrainingId(null);
                    setTrainingsLoading(true);
                    const res = await api.get('/hse/training');
                    setTrainings(Array.isArray(res.data) ? res.data : []);
                    setTrainingsLoading(false);
                  } catch (err: any) {
                    setTrainingsError(err.response?.data?.message || 'Failed to delete training');
                  }
                }}>Delete</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 4 && <Typography>Audit & Inspection Status (to be implemented)</Typography>}
        {tab === 5 && <Typography>Active Hazards / Risk Register (to be implemented)</Typography>}
        {tab === 6 && <Typography>Behavior-Based Safety (BBS) Tracking (to be implemented)</Typography>}
        {tab === 7 && <Typography>HSE Document Library (to be implemented)</Typography>}
        {tab === 8 && <Typography>Vehicle / Driver Safety Snapshot (to be implemented)</Typography>}
      </Box>
    </Box>
  );
};

// Incidents & Near Miss Log Table
const IncidentsNearMissLog: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    type: '',
    severity: '',
    date: '',
    location: '',
    description: '',
    involvedPersons: '',
    witnesses: '',
    immediateActions: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>('');
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/hse/incidents/${deleteId}`);
      setSuccess('Incident deleted!');
      fetchIncidents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete incident');
    } finally {
      setDeleteId(null);
    }
  };
  // Move fetchIncidents to top-level so it is available in all closures
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/hse/incidents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Filtering
  const filtered = incidents.filter(inc => {
    if (typeFilter && inc.type !== typeFilter) return false;
    if (statusFilter && inc.status !== statusFilter) return false;
    if (search && !(
      inc.title?.toLowerCase().includes(search.toLowerCase()) ||
      inc.location?.toLowerCase().includes(search.toLowerCase()) ||
      inc.description?.toLowerCase().includes(search.toLowerCase())
    )) return false;
    return true;
  });


  return (
    
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Incidents & Near Miss Log</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setReportOpen(true)}>
          Report Incident
        </Button>
      </Box>
      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Responsible</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(inc => (
                <TableRow
                  key={inc._id}
                  hover
                  style={{ background: inc.status === 'open' ? '#fdf2f2' : '#f0f0f0' }}
                >
                  <TableCell>{inc.type}</TableCell>
                  <TableCell>{inc.location}</TableCell>
                  <TableCell>{inc.date ? new Date(inc.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={inc.severity} 
                      color={getSeverityColor(inc.severity) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={inc.status} 
                      color={getStatusColor(inc.status) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{inc.assignedTo?.email || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => { setSelectedIncident(inc); setViewOpen(true); }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(inc._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Report Incident Modal */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Incident</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required fullWidth />
            <TextField select label="Type" name="type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required fullWidth>
              <MenuItem value="injury">Injury</MenuItem>
              <MenuItem value="accident">Accident</MenuItem>
              <MenuItem value="near_miss">Near Miss</MenuItem>
              <MenuItem value="property_damage">Property Damage</MenuItem>
              <MenuItem value="environmental">Environmental</MenuItem>
            </TextField>
            <TextField select label="Severity" name="severity" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} required fullWidth>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
            <TextField label="Date & Time" name="date" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Location" name="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required fullWidth />
            <TextField label="Description" name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required fullWidth multiline minRows={2} />
            <TextField label="Involved Persons (comma separated)" name="involvedPersons" value={form.involvedPersons} onChange={e => setForm({ ...form, involvedPersons: e.target.value })} fullWidth />
            <TextField label="Witnesses (comma separated)" name="witnesses" value={form.witnesses} onChange={e => setForm({ ...form, witnesses: e.target.value })} fullWidth />
            <TextField label="Immediate Actions" name="immediateActions" value={form.immediateActions} onChange={e => setForm({ ...form, immediateActions: e.target.value })} fullWidth />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              setSubmitting(true);
              setFormError('');
              try {
                await api.post('/hse/incidents', {
                  ...form,
                  involvedPersons: form.involvedPersons.split(',').map((s: string) => s.trim()).filter(Boolean),
                  witnesses: form.witnesses.split(',').map((s: string) => s.trim()).filter(Boolean),
                  date: form.date ? new Date(form.date) : undefined,
                });
                setReportOpen(false);
                setForm({ title: '', type: '', severity: '', date: '', location: '', description: '', involvedPersons: '', witnesses: '', immediateActions: '' });
                fetchIncidents();
              } catch (err: any) {
                setFormError(err.response?.data?.message || 'Failed to report incident');
              } finally {
                setSubmitting(false);
              }
            }}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Incident Modal */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Incident Details</DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Title</Typography>
              <Typography gutterBottom>{selectedIncident.title}</Typography>
              <Typography variant="subtitle2">Type</Typography>
              <Typography gutterBottom>{selectedIncident.type}</Typography>
              <Typography variant="subtitle2">Severity</Typography>
              <Typography gutterBottom>{selectedIncident.severity}</Typography>
              <Typography variant="subtitle2">Date</Typography>
              <Typography gutterBottom>{selectedIncident.date ? new Date(selectedIncident.date).toLocaleString() : '-'}</Typography>
              <Typography variant="subtitle2">Location</Typography>
              <Typography gutterBottom>{selectedIncident.location}</Typography>
              <Typography variant="subtitle2">Description</Typography>
              <Typography gutterBottom>{selectedIncident.description}</Typography>
              <Typography variant="subtitle2">Involved Persons</Typography>
              <Typography gutterBottom>{selectedIncident.involvedPersons?.join(', ')}</Typography>
              <Typography variant="subtitle2">Witnesses</Typography>
              <Typography gutterBottom>{selectedIncident.witnesses?.join(', ')}</Typography>
              <Typography variant="subtitle2">Immediate Actions</Typography>
              <Typography gutterBottom>{selectedIncident.immediateActions}</Typography>
              {/* Optionally show status, corrective actions, attachments, etc. */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Incident</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this incident?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'error';
    case 'critical': return 'secondary';
    default: return 'default';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'warning';
    case 'closed': return 'success';
    case 'in_progress': return 'info';
    case 'overdue': return 'error';
    default: return 'default';
  }
}



export default HSEDashboard; 