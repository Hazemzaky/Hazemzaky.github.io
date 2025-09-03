import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress, Alert,
  Card, CardContent, Stack, Divider, Badge, useTheme, alpha
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachIcon,
  Description as DocumentIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as GetAppIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import api from '../apiBase';

// Interfaces
interface Document {
  _id: string;
  title: string;
  description?: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  module: string;
  category: string;
  subcategory?: string;
  entityType?: string;
  entityId?: string;
  permissions: {
    roles: string[];
    users: string[];
    departments: string[];
    isPublic: boolean;
  };
  currentVersion: number;
  totalVersions: number;
  isLatestVersion: boolean;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  accessCount: number;
  lastAccessedAt?: string;
  expiryDate?: string;
  isExpired: boolean;
  fileSizeFormatted: string;
  downloadUrl: string;
}

interface DocumentManagerProps {
  module: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  showUpload?: boolean;
  showStats?: boolean;
  maxHeight?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  module,
  category,
  entityType,
  entityId,
  title = 'Documents',
  showUpload = true,
  showStats = true,
  maxHeight = '600px'
}) => {
  const theme = useTheme();
  
  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Dialog states
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [auditDialog, setAuditDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    permissions: {
      roles: [module],
      users: [],
      departments: [],
      isPublic: false
    },
    expiryDate: '',
    retentionPeriod: '',
    complianceTags: ''
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

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        module,
        ...(category && { category }),
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
        ...(filterCategory && { category: filterCategory })
      });
      
      const response = await api.get<{
        documents: Document[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`/documents?${params}`);
      
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, [module, category, entityType, entityId, filterCategory]);

  // Load documents on mount and when dependencies change
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploadDialog(true);
    setUploadForm(prev => ({
      ...prev,
      title: acceptedFiles[0].name.split('.')[0] // Default title from filename
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  // Upload documents
  const handleUpload = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      
      // Add files (this would be handled by the dropzone in a real implementation)
      // For now, we'll simulate the upload
      
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('module', module);
      formData.append('category', category || 'general');
      formData.append('entityType', entityType || '');
      formData.append('entityId', entityId || '');
      formData.append('tags', uploadForm.tags);
      formData.append('permissions', JSON.stringify(uploadForm.permissions));
      formData.append('expiryDate', uploadForm.expiryDate);
      formData.append('retentionPeriod', uploadForm.retentionPeriod);
      formData.append('complianceTags', uploadForm.complianceTags);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadDialog(false);
        setUploading(false);
        setUploadProgress(0);
        loadDocuments();
      }, 500);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Download document
  const handleDownload = async (document: Document) => {
    try {
      const response = await api.get(`/documents/${document._id}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data as BlobPart]);
      saveAs(blob, document.originalName);
      
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'archived': return theme.palette.warning.main;
      case 'deleted': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <AttachIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
            
            {showUpload && (
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialog(true)}
                >
                  Upload
                </Button>
                {selectedDocuments.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    onClick={() => {
                      // Handle bulk download
                      selectedDocuments.forEach(docId => {
                        const doc = documents.find(d => d._id === docId);
                        if (doc) handleDownload(doc);
                      });
                    }}
                  >
                    Download ({selectedDocuments.length})
                  </Button>
                )}
              </Box>
            )}
          </Box>
          
          {/* Search and Filters */}
          <Box display="flex" gap={2} alignItems="center">
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
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="contracts">Contracts</MenuItem>
                <MenuItem value="invoices">Invoices</MenuItem>
                <MenuItem value="employee-docs">Employee Docs</MenuItem>
                <MenuItem value="safety-reports">Safety Reports</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Documents Table */}
        <Box sx={{ maxHeight, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading documents...
              </Typography>
            </Box>
          ) : filteredDocuments.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <DocumentIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchTerm || filterCategory ? 'Try adjusting your search criteria' : 'Upload your first document to get started'}
              </Typography>
              {showUpload && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialog(true)}
                >
                  Upload Document
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === filteredDocuments.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(filteredDocuments.map(d => d._id));
                          } else {
                            setSelectedDocuments([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Access</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <motion.tr
                      key={document._id}
                      variants={itemVariants}
                      style={{
                        background: selectedDocuments.includes(document._id) 
                          ? alpha(theme.palette.primary.main, 0.05) 
                          : 'transparent'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(prev => [...prev, document._id]);
                            } else {
                              setSelectedDocuments(prev => prev.filter(id => id !== document._id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                            {getFileIcon(document.mimeType)}
                          </Typography>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {document.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {document.originalName}
                            </Typography>
                            {document.tags.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                {document.tags.slice(0, 2).map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, fontSize: '0.7rem', height: 20 }}
                                  />
                                ))}
                                {document.tags.length > 2 && (
                                  <Chip
                                    label={`+${document.tags.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={document.category}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {document.fileSizeFormatted}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            v{document.currentVersion}
                          </Typography>
                          {document.totalVersions > 1 && (
                            <Tooltip title={`${document.totalVersions} total versions`}>
                              <Badge
                                badgeContent={document.totalVersions}
                                color="secondary"
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                              >
                                <HistoryIcon sx={{ fontSize: 16 }} />
                              </Badge>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {document.uploadedBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {document.accessCount}
                          </Typography>
                          {document.permissions.isPublic ? (
                            <Tooltip title="Public Document">
                              <PublicIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Restricted Access">
                              <LockIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(document)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedDocument(document);
                                setAuditDialog(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton size="small">
                              <MoreIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Dropzone */}
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse files
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, Images, TXT, ZIP, RAR (Max 50MB)
              </Typography>
            </Box>

            {/* Upload Form */}
            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <TextField
                label="Title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Tags (comma-separated)"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Expiry Date"
                type="date"
                value={uploadForm.expiryDate}
                onChange={(e) => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Retention Period (days)"
                type="number"
                value={uploadForm.retentionPeriod}
                onChange={(e) => setUploadForm(prev => ({ ...prev, retentionPeriod: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Compliance Tags"
                value={uploadForm.complianceTags}
                onChange={(e) => setUploadForm(prev => ({ ...prev, complianceTags: e.target.value }))}
                fullWidth
              />
            </Box>

            {/* Upload Progress */}
            {uploading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !uploadForm.title}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog open={auditDialog} onClose={() => setAuditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Document Details</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedDocument.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDocument.originalName}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Size
                    </Typography>
                    <Typography variant="body2">
                      {selectedDocument.fileSizeFormatted}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="body2">
                      {selectedDocument.currentVersion} of {selectedDocument.totalVersions}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Uploaded
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedDocument.uploadedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Access Count
                    </Typography>
                    <Typography variant="body2">
                      {selectedDocument.accessCount}
                    </Typography>
                  </Box>
                </Box>
                
                {selectedDocument.description && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedDocument.description}
                      </Typography>
                    </Box>
                  </>
                )}
                
                {selectedDocument.tags.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tags
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedDocument.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialog(false)}>
            Close
          </Button>
          {selectedDocument && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleDownload(selectedDocument);
                setAuditDialog(false);
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default DocumentManager;
