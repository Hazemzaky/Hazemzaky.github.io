import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Avatar, useTheme, alpha, Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Build as BuildIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MoneyIcon,
  Storage as StorageIcon,
  Water as WaterIcon,
  LocalShipping as LogisticsIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  Engineering as EngineeringIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BudgetDatabases: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const pageColor = '#1976d2';

  const budgetModules = [
    {
      id: 'revenue',
      title: 'Revenue Database',
      description: 'Manage sales budgets and revenue forecasting by quarters',
      icon: <TrendingUpIcon />,
      color: '#7b1fa2',
      route: '/budget-revenue-database',
      features: ['Sales Budgets', 'Quarterly Forecasting', 'Revenue Streams']
    },
    {
      id: 'opex',
      title: 'OPEX Database',
      description: 'Plan and forecast operating expenses and service agreements',
      icon: <TrendingDownIcon />,
      color: '#e91e63',
      route: '/budget-opex-database',
      features: ['Service Agreements', 'Vendor Management', 'Cost Planning']
    },
    {
      id: 'manpower',
      title: 'Manpower Database',
      description: 'Manage employee costs, salaries, and benefits by department',
      icon: <PeopleIcon />,
      color: '#9c27b0',
      route: '/budget-manpower-database',
      features: ['Employee Costs', 'Salary Planning', 'Benefits Management']
    },
    {
      id: 'staffing',
      title: 'Staffing Database',
      description: 'Plan and manage staff costs and quarterly budgets',
      icon: <BusinessIcon />,
      color: '#ff9800',
      route: '/budget-staffing-database',
      features: ['Staff Costs', 'Quarterly Budgets', 'Cost Analysis']
    },
    {
      id: 'ga',
      title: 'G&A Database',
      description: 'Plan and forecast general and administrative expenses',
      icon: <AssessmentIcon />,
      color: '#455a64',
      route: '/budget-ga-database',
      features: ['Administrative Costs', 'General Expenses', 'Quarterly Planning']
    },
    {
      id: 'capex',
      title: 'CAPEX Database',
      description: 'Plan and manage capital expenditures and asset acquisitions',
      icon: <BuildIcon />,
      color: '#607d8b',
      route: '/budget-capex-database',
      features: ['Capital Expenditures', 'Asset Management', 'Depreciation Planning']
    },
    {
      id: 'assumptions',
      title: 'Assumptions Database',
      description: 'Configure budget parameters and assumptions',
      icon: <SettingsIcon />,
      color: '#1976d2',
      route: '/budget-assumptions-database',
      features: ['Budget Parameters', 'Assumptions', 'Configuration']
    },
    {
      id: 'loans',
      title: 'Loans Database',
      description: 'Manage loan budgets and financial obligations',
      icon: <AccountBalanceIcon />,
      color: '#795548',
      route: '/budget-loans-database',
      features: ['Loan Management', 'Financial Obligations', 'Payment Planning']
    },
    {
      id: 'contracts',
      title: 'Contracts Database',
      description: 'Plan and manage contract budgets and agreements',
      icon: <EngineeringIcon />,
      color: '#ff5722',
      route: '/budget-contracts-database',
      features: ['Contract Budgets', 'Agreement Management', 'Cost Tracking']
    },
    {
      id: 'it-opex',
      title: 'IT OPEX Database',
      description: 'Manage IT operating expenses and technology costs',
      icon: <SpeedIcon />,
      color: '#3f51b5',
      route: '/budget-it-opex-database',
      features: ['IT Expenses', 'Technology Costs', 'Software Licenses']
    },
    {
      id: 'logistics',
      title: 'Logistics Database',
      description: 'Plan and manage logistics and transportation costs',
      icon: <LogisticsIcon />,
      color: '#009688',
      route: '/budget-logistics-database',
      features: ['Transportation', 'Logistics Costs', 'Supply Chain']
    },
    {
      id: 'water',
      title: 'Water Database',
      description: 'Manage water costs and utility expenses',
      icon: <WaterIcon />,
      color: '#00bcd4',
      route: '/budget-water-database',
      features: ['Water Costs', 'Utility Expenses', 'Consumption Tracking']
    },
    {
      id: 'rental',
      title: 'Rental Database',
      description: 'Plan and manage rental equipment and facility costs',
      icon: <HomeIcon />,
      color: '#8bc34a',
      route: '/budget-rental-database',
      features: ['Equipment Rental', 'Facility Costs', 'Lease Management']
    },
    {
      id: 'others',
      title: 'Others Database',
      description: 'Manage miscellaneous and other budget categories',
      icon: <StorageIcon />,
      color: '#9e9e9e',
      route: '/budget-others-database',
      features: ['Miscellaneous Costs', 'Other Categories', 'General Budget']
    },
    {
      id: 'variance',
      title: 'Variance Database',
      description: 'Analyze budget variances and performance metrics',
      icon: <AnalyticsIcon />,
      color: '#673ab7',
      route: '/budget-variance-database',
      features: ['Variance Analysis', 'Performance Metrics', 'Budget Tracking']
    }
  ];

  const handleModuleClick = (route: string) => {
    navigate(route);
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(pageColor, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
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
              p: 4, 
              mb: 4, 
              background: `linear-gradient(135deg, ${pageColor} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: theme.shape.borderRadius,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 80, height: 80, mr: 3 }}>
                  <StorageIcon sx={{ fontSize: '3rem' }} />
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    Budget Databases
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
                    Comprehensive budget management system with specialized databases for all financial planning needs
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Decorative background elements */}
            <Box sx={{ 
              position: 'absolute', 
              top: -100, 
              right: -100, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -50, 
              left: -50, 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.08)',
              zIndex: 1
            }} />
          </Paper>
        </motion.div>

        {/* Budget Modules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}>
            {budgetModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: alpha(module.color, 0.05),
                    border: `2px solid ${alpha(module.color, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 30px ${alpha(module.color, 0.3)}`,
                      border: `2px solid ${alpha(module.color, 0.4)}`,
                      background: alpha(module.color, 0.08)
                    }
                  }}
                  onClick={() => handleModuleClick(module.route)}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: module.color, width: 50, height: 50, mr: 2 }}>
                        {module.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: module.color, fontWeight: 600, flex: 1 }}>
                        {module.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, flex: 1 }}>
                      {module.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {module.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            bgcolor: alpha(module.color, 0.1),
                            color: module.color,
                            border: `1px solid ${alpha(module.color, 0.3)}`,
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 2,
                        background: `linear-gradient(135deg, ${module.color} 0%, ${alpha(module.color, 0.8)} 100%)`,
                        boxShadow: `0 4px 14px ${alpha(module.color, 0.4)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(module.color, 0.9)} 0%, ${module.color} 100%)`,
                          boxShadow: `0 6px 20px ${alpha(module.color, 0.6)}`,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      Open Database
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mt: 4,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(pageColor, 0.2)}`,
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="h5" sx={{ color: pageColor, fontWeight: 600, mb: 3, textAlign: 'center' }}>
              📊 Comprehensive Budget Management
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
              Our Budget Databases system provides specialized modules for every aspect of financial planning. 
              Each database is designed to handle specific budget categories with advanced features for 
              forecasting, analysis, and reporting. Navigate to any database above to start managing your 
              budget data with precision and efficiency.
            </Typography>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default BudgetDatabases;
