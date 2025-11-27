import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography,
    Avatar,
    ImageList,
    ImageListItem,
    ImageListItemBar,
} from '@mui/material';
import {
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';

const CreatePostDialog = ({ open, onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const user = useSelector(selectUser);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + images.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }

        setImages([...images, ...files]);

        // Create previews
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = () => {
        if (!content.trim() && images.length === 0) {
            alert('Please add some content or images to your post');
            return;
        }

        onSubmit({
            content: content.trim(),
            images,
        });

        handleClose();
    };

    const handleClose = () => {
        setContent('');
        setImages([]);
        setImagePreviews([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Create Post</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Avatar
                        src={user?.profilePicture}
                        alt={`${user?.firstName} ${user?.lastName}`}
                    >
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                />

                {imagePreviews.length > 0 && (
                    <ImageList
                        sx={{ width: '100%', maxHeight: 300, mb: 2 }}
                        cols={imagePreviews.length === 1 ? 1 : 2}
                        rowHeight={200}
                    >
                        {imagePreviews.map((preview, index) => (
                            <ImageListItem key={index}>
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    loading="lazy"
                                    style={{ objectFit: 'cover', height: '100%' }}
                                />
                                <ImageListItemBar
                                    actionIcon={
                                        <IconButton
                                            sx={{ color: 'white' }}
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                )}

                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="post-image-upload"
                    type="file"
                    multiple
                    onChange={handleImageChange}
                />
                <label htmlFor="post-image-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                        fullWidth
                        disabled={images.length >= 5}
                    >
                        Add Photos ({images.length}/5)
                    </Button>
                </label>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!content.trim() && images.length === 0}
                >
                    Post
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreatePostDialog;
