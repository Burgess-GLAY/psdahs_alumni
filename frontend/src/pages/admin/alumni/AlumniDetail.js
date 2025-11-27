import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  LinearProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import alumniService from '../../../services/alumniService';
import LoadingScreen from '../../../components/common/LoadingScreen';
import ErrorScreen from '../../../components/common/ErrorScreen';
import TabPanel from '../../../components/common/TabPanel';
import { format } from 'date-fns';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  margin: '0 auto',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  marginTop: -75,
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  fontSize: '3.5rem',
  fontWeight: 500
}));

const InfoItem = ({ icon, label, value, link, sx = {} }) => (
  <ListItem sx={{ px: 0, ...sx }}>
    <ListItemAvatar sx={{ minWidth: 40 }}>
      {React.cloneElement(icon, { color: 'action' })}
    </ListItemAvatar>
    <ListItemText
      primary={label}
      secondary={
        link ? (
          <Link href={link} target="_blank" rel="noopener">
            {value}
          </Link>
        ) : value || 'Not specified'
      }
      secondaryTypographyProps={{
        sx: {
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          ...(link && { color: 'primary.main' })
        }
      }}
    />
  </ListItem>
);

const AlumniDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [alumnus, setAlumnus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch alumni data
  useEffect(() => {
    const fetchAlumnus = async () => {
      try {
        setLoading(true);
        const data = await alumniService.getAlumnus(id);
        setAlumnus(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch alumnus:', err);
        setError('Failed to load alumnus data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlumnus();
    }
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;
  if (!alumnus) return null;

  const {
    firstName,
    lastName,
    email,
    phone,
    graduationYear,
    occupation,
    company,
    bio,
    address,
    skills = [],
    socialLinks = {},
    createdAt,
    isActive,
    isAdmin
  } = alumnus;

  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/admin/dashboard" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/admin/alumni" color="inherit">
          Alumni
        </Link>
        <Typography color="text.primary">{fullName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            component={RouterLink}
            to="/admin/alumni"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {fullName}
          </Typography>
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
          {isAdmin && (
            <Chip
              label="Admin"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={RouterLink}
          to={`/admin/alumni/${id}/edit`}
        >
          Edit Profile
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'relative', overflow: 'visible' }}>
            {/* Cover Photo */}
            <Box
              sx={{
                height: 120,
                backgroundColor: theme.palette.primary.main,
                backgroundImage: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
              }}
            />

            {/* Profile Info */}
            <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
              <StyledAvatar>
                {initials}
              </StyledAvatar>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {fullName}
                </Typography>
                <Chip
                  label={`Class of ${graduationYear}`}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                {occupation && (
                  <Typography variant="body2" color="textSecondary">
                    {occupation}
                    {company && ` at ${company}`}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Contact Info */}
              <List>
                <InfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={email}
                  link={`mailto:${email}`}
                />
                {phone && (
                  <InfoItem
                    icon={<PhoneIcon />}
                    label="Phone"
                    value={phone}
                    link={`tel:${phone}`}
                  />
                )}
                {address && (
                  <InfoItem
                    icon={<LocationIcon />}
                    label="Location"
                    value={[address.street, address.city, address.state, address.country, address.zipCode]
                      .filter(Boolean)
                      .join(', ')}
                  />
                )}
                {Object.entries(socialLinks).map(([key, value]) => {
                  if (!value) return null;
                  const socialIcons = {
                    linkedin: <LinkIcon />,
                    twitter: <LinkIcon />,
                    facebook: <LinkIcon />,
                    instagram: <LinkIcon />,
                    github: <LinkIcon />,
                    website: <LinkIcon />
                  };
                  return (
                    <InfoItem
                      key={key}
                      icon={socialIcons[key] || <LinkIcon />}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={value}
                      link={value.startsWith('http') ? value : `https://${value}`}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  );
                })}
                <InfoItem
                  icon={<CalendarIcon />}
                  label="Member Since"
                  value={createdAt ? format(new Date(createdAt), 'MMMM d, yyyy') : 'N/A'}
                />
              </List>
            </Box>
          </Card>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardHeader
                title="Skills & Expertise"
                titleTypographyProps={{ variant: 'h6' }}
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Overview" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Activity" icon={<EventIcon />} iconPosition="start" disabled={!alumnus.recentActivity} />
              <Tab label="Education" icon={<SchoolIcon />} iconPosition="start" disabled={!alumnus.education} />
              <Tab label="Experience" icon={<WorkIcon />} iconPosition="start" disabled={!alumnus.experience} />
            </Tabs>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {bio || 'No bio available.'}
                </Typography>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">
                        <Link href={`mailto:${email}`} color="primary">
                          {email}
                        </Link>
                      </Typography>
                    </Grid>
                    {phone && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                        <Typography variant="body1">
                          <Link href={`tel:${phone}`} color="primary">
                            {phone}
                          </Link>
                        </Typography>
                      </Grid>
                    )}
                    {address && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                        <Typography variant="body1">
                          {[address.street, address.city, address.state, address.country, address.zipCode]
                            .filter(Boolean)
                            .map((line, i, arr) => (
                              <span key={i}>
                                {line}
                                {i < arr.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {skills && skills.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="body1" color="textSecondary">
                  Recent activity will be displayed here.
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="body1" color="textSecondary">
                  Education information will be displayed here.
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="body1" color="textSecondary">
                  Work experience will be displayed here.
                </Typography>
              </TabPanel>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AlumniDetail;
