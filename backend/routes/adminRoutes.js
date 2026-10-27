const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUser,
  getAllEventsAdmin,
  updateEventStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/events', getAllEventsAdmin);
router.put('/events/:id/status', updateEventStatus);

module.exports = router;

