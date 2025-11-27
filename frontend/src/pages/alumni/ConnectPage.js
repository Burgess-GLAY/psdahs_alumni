import React, { useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, Grid, Paper, Button } from '@mui/material';
import BreadcrumbsNav from '../../components/common/BreadcrumbsNav';
import { analyticsService } from '../../services/analyticsService';
import AlumniDirectoryPage from './AlumniDirectoryPage';

const TabPanel = ({ value, index, children }) => {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
};

const ConnectPage = () => {
  const [tab, setTab] = React.useState(0);

  useEffect(() => {
    analyticsService.trackPageView('/network', 'Connect With Alumni');
  }, []);

  return (
    <Box sx={{ mt: 10 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <BreadcrumbsNav />
        <Typography variant="h3" component="h1" gutterBottom>
          Connect With Alumni
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Discover alumni, send connection requests, and participate in community discussions.
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="connect tabs" sx={{ mb: 3 }}>
          <Tab label="Directory" />
          <Tab label="Messaging" />
          <Tab label="Events" />
          <Tab label="Forums" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <AlumniDirectoryPage />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Messaging</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Secure messaging is coming soon. For privacy, conversations are encrypted and stored securely.
            </Typography>
            <Button variant="contained" disabled>Start a Conversation</Button>
          </Paper>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Participate in Events</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Browse and join alumni events to meet, network, and learn.
                </Typography>
                <Button variant="outlined" href="/events">View Events</Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Discussion Forums</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Join topic-based discussions to share knowledge and opportunities.
            </Typography>
            <Button variant="outlined" disabled>Open Forums</Button>
          </Paper>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default ConnectPage;
