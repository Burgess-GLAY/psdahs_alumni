/**
 * Script to fix user's class group membership
 * Adds burgessglay12@gmail.com back to Class of 2019/2020
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
require('dotenv').config();

const fixMembership = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find the user
        const user = await User.findOne({ email: 'burgessglay12@gmail.com' });
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`   Graduation Year: ${user.graduationYear}`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Is Admin: ${user.isAdmin}\n`);

        // Find Class of 2020 (2019/20)
        const classGroup = await ClassGroup.findOne({ graduationYear: 2020 });
        if (!classGroup) {
            console.log('❌ Class of 2019/20 not found');
            return;
        }

        console.log(`🏫 Found class group: ${classGroup.name}`);
        console.log(`   Class Group ID: ${classGroup._id}`);
        console.log(`   Current member count: ${classGroup.memberCount}\n`);

        // Check if user is already a member
        const existingMember = classGroup.members.find(
            m => m.user && m.user.toString() === user._id.toString()
        );

        if (existingMember) {
            console.log('ℹ️  User is already a member of this class group');

            // Check if they're active
            if (!existingMember.isActive) {
                console.log('⚠️  But membership is inactive. Activating...');
                existingMember.isActive = true;
                await classGroup.save();
                console.log('✅ Membership activated');
            }
        } else {
            console.log('➕ Adding user to class group...');

            // Add user to class group members
            // Note: role can only be 'member' or 'moderator', not 'admin'
            classGroup.members.push({
                user: user._id,
                role: 'member',
                joinedAt: new Date(),
                isActive: true
            });

            // If user is admin, add them to admins array too
            if (user.isAdmin) {
                const isInAdmins = classGroup.admins.some(
                    adminId => adminId.toString() === user._id.toString()
                );

                if (!isInAdmins) {
                    classGroup.admins.push(user._id);
                    console.log('   ✅ Added to admins array');
                }
            }

            // Update member count
            classGroup.memberCount = classGroup.members.filter(m => m.isActive).length;

            await classGroup.save();
            console.log('✅ User added to class group');
            console.log(`   New member count: ${classGroup.memberCount}`);
        }

        // Update user's classGroups field
        console.log('\n🔗 Updating user\'s classGroups field...');

        // Remove old/invalid class group references
        const validClassGroups = [];
        for (const cg of user.classGroups) {
            if (cg.group && mongoose.Types.ObjectId.isValid(cg.group)) {
                // Check if this class group still exists
                const exists = await ClassGroup.findById(cg.group);
                if (exists) {
                    validClassGroups.push(cg);
                } else {
                    console.log(`   ⚠️  Removing invalid reference: ${cg.group}`);
                }
            }
        }

        user.classGroups = validClassGroups;

        // Check if this class group is already in user's list
        const hasClassGroup = user.classGroups.some(
            cg => cg.group && cg.group.toString() === classGroup._id.toString()
        );

        if (!hasClassGroup) {
            user.classGroups.push({
                group: classGroup._id,
                joinDate: new Date(),
                isAdmin: user.isAdmin,
                isModerator: false,
                isActive: true
            });
            console.log('✅ Added class group to user profile');
        } else {
            console.log('ℹ️  Class group already in user profile');
        }

        await user.save();

        console.log('\n✅ MEMBERSHIP FIXED!');
        console.log('='.repeat(60));
        console.log(`User: ${user.firstName} ${user.lastName}`);
        console.log(`Class Group: ${classGroup.name}`);
        console.log(`Member Role: member`);
        console.log(`Is Admin: ${user.isAdmin ? 'Yes (in admins array)' : 'No'}`);
        console.log(`Active: true`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
};

fixMembership();
