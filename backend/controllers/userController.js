const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

// @desc    Get public user statistics
// @route   GET /api/users/public-stats
// @access  Public
exports.getPublicStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const graduationYears = await User.distinct('graduationYear');

    res.json({
      success: true,
      data: {
        totalUsers,
        graduationYears: graduationYears.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public user profile by ID
// @route   GET /api/users/profile/:id
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -isAdmin -isVerified -lastLogin -createdAt -updatedAt -__v -googleId -authMethod');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Remove restricted fields
    const restrictedFields = ['password', 'isAdmin', 'isVerified', 'createdAt', 'updatedAt'];
    restrictedFields.forEach(field => delete updates[field]);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      data: { id: user._id, message: 'Password updated successfully' }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile picture
// @route   PUT /api/users/me/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, graduationYear } = req.query;
    const query = {};

    if (role) query.role = role;
    if (graduationYear) query.graduationYear = graduationYear;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .select('+lastLogin')  // Explicitly include lastLogin
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();  // Convert to plain JavaScript object for better performance

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Prevent updating password here
    if (updates.password) {
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user.id) {
      return next(new ErrorResponse('Cannot delete your own account', 400));
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user statistics (admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: ['$isAdmin', 1, 0] }
          },
          byGraduationYear: { $push: '$graduationYear' },
          totalDonations: { $sum: '$totalDonated' },
          avgDonation: { $avg: '$totalDonated' }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          activeUsers: 1,
          verifiedUsers: 1,
          adminUsers: 1,
          totalDonations: 1,
          avgDonation: { $round: ['$avgDonation', 2] },
          byGraduationYear: {
            $reduce: {
              input: '$byGraduationYear',
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: '$$value',
                        as: 'item',
                        cond: { $eq: ['$$item.year', '$$this'] }
                      }
                    }
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: '$$existing' }, 0] },
                      {
                        $map: {
                          input: '$$value',
                          as: 'item',
                          in: {
                            $cond: [
                              { $eq: ['$$item.year', '$$this'] },
                              {
                                year: '$$item.year',
                                count: { $add: ['$$item.count', 1] }
                              },
                              '$$item'
                            ]
                          }
                        }
                      },
                      {
                        $concatArrays: [
                          '$$value',
                          [{ year: '$$this', count: 1 }]
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0,
        totalDonations: 0,
        avgDonation: 0,
        byGraduationYear: []
      }
    });
  } catch (err) {
    next(err);
  }
};
