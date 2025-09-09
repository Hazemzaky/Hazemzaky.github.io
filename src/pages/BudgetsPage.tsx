import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Percent as PercentIcon,
  RealEstateAgent as RealEstateAgentIcon,
  LocalShipping as LocalShippingIcon,
  WaterDrop as WaterDropIcon,
  CarRental as CarRentalIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AddBusiness as AddBusinessIcon,
  Badge as BadgeIcon,
  Bolt as BoltIcon,
  Dataset as DatasetIcon,
  Computer as ComputerIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Budget sub-pages configuration
const budgetPages = [
  {
    id: 'assumptions',
    title: 'Budget Assumptions',
    description: 'Configure budget parameters and assumptions',
    icon: '📊',
    color: '#1976d2',
    route: '/budget/assumptions'
  },
  {
    id: 'summary',
    title: 'Summary',
    description: 'Budget overview and summary reports',
    icon: '📈',
    color: '#388e3c',
    route: '/budget/summary'
  },
  {
    id: 'variance',
    title: 'Variance',
    description: 'Budget vs actual variance analysis',
    icon: '📊',
    color: '#f57c00',
    route: '/budget/variance'
  },
  {
    id: 'sales',
    title: 'Sales',
    description: 'Sales budget and forecasting',
    icon: '🏠',
    color: '#7b1fa2',
    route: '/budget/sales'
  },
  {
    id: 'logistics',
    title: 'Logistics Cost',
    description: 'Logistics and transportation costs',
    icon: '🚚',
    color: '#d32f2f',
    route: '/budget/logistics'
  },
  {
    id: 'water',
    title: 'Water Cost Sale',
    description: 'Water sales and cost management',
    icon: '💧',
    color: '#0288d1',
    route: '/budget/water'
  },
  {
    id: 'rental',
    title: 'Rental Equipment',
    description: 'Equipment rental costs and management',
    icon: '🚗',
    color: '#5d4037',
    route: '/budget/rental'
  },
  {
    id: 'ga',
    title: 'G&A',
    description: 'General and administrative expenses',
    icon: '👨‍💼',
    color: '#455a64',
    route: '/budget/ga'
  },
  {
    id: 'opex',
    title: 'OPEX',
    description: 'Operating expenses management',
    icon: '🏢',
    color: '#e91e63',
    route: '/budget/opex'
  },
  {
    id: 'it-opex',
    title: 'IT OPEX',
    description: 'IT services and vendor management',
    icon: '💻',
    color: '#ff5722',
    route: '/budget/it-opex'
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'Staff costs and payroll budgeting',
    icon: '🎖️',
    color: '#ff9800',
    route: '/budget/staffing'
  },
  {
    id: 'manpower',
    title: 'Manpower',
    description: 'Manpower planning and costs',
    icon: '⚡',
    color: '#9c27b0',
    route: '/budget/manpower'
  },
  {
    id: 'capex',
    title: 'CAPEX',
    description: 'Capital expenditure planning',
    icon: '📊',
    color: '#607d8b',
    route: '/budget/capex'
  },
  {
    id: 'others',
    title: 'Others',
    description: 'Other budget categories and miscellaneous items',
    icon: '🔀',
    color: '#795548',
    route: '/budget/others'
  }
];

const BudgetsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

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

        {/* Budget Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 3,
                p: 2
              }}
            >
              {budgetPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${alpha(page.color, 0.1)} 0%, ${alpha(page.color, 0.05)} 100%)`,
                      border: `2px solid ${alpha(page.color, 0.3)}`,
                      borderRadius: theme.shape.borderRadius,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(page.color, 0.2)} 0%, ${alpha(page.color, 0.1)} 100%)`,
                        border: `2px solid ${alpha(page.color, 0.5)}`,
                        boxShadow: `0 8px 25px ${alpha(page.color, 0.3)}`,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleCardClick(page.route)}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: page.color,
                          fontSize: '2rem'
                        }}
                      >
                        {page.icon}
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: page.color,
                          mb: 1
                        }}
                      >
                        {page.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          lineHeight: 1.5
                        }}
                      >
                        {page.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Container>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default BudgetsPage; 