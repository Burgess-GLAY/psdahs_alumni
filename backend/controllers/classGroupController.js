const ClassGroup = require('../models/ClassGroup');
const { ErrorResponse } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get all class groups
// @route   GET /api/class-groups
// @access  Public
const getClassGroups = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      year,
      search,
      sort = '-graduationYear',
      filter = 'all' // 'all' or 'my-groups'
    } = req.query;

    const query = { isPublic: true };

    // Filter by graduation year
    if (year) query.graduationYear = year;

    // Search by class name or year
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { graduationYear: isNaN(search) ? undefined : parseInt(search) }
      ].filter(condition => condition.graduationYear !== undefined || condition.name || condition.description);
    }

    // Fetch groups
    const groups = await ClassGroup.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('admins', 'firstName lastName profilePicture')
      .lean();

    // Add membership status for authenticated users
    let enrichedGroups = groups;
    if (req.user) {
      enrichedGroups = groups.map(group => {
        const isMember = group.members.some(member =>
          member.user.toString() === req.user.id && member.isActive
        );
        const isAdmin = group.admins.some(admin =>
          admin._id.toString() === req.user.id
        );

        return {
          ...group,
          isMember,
          isAdmin
        };
      });

      // Filter by membership if requested
      if (filter === 'my-groups') {
        enrichedGroups = enrichedGroups.filter(group => group.isMember);
      }
    }

    const count = await ClassGroup.countDocuments(query);

    res.json({
      success: true,
      count: enrichedGroups.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: enrichedGroups
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single class group with detailed information
// @route   GET /api/class-groups/:id
// @access  Public
const getClassGroupById = async (req, res, next) => {
  try {
    const group = await ClassGroup.findById(req.params.id)
      .populate('admins', 'firstName lastName profilePicture email')
      .populate('members.user', 'firstName lastName profilePicture email graduationYear')
      .populate('posts.author', 'firstName lastName profilePicture')
      .populate('posts.comments.user', 'firstName lastName profilePicture')
      .populate('events.createdBy', 'firstName lastName profilePicture')
      .populate('events.attendees.user', 'firstName lastName profilePicture')
      .populate('albums.createdBy', 'firstName lastName profilePicture')
      .populate('albums.photos.uploadedBy', 'firstName lastName profilePicture')
      .lean();

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if the group is private and user is not a member
    if (!group.isPublic && !req.user) {
      return next(new ErrorResponse('Not authorized to access this group', 403));
    }

    // If private group, check if user is a member
    if (!group.isPublic && req.user) {
      const isMember = group.members.some(member =>
        member.user._id.toString() === req.user.id && member.isActive
      );

      if (!isMember) {
        return next(new ErrorResponse('Not authorized to access this group', 403));
      }
    }

    // Filter active members only
    const activeMembers = group.members.filter(member => member.isActive);

    // Get recent posts (limit to 10 most recent)
    const recentPosts = group.posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Get upcoming events
    const now = new Date();
    const upcomingEvents = group.events
      .filter(event => new Date(event.startDate) >= now && !event.isCancelled)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);

    // Get recent albums (limit to 6 most recent)
    const recentAlbums = group.albums
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    // Add user's membership and admin status if authenticated
    let isMember = false;
    let isAdmin = false;
    let isModerator = false;

    if (req.user) {
      isMember = activeMembers.some(member =>
        member.user._id.toString() === req.user.id
      );
      isAdmin = group.admins.some(admin =>
        admin._id.toString() === req.user.id
      );
      const memberInfo = activeMembers.find(member =>
        member.user._id.toString() === req.user.id
      );
      isModerator = memberInfo && memberInfo.role === 'moderator';
    }

    // Build response with all required information
    const response = {
      _id: group._id,
      name: group.name,
      description: group.description,
      graduationYear: group.graduationYear,
      motto: group.motto,
      coverImage: group.coverImage,
      bannerImage: group.bannerImage,
      isPublic: group.isPublic,
      memberCount: group.memberCount,
      postCount: group.postCount,
      eventCount: group.eventCount,
      photoCount: group.photoCount,
      settings: group.settings,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,

      // User's status
      isMember,
      isAdmin,
      isModerator,

      // Members list
      members: activeMembers,
      admins: group.admins,

      // Recent activity
      recentActivity: {
        posts: recentPosts,
        events: upcomingEvents,
        albums: recentAlbums
      }
    };

    res.json({
      success: true,
      data: response
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new class group
// @route   POST /api/class-groups
// @access  Private
const createClassGroup = async (req, res, next) => {
  try {
    const { name, description, graduationYear, coverImage, isPublic, tags } = req.body;

    // Check if a group for this year already exists
    const existingGroup = await ClassGroup.findOne({
      graduationYear,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingGroup) {
      return next(new ErrorResponse('A group with this name already exists for this graduation year', 400));
    }

    const group = await ClassGroup.create({
      name,
      description,
      graduationYear,
      coverImage,
      isPublic: isPublic !== undefined ? isPublic : true,
      tags,
      admins: [req.user.id],
      members: [{
        user: req.user.id,
        joinedAt: Date.now(),
        isActive: true
      }],
      memberCount: 1
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a class group
// @route   PUT /api/class-groups/:id
// @access  Private/Admin or Group Admin
const updateClassGroup = async (req, res, next) => {
  try {
    let group = await ClassGroup.findById(req.params.id);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is an admin of the group
    const isAdmin = group.admins.some(adminId =>
      adminId.toString() === req.user.id
    );

    if (!isAdmin && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to update this group', 403));
    }

    // Update fields
    const { name, description, coverImage, isPublic, tags, rules, settings } = req.body;

    if (name) group.name = name;
    if (description) group.description = description;
    if (coverImage !== undefined) group.coverImage = coverImage;
    if (isPublic !== undefined) group.isPublic = isPublic;
    if (tags) group.tags = tags;
    if (rules) group.rules = rules;
    if (settings) group.settings = { ...group.settings, ...settings };

    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a class group
// @route   DELETE /api/class-groups/:id
// @access  Private/Admin or Group Admin
const deleteClassGroup = async (req, res, next) => {
  try {
    const group = await ClassGroup.findById(req.params.id);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is an admin of the group or site admin
    const isAdmin = group.admins.some(adminId =>
      adminId.toString() === req.user.id
    );

    if (!isAdmin && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to delete this group', 403));
    }

    await group.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Join a class group
// @route   POST /api/class-groups/:id/join
// @access  Private
const joinClassGroup = async (req, res, next) => {
  try {
    const classGroupService = require('../services/classGroupService');

    // Use the service layer to handle the join logic
    const result = await classGroupService.joinClassGroup(req.user.id, req.params.id);

    if (!result.success) {
      // Handle specific error codes
      if (result.code === 'ALREADY_MEMBER') {
        return next(new ErrorResponse(result.error, 400));
      }
      return next(new ErrorResponse(result.error, 400));
    }

    // Fetch the updated class group with populated data
    const updatedGroup = await ClassGroup.findById(req.params.id)
      .populate('admins', 'firstName lastName profilePicture')
      .lean();

    res.json({
      success: true,
      message: result.message,
      data: {
        classGroup: {
          _id: updatedGroup._id,
          name: updatedGroup.name,
          description: updatedGroup.description,
          graduationYear: updatedGroup.graduationYear,
          coverImage: updatedGroup.coverImage,
          memberCount: updatedGroup.memberCount,
          isPublic: updatedGroup.isPublic
        },
        memberCount: updatedGroup.memberCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Leave a class group
// @route   POST /api/class-groups/:id/leave
// @access  Private
const leaveClassGroup = async (req, res, next) => {
  try {
    const classGroupService = require('../services/classGroupService');

    // Check if user is the last admin before leaving
    const group = await ClassGroup.findById(req.params.id);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    const isAdmin = group.admins.some(adminId =>
      adminId.toString() === req.user.id
    );

    if (isAdmin && group.admins.length === 1) {
      return next(new ErrorResponse('You are the last admin. Please assign another admin before leaving.', 400));
    }

    // Use the service layer to handle the leave logic
    const result = await classGroupService.leaveClassGroup(req.user.id, req.params.id);

    if (!result.success) {
      // Handle specific error codes
      if (result.code === 'NOT_MEMBER') {
        return next(new ErrorResponse(result.error, 400));
      }
      return next(new ErrorResponse(result.error, 400));
    }

    // Remove from admins if they were an admin
    if (isAdmin) {
      group.admins = group.admins.filter(adminId =>
        adminId.toString() !== req.user.id
      );
      await group.save();
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        memberCount: result.memberCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get group members
// @route   GET /api/class-groups/:id/members
// @access  Private (group members only)
const getGroupMembers = async (req, res, next) => {
  try {
    const group = await ClassGroup.findById(req.params.id)
      .select('members')
      .populate('members.user', 'firstName lastName profilePicture email graduationYear')
      .lean();

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Filter out inactive members and map to a cleaner format
    const activeMembers = group.members
      .filter(member => member.isActive)
      .map(member => ({
        ...member.user,
        joinedAt: member.joinedAt
      }));

    res.json({
      success: true,
      count: activeMembers.length,
      data: activeMembers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get group statistics
// @route   GET /api/class-groups/:id/stats
// @access  Private (group members only)
const getGroupStats = async (req, res, next) => {
  try {
    const group = await ClassGroup.findById(req.params.id)
      .select('memberCount postCount eventCount photoCount')
      .lean();

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // In a real app, you might want to calculate more detailed statistics
    res.json({
      success: true,
      data: {
        members: group.memberCount,
        posts: group.postCount,
        events: group.eventCount,
        photos: group.photoCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a post in a class group
// @route   POST /api/class-groups/:id/posts
// @access  Private (group members only)
const createPost = async (req, res, next) => {
  try {
    const group = await ClassGroup.findById(req.params.id);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return next(new ErrorResponse('Not authorized to post in this group', 403));
    }

    const postData = {
      content: req.body.content,
      author: req.user.id,
      images: []
    };

    // Handle image uploads if any
    if (req.files && req.files.images) {
      const uploadPromises = req.files.images.map(file =>
        uploadToCloudinary(file, 'class-group-posts')
      );

      const uploadResults = await Promise.all(uploadPromises);
      postData.images = uploadResults.map(result => ({
        url: result.secure_url,
        thumbnailUrl: result.eager ? result.eager[0].secure_url : result.secure_url,
        caption: ''
      }));
    }

    const post = await group.addPost(postData);

    // Populate author info
    await group.populate('posts.author', 'firstName lastName profilePicture');
    const newPost = group.posts.id(post._id);

    res.status(201).json({
      success: true,
      data: newPost
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/class-groups/:groupId/posts/:postId/comments
// @access  Private (group members only)
const addComment = async (req, res, next) => {
  try {
    const group = await ClassGroup.findById(req.params.groupId);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return next(new ErrorResponse('Not authorized to comment in this group', 403));
    }

    const commentData = {
      content: req.body.content,
      user: req.user.id
    };

    const comment = await group.addComment(req.params.postId, commentData);

    // Populate user info in the comment
    await group.populate('posts.comments.user', 'firstName lastName profilePicture');

    // Find the updated comment
    const updatedPost = group.posts.id(req.params.postId);
    const updatedComment = updatedPost.comments.id(comment._id);

    res.status(201).json({
      success: true,
      data: updatedComment
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Add a reaction to a post or comment
// @route   POST /api/class-groups/:groupId/react/:targetType/:targetId
// @access  Private (group members only)
const addReaction = async (req, res, next) => {
  try {
    const { groupId, targetType, targetId } = req.params;

    if (!['post', 'comment'].includes(targetType)) {
      return next(new ErrorResponse('Invalid target type', 400));
    }

    const group = await ClassGroup.findById(groupId);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return next(new ErrorResponse('Not authorized to react in this group', 403));
    }

    const reactionData = {
      user: req.user.id,
      type: req.body.type || 'like'
    };

    const reactions = await group.addReaction(targetType, targetId, reactionData);

    res.json({
      success: true,
      data: reactions
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get posts for a class group
// @route   GET /api/class-groups/:id/posts
// @access  Private (group members only)
const getPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const group = await ClassGroup.findById(id)
      .select('posts')
      .populate({
        path: 'posts.author',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'posts.comments.user',
        select: 'firstName lastName profilePicture'
      })
      .populate({
        path: 'posts.reactions.user',
        select: 'firstName lastName profilePicture'
      });

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return next(new ErrorResponse('Not authorized to view posts in this group', 403));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = group.posts.length;

    const paginatedPosts = group.posts.slice(startIndex, endIndex);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: paginatedPosts.length,
      pagination,
      data: paginatedPosts
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get events for a class group
// @route   GET /api/class-groups/:id/events
// @access  Private (group members only)
const getEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { upcoming = 'true' } = req.query;

    const group = await ClassGroup.findById(id)
      .select('events')
      .populate('events.createdBy', 'firstName lastName profilePicture')
      .populate('events.attendees.user', 'firstName lastName profilePicture');

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return next(new ErrorResponse('Not authorized to view events in this group', 403));
    }

    let events = group.events;

    // Filter for upcoming/past events
    const now = new Date();
    if (upcoming === 'true') {
      events = events.filter(event => new Date(event.startDate) >= now);
    } else {
      events = events.filter(event => new Date(event.startDate) < now);
    }

    // Sort by date
    events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get albums for a class group
// @route   GET /api/class-groups/:id/albums
// @access  Private (group members only)
const getAlbums = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await ClassGroup.findById(id)
      .select('albums')
      .populate('albums.createdBy', 'firstName lastName profilePicture')
      .populate('albums.photos.tags', 'firstName lastName profilePicture')
      .populate('albums.photos.uploadedBy', 'firstName lastName profilePicture');

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    if (!group.isMember(req.user.id)) {
      return next(new ErrorResponse('Not authorized to view albums in this group', 403));
    }

    // Sort albums by creation date (newest first)
    const albums = group.albums.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      count: albums.length,
      data: albums
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Upload class photo
// @route   POST /api/class-groups/:id/upload-photo
// @access  Private/Admin or Group Admin
const uploadClassPhoto = async (req, res, next) => {
  try {
    const imageService = require('../services/imageService');

    const group = await ClassGroup.findById(req.params.id);

    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is an admin of the group or site admin
    const isAdmin = group.admins.some(adminId =>
      adminId.toString() === req.user.id
    );

    if (!isAdmin && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to upload photos for this group', 403));
    }

    // Check if file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Validate image file
    const validation = imageService.validateImageFile(req.file);
    if (!validation.valid) {
      return next(new ErrorResponse(validation.error, 400));
    }

    // Upload and optimize image
    const uploadResult = await imageService.uploadClassPhoto(
      req.file,
      group.graduationYear
    );

    // Update group with new cover image
    group.coverImage = uploadResult.urls.display;
    group.bannerImage = uploadResult.urls.full;
    await group.save();

    res.json({
      success: true,
      message: 'Class photo uploaded successfully',
      data: {
        coverImage: group.coverImage,
        bannerImage: group.bannerImage,
        uploadDetails: uploadResult
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClassGroups,
  getClassGroupById,
  createClassGroup,
  updateClassGroup,
  deleteClassGroup,
  joinClassGroup,
  leaveClassGroup,
  getGroupMembers,
  getGroupStats,
  createPost,
  addComment,
  addReaction,
  getPosts,
  getEvents,
  getAlbums,
  uploadClassPhoto
};
