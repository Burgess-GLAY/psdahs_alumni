const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  title: { type: String, required: true },
  coverImage: String,
  photos: [{ url: String, caption: String, createdAt: { type: Date, default: Date.now } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

albumSchema.index({ group: 1, createdAt: -1 });

const Album = mongoose.model('Album', albumSchema);
module.exports = Album;
