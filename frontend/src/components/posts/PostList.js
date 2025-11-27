import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Avatar, 
  IconButton, 
  CardActions,
  TextField,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  ThumbUp, 
  Comment, 
  Share, 
  MoreVert, 
  Favorite, 
  InsertEmoticon,
  Send,
  Image as ImageIcon,
  EventNote,
  PhotoAlbum,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import classGroupService from '../../services/classGroupService';
import PostComments from './PostComments';
import ReactionMenu from './ReactionMenu';
import ImageGallery from '../common/ImageGallery';

const PostList = ({ groupId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const loadPosts = async () => {
    if (!hasMore) return;
    
    setLoading(true);
    try {
      const data = await classGroupService.fetchPosts(groupId, page, 10);
      setPosts(prev => [...prev, ...data.posts]);
      setPage(prev => prev + 1);
      setHasMore(data.pagination && data.pagination.next);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [groupId]);

  const handleReact = async (postId, type = 'like') => {
    try {
      await classGroupService.addReaction(groupId, 'post', postId, type);
      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const userReaction = post.reactions?.find(r => r.user._id === currentUser._id);
          let updatedReactions = [...(post.reactions || [])];
          
          if (userReaction) {
            // Update existing reaction
            updatedReactions = updatedReactions.map(r => 
              r.user._id === currentUser._id ? { ...r, type } : r
            );
          } else {
            // Add new reaction
            updatedReactions.push({
              user: currentUser,
              type,
              createdAt: new Date().toISOString()
            });
          }
          
          return { ...post, reactions: updatedReactions };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    
    try {
      const comment = await classGroupService.addComment(groupId, postId, newComment);
      
      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [comment, ...(post.comments || [])],
            commentCount: (post.commentCount || 0) + 1
          };
        }
        return post;
      }));
      
      setNewComment('');
      setCommentingOn(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMenuClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleSavePost = async () => {
    // Implement save post functionality
    handleMenuClose();
  };

  const handleReportPost = async () => {
    // Implement report post functionality
    handleMenuClose();
  };

  if (loading && posts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {posts.map((post) => (
        <Card key={post._id} sx={{ mb: 3, borderRadius: 2 }}>
          <CardHeader
            avatar={
              <Avatar 
                src={post.author?.profilePicture?.url} 
                alt={post.author?.firstName}
              />
            }
            action={
              <IconButton onClick={(e) => handleMenuClick(e, post)}>
                <MoreVert />
              </IconButton>
            }
            title={`${post.author?.firstName} ${post.author?.lastName}`}
            subheader={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          />
          
          <CardContent>
            <Typography variant="body1" paragraph>{post.content}</Typography>
            
            {post.images?.length > 0 && (
              <Box mt={2} mb={2}>
                <ImageGallery images={post.images} />
              </Box>
            )}
            
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Box display="flex" alignItems="center">
                <Box display="flex" alignItems="center" mr={2}>
                  <ThumbUp fontSize="small" color="primary" />
                  <Typography variant="caption" color="textSecondary" ml={0.5}>
                    {post.reactions?.length || 0}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {post.commentCount || 0} comments
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {post.shares || 0} shares
              </Typography>
            </Box>
          </CardContent>
          
          <Divider />
          
          <CardActions sx={{ justifyContent: 'space-around' }}>
            <ReactionMenu 
              onSelect={(type) => handleReact(post._id, type)}
              currentReaction={post.reactions?.find(r => r.user._id === currentUser._id)?.type}
            />
            
            <Button 
              startIcon={<Comment />} 
              onClick={() => setCommentingOn(commentingOn === post._id ? null : post._id)}
            >
              Comment
            </Button>
            
            <Button startIcon={<Share />}>Share</Button>
          </CardActions>
          
          {commentingOn === post._id && (
            <Box p={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar 
                  src={currentUser.profilePicture?.url} 
                  alt={currentUser.firstName}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                />
                <IconButton 
                  color="primary" 
                  onClick={() => handleAddComment(post._id)}
                  disabled={!newComment.trim()}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          )}
          
          {post.comments?.length > 0 && (
            <PostComments 
              comments={post.comments} 
              onAddComment={(content) => {
                setNewComment(content);
                setCommentingOn(post._id);
              }}
            />
          )}
        </Card>
      ))}
      
      {hasMore && (
        <Box display="flex" justifyContent="center" my={3}>
          <Button 
            variant="outlined" 
            onClick={loadPosts}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSavePost}>
          <ListItemIcon>
            {selectedPost?.saved ? <Bookmark /> : <BookmarkBorder />}
          </ListItemIcon>
          <ListItemText>
            {selectedPost?.saved ? 'Unsave Post' : 'Save Post'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleReportPost}>
          <ListItemIcon>
            <ReportProblem />
          </ListItemIcon>
          <ListItemText>Report Post</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PostList;
