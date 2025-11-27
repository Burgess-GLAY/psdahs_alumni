import React from 'react';
import { Alert, Button } from '@mui/material';

/**
 * ErrorAlert Component
 * 
 * Reusable error alert component for displaying error messages
 * with optional retry and dismiss functionality.
 * 
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Function} props.onRetry - Optional callback for retry action
 * @param {Function} props.onDismiss - Optional callback for dismiss action
 */
const ErrorAlert = ({ error, onRetry, onDismiss }) => {
    // Don't render if no error
    if (!error) return null;

    return (
        <Alert
            severity="error"
            onClose={onDismiss}
            action={
                onRetry && (
                    <Button color="inherit" size="small" onClick={onRetry}>
                        Retry
                    </Button>
                )
            }
            sx={{
                mb: 2,
            }}
        >
            {error}
        </Alert>
    );
};

export default ErrorAlert;
