/**
 * Notification Demo Component
 * 
 * This component demonstrates all available notifications.
 * Use this for testing and showcasing the notification system.
 */

import React from 'react';
import { showSuccess, showError, showWarning, showInfo } from '../../utils/notifications';

const NotificationDemo = () => {
    const handleSuccess = () => {
        showSuccess('Success! Operation completed successfully.');
    };

    const handleError = () => {
        showError('Error! Something went wrong.');
    };

    const handleWarning = () => {
        showWarning('Warning! Please review this action.');
    };

    const handleInfo = () => {
        showInfo('Info: Here is some information.');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Notification Demo</h2>
            <p>Click the buttons below to test different notification types:</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={handleSuccess} style={{ padding: '10px 20px' }}>
                    Show Success
                </button>
                <button onClick={handleError} style={{ padding: '10px 20px' }}>
                    Show Error
                </button>
                <button onClick={handleWarning} style={{ padding: '10px 20px' }}>
                    Show Warning
                </button>
                <button onClick={handleInfo} style={{ padding: '10px 20px' }}>
                    Show Info
                </button>
            </div>
        </div>
    );
};

export default NotificationDemo;