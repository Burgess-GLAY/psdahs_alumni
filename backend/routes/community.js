const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    sharePost,
    togglePinPost,
    adminDeletePost
} = require('../controllers/communityController');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/')); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size is too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next(err);
};

// Public routes - GET posts
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);

// Protected routes - require authentication
router.post('/posts', protect, upload.single('image'), handleMulterError, createPost);
router.put('/posts/:id', protect, upload.single('image'), handleMulterError, updatePost);
router.delete('/posts/:id', protect, deletePost);

// Post interactions - require authentication
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comment', protect, addComment);
router.delete('/posts/:postId/comments/:commentId', protect, deleteComment);
router.post('/posts/:id/share', protect, sharePost);

// Admin routes - require admin privileges
router.put('/posts/:id/pin', protect, admin, togglePinPost);
router.delete('/posts/:id/admin', protect, admin, adminDeletePost);

module.exports = router;
