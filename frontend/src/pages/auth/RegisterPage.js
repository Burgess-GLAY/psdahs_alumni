import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthModalContext } from '../../contexts/AuthModalContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { openRegister } = useAuthModalContext();

  useEffect(() => {
    // Open the registration modal
    openRegister();
    
    // Navigate to home page after a short delay to ensure the modal opens
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 50);

    return () => clearTimeout(timer);
  }, [navigate, openRegister]);

  // Show a loading indicator while redirecting
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
};

export default RegisterPage;
