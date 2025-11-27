import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      upcomingEvents: 0,
      totalUsers: 0,
      classmates: 0,
      announcements: 0,
      classGroups: 0,
      donations: 0
    },
    recentActivities: [],
    activityChart: [],
    categoryDistribution: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all data in parallel
      const [eventsRes, userStatsRes, announcementsRes, classGroupsRes] = await Promise.all([
        axios.get('/api/events', { headers: { 'x-auth-token': token } }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/users/public-stats').catch(() => ({ data: { data: { totalUsers: 0 } } })),
        axios.get('/api/announcements', { headers: { 'x-auth-token': token } }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/class-groups', { headers: { 'x-auth-token': token } }).catch(() => ({ data: { data: [] } }))
      ]);

      const events = eventsRes.data.data || [];
      const totalUsers = userStatsRes.data.data?.totalUsers || 0;
      const announcements = announcementsRes.data.data || [];
      const classGroups = classGroupsRes.data.data || [];

      // Filter upcoming events
      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) >= now);

      // Get classmates count from class groups
      let classmatesCount = 0;
      if (user?.graduationYear) {
        const userClassGroup = classGroups.find(g => g.graduationYear === user.graduationYear);
        classmatesCount = userClassGroup?.members?.length || 0;
      }

      // Calculate activity chart data
      const activityData = [
        { name: 'Events', count: events.length, color: '#1976d2' },
        { name: 'Announcements', count: announcements.length, color: '#9c27b0' },
        { name: 'Class Groups', count: classGroups.length, color: '#2e7d32' },
        { name: 'Alumni', count: totalUsers, color: '#ed6c02' }
      ];

      // Calculate category distribution for pie chart
      const categoryData = [
        { name: 'Events', value: events.length },
        { name: 'Announcements', value: announcements.length },
        { name: 'Class Groups', value: classGroups.length },
        { name: 'Users', value: totalUsers }
      ];

      // Generate recent activities from real data
      const activities = [];

      // Add recent announcements
      announcements.slice(0, 2).forEach(a => {
        activities.push({
          id: `announcement-${a._id}`,
          user: `${a.author?.firstName || 'Admin'} ${a.author?.lastName || ''}`,
          action: `posted: ${a.title}`,
          time: getTimeAgo(a.createdAt),
          avatar: a.author?.profilePicture
        });
      });

      // Add recent events
      events.slice(0, 2).forEach(e => {
        activities.push({
          id: `event-${e._id}`,
          user: 'Alumni Association',
          action: `created event: ${e.title}`,
          time: getTimeAgo(e.createdAt)
        });
      });

      // Sort by most recent
      activities.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      setDashboardData({
        stats: {
          upcomingEvents: upcomingEvents.length,
          totalUsers: totalUsers,
          classmates: classmatesCount,
          announcements: announcements.length,
          classGroups: classGroups.length
        },
        recentActivities: activities.slice(0, 6),
        activityChart: activityData,
        categoryDistribution: categoryData
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return 'Over a month ago';
  };

  const parseTimeAgo = (timeStr) => {
    const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
    if (!match) return 999999;
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'minute') return value;
    if (unit === 'hour') return value * 60;
    if (unit === 'day') return value * 1440;
    return 999999;
  };

  const stats = [
    {
      title: 'Upcoming Events',
      value: dashboardData.stats.upcomingEvents,
      icon: <EventIcon color="primary" sx={{ fontSize: 40 }} />,
      color: 'primary',
      onClick: () => navigate('/events')
    },
    {
      title: 'Total Alumni',
      value: dashboardData.stats.totalUsers,
      icon: <PeopleIcon color="secondary" sx={{ fontSize: 40 }} />,
      color: 'secondary',
      onClick: () => navigate('/community')
    },
    {
      title: 'My Classmates',
      value: dashboardData.stats.classmates,
      icon: <SchoolIcon color="success" sx={{ fontSize: 40 }} />,
      color: 'success',
      onClick: () => navigate('/classes')
    },
    {
      title: 'Announcements',
      value: dashboardData.stats.announcements,
      icon: <AnnouncementIcon color="warning" sx={{ fontSize: 40 }} />,
      color: 'warning',
      onClick: () => navigate('/announcements')
    },
  ];

  const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={stat.onClick}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography color="textSecondary" variant="body2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4">
                        {stat.value}
                      </Typography>
                    </div>
                    <Box
                      sx={{
                        backgroundColor: `${stat.color}.light`,
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Bar Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Platform Activity Overview
                </Typography>
                <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                  <ResponsiveContainer>
                    <BarChart data={dashboardData.activityChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#1976d2" name="Total Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Content Distribution
                </Typography>
                <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={dashboardData.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.categoryDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                {dashboardData.recentActivities.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No recent activities to display
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {dashboardData.recentActivities.map((activity) => (
                      <Box
                        key={activity.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                        }}
                      >
                        <Avatar
                          src={activity.avatar}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {activity.user.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1">
                            <strong>{activity.user}</strong> {activity.action}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                    fullWidth
                  >
                    Update Profile
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<GroupsIcon />}
                    onClick={() => navigate('/classes')}
                    fullWidth
                  >
                    Connect with Classmates
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/events')}
                    fullWidth
                  >
                    View Events
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/community')}
                    fullWidth
                  >
                    Browse Alumni
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
