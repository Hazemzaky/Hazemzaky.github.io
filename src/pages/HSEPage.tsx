import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  IconButton, 
  Chip, 
  Alert, 
  Snackbar, 
  Card, 
  CardContent,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  Fab,
  InputAdornment,
  Divider,
  TableContainer
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SearchIcon from '@mui/icons-material/Search';
import AlertIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExportIcon from '@mui/icons-material/GetApp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';
import axios from 'axios';
import theme from '../theme';

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


const HSE_SECTIONS = [
  'Dashboard',
  'Accident & Incident',
  'Near Miss Log',
  'Emergency Readiness',
  'Training & Competency Summary',
  'Audit & Inspection Status',
  'HSE Document Library',
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
        await api.put(`/hse/incidents/${editingId}`, submitData);
        setSuccess('Incident updated successfully!');
      } else {
        await api.post('/hse/incidents', submitData);
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
      await api.delete(`/hse/incidents/${deleteId}`);
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
      await api.post('/hse/risk-assessments', form);
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
      
      await api.post('/hse/ppe', submitData);
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
      const res = await api.get<any[]>('/hse/safety-inspections');
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
      await api.post('/hse/safety-inspections', form);
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
      <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 2 }}>
        🔍 Audit & Inspection Status
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Monitor safety inspections, audits, and compliance assessments across all locations
      </Typography>
      
      {/* Safety Inspection Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              {totalInspections}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Inspections
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
              {openActions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open Actions
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
              {avgScore}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Score
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
              {overdueInspections}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overdue
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Action Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
          Inspection Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
            },
            transition: 'all 0.3s ease',
            borderRadius: theme.shape.borderRadius
          }}
        >
          Schedule Inspection
        </Button>
      </Box>
      
      {/* Safety Inspections Table */}
      <Paper 
        elevation={0}
        sx={{ 
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: theme.shape.borderRadius
        }}
      >
        <Box sx={{ 
          p: 2, 
          background: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            🔍 Safety Inspection Records ({filteredInspections.length} total)
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Inspector</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Inspection Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Overall Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Next Inspection</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInspections.map((inspection, idx) => (
                  <TableRow 
                    key={inspection._id}
                    sx={{ 
                      background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{inspection.title}</TableCell>
                    <TableCell>{inspection.location}</TableCell>
                    <TableCell>{inspection.inspector?.name || inspection.inspector?.email || inspection.inspector || '-'}</TableCell>
                    <TableCell>{inspection.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={inspection.status} 
                        color={getStatusColor(inspection.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${inspection.overallScore}%`} 
                        color={getScoreColor(inspection.overallScore) as any} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{inspection.nextInspectionDate ? new Date(inspection.nextInspectionDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: theme.palette.info.main,
                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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

// Cost calculation helper functions
const calculateAmortizedCost = (cost: number, amortization: number, startDate: Date, periodStart: Date, periodEnd: Date): number => {
  if (!amortization || amortization <= 0) return cost;
  
  // Calculate the monthly amortized amount
  const monthlyAmortizedAmount = cost / amortization;
  
  // Find the overlap between the training period and the reporting period
  const trainingStart = new Date(startDate);
  const trainingEnd = new Date(trainingStart.getTime() + (amortization * 30.44 * 24 * 60 * 60 * 1000)); // Approximate end date
  
  // Check if there's any overlap between training period and reporting period
  if (trainingStart > periodEnd || trainingEnd < periodStart) {
    return 0; // No overlap, no cost for this period
  }
  
  // Calculate the overlap period
  const overlapStart = new Date(Math.max(trainingStart.getTime(), periodStart.getTime()));
  const overlapEnd = new Date(Math.min(trainingEnd.getTime(), periodEnd.getTime()));
  
  // Calculate how many months of amortization fall within this period
  const overlapMonths = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  
  return monthlyAmortizedAmount * Math.max(0, overlapMonths);
};

const getFinancialYearStart = (date: Date): Date => {
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return new Date(year, 3, 1); // April 1st
};

const getFinancialYearEnd = (date: Date): Date => {
  const year = date.getMonth() >= 3 ? date.getFullYear() + 1 : date.getFullYear();
  return new Date(year, 2, 31); // March 31st
};

const getQuarterStart = (date: Date): Date => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
};

const getQuarterEnd = (date: Date): Date => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), (quarter + 1) * 3, 0);
};

const getHalfYearStart = (date: Date): Date => {
  const half = Math.floor(date.getMonth() / 6);
  return new Date(date.getFullYear(), half * 6, 1);
};

const getHalfYearEnd = (date: Date): Date => {
  const half = Math.floor(date.getMonth() / 6);
  return new Date(date.getFullYear(), (half + 1) * 6, 0);
};

const getWeekStart = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(new Date(date));
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
};

const TrainingCertifications: React.FC = () => {
  const muiTheme = useTheme();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
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
    status: 'scheduled',
    cost: '',
    amortization: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrainings();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get<{ employees: any[] }>('/employees');
      const employees = res.data.employees || [];
      setEmployees(Array.isArray(employees) ? employees : []);
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
    }
  };

  const fetchTrainings = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching trainings from /hse/training...');
      const token = localStorage.getItem('token');
      const res = await api.get<any[]>('/hse/training');
      console.log('Trainings response:', res.data);
      setTrainings(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch trainings:', err);
      setError(err.response?.data?.message || 'Failed to fetch trainings');
      setTrainings([]);
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
        amortization: Number(form.amortization),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      };
      
      if (editingTraining) {
        await api.put(`/hse/training/${editingTraining._id}`, trainingData);
        setSuccess('Training updated successfully!');
      } else {
        await api.post('/hse/training', trainingData);
        setSuccess('Training created successfully!');
      }
      
      fetchTrainings();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editingTraining ? 'update' : 'create'} training`);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleView = (training: any) => {
    setSelectedTraining(training);
    setViewOpen(true);
  };

  const handleEdit = (training: any) => {
    setEditingTraining(training);
    setForm({
      employee: training.employee?._id || training.employee || '',
      trainingType: training.trainingType || '',
      title: training.title || '',
      description: training.description || '',
      startDate: training.startDate ? training.startDate.slice(0, 10) : '',
      endDate: training.endDate ? training.endDate.slice(0, 10) : '',
      duration: training.duration?.toString() || '',
      provider: training.provider || '',
      location: training.location || '',
      status: training.status || 'scheduled',
      cost: training.cost?.toString() || '',
      amortization: training.amortization?.toString() || '',
      notes: training.notes || '',
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/hse/training/${deleteId}`);
      setSuccess('Training deleted successfully!');
      fetchTrainings();
      setDeleteId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete training');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTraining(null);
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
      status: 'scheduled',
      cost: '',
      amortization: '',
      notes: '',
    });
  };

  // Cost calculation functions
  const calculateDailyCost = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the daily portion
        const monthlyAmount = cost / amortization;
        const dailyAmount = monthlyAmount / 30.44; // Approximate days per month
        return total + dailyAmount;
      } else {
        // For non-amortized costs, only count if training is today
        if (trainingDate.toDateString() === today.toDateString()) {
          return total + cost;
        }
      }
      return total;
    }, 0);
  };

  const calculateWeeklyCost = (): number => {
    const today = new Date();
    const weekStart = getWeekStart(new Date(today));
    const weekEnd = getWeekEnd(new Date(today));

    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the weekly portion
        const monthlyAmount = cost / amortization;
        const weeklyAmount = monthlyAmount * (7 / 30.44); // Approximate weeks per month
        return total + weeklyAmount;
      } else {
        // For non-amortized costs, only count if training is in this week
        if (trainingDate >= weekStart && trainingDate <= weekEnd) {
          return total + cost;
        }
      }
      return total;
    }, 0);
  };

  const calculateMonthlyCost = (): number => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the monthly portion
        const monthlyAmount = cost / amortization;
        return total + monthlyAmount;
      } else {
        // For non-amortized costs, only count if training is in this month
        if (trainingDate >= monthStart && trainingDate <= monthEnd) {
          return total + cost;
        }
      }
      return total;
    }, 0);
  };

  const calculateQuarterlyCost = (): number => {
    const today = new Date();
    const quarterStart = getQuarterStart(today);
    const quarterEnd = getQuarterEnd(today);

    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the quarterly portion
        const monthlyAmount = cost / amortization;
        const quarterlyAmount = monthlyAmount * 3; // 3 months per quarter
        return total + quarterlyAmount;
      } else {
        // For non-amortized costs, only count if training is in this quarter
        if (trainingDate >= quarterStart && trainingDate <= quarterEnd) {
          return total + cost;
        }
      }
      return total;
    }, 0);
  };

  const calculateHalfYearCost = (): number => {
    const today = new Date();
    const halfYearStart = getHalfYearStart(today);
    const halfYearEnd = getHalfYearEnd(today);

    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the half-year portion
        const monthlyAmount = cost / amortization;
        const halfYearAmount = monthlyAmount * 6; // 6 months per half year
        return total + halfYearAmount;
      } else {
        // For non-amortized costs, only count if training is in this half year
        if (trainingDate >= halfYearStart && trainingDate <= halfYearEnd) {
          return total + cost;
        }
      }
      return total;
    }, 0);
  };

  const calculateAnnualCost = (): number => {
    const today = new Date();
    const financialYearStart = getFinancialYearStart(today);
    const financialYearEnd = getFinancialYearEnd(today);

    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the annual portion
        const monthlyAmount = cost / amortization;
        const annualAmount = monthlyAmount * 12; // 12 months per year
        return total + annualAmount;
      } else {
        // For non-amortized costs, only count if training is in this financial year
        if (trainingDate >= financialYearStart && trainingDate <= financialYearEnd) {
          return total + cost;
        }
      }
      return total;
    }, 0);
  };

  // Date range helper functions
  const getCurrentMonthName = (): string => {
    return new Date().toLocaleDateString('en-US', { month: 'long' });
  };

  const getCurrentQuarter = (): string => {
    const quarter = Math.floor(new Date().getMonth() / 3) + 1;
    return `Q${quarter}`;
  };

  const getCurrentHalfYear = (): string => {
    const half = Math.floor(new Date().getMonth() / 6) + 1;
    return `H${half}`;
  };

  const getWeekRange = (): string => {
    const today = new Date();
    const weekStart = getWeekStart(new Date(today));
    const weekEnd = getWeekEnd(new Date(today));
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getMonthRange = (): string => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return `${monthStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${monthEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getQuarterRange = (): string => {
    const today = new Date();
    const quarterStart = getQuarterStart(today);
    const quarterEnd = getQuarterEnd(today);
    
    return `${quarterStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${quarterEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getHalfYearRange = (): string => {
    const today = new Date();
    const halfYearStart = getHalfYearStart(today);
    const halfYearEnd = getHalfYearEnd(today);
    
    return `${halfYearStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${halfYearEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getFinancialYearRange = (): string => {
    const today = new Date();
    const financialYearStart = getFinancialYearStart(today);
    const financialYearEnd = getFinancialYearEnd(today);
    
    return `${financialYearStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${financialYearEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 2 }}>
        🎓 Training & Competency Summary
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Manage employee training programs, certifications, and competency development
      </Typography>
      
      {/* Training Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              {trainings.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Trainings
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
              {trainings.filter(t => t.status === 'completed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
              {trainings.filter(t => t.status === 'in_progress').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
              {trainings.filter(t => t.status === 'scheduled').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Action Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
          Training Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              console.log('Testing training API...');
              api.get('/hse/training').then(res => {
                console.log('API Test Response:', res.data);
              }).catch(err => {
                console.error('API Test Error:', err);
              });
            }}
            sx={{ 
              borderColor: theme.palette.info.main,
              color: theme.palette.info.main,
              '&:hover': {
                borderColor: theme.palette.info.dark,
                backgroundColor: alpha(theme.palette.info.main, 0.1)
              }
            }}
          >
            Test API
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.3s ease',
              borderRadius: theme.shape.borderRadius
            }}
          >
            Create Training
          </Button>
        </Box>
      </Box>
      
      {/* Training Table */}
      <Paper 
        elevation={0}
        sx={{ 
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: theme.shape.borderRadius
        }}
      >
        <Box sx={{ 
          p: 2, 
          background: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            📚 Training Records ({trainings.length} total)
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : trainings.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No training records found. Click "Create Training" to add a new training record.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Training Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Hours</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Cost</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Amortization</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.map((training, idx) => (
                  <TableRow 
                    key={training._id}
                    sx={{ 
                      background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{training.employee?.name || training.employee || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{training.title}</TableCell>
                    <TableCell>{training.trainingType}</TableCell>
                    <TableCell>{training.startDate ? new Date(training.startDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{training.endDate ? new Date(training.endDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{training.duration} hours</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.success.main }}>${training.cost?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{training.provider || '-'}</TableCell>
                    <TableCell>{training.amortization ? `${training.amortization} ${training.amortization === 1 ? 'Month' : 'Months'}` : '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={training.status} 
                        color={training.status === 'completed' ? 'success' : training.status === 'in_progress' ? 'warning' : 'info'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleView(training)}
                          sx={{ 
                            color: theme.palette.info.main,
                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(training)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => setDeleteId(training._id)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingTraining ? 'Edit Training' : 'Create Training'}</DialogTitle>
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
              {Array.isArray(employees) && employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField label="To Be Training Description" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
            
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
            
            <TextField 
              label="Total training hours" 
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
            
            <TextField 
              label="Training Provider" 
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
              select 
              label="Amortization" 
              name="amortization" 
              value={form.amortization} 
              onChange={handleFormChange} 
              required 
              fullWidth
            >
              <MenuItem value="">Select Amortization Period</MenuItem>
              {Array.from({ length: 60 }, (_, i) => i + 1).map((month) => (
                <MenuItem key={month} value={month}>
                  {month} {month === 1 ? 'Month' : 'Months'}
                </MenuItem>
              ))}
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

      {/* Cost Calculation Boxes */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
          💰 Training Cost Analysis
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          {/* Daily Cost Box */}
          <Card 
            elevation={0}
            sx={{ 
              background: alpha(theme.palette.primary.main, 0.05),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 1 }}>
                ${calculateDailyCost().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Today's Training Cost
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </CardContent>
          </Card>

          {/* Weekly Cost Box */}
          <Card 
            elevation={0}
            sx={{ 
              background: alpha(theme.palette.success.main, 0.05),
              border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700, mb: 1 }}>
                ${calculateWeeklyCost().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                This Week's Training Cost
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getWeekRange()}
              </Typography>
            </CardContent>
          </Card>

          {/* Monthly Cost Box */}
          <Card 
            elevation={0}
            sx={{ 
              background: alpha(theme.palette.warning.main, 0.05),
              border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.15)}`
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700, mb: 1 }}>
                ${calculateMonthlyCost().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {getCurrentMonthName()} Training Cost
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getMonthRange()}
              </Typography>
            </CardContent>
          </Card>

          {/* Quarterly Cost Box */}
          <Card 
            elevation={0}
            sx={{ 
              background: alpha(theme.palette.info.main, 0.05),
              border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700, mb: 1 }}>
                ${calculateQuarterlyCost().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {getCurrentQuarter()} Training Cost
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getQuarterRange()}
              </Typography>
            </CardContent>
          </Card>

          {/* Half-Year Cost Box */}
          <Card 
            elevation={0}
            sx={{ 
              background: alpha(theme.palette.secondary.main, 0.05),
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.15)}`
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1 }}>
                ${calculateHalfYearCost().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {getCurrentHalfYear()} Training Cost
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getHalfYearRange()}
              </Typography>
            </CardContent>
          </Card>

          {/* Annual Cost Box */}
          <Card 
            elevation={0}
            sx={{ 
              background: alpha(theme.palette.error.main, 0.05),
              border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.15)}`
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" sx={{ color: theme.palette.error.main, fontWeight: 700, mb: 1 }}>
                ${calculateAnnualCost().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Financial Year Training Cost
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getFinancialYearRange()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* View Training Modal */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Training Details</DialogTitle>
        <DialogContent>
          {selectedTraining && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Employee</Typography>
              <Typography gutterBottom sx={{ mb: 2 }}>
                {selectedTraining.employee?.name || selectedTraining.employee || '-'}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Training Title</Typography>
              <Typography gutterBottom sx={{ mb: 2 }}>{selectedTraining.title}</Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Training Type</Typography>
              <Typography gutterBottom sx={{ mb: 2 }}>{selectedTraining.trainingType}</Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
              <Typography gutterBottom sx={{ mb: 2 }}>{selectedTraining.description}</Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Start Date</Typography>
                  <Typography>{selectedTraining.startDate ? new Date(selectedTraining.startDate).toLocaleDateString() : '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>End Date</Typography>
                  <Typography>{selectedTraining.endDate ? new Date(selectedTraining.endDate).toLocaleDateString() : '-'}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Duration (Hours)</Typography>
                  <Typography>{selectedTraining.duration}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Cost</Typography>
                  <Typography>${selectedTraining.cost?.toFixed(2) || '0.00'}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Provider</Typography>
                  <Typography>{selectedTraining.provider || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Location</Typography>
                  <Typography>{selectedTraining.location || '-'}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Status</Typography>
                  <Chip 
                    label={selectedTraining.status} 
                    color={selectedTraining.status === 'completed' ? 'success' : selectedTraining.status === 'in_progress' ? 'warning' : 'info'} 
                    size="small" 
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Amortization</Typography>
                  <Typography>
                    {selectedTraining.amortization ? `${selectedTraining.amortization} ${selectedTraining.amortization === 1 ? 'Month' : 'Months'}` : '-'}
                  </Typography>
                </Box>
              </Box>
              
              {selectedTraining.notes && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Notes</Typography>
                  <Typography>{selectedTraining.notes}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Training</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this training record? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="error" style={{ marginRight: 8 }}>❌</span>{error}</span>}
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
      await api.post('/hse/environmental', environmentalData);
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
        // Mock data for now since the endpoint doesn't exist
        setStats({
          incidents: { total: 0, lti: 0, nearMiss: 0, vehicleAccident: 0 },
          openSafetyActions: 0,
          training: { expiring: 0 },
          auditScore: 'N/A',
          siteRiskLevels: {}
        });
      } catch (err: any) {
        setError('Failed to load dashboard data');
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
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch plans:', err);
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
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch contacts:', err);
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

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlansError('');
    try {
      const formData = new FormData();
      formData.append('title', planForm.title);
      formData.append('type', planForm.type);
      formData.append('description', planForm.description);
      formData.append('effectiveDate', planForm.effectiveDate);
      formData.append('expiryDate', planForm.expiryDate);
      formData.append('notes', planForm.notes);
      
      if (planForm.file && typeof planForm.file !== 'string') {
        formData.append('file', planForm.file);
      }

      if (editingPlan) {
        await api.put(`/hse/emergency-plans/${editingPlan._id}`, formData);
      } else {
        await api.post('/hse/emergency-plans', formData);
      }
      
      setPlanModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      console.error('Plan submission error:', err);
      setPlansError(err.response?.data?.message || 'Failed to save plan');
    }
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
        // Mock data for now since the endpoint doesn't exist
        setTrainings([]);
      } catch (err: any) {
        setTrainingsError('Failed to fetch trainings');
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
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  useEffect(() => {
    const fetchEmployees = async () => {
      setDriversLoading(true);
      try {
        const res = await api.get<{ employees: any[] }>('/employees?position=Driver');
        console.log('Drivers response:', res.data);
        // The API returns { employees: [...] } so we need to extract the employees array
        const drivers = res.data.employees || [];
        setDrivers(Array.isArray(drivers) ? drivers : []);
      } catch (err: any) {
        console.error('Failed to fetch drivers:', err);
        setDrivers([]);
      } finally {
        setDriversLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dashboard Header */}
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
            {/* Decorative background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                zIndex: 0
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Health, Safety & Environment
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Comprehensive HSE management system for workplace safety and compliance
                  </Typography>
                </Box>
              </Box>

              {/* HSE Metrics Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                      {getStat('totalIncidents')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      Total Incidents
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                      {getStat('openActions')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      Safety Actions
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                      {getStat('expiringTrainings')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      Training Expiring
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                      {getStat('auditScore')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      Audit Score
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                    },
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    borderRadius: theme.shape.borderRadius,
                    fontWeight: 600
                  }}
                >
                  Refresh Data
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ExportIcon />}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                    },
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    borderRadius: theme.shape.borderRadius,
                    fontWeight: 600
                  }}
                >
                  Export Reports
                </Button>
              </Box>
            </Box>
          </Paper>


          {/* Main Sections as Tabs */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, newTab) => setTab(newTab)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[2],
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontWeight: 500,
                  borderRadius: theme.shape.borderRadius,
                  mx: 0.5,
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)'
                  }
                },
                '& .Mui-selected': {
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: 0,
                },
              }}
            >
              {HSE_SECTIONS.map((section, idx) => (
                <Tab key={section} label={section} />
              ))}
            </Tabs>
          </Paper>

          {/* Section Content */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius,
              minHeight: 400
            }}
          >
            {tab === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                  🏥 HSE Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Welcome to the HSE Dashboard. Select a tab above to view specific sections and manage your health, safety, and environment operations.
                </Typography>
                
                {/* Enhanced Dashboard Cards Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
                  {HSE_DASHBOARD_CARDS.map(card => {
                    // Helper function to get color safely
                    const getColorValue = (colorKey: string) => {
                      const paletteColor = theme.palette[colorKey as keyof typeof theme.palette];
                      if (paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor) {
                        return (paletteColor as any).main;
                      }
                      return '#1976d2'; // fallback color
                    };
                    
                    const colorValue = getColorValue(card.color);
                    
                    return (
                      <Card 
                        key={card.key}
                        elevation={0}
                        sx={{ 
                          background: alpha(colorValue, 0.05),
                          border: `1px solid ${alpha(colorValue, 0.2)}`,
                          borderRadius: theme.shape.borderRadius,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${alpha(colorValue, 0.3)}`
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colorValue }}>
                            {getStat(card.key)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
            {tab === 1 && <AccidentIncident />}
            {tab === 2 && <NearMissLog />}
            {tab === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                  🚨 Emergency Readiness & Response
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                  Emergency plans, contacts, and response procedures for critical situations
                </Typography>
                
                {/* Emergency Readiness Snapshot */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    background: alpha(theme.palette.error.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.error.main, fontWeight: 600, mb: 3 }}>
                    🚨 Emergency Readiness Snapshot
                  </Typography>
                  
                  {/* Summary Cards */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        background: alpha(theme.palette.info.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.2)}`
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
                          N/A
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Drills Conducted
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      elevation={0}
                      sx={{ 
                        background: alpha(theme.palette.secondary.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.2)}`
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}>
                          {plans.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Emergency Plans
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      elevation={0}
                      sx={{ 
                        background: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                          N/A
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Site Maps
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      elevation={0}
                      sx={{ 
                        background: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        borderRadius: theme.shape.borderRadius,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.2)}`
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                          {contacts.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Emergency Contacts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  
                  {/* Emergency Plans Table */}
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    📋 Emergency Plans
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: theme.shape.borderRadius
                    }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      background: alpha(theme.palette.error.main, 0.05),
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                    }}>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                        🚨 Emergency Plans Management
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Plans: {plans.length}
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenPlanModal()}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                          },
                          transition: 'all 0.3s ease',
                          borderRadius: theme.shape.borderRadius
                        }}
                      >
                        Add Plan
                      </Button>
                    </Box>
                    
                    {plansLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : plansError ? (
                      <Alert severity="error">{plansError}</Alert>
                    ) : (
                      <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ background: alpha(theme.palette.error.main, 0.05) }}>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>File</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Effective</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Expiry</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(plans as any[]).map((plan: any, idx: number) => (
                              <TableRow 
                                key={plan._id}
                                sx={{ 
                                  background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.05)
                                  }
                                }}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>{plan.title}</TableCell>
                                <TableCell>{plan.type}</TableCell>
                                <TableCell>
                                  {plan.fileUrl ? (
                                    <Button 
                                      variant="outlined" 
                                      size="small"
                                      href={plan.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      sx={{ 
                                        borderRadius: theme.shape.borderRadius,
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                          borderColor: theme.palette.primary.dark,
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                        }
                                      }}
                                    >
                                      Download
                                    </Button>
                                  ) : '-'}
                                </TableCell>
                                <TableCell>{plan.effectiveDate ? new Date(plan.effectiveDate).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>{plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleOpenPlanModal(plan)}
                                    sx={{ 
                                      color: theme.palette.primary.main,
                                      '&:hover': { 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    onClick={() => setDeletePlanId(plan._id)}
                                    sx={{ 
                                      color: theme.palette.error.main,
                                      '&:hover': { 
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Paper>
              </Box>
            )}

            {/* Emergency Plan Modal */}
            <Dialog open={planModalOpen} onClose={() => setPlanModalOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>{editingPlan ? 'Edit Emergency Plan' : 'Add Emergency Plan'}</DialogTitle>
              <Box component="form" onSubmit={handleSubmitPlan}>
                <DialogContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                      label="Plan Title"
                      value={planForm.title}
                      onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Plan Type"
                      value={planForm.type}
                      onChange={(e) => setPlanForm({ ...planForm, type: e.target.value })}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Description"
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      multiline
                      rows={3}
                      fullWidth
                    />
                    <Box display="flex" gap={2}>
                      <TextField
                        label="Effective Date"
                        type="date"
                        value={planForm.effectiveDate}
                        onChange={(e) => setPlanForm({ ...planForm, effectiveDate: e.target.value })}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Expiry Date"
                        type="date"
                        value={planForm.expiryDate}
                        onChange={(e) => setPlanForm({ ...planForm, expiryDate: e.target.value })}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    <TextField
                      label="Notes"
                      value={planForm.notes}
                      onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                      multiline
                      rows={2}
                      fullWidth
                    />
                    {!editingPlan && (
                      <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                        {planForm.file ? (typeof planForm.file === 'string' ? planForm.file : planForm.file.name) : 'Choose File'}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => setPlanForm({ ...planForm, file: e.target.files?.[0] || null })}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        />
                      </Button>
                    )}
                    {plansError && <Alert severity="error">{plansError}</Alert>}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setPlanModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="contained">
                    {editingPlan ? 'Update' : 'Add Plan'}
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>

            {tab === 4 && <TrainingCertifications />}
            {tab === 5 && <SafetyInspections />}
            {tab === 6 && <HSEDocumentLibrary />}
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

// Accident & Incident Component
const AccidentIncident: React.FC = () => {
  const muiTheme = useTheme();
  const [accidents, setAccidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAccident, setSelectedAccident] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [form, setForm] = useState({
    serialNumber: '',
    date: '',
    description: '',
    driver: '',
    abbreviation: '',
    incidentSeverity: '',
    driverAtFault: '',
    damageDescription: '',
    directOrRootCause: '',
    actionTaken: '',
  });

  useEffect(() => {
    fetchAccidents();
    fetchDrivers();
  }, []);

  const fetchAccidents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any[]>('/hse/accidents');
      setAccidents(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accidents');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      console.log('Fetching drivers for AccidentIncident...');
      const res = await api.get<{ employees: any[] }>('/employees?position=Driver');
      console.log('Drivers response:', res.data);
      // The API returns { employees: [...] } so we need to extract the employees array
      const drivers = res.data.employees || [];
      setDrivers(Array.isArray(drivers) ? drivers : []);
    } catch (err: any) {
      console.error('Failed to fetch drivers:', err);
      setDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleOpen = (accident?: any) => {
    if (accident) {
      setEditingId(accident._id);
      setForm({
        serialNumber: accident.serialNumber || '',
        date: accident.date ? accident.date.slice(0, 10) : '',
        description: accident.description || '',
        driver: accident.driver || '',
        abbreviation: accident.abbreviation || '',
        incidentSeverity: accident.incidentSeverity || '',
        driverAtFault: accident.driverAtFault || '',
        damageDescription: accident.damageDescription || '',
        directOrRootCause: accident.directOrRootCause || '',
        actionTaken: accident.actionTaken || '',
      });
    } else {
      setEditingId(null);
      setForm({
        serialNumber: '',
        date: '',
        description: '',
        driver: '',
        abbreviation: '',
        incidentSeverity: '',
        driverAtFault: '',
        damageDescription: '',
        directOrRootCause: '',
        actionTaken: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({
      serialNumber: '',
      date: '',
      description: '',
      driver: '',
      abbreviation: '',
      incidentSeverity: '',
      driverAtFault: '',
      damageDescription: '',
      directOrRootCause: '',
      actionTaken: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/hse/accidents/${editingId}`, form);
        setSuccess('Accident updated successfully!');
      } else {
        await api.post('/hse/accidents', form);
        setSuccess('Accident reported successfully!');
      }
      handleClose();
      fetchAccidents();
    } catch (err: any) {
      console.error('Accident submission error:', err);
      setError(err.response?.data?.message || 'Failed to save accident');
    }
  };

  const handleView = (accident: any) => {
    setSelectedAccident(accident);
    setViewOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/hse/accidents/${deleteId}`);
      setSuccess('Accident deleted successfully!');
      fetchAccidents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete accident');
    } finally {
      setDeleteId(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Normal': return 'success';
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const getSeverityBackgroundColor = (severity: string) => {
    switch (severity) {
      case 'Normal': return '#e8f5e8'; // light green
      case 'Low': return '#2e7d32'; // dark green
      case 'Medium': return '#fff3cd'; // yellow
      case 'High': return '#f8d7da'; // red
      default: return '#f5f5f5';
    }
  };

  return (
    <Box sx={{ 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      minHeight: '100vh',
      p: 3
    }}>
      <AnimatePresence>
        {/* Dashboard Header */}
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
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
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
                    <ReportIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Accident & Incident Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Track and manage workplace accidents, incidents, and safety violations
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleOpen()}
                  sx={{ 
                    px: 3,
                    py: 1.5,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  Report Accident
                </Button>
              </Box>
              
              {/* Metrics Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 3 }}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {accidents.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Accidents
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.light }}>
                      {accidents.filter(a => a.incidentSeverity === 'High').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      High Severity
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.light }}>
                      {accidents.filter(a => a.incidentSeverity === 'Medium').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Medium Severity
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.light }}>
                      {accidents.filter(a => a.incidentSeverity === 'Low').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Low Severity
                    </Typography>
                  </CardContent>
                </Card>
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                📊 Accident Records
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Loading accidents...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Paper 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.error.main, 0.05),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    🚨 Accident & Incident Details ({accidents.length} records)
                  </Typography>
                </Box>
                
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: alpha(theme.palette.error.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Serial Number</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Driver</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Abbreviation</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Incident Severity</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Driver at Fault</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accidents.map((accident, idx) => (
                        <TableRow 
                          key={accident._id}
                          sx={{ 
                            background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.05)
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{accident.serialNumber}</TableCell>
                          <TableCell>{new Date(accident.date).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{accident.driver?.name || accident.driver}</TableCell>
                          <TableCell>{accident.abbreviation}</TableCell>
                          <TableCell>
                            <Chip 
                              label={accident.incidentSeverity} 
                              color={getSeverityColor(accident.incidentSeverity)}
                              size="small"
                              sx={{ 
                                backgroundColor: getSeverityBackgroundColor(accident.incidentSeverity),
                                color: accident.incidentSeverity === 'Low' ? 'white' : 'inherit',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>{accident.driverAtFault}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleView(accident)} 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              color="secondary" 
                              onClick={() => handleOpen(accident)} 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => setDeleteId(accident._id)} 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Add/Edit Accident Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Accident' : 'Report Accident'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                label="Serial Number" 
                name="serialNumber" 
                value={form.serialNumber} 
                onChange={handleFormChange} 
                required 
                fullWidth 
              />
              <TextField 
                label="Date" 
                name="date" 
                type="date" 
                value={form.date} 
                onChange={handleFormChange} 
                required 
                fullWidth 
                InputLabelProps={{ shrink: true }}
              />
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
              <TextField 
                select 
                label="Driver" 
                name="driver" 
                value={form.driver} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Driver</MenuItem>
                {driversLoading ? (
                  <MenuItem disabled>Loading drivers...</MenuItem>
                ) : (
                  Array.isArray(drivers) && drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField 
                select 
                label="Abbreviation" 
                name="abbreviation" 
                value={form.abbreviation} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Motor Vehicle Accident">Motor Vehicle Accident</MenuItem>
                <MenuItem value="Property Damage">Property Damage</MenuItem>
                <MenuItem value="Injury">Injury</MenuItem>
              </TextField>
              <TextField 
                select 
                label="Incident Severity" 
                name="incidentSeverity" 
                value={form.incidentSeverity} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Severity</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
              <TextField 
                select 
                label="Driver at Fault" 
                name="driverAtFault" 
                value={form.driverAtFault} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Fault Status</MenuItem>
                <MenuItem value="At Fault">At Fault</MenuItem>
                <MenuItem value="Not At Fault">Not At Fault</MenuItem>
              </TextField>
              <TextField 
                label="Damage Description" 
                name="damageDescription" 
                value={form.damageDescription} 
                onChange={handleFormChange} 
                multiline 
                rows={3}
                fullWidth 
              />
              <TextField 
                label="Direct or Root Cause" 
                name="directOrRootCause" 
                value={form.directOrRootCause} 
                onChange={handleFormChange} 
                multiline 
                rows={3}
                fullWidth 
              />
              <TextField 
                label="Action Taken" 
                name="actionTaken" 
                value={form.actionTaken} 
                onChange={handleFormChange} 
                multiline 
                rows={3}
                fullWidth 
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingId ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* View Accident Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Accident Details</DialogTitle>
        <DialogContent>
          {selectedAccident && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Serial Number</Typography>
              <Typography gutterBottom>{selectedAccident.serialNumber}</Typography>
              <Typography variant="subtitle2">Date</Typography>
              <Typography gutterBottom>{selectedAccident.date ? new Date(selectedAccident.date).toLocaleDateString() : '-'}</Typography>
              <Typography variant="subtitle2">Description</Typography>
              <Typography gutterBottom>{selectedAccident.description}</Typography>
              <Typography variant="subtitle2">Driver</Typography>
              <Typography gutterBottom>{selectedAccident.driver?.name || selectedAccident.driver}</Typography>
              <Typography variant="subtitle2">Abbreviation</Typography>
              <Typography gutterBottom>{selectedAccident.abbreviation}</Typography>
              <Typography variant="subtitle2">Incident Severity</Typography>
              <Typography gutterBottom>{selectedAccident.incidentSeverity}</Typography>
              <Typography variant="subtitle2">Driver at Fault</Typography>
              <Typography gutterBottom>{selectedAccident.driverAtFault}</Typography>
              <Typography variant="subtitle2">Damage Description</Typography>
              <Typography gutterBottom>{selectedAccident.damageDescription}</Typography>
              <Typography variant="subtitle2">Direct or Root Cause</Typography>
              <Typography gutterBottom>{selectedAccident.directOrRootCause}</Typography>
              <Typography variant="subtitle2">Action Taken</Typography>
              <Typography gutterBottom>{selectedAccident.actionTaken}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Accident</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this accident?</Typography>
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

// Near Miss Log Component
const NearMissLog: React.FC = () => {
  const muiTheme = useTheme();
  const [nearMisses, setNearMisses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNearMiss, setSelectedNearMiss] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [form, setForm] = useState({
    serialNumber: '',
    date: '',
    description: '',
    driver: '',
    abbreviation: '',
    incidentSeverity: '',
    driverAtFault: '',
    damageDescription: '',
    directOrRootCause: '',
    actionTaken: '',
  });

  useEffect(() => {
    fetchNearMisses();
    fetchDrivers();
  }, []);

  const fetchNearMisses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any[]>('/hse/near-misses');
      setNearMisses(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch near misses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      console.log('Fetching drivers for NearMissLog...');
      const res = await api.get<{ employees: any[] }>('/employees?position=Driver');
      console.log('Drivers response:', res.data);
      // The API returns { employees: [...] } so we need to extract the employees array
      const drivers = res.data.employees || [];
      setDrivers(Array.isArray(drivers) ? drivers : []);
    } catch (err: any) {
      console.error('Failed to fetch drivers:', err);
      setDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleOpen = (nearMiss?: any) => {
    if (nearMiss) {
      setEditingId(nearMiss._id);
      setForm({
        serialNumber: nearMiss.serialNumber || '',
        date: nearMiss.date ? nearMiss.date.slice(0, 10) : '',
        description: nearMiss.description || '',
        driver: nearMiss.driver || '',
        abbreviation: nearMiss.abbreviation || '',
        incidentSeverity: nearMiss.incidentSeverity || '',
        driverAtFault: nearMiss.driverAtFault || '',
        damageDescription: nearMiss.damageDescription || '',
        directOrRootCause: nearMiss.directOrRootCause || '',
        actionTaken: nearMiss.actionTaken || '',
      });
    } else {
      setEditingId(null);
      setForm({
        serialNumber: '',
        date: '',
        description: '',
        driver: '',
        abbreviation: '',
        incidentSeverity: '',
        driverAtFault: '',
        damageDescription: '',
        directOrRootCause: '',
        actionTaken: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm({
      serialNumber: '',
      date: '',
      description: '',
      driver: '',
      abbreviation: '',
      incidentSeverity: '',
      driverAtFault: '',
      damageDescription: '',
      directOrRootCause: '',
      actionTaken: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/hse/near-misses/${editingId}`, form);
        setSuccess('Near miss updated successfully!');
      } else {
        await api.post('/hse/near-misses', form);
        setSuccess('Near miss reported successfully!');
      }
      handleClose();
      fetchNearMisses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save near miss');
    }
  };

  const handleView = (nearMiss: any) => {
    setSelectedNearMiss(nearMiss);
    setViewOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/hse/near-misses/${deleteId}`);
      setSuccess('Near miss deleted successfully!');
      fetchNearMisses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete near miss');
    } finally {
      setDeleteId(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Normal': return 'success';
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const getSeverityBackgroundColor = (severity: string) => {
    switch (severity) {
      case 'Normal': return '#e8f5e8'; // light green
      case 'Low': return '#2e7d32'; // dark green
      case 'Medium': return '#fff3cd'; // yellow
      case 'High': return '#f8d7da'; // red
      default: return '#f5f5f5';
    }
  };

  return (
    <Box sx={{ 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      minHeight: '100vh',
      p: 3
    }}>
      <AnimatePresence>
        {/* Dashboard Header */}
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
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.info.main} 100%)`,
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
                    <WarningIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Near Miss Log Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Track and prevent potential incidents before they occur
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleOpen()}
                  sx={{ 
                    px: 3,
                    py: 1.5,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  Report Near Miss
                </Button>
              </Box>
              
              {/* Metrics Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 3 }}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {nearMisses.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Near Misses
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.light }}>
                      {nearMisses.filter(n => n.incidentSeverity === 'High').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      High Risk
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.light }}>
                      {nearMisses.filter(n => n.incidentSeverity === 'Medium').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Medium Risk
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: theme.shape.borderRadius
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.light }}>
                      {nearMisses.filter(n => n.incidentSeverity === 'Low').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Low Risk
                    </Typography>
                  </CardContent>
                </Card>
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                📊 Near Miss Records
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Loading near misses...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Paper 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: theme.shape.borderRadius
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  background: alpha(theme.palette.warning.main, 0.05),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                    ⚠️ Near Miss Details ({nearMisses.length} records)
                  </Typography>
                </Box>
                
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: alpha(theme.palette.warning.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Serial Number</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Driver</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Abbreviation</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Incident Severity</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Driver at Fault</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {nearMisses.map((nearMiss, idx) => (
                        <TableRow 
                          key={nearMiss._id}
                          sx={{ 
                            background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.warning.main, 0.05)
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{nearMiss.serialNumber}</TableCell>
                          <TableCell>{new Date(nearMiss.date).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{nearMiss.driver?.name || nearMiss.driver}</TableCell>
                          <TableCell>{nearMiss.abbreviation}</TableCell>
                          <TableCell>
                            <Chip 
                              label={nearMiss.incidentSeverity} 
                              color={getSeverityColor(nearMiss.incidentSeverity)}
                              size="small"
                              sx={{ 
                                backgroundColor: getSeverityBackgroundColor(nearMiss.incidentSeverity),
                                color: nearMiss.incidentSeverity === 'Low' ? 'white' : 'inherit',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>{nearMiss.driverAtFault}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleView(nearMiss)} 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              color="secondary" 
                              onClick={() => handleOpen(nearMiss)} 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => setDeleteId(nearMiss._id)} 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Add/Edit Near Miss Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Near Miss' : 'Report Near Miss'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                label="Serial Number" 
                name="serialNumber" 
                value={form.serialNumber} 
                onChange={handleFormChange} 
                required 
                fullWidth 
              />
              <TextField 
                label="Date" 
                name="date" 
                type="date" 
                value={form.date} 
                onChange={handleFormChange} 
                required 
                fullWidth 
                InputLabelProps={{ shrink: true }}
              />
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
              <TextField 
                select 
                label="Driver" 
                name="driver" 
                value={form.driver} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Driver</MenuItem>
                {driversLoading ? (
                  <MenuItem disabled>Loading drivers...</MenuItem>
                ) : (
                  Array.isArray(drivers) && drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField 
                select 
                label="Abbreviation" 
                name="abbreviation" 
                value={form.abbreviation} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Motor Vehicle Accident">Motor Vehicle Accident</MenuItem>
                <MenuItem value="Property Damage">Property Damage</MenuItem>
                <MenuItem value="Injury">Injury</MenuItem>
              </TextField>
              <TextField 
                select 
                label="Incident Severity" 
                name="incidentSeverity" 
                value={form.incidentSeverity} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Severity</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
              <TextField 
                select 
                label="Driver at Fault" 
                name="driverAtFault" 
                value={form.driverAtFault} 
                onChange={handleFormChange} 
                required 
                fullWidth
              >
                <MenuItem value="">Select Fault Status</MenuItem>
                <MenuItem value="At Fault">At Fault</MenuItem>
                <MenuItem value="Not At Fault">Not At Fault</MenuItem>
              </TextField>
              <TextField 
                label="Damage Description" 
                name="damageDescription" 
                value={form.damageDescription} 
                onChange={handleFormChange} 
                multiline 
                rows={3}
                fullWidth 
              />
              <TextField 
                label="Direct or Root Cause" 
                name="directOrRootCause" 
                value={form.directOrRootCause} 
                onChange={handleFormChange} 
                multiline 
                rows={3}
                fullWidth 
              />
              <TextField 
                label="Action Taken" 
                name="actionTaken" 
                value={form.actionTaken} 
                onChange={handleFormChange} 
                multiline 
                rows={3}
                fullWidth 
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingId ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* View Near Miss Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Near Miss Details</DialogTitle>
        <DialogContent>
          {selectedNearMiss && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Serial Number</Typography>
              <Typography gutterBottom>{selectedNearMiss.serialNumber}</Typography>
              <Typography variant="subtitle2">Date</Typography>
              <Typography gutterBottom>{selectedNearMiss.date ? new Date(selectedNearMiss.date).toLocaleDateString() : '-'}</Typography>
              <Typography variant="subtitle2">Description</Typography>
              <Typography gutterBottom>{selectedNearMiss.description}</Typography>
              <Typography variant="subtitle2">Driver</Typography>
              <Typography gutterBottom>{selectedNearMiss.driver?.name || selectedNearMiss.driver}</Typography>
              <Typography variant="subtitle2">Abbreviation</Typography>
              <Typography gutterBottom>{selectedNearMiss.abbreviation}</Typography>
              <Typography variant="subtitle2">Incident Severity</Typography>
              <Typography gutterBottom>{selectedNearMiss.incidentSeverity}</Typography>
              <Typography variant="subtitle2">Driver at Fault</Typography>
              <Typography gutterBottom>{selectedNearMiss.driverAtFault}</Typography>
              <Typography variant="subtitle2">Damage Description</Typography>
              <Typography gutterBottom>{selectedNearMiss.damageDescription}</Typography>
              <Typography variant="subtitle2">Direct or Root Cause</Typography>
              <Typography gutterBottom>{selectedNearMiss.directOrRootCause}</Typography>
              <Typography variant="subtitle2">Action Taken</Typography>
              <Typography gutterBottom>{selectedNearMiss.actionTaken}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Near Miss</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this near miss?</Typography>
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

const HSEDocumentLibrary: React.FC = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Folder management state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [folderForm, setFolderForm] = useState({ name: '', description: '', parentFolder: '' });
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  
  // Document management state
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    folder: '',
    documentType: '',
    cost: '',
    amortization: '',
    startDate: '',
    endDate: '',
    tags: '',
    version: '1.0',
    status: 'draft'
  });
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // View state
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, []);

  const fetchFolders = async () => {
    try {
      console.log('Fetching folders from Railway backend...');
      const res = await api.get<any[]>('/hse/document-folders');
      console.log('Folders response:', res.data);
      setFolders(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch folders:', err);
      console.error('Error details:', err.response?.data);
      setError(`Failed to fetch folders: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFolder) params.append('folder', selectedFolder);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('documentType', typeFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await api.get<any[]>(`/hse/documents?${params.toString()}`);
      setDocuments(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Folder handlers
  const handleOpenFolderModal = (folder?: any) => {
    console.log('Opening folder modal, folder:', folder);
    if (folder) {
      setEditingFolder(folder);
      setFolderForm({
        name: folder.name,
        description: folder.description || '',
        parentFolder: folder.parentFolder?._id || ''
      });
    } else {
      setEditingFolder(null);
      setFolderForm({ name: '', description: '', parentFolder: '' });
    }
    setFolderModalOpen(true);
    console.log('Modal state set to:', true);
  };

  const handleSubmitFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting folder form:', folderForm);
    console.log('Form data details:', {
      name: folderForm.name,
      description: folderForm.description,
      parentFolder: folderForm.parentFolder,
      nameType: typeof folderForm.name,
      descriptionType: typeof folderForm.description,
      parentFolderType: typeof folderForm.parentFolder
    });
    console.log('API endpoint:', editingFolder ? `/hse/document-folders/${editingFolder._id}` : '/hse/document-folders');
    
    try {
      // Clean up the form data - convert empty string to null for parentFolder
      const cleanFormData = {
        ...folderForm,
        parentFolder: folderForm.parentFolder || null
      };
      
      if (editingFolder) {
        console.log('Updating existing folder:', editingFolder._id);
        const res = await api.put(`/hse/document-folders/${editingFolder._id}`, cleanFormData);
        console.log('Update response:', res.data);
        setSuccess('Folder updated successfully!');
      } else {
        console.log('Creating new folder on Railway backend...');
        console.log('Original form data:', folderForm);
        console.log('Cleaned form data:', cleanFormData);
        console.log('Sending data to Railway:', JSON.stringify(cleanFormData, null, 2));
        const res = await api.post('/hse/document-folders', cleanFormData);
        console.log('Create response:', res.data);
        setSuccess('Folder created successfully!');
      }
      setFolderModalOpen(false);
      fetchFolders();
    } catch (err: any) {
      console.error('Error submitting folder:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Full error object:', err);
      console.error('Error response data:', JSON.stringify(err.response?.data, null, 2));
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      setError(`Failed to save folder: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    try {
      await api.delete(`/hse/document-folders/${deleteFolderId}`);
      setSuccess('Folder deleted successfully!');
      setDeleteFolderId(null);
      fetchFolders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete folder');
    }
  };

  // Document handlers
  const handleOpenDocumentModal = (document?: any) => {
    if (document) {
      setEditingDocument(document);
      setDocumentForm({
        title: document.title,
        description: document.description || '',
        folder: document.folder?._id || '',
        documentType: document.documentType,
        cost: document.cost?.toString() || '',
        amortization: document.amortization?.toString() || '',
        startDate: document.startDate ? document.startDate.slice(0, 10) : '',
        endDate: document.endDate ? document.endDate.slice(0, 10) : '',
        tags: document.tags?.join(', ') || '',
        version: document.version || '1.0',
        status: document.status
      });
    } else {
      setEditingDocument(null);
      setDocumentForm({
        title: '',
        description: '',
        folder: '',
        documentType: '',
        cost: '',
        amortization: '',
        startDate: '',
        endDate: '',
        tags: '',
        version: '1.0',
        status: 'draft'
      });
    }
    setSelectedFile(null);
    setDocumentModalOpen(true);
  };

  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', documentForm.title);
      formData.append('description', documentForm.description);
      formData.append('folder', documentForm.folder);
      formData.append('documentType', documentForm.documentType);
      formData.append('cost', documentForm.cost);
      formData.append('amortization', documentForm.amortization);
      formData.append('startDate', documentForm.startDate);
      formData.append('endDate', documentForm.endDate);
      formData.append('tags', documentForm.tags);
      formData.append('version', documentForm.version);
      formData.append('status', documentForm.status);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      if (editingDocument) {
        await api.put(`/hse/documents/${editingDocument._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Document updated successfully!');
      } else {
        await api.post('/hse/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Document uploaded successfully!');
      }
      setDocumentModalOpen(false);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save document');
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocumentId) return;
    try {
      await api.delete(`/hse/documents/${deleteDocumentId}`);
      setSuccess('Document deleted successfully!');
      setDeleteDocumentId(null);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      await api.post(`/hse/documents/${documentId}/approve`);
      setSuccess('Document approved successfully!');
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve document');
    }
  };

  const getFolderPath = (folder: any) => {
    if (folder.parentFolder) {
      return `${folder.parentFolder.path}/${folder.name}`;
    }
    return folder.name;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'policy': return 'primary';
      case 'standard': return 'secondary';
      case 'procedure': return 'info';
      case 'guideline': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 2 }}>
        📚 HSE Document Library
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Manage HSE policies, procedures, standards, and compliance documentation
      </Typography>
      
      {/* Document Library Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              {folders.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Folders
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
              {documents.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Documents
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
              {documents.filter(d => d.status === 'draft').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Draft Documents
            </Typography>
          </CardContent>
        </Card>
        
        <Card 
          elevation={0}
          sx={{ 
            background: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.2)}`
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
              {documents.filter(d => d.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Documents
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
          Document Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              console.log('Add Folder button clicked');
              handleOpenFolderModal();
            }}
            sx={{ 
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              '&:hover': {
                borderColor: theme.palette.secondary.dark,
                backgroundColor: alpha(theme.palette.secondary.main, 0.1)
              }
            }}
          >
            Add Folder
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleOpenDocumentModal()}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.3s ease',
              borderRadius: theme.shape.borderRadius
            }}
          >
            Upload Document
          </Button>
        </Box>
      </Box>
      
      {/* Enhanced Filters and Search */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          background: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          borderRadius: theme.shape.borderRadius
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
          🔍 Search & Filter Options
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            label="Search Documents"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="policy">Policy</MenuItem>
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="procedure">Procedure</MenuItem>
            <MenuItem value="guideline">Guideline</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="form">Form</MenuItem>
            <MenuItem value="checklist">Checklist</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <Button 
            variant="outlined" 
            onClick={fetchDocuments}
            sx={{ 
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              '&:hover': {
                borderColor: theme.palette.success.dark,
                backgroundColor: alpha(theme.palette.success.main, 0.1)
              }
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Paper>

      {/* Enhanced Folders and Documents Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        {/* Enhanced Folders Section */}
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.secondary.main, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                📁 Document Folders ({folders.length} total)
              </Typography>
            </Box>
            <Box sx={{ p: 2, maxHeight: 400, overflowY: 'auto' }}>
              {folders.map((folder) => (
                <Box
                  key={folder._id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    cursor: 'pointer',
                    backgroundColor: selectedFolder === folder._id ? alpha(theme.palette.secondary.main, 0.1) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                      borderColor: theme.palette.secondary.main,
                      transform: 'translateX(4px)'
                    }
                  }}
                  onClick={() => setSelectedFolder(selectedFolder === folder._id ? null : folder._id)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {folder.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getFolderPath(folder)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleOpenFolderModal(folder); }}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); setDeleteFolderId(folder._id); }}
                        sx={{ 
                          color: theme.palette.error.main,
                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Enhanced Documents Section */}
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Box sx={{ 
              p: 2, 
              background: alpha(theme.palette.primary.main, 0.05),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                📄 Documents {selectedFolder && `in ${folders.find(f => f._id === selectedFolder)?.name}`} ({documents.length} total)
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Amortization</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc, idx) => (
                      <TableRow 
                        key={doc._id}
                        sx={{ 
                          background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {doc.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.folder?.path}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.documentType} 
                            color={getTypeColor(doc.documentType) as any} 
                            size="small" 
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.status} 
                            color={getStatusColor(doc.status) as any} 
                            size="small" 
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          ${doc.cost?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>{doc.amortization} months</TableCell>
                        <TableCell>{doc.startDate ? new Date(doc.startDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{doc.endDate ? new Date(doc.endDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                              sx={{ 
                                color: theme.palette.info.main,
                                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDocumentModal(doc)}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            {doc.status === 'draft' && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleApproveDocument(doc._id)}
                                sx={{ 
                                  color: theme.palette.success.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
                                }}
                              >
                                <SaveAltIcon />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              onClick={() => setDeleteDocumentId(doc._id)}
                              sx={{ 
                                color: theme.palette.error.main,
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Add/Edit Folder Modal */}
      <Dialog open={folderModalOpen} onClose={() => setFolderModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFolder ? 'Edit Folder' : 'Add Folder'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitFolder} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Folder Name"
              value={folderForm.name}
              onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Parent Folder"
              value={folderForm.parentFolder}
              onChange={(e) => setFolderForm({ ...folderForm, parentFolder: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Root Level</MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder._id} value={folder._id}>
                  {getFolderPath(folder)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={folderForm.description}
              onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setFolderModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingFolder ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Document Modal */}
      <Dialog open={documentModalOpen} onClose={() => setDocumentModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingDocument ? 'Edit Document' : 'Upload Document'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmitDocument}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Document Title"
                value={documentForm.title}
                onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={documentForm.description}
                onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
              <Box display="flex" gap={2}>
                <TextField
                  select
                  label="Folder"
                  value={documentForm.folder}
                  onChange={(e) => setDocumentForm({ ...documentForm, folder: e.target.value })}
                  required
                  fullWidth
                >
                  <MenuItem value="">Select Folder</MenuItem>
                  {folders.map((folder) => (
                    <MenuItem key={folder._id} value={folder._id}>
                      {getFolderPath(folder)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Document Type"
                  value={documentForm.documentType}
                  onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                  required
                  fullWidth
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="policy">Policy</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="procedure">Procedure</MenuItem>
                  <MenuItem value="guideline">Guideline</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="form">Form</MenuItem>
                  <MenuItem value="checklist">Checklist</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Box>
              
              {/* Required HSE Fields */}
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>HSE Document Details</Typography>
              <Box display="flex" gap={2}>
                <TextField
                  label="Cost ($)"
                  type="number"
                  value={documentForm.cost}
                  onChange={(e) => setDocumentForm({ ...documentForm, cost: e.target.value })}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  label="Amortization (months)"
                  type="number"
                  value={documentForm.amortization}
                  onChange={(e) => setDocumentForm({ ...documentForm, amortization: e.target.value })}
                  required
                  fullWidth
                  inputProps={{ min: 1, max: 120 }}
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={documentForm.startDate}
                  onChange={(e) => setDocumentForm({ ...documentForm, startDate: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={documentForm.endDate}
                  onChange={(e) => setDocumentForm({ ...documentForm, endDate: e.target.value })}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <Box display="flex" gap={2}>
                <TextField
                  label="Version"
                  value={documentForm.version}
                  onChange={(e) => setDocumentForm({ ...documentForm, version: e.target.value })}
                  fullWidth
                />
                <TextField
                  select
                  label="Status"
                  value={documentForm.status}
                  onChange={(e) => setDocumentForm({ ...documentForm, status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </TextField>
              </Box>
              
              <TextField
                label="Tags (comma separated)"
                value={documentForm.tags}
                onChange={(e) => setDocumentForm({ ...documentForm, tags: e.target.value })}
                fullWidth
                helperText="Enter tags separated by commas"
              />
              
              {!editingDocument && (
                <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                  {selectedFile ? selectedFile.name : 'Choose File'}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  />
                </Button>
              )}
              
              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingDocument ? 'Update' : 'Upload'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <Dialog open={!!deleteFolderId} onClose={() => setDeleteFolderId(null)}>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this folder?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFolderId(null)}>Cancel</Button>
          <Button onClick={handleDeleteFolder} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Document Confirmation */}
      <Dialog open={!!deleteDocumentId} onClose={() => setDeleteDocumentId(null)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this document?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDocumentId(null)}>Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error" variant="contained">Delete</Button>
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

export default HSEDashboard; 