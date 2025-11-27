const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement,
    getAnnouncementStats,
    toggleLikeAnnouncement,
    addComment,
    deleteComment
} = require('../controllers/announcementController');
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

router.route('/')
    .get(getAnnouncements)
    .post(protect, admin, upload.single('image'), handleMulterError, createAnnouncement);

router.get('/stats', protect, admin, getAnnouncementStats);

router.route('/:id')
    .get(getAnnouncementById)
    .put(protect, admin, upload.single('image'), handleMulterError, updateAnnouncement)
    .delete(protect, admin, deleteAnnouncement);

router.patch('/:id/pin', protect, admin, togglePinAnnouncement);

// Interaction routes
router.put('/:id/like', protect, toggleLikeAnnouncement);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Announcements router is working!' });
});

module.exports = router;
