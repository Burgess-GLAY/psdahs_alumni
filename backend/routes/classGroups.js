const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
console.log('ClassGroups router loaded');
const classGroupController = require('../controllers/classGroupController');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', scope: 'class-groups' });
});

// Public routes
router.get('/', classGroupController.getClassGroups);
router.get('/:id', classGroupController.getClassGroupById);
router.get('/:id/members', classGroupController.getGroupMembers);
router.get('/:id/stats', classGroupController.getGroupStats);

// Protected routes (require authentication)
router.use(protect);

// Group membership
router.post('/:id/join', classGroupController.joinClassGroup);
router.post('/:id/leave', classGroupController.leaveClassGroup);

// Group management (group admins or site admins)
router.post('/', classGroupController.createClassGroup);
router.put('/:id', classGroupController.updateClassGroup);
router.delete('/:id', classGroupController.deleteClassGroup);

// Photo upload (requires multer middleware)
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });
router.post('/:id/upload-photo', upload.single('photo'), classGroupController.uploadClassPhoto);

// Posts routes
router.route('/:id/posts')
  .get(classGroupController.getPosts)
  .post(classGroupController.createPost);

// Comments routes
router.post('/:groupId/posts/:postId/comments', classGroupController.addComment);

// Reactions route
router.post('/:groupId/react/:targetType/:targetId', classGroupController.addReaction);

// Events routes
router.get('/:id/events', classGroupController.getEvents);

// Albums routes
router.get('/:id/albums', classGroupController.getAlbums);

module.exports = router;
