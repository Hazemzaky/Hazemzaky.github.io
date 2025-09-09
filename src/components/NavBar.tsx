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
  Fade,
  Grow
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ComputerIcon from '@mui/icons-material/Computer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Theme context for dark mode toggle
export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// Navigation structure as requested
const navigationItems = [
  { 
    label: 'Dashboard', 
    path: '/', 
    icon: DashboardIcon,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  { 
    label: 'Budgets', 
    path: '/budgets', 
    icon: AttachMoneyIcon,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  { 
    label: 'Maintenance', 
    path: '/maintenance', 
    icon: BuildIcon,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  { 
    label: 'Procurement', 
    path: '/procurement', 
    icon: ShoppingCartIcon,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  { 
    label: 'Sales', 
    path: '/sales', 
    icon: SellIcon,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  { 
    label: 'HSE', 
    path: '/hse', 
    icon: SecurityIcon,
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  { 
    label: 'Admin', 
    path: '/admin', 
    icon: AdminPanelSettingsIcon,
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  },
  { 
    label: 'IT', 
    path: '/debug-auth', 
    icon: ComputerIcon,
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
  }
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);
  const isAuthenticated = !!localStorage.getItem('token');

  // Dropdown anchor states
  const [accountingAnchorEl, setAccountingAnchorEl] = useState<null | HTMLElement>(null);
  const [hrAnchorEl, setHrAnchorEl] = useState<null | HTMLElement>(null);
  const [assetsAnchorEl, setAssetsAnchorEl] = useState<null | HTMLElement>(null);
  const [operationsAnchorEl, setOperationsAnchorEl] = useState<null | HTMLElement>(null);
  const [inventoryAnchorEl, setInventoryAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  // Menu handlers
  const handleAccountingMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAccountingAnchorEl(event.currentTarget);
  const handleAccountingMenuClose = () => setAccountingAnchorEl(null);
  const handleHrMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setHrAnchorEl(event.currentTarget);
  const handleHrMenuClose = () => setHrAnchorEl(null);
  const handleAssetsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAssetsAnchorEl(event.currentTarget);
  const handleAssetsMenuClose = () => setAssetsAnchorEl(null);
  const handleOperationsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setOperationsAnchorEl(event.currentTarget);
  const handleOperationsMenuClose = () => setOperationsAnchorEl(null);
  const handleInventoryMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setInventoryAnchorEl(event.currentTarget);
  const handleInventoryMenuClose = () => setInventoryAnchorEl(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  // Helper function to check if a dropdown path is active
  const isDropdownActive = (paths: string[]): boolean => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: colorMode.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ minHeight: 60, px: 2 }}>
        {/* Left: Logo/Brand */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 3,
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }} 
          component={RouterLink} 
          to="/" 
          style={{ textDecoration: 'none' }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              overflow: 'hidden',
            }}
          >
            <img 
              src="/company-static-logo.png" 
              alt="Lebetak Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#56FC57',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              fontSize: '1.4rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            lebetak
          </Typography>
        </Box>
        {/* Center: Main navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1, ml: 1 }}>
          {/* Single Page Navigation Items */}
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            
            return (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.path}
                startIcon={<IconComponent sx={{ fontSize: '1rem' }} />}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  position: 'relative',
                  minWidth: 'auto',
                  background: isActive 
                    ? item.gradient
                    : 'transparent',
                  color: isActive ? 'white' : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                  boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: isActive 
                      ? item.gradient
                      : colorMode.mode === 'dark' 
                        ? 'rgba(148, 163, 184, 0.1)' 
                        : 'rgba(148, 163, 184, 0.05)',
                    transform: 'translateY(-1px)',
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                      : '0 2px 6px rgba(0, 0, 0, 0.1)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '8px',
                    background: isActive ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)' : 'none',
                    pointerEvents: 'none',
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
          {/* Accounting Dropdown */}
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleAccountingMenuOpen}
              startIcon={<AccountBalanceIcon sx={{ fontSize: '1rem' }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ 
                transform: accountingAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 2,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                position: 'relative',
                minWidth: 'auto',
                background: accountingAnchorEl || isDropdownActive(['/accounts', '/journal-entries', '/trial-balance', '/general-ledger', '/accounting/pnl', '/accounting/reconciliation', '/periods', '/invoices'])
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                color: accountingAnchorEl || isDropdownActive(['/accounts', '/journal-entries', '/trial-balance', '/general-ledger', '/accounting/pnl', '/accounting/reconciliation', '/periods', '/invoices'])
                  ? 'white' 
                  : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                boxShadow: accountingAnchorEl || isDropdownActive(['/accounts', '/journal-entries', '/trial-balance', '/general-ledger', '/accounting/pnl', '/accounting/reconciliation', '/periods', '/invoices'])
                  ? '0 2px 8px rgba(102, 126, 234, 0.3)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: accountingAnchorEl || isDropdownActive(['/accounts', '/journal-entries', '/trial-balance', '/general-ledger', '/accounting/pnl', '/accounting/reconciliation', '/periods', '/invoices'])
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : colorMode.mode === 'dark' 
                      ? 'rgba(148, 163, 184, 0.1)' 
                      : 'rgba(148, 163, 184, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              Accounting
            </Button>
            <Menu
              anchorEl={accountingAnchorEl}
              open={Boolean(accountingAnchorEl)}
              onClose={handleAccountingMenuClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '16px',
                  mt: 1,
                  background: colorMode.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  minWidth: 240,
                }
              }}
            >
              <MenuItem component={RouterLink} to="/accounts" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Chart of Accounts</MenuItem>
              <MenuItem component={RouterLink} to="/journal-entries" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Journal Entries</MenuItem>
              <MenuItem component={RouterLink} to="/trial-balance" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Trial Balance</MenuItem>
              <MenuItem component={RouterLink} to="/general-ledger" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>General Ledger</MenuItem>
              <MenuItem component={RouterLink} to="/accounting/pnl" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>P&L</MenuItem>
              <MenuItem component={RouterLink} to="/accounting/reconciliation" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Reconciliation</MenuItem>
              <MenuItem component={RouterLink} to="/periods" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Period Closing</MenuItem>
              <MenuItem component={RouterLink} to="/invoices" onClick={handleAccountingMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Invoices</MenuItem>
            </Menu>
          </Box>
          {/* HR Dropdown */}
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleHrMenuOpen}
              startIcon={<PeopleIcon sx={{ fontSize: '1rem' }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ 
                transform: hrAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 2,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: 'auto',
                background: hrAnchorEl || isDropdownActive(['/employees', '/attendance', '/payroll', '/business-trips'])
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'transparent',
                color: hrAnchorEl || isDropdownActive(['/employees', '/attendance', '/payroll', '/business-trips'])
                  ? 'white' 
                  : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                boxShadow: hrAnchorEl || isDropdownActive(['/employees', '/attendance', '/payroll', '/business-trips'])
                  ? '0 4px 20px rgba(240, 147, 251, 0.3)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: hrAnchorEl || isDropdownActive(['/employees', '/attendance', '/payroll', '/business-trips'])
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : colorMode.mode === 'dark' 
                      ? 'rgba(148, 163, 184, 0.1)' 
                      : 'rgba(148, 163, 184, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              HR
            </Button>
            <Menu
              anchorEl={hrAnchorEl}
              open={Boolean(hrAnchorEl)}
              onClose={handleHrMenuClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '16px',
                  mt: 1,
                  background: colorMode.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  minWidth: 240,
                }
              }}
            >
              <MenuItem component={RouterLink} to="/employees" onClick={handleHrMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Employees</MenuItem>
              <MenuItem component={RouterLink} to="/attendance" onClick={handleHrMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Attendance System</MenuItem>
              <MenuItem component={RouterLink} to="/payroll" onClick={handleHrMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Payroll</MenuItem>
              <MenuItem component={RouterLink} to="/business-trips" onClick={handleHrMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Business Trip Management</MenuItem>
            </Menu>
          </Box>

          {/* Assets Dropdown */}
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleAssetsMenuOpen}
              startIcon={<BusinessCenterIcon sx={{ fontSize: '1rem' }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ 
                transform: assetsAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 2,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: 'auto',
                background: assetsAnchorEl || isDropdownActive(['/assets', '/depreciation'])
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  : 'transparent',
                color: assetsAnchorEl || isDropdownActive(['/assets', '/depreciation'])
                  ? 'white' 
                  : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                boxShadow: assetsAnchorEl || isDropdownActive(['/assets', '/depreciation'])
                  ? '0 4px 20px rgba(79, 172, 254, 0.3)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: assetsAnchorEl || isDropdownActive(['/assets', '/depreciation'])
                    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                    : colorMode.mode === 'dark' 
                      ? 'rgba(148, 163, 184, 0.1)' 
                      : 'rgba(148, 163, 184, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              Assets
            </Button>
            <Menu
              anchorEl={assetsAnchorEl}
              open={Boolean(assetsAnchorEl)}
              onClose={handleAssetsMenuClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '16px',
                  mt: 1,
                  background: colorMode.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  minWidth: 240,
                }
              }}
            >
              <MenuItem component={RouterLink} to="/assets" onClick={handleAssetsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Asset Register</MenuItem>
              <MenuItem component={RouterLink} to="/depreciation" onClick={handleAssetsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Depreciation</MenuItem>
            </Menu>
          </Box>

          {/* Operations Dropdown */}
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleOperationsMenuOpen}
              startIcon={<BuildIcon sx={{ fontSize: '1rem' }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ 
                transform: operationsAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 2,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: 'auto',
                background: operationsAnchorEl || isDropdownActive(['/projects', '/fuel-logs', '/water-log', '/overtime', '/trip-allowance', '/food-allowance', '/clients', '/tracker', '/asset-passes', '/employee-passes'])
                  ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                  : 'transparent',
                color: operationsAnchorEl || isDropdownActive(['/projects', '/fuel-logs', '/water-log', '/overtime', '/trip-allowance', '/food-allowance', '/clients', '/tracker', '/asset-passes', '/employee-passes'])
                  ? 'white' 
                  : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                boxShadow: operationsAnchorEl || isDropdownActive(['/projects', '/fuel-logs', '/water-log', '/overtime', '/trip-allowance', '/food-allowance', '/clients', '/tracker', '/asset-passes', '/employee-passes'])
                  ? '0 4px 20px rgba(67, 233, 123, 0.3)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: operationsAnchorEl || isDropdownActive(['/projects', '/fuel-logs', '/water-log', '/overtime', '/trip-allowance', '/food-allowance', '/clients', '/tracker', '/asset-passes', '/employee-passes'])
                    ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                    : colorMode.mode === 'dark' 
                      ? 'rgba(148, 163, 184, 0.1)' 
                      : 'rgba(148, 163, 184, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              Operations
            </Button>
            <Menu
              anchorEl={operationsAnchorEl}
              open={Boolean(operationsAnchorEl)}
              onClose={handleOperationsMenuClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '16px',
                  mt: 1,
                  background: colorMode.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  minWidth: 240,
                }
              }}
            >
              <MenuItem component={RouterLink} to="/projects" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Orders</MenuItem>
              <MenuItem component={RouterLink} to="/fuel-logs" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Fuel Logs</MenuItem>
              <MenuItem component={RouterLink} to="/water-log" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Water Log</MenuItem>
              <MenuItem component={RouterLink} to="/overtime" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Overtime</MenuItem>
              <MenuItem component={RouterLink} to="/trip-allowance" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Trip Allowance</MenuItem>
              <MenuItem component={RouterLink} to="/food-allowance" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Food Allowance</MenuItem>
              <MenuItem component={RouterLink} to="/clients" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Clients</MenuItem>
              <MenuItem component={RouterLink} to="/tracker" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Tracker</MenuItem>
              <MenuItem component={RouterLink} to="/asset-passes" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Asset Passes</MenuItem>
              <MenuItem component={RouterLink} to="/employee-passes" onClick={handleOperationsMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Employee Passes</MenuItem>
            </Menu>
          </Box>

          {/* Inventory Dropdown */}
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleInventoryMenuOpen}
              startIcon={<InventoryIcon sx={{ fontSize: '1rem' }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ 
                transform: inventoryAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 2,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: 'auto',
                background: inventoryAnchorEl || isDropdownActive(['/inventory'])
                  ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                  : 'transparent',
                color: inventoryAnchorEl || isDropdownActive(['/inventory'])
                  ? 'white' 
                  : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                boxShadow: inventoryAnchorEl || isDropdownActive(['/inventory'])
                  ? '0 4px 20px rgba(168, 237, 234, 0.3)' 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: inventoryAnchorEl || isDropdownActive(['/inventory'])
                    ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                    : colorMode.mode === 'dark' 
                      ? 'rgba(148, 163, 184, 0.1)' 
                      : 'rgba(148, 163, 184, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              Inventory
            </Button>
            <Menu
              anchorEl={inventoryAnchorEl}
              open={Boolean(inventoryAnchorEl)}
              onClose={handleInventoryMenuClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '16px',
                  mt: 1,
                  background: colorMode.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  minWidth: 240,
                }
              }}
            >
              <MenuItem component={RouterLink} to="/inventory" onClick={handleInventoryMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Inventory Register</MenuItem>
              <MenuItem component={RouterLink} to="/inventory/transactions" onClick={handleInventoryMenuClose} sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}>Transactions Log</MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* Right: Utility Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Document Icon */}
          <Tooltip title="Documents">
            <IconButton 
              component={RouterLink} 
              to="/documents"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: colorMode.mode === 'dark' 
                  ? 'rgba(148, 163, 184, 0.1)' 
                  : 'rgba(148, 163, 184, 0.05)',
                color: colorMode.mode === 'dark' ? 'white' : '#1e293b',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>

          {/* Dark/Light Mode Toggle */}
          <Tooltip title={`Switch to ${colorMode.mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton 
              onClick={colorMode.toggleColorMode}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: colorMode.mode === 'dark' 
                  ? 'rgba(148, 163, 184, 0.1)' 
                  : 'rgba(148, 163, 184, 0.05)',
                color: colorMode.mode === 'dark' ? 'white' : '#1e293b',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: colorMode.mode === 'dark' 
                    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: colorMode.mode === 'dark' 
                    ? '0 8px 25px rgba(251, 191, 36, 0.3)'
                    : '0 8px 25px rgba(30, 41, 59, 0.3)',
                },
              }}
            >
              {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* Profile Dropdown */}
          {isAuthenticated && (
            <Box sx={{ position: 'relative' }}>
              <Tooltip title="Profile">
                <IconButton 
                  onClick={handleProfileMenuOpen}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: profileAnchorEl 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : colorMode.mode === 'dark' 
                        ? 'rgba(148, 163, 184, 0.1)' 
                        : 'rgba(148, 163, 184, 0.05)',
                    color: profileAnchorEl ? 'white' : (colorMode.mode === 'dark' ? 'white' : '#1e293b'),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    },
                  }}
                >
                  <Avatar
                    sx={{ 
                      bgcolor: 'transparent', 
                      width: 28, 
                      height: 28,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: '16px',
                    mt: 1,
                    background: colorMode.mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}`,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    minWidth: 180,
                  }
                }}
              >
                <MenuItem 
                  component={RouterLink} 
                  to="/profile" 
                  onClick={handleProfileMenuClose}
                  sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/settings" 
                  onClick={handleProfileMenuClose}
                  sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}
                >
                  Settings
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ py: 1.5, borderRadius: '8px', mx: 1, my: 0.5 }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Login/Register buttons for unauthenticated users */}
          {!isAuthenticated && (
            <>
              <Button 
                component={RouterLink} 
                to="/login"
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  border: `2px solid ${colorMode.mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)'}`,
                  color: colorMode.mode === 'dark' ? 'white' : '#1e293b',
                  '&:hover': {
                    border: '2px solid transparent',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  },
                }}
              >
                Login
              </Button>
              <Button 
                component={RouterLink} 
                to="/register"
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 