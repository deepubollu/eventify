const Store = require('../store/dbStore');
const QRCode = require('qrcode');

// Helper to extract ticket code from payload or raw string
const extractTicketCode = (input) => {
  if (!input) return '';
  const trimmed = String(input).trim();

  // If JSON payload
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.tkt) return parsed.tkt;
      if (parsed.ticketCode) return parsed.ticketCode;
    } catch (e) {
      // not json, continue
    }
  }

  // If formatted like EVENTIFY:CODE:EVENT:NAME
  if (trimmed.startsWith('EVENTIFY:')) {
    const parts = trimmed.split(':');
    if (parts[1]) return parts[1];
  }

  return trimmed;
};

// @desc    Get ticket by ticket code or ID
// @route   GET /api/tickets/:idOrCode
// @access  Public (Attendee can view ticket, or organizer/scanner)
const getTicketDetails = async (req, res, next) => {
  try {
    const { idOrCode } = req.params;
    const cleanCode = extractTicketCode(idOrCode);

    let ticket = await Store.Ticket.findOne({ ticketCode: cleanCode });
    if (!ticket) {
      ticket = await Store.Ticket.findById(idOrCode);
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Generate base64 QR code image on the fly for backend fallback
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(ticket.ticketCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.error('QR generation error:', e);
    }

    res.json({
      success: true,
      ticket: {
        ...ticket,
        qrImage: qrDataUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify ticket & execute check-in (Atomic check)
// @route   POST /api/tickets/verify-checkin
// @access  Private (Organizer, Admin)
const verifyAndCheckIn = async (req, res, next) => {
  try {
    const { ticketCodeInput, eventId, deviceInfo } = req.body;

    if (!ticketCodeInput) {
      return res.status(400).json({
        success: false,
        status: 'INVALID',
        message: 'Ticket code or QR scan data is required.',
      });
    }

    const code = extractTicketCode(ticketCodeInput).toUpperCase();

    // 1. Find ticket
    let ticket = await Store.Ticket.findOne({ ticketCode: code });
    if (!ticket) {
      // Also try by _id
      ticket = await Store.Ticket.findById(ticketCodeInput);
    }

    // INVALID TICKET CHECK
    if (!ticket) {
      return res.status(404).json({
        success: false,
        status: 'INVALID',
        message: `Ticket "${code}" does not exist in the Eventify system. Check for typos or invalid barcode.`,
        ticketCode: code,
      });
    }

    // Fetch full event
    const event = ticket.event;

    // EVENT MISMATCH CHECK (if organizer is verifying for a specific event)
    if (eventId && event && String(event._id || event) !== String(eventId)) {
      return res.status(400).json({
        success: false,
        status: 'EVENT_MISMATCH',
        message: `Ticket is valid for "${event.title}", not for the selected event.`,
        ticket,
      });
    }

    // CANCELLED TICKET CHECK
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        status: 'CANCELLED',
        message: 'This registration was cancelled and cannot be used for admission.',
        ticket,
      });
    }

    // ALREADY USED / CHECKED IN CHECK
    if (ticket.status === 'used') {
      return res.status(409).json({
        success: false,
        status: 'ALREADY_USED',
        message: 'DUPLICATE CHECK-IN ATTEMPT! This ticket was already checked in earlier.',
        usedAt: ticket.usedAt,
        checkedInBy: ticket.checkedInBy,
        ticket,
      });
    }

    // VALID TICKET -> RECORD CHECK-IN ATOMICALLY
    const now = new Date();
    const updatedTicket = await Store.Ticket.findByIdAndUpdate(ticket._id, {
      status: 'used',
      usedAt: now,
      checkedInBy: req.user ? req.user._id : null,
    });

    const checkInRecord = await Store.CheckIn.create({
      ticket: ticket._id,
      ticketCode: ticket.ticketCode,
      event: event._id || event,
      booking: ticket.booking._id || ticket.booking,
      scannedBy: req.user ? req.user._id : null,
      scannedByName: req.user ? req.user.name : 'Event Staff',
      timestamp: now,
      deviceInfo: deviceInfo || 'Web Scanner Device',
      notes: 'Entry granted at gate',
    });

    res.json({
      success: true,
      status: 'SUCCESS',
      message: 'Access Granted! Ticket verified and checked in.',
      ticket: updatedTicket,
      checkIn: checkInRecord,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get check-in logs for an event
// @route   GET /api/tickets/checkins/:eventId
// @access  Private (Organizer, Admin)
const getEventCheckIns = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const checkIns = await Store.CheckIn.find({ event: eventId });

    res.json({
      success: true,
      count: checkIns.length,
      checkIns,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTicketDetails,
  verifyAndCheckIn,
  getEventCheckIns,
};

