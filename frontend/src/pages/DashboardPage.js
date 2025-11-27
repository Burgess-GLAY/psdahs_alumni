import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Chip,
  CircularProgress,
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
import { format } from 'date-fns';

// Mock data - replace with actual API calls
const mockUpcomingEvents = [
  {
    id: 1,
    title: 'Annual Alumni Reunion',
    date: '2025-12-15T18:00:00',
    location: 'PSDAHS Main Hall',
    registered: true
  },
  {
    id: 2,
    title: 'Career Fair',
    date: '2025-11-20T10:00:00',
    location: 'School Gymnasium',
    registered: false
  },
  {
    id: 3,
    title: 'Class of 2020 5-Year Reunion',
    date: '2025-10-15T19:00:00',
    location: 'Grand Ballroom',
    registered: true
  },
];

const mockRecentAnnouncements = [
  {
    id: 1,
    title: 'New Alumni Portal Launched',
    date: '2025-10-01T09:00:00',
    excerpt: 'We are excited to announce the launch of our new alumni portal...',
    category: 'announcement'
  },
  {
    id: 2,
    title: 'Call for Class Representatives',
    date: '2025-09-25T14:30:00',
    excerpt: 'We are looking for class representatives for the upcoming year...',
    category: 'opportunity'
  },
  {
    id: 3,
    title: 'Alumni Scholarship Program',
    date: '2025-09-15T10:15:00',
    excerpt: 'Applications are now open for the 2025 Alumni Scholarship...',
    category: 'scholarship'
  },
];

const DashboardPage = () => {
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const theme = useTheme();

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Replace with actual API calls
      setStats({
        eventsAttended: 12,
        totalDonations: 2450,
        alumniConnected: 856,
        upcomingEvents: 3
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEventRegister = (eventId) => {
    // Handle event registration
    console.log(`Registering for event ${eventId}`);
  };

  const handleViewAll = (type) => {
    // Handle view all action
    console.log(`View all ${type}`);
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
            <List>
              {mockUpcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      },
                      cursor: 'pointer',
                    }}
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
                          {event.registered && (
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
                            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {event.location}
                          </Typography>
                        </>
                      }
                    />
                    {!event.registered && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventRegister(event.id);
                        }}
                      >
                        Register
                      </Button>
                    )}
                  </ListItem>
                  {index < mockUpcomingEvents.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
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
            <List>
              {mockRecentAnnouncements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      },
                      cursor: 'pointer',
                    }}
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
                          <Chip
                            label={announcement.category}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ ml: 1, textTransform: 'capitalize' }}
                          />
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
                            {announcement.excerpt}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {format(new Date(announcement.date), 'MMM d, yyyy')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < mockRecentAnnouncements.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
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
              onClick={() => console.log('Connect with Alumni')}
            >
              Connect
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => console.log('Browse Events')}
            >
              Events
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SchoolIcon />}
              onClick={() => console.log('Class Groups')}
            >
              Class Groups
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
