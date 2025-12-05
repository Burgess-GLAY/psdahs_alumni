const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const userController = require('../controllers/userController');

/**
 * @route   GET /api/users/count
 * @desc    Get total user count
 * @access  Public
 */
router.get('/count', userController.getUserCount);

/**
 * @route   GET /api/users/public-stats
 * @desc    Get public user statistics (count only)
 * @access  Public
 */
router.get('/public-stats', userController.getPublicStats);

/**
 * @route   GET /api/users/profile/:id
 * @desc    Get public user profile by ID
 * @access  Public
 */
router.get('/profile/:id', userController.getPublicProfile);

// Apply protect middleware to all routes below
router.use(protect);

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', userController.getMyProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/me', userController.updateProfile);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change current user's password
 * @access  Private
 */
router.put('/change-password', userController.changePassword);

/**
 * @route   PUT /api/users/me/avatar
 * @desc    Upload profile picture
 * @access  Private
 */
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

router.put('/me/avatar', upload.single('avatar'), userController.uploadAvatar);

// Admin-only routes
router.use(admin);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', userController.getUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/stats', userController.getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
