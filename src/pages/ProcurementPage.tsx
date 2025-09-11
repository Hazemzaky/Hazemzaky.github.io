import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Autocomplete, SelectChangeEvent, Tabs, Tab, Chip, Avatar, Card, CardContent, useTheme, alpha, Tooltip, Fab, InputAdornment, Divider
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExportIcon from '@mui/icons-material/GetApp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';
import theme from '../theme';
import CostAnalysisDashboard from '../components/CostAnalysisDashboard';
import useModulePnLSync from '../services/useModulePnLSync';

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const itemStatuses = [
  { value: 'available', label: 'Available' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'backorder', label: 'Backorder' },
];

const vendorCategorizations = [
  'Office Supplies',
  'IT Equipment',
  'Construction Materials',
  'Safety Equipment',
  'Cleaning Supplies',
  'Tools & Equipment',
  'Vehicles & Transportation',
  'Food & Catering',
  'Medical Supplies',
  'Electrical & Electronics',
  'Plumbing & HVAC',
  'Furniture & Fixtures',
  'Security Equipment',
  'Environmental Services',
  'Other'
];

const PROCUREMENT_TABS = [
  'Dashboard',
  'Department Requests',
  'Purchase Requests',
  'Purchase Orders',
  'Quotations',
  'Goods Receipts',
  'Invoices',
  'Vendors',
];

const ProcurementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemDescription: '',
    quantity: '',
    priority: 'medium',
    department: '',
    itemStatus: 'available',
    procurementNotes: '',
    estimatedCost: '',
    attachments: [] as File[],
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  // Vendor state
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
    tradeLicense: '',
    creditForm: '',
    categories: [] as string[],
    registrationStatus: 'pending',
    notes: ''
  });
  const [useCustomCategories, setUseCustomCategories] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
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
      const prData = Array.isArray(res.data) ? res.data : [];
      console.log('Fetched PRs:', prData); // Debug log
      console.log('PRs for dropdowns:', prData.filter(pr => pr.status === 'sent_to_procurement' || pr.status === 'in_progress')); // Debug log
      setPrs(prData);
    } catch (e) {
      console.error('Error fetching PRs:', e); // Debug log
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
      const poData = Array.isArray(res.data) ? res.data : [];
      console.log('Fetched POs:', poData); // Debug log
      console.log('POs for GRN dropdown:', poData.filter(po => po.status === 'open')); // Debug log
      setPOs(poData);
    } catch (e) {
      console.error('Error fetching POs:', e); // Debug log
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
    } else if (name === 'creditForm') {
      setVendorForm((f) => ({ ...f, creditForm: files && files[0] }));
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
  const handleGRNFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>, idx?: number) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'documents' && files) {
      setGRNForm({ ...grnForm, documents: Array.from(files) });
    } else if (idx !== undefined) {
      const updatedItems = [...grnForm.items];
      updatedItems[idx] = { ...updatedItems[idx], [name]: value };
      setGRNForm({ ...grnForm, items: updatedItems });
    } else {
      setGRNForm({ ...grnForm, [name]: value });
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
      const formData = new FormData();
      formData.append('itemDescription', form.itemDescription);
      formData.append('quantity', form.quantity);
      formData.append('priority', form.priority);
      formData.append('department', form.department);
      formData.append('itemStatus', form.itemStatus);
      formData.append('procurementNotes', form.procurementNotes);
      formData.append('estimatedCost', form.estimatedCost);
      form.attachments.forEach(file => formData.append('attachments', file));
      
      await api.post('/purchase-requests', formData);
      setSnackbar({ open: true, message: 'Purchase Request created successfully!', severity: 'success' });
      setForm({ itemDescription: '', quantity: '', priority: 'medium', department: '', itemStatus: 'available', procurementNotes: '', estimatedCost: '', attachments: [] });
      fetchPRs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create Purchase Request', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetInProgress = async (prId: string, notes: string, cost: string, status: string) => {
    try {
      await api.put(`/purchase-requests/${prId}/in-progress`, {
        procurementNotes: notes,
        estimatedCost: cost,
        itemStatus: status
      });
      setSnackbar({ open: true, message: 'Purchase Request set to In Progress!', severity: 'success' });
      fetchPRs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update Purchase Request', severity: 'error' });
    }
  };

  // Vendor submit
  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorSubmitting(true);
    try {
      const vendorData = {
        ...vendorForm,
        categories: vendorForm.categories,
        registrationStatus: vendorForm.registrationStatus,
        notes: vendorForm.notes
      };
      
      await api.post('/procurement/vendors', vendorData);
      setSnackbar({ open: true, message: 'Vendor added successfully', severity: 'success' });
      setVendorForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        contactPerson: '',
        tradeLicense: '',
        creditForm: '',
        categories: [],
        registrationStatus: 'pending',
        notes: ''
      });
      setUseCustomCategories(false);
      setCustomCategoryInput('');
      fetchVendors();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to add vendor', severity: 'error' });
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
      console.log('Updating PR status:', id, 'to', status); // Debug log
      const res = await api.put(`/purchase-requests/${id}`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Status update response:', res.data); // Debug log
      if (res.status !== 200) {
        const errorData = res.data as any;
        setSnackbar({ open: true, message: errorData?.message || 'Failed to update status', severity: 'error' });
        return;
      }
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
      fetchPRs();
    } catch (e) {
      console.error('Error updating status:', e); // Debug log
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

  // Quotation status change
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

  // Handle URL parameter for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (tabIndex >= 0 && tabIndex < PROCUREMENT_TABS.length) {
        setTab(tabIndex);
      }
    }
  }, [searchParams]);

  const muiTheme = useTheme();
  const [fullscreen, setFullscreen] = useState(false);

  // Build procurement cost records for dashboard & PnL sync
  const procurementRecords = React.useMemo(() => (
    [
      // Purchase Requests
      ...prs.map(pr => {
        const estimatedCost = typeof pr.estimatedCost === 'string' ?
          parseFloat(pr.estimatedCost) || 0 :
          (pr.estimatedCost || 0);

        return {
          _id: pr._id,
          amount: estimatedCost,
          date: pr.createdAt ? new Date(pr.createdAt).toISOString() : new Date().toISOString(),
          type: 'purchase_request',
          description: pr.itemDescription || 'Purchase Request',
          isAmortized: pr.priority === 'high' && estimatedCost > 1000,
          amortizationPeriod: pr.priority === 'high' && estimatedCost > 1000 ? 12 : undefined,
          depreciationStart: pr.priority === 'high' && estimatedCost > 1000 ?
            (pr.createdAt ? new Date(pr.createdAt).toISOString() : new Date().toISOString()) : undefined,
          depreciationEnd: pr.priority === 'high' && estimatedCost > 1000 ?
            new Date(new Date(pr.createdAt || new Date()).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
        };
      }),
      // Purchase Orders
      ...pos.map(po => {
        const totalAmount = po.totalAmount || 0;
        const isDelivered = po.status === 'closed';

        return {
          _id: po._id,
          amount: totalAmount,
          date: po.createdAt ? new Date(po.createdAt).toISOString() : new Date().toISOString(),
          type: 'purchase_order',
          description: po.purchaseRequest?.itemDescription || 'Purchase Order',
          isAmortized: isDelivered && totalAmount > 1000,
          amortizationPeriod: isDelivered && totalAmount > 1000 ? 24 : undefined,
          depreciationStart: isDelivered && totalAmount > 1000 ?
            (po.createdAt ? new Date(po.createdAt).toISOString() : new Date().toISOString()) : undefined,
          depreciationEnd: isDelivered && totalAmount > 1000 ?
            new Date(new Date(po.createdAt || new Date()).getTime() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
        };
      }),
      // Procurement Invoices
      ...invoices.map(inv => {
        const amount = typeof inv.amount === 'string' ?
          parseFloat(inv.amount) || 0 :
          (inv.amount || 0);
        const isPaid = inv.status === 'paid';

        return {
          _id: inv._id,
          amount: amount,
          date: inv.paymentDate ? new Date(inv.paymentDate).toISOString() :
                inv.createdAt ? new Date(inv.createdAt).toISOString() :
                new Date().toISOString(),
          type: 'procurement_invoice',
          description: 'Procurement Invoice',
          isAmortized: isPaid && amount > 500,
          amortizationPeriod: isPaid && amount > 500 ? 12 : undefined,
          depreciationStart: isPaid && amount > 500 ?
            (inv.paymentDate ? new Date(inv.paymentDate).toISOString() :
             inv.createdAt ? new Date(inv.createdAt).toISOString() :
             new Date().toISOString()) : undefined,
          depreciationEnd: isPaid && amount > 500 ?
            new Date(new Date(inv.paymentDate || inv.createdAt || new Date()).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
        };
      }),
      // Goods Receipts
      ...grns.map(grn => {
        let totalAmount = 0;
        if (grn.items && Array.isArray(grn.items)) {
          totalAmount = grn.items.reduce((sum: number, item: any) => {
            const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : (item.quantity || 0);
            const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0);
            return sum + (quantity * price);
          }, 0);
        }

        return {
          _id: grn._id,
          amount: totalAmount,
          date: grn.receivedDate ? new Date(grn.receivedDate).toISOString() :
                grn.createdAt ? new Date(grn.createdAt).toISOString() :
                new Date().toISOString(),
          type: 'goods_receipt',
          description: 'Goods Receipt',
          isAmortized: false,
          amortizationPeriod: undefined,
          depreciationStart: undefined,
          depreciationEnd: undefined
        };
      })
    ]
  ), [prs, pos, invoices, grns]);

  // Sync procurement totals to P&L
  useModulePnLSync('procurement', procurementRecords, 'date', 'amount');

  // Render Dashboard Header
  const renderDashboardHeader = () => (
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
              <ShoppingCartIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Procurement Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Comprehensive procurement system for vendor management, purchase orders, and supply chain operations
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={() => {
                  fetchPRs();
                  fetchVendors();
                  fetchPOs();
                  fetchQuotations();
                  fetchGRNs();
                  fetchInvoices();
                }} 
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton 
                onClick={() => setSnackbar({ open: true, message: 'Export functionality coming soon!', severity: 'info' })}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton 
                onClick={() => setFullscreen(!fullscreen)}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Procurement Metrics Cards */}
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
                {prs.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Purchase Requests
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
                {pos.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Purchase Orders
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
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.light }}>
                {vendors.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Vendors
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
                {pos.reduce((sum, po) => sum + (po.totalAmount || 0), 0).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Spend
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
                {invoices.filter(inv => inv.status === 'paid').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Paid Invoices
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
  );

  return (
    <Box sx={{ 
      p: fullscreen ? 1 : 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderDashboardHeader()}
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
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
              {PROCUREMENT_TABS.map((label, idx) => (
                <Tab key={label} label={label} />
              ))}
            </Tabs>
          </Paper>
                </motion.div>
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
            <Box>
              {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
              📊 Procurement Dashboard & Reports
            </Typography>
            
            {/* Enhanced Metrics Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                    {prs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Purchase Requests
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                    {pos.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Purchase Orders
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                    {vendors.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Vendors
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                    {pos.reduce((sum, po) => sum + (po.totalAmount || 0), 0).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spend
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                elevation={0}
                sx={{ 
                  background: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                    {invoices.filter(inv => inv.status === 'paid').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid Invoices
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📈 Recent Procurement Activity
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
                background: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  🕒 Latest Transactions & Activities
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...prs.slice(0, 5).map(pr => ({ type: 'Purchase Request', date: pr.createdAt, status: pr.status, reference: pr._id.slice(-6) })),
                      ...pos.slice(0, 5).map(po => ({ type: 'Purchase Order', date: po.createdAt, status: po.status, reference: po.poNumber || po._id.slice(-6) })),
                      ...quotations.slice(0, 5).map(q => ({ type: 'Quotation', date: q.createdAt, status: q.status, reference: q._id.slice(-6) })),
                      ...grns.slice(0, 5).map(grn => ({ type: 'Goods Receipt', date: grn.receivedDate, status: grn.status, reference: grn._id.slice(-6) })),
                      ...invoices.slice(0, 5).map(inv => ({ type: 'Invoice', date: inv.createdAt, status: inv.status, reference: inv._id.slice(-6) }))
                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((item, idx) => (
                      <TableRow 
                        key={idx}
                        sx={{ 
                          background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{item.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              🏢 Department Requests
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Requests from various departments that need procurement processing
            </Typography>
            
            {/* Enhanced Department Requests Table */}
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
                background: alpha(theme.palette.info.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                  📋 Department Procurement Requests
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Item Status</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requester</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prs.filter(pr => pr.status === 'sent_to_procurement').map((pr, idx) => (
                    <TableRow 
                      key={pr._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{pr._id.slice(-6)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{pr.itemDescription}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{pr.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={pr.priority}
                          size="small"
                          color={
                            pr.priority === 'urgent' ? 'error' :
                            pr.priority === 'high' ? 'warning' :
                            pr.priority === 'medium' ? 'info' : 'success'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{pr.department}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select 
                            value={pr.itemStatus || 'available'} 
                            onChange={(e) => handleStatusChange(pr._id, e.target.value)}
                            sx={{ 
                              '& .MuiSelect-select': { 
                                fontWeight: 500,
                                color: theme.palette.text.primary 
                              } 
                            }}
                          >
                            {itemStatuses.map((status) => (
                              <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pr.status}
                          size="small"
                          color={
                            pr.status === 'in_progress' ? 'warning' :
                            pr.status === 'sent_to_procurement' ? 'info' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{pr.requester?.email || pr.requester}</TableCell>
                      <TableCell>
                        {pr.status === 'sent_to_procurement' && (
                          <Button 
                            size="small" 
                            variant="contained"
                            color="primary" 
                            onClick={() => {
                              const notes = prompt('Enter procurement notes:') || '';
                              const cost = prompt('Enter estimated cost:') || '';
                              const status = prompt('Select item status (available/out_of_stock/discontinued/backorder):') || 'available';
                              if (notes || cost || status) {
                                handleSetInProgress(pr._id, notes, cost, status);
                              }
                            }}
                            sx={{ 
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            Start Processing
                          </Button>
                        )}
                        {pr.status === 'in_progress' && (
                          <Button 
                            size="small" 
                            variant="contained"
                            color="success" 
                            onClick={() => handleStatusChange(pr._id, 'approved')}
                            sx={{ 
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        )}
        
        {tab === 2 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              📝 Procurement Requests
            </Typography>
            
            {/* Enhanced Create New Purchase Request Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                background: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 3 }}>
                ✨ Create New Purchase Request
              </Typography>
                              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <TextField 
                    label="Item Description" 
                    name="itemDescription" 
                    value={form.itemDescription} 
                    onChange={handleFormChange} 
                    required 
                    fullWidth 
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.success.main,
                        },
                      },
                    }}
                  />
                  <TextField 
                    label="Quantity" 
                    name="quantity" 
                    type="number" 
                    value={form.quantity} 
                    onChange={handleFormChange} 
                    required 
                    sx={{ width: 120 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select 
                      label="Priority" 
                      name="priority" 
                      value={form.priority} 
                      onChange={handleFormChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {priorities.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Department" 
                    name="department" 
                    value={form.department} 
                    onChange={handleFormChange} 
                    required 
                    sx={{ width: 180 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🏢</InputAdornment>,
                    }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Item Status</InputLabel>
                    <Select 
                      label="Item Status" 
                      name="itemStatus" 
                      value={form.itemStatus} 
                      onChange={handleFormChange}
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {itemStatuses.map((status) => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Estimated Cost" 
                    name="estimatedCost" 
                    type="number" 
                    value={form.estimatedCost} 
                    onChange={handleFormChange} 
                    sx={{ width: 150 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">💰</InputAdornment>,
                      endAdornment: <InputAdornment position="end">KWD</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Procurement Notes" 
                    name="procurementNotes" 
                    value={form.procurementNotes} 
                    onChange={handleFormChange} 
                    sx={{ width: 200 }}
                    multiline
                    minRows={2}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📝</InputAdornment>,
                    }}
                  />
                  <Button 
                    variant="outlined" 
                    component="label"
                    sx={{ 
                      borderColor: theme.palette.info.main,
                      color: theme.palette.info.main,
                      '&:hover': {
                        borderColor: theme.palette.info.dark,
                        backgroundColor: alpha(theme.palette.info.main, 0.1)
                      }
                    }}
                  >
                    📎 Attach Files
                    <input type="file" name="attachments" multiple hidden onChange={handleFormChange} />
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={submitting} 
                    sx={{ 
                      minWidth: 120,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Submit Request'}
                  </Button>
                </Box>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>All Purchase Requests</Typography>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={async () => {
                  try {
                    const testPR = {
                      itemDescription: 'Test Item for Dropdown',
                      quantity: '1',
                      priority: 'medium',
                      department: 'Test Department',
                      itemStatus: 'available',
                      procurementNotes: 'Test PR for dropdown testing',
                      estimatedCost: '100'
                    };
                    const res = await api.post('/purchase-requests', testPR);
                    if (res.status === 201) {
                      // Immediately update status to sent_to_procurement
                      const prData = res.data as { _id: string };
                      await api.put(`/purchase-requests/${prData._id}`, { status: 'sent_to_procurement' });
                      setSnackbar({ open: true, message: 'Test PR created and sent to procurement', severity: 'success' });
                      fetchPRs();
                    }
                  } catch (e) {
                    setSnackbar({ open: true, message: 'Failed to create test PR', severity: 'error' });
                  }
                }}
                sx={{ ml: 2 }}
              >
                Create Test PR
              </Button>
            </Box>
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
                      <TableCell>Item Status</TableCell>
                      <TableCell>Est. Cost</TableCell>
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
                        <TableCell>
                          <Box sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            backgroundColor: pr.priority === 'urgent' ? '#ffebee' : 
                                           pr.priority === 'high' ? '#fff3e0' : 
                                           pr.priority === 'medium' ? '#e3f2fd' : '#e8f5e8',
                            color: pr.priority === 'urgent' ? '#c62828' : 
                                   pr.priority === 'high' ? '#ef6c00' : 
                                   pr.priority === 'medium' ? '#1565c0' : '#2e7d32'
                          }}>
                            {pr.priority}
                          </Box>
                        </TableCell>
                        <TableCell>{pr.department}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            backgroundColor: pr.itemStatus === 'out_of_stock' ? '#ffebee' : 
                                           pr.itemStatus === 'discontinued' ? '#f5f5f5' : 
                                           pr.itemStatus === 'backorder' ? '#fff3e0' : '#e8f5e8'
                          }}>
                            {pr.itemStatus || 'available'}
                          </Box>
                        </TableCell>
                        <TableCell>{pr.estimatedCost ? `${pr.estimatedCost.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}` : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={pr.status}
                            size="small"
                            color={
                              pr.status === 'in_progress' ? 'warning' :
                              pr.status === 'sent_to_procurement' ? 'info' :
                              pr.status === 'approved' ? 'success' :
                              pr.status === 'pending' ? 'default' :
                              pr.status === 'rejected' ? 'error' : 'default'
                            }
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
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
                          {pr.status === 'in_progress' && (
                            <>
                              <Button size="small" color="warning" onClick={() => handleStatusChange(pr._id, 'completed')}>Mark Completed</Button>
                              <Button size="small" color="error" onClick={() => handleStatusChange(pr._id, 'cancelled')}>Cancel</Button>
                            </>
                          )}
                          {pr.status === 'completed' && (
                            <Button size="small" color="success" onClick={() => handleStatusChange(pr._id, 'approved')}>Approve</Button>
                          )}
                          {pr.status === 'cancelled' && (
                            <Button size="small" color="error" onClick={() => handleStatusChange(pr._id, 'rejected')}>Reject</Button>
                          )}
                          {pr.status === 'sent_to_procurement' && (
                            <>
                              <Button size="small" color="primary" onClick={() => handleStatusChange(pr._id, 'in_progress')}>Start Processing</Button>
                              <Button size="small" color="success" onClick={() => handleStatusChange(pr._id, 'approved')}>Approve</Button>
                            </>
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
        {tab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              📋 Purchase Orders
            </Typography>
            
            {/* Enhanced Create New Purchase Order Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 3 }}>
                ✨ Create New Purchase Order
              </Typography>
                              <Box component="form" onSubmit={handlePOSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Purchase Request</InputLabel>
                    <Select 
                      label="Purchase Request" 
                      name="purchaseRequest" 
                      value={poForm.purchaseRequest} 
                      onChange={handlePOSelectChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {prs.filter(pr => pr.status === 'sent_to_procurement' || pr.status === 'in_progress').length === 0 ? (
                        <MenuItem disabled>No purchase requests available (need 'sent_to_procurement' or 'in_progress' status)</MenuItem>
                      ) : (
                        prs.filter(pr => pr.status === 'sent_to_procurement' || pr.status === 'in_progress').map((pr) => (
                          <MenuItem key={pr._id} value={pr._id}>{pr.itemDescription} - {pr.department}</MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Vendor</InputLabel>
                    <Select 
                      label="Vendor" 
                      name="vendor" 
                      value={poForm.vendor} 
                      onChange={handlePOSelectChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {vendors.filter(v => v.status === 'active').map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor._id}>{vendor.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Delivery Terms" 
                    name="deliveryTerms" 
                    value={poForm.deliveryTerms} 
                    onChange={handlePOFormChange} 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🚚</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Payment Terms" 
                    name="paymentTerms" 
                    value={poForm.paymentTerms} 
                    onChange={handlePOFormChange} 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">💳</InputAdornment>,
                    }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={poSubmitting} 
                    sx={{ 
                      minWidth: 120,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {poSubmitting ? <CircularProgress size={24} /> : 'Create PO'}
                  </Button>
                </Box>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 0 }}>
                📊 All Purchase Orders
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  PRs for PO: {prs.filter(pr => pr.status === 'sent_to_procurement' || pr.status === 'in_progress').length}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    console.log('All PRs:', prs);
                    console.log('PRs for PO dropdown:', prs.filter(pr => pr.status === 'sent_to_procurement' || pr.status === 'in_progress'));
                  }}
                >
                  Debug PRs
                </Button>
              </Box>
            </Box>
            
            {/* Enhanced Purchase Orders Table */}
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
                background: alpha(theme.palette.info.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                  🏢 Purchase Order Management
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Purchase Request</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Delivery Terms</TableCell>
                    <TableCell>Payment Terms</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pos.map((po, idx) => (
                    <TableRow 
                      key={po._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{po.poNumber || po._id.slice(-6)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{po.purchaseRequest?.itemDescription || po.purchaseRequest}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{po.vendor?.name || po.vendor}</TableCell>
                      <TableCell>
                        <Chip
                          label={po.status}
                          size="small"
                          color={
                            po.status === 'closed' ? 'success' :
                            po.status === 'open' ? 'info' :
                            po.status === 'cancelled' ? 'error' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{po.deliveryTerms}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{po.paymentTerms}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="success" 
                          onClick={() => handlePOStatus(po._id, 'closed')}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="warning" 
                          onClick={() => handlePOStatus(po._id, 'open')}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          In Progress
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="error" 
                          onClick={() => handlePOStatus(po._id, 'cancelled')}
                          sx={{ 
                            fontWeight: 600,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        )}
        {tab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              📋 Quotation Requests (RFQ/RFP)
            </Typography>
            
            {/* Enhanced Create New Quotation Request Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.warning.main, fontWeight: 600, mb: 3 }}>
                ✨ Create New Quotation Request
              </Typography>
                              <Box component="form" onSubmit={handleQuotationSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Purchase Request</InputLabel>
                    <Select 
                      label="Purchase Request" 
                      name="purchaseRequest" 
                      value={quotationForm.purchaseRequest} 
                      onChange={handleQuotationSelectChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {prs.filter(pr => pr.status === 'sent_to_procurement').length === 0 ? (
                        <MenuItem disabled>No purchase requests available (need 'sent_to_procurement' status)</MenuItem>
                      ) : (
                        prs.filter(pr => pr.status === 'sent_to_procurement').map((pr) => (
                          <MenuItem key={pr._id} value={pr._id}>{pr.itemDescription} - {pr.department}</MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <Autocomplete
                    multiple
                    options={vendors.filter(v => v.status === 'active')}
                    getOptionLabel={(option) => option.name}
                    value={quotationForm.vendors}
                    onChange={handleQuotationVendorsChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Vendors to Quote" 
                        sx={{ width: 300 }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">🏢</InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={quotationSubmitting} 
                    sx={{ 
                      minWidth: 120,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {quotationSubmitting ? <CircularProgress size={24} /> : 'Send RFQ'}
                  </Button>
                </Box>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 0 }}>
                📊 All Quotation Requests
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  PRs for Quotes: {prs.filter(pr => pr.status === 'sent_to_procurement').length}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    console.log('All PRs:', prs);
                    console.log('PRs for Quote dropdown:', prs.filter(pr => pr.status === 'sent_to_procurement'));
                  }}
                >
                  Debug PRs
                </Button>
              </Box>
            </Box>
            
            {/* Enhanced Quotations Table */}
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
                  📋 Quotation Management
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>RFQ ID</TableCell>
                    <TableCell>Purchase Request</TableCell>
                    <TableCell>Vendors</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Selected Vendor</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotations.map((q, idx) => (
                    <TableRow 
                      key={q._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.warning.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{q._id.slice(-6)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{q.purchaseRequest?.itemDescription || q.purchaseRequest}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${q.vendors?.length || 0} vendors`}
                          size="small"
                          color="info"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={q.status}
                          size="small"
                          color={
                            q.status === 'pending' ? 'warning' :
                            q.status === 'approved' ? 'success' :
                            q.status === 'rejected' ? 'error' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{q.selectedVendor?.name || '-'}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="primary" 
                          onClick={() => setQuoteDialog({ open: true, quotation: q })}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          View Details
                        </Button>
                        {q.status === 'pending' && (
                          <Button 
                            size="small" 
                            variant="contained"
                            color="success" 
                            onClick={() => handleQuotationAction(q._id, 'approve')}
                            sx={{ 
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
            {/* Quotation Details Dialog */}
            <Dialog open={quoteDialog.open} onClose={() => setQuoteDialog({ open: false, quotation: null })} maxWidth="md" fullWidth>
              <DialogTitle>Quotation Details</DialogTitle>
              <DialogContent>
                {quoteDialog.quotation && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Purchase Request: {quoteDialog.quotation.purchaseRequest?.itemDescription}</Typography>
                    <Typography variant="subtitle1" gutterBottom>Vendor Responses:</Typography>
                    {quoteDialog.quotation.responses && quoteDialog.quotation.responses.length > 0 ? (
                      quoteDialog.quotation.responses.map((response: any, idx: number) => (
                        <Box key={idx} sx={{ border: '1px solid #ddd', p: 2, mb: 2, borderRadius: 1 }}>
                          <Typography variant="subtitle2">Vendor: {response.vendor?.name}</Typography>
                          <Typography>Price: {response.price ? Number(response.price).toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '-'}</Typography>
                          <Typography>Delivery Time: {response.deliveryTime}</Typography>
                          <Typography>Terms: {response.terms}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography>No vendor responses yet.</Typography>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setQuoteDialog({ open: false, quotation: null })}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 5 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              📦 Goods Receipt (GRN)
            </Typography>
            
            {/* Enhanced Create New Goods Receipt Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                background: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 3 }}>
                ✨ Create New Goods Receipt
              </Typography>
                              <Box component="form" onSubmit={handleGRNSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Purchase Order</InputLabel>
                    <Select 
                      label="Purchase Order" 
                      name="purchaseOrder" 
                      value={grnForm.purchaseOrder} 
                      onChange={handleGRNSelectChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {pos.filter(po => po.status === 'open').length === 0 ? (
                        <MenuItem disabled>No purchase orders available (need 'open' status)</MenuItem>
                      ) : (
                        pos.filter(po => po.status === 'open').map((po) => (
                          <MenuItem key={po._id} value={po._id}>{po.poNumber || po._id.slice(-6)} - {po.purchaseRequest?.itemDescription}</MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Received By" 
                    name="receivedBy" 
                    value={grnForm.receivedBy} 
                    onChange={handleGRNFormChange} 
                    required 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">👤</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Received Date" 
                    name="receivedDate" 
                    type="date" 
                    value={grnForm.receivedDate} 
                    onChange={handleGRNFormChange} 
                    required 
                    InputLabelProps={{ shrink: true }} 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📅</InputAdornment>,
                    }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status" 
                      name="status" 
                      value={grnForm.status} 
                      onChange={(e) => setGRNForm({ ...grnForm, status: e.target.value })} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      <MenuItem value="received">Received</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                      <MenuItem value="damaged">Damaged</MenuItem>
                    </Select>
                  </FormControl>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={grnSubmitting} 
                    sx={{ 
                      minWidth: 120,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {grnSubmitting ? <CircularProgress size={24} /> : 'Create GRN'}
                  </Button>
                </Box>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 0 }}>
                📊 All Goods Receipts
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  POs for GRN: {pos.filter(po => po.status === 'open').length}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    console.log('All POs:', pos);
                    console.log('POs for GRN dropdown:', pos.filter(po => po.status === 'open'));
                  }}
                >
                  Debug POs
                </Button>
              </Box>
            </Box>
            
            {/* Enhanced Goods Receipts Table */}
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
                background: alpha(theme.palette.success.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                  📦 Goods Receipt Management
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>GRN ID</TableCell>
                    <TableCell>Purchase Order</TableCell>
                    <TableCell>Received By</TableCell>
                    <TableCell>Received Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grns.map((grn, idx) => (
                    <TableRow 
                      key={grn._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{grn._id.slice(-6)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{grn.purchaseOrder?.poNumber || grn.purchaseOrder}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{grn.receivedBy}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={grn.status}
                          size="small"
                          color={
                            grn.status === 'received' ? 'success' :
                            grn.status === 'partial' ? 'warning' :
                            grn.status === 'damaged' ? 'error' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="primary" 
                          onClick={() => setGRNDialog({ open: true, grn })}
                          sx={{ 
                            fontWeight: 600,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
            {/* GRN Details Dialog */}
            <Dialog open={grnDialog.open} onClose={() => setGRNDialog({ open: false, grn: null })} maxWidth="md" fullWidth>
              <DialogTitle>Goods Receipt Details</DialogTitle>
              <DialogContent>
                {grnDialog.grn && (
                  <Box>
                    <Typography variant="h6" gutterBottom>GRN: {grnDialog.grn._id.slice(-6)}</Typography>
                    <Typography>Purchase Order: {grnDialog.grn.purchaseOrder?.poNumber || grnDialog.grn.purchaseOrder}</Typography>
                    <Typography>Received By: {grnDialog.grn.receivedBy}</Typography>
                    <Typography>Received Date: {grnDialog.grn.receivedDate ? new Date(grnDialog.grn.receivedDate).toLocaleDateString() : '-'}</Typography>
                    <Typography>Status: {grnDialog.grn.status}</Typography>
                    {grnDialog.grn.items && grnDialog.grn.items.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Items Received:</Typography>
                        {grnDialog.grn.items.map((item: any, idx: number) => (
                          <Box key={idx} sx={{ border: '1px solid #ddd', p: 1, mb: 1, borderRadius: 1 }}>
                            <Typography>Description: {item.description}</Typography>
                            <Typography>Quantity: {item.quantity}</Typography>
                            {item.damaged && <Typography color="error">Damaged: {item.damaged}</Typography>}
                            {item.delayNotes && <Typography>Delay Notes: {item.delayNotes}</Typography>}
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setGRNDialog({ open: false, grn: null })}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 6 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              🧾 Procurement Invoices & Payment Tracking
            </Typography>
            
            {/* Enhanced Create New Procurement Invoice Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                background: alpha(theme.palette.secondary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.secondary.main, fontWeight: 600, mb: 3 }}>
                ✨ Create New Procurement Invoice
              </Typography>
                              <Box component="form" onSubmit={handleInvoiceSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Purchase Order</InputLabel>
                    <Select 
                      label="Purchase Order" 
                      name="purchaseOrder" 
                      value={invoiceForm.purchaseOrder} 
                      onChange={handleInvoiceSelectChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      {pos.map((po) => (
                        <MenuItem key={po._id} value={po._id}>{po.poNumber || po._id.slice(-6)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button 
                    variant="outlined" 
                    component="label"
                    sx={{ 
                      borderColor: theme.palette.info.main,
                      color: theme.palette.info.main,
                      '&:hover': {
                        borderColor: theme.palette.info.dark,
                        backgroundColor: alpha(theme.palette.info.main, 0.1)
                      }
                    }}
                  >
                    📎 Upload Invoice File
                    <input type="file" name="invoiceFile" hidden onChange={handleInvoiceFormChange} />
                  </Button>
                  <TextField 
                    label="Amount" 
                    name="amount" 
                    type="number" 
                    value={invoiceForm.amount} 
                    onChange={handleInvoiceFormChange} 
                    required 
                    sx={{ width: 180 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">💰</InputAdornment>,
                      endAdornment: <InputAdornment position="end">KWD</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Serial Number" 
                    name="serial" 
                    value={invoiceForm.serial} 
                    onChange={handleInvoiceFormChange} 
                    required 
                    sx={{ width: 220 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🔢</InputAdornment>,
                    }}
                  />
                  <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status" 
                      name="status" 
                      value={invoiceForm.status} 
                      onChange={handleInvoiceSelectChange} 
                      required
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Payment Date" 
                    name="paymentDate" 
                    type="date" 
                    value={invoiceForm.paymentDate} 
                    onChange={handleInvoiceFormChange} 
                    sx={{ width: 180 }} 
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📅</InputAdornment>,
                    }}
                  />
                  <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Matched GRN</InputLabel>
                    <Select 
                      label="Matched GRN" 
                      name="matchedGRN" 
                      value={invoiceForm.matchedGRN} 
                      onChange={handleInvoiceSelectChange}
                      sx={{ 
                        '& .MuiSelect-select': { 
                          fontWeight: 500,
                          color: theme.palette.text.primary 
                        } 
                      }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {grns.map((grn) => (
                        <MenuItem key={grn._id} value={grn._id}>{grn.purchaseOrder?.poNumber || grn.purchaseOrder} - {new Date(grn.receivedDate).toLocaleDateString()}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={invoiceSubmitting} 
                    sx={{ 
                      minWidth: 120, 
                      mt: 2,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {invoiceSubmitting ? <CircularProgress size={24} /> : 'Create Invoice'}
                  </Button>
                </Box>
            </Paper>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📊 All Procurement Invoices
            </Typography>
            
            {/* Enhanced Invoices Table */}
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
                  🧾 Invoice Management
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
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
                  {invoices.map((inv, idx) => (
                    <TableRow 
                      key={inv._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{inv.purchaseOrder?.poNumber || inv.purchaseOrder}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{inv.amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={inv.status}
                          size="small"
                          color={
                            inv.status === 'paid' ? 'success' :
                            inv.status === 'approved' ? 'info' :
                            inv.status === 'pending' ? 'warning' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{inv.matchedGRN ? (inv.matchedGRN.purchaseOrder?.poNumber || inv.matchedGRN.purchaseOrder) : '-'}</TableCell>
                      <TableCell>
                        {inv.status !== 'paid' && (
                          <Button 
                            size="small" 
                            variant="contained"
                            color="success" 
                            onClick={() => handleInvoiceStatus(inv._id, 'paid')}
                            sx={{ 
                              fontWeight: 600,
                              mr: 1,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            Mark Paid
                          </Button>
                        )}
                        {inv.status === 'pending' && (
                          <Button 
                            size="small" 
                            variant="contained"
                            color="primary" 
                            onClick={() => handleInvoiceStatus(inv._id, 'approved')}
                            sx={{ 
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                              }
                            }}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => setInvoiceDialog({ open: true, invoice: inv })}
                          sx={{ 
                            color: theme.palette.info.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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
        {tab === 7 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
              🏢 Vendor Management
            </Typography>
            
            {/* Enhanced Add New Vendor Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                background: alpha(theme.palette.neutral?.main || '#64748b', 0.05),
                border: `1px solid ${alpha(theme.palette.neutral?.main || '#64748b', 0.2)}`,
                borderRadius: theme.shape.borderRadius
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.neutral?.main || '#64748b', fontWeight: 600, mb: 3 }}>
                ✨ Add New Vendor
              </Typography>
                              <Box component="form" onSubmit={handleVendorSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <TextField 
                    label="Name" 
                    name="name" 
                    value={vendorForm.name} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🏢</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Phone" 
                    name="phone" 
                    value={vendorForm.phone} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 160 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📞</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Email" 
                    name="email" 
                    value={vendorForm.email} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📧</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Address" 
                    name="address" 
                    value={vendorForm.address} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 240 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📍</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Contact Person" 
                    name="contactPerson" 
                    value={vendorForm.contactPerson} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">👤</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Trade License" 
                    name="tradeLicense" 
                    value={vendorForm.tradeLicense} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">📜</InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Credit Form" 
                    name="creditForm" 
                    value={vendorForm.creditForm} 
                    onChange={handleVendorFormChange} 
                    required 
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">💳</InputAdornment>,
                    }}
                  />
                
                {/* Categories Section */}
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Categories</Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Button
                      size="small"
                      variant={useCustomCategories ? "outlined" : "contained"}
                      onClick={() => setUseCustomCategories(false)}
                    >
                      Dropdown
                    </Button>
                    <Button
                      size="small"
                      variant={useCustomCategories ? "contained" : "outlined"}
                      onClick={() => setUseCustomCategories(true)}
                    >
                      Manual Entry
                    </Button>
                  </Box>
                  
                  {useCustomCategories ? (
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField
                        label="Add Category"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                        placeholder="Enter category name"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (customCategoryInput.trim() && !vendorForm.categories.includes(customCategoryInput.trim())) {
                            setVendorForm({
                              ...vendorForm,
                              categories: [...vendorForm.categories, customCategoryInput.trim()]
                            });
                            setCustomCategoryInput('');
                          }
                        }}
                        disabled={!customCategoryInput.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                  ) : (
                    <Autocomplete
                      multiple
                      options={[
                        'Office Supplies',
                        'IT Equipment',
                        'Construction Materials',
                        'Vehicle Parts',
                        'Safety Equipment',
                        'Cleaning Supplies',
                        'Food & Beverages',
                        'Medical Supplies',
                        'Tools & Equipment',
                        'Furniture',
                        'Electronics',
                        'Clothing & PPE',
                        'Fuel & Lubricants',
                        'Maintenance Services',
                        'Consulting Services',
                        'Transportation Services',
                        'Other'
                      ]}
                      value={vendorForm.categories}
                      onChange={(event, newValue) => {
                        setVendorForm({ ...vendorForm, categories: newValue });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Categories"
                          placeholder="Choose categories"
                        />
                      )}
                      sx={{ width: '100%' }}
                    />
                  )}
                  
                  {/* Display selected categories */}
                  {vendorForm.categories.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">Selected Categories:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {vendorForm.categories.map((category, index) => (
                          <Chip
                            key={index}
                            label={category}
                            size="small"
                            onDelete={() => {
                              setVendorForm({
                                ...vendorForm,
                                categories: vendorForm.categories.filter((_, i) => i !== index)
                              });
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                
                <TextField select label="Registration Status" name="registrationStatus" value={vendorForm.registrationStatus} onChange={handleVendorFormChange} required sx={{ width: 200 }}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
                <TextField label="Notes" name="notes" value={vendorForm.notes} onChange={handleVendorFormChange} multiline rows={2} sx={{ width: '100%' }} />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={vendorSubmitting} 
                  sx={{ 
                    minWidth: 120,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  {vendorSubmitting ? <CircularProgress size={24} /> : 'Add Vendor'}
                </Button>
              </Box>
            </Paper>
            
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              📊 All Vendors
            </Typography>
            
            {/* Enhanced Vendors Table */}
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
                background: alpha(theme.palette.neutral?.main || '#64748b', 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.neutral?.main || '#64748b', fontWeight: 600 }}>
                  🏢 Vendor Database
                </Typography>
              </Box>
              
              <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Categorizations</TableCell>
                    <TableCell>Credit Limit</TableCell>
                    <TableCell>Payment Terms</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registration</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors.map((v, idx) => (
                    <TableRow 
                      key={v._id}
                      sx={{ 
                        background: idx % 2 === 0 ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.neutral?.main || '#64748b', 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{v._id.slice(-6)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.name}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.phone || v.contactInfo?.phone || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.email || v.contactInfo?.email || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.address || v.contactInfo?.address || '-'}</TableCell>
                      <TableCell>
                        {v.categorizations && v.categorizations.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {v.categorizations.map((cat: string, idx: number) => (
                              <Chip
                                key={idx}
                                label={cat}
                                size="small"
                                color="info"
                                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                              />
                            ))}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.creditLimit ? v.creditLimit.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }) : '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{v.paymentTerms || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={v.status}
                          size="small"
                          color={
                            v.status === 'active' ? 'success' :
                            v.status === 'inactive' ? 'warning' :
                            v.status === 'blacklisted' ? 'error' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={v.registrationStatus}
                          size="small"
                          color={
                            v.registrationStatus === 'approved' ? 'success' :
                            v.registrationStatus === 'pending' ? 'warning' :
                            v.registrationStatus === 'rejected' ? 'error' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="success" 
                          onClick={() => handleVendorStatus(v._id, 'active')}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            mb: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Activate
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="warning" 
                          onClick={() => handleVendorStatus(v._id, 'inactive')}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            mb: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Deactivate
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="error" 
                          onClick={() => handleVendorStatus(v._id, 'blacklisted')}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            mb: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Blacklist
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="primary" 
                          onClick={() => handleVendorRegStatus(v._id, 'approved')}
                          sx={{ 
                            fontWeight: 600,
                            mr: 1,
                            mb: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="secondary" 
                          onClick={() => handleVendorRegStatus(v._id, 'rejected')}
                          sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => setVendorDialog({ open: true, vendor: v })}
                          sx={{ 
                            color: theme.palette.info.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" color="warning.main" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              ⚠️ Low Stock Alerts
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Min Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Triggered At</TableCell>
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
            </TableContainer>
          </Paper>
        </motion.div>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        onClick={() => {
          fetchPRs();
          fetchVendors();
          fetchPOs();
          fetchQuotations();
          fetchGRNs();
          fetchInvoices();
        }}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
            transform: 'scale(1.1)'
          }
        }}
      >
        <RefreshIcon />
      </Fab>

      {/* Cost Analysis Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <CostAnalysisDashboard
          title="Procurement Cost Analysis"
          subtitle="Total procurement costs across all periods with depreciation and amortization"
          emoji="💰"
          module="procurement"
          records={procurementRecords}
          dateField="date"
          costField="amount"
          loading={loading}
          enablePnLIntegration={true}
        />
      </motion.div>

      {/* Enhanced Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: 28
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcurementPage; 