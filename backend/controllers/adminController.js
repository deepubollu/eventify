const Store = require('../store/dbStore');

// @desc    Get platform-wide admin stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getPlatformStats = async (req, res, next) => {
  try {
    const users = await Store.User.find();
    const events = await Store.Event.find();
    const bookings = await Store.Booking.find();
    const checkIns = await Store.CheckIn.find();

    const totalUsers = users.length;
    const totalEvents = events.length;
    const totalBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
    const totalCheckIns = checkIns.length;
    const totalRevenue = bookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const rolesBreakdown = {
      attendees: users.filter((u) => u.role === 'attendee').length,
      organizers: users.filter((u) => u.role === 'organizer').length,
      admins: users.filter((u) => u.role === 'admin').length,
    };

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalCheckIns,
        totalRevenue,
        rolesBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    const users = await Store.User.find(query);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status / role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    // Prevent admin from banning or demoting themselves
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own administrator role or status.',
      });
    }

    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    const updatedUser = await Store.User.findByIdAndUpdate(id, updates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all events for admin oversight
// @route   GET /api/admin/events
// @access  Private (Admin only)
const getAllEventsAdmin = async (req, res, next) => {
  try {
    const events = await Store.Event.find();

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event status (approve, feature, or flag)
// @route   PUT /api/admin/events/:id/status
// @access  Private (Admin only)
const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (featured !== undefined) updates.featured = Boolean(featured);

    const updatedEvent = await Store.Event.findByIdAndUpdate(id, updates);

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  updateUser,
  getAllEventsAdmin,
  updateEventStatus,
};

