const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const {
  getAlumni,
  getAlumnus,
  updateAlumnus,
  deleteAlumnus,
  getAlumniStats
} = require('../controllers/alumniController');

// @route   GET /api/alumni
// @desc    Get all alumni
// @access  Private/Admin
router.get('/', [protect, admin], getAlumni);

// @route   GET /api/alumni/stats
// @desc    Get alumni statistics
// @access  Private/Admin
router.get('/stats', [protect, admin], getAlumniStats);

// @route   GET /api/alumni/:id
// @desc    Get single alumnus
// @access  Private/Admin
router.get('/:id', [protect, admin], getAlumnus);

// @route   PUT /api/alumni/:id
// @desc    Update alumnus profile
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin,
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('graduationYear', 'Graduation year is required').isNumeric()
    ]
  ],
  updateAlumnus
);

// @route   DELETE /api/alumni/:id
// @desc    Delete alumnus
// @access  Private/Admin
router.delete('/:id', [protect, admin], deleteAlumnus);

module.exports = router;
