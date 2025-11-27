const Album = require('../models/Album');
const ClassGroup = require('../models/ClassGroup');
const { ErrorResponse } = require('../middleware/errorHandler');

exports.getGroupAlbums = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await ClassGroup.findById(groupId);
    if (!group) return next(new ErrorResponse('Class group not found', 404));
    const albums = await Album.find({ group: groupId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: albums.length, data: albums });
  } catch (err) { next(err); }
};

exports.createGroupAlbum = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await ClassGroup.findById(groupId);
    if (!group) return next(new ErrorResponse('Class group not found', 404));
    if (!req.user.isAdmin) return next(new ErrorResponse('Only admin can create albums', 403));

    const { title, coverImage, photos = [], isPublic = true } = req.body;
    if (!title) return next(new ErrorResponse('Title is required', 400));
    const album = await Album.create({ group: groupId, title, coverImage, photos, createdBy: req.user.id, isPublic });
    res.status(201).json({ success: true, data: album });
  } catch (err) { next(err); }
};
