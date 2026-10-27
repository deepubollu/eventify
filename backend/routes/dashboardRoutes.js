const express = require('express');
const router = express.Router();
const { getOrganizerDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/organizer', protect, authorize('organizer', 'admin'), getOrganizerDashboard);

module.exports = router;

