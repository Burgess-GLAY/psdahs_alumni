const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Verify Google OAuth token
// @route   POST /api/auth/verify-google-token
// @access  Public
exports.verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    res.json({
      success: true,
      data: {
        email,
        name,
        picture,
        googleId,
        exists: !!existingUser
      }
    });
  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying Google token',
      error: error.message
    });
  }
};

// @desc    Authenticate or register user with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const { isSignUp = false, additionalData = {} } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    // Handle new user registration
    if (!user && isSignUp) {
      // Create new user with Google OAuth
      user = new User({
        email,
        firstName: additionalData.firstName || name.split(' ')[0],
        lastName: additionalData.lastName || name.split(' ').slice(1).join(' ') || 'User',
        avatar: picture,
        googleId,
        isVerified: true,
        authMethod: 'google',
        graduationYear: additionalData.graduationYear || new Date().getFullYear(),
        phone: additionalData.phone || ''
      });
      
      await user.save();
    } 
    // Handle existing user login
    else if (user) {
      // If user exists but signed up with email/password
      if (user.authMethod !== 'google' && !isSignUp) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in with your password.',
          email: user.email
        });
      }
      
      // Update Google OAuth data if missing or changed
      if (!user.googleId || user.avatar !== picture) {
        user.googleId = googleId;
        user.avatar = picture;
        user.isVerified = true;
        await user.save();
      }
    }
    // No user found and not a signup attempt
    else {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please sign up first.',
        email: email
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin || false
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            graduationYear: user.graduationYear,
            phone: user.phone
          }
        });
      }
    );

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Error authenticating with Google',
      error: error.message
    });
  }
};
