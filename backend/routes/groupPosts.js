const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const ctrl = require('../controllers/groupPostController');

// List posts for a class group (auth required to view member posts)
router.get('/class-groups/:id/posts', protect, ctrl.getGroupPosts);

// Create post: members can create member_update; admin can create announcement
router.post('/class-groups/:id/posts', protect, ctrl.createGroupPost);

// Reactions
router.post('/posts/:postId/react', protect, ctrl.reactToPost);

// Comments
router.post('/posts/:postId/comment', protect, ctrl.commentOnPost);

module.exports = router;
