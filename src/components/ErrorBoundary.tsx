import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box sx={{ p: 3 }}>
          <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Typography variant="h5" color="error">
                  Something went wrong
                </Typography>
              </Box>
              
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Error Details</AlertTitle>
                {this.state.error && (
                  <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.875rem' }}>
                    {this.state.error.toString()}
                  </Typography>
                )}
              </Alert>

              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BugReportIcon />}
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </Box>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Error Stack Trace:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="pre" 
                    sx={{ 
                      bgcolor: 'grey.100', 
                      p: 2, 
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem'
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

// PnL-specific error boundary with custom styling
export const PnLErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme();

  const customFallback = (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Card sx={{ 
        maxWidth: 500, 
        mx: 'auto',
        border: `2px solid ${theme.palette.error.main}`,
        borderRadius: 2
      }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
            <Typography variant="h5" color="error" gutterBottom>
              P&L System Error
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              There was an error loading the P&L data. This might be due to a network issue or server problem.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Reload P&L Page
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <ErrorBoundary fallback={customFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Chart-specific error boundary
export const ChartErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const customFallback = (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>Chart Loading Error</AlertTitle>
        Unable to load chart data. Please try refreshing the page.
      </Alert>
      <Button
        variant="outlined"
        size="small"
        startIcon={<RefreshIcon />}
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </Box>
  );

  return (
    <ErrorBoundary fallback={customFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
