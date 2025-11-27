const ClassGroup = require('../models/ClassGroup');
const User = require('../models/User');

/**
 * Assigns a user to their respective class group based on graduation year
 * @param {string} userId - The ID of the user to assign
 * @param {number} graduationYear - The user's graduation year
 * @returns {Promise<Object>} - The updated class group
 */
const assignUserToClassGroup = async (userId, graduationYear) => {
  try {
    // Find the class group for the user's graduation year
    const classGroup = await ClassGroup.findOne({ 
      graduationYear,
      name: new RegExp(`class.*${graduationYear}`, 'i')
    });

    if (!classGroup) {
      console.warn(`No class group found for year ${graduationYear}`);
      return null;
    }

    // Check if user is already a member
    const isAlreadyMember = classGroup.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return classGroup;
    }

    // Add user to class group
    classGroup.members.push({
      user: userId,
      joinDate: new Date(),
      isActive: true
    });

    // Add class group to user's classGroups array
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        classGroups: {
          group: classGroup._id,
          joinDate: new Date(),
          isActive: true
        }
      }
    });

    await classGroup.save();
    return classGroup;
  } catch (error) {
    console.error('Error assigning user to class group:', error);
    throw error;
  }
};

/**
 * Gets all class groups for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of class groups the user belongs to
 */
const getUserClassGroups = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'classGroups.group',
      select: 'name description graduationYear image members'
    });
    
    return user.classGroups.filter(cg => cg.isActive).map(cg => cg.group);
  } catch (error) {
    console.error('Error getting user class groups:', error);
    throw error;
  }
};

module.exports = {
  assignUserToClassGroup,
  getUserClassGroups
};
