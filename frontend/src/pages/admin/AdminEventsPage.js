import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import api from '../../services/api';
import EventFormDialog from '../../components/admin/EventFormDialog';
import { showSuccess, showError } from '../../utils/notifications';

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/events', {
        params: {
          page: page + 1, // API uses 1-indexed pages
          limit: rowsPerPage,
          includeUnpublished: 'true' // Admin sees all events
        }
      });

      if (response.data.success) {
        setEvents(response.data.data);
        setTotalEvents(response.data.total);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.response?.data?.message || 'Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle opening dialog for creating new event
  const handleCreateEvent = () => {
    setSelectedEvent(null); // null for create mode
    setDialogOpen(true);
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  // Handle opening dialog for editing existing event
  const handleEditEvent = (event) => {
    setSelectedEvent(event); // Set event for edit mode
    setDialogOpen(true);
  };

  // Handle saving event (create or update)
  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        // Update existing event
        await api.put(`/events/${selectedEvent._id}`, eventData);
        showSuccess('Event updated successfully!');
      } else {
        // Create new event
        await api.post('/events', eventData);
        showSuccess('Event created successfully!');
      }

      // Close dialog and refresh events list
      setDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error('Failed to save event:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save event. Please try again.';
      showError(errorMessage);
      throw err; // Re-throw to let the dialog handle it
    }
  };

  // Handle opening delete confirmation dialog
  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  // Handle deleting event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await api.delete(`/events/${eventToDelete._id}`);
      showSuccess('Event deleted successfully!');

      // Close dialog and refresh events list
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete event. Please try again.';
      showError(errorMessage);
      // Keep dialog open on error so user can retry
    }
  };

  // Handle toggling featured status
  const handleToggleFeatured = async (event) => {
    try {
      const response = await api.put(`/events/${event._id}/featured`);

      if (response.data.success) {
        const newStatus = response.data.data.isFeaturedOnHomepage;
        showSuccess(
          newStatus
            ? 'Event featured on homepage!'
            : 'Event removed from homepage featured section'
        );
        fetchEvents(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update featured status. Please try again.';
      showError(errorMessage);
    }
  };

  // Handle changing event status
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const response = await api.put(`/events/${eventId}/status`, { status: newStatus });

      if (response.data.success) {
        showSuccess(`Event status updated to ${newStatus}!`);
        fetchEvents(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update event status. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3,
        textAlign: 'center'
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, width: '100%' }}
        >
          Manage Events
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
          sx={{
            minHeight: 44,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Add Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ maxWidth: 1400, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress />
            </Box>
          ) : events.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Add Event" to create your first event
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  overflowX: 'auto',
                  maxWidth: '100%'
                }}
              >
                <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event Title</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Featured</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => {
                      const startDate = new Date(event.startDate);

                      // Get status from event or default to 'upcoming'
                      const currentStatus = event.eventStatus || 'upcoming';

                      // Status colors
                      const statusColors = {
                        upcoming: '#2e7d32',
                        ongoing: '#ed6c02',
                        completed: '#1976d2',
                        cancelled: '#d32f2f'
                      };

                      // If not published, show as Draft
                      const displayStatus = !event.isPublished ? 'draft' : currentStatus;
                      const statusColor = !event.isPublished ? '#757575' : statusColors[currentStatus];

                      return (
                        <TableRow key={event._id}>
                          <TableCell>{event.title}</TableCell>
                          <TableCell>
                            {startDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>{event.location || 'N/A'}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {event.eventType || 'Other'}
                          </TableCell>
                          <TableCell>
                            {!event.isPublished ? (
                              <span style={{
                                color: statusColor,
                                fontWeight: 'bold',
                                textTransform: 'capitalize'
                              }}>
                                Draft
                              </span>
                            ) : (
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={currentStatus}
                                  onChange={(e) => handleStatusChange(event._id, e.target.value)}
                                  sx={{
                                    color: statusColor,
                                    fontWeight: 'bold',
                                    '& .MuiSelect-select': {
                                      py: 0.5
                                    }
                                  }}
                                >
                                  <MenuItem value="upcoming">Upcoming</MenuItem>
                                  <MenuItem value="ongoing">Ongoing</MenuItem>
                                  <MenuItem value="completed">Completed</MenuItem>
                                  <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color={event.isFeaturedOnHomepage ? 'warning' : 'default'}
                              onClick={() => handleToggleFeatured(event)}
                              aria-label={event.isFeaturedOnHomepage ? 'Remove from homepage' : 'Feature on homepage'}
                              title={event.isFeaturedOnHomepage ? 'Remove from homepage' : 'Feature on homepage'}
                            >
                              {event.isFeaturedOnHomepage ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditEvent(event)}
                              aria-label={`Edit ${event.title}`}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(event)}
                              aria-label={`Delete ${event.title}`}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalEvents}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Event Form Dialog */}
      <EventFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        event={selectedEvent}
        onSave={handleSaveEvent}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the event "{eventToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEventsPage;
