import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  useTheme, 
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  trendLabel?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  statusLabel?: string;
  onClick?: () => void;
  loading?: boolean;
  info?: string;
  metric?: string;
  target?: number;
  current?: number;
  showProgress?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue,
  trendLabel,
  status,
  statusLabel,
  onClick,
  loading = false,
  info,
  metric,
  target,
  current,
  showProgress = false
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
      case 'stable':
        return <TrendingFlatIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return theme.palette.text.secondary;
    
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      case 'stable':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusColor = () => {
    if (!status) return theme.palette.text.secondary;
    
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getProgressColor = () => {
    if (!current || !target) return theme.palette.primary.main;
    
    const percentage = (current / target) * 100;
    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getProgressValue = () => {
    if (!current || !target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        elevation={0}
        onClick={onClick}
        sx={{
          height: '100%',
          background: color ? alpha(color, 0.05) : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${color ? alpha(color, 0.2) : alpha(theme.palette.divider, 0.2)}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${color ? alpha(color, 0.2) : alpha(theme.palette.divider, 0.2)}`,
            borderColor: color || theme.palette.primary.main
          }
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {icon && (
                <Avatar 
                  sx={{ 
                    bgcolor: color || theme.palette.primary.main, 
                    width: 48, 
                    height: 48,
                    boxShadow: `0 4px 12px ${alpha(color || theme.palette.primary.main, 0.3)}`
                  }}
                >
                  {icon}
                </Avatar>
              )}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: color || theme.palette.text.primary }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {info && (
                <Tooltip title={info}>
                  <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {status && statusLabel && (
                <Chip
                  label={statusLabel}
                  size="small"
                  color={status}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Box>
          </Box>

          {/* Main Value */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: color || theme.palette.text.primary,
                textAlign: 'center',
                mb: 1
              }}
            >
              {loading ? '...' : value}
            </Typography>
            {metric && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {metric}
              </Typography>
            )}
          </Box>

          {/* Trend Information */}
          {(trend || trendValue !== undefined) && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1, 
              mb: 2,
              p: 1.5,
              background: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
              {getTrendIcon()}
              {trendValue !== undefined && (
                <Typography variant="body2" sx={{ color: getTrendColor(), fontWeight: 600 }}>
                  {trendValue > 0 ? '+' : ''}{trendValue}%
                </Typography>
              )}
              {trendLabel && (
                <Typography variant="body2" color="text.secondary">
                  {trendLabel}
                </Typography>
              )}
            </Box>
          )}

          {/* Progress Bar */}
          {showProgress && current !== undefined && target !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body2" sx={{ color: getProgressColor(), fontWeight: 600 }}>
                  {getProgressValue().toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ 
                width: '100%', 
                height: 8, 
                background: alpha(theme.palette.divider, 0.3),
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressValue()}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: getProgressColor(),
                    borderRadius: 4
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Current: {current}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: {target}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>

        {/* Decorative background elements */}
        {color && (
          <>
            <Box sx={{ 
              position: 'absolute', 
              top: -30, 
              right: -30, 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              background: alpha(color, 0.05),
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -20, 
              left: -20, 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: alpha(color, 0.03),
              zIndex: 1
            }} />
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default MetricsCard; 