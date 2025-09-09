import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import { pnlIntegrationService, usePnLIntegration } from '../services/pnlIntegrationService';

interface CostAnalysisDashboardProps {
  title: string;
  subtitle: string;
  emoji: string;
  module: string;
  records: any[];
  dateField: string;
  costField: string;
  loading?: boolean;
  onDataChange?: (data: any) => void;
  enablePnLIntegration?: boolean;
}

interface PeriodCost {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  halfYearly: number;
  yearly: number;
}

const CostAnalysisDashboard: React.FC<CostAnalysisDashboardProps> = ({
  title,
  subtitle,
  emoji,
  module,
  records,
  dateField,
  costField,
  loading = false,
  onDataChange,
  enablePnLIntegration = true
}) => {
  const theme = useTheme();
  const [periodCosts, setPeriodCosts] = useState<PeriodCost>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    quarterly: 0,
    halfYearly: 0,
    yearly: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pnlLinked, setPnlLinked] = useState(false);

  // PnL Integration
  const { notifyDataChange } = usePnLIntegration(module);

  // Memoize the cost calculation to prevent unnecessary recalculations
  const calculatedCosts = useMemo(() => {
    if (records && records.length > 0) {
      return pnlIntegrationService.calculatePeriodCosts(records, dateField, costField);
    }
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      halfYearly: 0,
      yearly: 0
    };
  }, [records, dateField, costField]);

  // Memoize the PnL notification function to prevent infinite loops
  const notifyPnLChange = useCallback(async (costs: any, recordCount: number) => {
    if (!enablePnLIntegration) return;
    
    try {
      // Send to backend with debouncing
      const response = await fetch('/api/pnl/dashboard-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          module,
          costs,
          recordCount
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Dashboard data sent to P&L for ${module}:`, data);
        setPnlLinked(true);
      }
    } catch (error) {
      console.error(`Error sending dashboard data for ${module}:`, error);
    }

    // Also notify P&L integration service
    try {
      await notifyDataChange('calculate', { costs, recordCount });
    } catch (error) {
      console.error('Error notifying P&L integration service:', error);
    }
  }, [module, enablePnLIntegration, notifyDataChange]);

  // Memoize the parent callback to prevent infinite loops
  const handleDataChange = useCallback((costs: any, recordCount: number) => {
    if (onDataChange) {
      onDataChange({ costs, recordCount });
    }
  }, [onDataChange]);

  // Update period costs when calculated costs change
  useEffect(() => {
    setPeriodCosts(calculatedCosts);
  }, [calculatedCosts]);

  // Handle PnL integration and parent callbacks with debouncing
  useEffect(() => {
    if (records && records.length > 0) {
      const recordCount = records.length;
      
      // Debounce the PnL notification to prevent excessive calls
      const timeoutId = setTimeout(() => {
        if (enablePnLIntegration) {
          notifyPnLChange(calculatedCosts, recordCount);
        }
        handleDataChange(calculatedCosts, recordCount);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [calculatedCosts, records, enablePnLIntegration, notifyPnLChange, handleDataChange]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use the memoized costs
    if (records && records.length > 0) {
      setPeriodCosts(calculatedCosts);
      
      if (enablePnLIntegration) {
        try {
          await notifyDataChange('refresh', { costs: calculatedCosts, recordCount: records.length });
        } catch (error) {
          console.error('Error refreshing PnL data:', error);
        }
      }
    }
    
    setIsRefreshing(false);
  }, [records, calculatedCosts, enablePnLIntegration, notifyDataChange]);

  // Period configurations
  const periods = [
    {
      key: 'daily',
      label: 'Daily Cost',
      value: periodCosts.daily,
      color: theme.palette.info.main,
      emoji: '📅',
      description: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    {
      key: 'weekly',
      label: 'Weekly Cost',
      value: periodCosts.weekly,
      color: theme.palette.success.main,
      emoji: '📊',
      description: 'Current Week'
    },
    {
      key: 'monthly',
      label: 'Monthly Cost',
      value: periodCosts.monthly,
      color: theme.palette.warning.main,
      emoji: '📆',
      description: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    {
      key: 'quarterly',
      label: 'Quarterly Cost',
      value: periodCosts.quarterly,
      color: theme.palette.secondary.main,
      emoji: '📈',
      description: `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`
    },
    {
      key: 'halfYearly',
      label: 'Half-Yearly Cost',
      value: periodCosts.halfYearly,
      color: theme.palette.error.main,
      emoji: '📊',
      description: `H${Math.floor(new Date().getMonth() / 6) + 1} ${new Date().getFullYear()}`
    },
    {
      key: 'yearly',
      label: 'Financial Year Cost',
      value: periodCosts.yearly,
      color: theme.palette.primary.main,
      emoji: '🗓️',
      description: `FY ${new Date().getFullYear()} (Apr 1 - Mar 31)`
    }
  ];

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, mt: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress size={60} />
        </Box>
      </Paper>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mt: 3, 
            background: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: theme.shape.borderRadius,
            position: 'relative'
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}
              >
                {emoji} {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* P&L Integration Status */}
              {enablePnLIntegration && (
                <Tooltip title={pnlLinked ? "Linked to P&L Statement" : "P&L Integration Available"}>
                  <Chip
                    icon={<LinkIcon />}
                    label={pnlLinked ? "P&L Linked" : "P&L Ready"}
                    color={pnlLinked ? "success" : "default"}
                    variant={pnlLinked ? "filled" : "outlined"}
                    size="small"
                  />
                </Tooltip>
              )}
              
              {/* Refresh Button */}
              <Tooltip title="Refresh Cost Analysis">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Cost Cards Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {periods.map((periodData, index) => (
              <motion.div
                key={periodData.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: `linear-gradient(135deg, ${alpha(periodData.color, 0.1)} 0%, ${alpha(periodData.color, 0.05)} 100%)`,
                    border: `2px solid ${alpha(periodData.color, 0.3)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(periodData.color, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: periodData.color, width: 40, height: 40, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {periodData.emoji}
                        </Typography>
                      </Avatar>
                      <Typography variant="h6" sx={{ color: periodData.color, fontWeight: 600 }}>
                        {periodData.label}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: periodData.color }}>
                      {periodData.value.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {periodData.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>

          {/* Summary Information */}
          <Box sx={{ mt: 3, p: 2, background: alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Records:</strong> {records.length.toLocaleString()} • 
              <strong> Total Annual Cost:</strong> {periodCosts.yearly.toLocaleString(undefined, { style: 'currency', currency: 'KWD' })} • 
              <strong> Module:</strong> {module.toUpperCase()}
              {enablePnLIntegration && (
                <>
                  {' • '}
                  <strong style={{ color: theme.palette.success.main }}>P&L Integration Active</strong>
                </>
              )}
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

export default CostAnalysisDashboard;
