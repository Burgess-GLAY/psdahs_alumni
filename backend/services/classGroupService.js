const mongoose = require('mongoose');
const ClassGroup = require('../models/ClassGroup');
const User = require('../models/User');

/**
 * Automatically assigns a user to their class group based on graduation year
 * This function is called during user registration
 * 
 * @param {Object} params - Assignment parameters
 * @param {string} params.userId - The MongoDB ObjectId of the user
 * @param {number} params.graduationYear - The user's graduation year (2007-2025)
 * @param {Object} params.userInfo - User information for logging
 * @param {string} params.userInfo.firstName - User's first name
 * @param {string} params.userInfo.lastName - User's last name
 * @param {string} params.userInfo.email - User's email
 * @param {string} [params.userInfo.profilePicture] - User's profile picture URL
 * @returns {Promise<Object>} Result object with success status and assigned group info
 */
const autoAssignClassGroup = async ({ userId, graduationYear, userInfo }) => {
    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;

    // Validate graduation year range
    if (graduationYear < 2007 || graduationYear > 2025) {
        console.warn(`Graduation year ${graduationYear} is outside valid range (2007-2025)`);
        return {
            success: false,
            error: 'Graduation year must be between 2007 and 2025',
            assignedGroup: null
        };
    }

    while (attempt < maxRetries) {
        attempt++;

        try {
            console.log(`Auto-assignment attempt ${attempt} for user ${userInfo.email}, graduation year: ${graduationYear}`);

            // Find the class group matching the graduation year
            const classGroup = await ClassGroup.findOne({
                graduationYear: graduationYear
            });

            if (!classGroup) {
                console.warn(`No class group found for graduation year ${graduationYear}`);
                return {
                    success: false,
                    error: `No class group exists for graduation year ${graduationYear}`,
                    assignedGroup: null
                };
            }

            // Check if user is already a member
            const existingMember = classGroup.members.find(
                member => member.user.toString() === userId.toString()
            );

            if (existingMember) {
                // User already assigned (possibly from a previous attempt)
                console.log(`User ${userInfo.email} already assigned to ${classGroup.name}`);

                return {
                    success: true,
                    assignedGroup: {
                        id: classGroup._id.toString(),
                        name: classGroup.name,
                        graduationYear: classGroup.graduationYear,
                        memberCount: classGroup.memberCount
                    },
                    message: 'User was already assigned to this class group'
                };
            }

            // Add user to class group members array
            classGroup.members.push({
                user: userId,
                joinedAt: new Date(),
                isActive: true,
                role: 'member'
            });

            // Increment member count atomically
            classGroup.memberCount = (classGroup.memberCount || 0) + 1;

            // Save class group
            await classGroup.save();

            // Update user's classGroups array
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found during class group assignment');
            }

            // Check if class group already in user's array
            const existingGroupIndex = user.classGroups.findIndex(
                cg => cg.group.toString() === classGroup._id.toString()
            );

            if (existingGroupIndex === -1) {
                user.classGroups.push({
                    group: classGroup._id,
                    joinDate: new Date(),
                    isAdmin: false,
                    isModerator: false,
                    isActive: true
                });
            } else {
                // Reactivate if it was inactive
                user.classGroups[existingGroupIndex].isActive = true;
                user.classGroups[existingGroupIndex].joinDate = new Date();
            }

            // Save user
            await user.save();

            console.log(`Successfully assigned user ${userInfo.email} to ${classGroup.name}`);
            console.log(`Class group ${classGroup.name} now has ${classGroup.memberCount} members`);

            return {
                success: true,
                assignedGroup: {
                    id: classGroup._id.toString(),
                    name: classGroup.name,
                    graduationYear: classGroup.graduationYear,
                    memberCount: classGroup.memberCount
                },
                message: `Successfully assigned to ${classGroup.name}`
            };

        } catch (error) {
            lastError = error;

            console.error(`Auto-assignment attempt ${attempt} failed:`, {
                error: error.message,
                userId,
                graduationYear,
                userEmail: userInfo.email
            });

            // Check if it's a transient error that we should retry
            const isTransientError =
                error.name === 'MongoNetworkError' ||
                error.name === 'MongoTimeoutError' ||
                error.message.includes('ECONNREFUSED');

            if (!isTransientError || attempt >= maxRetries) {
                // Don't retry for non-transient errors or if max retries reached
                break;
            }

            // Exponential backoff before retry
            const backoffMs = Math.pow(2, attempt) * 100; // 200ms, 400ms, 800ms
            console.log(`Retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
    }

    // All retries failed
    console.error(`Failed to auto-assign user ${userInfo.email} after ${maxRetries} attempts`);
    console.error('Last error:', lastError);

    return {
        success: false,
        error: lastError?.message || 'Failed to assign user to class group',
        assignedGroup: null
    };
};

/**
 * Manually join a class group
 * @param {string} userId - User ID
 * @param {string} classGroupId - Class group ID
 * @returns {Promise<Object>} Result with updated class group
 */
const joinClassGroup = async (userId, classGroupId) => {
    try {
        const classGroup = await ClassGroup.findById(classGroupId);

        if (!classGroup) {
            throw new Error('Class group not found');
        }

        // Check if already a member
        const existingMember = classGroup.members.find(
            member => member.user.toString() === userId.toString() && member.isActive
        );

        if (existingMember) {
            return {
                success: false,
                error: 'You are already a member of this class group',
                code: 'ALREADY_MEMBER'
            };
        }

        // Add or reactivate member
        const inactiveMemberIndex = classGroup.members.findIndex(
            member => member.user.toString() === userId.toString() && !member.isActive
        );

        if (inactiveMemberIndex !== -1) {
            // Reactivate existing member
            classGroup.members[inactiveMemberIndex].isActive = true;
            classGroup.members[inactiveMemberIndex].joinedAt = new Date();
        } else {
            // Add new member
            classGroup.members.push({
                user: userId,
                joinedAt: new Date(),
                isActive: true,
                role: 'member'
            });
        }

        classGroup.memberCount = (classGroup.memberCount || 0) + 1;
        await classGroup.save();

        // Update user
        const user = await User.findById(userId);
        const existingGroupIndex = user.classGroups.findIndex(
            cg => cg.group.toString() === classGroupId.toString()
        );

        if (existingGroupIndex === -1) {
            user.classGroups.push({
                group: classGroupId,
                joinDate: new Date(),
                isAdmin: false,
                isModerator: false,
                isActive: true
            });
        } else {
            user.classGroups[existingGroupIndex].isActive = true;
            user.classGroups[existingGroupIndex].joinDate = new Date();
        }

        await user.save();

        return {
            success: true,
            message: `Successfully joined ${classGroup.name}`,
            classGroup: {
                id: classGroup._id,
                name: classGroup.name,
                graduationYear: classGroup.graduationYear,
                memberCount: classGroup.memberCount
            }
        };

    } catch (error) {
        throw error;
    }
};

/**
 * Leave a class group
 * @param {string} userId - User ID
 * @param {string} classGroupId - Class group ID
 * @returns {Promise<Object>} Result with updated member count
 */
const leaveClassGroup = async (userId, classGroupId) => {
    try {
        const classGroup = await ClassGroup.findById(classGroupId);

        if (!classGroup) {
            throw new Error('Class group not found');
        }

        // Find active member
        const memberIndex = classGroup.members.findIndex(
            member => member.user.toString() === userId.toString() && member.isActive
        );

        if (memberIndex === -1) {
            return {
                success: false,
                error: 'You are not a member of this class group',
                code: 'NOT_MEMBER'
            };
        }

        // Mark member as inactive
        classGroup.members[memberIndex].isActive = false;
        classGroup.memberCount = Math.max(0, (classGroup.memberCount || 0) - 1);
        await classGroup.save();

        // Update user
        const user = await User.findById(userId);
        const userGroupIndex = user.classGroups.findIndex(
            cg => cg.group.toString() === classGroupId.toString()
        );

        if (userGroupIndex !== -1) {
            user.classGroups[userGroupIndex].isActive = false;
        }

        await user.save();

        return {
            success: true,
            message: `Successfully left ${classGroup.name}`,
            memberCount: classGroup.memberCount
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    autoAssignClassGroup,
    joinClassGroup,
    leaveClassGroup
};
