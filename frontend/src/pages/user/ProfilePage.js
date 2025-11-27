import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Autocomplete
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Save as SaveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../../features/auth/authSlice';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number is not valid'),
  graduationYear: Yup.number()
    .min(1950, 'Graduation year must be after 1950')
    .max(new Date().getFullYear() + 5, 'Invalid graduation year')
    .required('Graduation year is required'),
  bio: Yup.string().max(500, 'Bio must be at most 500 characters'),
});

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    graduationYear: new Date().getFullYear(),
    major: '',
    bio: '',
    profilePicture: null,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/me', {
        headers: { 'x-auth-token': token }
      });

      const data = response.data.data;
      setUserData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        graduationYear: data.graduationYear || new Date().getFullYear(),
        major: data.major || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || null,
      });

      formik.setValues({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        graduationYear: data.graduationYear || new Date().getFullYear(),
        major: data.major || '',
        bio: data.bio || '',
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      graduationYear: userData.graduationYear,
      major: userData.major,
      bio: userData.bio,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        setError(null);
        setSuccess(false);

        const token = localStorage.getItem('token');

        // Update profile data
        const response = await axios.put('/api/users/me', values, {
          headers: { 'x-auth-token': token }
        });

        // Upload avatar if changed
        if (avatar) {
          const formData = new FormData();
          formData.append('avatar', avatar);

          const avatarResponse = await axios.put('/api/users/me/avatar', formData, {
            headers: {
              'x-auth-token': token,
              'Content-Type': 'multipart/form-data'
            }
          });

          const updatedProfilePicture = avatarResponse.data.data.profilePicture;

          setUserData(prev => ({
            ...prev,
            profilePicture: updatedProfilePicture
          }));

          // Update Redux store with new profile picture
          dispatch(updateUser({ profilePicture: updatedProfilePicture }));
        }

        // Update local state
        setUserData(prev => ({ ...prev, ...values }));

        // Update Redux store with updated profile data
        dispatch(updateUser(values));

        setSuccess(true);
        setIsEditing(false);
        setAvatar(null);
        setPreview(null);

        // Refresh profile data
        await fetchUserProfile();
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err.response?.data?.error || 'Failed to update profile');
      } finally {
        setSaving(false);
      }
    },
  });

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    formik.resetForm();
    setIsEditing(false);
    setPreview(null);
    setAvatar(null);
    setSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
            Profile updated successfully!
          </Alert>
        )}

        <Card>
          <CardHeader
            title="Personal Information"
            action={
              !isEditing ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              ) : null
            }
          />
          <Divider />
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar
                        src={preview || getImageUrl(userData.profilePicture)}
                        sx={{ width: 150, height: 150, mb: 2 }}
                      >
                        {!preview && !userData.profilePicture && (
                          <PhotoCameraIcon sx={{ fontSize: 60 }} />
                        )}
                      </Avatar>
                      {isEditing && (
                        <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            backgroundColor: 'background.paper',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                          <PhotoCameraIcon />
                        </IconButton>
                      )}
                    </Box>
                    {isEditing && (
                      <Typography variant="body2" color="textSecondary" align="center">
                        Click on the camera icon to change your profile picture
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="graduationYear"
                        name="graduationYear"
                        label="Graduation Year"
                        type="number"
                        value={formik.values.graduationYear}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.graduationYear && Boolean(formik.errors.graduationYear)}
                        helperText={formik.touched.graduationYear && formik.errors.graduationYear}
                        disabled={!isEditing}
                        InputProps={{
                          inputProps: {
                            min: 1950,
                            max: new Date().getFullYear() + 5
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        freeSolo
                        id="major"
                        options={[
                          'Computer Science',
                          'Software Engineering',
                          'Electrical Engineering',
                          'Mechanical Engineering',
                          'Civil Engineering',
                          'Business Administration',
                          'Information Technology',
                          'Computer Engineering',
                          'BSc Software Engineering',
                          'Master Computer Technology',
                          'MSc Computer Science',
                          'MBA',
                          'Other'
                        ]}
                        value={formik.values.major || ''}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('major', newValue || '');
                        }}
                        onInputChange={(event, newInputValue) => {
                          formik.setFieldValue('major', newInputValue || '');
                        }}
                        disabled={!isEditing}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Major"
                            name="major"
                            onBlur={formik.handleBlur}
                            error={formik.touched.major && Boolean(formik.errors.major)}
                            helperText={
                              formik.touched.major && formik.errors.major
                                ? formik.errors.major
                                : 'Select from list or type your own major'
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="bio"
                        name="bio"
                        label="Bio"
                        multiline
                        rows={4}
                        value={formik.values.bio}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.bio && Boolean(formik.errors.bio)}
                        helperText={
                          formik.touched.bio && formik.errors.bio
                            ? formik.errors.bio
                            : `${formik.values.bio?.length || 0}/500`
                        }
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>

                  {isEditing && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ProfilePage;
