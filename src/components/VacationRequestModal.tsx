import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Box, Typography, TextField, MenuItem, CircularProgress, Snackbar, IconButton, InputAdornment, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const leaveTypes = [
  { value: 'Annual', label: 'Annual Leave' },
  { value: 'Sick', label: 'Sick Leave' },
  { value: 'Emergency', label: 'Emergency Leave' },
  { value: 'Unpaid', label: 'Unpaid Leave' },
];

const VacationRequestModal = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    notes: '',
    attachment: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('Family event coming up? Consider planning ahead!');
  const [leaveBalance, setLeaveBalance] = useState(12); // mock
  const [teamImpact, setTeamImpact] = useState('2 teammates are also off during this period.');
  const steps = ['Type', 'Dates', 'Reason', 'Attachment'];

  const handleNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'reason') {
      setAiSuggestion('How about: "Family event" or "Medical appointment"?');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, attachment: e.target.files?.[0] || null });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSuccess();
    }, 1200);
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="type" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.4 }}>
            <TextField
              select
              label="Type of Leave"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {leaveTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
            <Typography variant="body2" color="text.secondary">Choose the type of leave you want to request.</Typography>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="dates" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.4 }}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">Business days auto-calculated. Public holidays/blackout dates blocked (mock).</Typography>
            <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>Leave balance after request: {leaveBalance - 3} days</Typography>
            <Typography variant="body2" color="warning.main">{teamImpact}</Typography>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="reason" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.4 }}>
            <TextField
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setForm(f => ({ ...f, reason: aiSuggestion }))}>
                      💡
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Notes (optional)"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="info.main">AI Suggestion: {aiSuggestion}</Typography>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="attach" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.4 }}>
            <Button variant="outlined" component="label" startIcon={<AttachFileIcon />} sx={{ mb: 2 }}>
              {form.attachment ? form.attachment.name : 'Upload Attachment (optional)'}
              <input type="file" hidden onChange={handleFile} />
            </Button>
            <Typography variant="body2" color="text.secondary">Attach a medical file or travel plan if needed.</Typography>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Request Vacation
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        {step > 0 && <Button onClick={handleBack} disabled={submitting}>Back</Button>}
        {step < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={submitting || !form.type || (step === 1 && (!form.startDate || !form.endDate))}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} /> : null}>
            Submit Request
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VacationRequestModal; 