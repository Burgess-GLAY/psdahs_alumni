const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('graduationYear', 'Graduation year is required').isNumeric()
  ],
  authController.register
);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

/**
 * @route   GET api/auth/me
 * @desc    Get current user's data
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   POST api/auth/verify-google-token
 * @desc    Verify Google OAuth token and return user info
 * @access  Public
 */
router.post('/verify-google-token', googleAuthController.verifyGoogleToken);

/**
 * @route   POST api/auth/google
 * @desc    Authenticate or register user with Google
 * @access  Public
 */
router.post('/google', [
  check('token', 'Google token is required').not().isEmpty()
], googleAuthController.googleAuth);

module.exports = router;
