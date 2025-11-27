/**
 * Tests for notification utility
 */

import { enqueueSnackbar } from 'notistack';
import {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AuthNotifications,
    AdminNotifications,
    AppNotifications,
} from '../notifications';

// Mock notistack
jest.mock('notistack', () => ({
    enqueueSnackbar: jest.fn(),
}));

describe('Notification Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic notification functions', () => {
        test('showSuccess should call enqueueSnackbar with success variant', () => {
            showSuccess('Test success message');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test success message',
                expect.objectContaining({
                    variant: 'success',
                    autoHideDuration: 5000,
                })
            );
        });

        test('showError should call enqueueSnackbar with error variant', () => {
            showError('Test error message');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test error message',
                expect.objectContaining({
                    variant: 'error',
                    autoHideDuration: 7000,
                })
            );
        });

        test('showWarning should call enqueueSnackbar with warning variant', () => {
            showWarning('Test warning message');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test warning message',
                expect.objectContaining({
                    variant: 'warning',
                    autoHideDuration: 6000,
                })
            );
        });

        test('showInfo should call enqueueSnackbar with info variant', () => {
            showInfo('Test info message');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test info message',
                expect.objectContaining({
                    variant: 'info',
                    autoHideDuration: 5000,
                })
            );
        });

        test('should allow custom options to override defaults', () => {
            showSuccess('Test message', { autoHideDuration: 3000 });

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test message',
                expect.objectContaining({
                    autoHideDuration: 3000,
                })
            );
        });
    });

    describe('AuthNotifications', () => {
        test('loginSuccess should show personalized message with user name', () => {
            AuthNotifications.loginSuccess('John');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Welcome back, John!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('loginSuccess should show generic message without user name', () => {
            AuthNotifications.loginSuccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Successfully logged in!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('registrationSuccess should show personalized welcome message', () => {
            AuthNotifications.registrationSuccess('Jane');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Welcome to PSDAHS Alumni, Jane!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('registrationSuccess should show generic welcome message', () => {
            AuthNotifications.registrationSuccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Registration successful! Welcome to PSDAHS Alumni!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('sessionExpired should show warning notification', () => {
            AuthNotifications.sessionExpired();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Your session has expired. Please log in again to continue.',
                expect.objectContaining({
                    variant: 'warning',
                    autoHideDuration: 8000,
                })
            );
        });

        test('unauthorizedAccess should show error notification', () => {
            AuthNotifications.unauthorizedAccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'You do not have permission to access this resource.',
                expect.objectContaining({
                    variant: 'error',
                    autoHideDuration: 6000,
                })
            );
        });

        test('logoutSuccess should show info notification', () => {
            AuthNotifications.logoutSuccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'You have been logged out successfully.',
                expect.objectContaining({ variant: 'info' })
            );
        });

        test('invalidCredentials should show error notification', () => {
            AuthNotifications.invalidCredentials();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Invalid email or password. Please try again.',
                expect.objectContaining({ variant: 'error' })
            );
        });

        test('networkError should show error notification with longer duration', () => {
            AuthNotifications.networkError();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Unable to connect to the server. Please check your internet connection.',
                expect.objectContaining({
                    variant: 'error',
                    autoHideDuration: 8000,
                })
            );
        });

        test('serverError should show error notification', () => {
            AuthNotifications.serverError();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Something went wrong on our end. Please try again later.',
                expect.objectContaining({ variant: 'error' })
            );
        });

        test('emailExists should show error notification', () => {
            AuthNotifications.emailExists();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'An account with this email already exists. Please use a different email or try logging in.',
                expect.objectContaining({ variant: 'error' })
            );
        });

        test('profileUpdateSuccess should show success notification', () => {
            AuthNotifications.profileUpdateSuccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Your profile has been updated successfully!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('passwordChangeSuccess should show success notification', () => {
            AuthNotifications.passwordChangeSuccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Your password has been changed successfully!',
                expect.objectContaining({ variant: 'success' })
            );
        });
    });

    describe('AdminNotifications', () => {
        test('createSuccess should show success notification with resource type', () => {
            AdminNotifications.createSuccess('Event');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Event created successfully!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('updateSuccess should show success notification with resource type', () => {
            AdminNotifications.updateSuccess('User');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'User updated successfully!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('deleteSuccess should show success notification with resource type', () => {
            AdminNotifications.deleteSuccess('Announcement');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Announcement deleted successfully!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('deleteWarning should show warning notification with resource type', () => {
            AdminNotifications.deleteWarning('Class');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Are you sure you want to delete this Class?',
                expect.objectContaining({ variant: 'warning' })
            );
        });
    });

    describe('AppNotifications', () => {
        test('saveSuccess should show success notification', () => {
            AppNotifications.saveSuccess();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Changes saved successfully!',
                expect.objectContaining({ variant: 'success' })
            );
        });

        test('saveError should show error notification', () => {
            AppNotifications.saveError();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Failed to save changes. Please try again.',
                expect.objectContaining({ variant: 'error' })
            );
        });

        test('copiedToClipboard should show info notification with short duration', () => {
            AppNotifications.copiedToClipboard();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Copied to clipboard!',
                expect.objectContaining({
                    variant: 'info',
                    autoHideDuration: 2000,
                })
            );
        });

        test('validationError should show error notification', () => {
            AppNotifications.validationError();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Please fix the errors in the form before submitting.',
                expect.objectContaining({ variant: 'error' })
            );
        });

        test('requiredFields should show warning notification', () => {
            AppNotifications.requiredFields();

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Please fill in all required fields.',
                expect.objectContaining({ variant: 'warning' })
            );
        });
    });

    describe('Notification configuration', () => {
        test('should prevent duplicate notifications by default', () => {
            showSuccess('Test message');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test message',
                expect.objectContaining({
                    preventDuplicate: true,
                })
            );
        });

        test('should position notifications at top-right by default', () => {
            showInfo('Test message');

            expect(enqueueSnackbar).toHaveBeenCalledWith(
                'Test message',
                expect.objectContaining({
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    },
                })
            );
        });
    });
});
