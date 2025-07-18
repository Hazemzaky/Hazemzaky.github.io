import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Typography, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Select, FormControl, InputLabel, Alert, CircularProgress, SelectChangeEvent, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../apiBase';

interface QuotationLine {
  description: string;
  unitPrice: number;
  worktime: string;
  quantity: number;
  total: number;
}

interface Client {
  _id: string;
  name: string;
  type: 'quotation' | 'contract';
  rfqDate?: string;
  quotations: any[];
  contracts: any[];
  quotationData?: {
    lines: QuotationLine[];
    paymentTerms: string;
    paymentMethod: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    quotationFile?: string;
    quotationFileName?: string;
  };
  contractData?: {
    startDate: string;
    endDate: string;
    paymentTerms: string;
    status: string;
    priceList: any[];
    contractFile?: string;
    contractFileName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuotationForm {
  clientName: string;
  rfqDate: string;
  lines: QuotationLine[];
  paymentTerms: string;
  paymentMethod: string;
  quotationCase: string;
  quotationFile?: File;
}

const paymentTermsOptions = [
  { value: '30_day', label: '30 day' },
  { value: '60_day', label: '60 day' },
  { value: 'work_done', label: 'When the work done' },
];

const paymentMethodOptions = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

const quotationCaseOptions = [
  { value: 'yes', label: 'Approved: Yes' },
  { value: 'no', label: 'Approved: No' },
];

const ClientsPage: React.FC = () => {
  const [openQuotationModal, setOpenQuotationModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<QuotationForm>({
    clientName: '',
    rfqDate: '',
    lines: [],
    paymentTerms: '',
    paymentMethod: '',
    quotationCase: 'no',
    quotationFile: undefined,
  });
  const [line, setLine] = useState<QuotationLine>({ 
    description: '', 
    unitPrice: 0, 
    worktime: '', 
    quantity: 0, 
    total: 0 
  });

  // 1. Add state for contract modal, contract form, and price list
  const [openContractModal, setOpenContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    clientName: '',
    startDate: '',
    endDate: '',
    paymentTerms: '',
    status: '',
    contractFile: undefined as File | undefined,
    priceList: [] as any[],
  });
  const [priceItem, setPriceItem] = useState({
    description: '',
    rentType: '',
    workHours: '',
    driversOperators: '',
    unitPrice: '',
    overtime: '',
  });

  // Add state for tab
  const [tab, setTab] = useState<'quotation' | 'contract'>('quotation');

  // Filtered client lists
  const quotationClients = clients.filter(c => c.type === 'quotation');
  const contractClients = clients.filter(c => c.type === 'contract');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/clients');
      setClients(response.data as Client[]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuotationModal = () => {
    setForm({ 
      clientName: '', 
      rfqDate: '', 
      lines: [], 
      paymentTerms: '', 
      paymentMethod: '', 
      quotationCase: 'no',
      quotationFile: undefined
    });
    setLine({ 
      description: '', 
      unitPrice: 0, 
      worktime: '', 
      quantity: 0, 
      total: 0 
    });
    setError(null);
    setSuccess(null);
    setOpenQuotationModal(true);
  };

  const handleCloseQuotationModal = () => setOpenQuotationModal(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value }));
  };

