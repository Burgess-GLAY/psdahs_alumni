const mongoose = require('mongoose');

const reactionTypes = ['like', 'love'];

const postSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['announcement', 'member_update'], default: 'member_update' },
  isPublic: { type: Boolean, default: false },
  title: { type: String },
  content: { type: String, required: true },
  images: [{ url: String, caption: String }],
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, type: { type: String, enum: reactionTypes } }],
  comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

postSchema.index({ group: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
