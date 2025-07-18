import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import TableChartIcon from '@mui/icons-material/TableChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';

const menu = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Budget Assumptions', path: '/budget/assumptions', icon: <SettingsIcon /> },
  { label: 'Budgets', path: '/budgets', icon: <TableChartIcon /> },
  { label: 'Revenue', path: '/budget/revenue', icon: <TrendingUpIcon /> },
  { label: 'OPEX', path: '/budget/opex', icon: <BusinessCenterIcon /> },
  { label: 'Staffing', path: '/budget/staffing', icon: <PeopleIcon /> },
  { label: 'Loans', path: '/budget/loans', icon: <AccountBalanceIcon /> },
  { label: 'CAPEX', path: '/budget/capex', icon: <BuildIcon /> },
  { label: 'Variance', path: '/budget/variance', icon: <BarChartIcon /> },
  { label: 'Contracts', path: '/budget/contracts', icon: <AssignmentIcon /> },
  { label: 'Reports', path: '/budget/reports', icon: <DescriptionIcon /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <Drawer variant="permanent" anchor="left" sx={{ width: 220, flexShrink: 0, '& .MuiDrawer-paper': { width: 220, boxSizing: 'border-box', top: '64px', height: 'calc(100% - 64px)' } }}>
      <List>
        {menu.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 