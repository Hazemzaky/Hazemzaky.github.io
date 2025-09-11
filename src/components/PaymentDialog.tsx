import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Payment as PaymentIcon, AttachMoney, CreditCard, AccountBalance } from '@mui/icons-material';
import api from '../apiBase';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  remainingAmount: number;
  onPaymentRecorded: () => void;
}

interface PaymentForm {
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  paymentDate: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    transactionId: string;
    routingNumber: string;
  };
  checkDetails: {
    checkNumber: string;
    bankName: string;
    accountHolder: string;
  };
  creditCardDetails: {
    lastFourDigits: string;
    cardType: string;
    transactionId: string;
  };
  notes: string;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  remainingAmount,
  onPaymentRecorded
}) => {
  const [form, setForm] = useState<PaymentForm>({
    amount: remainingAmount,
    currency: 'KWD',
    paymentMethod: 'bank_transfer',
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    bankDetails: {
      bankName: '',
      accountNumber: '',
      transactionId: '',
      routingNumber: ''
    },
    checkDetails: {
      checkNumber: '',
      bankName: '',
      accountHolder: ''
    },
    creditCardDetails: {
      lastFourDigits: '',
      cardType: '',
      transactionId: ''
    },
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        amount: remainingAmount,
        paymentDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [open, remainingAmount]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof PaymentForm] as any,
        [childField]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const paymentData: any = {
        invoiceId,
        amount: form.amount,
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        paymentReference: form.paymentReference,
        paymentDate: form.paymentDate,
        notes: form.notes
      };

      // Add method-specific details
      if (form.paymentMethod === 'bank_transfer') {
        paymentData.bankDetails = form.bankDetails;
      } else if (form.paymentMethod === 'check') {
        paymentData.checkDetails = form.checkDetails;
      } else if (form.paymentMethod === 'credit_card') {
        paymentData.creditCardDetails = form.creditCardDetails;
      }

      await api.post('/payments', paymentData);
      onPaymentRecorded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <AccountBalance />;
      case 'credit_card':
        return <CreditCard />;
      case 'check':
        return <AttachMoney />;
      default:
        return <PaymentIcon />;
    }
  };

  const renderMethodSpecificFields = () => {
    switch (form.paymentMethod) {
      case 'bank_transfer':
        return (
          <Card sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bank Transfer Details
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Bank Name"
                  value={form.bankDetails.bankName}
                  onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Account Number"
                  value={form.bankDetails.accountNumber}
                  onChange={(e) => handleNestedChange('bankDetails', 'accountNumber', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Transaction ID"
                  value={form.bankDetails.transactionId}
                  onChange={(e) => handleNestedChange('bankDetails', 'transactionId', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Routing Number"
                  value={form.bankDetails.routingNumber}
                  onChange={(e) => handleNestedChange('bankDetails', 'routingNumber', e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>
          </Card>
        );

      case 'check':
        return (
          <Card sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Check Details
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Check Number"
                  value={form.checkDetails.checkNumber}
                  onChange={(e) => handleNestedChange('checkDetails', 'checkNumber', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Bank Name"
                  value={form.checkDetails.bankName}
                  onChange={(e) => handleNestedChange('checkDetails', 'bankName', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box flex="1 1 100%" minWidth="200px">
                <TextField
                  label="Account Holder"
                  value={form.checkDetails.accountHolder}
                  onChange={(e) => handleNestedChange('checkDetails', 'accountHolder', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
            </Box>
          </Card>
        );

      case 'credit_card':
        return (
          <Card sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Credit Card Details
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 200px" minWidth="200px">
                <TextField
                  label="Last 4 Digits"
                  value={form.creditCardDetails.lastFourDigits}
                  onChange={(e) => handleNestedChange('creditCardDetails', 'lastFourDigits', e.target.value)}
                  fullWidth
                  required
                  inputProps={{ maxLength: 4 }}
                />
              </Box>
              <Box flex="1 1 200px" minWidth="200px">
                <FormControl fullWidth required>
                  <InputLabel>Card Type</InputLabel>
                  <Select
                    value={form.creditCardDetails.cardType}
                    onChange={(e) => handleNestedChange('creditCardDetails', 'cardType', e.target.value)}
                    label="Card Type"
                  >
                    <MenuItem value="visa">Visa</MenuItem>
                    <MenuItem value="mastercard">Mastercard</MenuItem>
                    <MenuItem value="amex">American Express</MenuItem>
                    <MenuItem value="discover">Discover</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box flex="1 1 100%" minWidth="200px">
                <TextField
                  label="Transaction ID"
                  value={form.creditCardDetails.transactionId}
                  onChange={(e) => handleNestedChange('creditCardDetails', 'transactionId', e.target.value)}
                  fullWidth
                  required
                />
              </Box>
            </Box>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {getPaymentMethodIcon(form.paymentMethod)}
          <Box>
            <Typography variant="h5">Record Payment</Typography>
            <Typography variant="body2" color="text.secondary">
              Invoice #{invoiceNumber}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                label="Amount"
                type="number"
                value={form.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                fullWidth
                required
                inputProps={{ min: 0, max: remainingAmount, step: 0.01 }}
                helperText={`Maximum: ${remainingAmount.toLocaleString()} ${form.currency}`}
              />
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <FormControl fullWidth required>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={form.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  label="Currency"
                >
                  <MenuItem value="KWD">KWD</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box flex="1 1 200px" minWidth="200px">
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={form.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="online">Online Payment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                label="Payment Reference"
                value={form.paymentReference}
                onChange={(e) => handleChange('paymentReference', e.target.value)}
                fullWidth
                required
                placeholder="Transaction ID, Check #, etc."
              />
            </Box>

            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                label="Payment Date"
                type="date"
                value={form.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Additional payment notes..."
              />
            </Box>
          </Box>

          {renderMethodSpecificFields()}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || form.amount <= 0 || form.amount > remainingAmount}
          startIcon={submitting ? <CircularProgress size={20} /> : <PaymentIcon />}
        >
          {submitting ? 'Recording...' : 'Record Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
