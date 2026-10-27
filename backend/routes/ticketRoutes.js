const express = require('express');
const router = express.Router();
const {
  getTicketDetails,
  verifyAndCheckIn,
  getEventCheckIns,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

// Public or attendee ticket viewer
router.get('/:idOrCode', getTicketDetails);

// Verification & check-in by organizers or admin
router.post('/verify-checkin', protect, authorize('organizer', 'admin'), verifyAndCheckIn);
router.get('/checkins/:eventId', protect, authorize('organizer', 'admin'), getEventCheckIns);

module.exports = router;

