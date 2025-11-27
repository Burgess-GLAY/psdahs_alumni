import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Stack,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  Place as PlaceIcon,
  Group as GroupIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';

const eventCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'reunion', label: 'Reunions' },
  { value: 'career', label: 'Career Fairs' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'sports', label: 'Sports' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' },
];

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: itemsPerPage,
          upcoming: dateFilter === 'upcoming' ? 'true' : undefined,
          type: category !== 'all' ? category : undefined,
          search: searchTerm || undefined
        };

        const response = await api.get('/events', { params });

        setEvents(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, category, dateFilter, searchTerm]);

  // Read page from URL on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get('page')) || 1;
    if (pageParam !== page) {
      setPage(pageParam);
    }
  }, [location.search]);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Update URL with new page number
    const params = new URLSearchParams(location.search);
    params.set('page', value);
    navigate(`/events?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleRegisterClick = (eventId, e) => {
    e.stopPropagation();
    // Handle event registration
    console.log(`Register for event ${eventId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Events
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover and register for upcoming alumni events
        </Typography>
      </Box>

      {/* Filters */}
      <Box mb={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {eventCategories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="date-filter-label">Date</InputLabel>
              <Select
                labelId="date-filter-label"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date"
              >
                <MenuItem value="all">All Dates</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="past">Past Events</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(e, newView) => newView && setView(newView)}
              aria-label="view mode"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <Box textAlign="center" py={8}>
          <EventIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      ) : view === 'grid' ? (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item key={event.id} xs={12} sm={6} lg={4}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleEventClick(event._id || event.id)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={event.featuredImage || event.image || '/images/default-image.jpg'}
                      alt={event.title}
                    />
                    {event.isFeatured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                    <Chip
                      label={eventCategories.find(cat => cat.value === event.category)?.label || 'Event'}
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: -16,
                        left: 16,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {event.title}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(event.startDate), 'MMM d, yyyy • h:mm a')}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PlaceIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description && event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                    </Typography>
                    {event.capacity && (
                      <Box display="flex" alignItems="center" mt="auto">
                        <GroupIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {event.registered || 0} / {event.capacity} registered
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {event.registrationEnabled ? (
                    <Button
                      size="small"
                      color="primary"
                      variant={event.isRegistered ? 'outlined' : 'contained'}
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterClick(event._id || event.id, e);
                      }}
                      disabled={event.isRegistered}
                    >
                      {event.isRegistered ? 'Registered' : 'Register Now'}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      fullWidth
                      onClick={() => handleEventClick(event._id || event.id)}
                    >
                      View Details
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {events.map((event, index) => (
            <React.Fragment key={event._id || event.id}>
              <Card
                sx={{
                  mb: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  height: { md: 200 },
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    width: { xs: '100%', md: 300 },
                    height: { xs: 160, md: '100%' },
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={event.featuredImage || event.image || '/images/default-image.jpg'}
                    alt={event.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {event.isFeatured && (
                    <Chip
                      label="Featured"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </CardMedia>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="div">
                        {event.title}
                      </Typography>
                      <Chip
                        label={eventCategories.find(cat => cat.value === event.category)?.label || 'Event'}
                        color="secondary"
                        size="small"
                        sx={{ ml: 2, flexShrink: 0 }}
                      />
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={2} mb={1.5}>
                      <Box display="flex" alignItems="center">
                        <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(parseISO(event.startDate), 'MMM d, yyyy • h:mm a')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <PlaceIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>
                    {event.capacity && (
                      <Box display="flex" alignItems="center" mt="auto">
                        <GroupIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {event.registered || 0} / {event.capacity} registered • {event.isRegistered ? 'You are registered' : 'Spots available'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                    {event.registrationEnabled ? (
                      <>
                        <Button
                          size="small"
                          color="primary"
                          variant={event.isRegistered ? 'outlined' : 'contained'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegisterClick(event._id || event.id, e);
                          }}
                          disabled={event.isRegistered}
                        >
                          {event.isRegistered ? 'Registered' : 'Register Now'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleEventClick(event._id || event.id)}
                        >
                          View Details
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => handleEventClick(event._id || event.id)}
                      >
                        View Details
                      </Button>
                    )}
                  </CardActions>
                </Box>
              </Card>
              {index < events.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
            />
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default EventsPage;
