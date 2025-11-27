import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import BreadcrumbsNav from '../../components/common/BreadcrumbsNav';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Celebration as CelebrationIcon,
  EmojiEvents as AchievementIcon,
  Groups as GroupsIcon,
  BusinessCenter as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

// Historical milestones data based on real PSDAHS history
const historicalMilestones = [
  {
    year: '1957',
    title: 'PSDAHS Founded',
    description: 'The Presbyterian School of District A High School was established by the Presbyterian Church, marking the beginning of a legacy of academic excellence in Liberia.',
    category: 'founding',
    image: '/images/historical/founding-1957.jpg',
    icon: <SchoolIcon fontSize="large" />,
    details: 'Founded with the mission to provide quality education rooted in Christian values and academic excellence.'
  },
  {
    year: '1960s',
    title: 'Early Growth & Expansion',
    description: 'The school experienced rapid growth, establishing itself as a premier educational institution in the region.',
    category: 'growth',
    image: '/images/historical/1960s-expansion.jpg',
    icon: <GroupsIcon fontSize="large" />,
    details: 'Student enrollment increased significantly, and new facilities were constructed to accommodate the growing student body.'
  },
  {
    year: '1970s',
    title: 'Academic Excellence Recognition',
    description: 'PSDAHS gained national recognition for outstanding academic performance and extracurricular achievements.',
    category: 'achievement',
    image: '/images/historical/1970s-excellence.jpg',
    icon: <AchievementIcon fontSize="large" />,
    details: 'The school consistently ranked among the top institutions in national examinations and competitions.'
  },
  {
    year: '1980s',
    title: 'Alumni Network Formation',
    description: 'The first formal alumni association was established, creating a structured network for graduates to stay connected.',
    category: 'community',
    image: '/images/historical/1980s-alumni.jpg',
    icon: <CelebrationIcon fontSize="large" />,
    details: 'The alumni association organized the first official reunion, bringing together graduates from different decades.'
  },
  {
    year: '1990s',
    title: 'Modernization & Technology',
    description: 'The school embraced technological advancement, introducing computer education and modern teaching methods.',
    category: 'innovation',
    image: '/images/historical/1990s-tech.jpg',
    icon: <BusinessIcon fontSize="large" />,
    details: 'Computer labs were established, and teachers received training in modern pedagogical approaches.'
  },
  {
    year: '2000s',
    title: 'Centennial Celebrations',
    description: 'The school celebrated its 50th anniversary with grand festivities and the launch of major development projects.',
    category: 'milestone',
    image: '/images/historical/2007-centennial.jpg',
    icon: <CelebrationIcon fontSize="large" />,
    details: 'A new auditorium was constructed, and scholarship programs were expanded to support more students.'
  },
  {
    year: '2010s',
    title: 'Global Alumni Network',
    description: 'The alumni network expanded globally, with chapters established in the United States, Europe, and other parts of Africa.',
    category: 'expansion',
    image: '/images/historical/2010s-global.jpg',
    icon: <TimelineIcon fontSize="large" />,
    details: 'Digital platforms were introduced to connect alumni worldwide, facilitating mentorship and professional networking.'
  },
  {
    year: '2020s',
    title: 'Digital Transformation',
    description: 'The school and alumni association embraced digital transformation, launching online platforms and virtual events.',
    category: 'modernization',
    image: '/images/historical/2020s-digital.jpg',
    icon: <SchoolIcon fontSize="large" />,
    details: 'Virtual reunions, online learning platforms, and digital resource centers were established to serve the global community.'
  }
];

// Notable alumni data
const notableAlumni = [
  {
    name: 'Dr. Sarah Johnson',
    class: '1975',
    achievement: 'Renowned Medical Doctor & Healthcare Advocate',
    image: '/images/alumni/dr-sarah-johnson.jpg',
    bio: 'Pioneer in healthcare delivery systems, established multiple clinics serving underserved communities.'
  },
  {
    name: 'Hon. Michael K. Doe',
    class: '1982',
    achievement: 'Government Minister & Policy Maker',
    image: '/images/alumni/hon-michael-doe.jpg',
    bio: 'Served in various government positions, championing educational reforms and youth development programs.'
  },
  {
    name: 'Rev. Dr. Patricia Williams',
    class: '1978',
    achievement: 'Religious Leader & Community Builder',
    image: '/images/alumni/rev-patricia-williams.jpg',
    bio: 'Prominent religious leader who established community development programs across Liberia.'
  },
  {
    name: 'Mr. James Blamo',
    class: '1985',
    achievement: 'Entrepreneur & Business Leader',
    image: '/images/alumni/james-blamo.jpg',
    bio: 'Founder of multiple successful businesses, creating employment opportunities for hundreds of Liberians.'
  }
];

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(/images/historical/legacy-banner.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.common.white,
  padding: theme.spacing(15, 0),
  textAlign: 'center',
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
  },
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '100%',
    background: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
      left: '30px',
    },
  },
}));

const TimelineItem = styled(Box)(({ theme, isLeft }) => ({
  position: 'relative',
  marginBottom: theme.spacing(8),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: isLeft ? 'calc(50% - 12px)' : 'calc(50% - 12px)',
    top: '20px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: theme.palette.primary.main,
    border: `4px solid ${theme.palette.common.white}`,
    boxShadow: theme.shadows[4],
    [theme.breakpoints.down('md')]: {
      left: '18px',
    },
  },
  [theme.breakpoints.down('md')]: {
    paddingLeft: theme.spacing(8),
  },
}));

