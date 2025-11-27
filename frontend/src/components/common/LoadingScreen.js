import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingScreen Component
 * 
 * Displays a branded loading screen with PSDAHS Alumni branding.
 * Used during authentication initialization and route protection.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message to display
 */
const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      sx={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
      }}
    >
      {/* PSDAHS Alumni Branding */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          mb: 3,
          letterSpacing: '0.5px',
        }}
      >
        PSDAHS ALUMNI
      </Typography>

      {/* Loading Spinner */}
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
        }}
      />

      {/* Loading Message */}
      <Typography
        variant="h6"
        color="textSecondary"
        sx={{
          mt: 3,
          fontWeight: 400,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
