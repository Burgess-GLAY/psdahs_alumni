const AlumniClass = require('../models/AlumniClass');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all alumni classes
// @route   GET /api/classes
// @access  Public
exports.getAlumniClasses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const query = {};
    
    if (active === 'true') query.isActive = true;
    
    const classes = await AlumniClass.find(query)
      .sort({ graduationYear: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('representatives.user', 'firstName lastName email profilePicture');
    
    const count = await AlumniClass.countDocuments(query);
    
    // Get member counts for each class
    const classesWithStats = await Promise.all(
      classes.map(async (classItem) => {
        const stats = await classItem.getClassStats();
        return {
          ...classItem.toObject(),
          stats
        };
      })
    );
    
    res.json({
      success: true,
      count: classes.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: classesWithStats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single alumni class
// @route   GET /api/classes/:id
// @access  Public
exports.getAlumniClass = async (req, res, next) => {
  try {
    const alumniClass = await AlumniClass.findById(req.params.id)
      .populate('representatives.user', 'firstName lastName email profilePicture')
      .populate('createdBy', 'firstName lastName email');
    
    if (!alumniClass) {
      return next(new ErrorResponse('Class not found', 404));
    }
    
    // Get class statistics
    const stats = await alumniClass.getClassStats();
    
    // Get class members
    const members = await User.find({ graduationYear: alumniClass.graduationYear })
      .select('firstName lastName email profilePicture occupation company')
      .sort('lastName firstName');
    
    res.json({
      success: true,
      data: {
        ...alumniClass.toObject(),
        stats,
        members
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new alumni class
// @route   POST /api/classes
// @access  Private/Admin
exports.createAlumniClass = async (req, res, next) => {
  try {
    const { graduationYear } = req.body;
    
    // Check if class already exists
    const existingClass = await AlumniClass.findOne({ graduationYear });
    if (existingClass) {
      return next(new ErrorResponse(`Class of ${graduationYear} already exists`, 400));
    }
    
    const alumniClass = await AlumniClass.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: alumniClass
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update alumni class
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateAlumniClass = async (req, res, next) => {
  try {
    let alumniClass = await AlumniClass.findById(req.params.id);
    
    if (!alumniClass) {
      return next(new ErrorResponse('Class not found', 404));
    }
    
    // Prevent updating graduation year if class has members
    if (req.body.graduationYear && req.body.graduationYear !== alumniClass.graduationYear) {
      const memberCount = await User.countDocuments({ graduationYear: alumniClass.graduationYear });
      if (memberCount > 0) {
        return next(new ErrorResponse('Cannot update graduation year for a class with members', 400));
      }
    }
    
    alumniClass = await AlumniClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: alumniClass
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete alumni class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteAlumniClass = async (req, res, next) => {
  try {
    const alumniClass = await AlumniClass.findById(req.params.id);
    
    if (!alumniClass) {
      return next(new ErrorResponse('Class not found', 404));
    }
    
    // Check if class has members
    const memberCount = await User.countDocuments({ graduationYear: alumniClass.graduationYear });
    if (memberCount > 0) {
      return next(new ErrorResponse('Cannot delete a class with members', 400));
    }
    
    await alumniClass.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add class representative
// @route   POST /api/classes/:id/representatives
// @access  Private/Admin
exports.addClassRepresentative = async (req, res, next) => {
  try {
    const { userId, role, startYear, endYear } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    const alumniClass = await AlumniClass.findById(req.params.id);
    if (!alumniClass) {
      return next(new ErrorResponse('Class not found', 404));
    }
    
    // Check if user is already a representative
    const existingRep = alumniClass.representatives.find(
      rep => rep.user.toString() === userId
    );
    
    if (existingRep) {
      return next(new ErrorResponse('User is already a representative for this class', 400));
    }
    
    // Add representative
    alumniClass.representatives.push({
      user: userId,
      role,
      startYear: startYear || new Date().getFullYear(),
      endYear: endYear || null
    });
    
    await alumniClass.save();
    
    res.status(201).json({
      success: true,
      data: alumniClass
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove class representative
// @route   DELETE /api/classes/:classId/representatives/:repId
// @access  Private/Admin
exports.removeClassRepresentative = async (req, res, next) => {
  try {
    const alumniClass = await AlumniClass.findById(req.params.classId);
    
    if (!alumniClass) {
      return next(new ErrorResponse('Class not found', 404));
    }
    
    // Find and remove representative
    const repIndex = alumniClass.representatives.findIndex(
      rep => rep._id.toString() === req.params.repId
    );
    
    if (repIndex === -1) {
      return next(new ErrorResponse('Representative not found', 404));
    }
    
    alumniClass.representatives.splice(repIndex, 1);
    await alumniClass.save();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get class statistics
// @route   GET /api/classes/:id/stats
// @access  Public
exports.getClassStatistics = async (req, res, next) => {
  try {
    const alumniClass = await AlumniClass.findById(req.params.id);
    
    if (!alumniClass) {
      return next(new ErrorResponse('Class not found', 404));
    }
    
    const stats = await alumniClass.getClassStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};
