import React, { useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BreadcrumbsNav from '../components/common/BreadcrumbsNav';
import { analyticsService } from '../services/analyticsService';

const GiveBackPage = () => {
  useEffect(() => {
    analyticsService.trackPageView('/give-back', 'Give Back');
  }, []);

  return (
    <Box sx={{ mt: 10 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <BreadcrumbsNav />

        <Typography variant="h3" component="h1" gutterBottom>
          Give Back
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Support students and the alumni community through donations, mentorship, and volunteering.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardMedia
                component="img"
                image="/images/reunion sport day.jpeg"
                alt="Impact"
                loading="lazy"
                sx={{ maxHeight: 420, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Make an Impact Today
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Your support funds scholarships, programs, and community initiatives that change lives.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button component={RouterLink} to="/donate" variant="contained" color="primary">
                    Donate Now
                  </Button>
                  <Button component={RouterLink} to="/community" variant="outlined" color="primary">
                    Mentor & Volunteer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Impact Metrics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="h4" color="primary">100+</Typography>
                  <Typography variant="body2" color="text.secondary">Scholarships Awarded</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary">50+</Typography>
                  <Typography variant="body2" color="text.secondary">Annual Events</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary">5000+</Typography>
                  <Typography variant="body2" color="text.secondary">Jobs Posted</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary">10k+</Typography>
                  <Typography variant="body2" color="text.secondary">Alumni Connected</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom>
            Success Stories
          </Typography>
          <Grid container spacing={3}>
            {[1,2,3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card>
                  <CardMedia component="img" image={`/images/meet and greet at AUTHENTIC TASTE PICTURE ${i}.jpeg`} alt={`Story ${i}`} loading="lazy" />
                  <CardContent>
                    <Typography variant="h6">Scholarship Recipient</Typography>
                    <Typography variant="body2" color="text.secondary">
                      With alumni support, students achieve more. Read how your contributions make a difference.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default GiveBackPage;
