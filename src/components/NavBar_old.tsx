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
  Stack
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
  Menu as MenuIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

// Theme context for dark mode toggle
export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// Define your nav structure (update as needed)
const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Budgets', path: '/budgets' },
  // ... add more as needed
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [anchorEls, setAnchorEls] = useState<(null | HTMLElement)[]>([]);

  // Remove isDropdownActive and dropdown logic from navItems
  // Helper to determine if a dropdown is active (no longer needed for navItems)
  // const isDropdownActive = (dropdownItems: any[]) => {
  //   return dropdownItems.some((item) => location.pathname.startsWith(item.path));
  // };

  useEffect(() => {
    // Find the active tab (no dropdowns in navItems)
    let activeIndex = -1;
    navItems.forEach((item, idx) => {
      if (location.pathname === item.path) {
        activeIndex = idx;
      }
    });
    // Get the ref for the active item
    let ref = itemRefs.current[activeIndex];
    if (ref) {
      const { offsetLeft, offsetWidth, offsetTop, offsetHeight } = ref;
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
        top: offsetTop,
        height: offsetHeight,
        borderRadius: offsetHeight / 2,
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        background: '#1976d2',
        position: 'absolute',
        zIndex: 0,
      });
    }
  }, [location.pathname]);

  // Dropdown menu state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>, idx: number) => {
    setAnchorEls((prev) => {
      const newArr = [...prev];
      newArr[idx] = event.currentTarget;
      return newArr;
    });
    setOpenDropdown(idx);
  };
  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  const [accountingAnchorEl, setAccountingAnchorEl] = useState<null | HTMLElement>(null);
  const [hrAnchorEl, setHrAnchorEl] = useState<null | HTMLElement>(null);
  const [assetsAnchorEl, setAssetsAnchorEl] = useState<null | HTMLElement>(null);
  const [inventoryAnchorEl, setInventoryAnchorEl] = useState<null | HTMLElement>(null);
  const [operationsAnchorEl, setOperationsAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const colorMode = useContext(ColorModeContext);
  const isAuthenticated = !!localStorage.getItem('token');

  // Menu handlers
  const handleAccountingMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAccountingAnchorEl(event.currentTarget);
  const handleAccountingMenuClose = () => setAccountingAnchorEl(null);
  const handleHrMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setHrAnchorEl(event.currentTarget);
  const handleHrMenuClose = () => setHrAnchorEl(null);
  const handleAssetsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAssetsAnchorEl(event.currentTarget);
  const handleAssetsMenuClose = () => setAssetsAnchorEl(null);
  const handleInventoryMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setInventoryAnchorEl(event.currentTarget);
  const handleInventoryMenuClose = () => setInventoryAnchorEl(null);
  const handleOperationsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setOperationsAnchorEl(event.currentTarget);
  const handleOperationsMenuClose = () => setOperationsAnchorEl(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const theme = useTheme();

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        position: 'relative',
        zIndex: theme.zIndex.appBar
      }}
    >
      <Toolbar sx={{ minHeight: 70, px: 3 }}>
        {/* Left: Logo/Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 4,
              textDecoration: 'none',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }} 
            component={RouterLink} 
            to="/dashboard"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              {/* Company Logo */}
              <Typography
                variant="h6"
                sx={{
                  color: 'transparent',
                  textDecoration: 'none',
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                  mr: 1,
                }}
              >
                Company Logo
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'transparent',
                  textDecoration: 'none',
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  background: 'linear-gradient(90deg, #FFD700 0%, #FFB300 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
              >
                Company Name
              </Typography>
            </Box>
          </Box>
        </motion.div>
        {/* Center: Main navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      backgroundColor: isActive ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                      color: isActive ? 'white' : alpha(theme.palette.common.white, 0.9),
                      borderRadius: 2,
                      fontWeight: isActive ? 700 : 500,
                      px: 2,
                      py: 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: isActive ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                      backdropFilter: isActive ? 'blur(10px)' : 'none',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.15),
                        color: 'white',
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              );
            })}
          {/* Dedicated Accounting Dropdown */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Button
                color="inherit"
                onClick={handleAccountingMenuOpen}
                sx={{
                  backgroundColor: accountingAnchorEl ? alpha(theme.palette.common.white, 0.2) : (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                  color: accountingAnchorEl ? 'white' : (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 'white' : alpha(theme.palette.common.white, 0.9),
                  borderRadius: 2,
                  fontWeight: accountingAnchorEl || (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 700 : 500,
                  px: 2,
                  py: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: accountingAnchorEl || (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                  backdropFilter: accountingAnchorEl || (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 'blur(10px)' : 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    color: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                  },
                }}
              >
                Accounting
              </Button>
            <Menu
              anchorEl={accountingAnchorEl}
              open={Boolean(accountingAnchorEl)}
              onClose={handleAccountingMenuClose}
              MenuListProps={{ 
                sx: { 
                  minWidth: 220,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
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
              <MenuItem component={RouterLink} to="/accounts" onClick={handleAccountingMenuClose}>Chart of Accounts</MenuItem>
              <MenuItem component={RouterLink} to="/journal-entries" onClick={handleAccountingMenuClose}>Journal Entries</MenuItem>
              <MenuItem component={RouterLink} to="/trial-balance" onClick={handleAccountingMenuClose}>Trial Balance</MenuItem>
              <MenuItem component={RouterLink} to="/general-ledger" onClick={handleAccountingMenuClose}>General Ledger</MenuItem>
              <MenuItem component={RouterLink} to="/accounting/pnl" onClick={handleAccountingMenuClose}>Profit & Loss (P&L)</MenuItem>
              <MenuItem component={RouterLink} to="/accounting/reconciliation" onClick={handleAccountingMenuClose}>Reconciliation</MenuItem>
              <MenuItem component={RouterLink} to="/periods" onClick={handleAccountingMenuClose}>Period Closing</MenuItem>
              <MenuItem onClick={() => navigate('/invoices')}>Invoices</MenuItem>
            </Menu>
          </Box>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              onClick={handleHrMenuOpen} 
              aria-controls="hr-menu" 
              aria-haspopup="true"
              sx={{
                backgroundColor: hrAnchorEl ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: hrAnchorEl ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: hrAnchorEl ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: hrAnchorEl ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: hrAnchorEl ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              HR
            </Button>
          <Menu
            id="hr-menu"
            anchorEl={hrAnchorEl}
            open={Boolean(hrAnchorEl)}
            onClose={handleHrMenuClose}
            MenuListProps={{ onMouseLeave: handleHrMenuClose }}
          >
            <MenuItem component={RouterLink} to="/payroll" onClick={handleHrMenuClose}>Payroll</MenuItem>
            <MenuItem component={RouterLink} to="/reimbursements" onClick={handleHrMenuClose}>Reimbursements</MenuItem>
            <MenuItem component={RouterLink} to="/business-trips" onClick={handleHrMenuClose}>Business Trip Management</MenuItem>
          </Menu>
          <Button color="inherit" onClick={handleAssetsMenuOpen} aria-controls="assets-menu" aria-haspopup="true">Assets</Button>
          <Menu
            id="assets-menu"
            anchorEl={assetsAnchorEl}
            open={Boolean(assetsAnchorEl)}
            onClose={handleAssetsMenuClose}
            MenuListProps={{ onMouseLeave: handleAssetsMenuClose }}
          >
            <MenuItem component={RouterLink} to="/assets" onClick={handleAssetsMenuClose}>Asset Register</MenuItem>
            <MenuItem component={RouterLink} to="/depreciation" onClick={handleAssetsMenuClose}>Depreciation</MenuItem>
          </Menu>
          <Button 
            color="inherit" 
            onClick={handleOperationsMenuOpen} 
            aria-controls="operations-menu" 
            aria-haspopup="true"
            sx={{
              backgroundColor: operationsAnchorEl || (location.pathname.startsWith('/projects') || location.pathname.startsWith('/tariffs') || location.pathname.startsWith('/fuel-logs') || location.pathname.startsWith('/driver-hours')) ? 'primary.main' : 'transparent',
              color: operationsAnchorEl || (location.pathname.startsWith('/projects') || location.pathname.startsWith('/tariffs') || location.pathname.startsWith('/fuel-logs') || location.pathname.startsWith('/driver-hours')) ? 'primary.contrastText' : 'inherit',
              borderRadius: 3,
              fontWeight: operationsAnchorEl || (location.pathname.startsWith('/projects') || location.pathname.startsWith('/tariffs') || location.pathname.startsWith('/fuel-logs') || location.pathname.startsWith('/driver-hours')) ? 700 : 400,
              transition: 'background 0.2s, color 0.2s',
              '&:hover': {
                backgroundColor: operationsAnchorEl || (location.pathname.startsWith('/projects') || location.pathname.startsWith('/tariffs') || location.pathname.startsWith('/fuel-logs') || location.pathname.startsWith('/driver-hours')) ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            Operations
          </Button>
          <Menu
            id="operations-menu"
            anchorEl={operationsAnchorEl}
            open={Boolean(operationsAnchorEl)}
            onClose={handleOperationsMenuClose}
            MenuListProps={{ onMouseLeave: handleOperationsMenuClose }}
          >
            <MenuItem component={RouterLink} to="/projects" onClick={handleOperationsMenuClose}>Orders</MenuItem>
            <MenuItem component={RouterLink} to="/fuel-logs" onClick={handleOperationsMenuClose}>Fuel Logs</MenuItem>
            <MenuItem component={RouterLink} to="/water-log" onClick={handleOperationsMenuClose}>Water Log</MenuItem>
            <MenuItem component={RouterLink} to="/overtime" onClick={handleOperationsMenuClose}>Overtime</MenuItem>
            <MenuItem component={RouterLink} to="/trip-allowance" onClick={handleOperationsMenuClose}>Trip Allowance</MenuItem>
            <MenuItem component={RouterLink} to="/food-allowance" onClick={handleOperationsMenuClose}>Food Allowance</MenuItem>
            <MenuItem component={RouterLink} to="/clients" onClick={handleOperationsMenuClose}>Clients</MenuItem>
            <MenuItem component={RouterLink} to="/tracker" onClick={handleOperationsMenuClose}>Tracker</MenuItem>
            <MenuItem component={RouterLink} to="/asset-passes" onClick={handleOperationsMenuClose}>Asset Passes</MenuItem>
            <MenuItem component={RouterLink} to="/employee-passes" onClick={handleOperationsMenuClose}>Employee Passes</MenuItem>
          </Menu>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/maintenance"
              sx={{
                backgroundColor: location.pathname === '/maintenance' ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: location.pathname === '/maintenance' ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: location.pathname === '/maintenance' ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: location.pathname === '/maintenance' ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: location.pathname === '/maintenance' ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              Maintenance
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              onClick={() => navigate('/procurement')}
              sx={{
                backgroundColor: location.pathname === '/procurement' ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: location.pathname === '/procurement' ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: location.pathname === '/procurement' ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: location.pathname === '/procurement' ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: location.pathname === '/procurement' ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              Procurement
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/sales"
              sx={{
                backgroundColor: location.pathname === '/sales' ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: location.pathname === '/sales' ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: location.pathname === '/sales' ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: location.pathname === '/sales' ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: location.pathname === '/sales' ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              Sales
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/hse"
              sx={{
                backgroundColor: location.pathname === '/hse' ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: location.pathname === '/hse' ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: location.pathname === '/hse' ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: location.pathname === '/hse' ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: location.pathname === '/hse' ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              HSE
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/admin"
              sx={{
                backgroundColor: location.pathname === '/admin' ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: location.pathname === '/admin' ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: location.pathname === '/admin' ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: location.pathname === '/admin' ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: location.pathname === '/admin' ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              Admin
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              color="inherit" 
              onClick={handleInventoryMenuOpen} 
              aria-controls="inventory-menu" 
              aria-haspopup="true"
              sx={{
                backgroundColor: inventoryAnchorEl ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                color: inventoryAnchorEl ? 'white' : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                fontWeight: inventoryAnchorEl ? 700 : 500,
                px: 2,
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: inventoryAnchorEl ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` : '1px solid transparent',
                backdropFilter: inventoryAnchorEl ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                },
              }}
            >
              Inventory
            </Button>
            <Menu
              id="inventory-menu"
              anchorEl={inventoryAnchorEl}
              open={Boolean(inventoryAnchorEl)}
              onClose={handleInventoryMenuClose}
              MenuListProps={{ 
                onMouseLeave: handleInventoryMenuClose,
                sx: { 
                  minWidth: 220,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
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
              <MenuItem component={RouterLink} to="/inventory" onClick={handleInventoryMenuClose}>Inventory Register</MenuItem>
              <MenuItem component={RouterLink} to="/inventory/transactions" onClick={handleInventoryMenuClose}>Transactions Log</MenuItem>
            </Menu>
          </motion.div>
        </Box>
        </motion.div>
        {/* Right: Auth, Debug, Dark mode, Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isAuthenticated && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/login"
                    sx={{
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      borderRadius: 2,
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/register"
                    sx={{
                      backgroundColor: alpha(theme.palette.common.white, 0.15),
                      color: 'white',
                      borderRadius: 2,
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.25),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    Register
                  </Button>
                </motion.div>
              </>
            )}
            {isAuthenticated && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/debug-auth"
                    sx={{
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      borderRadius: 2,
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    IT
                  </Button>
                </motion.div>
                {/* Dark mode toggle icon */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton 
                    sx={{ 
                      ml: 1,
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }} 
                    onClick={colorMode.toggleColorMode} 
                    color="inherit"
                  >
                    {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Box>
                    <Tooltip title="Profile">
                      <React.Fragment>
                        <Avatar
                          sx={{ 
                            bgcolor: alpha(theme.palette.common.white, 0.2), 
                            color: 'white',
                            cursor: 'pointer', 
                            width: 40, 
                            height: 40,
                            border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                              border: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                            },
                          }}
                          onClick={handleProfileMenuOpen}
                        >
                          U
                        </Avatar>
                      </React.Fragment>
                    </Tooltip>
                    <Menu
                      anchorEl={profileAnchorEl}
                      open={Boolean(profileAnchorEl)}
                      onClose={handleProfileMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      MenuListProps={{
                        sx: {
                          minWidth: 180,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          borderRadius: 2,
                          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
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
                      <MenuItem component={RouterLink} to="/profile" onClick={handleProfileMenuClose}>Profile</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </Box>
                </motion.div>
              </>
            )}
          </Box>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 