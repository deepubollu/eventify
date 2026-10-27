const Store = require('../store/dbStore');

// Helper to generate unique booking reference
const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'EVT-2026-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// Helper to generate unique ticket code
const generateTicketCode = (eventCode = 'TKT') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = `TKT-${eventCode.substring(0, 4).toUpperCase()}-`;
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Book ticket / register for event
// @route   POST /api/bookings
// @access  Private (Attendee, Organizer, Admin)
const createBooking = async (req, res, next) => {
  try {
    const { eventId, attendeeDetails, ticketsCount = 1 } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    const event = await Store.Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'This event is not open for registration',
      });
    }

    // Check capacity
    const numTickets = Number(ticketsCount) || 1;
    if (event.registeredCount + numTickets > event.capacity) {
      const remaining = Math.max(0, event.capacity - event.registeredCount);
      return res.status(400).json({
        success: false,
        message: `Sorry, this event only has ${remaining} ticket(s) remaining.`,
      });
    }

    // Prevent duplicate active registration
    const attendeeEmail = (attendeeDetails && attendeeDetails.email) || req.user.email;
    const existingBookings = await Store.Booking.find({
      event: eventId,
      bookingStatus: 'confirmed',
    });

    const isDuplicate = existingBookings.some(
      (b) =>
        (b.user && String(b.user._id || b.user) === String(req.user._id)) ||
        (b.attendeeDetails && b.attendeeDetails.email.toLowerCase() === attendeeEmail.toLowerCase())
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: 'You (or this attendee email) are already registered for this event.',
      });
    }

    const ticketPrice = Number(event.ticketPrice) || 0;
    const totalAmount = ticketPrice * numTickets;
    const paymentStatus = ticketPrice === 0 ? 'free' : 'demo_paid';

    const bookingReference = generateBookingRef();

    const newBooking = await Store.Booking.create({
      bookingReference,
      event: event._id,
      user: req.user._id,
      attendeeDetails: {
        name: (attendeeDetails && attendeeDetails.name) || req.user.name,
        email: attendeeEmail,
        phone: (attendeeDetails && attendeeDetails.phone) || req.user.phone || '',
        notes: (attendeeDetails && attendeeDetails.notes) || '',
      },
      ticketsCount: numTickets,
      ticketPrice,
      totalAmount,
      paymentStatus,
      bookingStatus: 'confirmed',
    });

    // Create individual tickets with QR codes
    const createdTickets = [];
    for (let i = 0; i < numTickets; i++) {
      const ticketCode = generateTicketCode(event.title.replace(/[^A-Za-z0-9]/g, ''));
      const qrPayload = JSON.stringify({
        tkt: ticketCode,
        evt: String(event._id),
        bk: bookingReference,
        att: (attendeeDetails && attendeeDetails.name) || req.user.name,
        ts: Date.now(),
      });

      const ticket = await Store.Ticket.create({
        ticketCode,
        booking: newBooking._id,
        event: event._id,
        attendee: {
          name: (attendeeDetails && attendeeDetails.name) || req.user.name,
          email: attendeeEmail,
        },
        qrData: qrPayload,
        status: 'valid',
      });

      createdTickets.push(ticket);
    }

    // Atomically increment event registeredCount
    await Store.Event.findByIdAndUpdate(event._id, {
      registeredCount: event.registeredCount + numTickets,
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking,
      tickets: createdTickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings of logged in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Store.Booking.find({ user: req.user._id });

    // Attach tickets to each booking
    const bookingsWithTickets = await Promise.all(
      bookings.map(async (bk) => {
        const tickets = await Store.Ticket.find({ booking: bk._id });
        return {
          ...bk,
          tickets,
        };
      })
    );

    res.json({
      success: true,
      count: bookingsWithTickets.length,
      bookings: bookingsWithTickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Store.Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization check
    const isOwner = String(booking.user._id || booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isOrganizer =
      booking.event &&
      (String(booking.event.organizer) === String(req.user._id) ||
        (booking.event.organizer && String(booking.event.organizer._id) === String(req.user._id)));

    if (!isOwner && !isAdmin && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    const tickets = await Store.Ticket.find({ booking: booking._id });

    res.json({
      success: true,
      booking: {
        ...booking,
        tickets,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Store.Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only booking owner or admin can cancel
    const isOwner = String(booking.user._id || booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
    }

    // Cancel booking
    const updatedBooking = await Store.Booking.findByIdAndUpdate(booking._id, {
      bookingStatus: 'cancelled',
    });

    // Invalidate associated tickets
    const tickets = await Store.Ticket.find({ booking: booking._id });
    for (const ticket of tickets) {
      await Store.Ticket.findByIdAndUpdate(ticket._id, { status: 'cancelled' });
    }

    // Decrement event registered count
    const eventId = booking.event._id || booking.event;
    const event = await Store.Event.findById(eventId);
    if (event) {
      const newCount = Math.max(0, event.registeredCount - booking.ticketsCount);
      await Store.Event.findByIdAndUpdate(eventId, { registeredCount: newCount });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Capacity has been restored.',
      booking: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};

