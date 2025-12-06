const Event = require('../models/Event');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, search, upcoming, group, includeUnpublished } = req.query;
    const query = {};

    // Only show published events unless admin requests unpublished
    if (includeUnpublished !== 'true' || !req.user?.isAdmin) {
      query.isPublished = true;
    }

    if (type) {
      query.eventType = type;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    if (group) {
      query.group = group;
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('organizers', 'firstName lastName email profilePicture')
      .populate('group', 'name graduationYear')
      .lean();

    const count = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    // force upcoming filter
    req.query = { ...req.query, upcoming: 'true' };
    return exports.getEvents(req, res, next);
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured events for homepage
// @route   GET /api/events/featured
// @access  Public
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const events = await Event.find({
      isPublished: true,
      isFeaturedOnHomepage: true,
      startDate: { $gte: new Date() } // Only upcoming featured events
    })
      .sort({ featuredOrder: 1, startDate: 1 })
      .limit(limit)
      .select('-attendees');

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle event featured status
// @route   PUT /api/events/:id/featured
// @access  Private/Admin
exports.toggleFeaturedStatus = async (req, res, next) => {
  try {
    console.log('Toggle featured - Event ID:', req.params.id);
    console.log('Toggle featured - User:', req.user?.email, 'Admin:', req.user?.isAdmin);

    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log('Toggle featured - Event not found');
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('Toggle featured - Current status:', event.isFeaturedOnHomepage);

    // Toggle featured status
    event.isFeaturedOnHomepage = !event.isFeaturedOnHomepage;

    // If being featured, set order to current timestamp (will be last)
    if (event.isFeaturedOnHomepage && !event.featuredOrder) {
      event.featuredOrder = Date.now();
    }

    event.updatedBy = req.user.id;
    await event.save();

    console.log('Toggle featured - New status:', event.isFeaturedOnHomepage);

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Toggle featured error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured status',
      error: err.message
    });
  }
};

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private/Admin
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    console.log('Update status - Event ID:', req.params.id);
    console.log('Update status - New status:', status);
    console.log('Update status - User:', req.user?.email, 'Admin:', req.user?.isAdmin);

    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      console.log('Update status - Invalid status value');
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log('Update status - Event not found');
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('Update status - Current status:', event.eventStatus);

    event.eventStatus = status;
    event.updatedBy = req.user.id;
    await event.save();

    console.log('Update status - Updated successfully');

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update event status',
      error: err.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizers', 'firstName lastName email profilePicture')
      .populate('attendees.user', 'firstName lastName email profilePicture');

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Increment views if not the creator
    if (req.user?.id && !event.organizers.some(org => org._id.toString() === req.user.id)) {
      event.views += 1;
      await event.save();
    }

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res, next) => {
  try {
    // Parse JSON strings if they come from FormData
    ['speakers', 'agenda', 'faq', 'locationDetails'].forEach(field => {
      if (typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          console.error(`Failed to parse ${field}:`, e);
        }
      }
    });

    const eventData = {
      ...req.body,
      createdBy: req.user.id,
      organizers: [req.user.id],
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : false
    };

    // Handle file upload
    if (req.file) {
      eventData.featuredImage = `/uploads/${req.file.filename}`;
    }

    // Handle speakers array with order
    if (req.body.speakers && Array.isArray(req.body.speakers)) {
      eventData.speakers = req.body.speakers.map((speaker, index) => ({
        ...speaker,
        order: speaker.order !== undefined ? speaker.order : index
      }));
    }

    // Handle agenda array with order
    if (req.body.agenda && Array.isArray(req.body.agenda)) {
      eventData.agenda = req.body.agenda.map((item, index) => ({
        ...item,
        order: item.order !== undefined ? item.order : index
      }));
    }

    // Handle faq array with order
    if (req.body.faq && Array.isArray(req.body.faq)) {
      eventData.faq = req.body.faq.map((item, index) => ({
        ...item,
        order: item.order !== undefined ? item.order : index
      }));
    }

    // Handle locationDetails object
    if (req.body.locationDetails) {
      eventData.locationDetails = req.body.locationDetails;
    }

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Check if user is authorized to update this event
    if (!event.organizers.includes(req.user.id) && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to update this event', 403));
    }

    // Parse JSON strings if they come from FormData
    ['speakers', 'agenda', 'faq', 'locationDetails'].forEach(field => {
      if (typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          console.error(`Failed to parse ${field}:`, e);
        }
      }
    });

    // Prevent updating certain fields
    const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

    // Handle file upload
    if (req.file) {
      updateData.featuredImage = `/uploads/${req.file.filename}`;
    }

    // Handle speakers array with order
    if (req.body.speakers && Array.isArray(req.body.speakers)) {
      updateData.speakers = req.body.speakers.map((speaker, index) => ({
        ...speaker,
        order: speaker.order !== undefined ? speaker.order : index
      }));
    }

    // Handle agenda array with order
    if (req.body.agenda && Array.isArray(req.body.agenda)) {
      updateData.agenda = req.body.agenda.map((item, index) => ({
        ...item,
        order: item.order !== undefined ? item.order : index
      }));
    }

    // Handle faq array with order
    if (req.body.faq && Array.isArray(req.body.faq)) {
      updateData.faq = req.body.faq.map((item, index) => ({
        ...item,
        order: item.order !== undefined ? item.order : index
      }));
    }

    // Handle locationDetails object
    if (req.body.locationDetails) {
      updateData.locationDetails = req.body.locationDetails;
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Check if user is authorized to delete this event
    if (!event.organizers.includes(req.user.id) && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to delete this event', 403));
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Check if registration is open
    if (!event.isRegistrationOpen()) {
      return next(new ErrorResponse('Registration for this event is closed', 400));
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return next(new ErrorResponse('Already registered for this event', 400));
    }

    // Add attendee
    event.attendees.push({
      user: req.user.id,
      status: 'registered'
    });

    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel event registration
// @route   DELETE /api/events/:id/register
// @access  Private
exports.cancelEventRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Find and remove attendee
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return next(new ErrorResponse('Not registered for this event', 400));
    }

    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's registered events
// @route   GET /api/events/user/registered
// @access  Private
exports.getUserRegisteredEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      'attendees.user': req.user.id,
      'attendees.status': { $ne: 'cancelled' }
    })
      .sort({ startDate: 1 })
      .populate('organizers', 'firstName lastName email profilePicture');

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};
