import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, MenuItem, Button, Divider, InputAdornment, Snackbar, Alert, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import api from '../apiBase';
import PrintIcon from '@mui/icons-material/Print';

const currencyOptions = [
  { code: 'KWD', sign: 'د.ك' },
  { code: 'USD', sign: '$' },
  { code: 'EUR', sign: '€' },
  { code: 'GBP', sign: '£' },
  { code: 'SAR', sign: 'ر.س' },
  { code: 'AED', sign: 'د.إ' },
];

const defaultQuote = {
  quotationDate: '',
  validUntil: '',
  status: 'Draft',
  clientName: '',
  attn: '',
  email: '',
  contactNo: '',
  subject: '',
  refCode: '',
  currency: 'KWD',
  project: '',
  rateType: 'daily',
  rate: '',
  operatorCharges: '',
  fuelCharges: '',
  mobilizationFee: '',
  standbyCharges: '',
  securityDeposit: '',
  discounts: '',
  taxes: '',
  addOns: '',
  paymentTerms: '',
  paymentMethods: '',
  penalty: '',
  withOperator: 'no',
  fuelProvidedBy: '',
  insurance: '',
  maintenance: '',
  availability: '',
  breakdownPolicy: '',
  standbyConditions: '',
  grandTotal: '',
  clientPOBox: '',
  clientFax: '',
  clientEmail: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  contactPersonExtension: '',
  serialNumber: '',
  terms: [],
  additionalDetails: '',
};

// Default rental item structure
const defaultRentalItem = {
  description: '',
  rentType: 'Callout',
  workingHours: '8',
  unitPrice: '',
  remarks: ''
};

