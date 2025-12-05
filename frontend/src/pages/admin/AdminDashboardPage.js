import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import api from '../../services/api';

const COLORS = ['#1976d2', '#9c27b0', '#f57c00', '#388e3c'];

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
    totalClassGroups: 0,
    upcomingEvents: 0,
    recentUsers: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from all endpoints
        const [usersRes, eventsRes, announcementsRes, classGroupsRes] = await Promise.all([
          api.get('/users').catch(() => ({ data: { data: [] } })),
          api.get('/events').catch(() => ({ data: { data: [] } })),
          api.get('/announcements').catch(() => ({ data: { data: [] } })),
          api.get('/class-groups').catch(() => ({ data: { data: [] } }))
        ]);

        const users = usersRes.data.data || usersRes.data || [];
        const events = eventsRes.data.data || eventsRes.data || [];
        const announcements = announcementsRes.data.data || announcementsRes.data || [];
        const classGroups = classGroupsRes.data.data || classGroupsRes.data || [];

        // Calculate upcoming events
        const now = new Date();
        const upcomingEvents = events.filter(event => {
          const eventDate = new Date(event.startDate || event.date);
          return eventDate > now;
        }).length;

        // Calculate recent users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt > thirtyDaysAgo;
        }).length;

        setStats({
          totalUsers: users.length,
          totalEvents: events.length,
          totalAnnouncements: announcements.length,
          totalClassGroups: classGroups.length,
          upcomingEvents,
          recentUsers
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const chartData = [
    { name: 'Users', value: stats.totalUsers, color: COLORS[0] },
    { name: 'Events', value: stats.totalEvents, color: COLORS[1] },
    { name: 'Announcements', value: stats.totalAnnouncements, color: COLORS[2] },
    { name: 'Class Groups', value: stats.totalClassGroups, color: COLORS[3] }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ py: { xs: 3, sm: 4, md: 5 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards - Centered */}
        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h3" color="primary">{stats.totalUsers}</Typography>
                </Box>
                <Typography color="textSecondary" variant="subtitle1">Total Users</Typography>
                <Typography variant="caption" color="success.main">+{stats.recentUsers} this month</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <EventIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h3" color="secondary">{stats.totalEvents}</Typography>
                </Box>
                <Typography color="textSecondary" variant="subtitle1">Total Events</Typography>
                <Typography variant="caption" color="info.main">{stats.upcomingEvents} upcoming</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <AnnouncementIcon sx={{ color: '#f57c00', fontSize: 40 }} />
                  <Typography variant="h3" sx={{ color: '#f57c00' }}>{stats.totalAnnouncements}</Typography>
                </Box>
                <Typography color="textSecondary" variant="subtitle1">Announcements</Typography>
                <Typography variant="caption" color="textSecondary">Active posts</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <SchoolIcon sx={{ color: '#388e3c', fontSize: 40 }} />
                  <Typography variant="h3" sx={{ color: '#388e3c' }}>{stats.totalClassGroups}</Typography>
                </Box>
                <Typography color="textSecondary" variant="subtitle1">Class Groups</Typography>
                <Typography variant="caption" color="textSecondary">Active groups</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts - Centered */}
        <Grid container spacing={3} justifyContent="center">
          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Platform Overview
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1976d2" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Distribution
              </Typography>
              <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions moved below charts - Centered */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: 1400, width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/users"
                  variant="outlined"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/events"
                  variant="outlined"
                  fullWidth
                  startIcon={<EventIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Manage Events
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/announcements"
                  variant="outlined"
                  fullWidth
                  startIcon={<AnnouncementIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Manage Announcements
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/classes"
                  variant="outlined"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Manage Classes
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
