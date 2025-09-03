import React, { useRef, useEffect, useState, useContext, createContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Tooltip, 
  IconButton, 
  Typography,
  useTheme,
  alpha,
  Paper,
  Divider,
  Badge,
  Chip,
  Container,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Star as StarIcon,
  Layers as LayersIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  AccountTree as AccountTreeIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MonetizationOnIcon,
  Engineering as EngineeringIcon,
  Storefront as StorefrontIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

// Theme context for dark mode toggle
export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// Enhanced navigation structure
const navStructure = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    color: theme.palette.primary.main
  },
  {
    label: 'Budgets',
    path: '/budgets',
    icon: <AssessmentIcon />,
    color: theme.palette.secondary.main
  },
  {
    label: 'Accounting',
    icon: <AccountBalanceIcon />,
    color: theme.palette.info.main,
    children: [
      { label: 'Chart of Accounts', path: '/accounts' },
      { label: 'Journal Entries', path: '/journal-entries' },
      { label: 'Trial Balance', path: '/trial-balance' },
      { label: 'General Ledger', path: '/general-ledger' },
      { label: 'Profit & Loss (P&L)', path: '/accounting/pnl' },
      { label: 'Reconciliation', path: '/accounting/reconciliation' },
      { label: 'Period Closing', path: '/periods' },
      { label: 'Invoices', path: '/invoices' }
    ]
  },
  {
    label: 'HR',
    icon: <PeopleIcon />,
    color: theme.palette.warning.main,
    children: [
      { label: 'Payroll', path: '/payroll' },
      { label: 'Reimbursements', path: '/reimbursements' },
      { label: 'Business Trip Management', path: '/business-trips' }
    ]
  },
  {
    label: 'Assets',
    icon: <BusinessIcon />,
    color: theme.palette.success.main,
    children: [
      { label: 'Asset Register', path: '/assets' },
      { label: 'Depreciation', path: '/depreciation' }
    ]
  },
  {
    label: 'Operations',
    icon: <LocalShippingIcon />,
    color: theme.palette.secondary.main,
    children: [
      { label: 'Orders', path: '/projects' },
      { label: 'Fuel Logs', path: '/fuel-logs' },
      { label: 'Water Log', path: '/water-log' },
      { label: 'Overtime', path: '/overtime' },
      { label: 'Trip Allowance', path: '/trip-allowance' },
      { label: 'Food Allowance', path: '/food-allowance' },
      { label: 'Clients', path: '/clients' },
      { label: 'Tracker', path: '/tracker' },
      { label: 'Asset Passes', path: '/asset-passes' },
      { label: 'Employee Passes', path: '/employee-passes' }
    ]
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: <BuildIcon />,
    color: theme.palette.error.main
  },
  {
    label: 'Procurement',
    path: '/procurement',
    icon: <ShoppingCartIcon />,
    color: theme.palette.info.main
  },
  {
    label: 'Sales',
    path: '/sales',
    icon: <StorefrontIcon />,
    color: theme.palette.success.main
  },
  {
    label: 'HSE',
    path: '/hse',
    icon: <SecurityIcon />,
    color: theme.palette.warning.main
  },
  {
    label: 'Admin',
    path: '/admin',
    icon: <AdminIcon />,
    color: theme.palette.error.main
  },
  {
    label: 'Inventory',
    icon: <InventoryIcon />,
    color: theme.palette.neutral?.main || theme.palette.grey[600],
    children: [
      { label: 'Inventory Register', path: '/inventory' },
      { label: 'Transactions Log', path: '/inventory/transactions' }
    ]
  }
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  const colorMode = useContext(ColorModeContext);
  const isAuthenticated = !!localStorage.getItem('token');

  const handleMenuToggle = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => setNotificationAnchorEl(event.currentTarget);
  const handleNotificationMenuClose = () => setNotificationAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const isActiveRoute = (path?: string, children?: any[]) => {
    if (path) {
      return location.pathname === path;
    }
    if (children) {
      return children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const getActiveColor = (item: any) => {
    if (isActiveRoute(item.path, item.children)) {
      return item.color;
    }
    return alpha(theme.palette.common.white, 0.9);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.98)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 50%, ${alpha(theme.palette.info.main, 0.98)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          zIndex: theme.zIndex.appBar,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: 80, px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mr: { xs: 2, md: 6 },
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }} 
                component={RouterLink} 
                to="/dashboard"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      mr: 2,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.3)}`
                    }}
                  >
                    <StarIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </motion.div>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: 1,
                      lineHeight: 1.2
                    }}
                  >
                    MASAR
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(theme.palette.common.white, 0.8),
                      fontWeight: 500,
                      letterSpacing: 2,
                      textTransform: 'uppercase'
                    }}
                  >
                    Enterprise Suite
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', flexGrow: 1, gap: 1 }}>
              {navStructure.map((item, index) => {
                const isActive = isActiveRoute(item.path, item.children);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => setHoveredItem(item.label)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    {hasChildren ? (
                      <Box sx={{ position: 'relative' }}>
                        <Button
                          onClick={() => handleMenuToggle(item.label)}
                          startIcon={item.icon}
                          sx={{
                            color: getActiveColor(item),
                            backgroundColor: isActive || hoveredItem === item.label ? alpha(theme.palette.common.white, 0.15) : 'transparent',
                            borderRadius: 3,
                            fontWeight: isActive ? 700 : 500,
                            px: 3,
                            py: 1.5,
                            minHeight: 48,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: isActive ? `2px solid ${alpha(theme.palette.common.white, 0.3)}` : '2px solid transparent',
                            backdropFilter: isActive || hoveredItem === item.label ? 'blur(10px)' : 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.white, 0.2),
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
                            },
                            '&::before': isActive ? {
                              content: '""',
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              background: `linear-gradient(90deg, ${item.color}, ${alpha(item.color, 0.6)})`,
                              borderRadius: '3px 3px 0 0'
                            } : {}
                          }}
                        >
                          {item.label}
                          <ExpandMore sx={{ ml: 1, fontSize: 18 }} />
                        </Button>
                        <Menu
                          anchorEl={document.querySelector(`[data-menu="${item.label}"]`)}
                          open={openMenus[item.label] || false}
                          onClose={() => handleMenuToggle(item.label)}
                          MenuListProps={{
                            sx: {
                              minWidth: 280,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                              backdropFilter: 'blur(20px)',
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              borderRadius: 3,
                              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`,
                              py: 2
                            }
                          }}
                          PaperProps={{
                            sx: {
                              background: 'transparent',
                              boxShadow: 'none'
                            }
                          }}
                        >
                          {item.children?.map((child, childIndex) => (
                            <motion.div
                              key={child.path}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: childIndex * 0.05 }}
                            >
                              <MenuItem
                                component={RouterLink}
                                to={child.path}
                                onClick={() => handleMenuToggle(item.label)}
                                sx={{
                                  py: 1.5,
                                  px: 3,
                                  borderRadius: 2,
                                  mx: 1,
                                  mb: 0.5,
                                  transition: 'all 0.2s ease',
                                  backgroundColor: location.pathname === child.path ? alpha(item.color, 0.1) : 'transparent',
                                  color: location.pathname === child.path ? item.color : 'text.primary',
                                  fontWeight: location.pathname === child.path ? 600 : 400,
                                  '&:hover': {
                                    backgroundColor: alpha(item.color, 0.08),
                                    transform: 'translateX(8px)',
                                    borderLeft: `3px solid ${item.color}`
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: location.pathname === child.path ? item.color : alpha(theme.palette.text.secondary, 0.3),
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                  {child.label}
                                </Box>
                              </MenuItem>
                            </motion.div>
                          ))}
                        </Menu>
                      </Box>
                    ) : (
                      <Button
                        component={RouterLink}
                        to={item.path!}
                        startIcon={item.icon}
                        sx={{
                          color: getActiveColor(item),
                          backgroundColor: isActive || hoveredItem === item.label ? alpha(theme.palette.common.white, 0.15) : 'transparent',
                          borderRadius: 3,
                          fontWeight: isActive ? 700 : 500,
                          px: 3,
                          py: 1.5,
                          minHeight: 48,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: isActive ? `2px solid ${alpha(theme.palette.common.white, 0.3)}` : '2px solid transparent',
                          backdropFilter: isActive || hoveredItem === item.label ? 'blur(10px)' : 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.common.white, 0.2),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
                          },
                          '&::before': isActive ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${item.color}, ${alpha(item.color, 0.6)})`,
                            borderRadius: '3px 3px 0 0'
                          } : {}
                        }}
                      >
                        {item.label}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </Box>

            {/* Right Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {!isAuthenticated ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        component={RouterLink}
                        to="/login"
                        variant="outlined"
                        sx={{
                          borderColor: alpha(theme.palette.common.white, 0.3),
                          color: 'white',
                          borderRadius: 3,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: alpha(theme.palette.common.white, 0.1),
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Login
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                          borderRadius: 3,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.3)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: `0 6px 20px ${alpha(theme.palette.warning.main, 0.4)}`
                          }
                        }}
                      >
                        Register
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        component={RouterLink}
                        to="/debug-auth"
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: alpha(theme.palette.common.white, 0.2),
                          color: alpha(theme.palette.common.white, 0.8),
                          borderRadius: 2,
                          minWidth: 'auto',
                          px: 2,
                          py: 0.5,
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: alpha(theme.palette.common.white, 0.4),
                            backgroundColor: alpha(theme.palette.common.white, 0.05)
                          }
                        }}
                      >
                        IT
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        onClick={colorMode.toggleColorMode}
                        sx={{
                          backgroundColor: alpha(theme.palette.common.white, 0.1),
                          color: 'white',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.common.white, 0.2),
                            transform: 'rotate(180deg)'
                          }
                        }}
                      >
                        {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                      </IconButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <IconButton
                        onClick={handleNotificationMenuOpen}
                        sx={{
                          backgroundColor: alpha(theme.palette.common.white, 0.1),
                          color: 'white',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.common.white, 0.2)
                          }
                        }}
                      >
                        <Badge badgeContent={3} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Avatar
                        onClick={handleProfileMenuOpen}
                        sx={{
                          bgcolor: alpha(theme.palette.common.white, 0.2),
                          color: 'white',
                          cursor: 'pointer',
                          width: 44,
                          height: 44,
                          border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                          transition: 'all 0.3s ease',
                          fontWeight: 700,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
                            border: `2px solid ${alpha(theme.palette.common.white, 0.6)}`
                          }
                        }}
                      >
                        U
                      </Avatar>
                    </motion.div>

                    {/* Mobile Menu Button */}
                    <Box sx={{ display: { xs: 'block', lg: 'none' }, ml: 1 }}>
                      <IconButton
                        onClick={() => setMobileDrawerOpen(true)}
                        sx={{
                          color: 'white',
                          backgroundColor: alpha(theme.palette.common.white, 0.1),
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.common.white, 0.2)
                          }
                        }}
                      >
                        <MenuIcon />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Stack>
            </motion.div>

            {/* Profile Menu */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              MenuListProps={{
                sx: {
                  minWidth: 200,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 3,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`,
                  py: 1
                }
              }}
              PaperProps={{
                sx: {
                  background: 'transparent',
                  boxShadow: 'none'
                }
              }}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleProfileMenuClose}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
                Profile
              </MenuItem>
              <Divider sx={{ mx: 1, my: 1 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  mx: 1,
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08)
                  }
                }}
              >
                <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Navigation
          </Typography>
          <List>
            {navStructure.map((item) => (
              <Box key={item.label}>
                {item.children ? (
                  <>
                    <ListItem
                      onClick={() => handleMenuToggle(item.label)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.1)
                        },
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: isActiveRoute(item.path, item.children) ? alpha(item.color, 0.1) : 'transparent'
                      }}
                    >
                      <ListItemIcon sx={{ color: item.color }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {openMenus[item.label] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem
                            key={child.path}
                            component={RouterLink}
                            to={child.path!}
                            onClick={() => setMobileDrawerOpen(false)}
                            sx={{
                              pl: 4,
                              borderRadius: 2,
                              mb: 0.5,
                              backgroundColor: location.pathname === child.path ? alpha(item.color, 0.1) : 'transparent'
                            }}
                          >
                            <ListItemText 
                              primary={child.label}
                              sx={{
                                color: location.pathname === child.path ? item.color : 'text.primary'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem
                    component={RouterLink}
                    to={item.path!}
                    onClick={() => setMobileDrawerOpen(false)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: isActiveRoute(item.path) ? alpha(item.color, 0.1) : 'transparent'
                    }}
                  >
                    <ListItemIcon sx={{ color: item.color }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        color: isActiveRoute(item.path) ? item.color : 'text.primary'
                      }}
                    />
                  </ListItem>
                )}
              </Box>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar sx={{ minHeight: 80 }} />
    </>
  );
};

export default NavBar;
