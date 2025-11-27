import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Event as EventIcon,
  PhotoLibrary as PhotoLibraryIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  Send as SendIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import classGroupService from '../../services/classGroupService';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`class-group-tabpanel-${index}`}
      aria-labelledby={`class-group-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClassGroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [isMember, setIsMember] = useState(false);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      
      // Fetch group details
      const groupRes = await classGroupService.fetchGroupById(id);
      setGroup(groupRes.data);
      
      // Fetch group events
      const eventsRes = await classGroupService.fetchEvents(id);
      setEvents(eventsRes.data || []);
      
      // Fetch group albums
      const albumsRes = await classGroupService.fetchAlbums(id);
      setAlbums(albumsRes.data || []);
      
      // Fetch group members
      const membersRes = await classGroupService.fetchMembers(id);
      setMembers(membersRes.data || []);
      
      // Fetch group posts
      const postsRes = await classGroupService.fetchPosts(id);
      setPosts(postsRes.data || []);
      
      // Check if current user is a member
      // This would typically come from your auth context
      // For now, we'll assume the user is logged in and a member
      setIsMember(true);
      
    } catch (err) {
      setError(err.message || 'Failed to load group data');
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  const handleJoinGroup = async () => {
    try {
      await classGroupService.joinGroup(id);
      setIsMember(true);
      // Refresh members list
      const membersRes = await classGroupService.fetchMembers(id);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    try {
      const post = {
        content: newPost,
        author: 'currentUserId', // This should come from auth context
        authorName: 'Current User', // This should come from user profile
      };
      
      const response = await classGroupService.createPost(id, post);
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleReactToPost = async (postId, reactionType) => {
    try {
      await classGroupService.reactPost(postId, reactionType);
      // Refresh posts to show updated reactions
      const postsRes = await classGroupService.fetchPosts(id);
      setPosts(postsRes.data || []);
    } catch (err) {
      console.error('Error reacting to post:', err);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      await classGroupService.commentPost(postId, comment);
      // Refresh posts to show new comment
      const postsRes = await classGroupService.fetchPosts(id);
      setPosts(postsRes.data || []);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Group not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {group.name} Class of {group.year}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip 
            icon={<PeopleIcon />} 
            label={`${members.length} Members`} 
            variant="outlined" 
          />
          {!isMember && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleJoinGroup}
            >
              Join Group
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
        >
          <Tab label="Posts" icon={<CommentIcon />} iconPosition="start" />
          <Tab label="Events" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Photos" icon={<PhotoLibraryIcon />} iconPosition="start" />
          <Tab label="Members" icon={<PeopleIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {isMember ? (
          <Box component="form" onSubmit={handleCreatePost} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Share something with your class..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={<SendIcon />}
              >
                Post
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Join this group to view and create posts
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleJoinGroup}
              size="large"
            >
              Join Group
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          {posts.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No posts yet. Be the first to post something!
            </Typography>
          ) : (
            posts.map((post) => (
              <Card key={post._id} sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={post.author?.avatar} 
                      alt={post.author?.name}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {post.author?.name || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                    {post.content}
                  </Typography>
                  
                  {post.image && (
                    <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                      <img 
                        src={post.image} 
                        alt="Post" 
                        style={{ 
                          maxWidth: '100%', 
                          height: 'auto',
                          display: 'block'
                        }} 
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: 1,
                    borderColor: 'divider',
                    pt: 1,
                    mt: 2
                  }}>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleReactToPost(post._id, 'like')}
                        color={post.userReaction === 'like' ? 'primary' : 'default'}
                      >
                        <ThumbUpIcon fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {post.reactions?.like || 0}
                        </Typography>
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => handleReactToPost(post._id, 'love')}
                        color={post.userReaction === 'love' ? 'error' : 'default'}
                      >
                        <span style={{ fontSize: '1.25rem' }}>❤️</span>
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {post.reactions?.love || 0}
                        </Typography>
                      </IconButton>
                    </Box>
                    
                    <Box>
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {post.comments && post.comments.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Comments ({post.comments.length})
                      </Typography>
                      
                      <List dense>
                        {post.comments.map((comment, index) => (
                          <React.Fragment key={comment._id || index}>
                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar 
                                  src={comment.author?.avatar} 
                                  alt={comment.author?.name}
                                  sx={{ width: 32, height: 32 }}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" component="span">
                                      {comment.author?.name || 'Anonymous'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                      {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ display: 'block', mt: 0.5 }}
                                  >
                                    {comment.text}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {index < post.comments.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                      
                      <Box component="form" onSubmit={(e) => {
                        e.preventDefault();
                        const comment = e.target.comment.value;
                        if (comment.trim()) {
                          handleComment(post._id, comment);
                          e.target.reset();
                        }
                      }} sx={{ mt: 1, display: 'flex' }}>
                        <TextField
                          name="comment"
                          placeholder="Write a comment..."
                          fullWidth
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Button type="submit" variant="contained" size="small">
                          Send
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {events.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No upcoming events. Check back later!
              </Typography>
            </Grid>
          ) : (
            events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {event.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={event.image}
                      alt={event.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {event.time} • {event.location}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {event.description?.substring(0, 150)}{event.description?.length > 150 ? '...' : ''}
                    </Typography>
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          {albums.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No photo albums yet.
              </Typography>
            </Grid>
          ) : (
            albums.map((album) => (
              <Grid item xs={6} sm={4} md={3} key={album._id}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/albums/${album._id}`)}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={album.coverPhoto || '/placeholder-album.jpg'}
                    alt={album.title}
                  />
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2" noWrap>
                      {album.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {album.photoCount || 0} photos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={2}>
          {members.map((member) => (
            <Grid item xs={6} sm={4} md={3} key={member._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Avatar 
                  src={member.avatar} 
                  alt={member.name}
                  sx={{ width: 80, height: 80, mb: 1.5 }}
                />
                <Typography variant="subtitle1" align="center" noWrap sx={{ width: '100%' }}>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  {member.role || 'Alumni'}
                </Typography>
                <Typography variant="caption" color="textSecondary" align="center">
                  {member.batch || 'Class of ' + group.year}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default ClassGroupPage;
