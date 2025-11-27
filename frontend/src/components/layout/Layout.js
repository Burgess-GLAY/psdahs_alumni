import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthModalContext } from '../../contexts/AuthModalContext';

/**
 * Main layout component that provides the overall structure of the application
 * - Includes the Navbar at the top
 * - Handles proper spacing and scrolling
 * - Ensures content is accessible and responsive
 */
const Layout = () => {
  const { openLogin, openRegister } = useAuthModalContext();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar onLoginClick={openLogin} onSignUpClick={openRegister} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.background.default,
          paddingTop: { xs: '56px', sm: '64px' } // Account for fixed AppBar height
        }}
      >
        <Toolbar /> {/* This Toolbar pushes content below the fixed AppBar */}
        <Box sx={{
          flex: 1,
          width: '100%',
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 2, sm: 2.5, md: 3 },
          boxSizing: 'border-box',
          overflowX: 'hidden' // Prevent horizontal scroll on mobile
        }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
