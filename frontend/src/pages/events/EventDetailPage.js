import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Paper,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Share as ShareIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// For the tabs in the event detail
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `event-tab-${index}`,
    'aria-controls': `event-tabpanel-${index}`,
  };
}

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [event, setEvent] = useState(null);
  const eventImageFromState = location.state?.eventImage;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    graduationYear: '',
    guestCount: 0,
    specialRequirements: ''
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Fetch event details from API
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/events/${id}`);
        // API returns { success: true, data: event }
        setEvent(response.data.data || response.data);
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRegisterClick = () => {
    setRegisterDialogOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterDialogOpen(false);
    setRegistrationSuccess(false);
    setRegistrationData({
      name: '',
      email: '',
      graduationYear: '',
      guestCount: 0,
      specialRequirements: ''
    });
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setRegistrationSuccess(true);
      // In a real app, you would update the event's registered count here
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title} on ${format(parseISO(event.startDate), 'MMMM d, yyyy')}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ textTransform: 'none' }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Event not found.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/events')}
          sx={{ textTransform: 'none' }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  const isEventPast = isBefore(parseISO(event.endDate), new Date());
  const registrationClosed = !event.registrationEnabled || (event.capacity && event.registered >= event.capacity && !event.isRegistered);

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Back button and title */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none' }}
        >
          Back to Events
        </Button>
        <Box>
          <IconButton onClick={handleShareClick} color="primary">
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Event header */}
      <Card elevation={0} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="400"
            image={eventImageFromState || event.featuredImage || event.image || '/images/event-placeholder.jpg'}
            alt={event.title}
            sx={{
              objectFit: 'cover',
              width: '100%',
              filter: isEventPast ? 'grayscale(50%)' : 'none',
              opacity: isEventPast ? 0.8 : 1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 4,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              color: 'white',
            }}
          >
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              <Chip
                label={event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Event'}
                color="secondary"
                size="small"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
              {isEventPast && (
                <Chip
                  label="Event Ended"
                  variant="outlined"
                  size="small"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
              )}
              {event.registrationEnabled && !isEventPast && (
                <Chip
                  label="Registration Open"
                  color="success"
                  size="small"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              )}
            </Box>
            <Typography variant="h3" component="h1" sx={{ color: 'white', mb: 1 }}>
              {event.title}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={3} alignItems="center">
              <Box display="flex" alignItems="center">
                <CalendarTodayIcon sx={{ mr: 1 }} />
                <Typography>
                  {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography>
                  {format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <LocationOnIcon sx={{ mr: 1 }} />
                <Typography>{event.locationDetails?.venueName || event.location}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Box mb={4}>
                <Typography variant="h5" gutterBottom>About This Event</Typography>
                <Typography variant="body1" paragraph>{event.description}</Typography>

                {event.capacity && (
                  <Box display="flex" flexWrap="wrap" gap={2} mt={3} mb={4}>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${event.registered || 0} / ${event.capacity} Registered`}
                      variant="outlined"
                    />
                    <Chip
                      icon={<GroupIcon />}
                      label={event.capacity - (event.registered || 0) > 0 ? `${event.capacity - (event.registered || 0)} Spots Left` : 'Fully Booked'}
                      color={event.capacity - (event.registered || 0) > 0 ? 'primary' : 'default'}
                      variant="outlined"
                    />
                    <Chip
                      icon={<CategoryIcon />}
                      label={event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Event'}
                      variant="outlined"
                    />
                  </Box>
                )}

                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="event details tabs"
                  sx={{ mb: 3 }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Details" {...a11yProps(0)} />
                  <Tab label="Agenda" {...a11yProps(1)} />
                  <Tab label="Speakers" {...a11yProps(2)} />
                  <Tab label="FAQ" {...a11yProps(3)} />
                  <Tab label="Location" {...a11yProps(4)} />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" gutterBottom>Event Description</Typography>
                  <Typography paragraph>{event.description}</Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Event Details</Typography>
                  <List>
                    <ListItem disableGutters>
                      <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
                      <ListItemText
                        primary="Date & Time"
                        secondary={`${format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')} • ${format(parseISO(event.startDate), 'h:mm a')} - ${format(parseISO(event.endDate), 'h:mm a')}`}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon><LocationOnIcon /></ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={
                          <>
                            <Box>{event.locationDetails?.venueName || event.location}</Box>
                            {event.locationDetails?.address && (
                              <Box>
                                {event.locationDetails.address.street && `${event.locationDetails.address.street}, `}
                                {event.locationDetails.address.city && `${event.locationDetails.address.city}, `}
                                {event.locationDetails.address.state && `${event.locationDetails.address.state} `}
                                {event.locationDetails.address.zipCode}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {event.capacity && (
                      <ListItem disableGutters>
                        <ListItemIcon><GroupIcon /></ListItemIcon>
                        <ListItemText
                          primary="Available Seats"
                          secondary={`${event.capacity - (event.registered || 0)} of ${event.capacity} available`}
                        />
                      </ListItem>
                    )}
                  </List>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>Event Agenda</Typography>
                  {event.agenda && event.agenda.length > 0 ? (
                    <List>
                      {event.agenda
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((item, index) => (
                          <React.Fragment key={index}>
                            <ListItem alignItems="flex-start">
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <ScheduleIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {item.time}
                                    </Typography>
                                    {item.description && (
                                      <>
                                        <br />
                                        {item.description}
                                      </>
                                    )}
                                    {item.speaker && (
                                      <>
                                        <br />
                                        <Typography component="span" variant="body2" color="primary">
                                          Speaker: {item.speaker}
                                        </Typography>
                                      </>
                                    )}
                                  </>
                                }
                                primaryTypographyProps={{ fontWeight: 'medium' }}
                              />
                            </ListItem>
                            {index < event.agenda.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      No agenda has been published for this event yet. Please check back later or contact the organizer for more information.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" gutterBottom>Speakers</Typography>
                  {event.speakers && event.speakers.length > 0 ? (
                    <Grid container spacing={3}>
                      {event.speakers
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((speaker, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                              <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                                <Avatar
                                  src={speaker.photo || '/images/default-profile.jpg'}
                                  alt={speaker.name}
                                  sx={{ width: 120, height: 120, mb: 2 }}
                                />
                                <Typography variant="h6" align="center">{speaker.name}</Typography>
                                {speaker.title && (
                                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                                    {speaker.title}
                                  </Typography>
                                )}
                                {speaker.bio && (
                                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                    {speaker.bio}
                                  </Typography>
                                )}
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      No speakers have been announced for this event yet. Please check back later for updates.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
                  {event.faq && event.faq.length > 0 ? (
                    <Box mt={2}>
                      {event.faq
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((faqItem, index) => (
                          <Accordion key={index} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1" fontWeight="medium">{faqItem.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" color="text.secondary">{faqItem.answer}</Typography>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No FAQs are available for this event at the moment. If you have questions, please contact the organizer.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <Typography variant="h6" gutterBottom>Event Location</Typography>
                  {event.locationDetails ? (
                    <>
                      {event.locationDetails.venueName && (
                        <Typography variant="subtitle1" fontWeight="medium" paragraph>
                          {event.locationDetails.venueName}
                        </Typography>
                      )}
                      {event.locationDetails.address && (
                        <Typography paragraph>
                          {event.locationDetails.address.street && `${event.locationDetails.address.street}`}
                          {event.locationDetails.address.street && <br />}
                          {event.locationDetails.address.city && `${event.locationDetails.address.city}, `}
                          {event.locationDetails.address.state && `${event.locationDetails.address.state} `}
                          {event.locationDetails.address.zipCode}
                          {event.locationDetails.address.country && <br />}
                          {event.locationDetails.address.country}
                        </Typography>
                      )}

                      {event.locationDetails.directions && (
                        <Box mt={3}>
                          <Typography variant="subtitle2" gutterBottom>Directions:</Typography>
                          <Typography variant="body2" paragraph>{event.locationDetails.directions}</Typography>
                        </Box>
                      )}

                      {event.locationDetails.parkingInfo && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>Parking Information:</Typography>
                          <Typography variant="body2" paragraph>{event.locationDetails.parkingInfo}</Typography>
                        </Box>
                      )}

                      {event.locationDetails.coordinates?.lat && event.locationDetails.coordinates?.lng && (
                        <>
                          <Box height={400} borderRadius={2} overflow="hidden" mt={3} mb={3}>
                            <MapContainer
                              center={[event.locationDetails.coordinates.lat, event.locationDetails.coordinates.lng]}
                              zoom={15}
                              style={{ height: '100%', width: '100%' }}
                              scrollWheelZoom={false}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <Marker position={[event.locationDetails.coordinates.lat, event.locationDetails.coordinates.lng]}>
                                <Popup>{event.locationDetails.venueName || event.location}</Popup>
                              </Marker>
                            </MapContainer>
                          </Box>

                          <Button
                            variant="outlined"
                            color="primary"
                            href={`https://www.google.com/maps/dir/?api=1&destination=${event.locationDetails.coordinates.lat},${event.locationDetails.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Get Directions
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1" fontWeight="medium" paragraph>
                        {event.location}
                      </Typography>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Detailed location information including directions and map will be provided closer to the event date.
                      </Alert>
                    </>
                  )}
                </TabPanel>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" gutterBottom>Event Details</Typography>
                <List>
                  <ListItem disableGutters>
                    <ListItemIcon><CalendarTodayIcon color="action" /></ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2">
                          {format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon><LocationOnIcon color="action" /></ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {event.locationDetails?.venueName || event.location}
                        </Typography>
                      }
                      secondary={
                        event.locationDetails?.address ? (
                          <Typography variant="body2">
                            {event.locationDetails.address.street && `${event.locationDetails.address.street}, `}
                            {event.locationDetails.address.city}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItem>
                  {event.capacity && (
                    <ListItem disableGutters>
                      <ListItemIcon><GroupIcon color="action" /></ListItemIcon>
                      <ListItemText
                        primary="Available Seats"
                        secondary={`${event.capacity - (event.registered || 0)} of ${event.capacity} available`}
                      />
                    </ListItem>
                  )}
                </List>

                {!isEventPast && event.registrationEnabled && (
                  <Box mt={3}>
                    {event.isRegistered ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        disabled
                      >
                        You're Registered
                      </Button>
                    ) : registrationClosed ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        disabled
                      >
                        Registration Closed
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleRegisterClick}
                      >
                        Register Now
                      </Button>
                    )}

                    {!event.isRegistered && !registrationClosed && event.capacity && (
                      <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                        {event.capacity - (event.registered || 0)} spots remaining
                      </Typography>
                    )}
                  </Box>
                )}

                {!isEventPast && !event.registrationEnabled && (
                  <Box mt={3}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Registration is not available for this event.
                    </Alert>
                  </Box>
                )}
              </Paper>

              <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Have questions about this event?
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/contact"
                >
                  Contact Organizer
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Registration Dialog */}
      <Dialog
        open={registerDialogOpen}
        onClose={handleRegisterClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register for {event.title}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleRegisterClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        {!registrationSuccess ? (
          <form onSubmit={handleRegistrationSubmit}>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={registrationData.name}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={registrationData.email}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Graduation Year</InputLabel>
                    <Select
                      name="graduationYear"
                      value={registrationData.graduationYear}
                      onChange={handleInputChange}
                      label="Graduation Year"
                    >
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Number of Guests</InputLabel>
                    <Select
                      name="guestCount"
                      value={registrationData.guestCount}
                      onChange={handleInputChange}
                      label="Number of Guests"
                    >
                      {[0, 1, 2, 3, 4, 5].map(num => (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Maximum 5 guests per registration</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Requirements"
                    name="specialRequirements"
                    value={registrationData.specialRequirements}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={3}
                    placeholder="Dietary restrictions, accessibility needs, etc."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleRegisterClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Complete Registration
              </Button>
            </DialogActions>
          </form>
        ) : (
          <>
            <DialogContent>
              <Box textAlign="center" py={4}>
                <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom>Registration Successful!</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Thank you for registering for {event.title}. A confirmation email has been sent to your email address.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Event details and ticket have been added to your account.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRegisterClose}
                sx={{ minWidth: 200 }}
              >
                Done
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default EventDetailPage;
