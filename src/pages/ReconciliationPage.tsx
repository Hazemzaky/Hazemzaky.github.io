import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Snackbar, TextField } from '@mui/material';

const ReconciliationPage: React.FC = () => {
  // Demo state (replace with backend integration)
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [unreconciled, setUnreconciled] = useState([
    { id: 1, date: '2024-06-01', description: 'Vendor Payment', amount: 1200 },
    { id: 2, date: '2024-06-03', description: 'Bank Fee', amount: -15 },
  ]);
  const [reconciled, setReconciled] = useState([
    { id: 3, date: '2024-05-28', description: 'Customer Receipt', amount: 5000 },
  ]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBankFile(e.target.files[0]);
  };
  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSnackbar('Bank statement uploaded and parsed!');
    }, 1200);
  };
  const handleReconcile = (id: number) => {
    const tx = unreconciled.find(t => t.id === id);
    if (tx) {
      setUnreconciled(unreconciled.filter(t => t.id !== id));
      setReconciled([...reconciled, tx]);
      setSnackbar('Transaction marked as reconciled!');
    }
  };
  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} color="text.primary" mb={3}>Bank Reconciliation</Typography>
      {/* Summary Widget */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4, background: '#fafdff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">Total: {unreconciled.length + reconciled.length}</Typography>
          <Chip label={`Matched: ${reconciled.length}`} color="success" sx={{ fontWeight: 600 }} />
          <Chip label={`Unmatched: ${unreconciled.length}`} color="error" sx={{ fontWeight: 600 }} />
        </Box>
      </Paper>
      {/* Bank Statement Upload */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Upload Bank Statement</Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Button variant="contained" component="label" sx={{ fontWeight: 600, borderRadius: 2 }}>
            Choose File
            <input type="file" accept=".csv,.xlsx" hidden onChange={handleFileChange} />
          </Button>
          <Typography>{bankFile?.name || 'No file selected'}</Typography>
          <Button variant="contained" color="primary" onClick={handleUpload} disabled={!bankFile || uploading} sx={{ fontWeight: 600, borderRadius: 2 }}>
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </Box>
      </Paper>
      {/* Unreconciled Transactions */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Unreconciled Transactions</Typography>
        {unreconciled.length === 0 ? <Typography color="text.secondary">All transactions reconciled!</Typography> : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unreconciled.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="success" onClick={() => handleReconcile(tx.id)}>
                        Mark as Reconciled
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Reconciled Transactions */}
      <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Reconciled Transactions</Typography>
        {reconciled.length === 0 ? <Typography color="text.secondary">No transactions reconciled yet.</Typography> : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reconciled.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    </Box>
  );
};

export default ReconciliationPage; 