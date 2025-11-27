import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Chip,
  DialogContentText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import api from '../../services/api';
import axios from 'axios';

// API Service
const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
    return userId;
  }
};

const currentYear = new Date().getFullYear();
const graduationYears = Array.from(
  { length: 50 },
  (_, i) => currentYear - i
).reverse();

const validationSchema = Yup.object({
  firstName: Yup.string()
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .when('password', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Please confirm your password')
    }),
  graduationYear: Yup.number()
    .required('Graduation year is required')
    .min(1950, 'Graduation year must be after 1950')
    .max(currentYear + 5, `Graduation year cannot be after ${currentYear + 5}`),
  phone: Yup.string()
    .matches(
      /^\+?[0-9\s-]{10,}$/,
      'Please enter a valid phone number'
    ),
});

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]); // Initialize as empty array
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    phone: '',
    isAdmin: false,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validateForm = async (values, isNewUser = false) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      // Handle both Yup validation errors and other types of errors
      if (err.inner && Array.isArray(err.inner)) {
        err.inner.forEach(error => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
      } else if (err.message) {
        // Handle non-Yup errors
        validationErrors.form = err.message;
      }
      setErrors(validationErrors);
      return false;
    }
  };

  const handleAddClick = () => {
    setCurrentUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      graduationYear: '',
      phone: '',
      isAdmin: false,
      isActive: true
    });
    setErrors({});
    setAddDialogOpen(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!currentUser.firstName || !currentUser.lastName || !currentUser.email || !currentUser.password) {
      setErrors({
        ...errors,
        form: 'Please fill in all required fields'
      });
      return;
    }

    if (currentUser.password !== currentUser.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: 'Passwords do not match'
      });
      return;
    }

    setSubmitting(true);

    try {
      const userData = {
        firstName: currentUser.firstName.trim(),
        lastName: currentUser.lastName.trim(),
        email: currentUser.email.trim(),
        password: currentUser.password,
        graduationYear: currentUser.graduationYear,
        phone: currentUser.phone || undefined,
        isAdmin: currentUser.isAdmin,
        isActive: true
      };

      // Use the auth/register endpoint for creating new users through our API service
      const response = await api.post('/auth/register', userData);

      // Extract the user data from the response
      // The structure might be response.data.user or response.data, depending on your API
      const newUser = response.data.user || response.data;

      // Reset the form
      setCurrentUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        graduationYear: '',
        phone: '',
        isAdmin: false,
        isActive: true
      });

      // Add the new user to the existing users list
      setUsers(prevUsers => [newUser, ...prevUsers]);

      setAddDialogOpen(false);
      showSnackbar('User added successfully', 'success');
    } catch (err) {
      console.error('Error adding user:', err);
      let errorMessage = 'Failed to add user';

      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data && err.response.data.errors) {
          // Handle validation errors from the server
          const serverErrors = err.response.data.errors;
          const fieldErrors = {};

          serverErrors.forEach(error => {
            if (error.param) {
              fieldErrors[error.param] = error.msg || error.message;
            }
          });

          setErrors(fieldErrors);
          errorMessage = 'Please fix the errors in the form';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again.';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || 'An error occurred';
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      // The API returns an object with a data property containing the users array
      const usersData = response?.data || [];

      // Debug: Log the structure of the first user
      if (usersData.length > 0) {
        console.log('First user data:', {
          id: usersData[0]._id,
          email: usersData[0].email,
          lastLogin: usersData[0].lastLogin,
          allFields: Object.keys(usersData[0])
        });
      }

      setUsers(usersData);
      console.log('Fetched users count:', usersData.length);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users: ' + (err.message || 'Unknown error'));
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusChange = async (user) => {
    try {
      const updatedUser = await userService.updateUser(user._id, {
        ...user,
        isActive: !user.isActive
      });

      setUsers(users.map(u =>
        u._id === updatedUser._id ? updatedUser : u
      ));

      showSnackbar(
        `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (err) {
      console.error('Error updating user status:', err);
      showSnackbar('Failed to update user status', 'error');
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser({
      ...user,
      // Ensure we don't send password hash back to client
      password: ''
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const updatedUser = await userService.updateUser(currentUser._id, {
        firstName: currentUser.firstName.trim(),
        lastName: currentUser.lastName.trim(),
        email: currentUser.email.trim(),
        isAdmin: currentUser.isAdmin,
        isActive: currentUser.isActive,
        ...(currentUser.password && { password: currentUser.password })
      });

      setUsers(users.map(u =>
        u._id === updatedUser.data._id ? updatedUser.data : u
      ));

      setEditDialogOpen(false);
      showSnackbar('User updated successfully', 'success');
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(currentUser._id);
      setUsers(users.filter(u => u._id !== currentUser._id));
      setDeleteDialogOpen(false);
      showSnackbar('User deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      showSnackbar('Failed to delete user', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Debug: Log the users array to see what's being received
  console.log('All users:', users);

  // Ensure users is always an array before filtering
  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (!searchTerm) return true; // Show all users if no search term

    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email ? user.email.toLowerCase() : '';

    // Debug: Log each user being checked
    console.log('Checking user:', { fullName, email, searchLower });

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  // Debug: Log the filtered results
  console.log('Filtered users:', filteredUsers);

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>User Management</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonIcon />}
              onClick={handleAddClick}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 36, height: 36, mr: 2 }}>
                              {user.avatar ? (
                                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <PersonIcon />
                              )}
                            </Avatar>
                            {`${user.firstName} ${user.lastName}`}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isAdmin ? 'Admin' : 'User'}
                            color={user.isAdmin ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={user.isActive !== false}
                                onChange={() => handleStatusChange(user)}
                                color="primary"
                                size="small"
                              />
                            }
                            label={user.isActive !== false ? 'Active' : 'Inactive'}
                          />
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never logged in'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(user)}
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {currentUser && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={currentUser.firstName || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={currentUser.lastName || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={currentUser.email || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentUser.isAdmin || false}
                          onChange={(e) => setCurrentUser({ ...currentUser, isAdmin: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Is Admin"
                    />
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => !submitting && setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleAddUser}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={currentUser.firstName}
                  onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                  margin="normal"
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={currentUser.lastName}
                  onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                  margin="normal"
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!errors.graduationYear} disabled={submitting}>
                  <InputLabel id="graduation-year-label">Graduation Year *</InputLabel>
                  <Select
                    labelId="graduation-year-label"
                    id="graduationYear"
                    name="graduationYear"
                    value={currentUser.graduationYear}
                    label="Graduation Year *"
                    onChange={(e) => setCurrentUser({ ...currentUser, graduationYear: e.target.value })}
                  >
                    {graduationYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.graduationYear && (
                    <FormHelperText>{errors.graduationYear}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  value={currentUser.phone}
                  onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  margin="normal"
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  margin="normal"
                  required
                  error={!!errors.password}
                  helperText={errors.password || 'Minimum 6 characters'}
                  disabled={submitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          disabled={submitting}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentUser.confirmPassword}
                  onChange={(e) => setCurrentUser({ ...currentUser, confirmPassword: e.target.value })}
                  margin="normal"
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentUser.isAdmin || false}
                        onChange={(e) => setCurrentUser({ ...currentUser, isAdmin: e.target.checked })}
                        color="primary"
                        disabled={submitting}
                      />
                    }
                    label="Is Admin"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setAddDialogOpen(false)}
              disabled={submitting}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentUser?.firstName} {currentUser?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsersPage;
