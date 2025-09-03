import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Snackbar, TextField, Card, CardContent, Avatar, Tooltip, useTheme, alpha, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, IconButton, Badge, Divider, Stack, LinearProgress
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  AutoFixHigh as AutoMatchIcon,
  Link as LinkIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../apiBase';

// Interfaces
interface ReconciliationSession {
  _id: string;
  accountId: string;
  accountName: string;
  accountType: 'bank' | 'vendor' | 'customer' | 'inter-module';
  period: {
    startDate: string;
    endDate: string;
  };
  statementBalance: number;
  glBalance: number;
  difference: number;
  status: 'draft' | 'in-progress' | 'completed' | 'reviewed';
  summary: {
    totalItems: number;
    matchedItems: number;
    unmatchedItems: number;
    pendingReview: number;
    adjustmentEntries: number;
  };
  createdAt: string;
}

// API Response Interfaces
interface DashboardResponse {
  summary: {
    totalSessions: number;
    totalDifference: number;
    avgDifference: number;
    completedSessions: number;
    inProgressSessions: number;
    totalMatchedItems: number;
    totalUnmatchedItems: number;
  };
  recentSessions: ReconciliationSession[];
  accounts: Account[];
}

interface SessionDetailsResponse {
  session: ReconciliationSession;
  items: ReconciliationItem[];
  stats: {
    matched: number;
    unmatched: number;
    pendingReview: number;
    excluded: number;
    totalItems: number;
    avgConfidence: number;
    avgQualityScore: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface AutoMatchResponse {
  message: string;
  matchedCount: number;
  pendingReviewCount: number;
}

interface ReconciliationItem {
  _id: string;
  sessionId: string;
  matchStatus: 'matched' | 'unmatched' | 'pending-review' | 'excluded';
  matchType?: 'exact' | 'fuzzy' | 'manual';
  matchConfidence?: number;
  glEntry?: {
    id: string;
    date: string;
    reference: string;
    description: string;
    amount: number;
    accountCode: string;
    accountName: string;
  };
  statementEntry?: {
    id: string;
    date: string;
    reference?: string;
    description: string;
    amount: number;
    balance?: number;
    transactionType?: string;
    source: string;
  };
  matchingDetails?: {
    dateDifference: number;
    amountDifference: number;
    referenceMatch: boolean;
    descriptionSimilarity: number;
    matchedBy: string;
    matchedAt: string;
  };
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  lastReconciled?: string;
}

const ReconciliationPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedSession, setSelectedSession] = useState<ReconciliationSession | null>(null);
  const [sessionItems, setSessionItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  
  // Dialog states
  const [createSessionDialog, setCreateSessionDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [adjustmentDialog, setAdjustmentDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [newSession, setNewSession] = useState({
    accountId: '',
    accountName: '',
    accountType: 'bank' as 'bank' | 'vendor' | 'customer' | 'inter-module',
    startDate: '',
    endDate: '',
    matchingRules: {
      dateTolerance: 3,
      amountTolerance: 0.01,
      autoMatchEnabled: true
    }
  });
  
  const [adjustment, setAdjustment] = useState({
    description: '',
    amount: 0,
    accountCode: '',
    reference: ''
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get<DashboardResponse>('/reconciliation/dashboard');
      setSessions(response.data.recentSessions || []);
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await api.get<SessionDetailsResponse>(`/reconciliation/sessions/${sessionId}`);
      setSelectedSession(response.data.session);
      setSessionItems(response.data.items || []);
    } catch (error) {
      console.error('Error loading session details:', error);
      showSnackbar('Failed to load session details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const response = await api.post('/reconciliation/sessions', newSession);
      showSnackbar('Reconciliation session created successfully', 'success');
      setCreateSessionDialog(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error creating session:', error);
      showSnackbar('Failed to create reconciliation session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadStatement = async () => {
    if (!selectedFile || !selectedSession) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('statement', selectedFile);
      
      const response = await api.post(
        `/reconciliation/sessions/${selectedSession._id}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      showSnackbar('Statement uploaded and parsed successfully', 'success');
      setUploadDialog(false);
      setSelectedFile(null);
      loadSessionDetails(selectedSession._id);
    } catch (error) {
      console.error('Error uploading statement:', error);
      showSnackbar('Failed to upload statement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const performAutoMatch = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      const response = await api.post<AutoMatchResponse>(`/reconciliation/sessions/${selectedSession._id}/auto-match`);
      showSnackbar(`Auto-matching completed: ${response.data.matchedCount} matched, ${response.data.pendingReviewCount} pending review`, 'success');
      loadSessionDetails(selectedSession._id);
    } catch (error) {
      console.error('Error performing auto-match:', error);
      showSnackbar('Failed to perform auto-matching', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createAdjustingEntry = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      const response = await api.post(`/reconciliation/sessions/${selectedSession._id}/adjustments`, adjustment);
      showSnackbar('Adjusting entry created successfully', 'success');
      setAdjustmentDialog(false);
      setAdjustment({ description: '', amount: 0, accountCode: '', reference: '' });
      loadSessionDetails(selectedSession._id);
    } catch (error) {
      console.error('Error creating adjusting entry:', error);
      showSnackbar('Failed to create adjusting entry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const completeReconciliation = async () => {
    if (!selectedSession) return;
    
    try {
      setLoading(true);
      await api.post(`/reconciliation/sessions/${selectedSession._id}/complete`);
      showSnackbar('Reconciliation completed successfully', 'success');
      loadDashboardData();
      setSelectedSession(null);
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      showSnackbar('Failed to complete reconciliation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'in-progress': return theme.palette.warning.main;
      case 'draft': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return theme.palette.success.main;
      case 'unmatched': return theme.palette.error.main;
      case 'pending-review': return theme.palette.warning.main;
      case 'excluded': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  // Dashboard Summary
  const dashboardSummary = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    inProgressSessions: sessions.filter(s => s.status === 'in-progress').length,
    totalDifference: sessions.reduce((sum, s) => sum + s.difference, 0)
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        p: 3
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 4,
              mb: 3,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    width: 64,
                    height: 64,
                    border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`
                  }}
                >
                  <AccountBalanceIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Reconciliation Center
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Match bank statements with accounting records - IFRS Compliant
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateSessionDialog(true)}
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  color: 'white',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.3),
                  }
                }}
              >
                New Session
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
            {[
              {
                title: 'Total Sessions',
                value: dashboardSummary.totalSessions,
                icon: <AssessmentIcon />,
                color: theme.palette.primary.main,
                bgColor: alpha(theme.palette.primary.main, 0.1)
              },
              {
                title: 'Completed',
                value: dashboardSummary.completedSessions,
                icon: <CheckCircleIcon />,
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1)
              },
              {
                title: 'In Progress',
                value: dashboardSummary.inProgressSessions,
                icon: <WarningIcon />,
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1)
              },
              {
                title: 'Total Difference',
                value: formatCurrency(dashboardSummary.totalDifference),
                icon: dashboardSummary.totalDifference >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
                color: dashboardSummary.totalDifference >= 0 ? theme.palette.success.main : theme.palette.error.main,
                bgColor: dashboardSummary.totalDifference >= 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1)
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    background: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${alpha(card.color, 0.3)}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: card.color, width: 40, height: 40, mr: 1 }}>
                        {card.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: card.color }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
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
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 60
                }
              }}
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssessmentIcon />
                    Sessions Overview
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalanceIcon />
                    Account Balances
                  </Box>
                }
              />
              {selectedSession && (
                <Tab
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <ReceiptIcon />
                      {selectedSession.accountName}
                      <Badge
                        badgeContent={selectedSession.summary.unmatchedItems}
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                />
              )}
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={600}>
                      Recent Reconciliation Sessions
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={loadDashboardData}
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {sessions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <AccountBalanceIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No reconciliation sessions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Create your first reconciliation session to get started
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateSessionDialog(true)}
                      >
                        Create Session
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>GL Balance</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Statement Balance</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Difference</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sessions.map((session) => (
                            <TableRow
                              key={session._id}
                              sx={{
                                '&:hover': {
                                  background: alpha(theme.palette.primary.main, 0.02)
                                }
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {session.accountName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.accountId}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={session.accountType}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(session.period.startDate).toLocaleDateString()} - {new Date(session.period.endDate).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(session.glBalance)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(session.statementBalance)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    color: session.difference >= 0 ? theme.palette.success.main : theme.palette.error.main
                                  }}
                                >
                                  {formatCurrency(session.difference)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={session.status}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(getStatusColor(session.status), 0.1),
                                    color: getStatusColor(session.status),
                                    border: `1px solid ${alpha(getStatusColor(session.status), 0.3)}`
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" gap={1}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedSession(session);
                                        loadSessionDetails(session._id);
                                        setActiveTab(2);
                                      }}
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {session.status === 'draft' && (
                                    <Tooltip title="Upload Statement">
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setSelectedSession(session);
                                          setUploadDialog(true);
                                        }}
                                      >
                                        <CloudUploadIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Account Balances for Reconciliation
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Account Code</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Current Balance</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Last Reconciled</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow
                            key={account.id}
                            sx={{
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.02)
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {account.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {account.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={account.type}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(account.balance)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {account.lastReconciled ? new Date(account.lastReconciled).toLocaleDateString() : 'Never'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  setNewSession({
                                    ...newSession,
                                    accountId: account.id,
                                    accountName: account.name,
                                    accountType: account.type === 'asset' ? 'bank' : 'vendor'
                                  });
                                  setCreateSessionDialog(true);
                                }}
                              >
                                Reconcile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 2 && selectedSession && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedSession.accountName} - Reconciliation Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Period: {new Date(selectedSession.period.startDate).toLocaleDateString()} - {new Date(selectedSession.period.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      {selectedSession.status === 'in-progress' && (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<AutoMatchIcon />}
                            onClick={performAutoMatch}
                            disabled={loading}
                          >
                            Auto Match
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setAdjustmentDialog(true)}
                          >
                            Add Adjustment
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={completeReconciliation}
                            disabled={loading || selectedSession.summary.unmatchedItems > 0}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Session Summary */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                    {[
                      { label: 'Total Items', value: selectedSession.summary.totalItems, color: theme.palette.primary.main },
                      { label: 'Matched', value: selectedSession.summary.matchedItems, color: theme.palette.success.main },
                      { label: 'Unmatched', value: selectedSession.summary.unmatchedItems, color: theme.palette.error.main },
                      { label: 'Pending Review', value: selectedSession.summary.pendingReview, color: theme.palette.warning.main }
                    ].map((stat) => (
                      <Card key={stat.label} elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: stat.color, fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Card>
                    ))}
                  </Box>

                  {/* Reconciliation Items */}
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Match Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sessionItems.map((item) => (
                          <TableRow
                            key={item._id}
                            sx={{
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.02)
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2">
                                {item.statementEntry?.date ? new Date(item.statementEntry.date).toLocaleDateString() : 
                                 item.glEntry?.date ? new Date(item.glEntry.date).toLocaleDateString() : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.statementEntry?.description || item.glEntry?.description || '-'}
                              </Typography>
                              {item.statementEntry?.reference && (
                                <Typography variant="caption" color="text.secondary">
                                  Ref: {item.statementEntry.reference}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(item.statementEntry?.amount || item.glEntry?.amount || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.matchStatus}
                                size="small"
                                sx={{
                                  bgcolor: alpha(getMatchStatusColor(item.matchStatus), 0.1),
                                  color: getMatchStatusColor(item.matchStatus),
                                  border: `1px solid ${alpha(getMatchStatusColor(item.matchStatus), 0.3)}`
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {item.matchConfidence && (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={item.matchConfidence}
                                    sx={{
                                      width: 60,
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: alpha(theme.palette.grey[300], 0.3),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: item.matchConfidence > 80 ? theme.palette.success.main : 
                                                item.matchConfidence > 60 ? theme.palette.warning.main : theme.palette.error.main
                                      }
                                    }}
                                  />
                                  <Typography variant="caption">
                                    {item.matchConfidence}%
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                {item.matchStatus === 'unmatched' && (
                                  <Tooltip title="Manual Match">
                                    <IconButton size="small">
                                      <LinkIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="View Details">
                                  <IconButton size="small">
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>

        {/* Create Session Dialog */}
        <Dialog open={createSessionDialog} onClose={() => setCreateSessionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Reconciliation Session</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  value={newSession.accountId}
                  onChange={(e) => {
                    const account = accounts.find(a => a.id === e.target.value);
                    setNewSession({
                      ...newSession,
                      accountId: e.target.value,
                      accountName: account?.name || ''
                    });
                  }}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={newSession.accountType}
                  onChange={(e) => setNewSession({ ...newSession, accountType: e.target.value as any })}
                >
                  <MenuItem value="bank">Bank</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="inter-module">Inter-Module</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Start Date"
                type="date"
                value={newSession.startDate}
                onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={newSession.endDate}
                onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateSessionDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={createNewSession}
              disabled={loading || !newSession.accountId || !newSession.startDate || !newSession.endDate}
            >
              Create Session
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Statement Dialog */}
        <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Statement</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose File
                <input type="file" accept=".csv,.xlsx,.pdf" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={uploadStatement}
              disabled={!selectedFile || loading}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* Adjustment Dialog */}
        <Dialog open={adjustmentDialog} onClose={() => setAdjustmentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Adjusting Entry</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
              <TextField
                label="Description"
                value={adjustment.description}
                onChange={(e) => setAdjustment({ ...adjustment, description: e.target.value })}
                fullWidth
              />
              <TextField
                label="Amount"
                type="number"
                value={adjustment.amount}
                onChange={(e) => setAdjustment({ ...adjustment, amount: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Account Code"
                value={adjustment.accountCode}
                onChange={(e) => setAdjustment({ ...adjustment, accountCode: e.target.value })}
                fullWidth
              />
              <TextField
                label="Reference"
                value={adjustment.reference}
                onChange={(e) => setAdjustment({ ...adjustment, reference: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustmentDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={createAdjustingEntry}
              disabled={loading || !adjustment.description || !adjustment.amount || !adjustment.accountCode}
            >
              Create Entry
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReconciliationPage;