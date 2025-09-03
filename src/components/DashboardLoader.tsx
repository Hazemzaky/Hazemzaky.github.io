import React from 'react';
import { Box, Skeleton, Typography, useTheme, alpha } from '@mui/material';
import { motion, Variants } from 'framer-motion';

const DashboardLoader: React.FC = () => {
  const theme = useTheme();

  const shimmerVariants: Variants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 1.5,
          ease: 'easeInOut',
        },
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ 
          height: 120, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={24} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </Box>
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
              transform: 'skewX(-20deg)',
            }}
          />
        </Box>
      </motion.div>

      {/* Action Center Skeleton */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ 
          height: 200, 
          background: alpha(theme.palette.warning.main, 0.05),
          borderRadius: 3,
          mb: 3,
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" width="30%" height={32} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Skeleton variant="text" width="80%" height={48} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto' }} />
              </Box>
            ))}
          </Box>
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.warning.main, 0.1)}, transparent)`,
              transform: 'skewX(-20deg)',
            }}
          />
        </Box>
      </motion.div>

      {/* Financial Section Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Box sx={{ 
          height: 200, 
          background: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 3,
          mb: 3,
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Box>
                <Skeleton variant="text" width="80%" height={40} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto' }} />
              </Box>
            ))}
          </Box>
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
              transform: 'skewX(-20deg)',
            }}
          />
        </Box>
      </motion.div>

      {/* Module KPIs Grid Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3, mb: 4 }}>
          {[...Array(8)].map((_, i) => (
            <Box key={i} sx={{ height: 200 }}>
              <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 3 }} />
            </Box>
          ))}
        </Box>
      </motion.div>

      {/* Charts Section Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(800px, 1fr))', gap: 3, mb: 4 }}>
          {[...Array(2)].map((_, i) => (
            <Box key={i} sx={{ height: 400 }}>
              <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 3 }} />
            </Box>
          ))}
        </Box>
      </motion.div>

      {/* Performance Metrics Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <Box sx={{ 
          height: 200, 
          background: alpha(theme.palette.info.main, 0.05),
          borderRadius: 3,
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="25%" height={32} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Skeleton variant="text" width="25%" height={20} />
                    <Skeleton variant="text" width="20%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
              </Box>
            ))}
          </Box>
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.info.main, 0.1)}, transparent)`,
              transform: 'skewX(-20deg)',
            }}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default DashboardLoader; 