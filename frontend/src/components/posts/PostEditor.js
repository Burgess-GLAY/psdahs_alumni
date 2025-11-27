import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Typography,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  Tooltip,
  ClickAwayListener
} from '@mui/material';
import {
  Image as ImageIcon,
  Videocam as VideoIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import Picker from 'emoji-picker-react';

const PostEditor = ({
  initialContent = '',
  initialImages = [],
  onCancel,
  onSubmit,
  isEditing = false,
  onDelete,
  privacy: initialPrivacy = 'public',
  user
}) => {
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState(initialImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    setContent(
      content.substring(0, start) + emoji + content.substring(end)
    );
    
    // Move cursor after the inserted emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if ((!content.trim() && images.length === 0) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        images: images.filter(img => img.isNew).map(img => img.file),
        privacy
      });
      
      // Reset form if not in edit mode
      if (!isEditing) {
        setContent('');
        setImages([]);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'public':
        return <PublicIcon fontSize="small" />;
      case 'friends':
        return <GroupIcon fontSize="small" />;
      case 'private':
        return <LockIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  const getPrivacyLabel = () => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'friends':
        return 'Friends';
      case 'private':
        return 'Only me';
      default:
        return 'Public';
    }
  };

  const togglePrivacy = () => {
    const privacyOptions = ['public', 'friends', 'private'];
    const currentIndex = privacyOptions.indexOf(privacy);
    const nextIndex = (currentIndex + 1) % privacyOptions.length;
    setPrivacy(privacyOptions[nextIndex]);
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview && image.isNew) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        position: 'relative'
      }}
    >
      <Box display="flex" mb={2}>
        <Avatar 
          src={user?.profilePicture?.url} 
          alt={user?.firstName}
          sx={{ width: 40, height: 40, mr: 1.5 }}
        />
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Box display="flex" alignItems="center" mt={0.5}>
            <Tooltip title="Change privacy">
              <Chip
                icon={getPrivacyIcon()}
                label={getPrivacyLabel()}
                size="small"
                onClick={togglePrivacy}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                    ml: 0.5
                  },
                }}
              />
            </Tooltip>
          </Box>
        </Box>
        
        {isEditing && onDelete && (
          <IconButton 
            onClick={onDelete} 
            color="error"
            size="small"
            sx={{ ml: 'auto' }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
      
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={10}
        variant="standard"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        inputRef={editorRef}
        sx={{
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            lineHeight: 1.5,
            '&::placeholder': {
              opacity: 0.7,
            },
          },
          '& .MuiInputBase-root:before': {
            borderBottom: 'none',
          },
          '& .MuiInputBase-root:hover:not(.Mui-disabled):before': {
            borderBottom: 'none',
          },
          '& .MuiInputBase-root:after': {
            borderBottom: 'none',
          },
          mb: 2,
        }}
      />
      
      {/* Image preview grid */}
      {images.length > 0 && (
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: images.length === 1 ? '1fr' : '1fr 1fr',
            gap: 1,
            mb: 2,
            '& > *': {
              aspectRatio: '1',
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            },
          }}
        >
          {images.map((image, index) => (
            <Box key={index}>
              <Box
                component="img"
                src={image.preview || image.url}
                alt={`Preview ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={() => removeImage(index)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      
      <Divider sx={{ my: 1.5 }} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex">
          <Tooltip title="Add Photo/Video">
            <IconButton 
              component="label"
              size="small"
              sx={{ mr: 0.5 }}
            >
              <ImageIcon color="primary" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Emoji">
            <IconButton 
              size="small" 
              sx={{ mr: 0.5 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <EmojiIcon color="secondary" />
            </IconButton>
          </Tooltip>
          
          {showEmojiPicker && (
            <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
              <Box sx={{ position: 'absolute', bottom: '100%', left: 8, zIndex: 10 }}>
                <Picker 
                  onEmojiClick={handleEmojiClick} 
                  width={300} 
                  height={350}
                  native
                />
              </Box>
            </ClickAwayListener>
          )}
        </Box>
        
        <Box>
          {onCancel && (
            <Button 
              onClick={onCancel}
              color="inherit"
              size="small"
              sx={{ mr: 1 }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSubmit}
            disabled={(!content.trim() && images.length === 0) || isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : isEditing ? (
                <EditIcon />
              ) : (
                <CheckIcon />
              )
            }
          >
            {isSubmitting ? 'Posting...' : isEditing ? 'Update' : 'Post'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PostEditor;
