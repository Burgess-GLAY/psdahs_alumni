import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box, Chip, IconButton, Avatar, Tabs, Tab, CardActions, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Favorite, Comment, Share, MoreVert, BrokenImage } from '@mui/icons-material';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const AnnouncementsPage = () => {
  const [tabValue, setTabValue] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(selectUser);
  const isAdmin = user?.isAdmin || false;

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const category = tabValue === 'all' ? '' : tabValue;
        const response = await axios.get(`/api/announcements?category=${category}&limit=100`);
        setAnnouncements(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [tabValue]);

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSubmitAnnouncement = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/announcements', data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      handleCloseForm();
      // Refresh announcements
      const category = tabValue === 'all' ? '' : tabValue;
      const response = await axios.get(`/api/announcements?category=${category}&limit=100`);
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    }
  };

  const handleImageError = (announcementId) => {
    setImageErrors(prev => ({ ...prev, [announcementId]: true }));
  };


  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to like announcements');
        return;
      }

      const response = await axios.put(`/api/announcements/${id}/like`, {}, {
        headers: { 'x-auth-token': token }
      });

      setAnnouncements(prev => prev.map(ann =>
        ann.id === id ? { ...ann, likes: response.data.data } : ann
      ));
    } catch (error) {
      console.error('Error liking announcement:', error);
    }
  };

  const handleShare = async (announcement) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement.title,
          text: announcement.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${announcement.title}\n${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  // Comment handling would require a dialog or inline input - simplified for now
  const handleCommentClick = (id) => {
    // Toggle comment section visibility or open dialog
    // For now, let's just alert
    alert('Comment feature coming soon!');
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4, lg: 5 }
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={{ xs: 2, sm: 3, md: 3 }}
        flexWrap="wrap"
        gap={2}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          Announcements
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenForm}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 1 }
            }}
          >
            New Announcement
          </Button>
        )}
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
        <>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: { xs: 2, sm: 3, md: 3 }
            }}
            role="navigation"
            aria-label="Announcement categories"
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Filter announcements by category"
            >
              <Tab label="All" value="all" aria-label="Show all announcements" />
              <Tab label="Events" value="events" aria-label="Show event announcements" />
              <Tab label="Updates" value="updates" aria-label="Show update announcements" />
              <Tab label="Achievements" value="achievements" aria-label="Show achievement announcements" />
            </Tabs>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {announcements.map((announcement) => (
              <Grid item xs={12} key={announcement.id}>
                <Card
                  component="article"
                  aria-label={`Announcement: ${announcement.title}`}
                  sx={{
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
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: { xs: 0, md: 3, lg: 4 },
                      p: 0,
                      '&:last-child': { pb: 0 }
                    }}
                  >
                    {/* Text Section - 60% width on desktop, full width if no image */}
                    <Box
                      sx={{
                        flex: announcement.imageUrl
                          ? { xs: '1 1 auto', md: '0 0 58%', lg: '0 0 60%' }
                          : '1 1 100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 }
                      }}
                    >
                      {/* Header: Title, Date, Tags - Proper hierarchy */}
                      <Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontWeight: 600,
                            mb: { xs: 1, sm: 1.5 },
                            lineHeight: 1.3,
                            fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' }
                          }}
                        >
                          {announcement.title}
                        </Typography>

                        <Box
                          display="flex"
                          alignItems="center"
                          gap={{ xs: 1, sm: 1.5 }}
                          mb={{ xs: 1.5, sm: 2 }}
                          flexWrap="wrap"
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                            }}
                          >
                            {format(new Date(announcement.startDate), 'MMMM d, yyyy')}
                          </Typography>

                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {announcement.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                  textTransform: 'capitalize',
                                  height: { xs: 22, sm: 24 },
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        {/* Description with proper line height and spacing */}
                        <Typography
                          variant="body1"
                          sx={{
                            mt: { xs: 1.5, sm: 2 },
                            mb: { xs: 1.5, sm: 2 },
                            lineHeight: { xs: 1.6, sm: 1.7 },
                            color: 'text.primary',
                            letterSpacing: '0.01em',
                            fontSize: { xs: '0.9375rem', sm: '1rem' }
                          }}
                        >
                          {announcement.description}
                        </Typography>
                      </Box>

                      {/* Author Info positioned at bottom */}
                      <Box
                        display="flex"
                        alignItems="center"
                        mt={{ xs: 2, sm: 2.5, md: 3 }}
                        pt={{ xs: 1.5, sm: 2 }}
                        borderTop={1}
                        borderColor="divider"
                        role="contentinfo"
                        aria-label="Author information"
                      >
                        <Avatar
                          src={announcement.author?.profilePicture || announcement.author?.avatar}
                          alt={`${announcement.author?.firstName || announcement.author?.name}'s profile picture`}
                          sx={{
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 },
                            mr: { xs: 1, sm: 1.5 }
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                          }}
                        >
                          Posted by {announcement.author?.firstName ? `${announcement.author.firstName} ${announcement.author.lastName}` : announcement.author?.name}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Image Section - 40% width on desktop, conditional rendering */}
                    {announcement.imageUrl && !imageErrors[announcement.id] ? (
                      <Box
                        sx={{
                          flex: { xs: '1 1 auto', md: '0 0 42%', lg: '0 0 40%' },
                          minHeight: { xs: 200, sm: 220, md: 280, lg: 300 },
                          maxHeight: { md: 380, lg: 400 },
                          overflow: 'hidden',
                          borderRadius: { xs: 0, md: 2 },
                          order: { xs: -1, md: 0 },
                          position: 'relative',
                          bgcolor: 'grey.100',
                          transition: 'transform 0.3s ease-in-out'
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={getImageUrl(announcement.imageUrl)}
                          alt={`Image for announcement: ${announcement.title}`}
                          onError={() => handleImageError(announcement.id)}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            display: 'block',
                            transition: 'transform 0.3s ease-in-out'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          flex: { xs: '1 1 auto', md: '0 0 42%', lg: '0 0 40%' },
                          minHeight: { xs: 200, sm: 220, md: 280, lg: 300 },
                          maxHeight: { md: 380, lg: 400 },
                          borderRadius: { xs: 0, md: 2 },
                          order: { xs: -1, md: 0 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                          color: 'text.secondary'
                        }}
                      >
                        <BrokenImage
                          sx={{ fontSize: { xs: 40, sm: 48 }, opacity: 0.5, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          Image unavailable
                        </Typography>
                      </Box>
                    )}

                    {/* Image Error Fallback */}
                    {announcement.imageUrl && imageErrors[announcement.id] && (
                      <Box
                        sx={{
                          flex: { xs: '1 1 auto', md: '0 0 42%', lg: '0 0 40%' },
                          minHeight: { xs: 200, sm: 220, md: 280, lg: 300 },
                          maxHeight: { md: 380, lg: 400 },
                          borderRadius: { xs: 0, md: 2 },
                          order: { xs: -1, md: 0 },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                          color: 'text.secondary'
                        }}
                      >
                        <BrokenImage
                          sx={{
                            fontSize: { xs: 40, sm: 48 },
                            mb: 1,
                            opacity: 0.5
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                        >
                          Image unavailable
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions
                    disableSpacing
                    sx={{
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1.5, sm: 2 },
                      gap: 0.5,
                      borderTop: { xs: '1px solid', md: 'none' },
                      borderColor: 'divider'
                    }}
                  >
                    <IconButton
                      aria-label={`Like announcement: ${announcement.title}`}
                      size="small"
                      onClick={() => handleLike(announcement.id)}
                      sx={{
                        padding: { xs: '6px', sm: '8px' },
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out',
                        color: announcement.likes?.includes(user?.id) ? 'error.main' : 'inherit',
                        '&:hover': {
                          color: 'error.main',
                          backgroundColor: 'rgba(211, 47, 47, 0.08)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Favorite fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mr: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                      }}
                    >
                      {announcement.likes?.length || 0}
                    </Typography>

                    <IconButton
                      aria-label={`Comment on announcement: ${announcement.title}`}
                      size="small"
                      onClick={() => handleCommentClick(announcement.id)}
                      sx={{
                        padding: { xs: '6px', sm: '8px' },
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Comment fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mr: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                      }}
                    >
                      {announcement.comments?.length || 0}
                    </Typography>

                    <IconButton
                      aria-label={`Share announcement: ${announcement.title}`}
                      size="small"
                      onClick={() => handleShare(announcement)}
                      sx={{
                        padding: { xs: '6px', sm: '8px' },
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: 'success.main',
                          backgroundColor: 'rgba(46, 125, 50, 0.08)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Share fontSize="small" />
                    </IconButton>

                    <Box flexGrow={1} />

                    <IconButton
                      aria-label={`More options for announcement: ${announcement.title}`}
                      size="small"
                      sx={{
                        padding: { xs: '6px', sm: '8px' },
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <AnnouncementForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitAnnouncement}
      />
    </Container>
  );
};

export default AnnouncementsPage;
