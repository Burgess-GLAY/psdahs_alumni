const Announcement = require('../models/Announcement');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search, pinned } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (pinned === 'true') query.isPinned = true;

    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName profilePicture')
      .populate('comments.author', 'firstName lastName profilePicture')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Announcement.countDocuments(query);

    res.json({
      success: true,
      count: announcements.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: announcements
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture email')
      .populate('comments.author', 'firstName lastName profilePicture');

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    // Increment views if not the author
    if (req.user?.id !== announcement.author._id.toString()) {
      announcement.views += 1;
      await announcement.save();
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res, next) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse tags if they come as an array from FormData
    let tags = [];
    if (req.body['tags[]']) {
      tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    } else if (req.body.tags) {
      tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    }

    const announcementData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      startDate: req.body.startDate,
      author: req.user.id,
      imageUrl,
      tags,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true
    };

    const announcement = await Announcement.create(announcementData);

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    next(err);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    // Check if user is authorized to update
    if (announcement.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to update this announcement', 403));
    }

    // Prevent updating certain fields
    const { _id, author, createdAt, __v, ...updateData } = req.body;

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: announcement
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    // Check if user is authorized to delete
    if (announcement.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to delete this announcement', 403));
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle pin status of announcement
// @route   PATCH /api/announcements/:id/pin
// @access  Private/Admin
exports.togglePinAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.json({
      success: true,
      data: announcement
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle like on announcement
// @route   PUT /api/announcements/:id/like
// @access  Private
exports.toggleLikeAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    // Check if announcement has already been liked
    if (announcement.likes.includes(req.user.id)) {
      // Unlike
      announcement.likes = announcement.likes.filter(
        (like) => like.toString() !== req.user.id
      );
    } else {
      // Like
      announcement.likes.unshift(req.user.id);
    }

    await announcement.save();

    res.json({
      success: true,
      data: announcement.likes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to announcement
// @route   POST /api/announcements/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    const newComment = {
      text: req.body.text,
      author: req.user.id
    };

    announcement.comments.unshift(newComment);

    await announcement.save();

    // Populate author details for the new comment
    await announcement.populate({
      path: 'comments.author',
      select: 'firstName lastName profilePicture'
    });

    res.json({
      success: true,
      data: announcement.comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/announcements/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return next(new ErrorResponse('Announcement not found', 404));
    }

    // Pull out comment
    const comment = announcement.comments.find(
      (comment) => comment.id === req.params.commentId
    );

    // Make sure comment exists
    if (!comment) {
      return next(new ErrorResponse('Comment not found', 404));
    }

    // Check user
    if (comment.author.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse('User not authorized', 401));
    }

    // Get remove index
    const removeIndex = announcement.comments
      .map((comment) => comment.id)
      .indexOf(req.params.commentId);

    announcement.comments.splice(removeIndex, 1);

    await announcement.save();

    res.json({
      success: true,
      data: announcement.comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get announcement statistics
// @route   GET /api/announcements/stats
// @access  Private/Admin
exports.getAnnouncementStats = async (req, res, next) => {
  try {
    const stats = await Announcement.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
          },
          pinned: {
            $sum: { $cond: ['$isPinned', 1, 0] }
          },
          byCategory: { $push: '$category' },
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          published: 1,
          pinned: 1,
          totalViews: 1,
          avgViews: { $round: ['$avgViews', 0] },
          byCategory: {
            $reduce: {
              input: '$byCategory',
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: '$$value',
                        as: 'item',
                        cond: { $eq: ['$$item.category', '$$this'] }
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
                              { $eq: ['$$item.category', '$$this'] },
                              {
                                category: '$$item.category',
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
                          [{ category: '$$this', count: 1 }]
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
        total: 0,
        published: 0,
        pinned: 0,
        totalViews: 0,
        avgViews: 0,
        byCategory: []
      }
    });
  } catch (err) {
    next(err);
  }
};
