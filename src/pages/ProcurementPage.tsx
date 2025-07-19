import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Autocomplete, SelectChangeEvent, Tabs, Tab
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import api from '../apiBase';

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const PROCUREMENT_TABS = [
  'Purchase Requests',
  'Vendors',
  'Purchase Orders',
  'Quotations',
  'Goods Receipts',
  'Invoices',
  'Dashboard',
];

const ProcurementPage: React.FC = () => {
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemDescription: '',
    quantity: '',
    priority: 'medium',
    department: '',
    attachments: [] as File[],
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  // Vendor state
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    tradeLicense: undefined as File | undefined,
  });
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [vendorDialog, setVendorDialog] = useState<{ open: boolean; vendor: any }>({ open: false, vendor: null });

  // PO state
  const [pos, setPOs] = useState<any[]>([]);
  const [poForm, setPOForm] = useState({
    purchaseRequest: '',
    vendor: '',
    items: [{ description: '', quantity: '', price: '' }],
    deliveryTerms: '',
    paymentTerms: '',
  });
  const [poSubmitting, setPOSubmitting] = useState(false);

  // Quotation state
  const [quotations, setQuotations] = useState<any[]>([]);
  const [quotationForm, setQuotationForm] = useState<{
    purchaseRequest: string;
    vendors: any[];
    responses: any[];
    selectedVendor: any;
    justification: string;
  }>({
    purchaseRequest: '',
    vendors: [],
    responses: [],
    selectedVendor: '',
    justification: '',
  });
  const [quotationSubmitting, setQuotationSubmitting] = useState(false);
  const [quoteDialog, setQuoteDialog] = useState<{ open: boolean; quotation: any }>({ open: false, quotation: null });

  // Goods Receipt (GRN) state
  const [grns, setGRNs] = useState<any[]>([]);
  const [grnForm, setGRNForm] = useState({
    purchaseOrder: '',
    receivedBy: '',
    receivedDate: '',
    items: [{ description: '', quantity: '', damaged: '', delayNotes: '' }],
    documents: [] as File[],
    status: 'received',
  });
  const [grnSubmitting, setGRNSubmitting] = useState(false);
  const [grnDialog, setGRNDialog] = useState<{ open: boolean; grn: any }>({ open: false, grn: null });

  // Procurement Invoice state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceForm, setInvoiceForm] = useState({
    purchaseOrder: '',
    invoiceFile: undefined as File | undefined,
    amount: '',
    status: 'pending',
    paymentDate: '',
    matchedGRN: '',
    serial: '',
  });
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; invoice: any }>({ open: false, invoice: null });

  // Low Stock Alerts state
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  // Fetch PRs
  const fetchPRs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchase-requests');
      setPrs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to fetch PRs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPRs(); }, []);

  // Fetch Vendors
  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to fetch vendors', severity: 'error' });
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  // Fetch POs
  const fetchPOs = async () => {
    try {
      const res = await api.get('/purchase-orders');
      setPOs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to fetch POs', severity: 'error' });
    }
  };

  useEffect(() => { fetchPOs(); }, []);

  // Fetch Quotations
  const fetchQuotations = async () => {
    try {
      const res = await api.get('/quotations');
      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to fetch quotations', severity: 'error' });
    }
  };

  useEffect(() => { fetchQuotations(); }, []);

  // Fetch GRNs
  const fetchGRNs = async () => {
    try {
      const res = await api.get('/goods-receipts');
      const grnData = Array.isArray(res.data) ? res.data : [];
      console.log('Fetched GRNs:', grnData); // Debug log
      setGRNs(grnData);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to fetch GRNs', severity: 'error' });
    }
  };
  useEffect(() => { fetchGRNs(); }, []);

  // Fetch Invoices
  const fetchInvoices = async () => {
    try {
      const res = await api.get('/procurement-invoices');
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to fetch invoices', severity: 'error' });
    }
  };
  useEffect(() => { fetchInvoices(); }, []);

  // Fetch low stock alerts
  const fetchLowStockAlerts = async () => {
    try {
      const res = await api.get('/low-stock-alerts');
      setLowStockAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // Optionally show a snackbar
    }
  };
  useEffect(() => { fetchLowStockAlerts(); }, []);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value, files } = e.target;
    if (name === 'attachments') {
      setForm((f) => ({ ...f, attachments: files ? Array.from(files) : [] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Vendor form change
  const handleVendorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'tradeLicense') {
      setVendorForm((f) => ({ ...f, tradeLicense: files && files[0] }));
    } else {
      setVendorForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Handle PO form changes
  const handlePOFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any, idx?: number) => {
    const { name, value } = e.target;
    if (typeof idx === 'number') {
      setPOForm((f) => ({
        ...f,
        items: f.items.map((item, i) => i === idx ? { ...item, [name]: value } : item),
      }));
    } else {
      setPOForm((f) => ({ ...f, [name]: value }));
    }
  };
  const handleAddPOItem = () => {
    setPOForm((f) => ({ ...f, items: [...f.items, { description: '', quantity: '', price: '' }] }));
  };
  const handleRemovePOItem = (idx: number) => {
    setPOForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  // Add this handler for Select fields
  const handlePOSelectChange = (e: any) => {
    const { name, value } = e.target;
    setPOForm((f) => ({ ...f, [name]: value }));
  };

  // Quotation form change
  const handleQuotationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuotationForm((f) => ({ ...f, [name]: value }));
  };
  const handleQuotationVendorsChange = (event: any, value: any[]) => {
    setQuotationForm((f) => ({ ...f, vendors: value, responses: value.map(v => ({ vendor: v._id, quoteFile: '', price: '', notes: '', status: 'pending' })) }));
  };
  const handleQuoteResponseChange = (idx: number, field: string, value: any) => {
    setQuotationForm((f) => ({
      ...f,
      responses: f.responses.map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }));
  };

  // Update the handler for Select fields in Quotation form
  const handleQuotationSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setQuotationForm((f) => ({ ...f, [name]: value }));
  };

  // GRN form change
  const handleGRNFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any, idx?: number) => {
    const { name, value, files } = e.target;
    if (name === 'documents') {
      setGRNForm((f) => ({ ...f, documents: files ? Array.from(files) : [] }));
    } else if (typeof idx === 'number') {
      setGRNForm((f) => ({
        ...f,
        items: f.items.map((item, i) => i === idx ? { ...item, [name]: value } : item),
      }));
    } else {
      setGRNForm((f) => ({ ...f, [name]: value }));
    }
  };
  const handleAddGRNItem = () => {
    setGRNForm((f) => ({ ...f, items: [...f.items, { description: '', quantity: '', damaged: '', delayNotes: '' }] }));
  };
  const handleRemoveGRNItem = (idx: number) => {
    setGRNForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  // Add this handler for Select fields in GRN form
  const handleGRNSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setGRNForm((f) => ({ ...f, [name]: value }));
  };

  // Invoice form change
  const handleInvoiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value, files } = e.target;
    if (name === 'invoiceFile') {
      setInvoiceForm((f) => ({ ...f, invoiceFile: files && files[0] }));
    } else {
      setInvoiceForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Add this handler for Select fields in Invoice form
  const handleInvoiceSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setInvoiceForm((f) => ({ ...f, [name]: value }));
  };

  // Submit new PR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Handle file uploads (if any)
      let attachments: string[] = [];
      if (form.attachments.length > 0) {
        const formData = new FormData();
        form.attachments.forEach((file) => formData.append('file', file));
        // You need a backend endpoint for file upload, here we skip actual upload for demo
        // attachments = await uploadFiles(formData);
        attachments = form.attachments.map((f) => f.name); // Placeholder
      }
      const res = await api.post('/purchase-requests', {
        ...form,
        quantity: Number(form.quantity),
        attachments,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 201) throw new Error('Failed to create PR');
      setSnackbar({ open: true, message: 'Purchase Request created', severity: 'success' });
      setForm({ itemDescription: '', quantity: '', priority: 'medium', department: '', attachments: [] });
      fetchPRs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create PR', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Vendor submit
  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorSubmitting(true);
    try {
      // File upload placeholder (not implemented)
      let tradeLicense = '';
      if (vendorForm.tradeLicense) {
        // You need a backend endpoint for file upload
        tradeLicense = vendorForm.tradeLicense.name;
      }
      const res = await api.post('/vendors', {
        name: vendorForm.name,
        phone: vendorForm.phone,
        email: vendorForm.email,
        address: vendorForm.address,
        tradeLicense,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 201) throw new Error('Failed to create vendor');
      setSnackbar({ open: true, message: 'Vendor created', severity: 'success' });
      setVendorForm({ name: '', phone: '', email: '', address: '', tradeLicense: undefined });
      fetchVendors();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create vendor', severity: 'error' });
    } finally {
      setVendorSubmitting(false);
    }
  };

  // Submit new PO
  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPOSubmitting(true);
    try {
      const items = poForm.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));
      const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);
      const res = await api.post('/purchase-orders', {
        purchaseRequest: poForm.purchaseRequest,
        vendor: poForm.vendor,
        items,
        totalAmount,
        deliveryTerms: poForm.deliveryTerms,
        paymentTerms: poForm.paymentTerms,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 201) throw new Error('Failed to create PO');
      setSnackbar({ open: true, message: 'Purchase Order created', severity: 'success' });
      setPOForm({ purchaseRequest: '', vendor: '', items: [{ description: '', quantity: '', price: '' }], deliveryTerms: '', paymentTerms: '' });
      fetchPOs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create PO', severity: 'error' });
    } finally {
      setPOSubmitting(false);
    }
  };

  // Submit new Quotation
  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quotationForm.vendors.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one vendor.', severity: 'error' });
      return;
    }
    setQuotationSubmitting(true);
    try {
      const responses = quotationForm.responses.map((r) => ({
        vendor: r.vendor,
        quoteFile: r.quoteFile || 'file.pdf', // Placeholder
        price: Number(r.price),
        notes: r.notes,
        status: 'submitted',
      }));
      // Required fields for backend
      const today = new Date();
      const quotationDate = today.toISOString();
      const validUntil = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const clientName = quotationForm.vendors[0]?.name || 'N/A';
      const payload: any = {
        quotationDate,
        validUntil,
        clientName,
        purchaseRequest: quotationForm.purchaseRequest,
        vendors: quotationForm.vendors.map((v) => v._id),
        responses,
        justification: quotationForm.justification,
      };
      if (
        quotationForm.selectedVendor &&
        typeof quotationForm.selectedVendor === 'object' &&
        '_id' in quotationForm.selectedVendor
      ) {
        payload.selectedVendor = quotationForm.selectedVendor._id;
      }
      const res = await api.post('/quotations', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 201) throw new Error('Failed to create quotation');
      setSnackbar({ open: true, message: 'Quotation created', severity: 'success' });
      setQuotationForm({ purchaseRequest: '', vendors: [], responses: [], selectedVendor: '', justification: '' });
      fetchQuotations();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create quotation', severity: 'error' });
    } finally {
      setQuotationSubmitting(false);
    }
  };

  // Submit new GRN
  const handleGRNSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation for required fields
    if (!grnForm.purchaseOrder) {
      setSnackbar({ open: true, message: 'Purchase Order is required.', severity: 'error' });
      return;
    }
    if (!grnForm.receivedDate) {
      setSnackbar({ open: true, message: 'Received Date is required.', severity: 'error' });
      return;
    }
    if (!grnForm.items.length || grnForm.items.some(item => !item.description || !item.quantity)) {
      setSnackbar({ open: true, message: 'All items must have a description and quantity.', severity: 'error' });
      return;
    }

    setGRNSubmitting(true);
    try {
      // File upload placeholder
      let documents: string[] = [];
      if (grnForm.documents.length > 0) {
        documents = grnForm.documents.map((f) => f.name);
      }
      const items = grnForm.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        damaged: item.damaged ? Number(item.damaged) : undefined,
        delayNotes: item.delayNotes,
      }));
      const payload: any = {
        purchaseOrder: grnForm.purchaseOrder,
        receivedDate: grnForm.receivedDate,
        items,
        documents,
        status: grnForm.status,
      };
      // Only send receivedBy if it looks like a valid ObjectId (24 hex chars)
      if (grnForm.receivedBy && /^[a-f\d]{24}$/i.test(grnForm.receivedBy)) {
        payload.receivedBy = grnForm.receivedBy;
      }
      const res = await api.post('/goods-receipts', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 201) throw new Error('Failed to create GRN');
      setSnackbar({ open: true, message: 'Goods Receipt created', severity: 'success' });
      setGRNForm({ purchaseOrder: '', receivedBy: '', receivedDate: '', items: [{ description: '', quantity: '', damaged: '', delayNotes: '' }], documents: [], status: 'received' });
      fetchGRNs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create GRN', severity: 'error' });
    } finally {
      setGRNSubmitting(false);
    }
  };

  // Submit new Invoice
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvoiceSubmitting(true);
    try {
      const formData: any = {
        purchaseOrder: invoiceForm.purchaseOrder,
        amount: invoiceForm.amount,
        status: invoiceForm.status,
        paymentDate: invoiceForm.paymentDate,
        matchedGRN: invoiceForm.matchedGRN,
        serial: invoiceForm.serial,
      };
      if (invoiceForm.invoiceFile) {
        formData.invoiceFile = invoiceForm.invoiceFile;
      }
      const res = await api.post('/procurement-invoices', formData);
      if (res.status !== 201) throw new Error('Failed to create invoice');
      setSnackbar({ open: true, message: 'Procurement Invoice created', severity: 'success' });
      fetchInvoices();
      setInvoiceForm({ purchaseOrder: '', invoiceFile: undefined, amount: '', status: 'pending', paymentDate: '', matchedGRN: '', serial: '' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create invoice', severity: 'error' });
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  // Approve/Send/Reject PR
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await api.put(`/purchase-requests/${id}`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 200) {
        const errorData: any = res.data;
        setSnackbar({ open: true, message: errorData?.message || 'Failed to update status', severity: 'error' });
        return;
      }
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
      fetchPRs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  // Vendor status change
  const handleVendorStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/vendors/${id}`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 200) throw new Error('Failed to update vendor');
      setSnackbar({ open: true, message: 'Vendor status updated', severity: 'success' });
      fetchVendors();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update vendor', severity: 'error' });
    }
  };

  // Vendor registration status change
  const handleVendorRegStatus = async (id: string, registrationStatus: string) => {
    try {
      const res = await api.put(`/vendors/${id}`, { registrationStatus }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 200) throw new Error('Failed to update vendor');
      setSnackbar({ open: true, message: 'Vendor registration status updated', severity: 'success' });
      fetchVendors();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update vendor', severity: 'error' });
    }
  };

  // PO status change
  const handlePOStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/purchase-orders/${id}`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 200) throw new Error('Failed to update PO');
      setSnackbar({ open: true, message: 'PO status updated', severity: 'success' });
      fetchPOs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update PO', severity: 'error' });
    }
  };

  // Quotation status/actions
  const handleQuotationAction = async (id: string, action: string, selectedVendor?: string, justification?: string) => {
    try {
      const res = await api.put(`/quotations/${id}`, {
        approvalStatus: action,
        selectedVendor,
        justification,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 200) throw new Error('Failed to update quotation');
      setSnackbar({ open: true, message: 'Quotation updated', severity: 'success' });
      fetchQuotations();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update quotation', severity: 'error' });
    }
  };

  // Invoice status change
  const handleInvoiceStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/procurement-invoices/${id}`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status !== 200) throw new Error('Failed to update invoice');
      setSnackbar({ open: true, message: 'Invoice status updated', severity: 'success' });
      fetchInvoices();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update invoice', severity: 'error' });
    }
  };

  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Procurement</Typography>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, newTab) => setTab(newTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: '#00CF95', // Tablist background
            borderRadius: 2,
            boxShadow: 1,
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 500,
              borderRadius: 2,
              mx: 0.5,
              color: 'white', // Inactive tab text
              transition: 'background 0.2s, color 0.2s',
            },
            '& .Mui-selected': {
              backgroundColor: 'white',
              color: '#00CF95',
              fontWeight: 700,
              boxShadow: 2,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 0,
            },
          }}
        >
          {PROCUREMENT_TABS.map((label, idx) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Paper>
      <Box>
        {tab === 0 && (
          <Box>
            <Typography variant="h4" gutterBottom>Procurement Requests</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Create New Purchase Request</Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField label="Item Description" name="itemDescription" value={form.itemDescription} onChange={handleFormChange} required fullWidth />
                <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleFormChange} required sx={{ width: 120 }} />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority" name="priority" value={form.priority} onChange={handleFormChange} required>
                    {priorities.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Department" name="department" value={form.department} onChange={handleFormChange} required sx={{ width: 180 }} />
                <Button variant="contained" component="label">
                  Attach Files
                  <input type="file" name="attachments" multiple hidden onChange={handleFormChange} />
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ minWidth: 120 }}>
                  {submitting ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Box>
            </Paper>
            <Typography variant="h6" gutterBottom>All Purchase Requests</Typography>
            {loading ? <CircularProgress /> : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Requester</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prs.map((pr) => (
                      <TableRow key={pr._id}>
                        <TableCell>{pr._id.slice(-6)}</TableCell>
                        <TableCell>{pr.itemDescription}</TableCell>
                        <TableCell>{pr.quantity}</TableCell>
                        <TableCell>{pr.priority}</TableCell>
                        <TableCell>{pr.department}</TableCell>
                        <TableCell>{pr.status}</TableCell>
                        <TableCell>{pr.requester?.email || pr.requester}</TableCell>
                        <TableCell>
                          {pr.status === 'pending' && (
                            <>
                              <Button size="small" color="success" onClick={() => handleStatusChange(pr._id, 'approved')}>Approve</Button>
                              <Button size="small" color="error" onClick={() => handleStatusChange(pr._id, 'rejected')}>Reject</Button>
                            </>
                          )}
                          {pr.status === 'approved' && (
                            <Button size="small" color="primary" onClick={() => handleStatusChange(pr._id, 'sent_to_procurement')}>Send to Procurement</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Vendor Management</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Add New Vendor</Typography>
              <Box component="form" onSubmit={handleVendorSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField label="Name" name="name" value={vendorForm.name} onChange={handleVendorFormChange} required sx={{ width: 200 }} />
                <TextField label="Phone" name="phone" value={vendorForm.phone} onChange={handleVendorFormChange} required sx={{ width: 160 }} />
                <TextField label="Email" name="email" value={vendorForm.email} onChange={handleVendorFormChange} required sx={{ width: 200 }} />
                <TextField label="Address" name="address" value={vendorForm.address} onChange={handleVendorFormChange} required sx={{ width: 240 }} />
                <Button variant="contained" component="label">
                  Trade License
                  <input type="file" name="tradeLicense" hidden onChange={handleVendorFormChange} />
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={vendorSubmitting} sx={{ minWidth: 120 }}>
                  {vendorSubmitting ? <CircularProgress size={24} /> : 'Add Vendor'}
                </Button>
              </Box>
            </Paper>
            <Typography variant="h6" gutterBottom>All Vendors</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registration</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>{v._id.slice(-6)}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.phone || v.contactInfo?.phone || '-'}</TableCell>
                      <TableCell>{v.email || v.contactInfo?.email || '-'}</TableCell>
                      <TableCell>{v.address || v.contactInfo?.address || '-'}</TableCell>
                      <TableCell>{v.status}</TableCell>
                      <TableCell>{v.registrationStatus}</TableCell>
                      <TableCell>{v.rating ?? '-'}</TableCell>
                      <TableCell>
                        <Button size="small" color="success" onClick={() => handleVendorStatus(v._id, 'active')}>Activate</Button>
                        <Button size="small" color="warning" onClick={() => handleVendorStatus(v._id, 'inactive')}>Deactivate</Button>
                        <Button size="small" color="error" onClick={() => handleVendorStatus(v._id, 'blacklisted')}>Blacklist</Button>
                        <Button size="small" color="primary" onClick={() => handleVendorRegStatus(v._id, 'approved')}>Approve</Button>
                        <Button size="small" color="secondary" onClick={() => handleVendorRegStatus(v._id, 'rejected')}>Reject</Button>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => setVendorDialog({ open: true, vendor: v })}><InfoIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Vendor Approval History Dialog */}
            <Dialog open={vendorDialog.open} onClose={() => setVendorDialog({ open: false, vendor: null })} maxWidth="sm" fullWidth>
              <DialogTitle>Vendor Approval History</DialogTitle>
              <DialogContent>
                {vendorDialog.vendor && vendorDialog.vendor.approvalHistory && vendorDialog.vendor.approvalHistory.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Approver</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Comment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendorDialog.vendor.approvalHistory.map((h: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{h.approver?.email || h.approver?.toString() || '-'}</TableCell>
                          <TableCell>{h.action}</TableCell>
                          <TableCell>{new Date(h.date).toLocaleString()}</TableCell>
                          <TableCell>{h.comment || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No approval history available.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setVendorDialog({ open: false, vendor: null })}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Purchase Orders</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Create New Purchase Order</Typography>
              <Box component="form" onSubmit={handlePOSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Purchase Request</InputLabel>
                  <Select label="Purchase Request" name="purchaseRequest" value={poForm.purchaseRequest} onChange={handlePOSelectChange} required>
                    {prs.map((pr) => (
                      <MenuItem key={pr._id} value={pr._id}>{pr.itemDescription} ({pr._id.slice(-6)})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Vendor</InputLabel>
                  <Select label="Vendor" name="vendor" value={poForm.vendor} onChange={handlePOSelectChange} required>
                    {vendors.map((v) => (
                      <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="subtitle1">Items</Typography>
                {poForm.items.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField label="Description" name="description" value={item.description} onChange={(e) => handlePOFormChange(e, idx)} required sx={{ width: 200 }} />
                    <TextField label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handlePOFormChange(e, idx)} required sx={{ width: 100 }} />
                    <TextField label="Price" name="price" type="number" value={item.price} onChange={(e) => handlePOFormChange(e, idx)} required sx={{ width: 120 }} />
                    <IconButton onClick={() => handleRemovePOItem(idx)} disabled={poForm.items.length === 1}><RemoveIcon /></IconButton>
                    {idx === poForm.items.length - 1 && <IconButton onClick={handleAddPOItem}><AddIcon /></IconButton>}
                  </Box>
                ))}
                <TextField label="Delivery Terms" name="deliveryTerms" value={poForm.deliveryTerms} onChange={handlePOFormChange} sx={{ width: 300 }} />
                <TextField label="Payment Terms" name="paymentTerms" value={poForm.paymentTerms} onChange={handlePOFormChange} sx={{ width: 300 }} />
                <Button type="submit" variant="contained" color="primary" disabled={poSubmitting} sx={{ minWidth: 120, mt: 2 }}>
                  {poSubmitting ? <CircularProgress size={24} /> : 'Create PO'}
                </Button>
              </Box>
            </Paper>
            <Typography variant="h6" gutterBottom>All Purchase Orders</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pos.map((po) => (
                    <TableRow key={po._id}>
                      <TableCell>{po.poNumber}</TableCell>
                      <TableCell>{po.vendor?.name || po.vendor}</TableCell>
                      <TableCell>{po.totalAmount}</TableCell>
                      <TableCell>{po.status}</TableCell>
                      <TableCell>
                        {po.status === 'open' && <Button size="small" color="primary" onClick={() => handlePOStatus(po._id, 'ordered')}>Mark Ordered</Button>}
                        {po.status === 'ordered' && <Button size="small" color="success" onClick={() => handlePOStatus(po._id, 'delivered')}>Mark Delivered</Button>}
                        {po.status !== 'cancelled' && <Button size="small" color="error" onClick={() => handlePOStatus(po._id, 'cancelled')}>Cancel</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>Quotation Requests (RFQ/RFP)</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Create New Quotation</Typography>
              <Box component="form" onSubmit={handleQuotationSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Purchase Request</InputLabel>
                  <Select label="Purchase Request" name="purchaseRequest" value={quotationForm.purchaseRequest} onChange={handleQuotationSelectChange} required>
                    {prs.map((pr) => (
                      <MenuItem key={pr._id} value={pr._id}>{pr.itemDescription} ({pr._id.slice(-6)})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Autocomplete
                  multiple
                  options={vendors}
                  getOptionLabel={(option) => option.name}
                  value={quotationForm.vendors}
                  onChange={handleQuotationVendorsChange}
                  renderInput={(params) => <TextField {...params} label="Vendors" />}
                />
                <Typography variant="subtitle1">Quote Responses</Typography>
                {quotationForm.responses.map((r, idx) => (
                  <Box key={r.vendor} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField label="Price" type="number" value={r.price} onChange={e => handleQuoteResponseChange(idx, 'price', e.target.value)} required sx={{ width: 120 }} />
                    <TextField label="Notes" value={r.notes} onChange={e => handleQuoteResponseChange(idx, 'notes', e.target.value)} sx={{ width: 200 }} />
                    <Button variant="contained" component="label">Upload Quote<input type="file" hidden onChange={e => handleQuoteResponseChange(idx, 'quoteFile', e.target.files?.[0]?.name || '')} /></Button>
                    <span>{r.quoteFile}</span>
                  </Box>
                ))}
                <TextField label="Justification (if selecting vendor)" name="justification" value={quotationForm.justification} onChange={handleQuotationFormChange} sx={{ width: 400 }} />
                <Button type="submit" variant="contained" color="primary" disabled={quotationSubmitting} sx={{ minWidth: 120, mt: 2 }}>
                  {quotationSubmitting ? <CircularProgress size={24} /> : 'Create Quotation'}
                </Button>
              </Box>
            </Paper>
            <Typography variant="h6" gutterBottom>All Quotations</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PR</TableCell>
                    <TableCell>Vendors</TableCell>
                    <TableCell>Selected Vendor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>Compare</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotations.map((q) => (
                    <TableRow key={q._id}>
                      <TableCell>{q.purchaseRequest?.itemDescription || q.purchaseRequest}</TableCell>
                      <TableCell>{q.vendors?.map((v: any) => v.name || v).join(', ')}</TableCell>
                      <TableCell>{q.selectedVendor?.name || q.selectedVendor || '-'}</TableCell>
                      <TableCell>{q.approvalStatus}</TableCell>
                      <TableCell>
                        <Button size="small" color="success" onClick={() => handleQuotationAction(q._id, 'approved')}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleQuotationAction(q._id, 'rejected')}>Reject</Button>
                        <Button size="small" color="primary" onClick={() => handleQuotationAction(q._id, 'approved', q.selectedVendor, q.justification)}>Select Vendor</Button>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => setQuoteDialog({ open: true, quotation: q })}><InfoIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Quotation Comparison Dialog */}
            <Dialog open={quoteDialog.open} onClose={() => setQuoteDialog({ open: false, quotation: null })} maxWidth="md" fullWidth>
              <DialogTitle>Quotation Comparison</DialogTitle>
              <DialogContent>
                {quoteDialog.quotation && quoteDialog.quotation.responses && quoteDialog.quotation.responses.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell>Quote File</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quoteDialog.quotation.responses.map((r: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{r.vendor?.name || r.vendor}</TableCell>
                          <TableCell>{r.price}</TableCell>
                          <TableCell>{r.notes}</TableCell>
                          <TableCell>{r.quoteFile}</TableCell>
                          <TableCell>{r.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No quote responses available.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setQuoteDialog({ open: false, quotation: null })}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>Goods Receipt (GRN)</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Create New Goods Receipt</Typography>
              <Box component="form" onSubmit={handleGRNSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Purchase Order</InputLabel>
                  <Select label="Purchase Order" name="purchaseOrder" value={grnForm.purchaseOrder} onChange={handleGRNSelectChange} required>
                    {pos.map((po) => (
                      <MenuItem key={po._id} value={po._id}>{po.poNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Received By (User ID or Email)" name="receivedBy" value={grnForm.receivedBy} onChange={handleGRNFormChange} required sx={{ width: 260 }} />
                <TextField label="Received Date" name="receivedDate" type="date" value={grnForm.receivedDate} onChange={handleGRNFormChange} required sx={{ width: 180 }} InputLabelProps={{ shrink: true }} />
                <Typography variant="subtitle1">Items</Typography>
                {grnForm.items.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField label="Description" name="description" value={item.description} onChange={(e) => handleGRNFormChange(e, idx)} required sx={{ width: 200 }} />
                    <TextField label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handleGRNFormChange(e, idx)} required sx={{ width: 100 }} />
                    <TextField label="Damaged" name="damaged" type="number" value={item.damaged} onChange={(e) => handleGRNFormChange(e, idx)} sx={{ width: 100 }} />
                    <TextField label="Delay Notes" name="delayNotes" value={item.delayNotes} onChange={(e) => handleGRNFormChange(e, idx)} sx={{ width: 200 }} />
                    <IconButton onClick={() => handleRemoveGRNItem(idx)} disabled={grnForm.items.length === 1}><RemoveIcon /></IconButton>
                    {idx === grnForm.items.length - 1 && <IconButton onClick={handleAddGRNItem}><AddIcon /></IconButton>}
                  </Box>
                ))}
                <Button variant="contained" component="label">
                  Upload Delivery Docs
                  <input type="file" name="documents" multiple hidden onChange={handleGRNFormChange} />
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={grnSubmitting} sx={{ minWidth: 120, mt: 2 }}>
                  {grnSubmitting ? <CircularProgress size={24} /> : 'Create GRN'}
                </Button>
              </Box>
            </Paper>
            <Typography variant="h6" gutterBottom>All Goods Receipts</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PO</TableCell>
                    <TableCell>Received By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                                  <TableBody>
                    {grns.map((grn) => (
                      <TableRow key={grn._id}>
                        <TableCell>{grn.purchaseOrder?.poNumber || grn.purchaseOrder}</TableCell>
                        <TableCell>
                          {grn.receivedBy?.email || grn.receivedBy?._id || grn.receivedBy || '-'}
                          {/* Debug info */}
                          {process.env.NODE_ENV === 'development' && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Raw: {JSON.stringify(grn.receivedBy)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{new Date(grn.receivedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{grn.status}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => setGRNDialog({ open: true, grn })}><InfoIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </TableContainer>
            {/* GRN Details Dialog */}
            <Dialog open={grnDialog.open} onClose={() => setGRNDialog({ open: false, grn: null })} maxWidth="md" fullWidth>
              <DialogTitle>Goods Receipt Details</DialogTitle>
              <DialogContent>
                {grnDialog.grn && grnDialog.grn.items && grnDialog.grn.items.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Damaged</TableCell>
                        <TableCell>Delay Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grnDialog.grn.items.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.damaged}</TableCell>
                          <TableCell>{item.delayNotes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No items available.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setGRNDialog({ open: false, grn: null })}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 5 && (
          <Box>
            <Typography variant="h5" gutterBottom>Procurement Invoices & Payment Tracking</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Create New Procurement Invoice</Typography>
              <Box component="form" onSubmit={handleInvoiceSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Purchase Order</InputLabel>
                  <Select label="Purchase Order" name="purchaseOrder" value={invoiceForm.purchaseOrder} onChange={handleInvoiceSelectChange} required>
                    {pos.map((po) => (
                      <MenuItem key={po._id} value={po._id}>{po.poNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" component="label">
                  Upload Invoice File
                  <input type="file" name="invoiceFile" hidden onChange={handleInvoiceFormChange} />
                </Button>
                <TextField label="Amount" name="amount" type="number" value={invoiceForm.amount} onChange={handleInvoiceFormChange} required sx={{ width: 180 }} />
                <TextField label="Serial Number" name="serial" value={invoiceForm.serial} onChange={handleInvoiceFormChange} required sx={{ width: 220 }} />
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" name="status" value={invoiceForm.status} onChange={handleInvoiceSelectChange} required>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Payment Date" name="paymentDate" type="date" value={invoiceForm.paymentDate} onChange={handleInvoiceFormChange} sx={{ width: 180 }} InputLabelProps={{ shrink: true }} />
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Matched GRN</InputLabel>
                  <Select label="Matched GRN" name="matchedGRN" value={invoiceForm.matchedGRN} onChange={handleInvoiceSelectChange}>
                    <MenuItem value="">None</MenuItem>
                    {grns.map((grn) => (
                      <MenuItem key={grn._id} value={grn._id}>{grn.purchaseOrder?.poNumber || grn.purchaseOrder} - {new Date(grn.receivedDate).toLocaleDateString()}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" disabled={invoiceSubmitting} sx={{ minWidth: 120, mt: 2 }}>
                  {invoiceSubmitting ? <CircularProgress size={24} /> : 'Create Invoice'}
                </Button>
              </Box>
            </Paper>
            <Typography variant="h6" gutterBottom>All Procurement Invoices</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PO</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Matched GRN</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv._id}>
                      <TableCell>{inv.purchaseOrder?.poNumber || inv.purchaseOrder}</TableCell>
                      <TableCell>{inv.amount}</TableCell>
                      <TableCell>{inv.status}</TableCell>
                      <TableCell>{inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{inv.matchedGRN ? (inv.matchedGRN.purchaseOrder?.poNumber || inv.matchedGRN.purchaseOrder) : '-'}</TableCell>
                      <TableCell>
                        {inv.status !== 'paid' && <Button size="small" color="success" onClick={() => handleInvoiceStatus(inv._id, 'paid')}>Mark Paid</Button>}
                        {inv.status === 'pending' && <Button size="small" color="primary" onClick={() => handleInvoiceStatus(inv._id, 'approved')}>Approve</Button>}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => setInvoiceDialog({ open: true, invoice: inv })}><InfoIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Invoice Details Dialog */}
            <Dialog open={invoiceDialog.open} onClose={() => setInvoiceDialog({ open: false, invoice: null })} maxWidth="sm" fullWidth>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogContent>
                {invoiceDialog.invoice ? (
                  <Box>
                    <Typography>PO: {invoiceDialog.invoice.purchaseOrder?.poNumber || invoiceDialog.invoice.purchaseOrder}</Typography>
                    <Typography>Amount: {invoiceDialog.invoice.amount}</Typography>
                    <Typography>Status: {invoiceDialog.invoice.status}</Typography>
                    <Typography>Payment Date: {invoiceDialog.invoice.paymentDate ? new Date(invoiceDialog.invoice.paymentDate).toLocaleDateString() : '-'}</Typography>
                    <Typography>Matched GRN: {invoiceDialog.invoice.matchedGRN ? (invoiceDialog.invoice.matchedGRN.purchaseOrder?.poNumber || invoiceDialog.invoice.matchedGRN.purchaseOrder) : '-'}</Typography>
                    <Typography>Invoice File: {invoiceDialog.invoice.invoiceFile}</Typography>
                  </Box>
                ) : (
                  <Typography>No details available.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setInvoiceDialog({ open: false, invoice: null })}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 6 && (
          <Box>
            <Typography variant="h5" gutterBottom>Procurement Dashboard & Reports</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
              <Paper sx={{ p: 2, minWidth: 180 }}>
                <Typography variant="subtitle2">Total PRs</Typography>
                <Typography variant="h6">{prs.length}</Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 180 }}>
                <Typography variant="subtitle2">Total POs</Typography>
                <Typography variant="h6">{pos.length}</Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 180 }}>
                <Typography variant="subtitle2">Total Vendors</Typography>
                <Typography variant="h6">{vendors.length}</Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 180 }}>
                <Typography variant="subtitle2">Total Spend</Typography>
                <Typography variant="h6">{pos.reduce((sum, po) => sum + (po.totalAmount || 0), 0).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 180 }}>
                <Typography variant="subtitle2">Paid Invoices</Typography>
                <Typography variant="h6">{invoices.filter(inv => inv.status === 'paid').length}</Typography>
              </Paper>
            </Box>
            <Typography variant="h6" gutterBottom>Recent Procurement Activity</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    ...prs.map(pr => ({ type: 'PR', date: pr.updatedAt || pr.createdAt, status: pr.status, ref: pr._id })),
                    ...pos.map(po => ({ type: 'PO', date: po.updatedAt || po.createdAt, status: po.status, ref: po.poNumber })),
                    ...quotations.map(q => ({ type: 'Quotation', date: q.updatedAt || q.createdAt, status: q.approvalStatus, ref: q._id })),
                    ...grns.map(grn => ({ type: 'GRN', date: grn.updatedAt || grn.createdAt, status: grn.status, ref: grn._id })),
                    ...invoices.map(inv => ({ type: 'Invoice', date: inv.updatedAt || inv.createdAt, status: inv.status, ref: inv._id })),
                  ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{new Date(row.date).toLocaleString()}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.ref}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, background: '#fffbe6', border: '1px solid #ffe082' }}>
          <Typography variant="h6" color="warning.main" gutterBottom>Low Stock Alerts</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Min Stock</TableCell>
                <TableCell>Triggered At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockAlerts.map((alert) => (
                <TableRow key={alert._id}>
                  <TableCell>{alert.name || alert.item?.name}</TableCell>
                  <TableCell>{alert.quantity}</TableCell>
                  <TableCell>{alert.minStock}</TableCell>
                  <TableCell>{new Date(alert.triggeredAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcurementPage; 