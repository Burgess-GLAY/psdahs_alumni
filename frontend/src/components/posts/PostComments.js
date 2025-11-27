import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  TextField, 
  IconButton, 
  Divider,
  Collapse,
  Button
} from '@mui/material';
import { 
  ThumbUp, 
  Reply, 
  MoreVert, 
  Send,
  Favorite,
  InsertEmoticon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import classGroupService from '../../services/classGroupService';
import ReactionMenu from './ReactionMenu';

const CommentItem = ({ 
  comment, 
  onReply, 
  onReact,
  currentUser
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLiked, setIsLiked] = useState(
    comment.reactions?.some(r => r.user._id === currentUser?._id && r.type === 'like')
  );
  const [likeCount, setLikeCount] = useState(comment.reactions?.length || 0);
  
  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      // Call the API to add a reply
      const newReply = {
        _id: `temp-${Date.now()}`,
        user: currentUser,
        content: replyText,
        createdAt: new Date().toISOString(),
        replies: [],
        reactions: []
      };
      
      // Update local state immediately for better UX
      onReply(comment._id, newReply);
      
      // Clear the reply input
      setReplyText('');
      setReplying(false);
      
      // If this is the first reply, show the replies section
      if (!showReplies && (!comment.replies || comment.replies.length === 0)) {
        setShowReplies(true);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };
  
  const handleReact = async (type = 'like') => {
    try {
      // Optimistic UI update
      const wasLiked = isLiked;
      const newLikeCount = wasLiked ? likeCount - 1 : likeCount + 1;
      
      setIsLiked(!wasLiked);
      setLikeCount(newLikeCount);
      
      // Call the API to add/remove reaction
      await onReact(comment._id, type);
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
      console.error('Error reacting to comment:', error);
    }
  };
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleReport = () => {
    // Implement report functionality
    handleMenuClose();
  };
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  return (
    <Box>
      <Box display="flex" mb={2}>
        <Avatar 
          src={comment.user?.profilePicture?.url} 
          alt={comment.user?.firstName}
          sx={{ width: 32, height: 32, mt: 0.5, mr: 1.5 }}
        />
        
        <Box flex={1}>
          <Box 
            sx={{
              bgcolor: 'background.paper',
              p: 1.5,
              borderRadius: 2,
              position: 'relative',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={600}>
                {comment.user?.firstName} {comment.user?.lastName}
              </Typography>
              <Box>
                <IconButton 
                  size="small" 
                  onClick={handleMenuClick}
                  sx={{ opacity: 0.7 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem onClick={handleReport}>
                    <ListItemIcon>
                      <ReportProblem fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Report Comment</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            
            <Typography variant="body2" paragraph mb={1}>
              {comment.content}
            </Typography>
            
            <Box display="flex" alignItems="center" mt={0.5}>
              <ReactionMenu 
                onSelect={handleReact}
                currentReaction={isLiked ? 'like' : null}
                size="small"
                showText={false}
              />
              
              {likeCount > 0 && (
                <Typography variant="caption" color="text.secondary" ml={1}>
                  {likeCount}
                </Typography>
              )}
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                ml={2}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => setReplying(!replying)}
              >
                Reply
              </Typography>
              
              <Typography variant="caption" color="text.secondary" ml={2}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
          
          {/* Reply input */}
          <Collapse in={replying}>
            <Box display="flex" mt={1} ml={4}>
              <Avatar 
                src={currentUser?.profilePicture?.url} 
                alt={currentUser?.firstName}
                sx={{ width: 32, height: 32, mt: 0.5, mr: 1.5 }}
              />
              <Box flex={1}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        size="small"
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Collapse>
          
          {/* Replies section */}
          {hasReplies && (
            <Box ml={4} mt={1}>
              {!showReplies ? (
                <Button 
                  size="small" 
                  onClick={() => setShowReplies(true)}
                  startIcon={<ExpandMore />}
                >
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              ) : (
                <>
                  <Button 
                    size="small" 
                    onClick={() => setShowReplies(false)}
                    startIcon={<ExpandLess />}
                  >
                    Hide replies
                  </Button>
                  
                  <Box mt={1}>
                    {comment.replies.map((reply) => (
                      <CommentItem 
                        key={reply._id} 
                        comment={reply} 
                        onReply={onReply}
                        onReact={onReact}
                        currentUser={currentUser}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const PostComments = ({ 
  comments = [], 
  onAddComment,
  currentUser
}) => {
  const [showComments, setShowComments] = useState(true);
  
  if (!comments || comments.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <Divider />
      
      <Box p={2}>
        <Button 
          size="small" 
          onClick={() => setShowComments(!showComments)}
          startIcon={showComments ? <ExpandLess /> : <ExpandMore />}
        >
          {showComments ? 'Hide comments' : `Show ${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
        </Button>
        
        <Collapse in={showComments}>
          <Box mt={1}>
            {comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                onReply={(commentId, reply) => {
                  // Handle reply to comment
                  const updatedComments = comments.map(c => {
                    if (c._id === commentId) {
                      return {
                        ...c,
                        replies: [...(c.replies || []), reply],
                        replyCount: (c.replyCount || 0) + 1
                      };
                    }
                    return c;
                  });
                  
                  // Update parent component state
                  onAddComment(updatedComments);
                }}
                onReact={async (commentId, type) => {
                  try {
                    // Call the API to add/remove reaction
                    // await classGroupService.addReaction(commentId, type);
                    // The actual reaction is handled in the CommentItem component
                  } catch (error) {
                    console.error('Error reacting to comment:', error);
                    throw error; // Re-throw to handle in the CommentItem
                  }
                }}
                currentUser={currentUser}
              />
            ))}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default PostComments;
