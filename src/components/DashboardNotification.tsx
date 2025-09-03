import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  useTheme, 
  alpha, 
  Slide, 
  Fade,
  Chip,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp?: Date;
  onClose?: () => void;
  show?: boolean;
  trend?: 'up' | 'down' | 'stable';
  metric?: string;
  value?: number;
  previousValue?: number;
}

const DashboardNotification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  timestamp,
  onClose,
  show = true,
  trend,
  metric,
  value,
  previousValue
}) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getBackgroundColor = () => {
    return alpha(getColor(), 0.1);
  };

  const getBorderColor = () => {
    return alpha(getColor(), 0.3);
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
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
      default:
        return theme.palette.text.secondary;
    }
  };

  const calculateChange = () => {
    if (!value || !previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change;
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Box
          sx={{
            background: getBackgroundColor(),
            border: `1px solid ${getBorderColor()}`,
            borderRadius: 3,
            p: 3,
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(getColor(), 0.2)}`,
              borderColor: getColor()
            }
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: getColor(), width: 40, height: 40 }}>
                {getIcon()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: getColor() }}>
                  {title}
                </Typography>
                {timestamp && (
                  <Typography variant="body2" color="text.secondary">
                    {timestamp.toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
            {onClose && (
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ 
                  color: getColor(),
                  '&:hover': { bgcolor: alpha(getColor(), 0.1) }
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {/* Message */}
          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary }}>
            {message}
          </Typography>

          {/* Metrics and Trends */}
          {(trend || metric || value !== undefined) && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 2, 
              background: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTrendIcon()}
                  <Typography variant="body2" sx={{ color: getTrendColor(), fontWeight: 500 }}>
                    {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                  </Typography>
                </Box>
              )}
              
              {metric && value !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {metric}:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: getColor() }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </Typography>
                </Box>
              )}

              {value !== undefined && previousValue !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${calculateChange()! > 0 ? '+' : ''}${calculateChange()!.toFixed(1)}%`}
                    size="small"
                    color={calculateChange()! > 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Decorative background elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: alpha(getColor(), 0.05),
            zIndex: 0
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -15, 
            left: -15, 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: alpha(getColor(), 0.03),
            zIndex: 0
          }} />
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardNotification; 