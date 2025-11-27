const AlumniClass = require('../models/AlumniClass');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all alumni
// @route   GET /api/alumni
// @access  Private/Admin
exports.getAlumni = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', graduationYear } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (graduationYear) {
      query.graduationYear = graduationYear;
    }

    const alumni = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      alumni,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single alumni
// @route   GET /api/alumni/:id
// @access  Private/Admin
exports.getAlumnus = async (req, res) => {
  try {
    const alumnus = await User.findById(req.params.id).select('-password');
    if (!alumnus) {
      return res.status(404).json({ msg: 'Alumnus not found' });
    }
    res.json(alumnus);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Alumnus not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update alumni profile
// @route   PUT /api/alumni/:id
// @access  Private/Admin
exports.updateAlumnus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    graduationYear,
    occupation,
    bio,
    skills,
    address,
    socialLinks,
    isAdmin
  } = req.body;

  try {
    let alumnus = await User.findById(req.params.id);

    if (!alumnus) {
      return res.status(404).json({ msg: 'Alumnus not found' });
    }

    // Check if email already exists
    if (email && email !== alumnus.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
      }
    }

    // Update fields
    const alumnusFields = {};
    if (firstName) alumnusFields.firstName = firstName;
    if (lastName) alumnusFields.lastName = lastName;
    if (email) alumnusFields.email = email;
    if (phone) alumnusFields.phone = phone;
    if (graduationYear) alumnusFields.graduationYear = graduationYear;
    if (occupation) alumnusFields.occupation = occupation;
    if (bio) alumnusFields.bio = bio;
    if (skills) alumnusFields.skills = skills.split(',').map(skill => skill.trim());
    if (address) alumnusFields.address = address;
    if (socialLinks) alumnusFields.socialLinks = socialLinks;
    if (isAdmin !== undefined) alumnusFields.isAdmin = isAdmin;

    alumnus = await User.findByIdAndUpdate(
      req.params.id,
      { $set: alumnusFields },
      { new: true }
    ).select('-password');

    res.json(alumnus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete alumni
// @route   DELETE /api/alumni/:id
// @access  Private/Admin
exports.deleteAlumnus = async (req, res) => {
  try {
    const alumnus = await User.findById(req.params.id);

    if (!alumnus) {
      return res.status(404).json({ msg: 'Alumnus not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Alumnus removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Alumnus not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get alumni statistics
// @route   GET /api/alumni/stats
// @access  Private/Admin
exports.getAlumniStats = async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments({});
    const alumniByYear = await User.aggregate([
      {
        $group: {
          _id: '$graduationYear',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentAlumni = await User.find()
      .select('firstName lastName email graduationYear')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalAlumni,
      alumniByYear,
      recentAlumni
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
