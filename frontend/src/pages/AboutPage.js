import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField
} from '@mui/material';
import { useAuthModalContext } from '../contexts/AuthModalContext';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { styled } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Groups as GroupsIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Class year image is in the public folder

// Leadership team data
const teamMembers = [
  {
    name: 'Amb Edmond N. Tuazama',
    position: 'President',
    image: '/images/edmond.jpeg',
    batch: 'Class of 2010',
    tenure: '2024–2026',
    bio: 'Diplomat and community leader dedicated to advancing alumni initiatives and student success.'
  },
  {
    name: 'Niome Ragland',
    position: 'Vice President',
    image: '/images/niome.jpeg',
    batch: 'Class of 2012',
    tenure: '2024–2026',
    bio: 'Strategic organizer focused on engagement, events, and professional networking for alumni.'
  },
  {
    name: 'Nicholas Nickey Brosius',
    position: 'Secretary General',
    image: '/images/nicholas.jpeg',
    batch: 'Class of 2015',
    tenure: '2024–2026',
    bio: 'Administrative lead ensuring transparent communication and effective governance.'
  },
  {
    name: 'Lee Justin Payekpala',
    position: 'Final Secretary',
    image: '/images/lee.jpeg',
    batch: 'Class of 2013',
    tenure: '2024–2026',
    bio: 'Detail-oriented records custodian supporting operations and member services.'
  },
  {
    name: 'Michel Cooper',
    position: 'Relations Director',
    image: '/images/michel.jpeg',
    batch: 'Class of 2011',
    tenure: '2024–2026',
    bio: 'Partnerships builder strengthening ties with stakeholders and sponsors.'
  }
];

