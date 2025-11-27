const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    image: {
        url: String,
        thumbnailUrl: String,
        caption: String
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    shares: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    isPinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance optimization
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for like count
communityPostSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
communityPostSchema.virtual('commentCount').get(function () {
    return this.comments ? this.comments.length : 0;
});

// Virtual for share count
communityPostSchema.virtual('shareCount').get(function () {
    return this.shares ? this.shares.length : 0;
});

// Ensure virtuals are included in JSON output
communityPostSchema.set('toJSON', { virtuals: true });
communityPostSchema.set('toObject', { virtuals: true });

// Instance method to check if a user has liked the post
communityPostSchema.methods.isLikedBy = function (userId) {
    return this.likes.some(like => like.user.toString() === userId.toString());
};

// Instance method to add a like
communityPostSchema.methods.addLike = function (userId) {
    if (!this.isLikedBy(userId)) {
        this.likes.push({ user: userId });
    }
    return this.save();
};

// Instance method to remove a like
communityPostSchema.methods.removeLike = function (userId) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    return this.save();
};

// Instance method to add a comment
communityPostSchema.methods.addComment = function (userId, content) {
    this.comments.push({ user: userId, content });
    return this.save();
};

// Instance method to remove a comment
communityPostSchema.methods.removeComment = function (commentId) {
    this.comments = this.comments.filter(comment => comment._id.toString() !== commentId.toString());
    return this.save();
};

// Instance method to add a share
communityPostSchema.methods.addShare = function (userId) {
    // Check if user hasn't already shared
    const alreadyShared = this.shares.some(share => share.user.toString() === userId.toString());
    if (!alreadyShared) {
        this.shares.push({ user: userId });
    }
    return this.save();
};

// Static method to get posts with pagination
communityPostSchema.statics.getPaginated = async function (options = {}) {
    const {
        page = 1,
        limit = 10,
        isPublic = true,
        author = null,
        sort = { createdAt: -1 }
    } = options;

    const query = { isPublic };
    if (author) {
        query.author = author;
    }

    const skip = (page - 1) * limit;

    const posts = await this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName profilePicture graduationYear')
        .populate('likes.user', 'firstName lastName profilePicture')
        .populate('comments.user', 'firstName lastName profilePicture')
        .populate('shares.user', 'firstName lastName profilePicture')
        .exec();

    const total = await this.countDocuments(query);

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

module.exports = CommunityPost;
