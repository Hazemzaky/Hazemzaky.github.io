// THEME: Bright, clean, readable, blue-accented
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Chip, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';

interface VacationEvent {
  date: string;
  name: string;
  type: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Approved: '#00e676',
  Pending: '#ffeb3b',
  Rejected: '#ff1744',
};

const VacationCalendar = ({ role, events = [] }: { role: 'employee' | 'hr'; events?: VacationEvent[] }) => {
  const [view, setView] = useState<'month' | 'week'>('month');

  return (
    <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={700} color="text.primary">Vacation Calendar</Typography>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* Calendar grid */}
      <Box sx={{ height: 260, background: '#fafdff', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {events.length === 0 ? (
          <Typography color="text.secondary">No vacation events to display.</Typography>
        ) : events.map(ev => (
          <Tooltip key={ev.date+ev.name} title={<span>{ev.name} - {ev.type} ({ev.status})</span>}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography color="text.primary" sx={{ minWidth: 90, fontWeight: 400 }}>{ev.date}</Typography>
              <Chip label={ev.name} size="small" />
              <Chip label={ev.type} size="small" />
              <Chip label={ev.status} size="small" sx={{ background: statusColors[ev.status], color: '#222', fontWeight: 600 }} />
              {role === 'hr' && <Button size="small" variant="outlined">Reschedule</Button>}
            </Box>
          </Tooltip>
        ))}
      </Box>
      {/* Legend */}
      <Box display="flex" gap={2} mt={2}>
        <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 16, height: 16, background: '#00e676', borderRadius: 0.5 }} /> <Typography variant="caption" color="text.secondary">Approved</Typography></Box>
        <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 16, height: 16, background: '#ffeb3b', borderRadius: 0.5 }} /> <Typography variant="caption" color="text.secondary">Pending</Typography></Box>
        <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 16, height: 16, background: '#ff1744', borderRadius: 0.5 }} /> <Typography variant="caption" color="text.secondary">Rejected</Typography></Box>
      </Box>
    </Paper>
  );
};

export default VacationCalendar; 