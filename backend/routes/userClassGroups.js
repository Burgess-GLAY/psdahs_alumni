const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyClassGroups,
  joinClassGroup,
  leaveClassGroup,
  getAvailableClassGroups
} = require('../controllers/userClassGroupController');

// All routes are protected and require authentication
router.use(protect);

// Get current user's class groups
router.get('/me/class-groups', getMyClassGroups);

// Get available class groups to join
router.get('/class-groups/available', getAvailableClassGroups);

// Join a class group
router.post('/me/class-groups/:groupId/join', joinClassGroup);

// Leave a class group
router.post('/me/class-groups/:groupId/leave', leaveClassGroup);

module.exports = router;
