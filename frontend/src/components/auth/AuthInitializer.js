import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth, selectIsInitialized } from '../../features/auth/authSlice';
import LoadingScreen from '../common/LoadingScreen';

/**
 * AuthInitializer Component
 * 
 * Wraps the application and initializes authentication state on mount.
 * Displays a loading screen while validating the stored token.
 * Once initialized, renders the children components.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render after initialization
 */
const AuthInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const isInitialized = useSelector(selectIsInitialized);

    useEffect(() => {
        // Dispatch initializeAuth on component mount to validate token
        dispatch(initializeAuth());
    }, [dispatch]);

    // Show loading screen while authentication is being initialized
    if (!isInitialized) {
        return <LoadingScreen message="Initializing..." />;
    }

    // Once initialized, render the children
    return children;
};

export default AuthInitializer;
