const Store = require('../store/dbStore');

// @desc    Get all events with search & filters
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { search, category, locationType, priceType, sort, organizer, status } = req.query;

    const filter = {};

    // By default, only show published events unless specified or organizer query
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'published';
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (organizer) {
      filter.organizer = organizer;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'date_asc') sortOption = { date: 1 };
    if (sort === 'date_desc') sortOption = { date: -1 };
    if (sort === 'price_low') sortOption = { ticketPrice: 1 };
    if (sort === 'price_high') sortOption = { ticketPrice: -1 };

    let events = await Store.Event.find(filter, sortOption);

    // Apply secondary in-memory filters if needed
    if (locationType && locationType !== 'all') {
      events = events.filter((e) => e.locationType === locationType);
    }

    if (priceType === 'free') {
      events = events.filter((e) => Number(e.ticketPrice) === 0);
    } else if (priceType === 'paid') {
      events = events.filter((e) => Number(e.ticketPrice) > 0);
    }

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Store.Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      locationType,
      ticketPrice,
      capacity,
      image,
      tags,
    } = req.body;

    if (!title || !description || !date || !time || !venue || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details (title, description, date, time, venue, capacity)',
      });
    }

    const eventData = {
      title,
      description,
      category: category || 'Technology',
      date,
      time,
      venue,
      locationType: locationType || 'in-person',
      ticketPrice: Number(ticketPrice) || 0,
      capacity: Number(capacity),
      image:
        image ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      organizer: req.user._id,
      organizerName: req.user.name,
      status: 'published',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
    };

    const newEvent = await Store.Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer of this event, Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Store.Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization check
    const isOwner = String(event.organizer) === String(req.user._id) || (event.organizer && String(event.organizer._id) === String(req.user._id));
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event',
      });
    }

    // Capacity validation: capacity cannot be lower than registeredCount
    if (req.body.capacity && Number(req.body.capacity) < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be set lower than already registered attendees (${event.registeredCount})`,
      });
    }

    const updatedEvent = await Store.Event.findByIdAndUpdate(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer of this event, Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Store.Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization check
    const isOwner = String(event.organizer) === String(req.user._id) || (event.organizer && String(event.organizer._id) === String(req.user._id));
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event',
      });
    }

    await Store.Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get event categories and count
// @route   GET /api/events/meta/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const allEvents = await Store.Event.find({ status: 'published' });
    const categoryCounts = {};

    allEvents.forEach((ev) => {
      categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + 1;
    });

    const categories = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      count: categoryCounts[cat],
    }));

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
};

