const Post = require('../models/Post');
const ClassGroup = require('../models/ClassGroup');
const { ErrorResponse } = require('../middleware/errorHandler');

// List posts for a class group
exports.getGroupPosts = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await ClassGroup.findById(groupId);
    if (!group) return next(new ErrorResponse('Class group not found', 404));

    const posts = await Post.find({ group: groupId })
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName profilePicture isAdmin')
      .lean();

    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) { next(err); }
};

// Create a post (admin announcements public; member updates private)
exports.createGroupPost = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await ClassGroup.findById(groupId);
    if (!group) return next(new ErrorResponse('Class group not found', 404));

    const { content, title, type } = req.body;
    if (!content || content.trim().length === 0) {
      return next(new ErrorResponse('Content is required', 400));
    }

    const isAnnouncement = type === 'announcement';
    if (isAnnouncement && !req.user.isAdmin) {
      return next(new ErrorResponse('Only admin can create announcements', 403));
    }

    const post = await Post.create({
      group: groupId,
      author: req.user.id,
      type: isAnnouncement ? 'announcement' : 'member_update',
      isPublic: !!isAnnouncement,
      title: title || undefined,
      content,
    });

    const populated = await Post.findById(post._id).populate('author', 'firstName lastName profilePicture isAdmin');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// React to a post (like/love)
exports.reactToPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(new ErrorResponse('Post not found', 404));

    const { type } = req.body;
    if (!['like', 'love'].includes(type)) return next(new ErrorResponse('Invalid reaction', 400));

    // Remove previous reaction by user
    post.reactions = post.reactions.filter(r => r.user.toString() !== req.user.id);
    // Add new reaction
    post.reactions.push({ user: req.user.id, type });
    await post.save();

    res.json({ success: true, data: { counts: countReactions(post.reactions) } });
  } catch (err) { next(err); }
};

function countReactions(reactions) {
  return reactions.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
}

// Comment on a post
exports.commentOnPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(new ErrorResponse('Post not found', 404));
    const { text } = req.body;
    if (!text || text.trim().length === 0) return next(new ErrorResponse('Comment text required', 400));

    post.comments.push({ user: req.user.id, text });
    await post.save();

    const populated = await Post.findById(post._id).populate('comments.user', 'firstName lastName profilePicture');
    res.status(201).json({ success: true, data: populated.comments[populated.comments.length - 1] });
  } catch (err) { next(err); }
};