// Sample achievements data
const achievements = [
  '10,000+ Alumni Network',
  '50+ Annual Events',
  '5,000+ Jobs Posted',
  '100+ Scholarships Awarded'
];

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(/images/FIRST%20REUNION%20PARADE%20PICTURE%201.jpeg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: theme.palette.common.white,
  padding: theme.spacing(15, 0),
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.3) 0%, rgba(156, 39, 176, 0.3) 100%)',
    zIndex: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(10, 0),
    backgroundAttachment: 'scroll',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(6),
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '2px',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const TeamMemberCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3, 2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { openRegister } = useAuthModalContext();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Welcome to PSDAHS Alumni Association
          </Typography>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            component="p"
            sx={{ maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}
          >
            Connecting generations of excellence, fostering lifelong relationships, and supporting our alma mater's legacy.
          </Typography>
          <Box sx={{ mt: 4 }}>
            {!isAuthenticated && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={openRegister}
                sx={{ mr: 2, mb: isMobile ? 2 : 0, cursor: 'pointer' }}
              >
                Join Our Community
              </Button>
            )}
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={Link}
              to="/events"
            >
              Upcoming Events
            </Button>
          </Box>
        </Container>
      </HeroSection>

      {/* About Section */}
      <Container maxWidth="xl" sx={{ mb: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box textAlign="center" mb={8}>
          <SectionTitle variant="h4" component="h2">
            About Our Alumni Association
          </SectionTitle>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: '800px', margin: '0 auto' }}>
            The PSDAHS Alumni Association is a vibrant community of graduates dedicated to maintaining strong connections
            between alumni and our beloved institution. Since our founding, we have been committed to supporting current
            students, fostering professional networks, and giving back to the school that shaped us.
          </Typography>
        </Box>

        {/* Mission & Vision */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box textAlign="center" mb={2}>
                  <SchoolIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  To connect, engage, and inspire alumni to support the mission of PSDAHS and each other through
                  meaningful programs, services, and volunteer opportunities that foster lifelong relationships
                  and advance the school's commitment to excellence in education.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box textAlign="center" mb={2}>
                  <GroupsIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  To be the premier alumni network that transforms the PSDAHS experience into a lifelong connection,
                  creating opportunities for personal and professional growth while strengthening our community's
                  impact on the world.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        </Grid>

        {/* History & Achievements */}
        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h4" component="h2" sx={{ textAlign: 'center', mb: 6 }}>
            Our Journey & Achievements
          </SectionTitle>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                A Legacy of Excellence
              </Typography>
              <Typography variant="body1" paragraph>
                Established in 1995, the PSDAHS Alumni Association has grown from a small group of dedicated graduates
                to a thriving community of over 10,000 members worldwide. Our alumni have gone on to make significant
                contributions in various fields including technology, medicine, arts, and public service.
              </Typography>
              <Typography variant="body1" paragraph>
                Over the years, we've established numerous scholarship programs, funded facility improvements, and
                created mentorship opportunities that have positively impacted thousands of students and alumni.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/history"
                >
                  Explore Our History
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Our Impact
                </Typography>
                <Grid container spacing={3}>
                  {achievements.map((achievement, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box display="flex" alignItems="center">
                        <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">{achievement}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h4" component="h2" sx={{ textAlign: 'center', mb: 6 }}>
            Meet Our Leadership Team
          </SectionTitle>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <TeamMemberCard elevation={3}>
                  <Avatar
                    src={member.image}
                    alt={`${member.name} - ${member.position}`}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto 16px',
                      border: `3px solid ${theme.palette.primary.main}`
                    }}
                    aria-label={`${member.name}'s profile picture`}
                  />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                    {member.position}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">{member.batch}</Typography>
                  {member.tenure && (
                    <Typography variant="body2" color="text.secondary">Tenure: {member.tenure}</Typography>
                  )}
                  {member.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {member.bio}
                    </Typography>
                  )}
                </TeamMemberCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section - Only show for non-logged in users */}
        {!isAuthenticated && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              textAlign: 'center',
              mb: 8
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Join Our Growing Community
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '700px', margin: '0 auto 30px', opacity: 0.9 }}>
              Become part of our network and stay connected with your alma mater and fellow alumni.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={openRegister}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}
            >
              Join Now
            </Button>
          </Paper>
        )}

        {/* Class Year Section */}
        <Box sx={{ position: 'relative', mb: 8, borderRadius: 2, overflow: 'hidden', height: '500px' }}>
          <img
            src="/class-photo.jpg"
            alt="Class of 2019-2020"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white',
              p: 3
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2, maxWidth: '800px', px: 3 }}>
              <SectionTitle variant="h3" component="h2" sx={{ mb: 4, color: 'white' }}>
                Class of 2019-2020
              </SectionTitle>
              <Typography variant="h6" sx={{
                mb: 4,
                fontSize: '1.25rem',
                lineHeight: 1.6,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
              >
                The Class of 2019-2020 at PSDAHS, a remarkable group of graduates who demonstrated resilience and excellence
                during unprecedented times. This class showed exceptional adaptability and determination in their academic
                journey, leaving a lasting legacy for future generations of PSDAHS students.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Contact Section */}
        <Box>
          <SectionTitle variant="h4" component="h2" sx={{ textAlign: 'center', mb: 6 }}>
            Get In Touch
          </SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Contact Information
              </Typography>
              <Box mb={3}>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography>ELWA JUNCTION, PSDAHS Campus, Paynesville City, Liberia</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography>alumni@psdahs.edu</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <PhoneIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography>+231 (881) 123-4567</Typography>
                </Box>
              </Box>
              <Box mt={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Follow Us
                </Typography>
                <Box display="flex" gap={2}>
                  <IconButton
                    color="primary"
                    component="a"
                    href="https://facebook.com"
                    target="_blank"
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    component="a"
                    href="https://twitter.com"
                    target="_blank"
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    component="a"
                    href="https://linkedin.com"
                    target="_blank"
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <LinkedInIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    component="a"
                    href="https://instagram.com"
                    target="_blank"
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <InstagramIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Send Us a Message
                </Typography>
                <form onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Email"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        variant="outlined"
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        multiline
                        rows={4}
                        variant="outlined"
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 2 }}
                        aria-label="Send message"
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

AboutPage.propTypes = {
  // Add any props here if needed
};

export default AboutPage;