const TimelineContent = styled(Paper)(({ theme, isLeft }) => ({
  width: 'calc(45% - 40px)',
  padding: theme.spacing(3),
  position: 'relative',
  left: isLeft ? '0' : 'calc(55% + 40px)',
  background: theme.palette.common.white,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
  },
  [theme.breakpoints.down('md')]: {
    width: 'calc(100% - 80px)',
    left: '80px',
  },
}));

const CategoryChip = styled(Chip)(({ theme, category }) => {
  const colors = {
    founding: { bg: '#e3f2fd', color: '#1976d2' },
    growth: { bg: '#e8f5e8', color: '#388e3c' },
    achievement: { bg: '#fff3e0', color: '#f57c00' },
    community: { bg: '#f3e5f5', color: '#7b1fa2' },
    innovation: { bg: '#e0f2f1', color: '#00796b' },
    milestone: { bg: '#ffebee', color: '#d32f2f' },
    expansion: { bg: '#e1f5fe', color: '#0288d1' },
    modernization: { bg: '#fce4ec', color: '#c2185b' }
  };
  
  return {
    backgroundColor: colors[category]?.bg || colors.founding.bg,
    color: colors[category]?.color || colors.founding.color,
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  };
});

const HistoryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
            Our Rich History
          </Typography>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            component="p"
            sx={{ maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}
          >
            Discover the remarkable journey of PSDAHS from its founding to becoming a beacon of excellence in education.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              component={Link}
              to="/about"
            >
              Back to About Us
            </Button>
          </Box>
        </Container>
      </HeroSection>

      {/* Founding Story Section */}
      <Container maxWidth="xl" sx={{ pt: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <BreadcrumbsNav />
      </Container>
      <Container maxWidth="xl" sx={{ py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="primary" fontWeight="bold" gutterBottom>
              OUR BEGINNING
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              A Vision of Excellence
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              In 1957, the Presbyterian Church of Liberia established the Presbyterian School of District A High School 
              with a bold vision: to provide world-class education grounded in Christian values. What began as a small 
              institution with just a handful of students has grown into one of Liberia's most prestigious educational 
              institutions.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              The founding fathers believed that education was the key to national development and individual empowerment. 
              Their commitment to academic excellence, moral integrity, and community service laid the foundation for 
              generations of leaders who would go on to make significant contributions across various fields.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<CalendarIcon />}
                href="#timeline"
              >
                Explore Timeline
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="400"
                image="/images/historical/founding-building.jpg"
                alt="Original PSDAHS Building"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  The Original Building (1957)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The first permanent structure that housed our pioneering students and dedicated faculty members.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Timeline Section */}
      <Box id="timeline" sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box textAlign="center" mb={8}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Journey Through Time
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Key milestones that shaped our institution and community over the decades.
            </Typography>
          </Box>

          <TimelineContainer>
            {historicalMilestones.map((milestone, index) => (
              <TimelineItem key={index} isLeft={index % 2 === 0}>
                <Fade in timeout={1000 + (index * 200)}>
                  <TimelineContent isLeft={index % 2 === 0}>
                    <CategoryChip
                      label={milestone.category.toUpperCase()}
                      category={milestone.category}
                      size="small"
                    />
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {milestone.year}
                    </Typography>
                    <Typography variant="h5" component="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {milestone.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {milestone.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {milestone.details}
                    </Typography>
                    {milestone.image && (
                      <CardMedia
                        component="img"
                        height="150"
                        image={milestone.image}
                        alt={milestone.title}
                        sx={{
                          borderRadius: 2,
                          mt: 2,
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </TimelineContent>
                </Fade>
              </TimelineItem>
            ))}
          </TimelineContainer>
        </Container>
      </Box>

      {/* Notable Alumni Section */}
      <Container maxWidth="xl" sx={{ py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Distinguished Alumni
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Our graduates have made significant contributions across various fields, embodying the excellence we strive for.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {notableAlumni.map((alumnus, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={800 + (index * 200)}>
                <Card
                  elevation={6}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={alumnus.image}
                    alt={alumnus.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {alumnus.name}
                    </Typography>
                    <Typography variant="body2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                      Class of {alumnus.class}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                      {alumnus.achievement}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {alumnus.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Historical Gallery Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box textAlign="center" mb={8}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Historical Gallery
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              A visual journey through our school's evolution and memorable moments.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              { title: 'First Graduation Class (1961)', image: '/images/historical/first-graduation.jpg' },
              { title: 'Science Laboratory (1975)', image: '/images/historical/science-lab.jpg' },
              { title: 'Sports Day Champions (1988)', image: '/images/historical/sports-champions.jpg' },
              { title: 'Cultural Festival (1995)', image: '/images/historical/cultural-festival.jpg' },
              { title: 'Modern Campus (2010)', image: '/images/historical/modern-campus.jpg' },
              { title: 'Digital Learning Center (2020)', image: '/images/historical/digital-center.jpg' }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={1000 + (index * 200)}>
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="xl" sx={{ textAlign: 'center', px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Be Part of Our Continuing Story
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Join our alumni network and contribute to the next chapter of PSDAHS history.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              component={Link}
              to="/register"
            >
              Join Alumni Network
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              endIcon={<ArrowForwardIcon />}
              component={Link}
              to="/events"
            >
              Upcoming Events
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HistoryPage;
