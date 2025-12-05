import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import { format, parseISO } from 'date-fns';
import api from '../services/api';

const DashboardPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    eventsAttended: 0,
    totalDonations: 0,
    alumniConnected: 0,
    upcomingEvents: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const theme = useTheme();

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events, announcements, and user stats in parallel
        const [eventsRes, announcementsRes, classGroupsRes] = await Promise.all([
          api.get('/events/upcoming?limit=3').catch(() => ({ data: { data: [] } })),
          api.get('/announcements?limit=3').catch(() => ({ data: { data: [] } })),
          api.get('/class-groups').catch(() => ({ data: { data: [] } }))
        ]);

        const events = eventsRes.data.data || eventsRes.data || [];
        const announcements = announcementsRes.data.data || announcementsRes.data || [];
        const classGroups = classGroupsRes.data.data || classGroupsRes.data || [];

        // Get user's class group to find classmates
        let classmatesCount = 0;
        if (user?.graduationYear) {
          const userClassGroup = classGroups.find(g => g.graduationYear === user.graduationYear);
          classmatesCount = userClassGroup?.memberCount || userClassGroup?.members?.length || 0;
        }

        // Calculate stats
        const now = new Date();
        const upcomingEventsList = events.filter(event => {
          const eventDate = new Date(event.startDate || event.date);
          return eventDate >= now;
        });

        setUpcomingEvents(upcomingEventsList.slice(0, 3));
        setRecentAnnouncements(announcements.slice(0, 3));

        setStats({
          eventsAttended: 0, // This would need a separate API call for user's event history
          totalDonations: 0, // This would need a separate API call for user's donations
          alumniConnected: classmatesCount,
          upcomingEvents: upcomingEventsList.length
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleEventRegister = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleViewAll = (type) => {
    if (type === 'events') {
      navigate('/events');
    } else if (type === 'announcements') {
      navigate('/announcements');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName || 'Alumni'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's what's happening with your alumni community.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  <EventIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats?.eventsAttended || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Events Attended
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.success.light, mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">${stats?.totalDonations?.toLocaleString() || '0'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Donations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.warning.light, mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats?.alumniConnected?.toLocaleString() || '0'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Alumni Connected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.info.light, mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats?.upcomingEvents || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Upcoming Events
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleViewAll('events')}
              >
                View All
              </Button>
            </Box>
            {upcomingEvents.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming events found.
                </Typography>
              </Box>
            ) : (
              <List>
                {upcomingEvents.map((event, index) => (
                  <React.Fragment key={event._id || event.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/events/${event._id || event.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" component="span">
                              {event.title}
                            </Typography>
                            {event.isRegistered && (
                              <Chip
                                icon={<CheckCircleIcon fontSize="small" />}
                                label="Registered"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              display="block"
                            >
                              {format(parseISO(event.startDate || event.date), 'EEEE, MMMM d, yyyy')}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {event.location || 'Location TBA'}
                            </Typography>
                          </>
                        }
                      />
                      {!event.isRegistered && event.registrationEnabled && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventRegister(event._id || event.id);
                          }}
                        >
                          Register
                        </Button>
                      )}
                    </ListItem>
                    {index < upcomingEvents.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Recent Announcements
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleViewAll('announcements')}
              >
                View All
              </Button>
            </Box>
            {recentAnnouncements.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No recent announcements found.
                </Typography>
              </Box>
            ) : (
              <List>
                {recentAnnouncements.map((announcement, index) => (
                  <React.Fragment key={announcement._id || announcement.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate('/announcements')}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.light' }}>
                          <AnnouncementIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle1" component="span">
                              {announcement.title}
                            </Typography>
                            {announcement.category && (
                              <Chip
                                label={announcement.category}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ ml: 1, textTransform: 'capitalize' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              display="block"
                              mb={0.5}
                            >
                              {announcement.content?.substring(0, 100) || announcement.excerpt || 'No description available'}
                              {(announcement.content?.length > 100 || announcement.excerpt?.length > 100) && '...'}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {format(parseISO(announcement.createdAt || announcement.date), 'MMM d, yyyy')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentAnnouncements.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              component={RouterLink}
              to="/alumni"
            >
              Connect
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EventIcon />}
              component={RouterLink}
              to="/events"
            >
              Events
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SchoolIcon />}
              component={RouterLink}
              to="/classes"
            >
              Class Groups
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AnnouncementIcon />}
              component={RouterLink}
              to="/announcements"
            >
              Announcements
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              component={RouterLink}
              to="/profile"
            >
              Profile
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
