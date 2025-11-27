import React from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboardPage = () => {
  // Mock data for the dashboard
  const stats = {
    totalAlumni: 1245,
    activeUsers: 843,
    upcomingEvents: 5,
    newRegistrations: 42,
  };

  const chartData = [
    { name: 'Jan', users: 4000, events: 2400, amt: 2400 },
    { name: 'Feb', users: 3000, events: 1398, amt: 2210 },
    { name: 'Mar', users: 2000, events: 9800, amt: 2290 },
    { name: 'Apr', users: 2780, events: 3908, amt: 2000 },
    { name: 'May', users: 1890, events: 4800, amt: 2181 },
    { name: 'Jun', users: 2390, events: 3800, amt: 2500 },
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Alumni</Typography>
                <Typography variant="h4">{stats.totalAlumni.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Active Users</Typography>
                <Typography variant="h4">{stats.activeUsers.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Upcoming Events</Typography>
                <Typography variant="h4">{stats.upcomingEvents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>New Registrations (30d)</Typography>
                <Typography variant="h4">+{stats.newRegistrations}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>User Activity</Typography>
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#1976d2" name="Users" />
                    <Bar dataKey="events" fill="#9c27b0" name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              {/* Add quick action buttons here */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
