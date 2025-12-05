import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import classGroupService from '../../services/classGroupService';
import { showError, showSuccess } from '../../utils/notifications';

const AdminClassPhotosPage = () => {
    const [classGroups, setClassGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch all class groups
    useEffect(() => {
        fetchClassGroups();
    }, []);

    const fetchClassGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await classGroupService.fetchGroups({ limit: 100, sortBy: 'year-desc' });
            setClassGroups(response.data || []);
        } catch (err) {
            console.error('Error fetching class groups:', err);
            setError('Failed to load class groups');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenUploadDialog = (group) => {
        setSelectedGroup(group);
        setUploadDialogOpen(true);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleCloseUploadDialog = () => {
        setUploadDialogOpen(false);
        setSelectedGroup(null);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError('Please select an image file');
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                showError('File size must be less than 2MB');
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedGroup) {
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', selectedFile);

            const response = await classGroupService.uploadClassPhoto(selectedGroup._id, formData);

            showSuccess(`Photo uploaded successfully for ${selectedGroup.name}`);

            // Update the class group in the list
            setClassGroups(classGroups.map(g =>
                g._id === selectedGroup._id
                    ? { ...g, coverImage: response.data.coverImage, bannerImage: response.data.bannerImage }
                    : g
            ));

            handleCloseUploadDialog();
        } catch (err) {
            console.error('Error uploading photo:', err);
            showError(err.response?.data?.error || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading class groups...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Page Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                        Manage Class Photos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Upload and manage photos for each graduating class
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchClassGroups}
                >
                    Refresh
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Class Groups Grid */}
            <Grid container spacing={3}>
                {classGroups.map((group) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={group._id}>
                        <Card>
                            {/* Photo Preview */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    paddingTop: '56.25%',
                                    backgroundColor: 'grey.200'
                                }}
                            >
                                {group.coverImage || group.bannerImage ? (
                                    <CardMedia
                                        component="img"
                                        image={group.coverImage || group.bannerImage}
                                        alt={group.name}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'grey.300'
                                        }}
                                    >
                                        <ImageIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                                    </Box>
                                )}
                            </Box>

                            {/* Card Content */}
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {group.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Class of {group.graduationYear}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    {group.memberCount || 0} members
                                </Typography>
                            </CardContent>

                            {/* Card Actions */}
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleOpenUploadDialog(group)}
                                >
                                    {group.coverImage ? 'Update Photo' : 'Upload Photo'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={handleCloseUploadDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Upload Photo for {selectedGroup?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* File Input */}
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="photo-upload-input"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="photo-upload-input">
                            <Button
                                variant="outlined"
                                component="span"
                                fullWidth
                                startIcon={<UploadIcon />}
                                sx={{ mb: 2 }}
                            >
                                Select Image
                            </Button>
                        </label>

                        {/* Preview */}
                        {previewUrl && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Preview:
                                </Typography>
                                <Box
                                    component="img"
                                    src={previewUrl}
                                    alt="Preview"
                                    sx={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: 300,
                                        objectFit: 'contain',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(2)} KB)
                                </Typography>
                            </Box>
                        )}

                        {/* Current Photo */}
                        {selectedGroup?.coverImage && !previewUrl && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Current Photo:
                                </Typography>
                                <Box
                                    component="img"
                                    src={selectedGroup.coverImage}
                                    alt="Current"
                                    sx={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: 300,
                                        objectFit: 'contain',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}
                                />
                            </Box>
                        )}

                        {/* Guidelines */}
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Guidelines:</strong>
                            </Typography>
                            <Typography variant="caption" component="div">
                                • Supported formats: JPEG, PNG, WebP
                            </Typography>
                            <Typography variant="caption" component="div">
                                • Maximum file size: 2MB
                            </Typography>
                            <Typography variant="caption" component="div">
                                • Recommended dimensions: 1200x600px (2:1 ratio)
                            </Typography>
                            <Typography variant="caption" component="div">
                                • Image will be automatically optimized
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUploadDialog} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!selectedFile || uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminClassPhotosPage;
