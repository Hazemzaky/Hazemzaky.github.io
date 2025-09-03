import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Avatar, Chip,
  useTheme, alpha, Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, IconButton, Badge, Tooltip
} from '@mui/material';
import {
  Folder as FolderIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as WordIcon,
  Archive as ArchiveIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentManager from '../components/DocumentManager';

const DocumentManagementPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock statistics
  const stats = {
    totalDocuments: 1247,
    totalSize: '2.3 GB',
    recentUploads: 23,
    pendingReview: 5,
    byModule: {
      hr: 456,
      finance: 234,
      procurement: 189,
      assets: 156,
      hse: 123,
      general: 89
    }
  };

  const modules = [
    { id: 'all', name: 'All Documents', icon: <FolderIcon />, color: theme.palette.primary.main },
    { id: 'hr', name: 'HR Documents', icon: <GroupIcon />, color: theme.palette.success.main },
    { id: 'finance', name: 'Finance', icon: <TrendingUpIcon />, color: theme.palette.info.main },
    { id: 'procurement', name: 'Procurement', icon: <ArchiveIcon />, color: theme.palette.warning.main },
    { id: 'assets', name: 'Assets', icon: <StorageIcon />, color: theme.palette.secondary.main },
    { id: 'hse', name: 'HSE', icon: <SecurityIcon />, color: theme.palette.error.main },
    { id: 'general', name: 'General', icon: <DocumentIcon />, color: theme.palette.grey[600] }
  ];

  const fileTypes = [
    { type: 'pdf', count: 456, icon: <PdfIcon />, color: '#f44336' },
    { type: 'documents', count: 234, icon: <WordIcon />, color: '#2196f3' },
    { type: 'spreadsheets', count: 189, icon: <ExcelIcon />, color: '#4caf50' },
    { type: 'images', count: 156, icon: <ImageIcon />, color: '#ff9800' },
    { type: 'archives', count: 89, icon: <ArchiveIcon />, color: '#9c27b0' }
  ];

  const recentActivities = [
    { id: 1, action: 'uploaded', file: 'Employee Handbook 2024.pdf', user: 'John Doe', time: '2 hours ago', module: 'hr' },
    { id: 2, action: 'downloaded', file: 'Q3 Financial Report.xlsx', user: 'Jane Smith', time: '4 hours ago', module: 'finance' },
    { id: 3, action: 'uploaded', file: 'Safety Training Certificate.pdf', user: 'Mike Johnson', time: '6 hours ago', module: 'hse' },
    { id: 4, action: 'updated', file: 'Vendor Contract Template.docx', user: 'Sarah Wilson', time: '1 day ago', module: 'procurement' },
    { id: 5, action: 'downloaded', file: 'Asset Inventory List.xlsx', user: 'David Brown', time: '2 days ago', module: 'assets' }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getModuleStats = (moduleId: string) => {
    if (moduleId === 'all') {
      return {
        count: stats.totalDocuments,
        size: stats.totalSize,
        recent: stats.recentUploads
      };
    }
    return {
      count: stats.byModule[moduleId as keyof typeof stats.byModule] || 0,
      size: '0 MB',
      recent: 0
    };
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
    }}>
      <AnimatePresence mode="wait">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 3,
              p: 4,
              mb: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.2), 
                width: 80, 
                height: 80,
                border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <FolderIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Document Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, mb: 2 }}>
                  Centralized document storage and management system
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Chip
                    icon={<DocumentIcon />}
                    label={`${stats.totalDocuments} Documents`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<StorageIcon />}
                    label={`${stats.totalSize} Total Size`}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<UploadIcon />}
                    label={`${stats.recentUploads} Recent Uploads`}
                    color="success"
                    variant="outlined"
                  />
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
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`, 
              zIndex: 0 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -100, 
              left: -100, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: `linear-gradient(225deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.info.main, 0.05)})`, 
              zIndex: 0 
            }} />
          </Paper>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card
                  sx={{
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(module.color, 0.2)}`,
                      borderColor: module.color
                    }
                  }}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Avatar sx={{ bgcolor: alpha(module.color, 0.1), color: module.color }}>
                        {module.icon}
                      </Avatar>
                      <Chip
                        label={selectedModule === module.id ? 'Active' : 'View'}
                        size="small"
                        color={selectedModule === module.id ? 'primary' : 'default'}
                        variant={selectedModule === module.id ? 'filled' : 'outlined'}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {module.name}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color={module.color}>
                          {getModuleStats(module.id).count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Documents
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight={600}>
                          {getModuleStats(module.id).size}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Size
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 3 }}>
                <Tab label="Documents" />
                <Tab label="File Types" />
                <Tab label="Recent Activity" />
                <Tab label="Analytics" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Search and Filters */}
                  <Box display="flex" gap={2} alignItems="center" mb={3}>
                    <TextField
                      size="small"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      sx={{ flexGrow: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Module</InputLabel>
                      <Select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        label="Module"
                      >
                        {modules.map((module) => (
                          <MenuItem key={module.id} value={module.id}>
                            {module.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      size="small"
                    >
                      More Filters
                    </Button>
                  </Box>

                  {/* Document Manager */}
                  <DocumentManager
                    module={selectedModule === 'all' ? 'general' : selectedModule}
                    title={`${modules.find(m => m.id === selectedModule)?.name || 'All Documents'}`}
                    showUpload={true}
                    showStats={true}
                    maxHeight="70vh"
                  />
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" gutterBottom mb={3}>
                    Document Types Overview
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    {fileTypes.map((fileType, index) => (
                      <motion.div
                        key={fileType.type}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <Card sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar sx={{ bgcolor: alpha(fileType.color, 0.1), color: fileType.color, mx: 'auto', mb: 1 }}>
                            {fileType.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600}>
                            {fileType.count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {fileType.type}
                          </Typography>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" gutterBottom mb={3}>
                    Recent Activity
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <Card sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                              {activity.action === 'uploaded' ? <UploadIcon /> : 
                               activity.action === 'downloaded' ? <DownloadIcon /> : 
                               <HistoryIcon />}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {activity.user} {activity.action} {activity.file}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time} • {activity.module.toUpperCase()} Module
                              </Typography>
                            </Box>
                            <Chip
                              label={activity.module.toUpperCase()}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" gutterBottom mb={3}>
                    Document Analytics
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                    <Card sx={{ p: 3 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Storage Usage
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {modules.slice(1).map((module) => (
                          <Box key={module.id} display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: module.color }} />
                              <Typography variant="body2">{module.name}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {Math.round((stats.byModule[module.id as keyof typeof stats.byModule] / stats.totalDocuments) * 100)}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                    
                    <Card sx={{ p: 3 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Upload Trends
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">This Week</Typography>
                          <Typography variant="body2" fontWeight={600}>23 files</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">This Month</Typography>
                          <Typography variant="body2" fontWeight={600}>156 files</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">This Year</Typography>
                          <Typography variant="body2" fontWeight={600}>1,247 files</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                </motion.div>
              )}
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default DocumentManagementPage;
