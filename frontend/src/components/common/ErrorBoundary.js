import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

/**
 * ErrorBoundary component to catch and handle errors in React component tree
 * Particularly useful for admin panel components
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details to console for debugging
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo);
        console.error('Component stack:', errorInfo.componentStack);

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            return (
                <Container maxWidth="md">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '60vh',
                            py: 4,
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >
                            <ErrorIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'error.main',
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h4" component="h1" gutterBottom>
                                Oops! Something went wrong
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {this.props.fallbackMessage ||
                                    'An unexpected error occurred. Please try again or contact support if the problem persists.'}
                            </Typography>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1,
                                        textAlign: 'left',
                                        overflow: 'auto',
                                        maxHeight: 300,
                                    }}
                                >
                                    <Typography variant="subtitle2" color="error" gutterBottom>
                                        Error Details (Development Only):
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        component="pre"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.handleReset}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => window.location.href = '/'}
                                >
                                    Go to Home
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
