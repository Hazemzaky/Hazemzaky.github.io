// THEME: Bright, clean, readable, blue-accented
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

// Remove all hardcoded barData, pieData, lineData, COLORS
// Accept analytics data as props
interface BarDatum { month: string; leaves: number; }
interface PieDatum { name: string; value: number; }
interface LineDatum { month: string; burnout: number; }

const VacationAnalytics: React.FC<{
  barData?: BarDatum[];
  pieData?: PieDatum[];
  lineData?: LineDatum[];
}> = ({ barData = [], pieData = [], lineData = [] }) => (
  <Paper sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
    <Typography variant="h6" fontWeight={700} color="text.primary" mb={2}>Vacation Analytics</Typography>
    <Box height={180} mb={2}>
      {barData.length === 0 ? <Typography color="text.secondary">No analytics data to display.</Typography> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <XAxis dataKey="month" stroke="#90a4ae" tick={{ fill: '#333', fontWeight: 400 }} />
            <YAxis stroke="#90a4ae" tick={{ fill: '#333', fontWeight: 400 }} />
            <Tooltip contentStyle={{ background: '#fff', color: '#333', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
            <Bar dataKey="leaves" fill="#2196f3" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <Typography variant="caption" color="text.secondary">Leaves per month</Typography>
    </Box>
    <Box height={180} mb={2}>
      {pieData.length === 0 ? <Typography color="text.secondary">No analytics data to display.</Typography> : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {pieData.map((entry, idx) => <Cell key={entry.name} fill={['#00eaff', '#8f00ff', '#ffb300', '#ff4081'][idx % 4]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#fff', color: '#333', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <Typography variant="caption" color="text.secondary">Leave types distribution</Typography>
    </Box>
    <Box height={180} mb={2}>
      {lineData.length === 0 ? <Typography color="text.secondary">No analytics data to display.</Typography> : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
            <XAxis dataKey="month" stroke="#90a4ae" tick={{ fill: '#333', fontWeight: 400 }} />
            <YAxis stroke="#90a4ae" tick={{ fill: '#333', fontWeight: 400 }} />
            <Tooltip contentStyle={{ background: '#fff', color: '#333', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
            <Legend />
            <Line type="monotone" dataKey="burnout" stroke="#ff4081" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
      <Typography variant="caption" color="text.secondary">Burnout risk indicator (AI-generated)</Typography>
    </Box>
    {/* Remove predictive model and export buttons if not using real data */}
  </Paper>
);

export default VacationAnalytics; 