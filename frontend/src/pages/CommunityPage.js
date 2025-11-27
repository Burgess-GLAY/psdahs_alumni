import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Avatar,
  IconButton,
  List,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Send as SendIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/community/posts?limit=50');
      setPosts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setNewPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setNewPostImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostImage) {
      setError('Please add some content or an image to your post');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('content', newPostContent.trim());
      if (newPostImage) {
        formData.append('image', newPostImage);
      }

      await api.post('/community/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setNewPostContent('');
      setNewPostImage(null);
      setImagePreview(null);

      // Refresh posts
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.error || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      // Refresh posts to get updated like count
      fetchPosts();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        py: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Alumni Community
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create Post Card - Only show for authenticated users */}
      {isAuthenticated && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} alignItems="flex-start">
              <Avatar
                src={user?.profilePicture}
                alt={`${user?.firstName} ${user?.lastName}`}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box flex={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share something with the alumni community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  variant="outlined"
                  disabled={submitting}
                />
                {imagePreview && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper'
                      }}
                    >
                      ✕
                    </IconButton>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Button
                    component="label"
                    startIcon={<ImageIcon />}
                    disabled={submitting}
                  >
                    Add Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleCreatePost}
                    disabled={submitting || (!newPostContent.trim() && !newPostImage)}
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No posts yet. Be the first to share something!
          </Typography>
        </Paper>
      ) : (
        <List sx={{ p: 0 }}>
          {posts.map((post) => (
            <Card
              key={post._id}
              component="article"
              aria-label={`Post by ${post.author?.firstName} ${post.author?.lastName}`}
              sx={{
                mb: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: { xs: 1, sm: 2 },
                boxShadow: {
                  xs: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  sm: '0 2px 8px rgba(0, 0, 0, 0.08)'
                },
                transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: {
                    xs: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    sm: '0 4px 16px rgba(0, 0, 0, 0.12)'
                  },
                  transform: { sm: 'translateY(-2px)' }
                }
              }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    src={post.author?.profilePicture}
                    alt={`${post.author?.firstName} ${post.author?.lastName}'s profile picture`}
                    sx={{
                      width: { xs: 44, sm: 48 },
                      height: { xs: 44, sm: 48 },
                      border: '2px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                  </Avatar>
                }
                title={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        lineHeight: 1.4
                      }}
                    >
                      {post.author?.firstName} {post.author?.lastName}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      mt: 0.25
                    }}
                  >
                    {post.author?.graduationYear ? `Class of ${post.author.graduationYear}` : 'Alumni'}
                  </Typography>
                }
                action={
                  <IconButton
                    aria-label={`More options for post by ${post.author?.firstName} ${post.author?.lastName}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '2px'
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
                sx={{
                  pb: { xs: 1, sm: 1.5 },
                  px: { xs: 2, sm: 2.5, md: 3 },
                  pt: { xs: 2, sm: 2.5, md: 3 },
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              />
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 0, md: 3, lg: 4 },
                  p: 0
                }}
              >
                {/* Text Section - 60% width on desktop */}
                <Box
                  sx={{
                    flex: { xs: '1 1 auto', md: '0 0 58%', lg: '0 0 60%' },
                    p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      lineHeight: { xs: 1.6, sm: 1.7 },
                      color: 'text.primary',
                      fontWeight: 400,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {post.content}
                  </Typography>
                </Box>

                {/* Image Section - 40% width on desktop */}
                {post.image?.url && (
                  <Box
                    sx={{
                      flex: { xs: '1 1 auto', md: '0 0 42%', lg: '0 0 40%' },
                      minHeight: { xs: 200, sm: 220, md: 250, lg: 280 },
                      maxHeight: { md: 330, lg: 350 },
                      overflow: 'hidden',
                      borderRadius: { xs: 0, md: 2 },
                      order: { xs: -1, md: 0 },
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={post.image.url}
                      alt={post.image.caption || `Image shared by ${post.author?.firstName} ${post.author?.lastName} in their post`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
              <CardActions
                sx={{
                  px: { xs: 1.5, sm: 2, md: 2.5 },
                  py: { xs: 1.5, sm: 1.5, md: 2 },
                  gap: 0.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  mt: { xs: 0, md: 1 },
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <IconButton
                  aria-label={`Like post by ${post.author?.firstName} ${post.author?.lastName}`}
                  size="small"
                  onClick={() => isAuthenticated && handleToggleLike(post._id)}
                  disabled={!isAuthenticated}
                  sx={{
                    color: post.isLikedByUser ? 'error.main' : 'text.secondary',
                    padding: { xs: '6px', sm: '8px' },
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      transform: 'scale(1.1)'
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'error.main',
                      outlineOffset: '2px'
                    }
                  }}
                >
                  {post.isLikedByUser ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                </IconButton>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mr: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 500,
                    minWidth: '24px'
                  }}
                  aria-label={`${post.likeCount || 0} likes`}
                >
                  {post.likeCount || 0}
                </Typography>

                <IconButton
                  aria-label={`Comment on post by ${post.author?.firstName} ${post.author?.lastName}`}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    padding: { xs: '6px', sm: '8px' },
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      transform: 'scale(1.1)'
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px'
                    }
                  }}
                >
                  <CommentIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mr: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 500,
                    minWidth: '24px'
                  }}
                  aria-label={`${post.commentCount || 0} comments`}
                >
                  {post.commentCount || 0}
                </Typography>

                <IconButton
                  aria-label={`Share post by ${post.author?.firstName} ${post.author?.lastName}`}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    padding: { xs: '6px', sm: '8px' },
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'success.main',
                      backgroundColor: 'rgba(46, 125, 50, 0.08)',
                      transform: 'scale(1.1)'
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'success.main',
                      outlineOffset: '2px'
                    }
                  }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>

                <IconButton
                  aria-label={`Bookmark post by ${post.author?.firstName} ${post.author?.lastName}`}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    padding: { xs: '6px', sm: '8px' },
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'warning.main',
                      backgroundColor: 'rgba(237, 108, 2, 0.08)',
                      transform: 'scale(1.1)'
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'warning.main',
                      outlineOffset: '2px'
                    }
                  }}
                >
                  <BookmarkBorderIcon fontSize="small" />
                </IconButton>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ml: 'auto',
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    fontWeight: 400,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </Typography>
              </CardActions>
            </Card>
          ))}
        </List>
      )}
    </Container>
  );
};

export default CommunityPage;