  // Dedicated handler for MUI Select
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, quotationFile: file }));
    }
  };

  const handleLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = name === 'unitPrice' || name === 'quantity' ? parseFloat(value) || 0 : value;
    setLine(prev => ({ 
      ...prev, 
      [name]: numValue,
      total: name === 'unitPrice' || name === 'quantity' ? 
        (name === 'unitPrice' ? Number(numValue) * Number(prev.quantity) : Number(prev.unitPrice) * Number(numValue)) : 
        prev.total
    }));
  };

  const handleAddLine = () => {
    if (!line.description || line.unitPrice <= 0 || !line.worktime || line.quantity <= 0) {
      setError('Please fill all line item fields with valid values');
      return;
    }
    setForm(prev => ({ ...prev, lines: [...prev.lines, { ...line, total: line.unitPrice * line.quantity }] }));
    setLine({ description: '', unitPrice: 0, worktime: '', quantity: 0, total: 0 });
    setError(null);
  };

  const handleRemoveLine = (idx: number) => {
    setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== idx) }));
  };

  const handleSubmitQuotation = async () => {
    if (!form.clientName) {
      setError('Client Name is required');
      return;
    }
    if (!form.rfqDate) {
      setError('RFQ Date is required');
      return;
    }
    if (form.lines.length === 0) {
      setError('At least one Quotation Line is required');
      return;
    }
    if (!form.paymentTerms) {
      setError('Payment Terms are required');
      return;
    }
    if (!form.paymentMethod) {
      setError('Payment Method is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Add file if present
      if (form.quotationFile) {
        formData.append('quotationFile', form.quotationFile);
      }
      
      // Add client data
      const clientData = {
        name: form.clientName,
        type: 'quotation' as const,
        rfqDate: form.rfqDate,
        quotationData: {
          lines: form.lines,
          paymentTerms: form.paymentTerms,
          paymentMethod: form.paymentMethod,
          approvalStatus: form.quotationCase === 'yes' ? 'approved' : 'pending'
        }
      };
      
      formData.append('data', JSON.stringify(clientData));

      await api.post('/clients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Client created successfully!');
      setOpenQuotationModal(false);
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/clients/${clientId}`);
      setSuccess('Client deleted successfully!');
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseToggle = async (clientId: string, currentStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      await api.put(`/clients/${clientId}`, {
        quotationData: { approvalStatus: newStatus }
      });
      setSuccess('Status updated successfully!');
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // 2. Add handlers for contract modal
  const handleOpenContractModal = () => {
    setContractForm({
      clientName: '',
      startDate: '',
      endDate: '',
      paymentTerms: '',
      status: '',
      contractFile: undefined,
      priceList: [],
    });
    setPriceItem({
      description: '',
      rentType: '',
      workHours: '',
      driversOperators: '',
      unitPrice: '',
      overtime: '',
    });
    setOpenContractModal(true);
  };
  const handleCloseContractModal = () => setOpenContractModal(false);
  const handleContractFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContractForm(prev => ({ ...prev, [name]: value }));
  };
  const handleContractSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setContractForm(prev => ({ ...prev, [name]: value }));
  };
  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setContractForm(prev => ({ ...prev, contractFile: file }));
  };
  // 3. Price list handlers
  const handlePriceItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPriceItem(prev => ({ ...prev, [name]: value }));
  };
  const handlePriceItemSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setPriceItem(prev => ({ ...prev, [name]: value }));
  };
  const handleAddPriceItem = () => {
    if (!priceItem.description || !priceItem.rentType || !priceItem.workHours || !priceItem.driversOperators || !priceItem.unitPrice) {
      setError('Fill all price list fields');
      return;
    }
    setContractForm(prev => ({ ...prev, priceList: [...prev.priceList, { ...priceItem, unitPrice: Number(priceItem.unitPrice), overtime: Number(priceItem.overtime) }] }));
    setPriceItem({ description: '', rentType: '', workHours: '', driversOperators: '', unitPrice: '', overtime: '' });
  };
  const handleRemovePriceItem = (idx: number) => {
    setContractForm(prev => ({ ...prev, priceList: prev.priceList.filter((_, i) => i !== idx) }));
  };
  // 4. Submit contract client
  const handleSubmitContract = async () => {
    if (!contractForm.clientName || !contractForm.startDate || !contractForm.endDate || !contractForm.paymentTerms || !contractForm.status || contractForm.priceList.length === 0) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (contractForm.contractFile) formData.append('contractFile', contractForm.contractFile);
      const clientData = {
        name: contractForm.clientName,
        type: 'contract' as const,
        contractData: {
          startDate: contractForm.startDate,
          endDate: contractForm.endDate,
          paymentTerms: contractForm.paymentTerms,
          status: contractForm.status,
          priceList: contractForm.priceList,
        },
      };
      formData.append('data', JSON.stringify(clientData));
      await api.post('/clients/contract', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Contract client created!');
      setOpenContractModal(false);
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create contract client');
    } finally {
      setLoading(false);
    }
  };

  if (loading && clients.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Clients</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Quotation-Based Clients" value="quotation" />
        <Tab label="Contract-Based Clients" value="contract" />
      </Tabs>
      <Box display="flex" gap={2} mb={3}>
        {tab === 'quotation' && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleOpenQuotationModal}
            disabled={loading}
          >
            Add Quotation-Based Client
          </Button>
        )}
        {tab === 'contract' && (
          <Button variant="outlined" color="secondary" startIcon={<AddIcon />} onClick={handleOpenContractModal} disabled={loading}>
            Add Contract-Based Client
          </Button>
        )}
      </Box>
      {tab === 'quotation' && (
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Client Name</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Type</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>RFQ Date</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Payment Terms</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Payment Method</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Quotation File</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Status</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotationClients.map((client) => (
              <TableRow key={client._id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.name}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.type}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.rfqDate ? new Date(client.rfqDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.quotationData?.paymentTerms || '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.quotationData?.paymentMethod || '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                  {client.quotationData?.quotationFileName ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(`http://localhost:5000/${client.quotationData?.quotationFile}`, '_blank')}
                    >
                      View File
                    </Button>
                  ) : '-'}
                </TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                  {client.quotationData && (
                    <Button 
                      size="small" 
                      variant={client.quotationData.approvalStatus === 'approved' ? 'contained' : 'outlined'} 
                      color={client.quotationData.approvalStatus === 'approved' ? 'success' : 'error'} 
                      onClick={() => handleCaseToggle(client._id, client.quotationData!.approvalStatus)}
                      disabled={loading}
                    >
                      {client.quotationData.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                    </Button>
                  )}
                </TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClient(client._id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {tab === 'contract' && (
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Client Name</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Type</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Start Date</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>End Date</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Payment Terms</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Status</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Contract File</TableCell>
              <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contractClients.map((client) => (
              <TableRow key={client._id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.name}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.type}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.contractData?.startDate ? new Date(client.contractData.startDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.contractData?.endDate ? new Date(client.contractData.endDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.contractData?.paymentTerms || '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>{client.contractData?.status || '-'}</TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                  {client.contractData?.contractFileName ? (
                    <Button size="small" variant="outlined" onClick={() => window.open(`http://localhost:5000/${client.contractData?.contractFile}`, '_blank')}>
                      View Contract
                    </Button>
                  ) : '-'}
                </TableCell>
                <TableCell sx={{ minHeight: '60px', verticalAlign: 'middle' }}>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClient(client._id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {/* Quotation-Based Client Modal */}
      <Dialog 
        open={openQuotationModal} 
        onClose={handleCloseQuotationModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            minHeight: '80vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ flexShrink: 0 }}>Add Quotation-Based Client</DialogTitle>
        <DialogContent sx={{ 
          flex: 1,
          overflowY: 'auto',
          padding: 3,
          '& .MuiTextField-root': {
            marginBottom: 2
          }
        }}>
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField 
              label="Client Name" 
              name="clientName" 
              value={form.clientName} 
              onChange={handleFormChange} 
              fullWidth 
              required 
              sx={{ 
                '& .MuiInputBase-root': {
                  minHeight: '56px'
                }
              }}
            />
            <TextField 
              label="RFQ Date" 
              name="rfqDate" 
              type="date" 
              value={form.rfqDate} 
              onChange={handleFormChange} 
              InputLabelProps={{ shrink: true }} 
              sx={{ 
                width: '300px',
                '& .MuiInputBase-root': {
                  minHeight: '56px'
                }
              }}
              required 
            />
            <Box>
              <input
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                style={{ display: 'none' }}
                id="quotation-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="quotation-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                >
                  Upload Quotation File (PDF, DOC, DOCX, XLS, XLSX)
                </Button>
              </label>
              {form.quotationFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  Selected: {form.quotationFile.name}
                </Typography>
              )}
            </Box>
          </Box>
          <Typography variant="subtitle1" mb={2} sx={{ fontWeight: 'bold' }}>Quotation Lines</Typography>
          {form.lines.map((l, i) => (
            <Box key={i} display="flex" gap={1} alignItems="flex-start" mb={2} sx={{ flexWrap: 'wrap' }}>
              <TextField 
                label="Description" 
                value={l.description} 
                size="small" 
                disabled 
                sx={{ minWidth: '200px', flex: 1 }}
              />
              <TextField 
                label="Unit Price" 
                value={l.unitPrice} 
                size="small" 
                disabled 
                sx={{ minWidth: '120px' }}
              />
              <TextField 
                label="Worktime" 
                value={l.worktime} 
                size="small" 
                disabled 
                sx={{ minWidth: '120px' }}
              />
              <TextField 
                label="Quantity" 
                value={l.quantity} 
                size="small" 
                disabled 
                sx={{ minWidth: '100px' }}
              />
              <TextField 
                label="Total" 
                value={l.total} 
                size="small" 
                disabled 
                sx={{ minWidth: '120px' }}
              />
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => handleRemoveLine(i)}
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Box display="flex" gap={1} alignItems="flex-start" mb={3} sx={{ flexWrap: 'wrap' }}>
            <TextField 
              label="Description" 
              name="description" 
              value={line.description} 
              onChange={handleLineChange} 
              size="small" 
              sx={{ minWidth: '200px', flex: 1 }}
            />
            <TextField 
              label="Unit Price" 
              name="unitPrice" 
              type="number"
              value={line.unitPrice} 
              onChange={handleLineChange} 
              size="small" 
              sx={{ minWidth: '120px' }}
            />
            <TextField 
              label="Worktime" 
              name="worktime" 
              value={line.worktime} 
              onChange={handleLineChange} 
              size="small" 
              sx={{ minWidth: '120px' }}
            />
            <TextField 
              label="Quantity" 
              name="quantity" 
              type="number"
              value={line.quantity} 
              onChange={handleLineChange} 
              size="small" 
              sx={{ minWidth: '100px' }}
            />
            <TextField 
              label="Total" 
              value={line.unitPrice * line.quantity} 
              size="small" 
              disabled 
              sx={{ minWidth: '120px' }}
            />
            <Button 
              onClick={handleAddLine} 
              variant="outlined" 
              size="small" 
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
            >
              Add
            </Button>
          </Box>
          <Box display="flex" gap={2} mb={3} sx={{ flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: '200px', flex: 1 }}>
              <InputLabel>Payment Terms</InputLabel>
              <Select 
                name="paymentTerms" 
                value={form.paymentTerms} 
                label="Payment Terms" 
                onChange={handleSelectChange} 
                required
                sx={{ minHeight: '56px' }}
              >
                {paymentTermsOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: '200px', flex: 1 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select 
                name="paymentMethod" 
                value={form.paymentMethod} 
                label="Payment Method" 
                onChange={handleSelectChange} 
                required
                sx={{ minHeight: '56px' }}
              >
                {paymentMethodOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: '200px', flex: 1 }}>
              <InputLabel>Quotation Case</InputLabel>
              <Select 
                name="quotationCase" 
                value={form.quotationCase} 
                label="Quotation Case" 
                onChange={handleSelectChange} 
                required
                sx={{ minHeight: '56px' }}
              >
                {quotationCaseOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ flexShrink: 0, padding: 3, gap: 2 }}>
          <Button onClick={handleCloseQuotationModal} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmitQuotation} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Contract-Based Client Modal */}
      <Dialog open={openContractModal} onClose={handleCloseContractModal} maxWidth="md" fullWidth>
        <DialogTitle>Add Contract-Based Client</DialogTitle>
        <DialogContent sx={{ minHeight: '500px', overflowY: 'auto' }}>
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField label="Client Name" name="clientName" value={contractForm.clientName} onChange={handleContractFormChange} fullWidth required />
            <TextField label="Contract Start Date" name="startDate" type="date" value={contractForm.startDate} onChange={handleContractFormChange} InputLabelProps={{ shrink: true }} required sx={{ width: '300px' }} />
            <TextField label="Contract End Date" name="endDate" type="date" value={contractForm.endDate} onChange={handleContractFormChange} InputLabelProps={{ shrink: true }} required sx={{ width: '300px' }} />
            <FormControl sx={{ minWidth: '200px' }} required>
              <InputLabel>Payment Terms</InputLabel>
              <Select name="paymentTerms" value={contractForm.paymentTerms} label="Payment Terms" onChange={handleContractSelectChange} required>
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="60">60</MenuItem>
                <MenuItem value="90">90</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: '200px' }} required>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={contractForm.status} label="Status" onChange={handleContractSelectChange} required>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <input accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} id="contract-file-upload" type="file" onChange={handleContractFileChange} />
              <label htmlFor="contract-file-upload">
                <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
                  Upload Contract File (PDF, DOC, DOCX, XLS, XLSX)
                </Button>
              </label>
              {contractForm.contractFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  Selected: {contractForm.contractFile.name}
                </Typography>
              )}
            </Box>
          </Box>
          <Typography variant="subtitle1" mb={2} sx={{ fontWeight: 'bold' }}>Price List</Typography>
          {contractForm.priceList.map((item, i) => (
            <Box key={i} display="flex" gap={1} alignItems="flex-start" mb={2} sx={{ flexWrap: 'wrap' }}>
              <TextField label="Description" value={item.description} size="small" disabled sx={{ minWidth: '200px', flex: 1 }} />
              <TextField label="Unit Price" value={item.unitPrice} size="small" disabled sx={{ minWidth: '120px' }} />
              <TextField label="Overtime" value={item.overtime} size="small" disabled sx={{ minWidth: '120px' }} />
              <FormControl sx={{ minWidth: '120px' }} size="small" disabled>
                <InputLabel>Rent Type</InputLabel>
                <Select value={item.rentType} label="Rent Type">
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="call_out">Call Out</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: '120px' }} size="small" disabled>
                <InputLabel>Work Hrs</InputLabel>
                <Select value={item.workHours} label="Work Hrs">
                  <MenuItem value="8Hrs">8Hrs</MenuItem>
                  <MenuItem value="12Hrs">12Hrs</MenuItem>
                  <MenuItem value="24Hrs">24Hrs</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: '120px' }} size="small" disabled>
                <InputLabel>Drivers/Operators</InputLabel>
                <Select value={item.driversOperators} label="Drivers/Operators">
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                </Select>
              </FormControl>
              <IconButton size="small" color="error" onClick={() => handleRemovePriceItem(i)} sx={{ mt: 1 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Box display="flex" gap={1} alignItems="flex-start" mb={3} sx={{ flexWrap: 'wrap' }}>
            <TextField label="Description" name="description" value={priceItem.description} onChange={handlePriceItemChange} size="small" sx={{ minWidth: '200px', flex: 1 }} />
            <TextField label="Unit Price" name="unitPrice" value={priceItem.unitPrice} onChange={handlePriceItemChange} size="small" sx={{ minWidth: '120px' }} type="number" />
            <TextField label="Overtime" name="overtime" value={priceItem.overtime} onChange={handlePriceItemChange} size="small" sx={{ minWidth: '120px' }} type="number" />
            <FormControl sx={{ minWidth: '120px' }} size="small">
              <InputLabel>Rent Type</InputLabel>
              <Select name="rentType" value={priceItem.rentType} label="Rent Type" onChange={handlePriceItemSelectChange}>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="call_out">Call Out</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: '120px' }} size="small">
              <InputLabel>Work Hrs</InputLabel>
              <Select name="workHours" value={priceItem.workHours} label="Work Hrs" onChange={handlePriceItemSelectChange}>
                <MenuItem value="8Hrs">8Hrs</MenuItem>
                <MenuItem value="12Hrs">12Hrs</MenuItem>
                <MenuItem value="24Hrs">24Hrs</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: '120px' }} size="small">
              <InputLabel>Drivers/Operators</InputLabel>
              <Select name="driversOperators" value={priceItem.driversOperators} label="Drivers/Operators" onChange={handlePriceItemSelectChange}>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
            </FormControl>
            <Button onClick={handleAddPriceItem} variant="outlined" size="small" startIcon={<AddIcon />} sx={{ mt: 1 }}>
              Add Price List
            </Button>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContractModal}>Cancel</Button>
          <Button onClick={handleSubmitContract} variant="contained" color="primary">Add Client</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsPage; 