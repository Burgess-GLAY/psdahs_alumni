import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItem,
  List,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import { FormSection, ImageUploadField } from '../../components/common';

const AdminClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [selectedClassMembers, setSelectedClassMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    graduationYear: new Date().getFullYear(),
    motto: ''
  });
  const [classImageFile, setClassImageFile] = useState(null);
  const [classImagePreview, setClassImagePreview] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch real class groups from API
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/class-groups?limit=100');
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassMembers = async (classId) => {
    try {
      const response = await api.get(`/class-groups/${classId}/members`);
      setSelectedClassMembers(response.data.data || []);
      setOpenMembersDialog(true);
    } catch (err) {
      console.error('Error fetching class members:', err);
      setError('Failed to load class members.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      setCurrentClass(classItem);
      setFormData({
        name: classItem.name || `Class of ${classItem.graduationYear}`,
        description: classItem.description || '',
        graduationYear: classItem.graduationYear,
        motto: classItem.motto || ''
      });
      // Set existing images as previews
      setClassImagePreview(classItem.coverImage || null);
      setBannerImagePreview(classItem.bannerImage || null);
    } else {
      setCurrentClass(null);
      setFormData({
        name: '',
        description: '',
        graduationYear: new Date().getFullYear(),
        motto: ''
      });
      setClassImagePreview(null);
      setBannerImagePreview(null);
    }
    setClassImageFile(null);
    setBannerImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClass(null);
    setFormData({
      name: '',
      description: '',
      graduationYear: new Date().getFullYear(),
      motto: ''
    });
    setClassImageFile(null);
    setClassImagePreview(null);
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setValidationErrors({});
  };

  const handleCloseMembersDialog = () => {
    setOpenMembersDialog(false);
    setSelectedClassMembers([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const validateForm = () => {
    const errors = {};

    if (!formData.graduationYear) {
      errors.graduationYear = 'Graduation year is required';
    } else if (formData.graduationYear < 2000 || formData.graduationYear > 2100) {
      errors.graduationYear = 'Graduation year must be between 2000 and 2100';
    }

    if (formData.motto && formData.motto.length > 200) {
      errors.motto = 'Motto must not exceed 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    try {
      setError(null);

      // Create FormData for multipart/form-data submission
      const submitData = new FormData();
      submitData.append('name', formData.name || `Class of ${formData.graduationYear}`);
      submitData.append('description', formData.description || '');
      submitData.append('graduationYear', formData.graduationYear);
      submitData.append('motto', formData.motto || '');
      submitData.append('isPublic', 'true');

      // Add image files if selected
      if (classImageFile) {
        submitData.append('classImage', classImageFile);
      }
      if (bannerImageFile) {
        submitData.append('bannerImage', bannerImageFile);
      }

      if (currentClass) {
        // Update existing class
        await api.put(`/class-groups/${currentClass._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new class
        await api.post('/class-groups', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      handleCloseDialog();
      fetchClasses(); // Refresh the list
    } catch (err) {
      console.error('Error saving class:', err);
      setError(err.response?.data?.error || 'Failed to save class. Please try again.');
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/class-groups/${classId}`);
      fetchClasses(); // Refresh the list
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err.response?.data?.error || 'Failed to delete class. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, mb: 4, width: '100%' }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="center"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mb={3}
        textAlign="center"
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, width: '100%' }}
        >
          Manage Classes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={{ xs: true, sm: false }}
          sx={{ minHeight: 44 }}
        >
          Add New Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ maxWidth: 1400, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <TableContainer
            component={Paper}
            sx={{
              overflowX: 'auto',
              maxWidth: '100%'
            }}
          >
            <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No classes found. Create your first class!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  classes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((classItem) => (
                      <TableRow key={classItem._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SchoolIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body1">
                              {classItem.name || `Class of ${classItem.graduationYear}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {classItem.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <GroupIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {classItem.memberCount || 0}
                            </Typography>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => fetchClassMembers(classItem._id)}
                              title="View members"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {format(new Date(classItem.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(classItem)}
                            size="small"
                            title="Edit class"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(classItem._id)}
                            size="small"
                            title="Delete class"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={classes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Class Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentClass ? 'Edit Class' : 'Add New Class'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <FormSection title="Basic Information">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Graduation Year"
                        name="graduationYear"
                        type="number"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        required
                        slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
                        error={!!validationErrors.graduationYear}
                        helperText={validationErrors.graduationYear || 'Enter the graduation year (e.g., 2025)'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Class Name (Optional)"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        helperText={`Leave empty to use "Class of ${formData.graduationYear}"`}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Motto (Optional)"
                        name="motto"
                        value={formData.motto}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 200 }}
                        error={!!validationErrors.motto}
                        helperText={validationErrors.motto || `Class motto or tagline (${formData.motto.length}/200 characters)`}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (Optional)"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        error={!!validationErrors.description}
                        helperText={validationErrors.description || 'Add a description for this class'}
                      />
                    </Grid>
                  </Grid>
                </FormSection>
              </Grid>

              {/* Class Image Section */}
              <Grid item xs={12}>
                <FormSection title="Class Image">
                  <ImageUploadField
                    id="class-image-upload"
                    label="Upload Class Image"
                    onChange={(file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setClassImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                      setClassImageFile(file);
                      setError(null);
                    }}
                    preview={classImagePreview}
                    helperText="Recommended: Square image, at least 400x400px. Max size: 5MB"
                    maxSizeMB={5}
                  />
                </FormSection>
              </Grid>

              {/* Banner Image Section */}
              <Grid item xs={12}>
                <FormSection title="Banner Image">
                  <ImageUploadField
                    id="banner-image-upload"
                    label="Upload Banner Image"
                    onChange={(file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBannerImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                      setBannerImageFile(file);
                      setError(null);
                    }}
                    preview={bannerImagePreview}
                    helperText="Recommended: Wide image (16:9 ratio), at least 1200x675px. Max size: 5MB"
                    maxSizeMB={5}
                  />
                </FormSection>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {currentClass ? 'Update' : 'Create'} Class
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={openMembersDialog} onClose={handleCloseMembersDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Class Members
          <IconButton
            aria-label="close"
            onClick={handleCloseMembersDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClassMembers.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No students in this class yet.
            </Typography>
          ) : (
            <List>
              {selectedClassMembers.map((member) => (
                <ListItem key={member._id}>
                  <ListItemAvatar>
                    <Avatar
                      src={member.profilePicture}
                      alt={`${member.firstName} ${member.lastName}`}
                    >
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${member.firstName} ${member.lastName}`}
                    secondary={
                      <>
                        {member.email}
                        {member.joinedAt && ` • Joined ${format(new Date(member.joinedAt), 'MMM d, yyyy')}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseMembersDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminClassesPage;
