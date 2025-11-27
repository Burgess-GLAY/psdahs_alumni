const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
const { ErrorResponse } = require('../middleware/errorHandler');
const { assignUserToClassGroup, getUserClassGroups } = require('../utils/classGroupHelper');

/**
 * @desc    Get all class groups for the authenticated user
 * @route   GET /api/users/me/class-groups
 * @access  Private
 */
exports.getMyClassGroups = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'classGroups.group',
        select: 'name description graduationYear image members',
        populate: {
          path: 'members.user',
          select: 'firstName lastName profilePicture'
        }
      });

    const activeGroups = user.classGroups
      .filter(cg => cg.isActive)
      .map(cg => ({
        ...cg.group.toObject(),
        role: cg.isAdmin ? 'admin' : cg.isModerator ? 'moderator' : 'member',
        joinDate: cg.joinDate
      }));

    res.json({
      success: true,
      count: activeGroups.length,
      data: activeGroups
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join a class group
 * @route   POST /api/users/me/class-groups/:groupId/join
 * @access  Private
 */
exports.joinClassGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await ClassGroup.findById(groupId);
    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if already a member
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === userId && member.isActive
    );

    if (isAlreadyMember) {
      return next(new ErrorResponse('Already a member of this group', 400));
    }

    // Add to group
    const memberData = {
      user: userId,
      joinDate: new Date(),
      isActive: true
    };

    // If this is the first member, make them an admin
    if (group.members.length === 0) {
      memberData.isAdmin = true;
      memberData.isModerator = true;
    }

    group.members.push(memberData);
    await group.save();

    // Update user's classGroups array
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        classGroups: {
          group: groupId,
          joinDate: new Date(),
          isActive: true,
          isAdmin: memberData.isAdmin || false,
          isModerator: memberData.isModerator || false
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully joined class group',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Leave a class group
 * @route   POST /api/users/me/class-groups/:groupId/leave
 * @access  Private
 */
exports.leaveClassGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await ClassGroup.findById(groupId);
    if (!group) {
      return next(new ErrorResponse('Class group not found', 404));
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === userId && member.isActive
    );

    if (memberIndex === -1) {
      return next(new ErrorResponse('Not a member of this group', 400));
    }

    // Check if last admin
    const isAdmin = group.members[memberIndex].isAdmin;
    if (isAdmin) {
      const adminCount = group.members.filter(m => m.isAdmin && m.isActive).length;
      if (adminCount === 1) {
        return next(new ErrorResponse('Cannot leave as the only admin. Please assign another admin first.', 400));
      }
    }

    // Remove from group
    group.members[memberIndex].isActive = false;
    group.members[memberIndex].leaveDate = new Date();
    await group.save();

    // Update user's classGroups array
    await User.updateOne(
      { _id: userId, 'classGroups.group': groupId },
      { 
        $set: { 
          'classGroups.$.isActive': false,
          'classGroups.$.leaveDate': new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Successfully left class group'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available class groups (for joining)
 * @route   GET /api/class-groups/available
 * @access  Private
 */
exports.getAvailableClassGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's current class groups
    const user = await User.findById(userId).select('classGroups');
    const userGroupIds = user.classGroups.map(cg => cg.group.toString());

    // Find all public groups or groups the user can join
    const groups = await ClassGroup.find({
      $or: [
        { isPublic: true },
        { 'members.user': userId, 'members.isActive': true }
      ]
    })
    .select('name description graduationYear image members')
    .sort('-graduationYear');

    // Add membership status to each group
    const groupsWithStatus = groups.map(group => ({
      ...group.toObject(),
      isMember: group.members.some(member => 
        member.user.toString() === userId && member.isActive
      ),
      memberCount: group.members.filter(m => m.isActive).length
    }));

    res.json({
      success: true,
      count: groupsWithStatus.length,
      data: groupsWithStatus
    });
  } catch (error) {
    next(error);
  }
};
