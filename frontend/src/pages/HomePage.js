import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  useTheme
} from '@mui/material';
import { analyticsService } from '../services/analyticsService';
import { useAuthModalContext } from '../contexts/AuthModalContext';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import api from '../services/api';
import { CircularProgress, Alert } from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const features = [
  {
    icon: <EventIcon fontSize="large" color="primary" />,
    title: 'Upcoming Events',
    description: 'Stay updated with all the upcoming alumni events, reunions, and activities.',
    link: '/events'
  },
  {
    icon: <PeopleIcon fontSize="large" color="primary" />,
    title: 'Connect with Alumni',
    description: 'Reconnect with old classmates and expand your professional network.',
    link: '/network'
  },
  {
    icon: <SchoolIcon fontSize="large" color="primary" />,
    title: 'Give Back',
    description: 'Support current students through mentorship and scholarship programs.',
    link: '/give-back'
  }
];

const HomePage = () => {
  const theme = useTheme();
  const { openRegister } = useAuthModalContext();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured events from API (max 3 for homepage)
  // Falls back to upcoming events if no featured events exist
  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch featured events first
        const response = await api.get('/events/featured?limit=3');
        const featuredEvents = response.data.data || [];

        if (featuredEvents.length > 0) {
          setEvents(featuredEvents);
        } else {
          // Fallback to upcoming events if no featured events
          const upcomingResponse = await api.get('/events/upcoming?limit=3');
          setEvents(upcomingResponse.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
        // Don't show error, just show empty state
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 8,
          pb: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to PSDAHS Alumni Network
              </Typography>
              <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
                Reconnect with classmates, join events, and stay involved with your alma mater.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/events"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  View Events
                </Button>
                {!isAuthenticated && (
                  <Button
                    onClick={openRegister}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      mr: 2,
                      mb: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      },
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    Sign Up Now
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/FIRST REUNION PARADE PICTURE 1.jpeg"
                alt="PSDAHS Alumni Reunion"
                sx={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: 3,
                  boxShadow: theme.shadows[20],
                  display: { xs: 'none', md: 'block' },
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Us Section (moved to left) */}
      <Box bgcolor="primary.50" py={8}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={6} alignItems="center">
            {/* Text first */}
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary" fontWeight="bold">
                ABOUT US
              </Typography>
              <Typography variant="h3" component="h2" gutterBottom>
                Our Alumni Community
              </Typography>
              <Typography paragraph sx={{ mb: 3, fontSize: '1.1rem' }}>
                The PSDAHS Alumni Association connects generations of graduates, fostering lifelong relationships and supporting our alma mater's legacy. Join our growing network of successful professionals making a difference.
              </Typography>
              <Button
                component={Link}
                to="/about"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
              >
                Learn More About Us
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={openRegister}
                  sx={{ cursor: 'pointer', mt: 2 }}
                >
                  Join Now
                </Button>
              )}
            </Grid>

            {/* Image second */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/meet and greet at AUTHENTIC TASTE PICTURE 1.jpeg"
                alt="About PSDAHS Alumni"
                sx={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: 3,
                  boxShadow: theme.shadows[8],
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[16],
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Stay Connected
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
          Our alumni network helps you stay connected with your alma mater and fellow graduates.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={feature.link}
                  onClick={() =>
                    analyticsService.trackCustomEvent('learn_more_click', {
                      section: feature.title,
                      destination: feature.link,
                    })
                  }
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    p: 3,
                  }}
                >
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                  >
                    Learn more
                  </Button>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Upcoming Events Section */}
      <Box bgcolor="grey.50" py={8}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h3" component="h2" gutterBottom>
                Upcoming Events
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Don't miss out on these exciting events
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/events"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIcon />}
            >
              View All Events
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" width="100%" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box width="100%" my={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : events.length === 0 ? (
            <Box width="100%" textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No upcoming events found. Check back later!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} md={4} key={event._id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.image || '/images/event-placeholder.jpg'}
                      alt={event.title}
                      sx={{
                        objectFit: 'cover',
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {event.description || 'No description available.'}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/events/${event._id}`}
                        onClick={() =>
                          analyticsService.trackCustomEvent('learn_more_click', {
                            section: 'Upcoming Events',
                            destination: `/events/${event._id}`,
                            eventTitle: event.title
                          })
                        }
                        color="primary"
                        size="small"
                        variant="contained"
                        sx={{
                          mt: 'auto',
                          borderRadius: 2,
                        }}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Call to Action - Only show for non-logged in users */}
      {!isAuthenticated && (
        <Box bgcolor="primary.main" color="white" py={8}>
          <Container maxWidth="xl" sx={{ textAlign: 'center', px: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to Join Our Community?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Connect with fellow alumni, share your achievements, and stay updated with the latest news and events.
            </Typography>
            <Button
              onClick={openRegister}
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                '&:hover': {
                  boxShadow: theme.shadows[12],
                },
              }}
            >
              Sign Up Now
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
