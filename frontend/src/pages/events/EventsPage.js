import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  useTheme,
  Alert,
  Fade,
  Pagination as MuiPagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { format, isValid } from 'date-fns';
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

// Helper function to get event image
const getEventImage = (event) => {
  if (event.image) return event.image;
  if (event.featuredImage) return event.featuredImage;

  const title = event.title?.toLowerCase() || '';

  // Map specific event titles to images
  if (title.includes('reunion') && title.includes('2024')) {
    return '/images/reunion-2024.jpeg';
  } else if (title.includes('reunion') && title.includes('2025')) {
    return '/images/reunion-2025.jpg';
  } else if (title.includes('fundraising') || title.includes('gala')) {
    return '/images/funraising-gala.jpeg';
  }

  return '/images/event-placeholder.jpg';
};

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const itemsPerPage = 6;

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        setFadeIn(false);

        const params = {
          page,
          limit: itemsPerPage,
          upcoming: dateFilter === 'upcoming' ? 'true' : undefined,
          type: category !== 'all' ? category : undefined,
          search: searchTerm || undefined
        };

        const response = await api.get('/events', { params });

        const eventsData = response.data.data || [];
        // Map images to events
        const eventsWithImages = eventsData.map(event => ({
          ...event,
          image: getEventImage(event)
        }));

        setEvents(eventsWithImages);
        setTotalPages(response.data.totalPages || 1);

        // Trigger fade in after data is loaded
        setTimeout(() => setFadeIn(true), 50);
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
  }, [location.search, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Update URL with new page number
    const params = new URLSearchParams(location.search);
    params.set('page', value);
    navigate(`/events?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventClick = (eventId, eventImage) => {
    navigate(`/events/${eventId}`, { state: { eventImage } });
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
      {/* Header - Centered */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'text.primary', fontWeight: 700 }}>
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
          <Grid item xs={12} sm={6} md={4}>
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
          <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Events List - Horizontal Card Layout */}
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
      ) : (
        <Fade in={fadeIn} timeout={300}>
          <Grid container spacing={4}>
            {events.map((event) => {
              const eventDate = event.startDate ? new Date(event.startDate) : null;
              const isValidEventDate = eventDate && isValid(eventDate);
              const eventEndDate = event.endDate ? new Date(event.endDate) : null;
              const isValidEndDate = eventEndDate && isValid(eventEndDate);

              // Get category label
              const categoryLabel = eventCategories.find(cat => cat.value === event.eventType)?.label ||
                (event.eventType ? event.eventType.toUpperCase() : 'EVENT');

              return (
                <Grid item key={event._id || event.id} xs={12} md={6}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      height: 240,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      bgcolor: 'white',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                    onClick={() => handleEventClick(event._id || event.id, event.image)}
                  >
                    {/* Date Badge on Left */}
                    <Box
                      sx={{
                        width: 100,
                        minWidth: 100,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                      }}
                    >
                      {isValidEventDate ? (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              letterSpacing: 1,
                              mb: 0.5,
                            }}
                          >
                            {format(eventDate, 'MMM').toUpperCase()}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1,
                              mb: 0.5,
                            }}
                          >
                            {format(eventDate, 'd')}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            {format(eventDate, 'yyyy')}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          TBA
                        </Typography>
                      )}
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      {/* Category Tag */}
                      <Chip
                        label={categoryLabel}
                        size="small"
                        sx={{
                          alignSelf: 'flex-start',
                          bgcolor: 'transparent',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 22,
                          mb: 1,
                          border: 'none',
                          px: 0,
                        }}
                      />

                      {/* Title - Fixed height */}
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 1,
                          lineHeight: 1.3,
                          height: '2.6rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'text.primary',
                        }}
                      >
                        {event.title}
                      </Typography>

                      {/* Description - Fixed height */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1.5,
                          lineHeight: 1.5,
                          height: '3rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.description || 'Join us for this exciting event.'}
                      </Typography>

                      {/* Time and Location - Fixed height */}
                      <Stack direction="row" spacing={2} mb={2} sx={{ color: 'text.secondary', height: '1.5rem' }}>
                        <Box display="flex" alignItems="center">
                          <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, color: 'text.disabled' }} />
                          <Typography variant="body2" fontSize="0.813rem" noWrap>
                            {isValidEventDate && isValidEndDate
                              ? `${format(eventDate, 'hh:mm a')} - ${format(eventEndDate, 'hh:mm a')}`
                              : isValidEventDate
                                ? format(eventDate, 'hh:mm a')
                                : 'TBA'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <PlaceIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, color: 'text.disabled' }} />
                          <Typography
                            variant="body2"
                            fontSize="0.813rem"
                            noWrap
                            sx={{ maxWidth: 180 }}
                          >
                            {event.location || 'TBA'}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Action Buttons - Fixed height */}
                      <Stack direction="row" spacing={2} mt="auto">
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            px: 2.5,
                            py: 0.75,
                            height: '36px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event._id || event.id, event.image);
                          }}
                        >
                          Learn More
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<CalendarIcon sx={{ fontSize: 18 }} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            px: 2,
                            py: 0.75,
                            height: '36px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to calendar functionality
                            if (isValidEventDate) {
                              const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(eventDate, "yyyyMMdd'T'HHmmss")}/${isValidEndDate ? format(eventEndDate, "yyyyMMdd'T'HHmmss") : format(eventDate, "yyyyMMdd'T'HHmmss")}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
                              window.open(calendarUrl, '_blank');
                            }
                          }}
                        >
                          Add to Calendar
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Fade>
      )}

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <Box mt={6} display="flex" justifyContent="center">
          <Stack spacing={2}>
            <MuiPagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  '&.Mui-selected': {
                    transform: 'scale(1.15)',
                  },
                },
              }}
            />
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default EventsPage;
