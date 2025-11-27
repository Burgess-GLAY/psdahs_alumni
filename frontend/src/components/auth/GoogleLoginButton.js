import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../features/auth/authSlice';
import authService from '../../services/authService';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '643185055987-0ppnrtpne7nbh924f5tu5mg9fdr33e7e.apps.googleusercontent.com';

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 50 }, (_, i) => currentYear - i).reverse();

const GoogleLoginButton = ({ buttonText = 'Continue with Google', isSignUp = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    firstName: '',
    lastName: '',
    graduationYear: currentYear,
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdditionalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // For sign-up, we'll handle the response to show additional info dialog
      if (isSignUp) {
        const ticket = await authService.verifyGoogleToken(credentialResponse.credential);
        const { name, email } = ticket.data;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setAdditionalData(prev => ({
          ...prev,
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          email
        }));
        
        setShowAdditionalInfo(true);
        return;
      }
      
      // For sign-in, proceed normally
      await handleGoogleAuth(credentialResponse.credential);
    } catch (error) {
      handleGoogleError(error);
    }
  };

  const handleAdditionalInfoSubmit = async () => {
    try {
      const response = await authService.googleAuth({
        token: window.google.credential,
        isSignUp: true,
        additionalData
      });
      
      handleAuthSuccess(response.data);
      setShowAdditionalInfo(false);
    } catch (error) {
      handleGoogleError(error);
    }
  };

  const handleGoogleAuth = async (token) => {
    const response = await authService.googleAuth({ token });
    handleAuthSuccess(response.data);
  };

  const handleAuthSuccess = (data) => {
    const { token, user } = data;
    dispatch(login({ user, token }));
    
    // Redirect based on user role or previous location
    const redirectPath = location.state?.from?.pathname || 
                        (user.isAdmin ? '/admin/dashboard' : '/dashboard');
    navigate(redirectPath);
    
    toast.success(isSignUp ? 'Account created successfully!' : 'Logged in successfully!');
  };

  const handleGoogleError = (error) => {
    console.error('Google auth error:', error);
    let errorMessage = `Failed to ${isSignUp ? 'sign up' : 'sign in'} with Google`;
    
    if (error.response?.data?.message?.includes('already exists')) {
      errorMessage = 'An account with this email already exists. Please log in instead.';
      navigate('/login', { state: { email: error.response.data.email } });
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    toast.error(errorMessage);
  };

  return (
    <>
      <div className="google-login-container" style={{ width: '100%' }}>
        {GOOGLE_CLIENT_ID ? (
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            onSuccess={handleGoogleSuccess}
            onError={(error) => {
              console.error('Google auth failed:', error);
              toast.error(`Failed to ${isSignUp ? 'sign up' : 'sign in'} with Google. Please try again.`);
            }}
            useOneTap={false}
            text={buttonText}
            size="large"
            width="100%"
            theme="outline"
            shape="rectangular"
            cookiePolicy="single_host_origin"
          />
        ) : (
          <div style={{ color: 'red' }}>Google Client ID is missing. Please check your configuration.</div>
        )}
      </div>

      {/* Additional Info Dialog for Sign Up */}
      <Dialog open={showAdditionalInfo} onClose={() => setShowAdditionalInfo(false)}>
        <DialogTitle>Complete Your Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="First Name"
            name="firstName"
            value={additionalData.firstName}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Last Name"
            name="lastName"
            value={additionalData.lastName}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Graduation Year</InputLabel>
            <Select
              name="graduationYear"
              value={additionalData.graduationYear}
              label="Graduation Year"
              onChange={handleInputChange}
            >
              {graduationYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Phone Number (Optional)"
            name="phone"
            value={additionalData.phone}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdditionalInfo(false)}>Cancel</Button>
          <Button onClick={handleAdditionalInfoSubmit} variant="contained" color="primary">
            Complete Registration
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GoogleLoginButton;
