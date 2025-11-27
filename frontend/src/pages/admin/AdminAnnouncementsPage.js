import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormGroup,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  CardMedia
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Announcement as AnnouncementIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  PushPin as PushPinIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch announcements from API
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/announcements?limit=100', {
        headers: { 'x-auth-token': token }
      });
      setAnnouncements(response.data.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements');
      enqueueSnackbar('Failed to load announcements', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setCurrentAnnouncement({
        ...announcement,
        description: announcement.description || '',
        tags: announcement.tags || []
      });
      setPreviewImage(announcement.imageUrl || null);
    } else {
      setCurrentAnnouncement({
        title: '',
        description: '',
        category: 'updates',
        isPinned: false,
        isPublished: true,
        startDate: new Date().toISOString(),
        endDate: '',
        tags: []
      });
      setPreviewImage(null);
    }
    setSelectedImage(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAnnouncement(null);
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAnnouncement(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('title', currentAnnouncement.title);
      formData.append('description', currentAnnouncement.description);
      formData.append('category', currentAnnouncement.category);
      formData.append('startDate', currentAnnouncement.startDate);
      formData.append('isPinned', currentAnnouncement.isPinned);
      formData.append('isPublished', currentAnnouncement.isPublished);

      if (currentAnnouncement.endDate) {
        formData.append('endDate', currentAnnouncement.endDate);
      }

      if (currentAnnouncement.tags && currentAnnouncement.tags.length > 0) {
        currentAnnouncement.tags.forEach(tag => formData.append('tags[]', tag));
      }

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (currentAnnouncement._id) {
        // Update existing announcement
        await axios.put(`/api/announcements/${currentAnnouncement._id}`, formData, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
        enqueueSnackbar('Announcement updated successfully!', { variant: 'success' });
      } else {
        // Create new announcement
        await axios.post('/api/announcements', formData, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
        enqueueSnackbar('Announcement created successfully!', { variant: 'success' });
      }

      handleCloseDialog();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to save announcement',
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/announcements/${id}`, {
          headers: { 'x-auth-token': token }
        });
        enqueueSnackbar('Announcement deleted successfully!', { variant: 'success' });
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        enqueueSnackbar(
          error.response?.data?.error || 'Failed to delete announcement',
          { variant: 'error' }
        );
      }
    }
  };

  const handleToggleStatus = async (announcement) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('title', announcement.title);
      formData.append('description', announcement.description);
      formData.append('category', announcement.category);
      formData.append('startDate', announcement.startDate);
      formData.append('isPinned', announcement.isPinned);
      formData.append('isPublished', !announcement.isPublished);

      if (announcement.tags && announcement.tags.length > 0) {
        announcement.tags.forEach(tag => formData.append('tags[]', tag));
      }

      await axios.put(`/api/announcements/${announcement._id}`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      enqueueSnackbar(
        `Announcement ${!announcement.isPublished ? 'published' : 'unpublished'} successfully!`,
        { variant: 'success' }
      );
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling status:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to update announcement status',
        { variant: 'error' }
      );
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/announcements/${id}/pin`, {}, {
        headers: { 'x-auth-token': token }
      });
      enqueueSnackbar('Pin status updated successfully!', { variant: 'success' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling pin:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to update pin status',
        { variant: 'error' }
      );
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      updates: 'primary',
      achievements: 'success',
      events: 'secondary'
    };
    return colors[category] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={2}
          mb={3}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <AnnouncementIcon sx={{ mr: 1 }} />
              Manage Announcements
            </Box>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={{ xs: true, sm: false }}
            sx={{ minHeight: 44 }}
          >
            New Announcement
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              {announcements.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No announcements yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Create your first announcement to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Create Announcement
                  </Button>
                </Box>
              ) : (
                <>
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
                          <TableCell>Title</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Author</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Views</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {announcements
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((announcement) => (
                            <TableRow key={announcement._id} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {announcement.isPinned && (
                                    <PushPinIcon color="primary" fontSize="small" />
                                  )}
                                  {announcement.imageUrl && (
                                    <ImageIcon color="action" fontSize="small" />
                                  )}
                                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                    {announcement.title}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={announcement.category}
                                  color={getCategoryColor(announcement.category)}
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Avatar
                                    src={announcement.author?.profilePicture}
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                  >
                                    {announcement.author?.firstName?.[0]}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {announcement.author?.firstName} {announcement.author?.lastName}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {format(new Date(announcement.startDate), 'MMM d, yyyy')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={announcement.isPublished}
                                      onChange={() => handleToggleStatus(announcement)}
                                      color="primary"
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography variant="caption">
                                      {announcement.isPublished ? 'Published' : 'Draft'}
                                    </Typography>
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <VisibilityIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                  <Typography variant="body2">
                                    {announcement.views || 0}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenDialog(announcement)}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={announcement.isPinned ? 'Unpin' : 'Pin to top'}>
                                  <IconButton
                                    color={announcement.isPinned ? 'primary' : 'default'}
                                    onClick={() => handleTogglePin(announcement._id)}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                  >
                                    <PushPinIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDelete(announcement._id)}
                                    size="small"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={announcements.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Add/Edit Announcement Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: 800
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentAnnouncement?.id ? 'Edit Announcement' : 'Create New Announcement'}
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
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={currentAnnouncement?.title || ''}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={currentAnnouncement?.category || 'updates'}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    <MenuItem value="updates">Updates</MenuItem>
                    <MenuItem value="achievements">Achievements</MenuItem>
                    <MenuItem value="events">Events</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormGroup row sx={{ mt: 2, justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isPinned"
                        checked={currentAnnouncement?.isPinned || false}
                        onChange={handleInputChange}
                        color="primary"
                      />
                    }
                    label="Pin to top"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        name="isPublished"
                        checked={currentAnnouncement?.isPublished !== false}
                        onChange={handleInputChange}
                        color="primary"
                      />
                    }
                    label={currentAnnouncement?.isPublished ? 'Published' : 'Draft'}
                    labelPlacement="start"
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="datetime-local"
                  name="startDate"
                  value={currentAnnouncement?.startDate ?
                    format(new Date(currentAnnouncement.startDate), "yyyy-MM-dd'T'HH:mm") :
                    format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date (Optional)"
                  type="datetime-local"
                  name="endDate"
                  value={currentAnnouncement?.endDate ?
                    format(new Date(currentAnnouncement.endDate), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={currentAnnouncement?.description || ''}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={8}
                  placeholder="Enter the announcement description..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={currentAnnouncement?.tags?.join(', ') || ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setCurrentAnnouncement(prev => ({
                      ...prev,
                      tags
                    }));
                  }}
                  margin="normal"
                  variant="outlined"
                  placeholder="e.g., important, update, reminder"
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="announcement-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="announcement-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      {selectedImage || previewImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>

                  {previewImage && (
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Image Preview:
                      </Typography>
                      <CardMedia
                        component="img"
                        image={previewImage}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          maxHeight: 200,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mt: 1,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Announcement'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AdminAnnouncementsPage;
