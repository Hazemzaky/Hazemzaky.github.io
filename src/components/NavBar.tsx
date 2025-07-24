import React, { useRef, useEffect, useState, useContext, createContext } from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Avatar, Tooltip, IconButton, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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

  return (
    <AppBar position="static">
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Left: Logo/Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }} component={RouterLink} to="/dashboard" style={{ textDecoration: 'none' }}>
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
        {/* Center: Main navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                color="inherit"
                component={RouterLink}
                to={item.path}
                sx={{
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'inherit',
                  borderRadius: 3,
                  fontWeight: isActive ? 700 : 400,
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
          {/* Dedicated Accounting Dropdown */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Button
              color="inherit"
              onClick={handleAccountingMenuOpen}
              sx={{
                backgroundColor: accountingAnchorEl ? 'primary.main' : (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 'primary.main' : 'transparent',
                color: accountingAnchorEl ? 'primary.contrastText' : (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 'primary.contrastText' : 'inherit',
                borderRadius: 3,
                fontWeight: accountingAnchorEl || (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 700 : 400,
                transition: 'background 0.2s, color 0.2s',
                '&:hover': {
                  backgroundColor: accountingAnchorEl || (location.pathname.startsWith('/accounts') || location.pathname.startsWith('/journal-entries') || location.pathname.startsWith('/trial-balance') || location.pathname.startsWith('/general-ledger') || location.pathname.startsWith('/periods') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/income') || location.pathname.startsWith('/invoices')) ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              Accounting
            </Button>
            <Menu
              anchorEl={accountingAnchorEl}
              open={Boolean(accountingAnchorEl)}
              onClose={handleAccountingMenuClose}
              MenuListProps={{ sx: { minWidth: 200 } }}
            >
              <MenuItem component={RouterLink} to="/accounts" onClick={handleAccountingMenuClose}>Chart of Accounts</MenuItem>
              <MenuItem component={RouterLink} to="/journal-entries" onClick={handleAccountingMenuClose}>Journal Entries</MenuItem>
              <MenuItem component={RouterLink} to="/trial-balance" onClick={handleAccountingMenuClose}>Trial Balance</MenuItem>
              <MenuItem component={RouterLink} to="/general-ledger" onClick={handleAccountingMenuClose}>General Ledger</MenuItem>
              <MenuItem component={RouterLink} to="/accounting/pnl" onClick={handleAccountingMenuClose}>Profit & Loss (P&L)</MenuItem>
              <MenuItem component={RouterLink} to="/accounting/reconciliation" onClick={handleAccountingMenuClose}>Reconciliation</MenuItem>
              <MenuItem component={RouterLink} to="/periods" onClick={handleAccountingMenuClose}>Period Closing</MenuItem>
              <MenuItem onClick={() => navigate('/expenses')}>Expenses</MenuItem>
              <MenuItem onClick={() => navigate('/income')}>Income</MenuItem>
              <MenuItem onClick={() => navigate('/invoices')}>Invoices</MenuItem>
            </Menu>
          </Box>
          <Button color="inherit" onClick={handleHrMenuOpen} aria-controls="hr-menu" aria-haspopup="true">HR</Button>
          <Menu
            id="hr-menu"
            anchorEl={hrAnchorEl}
            open={Boolean(hrAnchorEl)}
            onClose={handleHrMenuClose}
            MenuListProps={{ onMouseLeave: handleHrMenuClose }}
          >
            <MenuItem component={RouterLink} to="/employees" onClick={handleHrMenuClose}>Employees</MenuItem>
            <MenuItem component={RouterLink} to="/payroll" onClick={handleHrMenuClose}>Payroll</MenuItem>
            <MenuItem component={RouterLink} to="/reimbursements" onClick={handleHrMenuClose}>Reimbursements</MenuItem>
            <MenuItem component={RouterLink} to="/leave" onClick={handleHrMenuClose}>Leave</MenuItem>
            <MenuItem component={RouterLink} to="/vacation" onClick={handleHrMenuClose}>Employee Vacation</MenuItem>
            <MenuItem component={RouterLink} to="/vacation/hr" onClick={handleHrMenuClose}>HR Vacation Management</MenuItem>
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
            <MenuItem component={RouterLink} to="/tariffs" onClick={handleOperationsMenuClose}>Tariffs</MenuItem>
            <MenuItem component={RouterLink} to="/fuel-logs" onClick={handleOperationsMenuClose}>Fuel Logs</MenuItem>
            <MenuItem component={RouterLink} to="/water-log" onClick={handleOperationsMenuClose}>Water Log</MenuItem>
            <MenuItem component={RouterLink} to="/driver-hours" onClick={handleOperationsMenuClose}>Driver Hours</MenuItem>
            <MenuItem component={RouterLink} to="/overtime" onClick={handleOperationsMenuClose}>Overtime</MenuItem>
            <MenuItem component={RouterLink} to="/trip-allowance" onClick={handleOperationsMenuClose}>Trip Allowance</MenuItem>
            <MenuItem component={RouterLink} to="/food-allowance" onClick={handleOperationsMenuClose}>Food Allowance</MenuItem>
            <MenuItem component={RouterLink} to="/clients" onClick={handleOperationsMenuClose}>Clients</MenuItem>
            <MenuItem component={RouterLink} to="/tracker" onClick={handleOperationsMenuClose}>Tracker</MenuItem>
            <MenuItem component={RouterLink} to="/asset-passes" onClick={handleOperationsMenuClose}>Asset Passes</MenuItem>
            <MenuItem component={RouterLink} to="/employee-passes" onClick={handleOperationsMenuClose}>Employee Passes</MenuItem>
          </Menu>
          <Button color="inherit" component={RouterLink} to="/maintenance">Maintenance</Button>
          <Button color="inherit" onClick={() => navigate('/procurement')}>Procurement</Button>
          <Button color="inherit" component={RouterLink} to="/sales">Sales</Button>
          <Button color="inherit" component={RouterLink} to="/hse">HSE</Button>
          <Button color="inherit" component={RouterLink} to="/admin">Admin</Button>
          <Button color="inherit" onClick={handleInventoryMenuOpen} aria-controls="inventory-menu" aria-haspopup="true">Inventory</Button>
          <Menu
            id="inventory-menu"
            anchorEl={inventoryAnchorEl}
            open={Boolean(inventoryAnchorEl)}
            onClose={handleInventoryMenuClose}
            MenuListProps={{ onMouseLeave: handleInventoryMenuClose }}
          >
            <MenuItem component={RouterLink} to="/inventory" onClick={handleInventoryMenuClose}>Inventory Register</MenuItem>
            <MenuItem component={RouterLink} to="/inventory/transactions" onClick={handleInventoryMenuClose}>Transactions Log</MenuItem>
          </Menu>
        </Box>
        {/* Right: Auth, Debug, Dark mode, Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isAuthenticated && (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
          {isAuthenticated && (
            <>
              <Button color="inherit" component={RouterLink} to="/debug-auth">IT</Button>
              {/* Dark mode toggle icon */}
              <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Box>
                <Tooltip title="Profile">
                  <React.Fragment>
                    <Avatar
                      sx={{ bgcolor: '#1976d2', cursor: 'pointer', width: 36, height: 36 }}
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
                >
                  <MenuItem component={RouterLink} to="/profile" onClick={handleProfileMenuClose}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 