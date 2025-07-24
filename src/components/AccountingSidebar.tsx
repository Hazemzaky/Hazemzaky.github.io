import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';

const menu = [
  { label: 'Dashboard', path: '/accounting/dashboard', icon: <DashboardIcon /> },
  { label: 'General Ledger', path: '/general-ledger', icon: <BookIcon /> },
  { label: 'Journal Entries', path: '/journal-entries', icon: <EditNoteIcon /> },
  { label: 'Reports', path: '/accounting/reports', icon: <BarChartIcon /> },
  { label: 'Reconciliation', path: '/accounting/reconciliation', icon: <CompareArrowsIcon /> },
  { label: 'Invoicing', path: '/invoices', icon: <ReceiptLongIcon /> },
  { label: 'Fixed Assets', path: '/depreciation', icon: <BusinessCenterIcon /> },
  { label: 'Taxes', path: '/accounting/taxes', icon: <AccountBalanceIcon /> },
  { label: 'Settings', path: '/accounting/settings', icon: <SettingsIcon /> },
];

const AccountingSidebar: React.FC = () => {
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

export default AccountingSidebar; 