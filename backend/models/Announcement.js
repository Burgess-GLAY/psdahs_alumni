const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['updates', 'achievements', 'events'],
    default: 'updates'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  imageUrl: String,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
announcementSchema.index({ title: 'text', description: 'text', tags: 'text' });
announcementSchema.index({ isPublished: 1, startDate: -1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });

// Virtual for formatted date
announcementSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to check if announcement is active
announcementSchema.methods.isActive = function () {
  const now = new Date();
  if (!this.isPublished) return false;
  if (!this.endDate) return true;
  return now >= this.startDate && now <= this.endDate;
};

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
