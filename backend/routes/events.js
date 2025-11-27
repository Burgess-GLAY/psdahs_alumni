const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/featured', eventController.getFeaturedEvents);

// Protected routes (require authentication)
// User event registration routes
router.get('/user/registered', protect, eventController.getUserRegisteredEvents);
router.post('/:id/register', protect, eventController.registerForEvent);
router.delete('/:id/register', protect, eventController.cancelEventRegistration);

// Admin-only routes - MUST come before /:id route to avoid conflicts
router.post(
  '/',
  protect,
  admin,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
    check('location', 'Location is required').not().isEmpty()
  ],
  eventController.createEvent
);

// Toggle featured status (admin only) - BEFORE /:id route
router.put('/:id/featured', protect, admin, eventController.toggleFeaturedStatus);

// Update event status (admin only) - BEFORE /:id route
router.put('/:id/status', protect, admin, eventController.updateEventStatus);

// Get event attendees (admin only) - BEFORE /:id route
router.get('/:id/attendees', protect, admin, (req, res) => {
  // This is a placeholder since getEventAttendees doesn't exist in the controller
  // You'll need to implement this method in the controller
  res.status(501).json({ success: false, message: 'Not implemented' });
});

// Event management routes
router.put(
  '/:id',
  protect,
  admin,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('startDate', 'Invalid start date').optional().isISO8601(),
    check('endDate', 'Invalid end date').optional().isISO8601(),
    check('location', 'Location is required').optional().not().isEmpty()
  ],
  eventController.updateEvent
);

router.delete('/:id', protect, admin, eventController.deleteEvent);

// Public route for getting single event - MUST be last
router.get('/:id', eventController.getEventById);

module.exports = router;