function exportCSV(rows: any[], headers: string[], filename: string) {
  const csv = [headers, ...rows].map((r: any[]) => r.map((x: any) => `"${x ?? ''}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const SalesPage: React.FC = () => {
  const [quote, setQuote] = useState<any>(defaultQuote);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Filtering/search state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [terms, setTerms] = useState<string[]>([]);
  const [rentalItems, setRentalItems] = useState<any[]>([defaultRentalItem]);

  // Fetch quotations from backend
  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/quotations');
      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError((err as any).response?.data?.message || 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Auto-calculate rental duration and totals
  const calcTotal = () => {
    const rate = Number(quote.rate) || 0;
    let total = rate;
    total += Number(quote.operatorCharges) || 0;
    total += Number(quote.fuelCharges) || 0;
    total += Number(quote.mobilizationFee) || 0;
    total += Number(quote.standbyCharges) || 0;
    total += Number(quote.securityDeposit) || 0;
    total -= Number(quote.discounts) || 0;
    total += Number(quote.taxes) || 0;
    return total > 0 ? total : 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };

  const handleAddTerm = () => setTerms([...terms, '']);
  const handleTermChange = (idx: number, value: string) => setTerms(terms.map((t, i) => i === idx ? value : t));
  const handleRemoveTerm = (idx: number) => setTerms(terms.filter((_, i) => i !== idx));

  // Rental items functions
  const handleAddRentalItem = () => {
    setRentalItems([...rentalItems, { ...defaultRentalItem }]);
  };

  const handleRemoveRentalItem = (idx: number) => {
    if (rentalItems.length > 1) {
      setRentalItems(rentalItems.filter((_, i) => i !== idx));
    }
  };

  const handleRentalItemChange = (idx: number, field: string, value: string) => {
    const updatedItems = rentalItems.map((item, i) => 
      i === idx ? { ...item, [field]: value } : item
    );
    setRentalItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...quote,
        terms,
        rentalItems,
        currency: quote.currency,
        clientPOBox: quote.clientPOBox,
        clientFax: quote.clientFax,
        clientEmail: quote.clientEmail,
        contactPersonPhone: quote.contactPersonPhone,
        contactPersonEmail: quote.contactPersonEmail,
        contactPersonExtension: quote.contactPersonExtension,
        serialNumber: quote.serialNumber,
        rate: Number(quote.rate),
        operatorCharges: Number(quote.operatorCharges),
        fuelCharges: Number(quote.fuelCharges),
        mobilizationFee: Number(quote.mobilizationFee),
        standbyCharges: Number(quote.standbyCharges),
        securityDeposit: Number(quote.securityDeposit),
        discounts: Number(quote.discounts),
        taxes: Number(quote.taxes),
        grandTotal: calcTotal(),
        quotationDate: quote.quotationDate ? new Date(quote.quotationDate) : null,
        validUntil: quote.validUntil ? new Date(quote.validUntil) : null,
      };
      await api.post('/quotations', submitData);
      setSuccess('Quotation submitted!');
      setQuote(defaultQuote);
      setRentalItems([defaultRentalItem]);
      setTerms([]);
      fetchQuotations();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quotation');
    }
  };

  // Filtered and searched quotations
  const filteredQuotations = quotations.filter(q => {
    // Date range
    if (filterFrom && (!q.quotationDate || new Date(q.quotationDate) < new Date(filterFrom))) return false;
    if (filterTo && (!q.quotationDate || new Date(q.quotationDate) > new Date(filterTo))) return false;
    // Status
    if (filterStatus && q.status !== filterStatus) return false;
    // Client
    if (filterClient && !q.clientName?.toLowerCase().includes(filterClient.toLowerCase())) return false;
    // Free text search
    if (search) {
      const s = search.toLowerCase();
      if (!(
        (q.clientName && q.clientName.toLowerCase().includes(s)) ||
        (q.status && q.status.toLowerCase().includes(s))
      )) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Client', 'Status', 'Grand Total'];
    const rows = filteredQuotations.map(q => [
      q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-',
      q.clientName,
      q.status,
      q.grandTotal ? `${q.grandTotal} KWD` : '-',
    ]);
    exportCSV(rows, headers, 'quotations.csv');
  };

  const printQuotation = (q: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Quotation - ${q.clientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
            .logo { font-size: 2rem; font-weight: bold; color: #1976d2; }
            .company-info { text-align: right; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 8px; color: #1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Company Logo</div>
            <div class="company-info">
              <div>Company Name</div>
              <div>Address Line 1</div>
              <div>Address Line 2</div>
              <div>Email: info@company.com</div>
              <div>Phone: +965 1234 5678</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Quotation Details</div>
            <table>
              <tr><th>Quotation Date</th><td>${q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-'}</td></tr>
              <tr><th>Valid Until</th><td>${q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '-'}</td></tr>
              <tr><th>Status</th><td>${q.status}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Customer Information</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; width: 25%;">Client Name</th>
                <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">${q.clientName || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px; width: 25%;">Date</th>
                <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">${q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-'}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Attn.</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.attn || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Ref Code</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.refCode || '-'}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.email || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Currency</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.currency || '-'}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Cont No.</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.contactNo || '-'}</td>
                <th style="border: 1px solid #ddd; padding: 8px;">Project</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${q.project || '-'}</td>
              </tr>
            </table>
            <div style="margin-top: 16px;">
              <strong>Subject:</strong><br/>
              <div style="border: 1px solid #ddd; padding: 8px; min-height: 60px; margin-top: 8px;">
                ${q.subject || '-'}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Pricing Breakdown</div>
            <table>
              <tr><th>Rate Type</th><td>${q.rateType}</td></tr>
              <tr><th>Rate per Unit</th><td>${q.rate} KWD</td></tr>
              <tr><th>Operator Charges</th><td>${q.operatorCharges} KWD</td></tr>
              <tr><th>Fuel Charges</th><td>${q.fuelCharges} KWD</td></tr>
              <tr><th>Mobilization/Demobilization Fee</th><td>${q.mobilizationFee} KWD</td></tr>
              <tr><th>Standby Charges</th><td>${q.standbyCharges} KWD</td></tr>
              <tr><th>Security Deposit</th><td>${q.securityDeposit} KWD</td></tr>
              <tr><th>Discounts</th><td>${q.discounts} KWD</td></tr>
              <tr><th>Taxes / VAT</th><td>${q.taxes} KWD</td></tr>
              <tr><th>Grand Total</th><td><b>${q.grandTotal} KWD</b></td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Service Add-ons / Conditions</div>
            <table>
              <tr><th>With/Without Operator</th><td>${q.withOperator === 'yes' ? 'With Operator' : 'Without Operator'}</td></tr>
              <tr><th>Fuel Provided By</th><td>${q.fuelProvidedBy}</td></tr>
              <tr><th>Insurance Responsibility</th><td>${q.insurance}</td></tr>
              <tr><th>Maintenance Coverage</th><td>${q.maintenance}</td></tr>
              <tr><th>Availability Confirmation</th><td>${q.availability}</td></tr>
              <tr><th>Breakdown Replacement Policy</th><td>${q.breakdownPolicy}</td></tr>
              <tr><th>Standby Conditions</th><td>${q.standbyConditions}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Payment Terms</div>
            <table>
              <tr><th>Payment Terms</th><td>${q.paymentTerms}</td></tr>
              <tr><th>Accepted Payment Methods</th><td>${q.paymentMethods}</td></tr>
              <tr><th>Penalty for Late Return</th><td>${q.penalty}</td></tr>
            </table>
          </div>
          <div style="margin-top: 40px; text-align: right; font-size: 1.1rem; color: #1976d2;">Thank you for your business!</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Sales Department</Typography>
        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
          Add Quotation
        </Button>
      </Box>
      <Divider sx={{ my: 3 }} />
      {/* Quotation Creation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Quotation</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Typography variant="h6" gutterBottom>Quotation Details</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Quotation Date" name="quotationDate" type="date" value={quote.quotationDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
              <TextField label="Valid Until" name="validUntil" type="date" value={quote.validUntil} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
              <TextField label="Status" name="status" value={quote.status} onChange={handleChange} select fullWidth>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Revised">Revised</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </TextField>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Customer Information</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                <TextField label="Client Name" name="clientName" value={quote.clientName} onChange={handleChange} fullWidth required />
                <TextField label="Date" name="quotationDate" type="date" value={quote.quotationDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Attn." name="attn" value={quote.attn} onChange={handleChange} fullWidth />
                <TextField label="Ref Code" name="refCode" value={quote.refCode} onChange={handleChange} fullWidth />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Email" name="email" value={quote.email} onChange={handleChange} fullWidth />
                <TextField label="Currency" name="currency" value={quote.currency} onChange={handleChange} select fullWidth>
                  {currencyOptions.map(opt => (
                    <MenuItem key={opt.code} value={opt.code}>{opt.code} ({opt.sign})</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Cont No." name="contactNo" value={quote.contactNo} onChange={handleChange} fullWidth />
                <TextField label="Project" name="project" value={quote.project} onChange={handleChange} fullWidth />
              </Box>
              <TextField label="Subject" name="subject" value={quote.subject} onChange={handleChange} fullWidth multiline minRows={2} />
            </Box>

            
            {/* New Rental Items Section */}
            <Typography variant="h6" gutterBottom>Rental Items</Typography>
            {rentalItems.map((item, idx) => (
              <Box key={idx} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Item #{idx + 1}</Typography>
                  {rentalItems.length > 1 && (
                    <Button 
                      color="error" 
                      size="small" 
                      onClick={() => handleRemoveRentalItem(idx)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField 
                    label="Description" 
                    value={item.description} 
                    onChange={(e) => handleRentalItemChange(idx, 'description', e.target.value)} 
                    fullWidth 
                    required 
                  />
                  <Box display="flex" gap={2}>
                    <TextField 
                      select 
                      label="Rent Type" 
                      value={item.rentType} 
                      onChange={(e) => handleRentalItemChange(idx, 'rentType', e.target.value)} 
                      fullWidth 
                      required
                    >
                      <MenuItem value="Callout">Callout</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Trip">Trip</MenuItem>
                    </TextField>
                    <TextField 
                      select 
                      label="Working Hours" 
                      value={item.workingHours} 
                      onChange={(e) => handleRentalItemChange(idx, 'workingHours', e.target.value)} 
                      fullWidth 
                      required
                    >
                      <MenuItem value="8">8 Hours</MenuItem>
                      <MenuItem value="12">12 Hours</MenuItem>
                      <MenuItem value="16">16 Hours</MenuItem>
                      <MenuItem value="24">24 Hours</MenuItem>
                    </TextField>
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField 
                      label="Unit Price" 
                      value={item.unitPrice} 
                      onChange={(e) => handleRentalItemChange(idx, 'unitPrice', e.target.value)} 
                      type="number" 
                      fullWidth 
                      required 
                      InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }}
                    />
                    <TextField 
                      label="Remarks" 
                      value={item.remarks} 
                      onChange={(e) => handleRentalItemChange(idx, 'remarks', e.target.value)} 
                      fullWidth 
                    />
                  </Box>
                </Box>
              </Box>
            ))}
            <Button 
              variant="outlined" 
              onClick={handleAddRentalItem}
              sx={{ mb: 2 }}
            >
              Add More Items
            </Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Pricing Breakdown</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Currency" name="currency" value={quote.currency} onChange={handleChange} select fullWidth>
                {currencyOptions.map(opt => (
                  <MenuItem key={opt.code} value={opt.code}>{opt.code} ({opt.sign})</MenuItem>
                ))}
              </TextField>
              <TextField label="Rate Type" name="rateType" value={quote.rateType} onChange={handleSelect} select fullWidth>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </TextField>
              <TextField label="Rate per Unit" name="rate" value={quote.rate} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth required />
              <TextField label="Grand Total" value={calcTotal()} InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Operator Charges" name="operatorCharges" value={quote.operatorCharges} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Fuel Charges" name="fuelCharges" value={quote.fuelCharges} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Mobilization/Demobilization Fee" name="mobilizationFee" value={quote.mobilizationFee} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Standby Charges" name="standbyCharges" value={quote.standbyCharges} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Security Deposit" name="securityDeposit" value={quote.securityDeposit} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Discounts" name="discounts" value={quote.discounts} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
              <TextField label="Taxes / VAT" name="taxes" value={quote.taxes} onChange={handleChange} type="number" InputProps={{ endAdornment: <InputAdornment position="end">KWD</InputAdornment> }} fullWidth />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Initial Terms & Conditions</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {terms.map((term, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <TextField
                    label={`Term #${idx + 1}`}
                    value={term}
                    onChange={e => handleTermChange(idx, e.target.value)}
                    fullWidth
                  />
                  <Button color="error" onClick={() => handleRemoveTerm(idx)}>Remove</Button>
                </Box>
              ))}
              <Button variant="outlined" onClick={handleAddTerm}>Add Term</Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Quotation Details (Placeholder)</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Serial Number" name="serialNumber" value={quote.serialNumber} onChange={handleChange} fullWidth placeholder="Auto/Manual" />
              <TextField label="Additional Details" name="additionalDetails" value={quote.additionalDetails || ''} onChange={handleChange} fullWidth multiline minRows={2} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Service Add-ons / Conditions</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="With/Without Operator" name="withOperator" value={quote.withOperator} onChange={handleSelect} select fullWidth>
                <MenuItem value="no">Without Operator</MenuItem>
                <MenuItem value="one">With One Operator</MenuItem>
                <MenuItem value="two">With Two Operators</MenuItem>
              </TextField>
              <TextField label="Fuel Provided By" name="fuelProvidedBy" value={quote.fuelProvidedBy} onChange={handleChange} select fullWidth>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Company">Company</MenuItem>
                <MenuItem value="Client">Client</MenuItem>
              </TextField>
              <TextField label="Insurance Responsibility" name="insurance" value={quote.insurance} onChange={handleChange} fullWidth />
              <TextField label="Maintenance Coverage" name="maintenance" value={quote.maintenance} onChange={handleChange} fullWidth />
              <TextField label="Availability Confirmation" name="availability" value={quote.availability} onChange={handleChange} fullWidth />
              <TextField label="Breakdown Replacement Policy" name="breakdownPolicy" value={quote.breakdownPolicy} onChange={handleChange} fullWidth />
              <TextField label="Standby Conditions" name="standbyConditions" value={quote.standbyConditions} onChange={handleChange} fullWidth />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Payment Terms</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Payment Terms" name="paymentTerms" value={quote.paymentTerms} onChange={handleChange} fullWidth />
              <TextField label="Accepted Payment Methods" name="paymentMethods" value={quote.paymentMethods} onChange={handleChange} fullWidth />
              <TextField label="Penalty for Late Return" name="penalty" value={quote.penalty} onChange={handleChange} fullWidth />
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
      {/* Quotations Table and other content remain below */}
      <Typography variant="h5" gutterBottom>Recent Quotations</Typography>
      {/* Filter/Search Controls */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} sx={{ minWidth: 180 }} />
        <TextField label="Client" value={filterClient} onChange={e => setFilterClient(e.target.value)} sx={{ minWidth: 160 }} />
        <TextField select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Sent">Sent</MenuItem>
          <MenuItem value="Revised">Revised</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Expired">Expired</MenuItem>
        </TextField>
        <TextField label="From" type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
        <TextField label="To" type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
        <Button variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
      </Box>
      {loading ? <Typography>Loading...</Typography> : (
        <Paper sx={{ p: 2, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Grand Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuotations.map((q) => (
                <TableRow key={q._id}>
                  <TableCell>{q.quotationDate ? new Date(q.quotationDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{q.clientName}</TableCell>
                  <TableCell>{q.status}</TableCell>
                  <TableCell>{q.grandTotal ? `${q.grandTotal} KWD` : '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => printQuotation(q)}><PrintIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    </Box>
  );
};

export default SalesPage; 