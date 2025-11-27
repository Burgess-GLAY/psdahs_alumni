const CommunityPost = require('../models/CommunityPost');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all community posts
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const query = { isPublic: true };

        const posts = await CommunityPost.find(query)
            .populate('author', 'firstName lastName profilePicture graduationYear')
            .populate('likes.user', 'firstName lastName profilePicture')
            .populate('comments.user', 'firstName lastName profilePicture')
            .populate('shares.user', 'firstName lastName profilePicture')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Add computed fields for counts
        const enrichedPosts = posts.map(post => ({
            ...post,
            likeCount: post.likes ? post.likes.length : 0,
            commentCount: post.comments ? post.comments.length : 0,
            shareCount: post.shares ? post.shares.length : 0,
            isLikedByUser: req.user ? post.likes.some(like => like.user._id.toString() === req.user.id) : false
        }));

        const count = await CommunityPost.countDocuments(query);

        res.json({
            success: true,
            count: enrichedPosts.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: enrichedPosts
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single community post
// @route   GET /api/community/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id)
            .populate('author', 'firstName lastName profilePicture graduationYear email')
            .populate('likes.user', 'firstName lastName profilePicture')
            .populate('comments.user', 'firstName lastName profilePicture')
            .populate('shares.user', 'firstName lastName profilePicture');

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        // Add computed fields
        const enrichedPost = {
            ...post.toObject(),
            likeCount: post.likes.length,
            commentCount: post.comments.length,
            shareCount: post.shares.length,
            isLikedByUser: req.user ? post.likes.some(like => like.user._id.toString() === req.user.id) : false
        };

        res.json({
            success: true,
            data: enrichedPost
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new community post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res, next) => {
    try {
        const { content } = req.body;

        // Validate content
        if (!content || content.trim().length === 0) {
            return next(new ErrorResponse('Post content is required', 400));
        }

        if (content.length > 5000) {
            return next(new ErrorResponse('Post content exceeds maximum length of 5000 characters', 400));
        }

        let imageUrl = '';
        let thumbnailUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            thumbnailUrl = `/uploads/${req.file.filename}`; // In production, generate actual thumbnail
        }

        const postData = {
            author: req.user.id,
            content: content.trim(),
            isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
        };

        if (imageUrl) {
            postData.image = {
                url: imageUrl,
                thumbnailUrl: thumbnailUrl,
                caption: req.body.imageCaption || ''
            };
        }

        const post = await CommunityPost.create(postData);

        // Populate author information
        await post.populate('author', 'firstName lastName profilePicture graduationYear');

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (err) {
        console.error('Error creating post:', err);
        next(err);
    }
};

// @desc    Update community post
// @route   PUT /api/community/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
    try {
        let post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        // Check if user is authorized to update
        if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
            return next(new ErrorResponse('Not authorized to update this post', 403));
        }

        const { content, imageCaption, isPublic } = req.body;

        // Validate content if provided
        if (content !== undefined) {
            if (content.trim().length === 0) {
                return next(new ErrorResponse('Post content cannot be empty', 400));
            }
            if (content.length > 5000) {
                return next(new ErrorResponse('Post content exceeds maximum length of 5000 characters', 400));
            }
            post.content = content.trim();
        }

        // Update image if new one is uploaded
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            const thumbnailUrl = `/uploads/${req.file.filename}`;
            post.image = {
                url: imageUrl,
                thumbnailUrl: thumbnailUrl,
                caption: imageCaption || ''
            };
        } else if (imageCaption !== undefined && post.image) {
            post.image.caption = imageCaption;
        }

        if (isPublic !== undefined) {
            post.isPublic = isPublic;
        }

        await post.save();

        // Populate author information
        await post.populate('author', 'firstName lastName profilePicture graduationYear');

        res.json({
            success: true,
            data: post
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete community post
// @route   DELETE /api/community/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        // Check if user is authorized to delete
        if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
            return next(new ErrorResponse('Not authorized to delete this post', 403));
        }

        await post.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Toggle like on community post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        // Check if post has already been liked by this user
        const likeIndex = post.likes.findIndex(
            like => like.user.toString() === req.user.id
        );

        if (likeIndex > -1) {
            // Unlike - remove the like
            post.likes.splice(likeIndex, 1);
        } else {
            // Like - add the like
            post.likes.unshift({
                user: req.user.id,
                createdAt: Date.now()
            });
        }

        await post.save();

        // Populate user information for likes
        await post.populate('likes.user', 'firstName lastName profilePicture');

        res.json({
            success: true,
            data: {
                likes: post.likes,
                likeCount: post.likes.length,
                isLiked: likeIndex === -1 // true if we just liked, false if we just unliked
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add comment to community post
// @route   POST /api/community/posts/:id/comment
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        const { content } = req.body;

        // Validate comment content
        if (!content || content.trim().length === 0) {
            return next(new ErrorResponse('Comment content is required', 400));
        }

        if (content.length > 1000) {
            return next(new ErrorResponse('Comment exceeds maximum length of 1000 characters', 400));
        }

        const newComment = {
            user: req.user.id,
            content: content.trim(),
            createdAt: Date.now()
        };

        post.comments.unshift(newComment);

        await post.save();

        // Populate user details for the new comment
        await post.populate('comments.user', 'firstName lastName profilePicture');

        res.json({
            success: true,
            data: {
                comment: post.comments[0],
                commentCount: post.comments.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete comment from community post
// @route   DELETE /api/community/posts/:postId/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.postId);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        // Find the comment
        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return next(new ErrorResponse('Comment not found', 404));
        }

        // Check if user is authorized to delete (comment author or admin)
        if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
            return next(new ErrorResponse('Not authorized to delete this comment', 403));
        }

        // Remove the comment
        comment.deleteOne();

        await post.save();

        res.json({
            success: true,
            data: {
                commentCount: post.comments.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Share community post
// @route   POST /api/community/posts/:id/share
// @access  Private
exports.sharePost = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        // Check if user has already shared this post
        const hasShared = post.shares.some(
            share => share.user.toString() === req.user.id
        );

        if (hasShared) {
            return next(new ErrorResponse('You have already shared this post', 400));
        }

        // Add share record
        post.shares.unshift({
            user: req.user.id,
            createdAt: Date.now()
        });

        await post.save();

        // Populate user information for shares
        await post.populate('shares.user', 'firstName lastName profilePicture');

        res.json({
            success: true,
            data: {
                shares: post.shares,
                shareCount: post.shares.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Toggle pin status of community post
// @route   PUT /api/community/posts/:id/pin
// @access  Private/Admin
exports.togglePinPost = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.json({
            success: true,
            data: {
                isPinned: post.isPinned
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Admin delete community post
// @route   DELETE /api/community/posts/:id/admin
// @access  Private/Admin
exports.adminDeletePost = async (req, res, next) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse('Post not found', 404));
        }

        await post.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
