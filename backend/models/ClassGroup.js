const mongoose = require('mongoose');

// Reaction schema for posts
const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Comment schema for posts
const commentSchema = new mongoose.Schema({
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
  reactions: [reactionSchema],
  isEdited: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Post schema for class group
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    thumbnailUrl: String,
    caption: String
  }],
  reactions: [reactionSchema],
  comments: [commentSchema],
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Event schema for class group
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  location: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: String,
  coverImage: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'not_going'],
      default: 'interested'
    }
  }],
  isCancelled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Album schema for class group
const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  coverPhoto: String,
  photos: [{
    url: String,
    thumbnailUrl: String,
    caption: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    reactions: [reactionSchema],
    comments: [commentSchema]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  privacy: {
    type: String,
    enum: ['public', 'members', 'admins'],
    default: 'members'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const classGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  motto: {
    type: String,
    trim: true,
    default: ''
  },
  coverImage: String,
  bannerImage: String,
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  posts: [postSchema],
  events: [eventSchema],
  albums: [albumSchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  eventCount: {
    type: Number,
    default: 0
  },
  photoCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  rules: [{
    title: String,
    description: String
  }],
  settings: {
    allowMemberPosts: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    sendNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
classGroupSchema.index({ name: 'text', description: 'text', tags: 'text' });
classGroupSchema.index({ graduationYear: 1, isPublic: 1 });

// Virtual for group posts
classGroupSchema.virtual('groupPosts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

// Virtual for group events
classGroupSchema.virtual('groupEvents', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

// Virtual for group photo albums
classGroupSchema.virtual('groupAlbums', {
  ref: 'Album',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

// Method to check if a user is a member of the group
classGroupSchema.methods.isMember = function (userId) {
  return this.members.some(member =>
    member.user && member.user.toString() === userId.toString() && member.isActive
  );
};

// Method to check if a user is an admin of the group
classGroupSchema.methods.isAdmin = function (userId) {
  return this.admins.some(adminId => adminId.toString() === userId.toString());
};

// Method to check if a user is a moderator of the group
classGroupSchema.methods.isModerator = function (userId) {
  const member = this.members.find(m =>
    m.user && m.user.toString() === userId.toString()
  );
  return member && member.role === 'moderator';
};

// Method to add a member to the group
classGroupSchema.methods.addMember = async function (userId, role = 'member') {
  if (this.isMember(userId)) {
    // If already a member but inactive, make them active
    const memberIndex = this.members.findIndex(
      m => m.user && m.user.toString() === userId.toString()
    );

    if (memberIndex !== -1) {
      this.members[memberIndex].isActive = true;
      this.members[memberIndex].leftAt = undefined;
      this.members[memberIndex].role = role;
      await this.save();
      return { isNewMember: false };
    }
  }

  // If not a member, add them
  this.members.push({
    user: userId,
    joinedAt: new Date(),
    isActive: true,
    role
  });

  this.memberCount += 1;
  await this.save();
  return { isNewMember: true };
};

// Method to remove a member from the group
classGroupSchema.methods.removeMember = async function (userId) {
  const memberIndex = this.members.findIndex(
    m => m.user && m.user.toString() === userId.toString()
  );

  if (memberIndex !== -1) {
    // Instead of removing, mark as inactive
    this.members[memberIndex].isActive = false;
    this.members[memberIndex].leftAt = new Date();
    this.memberCount = Math.max(0, this.memberCount - 1);
    await this.save();
    return true;
  }
  return false;
};

// Method to add a post to the group
classGroupSchema.methods.addPost = async function (postData) {
  const post = {
    ...postData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  this.posts.unshift(post);
  this.postCount += 1;
  await this.save();
  return this.posts[0];
};

// Method to add a comment to a post
classGroupSchema.methods.addComment = async function (postId, commentData) {
  const postIndex = this.posts.findIndex(p => p._id.toString() === postId);

  if (postIndex === -1) {
    throw new Error('Post not found');
  }

  const comment = {
    ...commentData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  this.posts[postIndex].comments.push(comment);
  await this.save();
  return this.posts[postIndex].comments[this.posts[postIndex].comments.length - 1];
};

// Method to add a reaction to a post or comment
classGroupSchema.methods.addReaction = async function (targetType, targetId, reactionData) {
  let target;
  let targetPath;

  if (targetType === 'post') {
    const postIndex = this.posts.findIndex(p => p._id.toString() === targetId);
    if (postIndex === -1) throw new Error('Post not found');
    target = this.posts[postIndex];
    targetPath = `posts.${postIndex}.reactions`;
  } else if (targetType === 'comment') {
    // Find the comment in any post
    let commentIndex = -1;
    const postIndex = this.posts.findIndex(post => {
      commentIndex = post.comments.findIndex(c => c._id.toString() === targetId);
      return commentIndex !== -1;
    });

    if (postIndex === -1) throw new Error('Comment not found');

    target = this.posts[postIndex].comments[commentIndex];
    targetPath = `posts.${postIndex}.comments.${commentIndex}.reactions`;
  } else {
    throw new Error('Invalid target type');
  }

  // Check if user already reacted
  const existingReactionIndex = target.reactions.findIndex(
    r => r.user.toString() === reactionData.user.toString()
  );

  if (existingReactionIndex !== -1) {
    // Update existing reaction
    target.reactions[existingReactionIndex].type = reactionData.type;
    target.reactions[existingReactionIndex].createdAt = new Date();
  } else {
    // Add new reaction
    target.reactions.push({
      ...reactionData,
      createdAt: new Date()
    });
  }

  await this.save();
  return target.reactions;
};

// Method to create an event in the group
classGroupSchema.methods.createEvent = async function (eventData) {
  const event = {
    ...eventData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  this.events.push(event);
  this.eventCount += 1;
  await this.save();
  return this.events[this.events.length - 1];
};

// Method to create an album in the group
classGroupSchema.methods.createAlbum = async function (albumData) {
  const album = {
    ...albumData,
    createdAt: new Date(),
    updatedAt: new Date(),
    photos: []
  };

  this.albums.push(album);
  await this.save();
  return this.albums[this.albums.length - 1];
};

// Method to add a photo to an album
classGroupSchema.methods.addPhotoToAlbum = async function (albumId, photoData) {
  const albumIndex = this.albums.findIndex(a => a._id.toString() === albumId);

  if (albumIndex === -1) {
    throw new Error('Album not found');
  }

  const photo = {
    ...photoData,
    uploadedAt: new Date(),
    tags: [],
    reactions: [],
    comments: []
  };

  this.albums[albumIndex].photos.push(photo);

  // Update album cover if it's the first photo
  if (this.albums[albumIndex].photos.length === 1) {
    this.albums[albumIndex].coverPhoto = photo.url;
  }

  await this.save();
  return this.albums[albumIndex].photos[this.albums[albumIndex].photos.length - 1];
};

const ClassGroup = mongoose.model('ClassGroup', classGroupSchema);

module.exports = ClassGroup;
