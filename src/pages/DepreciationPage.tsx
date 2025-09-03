import React, { useEffect, useMemo, useState } from 'react';
import api from '../apiBase';
import {
  Box, Button, Card, CardContent, Typography, Paper, TextField, MenuItem, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, LinearProgress, useTheme, alpha, Avatar, Badge, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { getExportFileName, addExportHeader, addPrintHeader } from '../utils/userUtils';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

interface Asset {
  _id: string;
  description: string;
  type: string;
  brand: string;
  purchaseDate: string;
  purchaseValue: number;
  usefulLifeMonths: number;
  salvageValue: number;
  status: string;
  chassisNumber?: string;
  plateNumber?: string;
  serialNumber?: string;
  fleetNumber?: string;
  serial?: string; // Added serial/document number
}

interface Depreciation {
  _id: string;
  asset: { _id: string; description: string } | string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

const DepreciationDashboard: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [depreciation, setDepreciation] = useState<Depreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetDetailOpen, setAssetDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assetsRes, depreciationRes] = await Promise.all([
        api.get<Asset[]>('/assets'),
        api.get<Depreciation[]>('/depreciation')
      ]);
      setAssets(assetsRes.data);
      setDepreciation(depreciationRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily depreciation for an asset
  const calculateDailyDepreciation = (asset: Asset) => {
    if (!asset.purchaseValue || !asset.salvageValue || !asset.usefulLifeMonths) return 0;
    const totalDepreciableValue = asset.purchaseValue - asset.salvageValue;
    const usefulLifeDays = asset.usefulLifeMonths * 30; // Approximate days
    return totalDepreciableValue / usefulLifeDays;
  };

  // Calculate book value as of a specific date
  const calculateBookValue = (asset: Asset, asOfDate?: Date) => {
    if (!asset.purchaseDate || !asset.purchaseValue) return asset.purchaseValue || 0;
    
    const purchaseDate = new Date(asset.purchaseDate);
    const targetDate = asOfDate || new Date();
    
    if (targetDate < purchaseDate) return asset.purchaseValue;
    
    const daysSincePurchase = Math.floor((targetDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyDepreciation = calculateDailyDepreciation(asset);
    const totalDepreciation = dailyDepreciation * daysSincePurchase;
    
    return Math.max(asset.salvageValue || 0, asset.purchaseValue - totalDepreciation);
  };

  // Calculate depreciation percentage
  const calculateDepreciationPercentage = (asset: Asset) => {
    const bookValue = calculateBookValue(asset);
    const totalDepreciableValue = asset.purchaseValue - asset.salvageValue;
    return totalDepreciableValue > 0 ? ((asset.purchaseValue - bookValue) / totalDepreciableValue) * 100 : 0;
  };

  // Calculate remaining useful life in months
  const calculateRemainingLife = (asset: Asset) => {
    const depreciationPercentage = calculateDepreciationPercentage(asset);
    const usedLife = (depreciationPercentage / 100) * asset.usefulLifeMonths;
    return Math.max(0, asset.usefulLifeMonths - usedLife);
  };

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (filterType && a.type !== filterType) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (dateFrom && new Date(a.purchaseDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(a.purchaseDate) > new Date(dateTo)) return false;
      return true;
    });
  }, [assets, filterType, filterStatus, dateFrom, dateTo]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const totalPurchaseValue = filteredAssets.reduce((sum, a) => sum + a.purchaseValue, 0);
    const totalBookValue = filteredAssets.reduce((sum, a) => sum + calculateBookValue(a), 0);
    const totalDepreciation = totalPurchaseValue - totalBookValue;
    const averageDepreciationRate = totalPurchaseValue > 0 ? (totalDepreciation / totalPurchaseValue) * 100 : 0;
    
    const fullyDepreciated = filteredAssets.filter(a => calculateBookValue(a) <= a.salvageValue).length;
    const partiallyDepreciated = filteredAssets.filter(a => {
      const bookValue = calculateBookValue(a);
      return bookValue > a.salvageValue && bookValue < a.purchaseValue;
    }).length;
    const notDepreciated = filteredAssets.filter(a => calculateBookValue(a) >= a.purchaseValue).length;

    return {
      totalAssets,
      totalPurchaseValue,
      totalBookValue,
      totalDepreciation,
      averageDepreciationRate,
      fullyDepreciated,
      partiallyDepreciated,
      notDepreciated
    };
  }, [filteredAssets]);

  // Chart data
  const depreciationByType = useMemo(() => {
    const map: Record<string, { purchaseValue: number; bookValue: number; depreciation: number }> = {};
    filteredAssets.forEach(a => {
      if (!map[a.type]) map[a.type] = { purchaseValue: 0, bookValue: 0, depreciation: 0 };
      const bookValue = calculateBookValue(a);
      map[a.type].purchaseValue += a.purchaseValue;
      map[a.type].bookValue += bookValue;
      map[a.type].depreciation += a.purchaseValue - bookValue;
    });
    return Object.entries(map).map(([type, data]) => ({ type, ...data }));
  }, [filteredAssets]);

  const depreciationTrend = useMemo(() => {
    const months = 12;
    const trend = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthTotal = filteredAssets.reduce((sum, a) => {
        const bookValue = calculateBookValue(a, date);
        return sum + (a.purchaseValue - bookValue);
      }, 0);
      trend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        depreciation: monthTotal
      });
    }
    return trend;
  }, [filteredAssets]);

  const assetLifecycleData = useMemo(() => {
    return filteredAssets.map(a => ({
      name: a.description,
      purchaseValue: a.purchaseValue,
      bookValue: calculateBookValue(a),
      depreciationPercentage: calculateDepreciationPercentage(a),
      remainingLife: calculateRemainingLife(a)
    }));
  }, [filteredAssets]);

  // Export comprehensive CSV
  const handleExportCSV = () => {
    const exportDate = new Date();
    const headers = [
      'Asset Description', 'Serial Number', 'Type', 'Brand', 'Purchase Date', 'Purchase Value', 
      'Book Value as of Export', 'Total Depreciation', 'Depreciation %', 
      'Remaining Life (months)', 'Daily Depreciation', 'Status'
    ];
    const rows = filteredAssets.map(a => [
      a.description,
      a.serial || a.serialNumber || '-', // Serial/document number
      a.type,
      a.brand,
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      a.purchaseValue,
      calculateBookValue(a, exportDate).toFixed(2),
      (a.purchaseValue - calculateBookValue(a, exportDate)).toFixed(2),
      calculateDepreciationPercentage(a).toFixed(2) + '%',
      calculateRemainingLife(a).toFixed(1),
      calculateDailyDepreciation(a).toFixed(2),
      a.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const csvWithHeader = addExportHeader(csv, 'Depreciation Dashboard');
    const blob = new Blob([csvWithHeader], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFileName('depreciation_dashboard');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printHeader = addPrintHeader('Depreciation Dashboard');
    const printContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Depreciation Dashboard Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printHeader}
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAssetDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetDetailOpen(true);
  };

  const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#6d4c41', '#0288d1'];

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssessmentIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Depreciation Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Comprehensive asset depreciation analysis and reporting
                  </Typography>
                </Box>
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
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
            {[
              {
                title: 'Total Assets',
                value: kpis.totalAssets,
                subtitle: 'Depreciable Assets',
                icon: <InventoryIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Total Purchase Value',
                value: kpis.totalPurchaseValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                subtitle: 'Original Cost',
                icon: <AttachMoneyIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1)
              },
              {
                title: 'Total Book Value',
                value: kpis.totalBookValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                subtitle: 'Current Value',
                icon: <TrendingUpIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'Total Depreciation',
                value: kpis.totalDepreciation.toLocaleString(undefined, { style: 'currency', currency: 'KWD' }),
                subtitle: `${kpis.averageDepreciationRate.toFixed(1)}% of Purchase Value`,
                icon: <TrendingDownIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    flex: '1 1 250px', 
                    minWidth: 250,
                    background: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(card.color, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 40, height: 40, mr: 1 }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: card.color, mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: card.color, opacity: 0.8 }}>
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Asset Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
            {[
              {
                title: 'Fully Depreciated',
                value: kpis.fullyDepreciated,
                subtitle: 'Assets at salvage value',
                icon: <TrendingDownIcon />,
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1)
              },
              {
                title: 'Partially Depreciated',
                value: kpis.partiallyDepreciated,
                subtitle: 'Assets in depreciation period',
                icon: <TrendingUpIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Not Depreciated',
                value: kpis.notDepreciated,
                subtitle: 'New or recently acquired',
                icon: <TrendingUpIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    flex: '1 1 300px', 
                    minWidth: 300,
                    background: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${alpha(card.color, 0.2)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 40, height: 40, mr: 1 }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: card.color, mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: card.color, opacity: 0.8 }}>
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 3 }}>
              🔍 Filters & Export Options
            </Typography>
            
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField 
                select 
                label="Asset Type" 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)} 
                sx={{ minWidth: 180 }}
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                {Array.from(new Set(assets.map(a => a.type))).map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <TextField 
                select 
                label="Status" 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                sx={{ minWidth: 180 }}
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Array.from(new Set(assets.map(a => a.status))).map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <TextField 
                label="From Date" 
                type="date" 
                value={dateFrom} 
                onChange={e => setDateFrom(e.target.value)} 
                sx={{ minWidth: 160 }} 
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField 
                label="To Date" 
                type="date" 
                value={dateTo} 
                onChange={e => setDateTo(e.target.value)} 
                sx={{ minWidth: 160 }} 
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button 
                variant="outlined" 
                startIcon={<SaveAltIcon />} 
                onClick={handleExportCSV}
                sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
              >
                Export CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                onClick={handlePrint}
                sx={{ borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main }}
              >
                Print
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Box display="flex" flexDirection="column" gap={3} mb={3}>
            {/* Charts Row 1 */}
            <Box display="flex" gap={3} flexWrap="wrap">
              {/* Depreciation by Type */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4 }}
              >
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 300, 
                    flex: '1 1 400px', 
                    minWidth: 400,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    📊 Depreciation by Asset Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={depreciationByType}>
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="purchaseValue" fill={theme.palette.primary.main} name="Purchase Value" />
                      <Bar dataKey="bookValue" fill={theme.palette.success.main} name="Book Value" />
                      <Bar dataKey="depreciation" fill={theme.palette.error.main} name="Depreciation" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </motion.div>

              {/* Depreciation Trend */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.6 }}
              >
                <Paper 
                  sx={{ 
                    p: 2, 
                    height: 300, 
                    flex: '1 1 400px', 
                    minWidth: 400,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    📈 Depreciation Trend (Last 12 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={depreciationTrend}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="depreciation" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </motion.div>
            </Box>

            {/* Asset Lifecycle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.8 }}
            >
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 400,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  🔄 Asset Lifecycle Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={assetLifecycleData.slice(0, 10)}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="purchaseValue" fill={theme.palette.primary.main} name="Purchase Value" />
                    <Bar dataKey="bookValue" fill={theme.palette.success.main} name="Book Value" />
                    <Line type="monotone" dataKey="depreciationPercentage" stroke={theme.palette.error.main} name="Depreciation %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Box>
        </motion.div>

        {/* Assets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              overflowX: 'auto',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 3 }}>
              📋 Asset Depreciation Details
            </Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Asset</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Serial Number</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Purchase Value</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Book Value</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Depreciation</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Depreciation %</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Remaining Life</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Daily Depreciation</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: 8, borderBottom: '2px solid #eee', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => {
                  const bookValue = calculateBookValue(asset);
                  const depreciationAmount = asset.purchaseValue - bookValue;
                  const depreciationPercentage = calculateDepreciationPercentage(asset);
                  const remainingLife = calculateRemainingLife(asset);
                  const dailyDepreciation = calculateDailyDepreciation(asset);
                  
                  let statusColor = 'success';
                  if (bookValue <= asset.salvageValue) statusColor = 'error';
                  else if (depreciationPercentage > 50) statusColor = 'warning';
                  
                  return (
                    <tr key={asset._id} style={{ 
                      background: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.background.paper, 0.8)
                    }}>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee', color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleAssetDetail(asset)}>
                        {asset.description}
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset.serial || asset.serialNumber || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset.type}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{asset.purchaseValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{bookValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{depreciationAmount.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 60, height: 8, bgcolor: alpha(theme.palette.divider, 0.3), borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ 
                              width: `${depreciationPercentage}%`, 
                              height: 8, 
                              bgcolor: statusColor === 'error' ? theme.palette.error.main : statusColor === 'warning' ? theme.palette.warning.main : theme.palette.primary.main 
                            }} />
                          </Box>
                          <Typography variant="caption">{depreciationPercentage.toFixed(1)}%</Typography>
                        </Box>
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{remainingLife.toFixed(1)} months</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{dailyDepreciation.toFixed(2)}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <Chip 
                          label={bookValue <= asset.salvageValue ? 'Fully Depreciated' : depreciationPercentage > 50 ? 'Partially Depreciated' : 'Not Depreciated'} 
                          color={statusColor as any} 
                          size="small" 
                          variant="outlined"
                        />
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleAssetDetail(asset)}
                          sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                              borderColor: theme.palette.primary.dark,
                              color: theme.palette.primary.dark,
                            }
                          }}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && <Typography align="center" sx={{ mt: 2 }}>Loading...</Typography>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Asset Detail Dialog */}
      <Dialog 
        open={assetDetailOpen} 
        onClose={() => setAssetDetailOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: theme.shadows[24]
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.light, 0.1)} 100%)`,
            color: theme.palette.info.main,
            borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Asset Depreciation Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Comprehensive depreciation analysis
              </Typography>
            </Box>
          </Box>
          
          {/* Decorative background elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: alpha(theme.palette.info.main, 0.1),
            zIndex: 1
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -15, 
            left: -15, 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: alpha(theme.palette.info.light, 0.08),
            zIndex: 1
          }} />
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2, p: 3 }}>
          {selectedAsset && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 3 }}>
                {selectedAsset.description}
              </Typography>
              
              <Box display="flex" gap={3} flexWrap="wrap" sx={{ mb: 3 }}>
                {/* Asset Information Section */}
                <Box sx={{ 
                  flex: '1 1 300px', 
                  minWidth: 300,
                  p: 2,
                  background: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                    📋 Asset Information
                  </Typography>
                  <Typography sx={{ mb: 1 }}>Type: {selectedAsset.type}</Typography>
                  <Typography sx={{ mb: 1 }}>Brand: {selectedAsset.brand}</Typography>
                  <Typography sx={{ mb: 1 }}>Purchase Date: {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : '-'}</Typography>
                  <Typography sx={{ mb: 1 }}>Useful Life: {selectedAsset.usefulLifeMonths} months</Typography>
                  <Typography sx={{ mb: 1 }}>Salvage Value: {selectedAsset.salvageValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                </Box>
                
                {/* Depreciation Analysis Section */}
                <Box sx={{ 
                  flex: '1 1 300px', 
                  minWidth: 300,
                  p: 2,
                  background: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                    📊 Depreciation Analysis
                  </Typography>
                  <Typography sx={{ mb: 1 }}>Purchase Value: {selectedAsset.purchaseValue.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                  <Typography sx={{ mb: 1 }}>Current Book Value: {calculateBookValue(selectedAsset).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                  <Typography sx={{ mb: 1 }}>Total Depreciation: {(selectedAsset.purchaseValue - calculateBookValue(selectedAsset)).toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}</Typography>
                  <Typography sx={{ mb: 1 }}>Depreciation %: {calculateDepreciationPercentage(selectedAsset).toFixed(1)}%</Typography>
                  <Typography sx={{ mb: 1 }}>Remaining Life: {calculateRemainingLife(selectedAsset).toFixed(1)} months</Typography>
                  <Typography sx={{ mb: 1 }}>Daily Depreciation: {calculateDailyDepreciation(selectedAsset).toFixed(2)}</Typography>
                </Box>
              </Box>
              
              {/* Depreciation Progress Section */}
              <Box sx={{ 
                p: 2,
                background: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                  📈 Depreciation Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateDepreciationPercentage(selectedAsset)} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: alpha(theme.palette.divider, 0.3),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: calculateBookValue(selectedAsset) <= selectedAsset.salvageValue ? theme.palette.error.main : theme.palette.primary.main
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: theme.palette.text.secondary }}>
                  {calculateDepreciationPercentage(selectedAsset).toFixed(1)}% Complete
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }}
        >
          <Button 
            onClick={() => setAssetDetailOpen(false)}
            variant="outlined"
            sx={{
              borderColor: theme.palette.text.secondary,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                color: theme.palette.text.primary,
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={<span style={{ display: 'flex', alignItems: 'center' }}><span role="img" aria-label="success" style={{ marginRight: 8 }}>✅</span>{success}</span>}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default DepreciationDashboard; 
