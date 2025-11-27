const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { autoAssignClassGroup } = require('../services/classGroupService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  console.log('Register request received:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, graduationYear, phone } = req.body;
  console.log('Processing registration for:', { email, firstName, lastName });

  try {
    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Create new user
    console.log('Creating new user:', { email, firstName, lastName });
    const userData = {
      firstName,
      lastName,
      email,
      password,
      graduationYear,
      ...(phone && { phone }) // Only add phone if provided
    };

    user = new User(userData);
    console.log('User object created, attempting to save...');
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    console.log('Mongoose connection config:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      db: mongoose.connection.db
    });

    try {
      await user.save();
      console.log('User saved successfully with ID:', user._id);

      // Initialize assignment result
      let assignmentResult = null;

      // Validate and assign user to their class group based on graduation year
      if (user.graduationYear) {
        // Validate graduation year range (2007-2025)
        if (user.graduationYear >= 2007 && user.graduationYear <= 2025) {
          try {
            assignmentResult = await autoAssignClassGroup({
              userId: user._id,
              graduationYear: user.graduationYear,
              userInfo: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture
              }
            });

            if (assignmentResult.success) {
              console.log(`User successfully assigned to class group: ${assignmentResult.assignedGroup.name}`);
            } else {
              console.warn(`Class group assignment failed: ${assignmentResult.error}`);
              // Continue with registration even if assignment fails
            }
          } catch (groupError) {
            console.error('Error during class group auto-assignment:', groupError);
            // Don't fail registration if class group assignment fails
            assignmentResult = {
              success: false,
              error: groupError.message,
              assignedGroup: null
            };
          }
        } else {
          console.warn(`Graduation year ${user.graduationYear} is outside valid range (2007-2025)`);
          assignmentResult = {
            success: false,
            error: 'Graduation year must be between 2007 and 2025',
            assignedGroup: null
          };
        }
      }

      // Verify the user was saved by querying the database
      const savedUser = await User.findById(user._id).populate({
        path: 'classGroups.group',
        select: 'name graduationYear memberCount'
      });
      console.log('User fetched after save with class groups:', savedUser ? 'User found' : 'User not found');

      // Store assignment result for response
      user._assignmentResult = assignmentResult;
    } catch (saveError) {
      console.error('Error saving user:', {
        message: saveError.message,
        stack: saveError.stack,
        name: saveError.name,
        code: saveError.code,
        keyPattern: saveError.keyPattern,
        keyValue: saveError.keyValue
      });
      throw saveError; // Re-throw to be caught by the outer try-catch
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin || false
      }
    };

    console.log('Generating JWT token...');
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) {
          console.error('Error generating JWT:', err);
          throw err;
        }
        console.log('JWT token generated successfully');
        const userResponse = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isAdmin: user.isAdmin || false,
          graduationYear: user.graduationYear,
          profilePicture: user.profilePicture,
          ...(user.phone && { phone: user.phone })
        };

        // Prepare response with class group assignment info
        const response = {
          success: true,
          token,
          user: userResponse
        };

        // Add assigned class group information if assignment was successful
        const assignmentResult = user._assignmentResult;
        if (assignmentResult && assignmentResult.success && assignmentResult.assignedGroup) {
          response.assignedClassGroup = assignmentResult.assignedGroup;
          response.message = `Registration successful. You've been added to ${assignmentResult.assignedGroup.name}`;
        } else if (assignmentResult && !assignmentResult.success) {
          // Include warning if assignment failed but registration succeeded
          response.message = 'Registration successful';
          response.warning = assignmentResult.error || 'Could not assign to class group';
        } else {
          response.message = 'Registration successful';
        }

        console.log('Sending success response with class group info:', response.assignedClassGroup ? 'included' : 'not included');
        res.json(response);
      }
    );
  } catch (err) {
    console.error('Registration error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Update last login timestamp with detailed logging
    console.log('Updating lastLogin for user:', user.email);
    user.lastLogin = new Date();
    console.log('New lastLogin value:', user.lastLogin);

    try {
      await user.save({ validateBeforeSave: false });
      console.log('Successfully updated lastLogin in database');

      // Verify the update
      const updatedUser = await User.findById(user._id);
      console.log('Verified lastLogin in database:', updatedUser.lastLogin);
    } catch (saveError) {
      console.error('Error saving lastLogin:', saveError);
      throw saveError;
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        // FIX: Send user object along with the token including profilePicture
        user.password = undefined;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            profilePicture: user.profilePicture
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get current user's data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
