import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with actual API calls
const stats = [
  { id: 1, title: 'Total Alumni', value: '1,254', icon: <PeopleIcon fontSize="large" />, color: 'primary.main' },
  { id: 2, title: 'Upcoming Events', value: '5', icon: <EventIcon fontSize="large" />, color: 'secondary.main' },
  { id: 3, title: 'Active Classes', value: '12', icon: <SchoolIcon fontSize="large" />, color: 'success.main' },
  { id: 4, title: 'New This Month', value: '42', icon: <PersonAddIcon fontSize="large" />, color: 'warning.main' },
];

const recentAlumni = [
  { id: 1, name: 'John Doe', email: 'john@example.com', graduationYear: 2020, avatar: 'JD' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', graduationYear: 2019, avatar: 'JS' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', graduationYear: 2021, avatar: 'RJ' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', graduationYear: 2018, avatar: 'ED' },
];

const upcomingEvents = [
  { id: 1, title: 'Annual Alumni Meet', date: '2023-12-15', attendees: 45 },
  { id: 2, title: 'Career Fair 2023', date: '2023-11-20', attendees: 32 },
  { id: 3, title: 'Homecoming Weekend', date: '2023-11-05', attendees: 78 },
];

const alumniData = [
  { year: '2018', count: 120 },
  { year: '2019', count: 190 },
  { year: '2020', count: 300 },
  { year: '2021', count: 280 },
  { year: '2022', count: 220 },
  { year: '2023', count: 350 },
];

const eventParticipationData = [
  { name: 'Jan', events: 2 },
  { name: 'Feb', events: 3 },
  { name: 'Mar', events: 6 },
  { name: 'Apr', events: 4 },
  { name: 'May', events: 5 },
  { name: 'Jun', events: 7 },
];

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Alumni Growth Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Alumni Growth</Typography>
              <Button size="small" onClick={() => navigate('/admin/alumni')}>
                View All
              </Button>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alumniData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Alumni Count" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Alumni</Typography>
              <Button size="small" onClick={() => navigate('/admin/alumni')}>
                View All
              </Button>
            </Box>
            <List>
              {recentAlumni.map((alumni, index) => (
                <React.Fragment key={alumni.id}>
                  <ListItem 
                    button 
                    onClick={() => navigate(`/admin/alumni/${alumni.id}`)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemAvatar>
                      <Avatar>{alumni.avatar}</Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={alumni.name} 
                      secondary={`Class of ${alumni.graduationYear}`} 
                    />
                  </ListItem>
                  {index < recentAlumni.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={3}>
        {/* Event Participation */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Event Participation</Typography>
              <Button size="small" onClick={() => navigate('/admin/events')}>
                View All Events
              </Button>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventParticipationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="events" 
                    name="Events" 
                    fill={theme.palette.primary.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Upcoming Events</Typography>
              <Button size="small" onClick={() => navigate('/admin/events')}>
                View All
              </Button>
            </Box>
            <List>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem 
                    button 
                    onClick={() => navigate(`/admin/events/${event.id}`)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <CalendarTodayIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={event.title} 
                      secondary={`${new Date(event.date).toLocaleDateString()} • ${event.attendees} attending`} 
                    />
                  </ListItem>
                  {index < upcomingEvents.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
