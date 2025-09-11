import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Button, Chip, useTheme, alpha
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, AttachMoney, Receipt, People, Payment,
  Assessment, ShowChart, PieChart as PieChartIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../apiBase';

interface DashboardData {
  invoices: {
    totalStats: {
      totalRevenue: number;
      totalInvoices: number;
      averageInvoiceAmount: number;
    };
    revenueByStatus: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
    monthlyTrends: Array<{
      _id: { year: number; month: number };
      revenue: number;
      count: number;
    }>;
    topCustomers: Array<{
      customerName: string;
      totalRevenue: number;
      invoiceCount: number;
    }>;
    paymentMethods: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
    agingAnalysis: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
  };
  payments: {
    paymentStats: {
      totalPayments: number;
      totalAmount: number;
      averagePayment: number;
    };
    monthlyPaymentTrends: Array<{
      _id: { year: number; month: number };
      count: number;
      totalAmount: number;
    }>;
    paymentMethodAnalysis: Array<{
      _id: string;
      count: number;
      totalAmount: number;
      averageAmount: number;
    }>;
    paymentStatusAnalysis: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }>;
  };
  customers: {
    customerStats: {
      totalCustomers: number;
      activeCustomers: number;
      totalOutstanding: number;
    };
    statusDistribution: Array<{
      _id: string;
      count: number;
    }>;
    businessTypeDistribution: Array<{
      _id: string;
      count: number;
      totalRevenue: number;
    }>;
    topOutstandingCustomers: Array<{
      name: string;
      outstandingBalance: number;
      creditLimit: number;
      status: string;
    }>;
    paymentPerformance: Array<{
      name: string;
      averagePaymentTime: number;
      totalInvoiced: number;
      totalPaid: number;
      paymentRate: number;
    }>;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const theme = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await api.get('/analytics/dashboard', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      setData(response.data as DashboardData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      paid: theme.palette.success.main,
      pending: theme.palette.warning.main,
      overdue: theme.palette.error.main,
      draft: theme.palette.grey[500],
      cancelled: theme.palette.grey[400]
    };
    return colors[status as keyof typeof colors] || theme.palette.grey[500];
  };

  const getPaymentMethodColor = (method: string, index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No data available
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={3} 
        mb={4}
        sx={{
          '& > *': {
            flex: '1 1 250px',
            minWidth: '250px'
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ flex: '1 1 250px', minWidth: '250px' }}
        >
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Revenue</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(data.invoices.totalStats.totalRevenue)}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ flex: '1 1 250px', minWidth: '250px' }}
        >
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Invoices</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.invoices.totalStats.totalInvoices)}
                  </Typography>
                </Box>
                <Receipt sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: '1 1 250px', minWidth: '250px' }}
        >
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Payments</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.payments.paymentStats.totalPayments)}
                  </Typography>
                </Box>
                <Payment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ flex: '1 1 250px', minWidth: '250px' }}
        >
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Active Customers</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.customers.customerStats.activeCustomers)}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Charts */}
      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={3}
        sx={{
          '& > *': {
            flex: '1 1 400px',
            minWidth: '400px'
          }
        }}
      >
        {/* Revenue by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ flex: '1 1 400px', minWidth: '400px' }}
        >
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.invoices.revenueByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, totalAmount }) => `${_id}: ${formatCurrency(totalAmount)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalAmount"
                >
                  {data.invoices.revenueByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry._id)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ flex: '1 1 400px', minWidth: '400px' }}
        >
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.payments.paymentMethodAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="totalAmount" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Monthly Revenue Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ flex: '2 1 600px', minWidth: '600px' }}
        >
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.invoices.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(value) => `${value.year}-${value.month.toString().padStart(2, '0')}`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(value) => `${value.year}-${value.month.toString().padStart(2, '0')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={theme.palette.primary.main} 
                  fill={alpha(theme.palette.primary.main, 0.3)} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{ flex: '1 1 300px', minWidth: '300px' }}
        >
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers by Revenue
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {data.invoices.topCustomers.map((customer, index) => (
                <Box key={customer.customerName} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {customer.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      #{index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(customer.totalRevenue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {customer.invoiceCount} invoices
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Aging Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{ flex: '1 1 400px', minWidth: '400px' }}
        >
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Outstanding Invoices Aging
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.invoices.agingAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="totalAmount" fill={theme.palette.error.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Customer Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          style={{ flex: '1 1 400px', minWidth: '400px' }}
        >
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Customer Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.customers.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.customers.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPaymentMethodColor(entry._id, index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
