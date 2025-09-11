import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const BudgetsPage: React.FC = () => {
  const theme = useTheme();

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
                    <AccountBalanceIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Budget Management
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Select a budget category to manage your financial planning
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

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3, textAlign: 'center' }}>
              📊 Budget Management Dashboard
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', maxWidth: 800, mx: 'auto', mb: 4 }}>
              Welcome to the Budget Management system. This page is ready for additional budget-related content and features.
              Use the Budget Databases section to access specific budget modules for detailed management.
            </Typography>
            
            {/* Placeholder for future content */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 200,
              background: alpha(theme.palette.primary.main, 0.05),
              borderRadius: theme.shape.borderRadius,
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, opacity: 0.7 }}>
                Content area ready for additional features
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default BudgetsPage; 