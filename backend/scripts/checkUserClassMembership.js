/**
 * Script to check user's class group membership
 * Specifically checking burgessglay12@gmail.com and Class of 2019/2020
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
require('dotenv').config();

const checkMembership = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find the user
        const user = await User.findOne({ email: 'burgessglay12@gmail.com' });
        if (!user) {
            console.log('❌ User not found with email: burgessglay12@gmail.com');
            return;
        }

        console.log('👤 USER INFORMATION:');
        console.log('='.repeat(60));
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`User ID: ${user._id}`);
        console.log(`Graduation Year: ${user.graduationYear}`);
        console.log(`Is Admin: ${user.isAdmin}`);
        console.log(`Class Groups (from user): ${JSON.stringify(user.classGroups, null, 2)}`);
        console.log('');

        // Find Class of 2019/2020
        const classGroup2019 = await ClassGroup.findOne({
            graduationYear: 2019
        }).populate('members.user', 'firstName lastName email graduationYear');

        const classGroup2020 = await ClassGroup.findOne({
            graduationYear: 2020
        }).populate('members.user', 'firstName lastName email graduationYear');

        console.log('🏫 CLASS GROUP 2019 INFORMATION:');
        console.log('='.repeat(60));
        if (classGroup2019) {
            console.log(`Name: ${classGroup2019.name}`);
            console.log(`ID: ${classGroup2019._id}`);
            console.log(`Graduation Year: ${classGroup2019.graduationYear}`);
            console.log(`Total Members: ${classGroup2019.members.length}`);
            console.log(`Member Count: ${classGroup2019.memberCount}`);

            // Check if user is in members array
            const userInMembers = classGroup2019.members.find(
                m => m.user && m.user._id.toString() === user._id.toString()
            );

            if (userInMembers) {
                console.log(`\n✅ User IS in members array:`);
                console.log(`   - Role: ${userInMembers.role}`);
                console.log(`   - Is Active: ${userInMembers.isActive}`);
                console.log(`   - Joined At: ${userInMembers.joinedAt}`);
            } else {
                console.log(`\n❌ User NOT in members array`);
            }

            console.log('\n📋 All Members:');
            classGroup2019.members.forEach((member, index) => {
                if (member.user) {
                    console.log(`   ${index + 1}. ${member.user.firstName} ${member.user.lastName} (${member.user.email})`);
                    console.log(`      - Active: ${member.isActive}, Role: ${member.role}`);
                } else {
                    console.log(`   ${index + 1}. [User reference missing] - Active: ${member.isActive}`);
                }
            });
        } else {
            console.log('❌ Class of 2019 not found');
        }

        console.log('\n🏫 CLASS GROUP 2020 INFORMATION:');
        console.log('='.repeat(60));
        if (classGroup2020) {
            console.log(`Name: ${classGroup2020.name}`);
            console.log(`ID: ${classGroup2020._id}`);
            console.log(`Graduation Year: ${classGroup2020.graduationYear}`);
            console.log(`Total Members: ${classGroup2020.members.length}`);
            console.log(`Member Count: ${classGroup2020.memberCount}`);

            // Check if user is in members array
            const userInMembers = classGroup2020.members.find(
                m => m.user && m.user._id.toString() === user._id.toString()
            );

            if (userInMembers) {
                console.log(`\n✅ User IS in members array:`);
                console.log(`   - Role: ${userInMembers.role}`);
                console.log(`   - Is Active: ${userInMembers.isActive}`);
                console.log(`   - Joined At: ${userInMembers.joinedAt}`);
            } else {
                console.log(`\n❌ User NOT in members array`);
            }

            console.log('\n📋 All Members:');
            classGroup2020.members.forEach((member, index) => {
                if (member.user) {
                    console.log(`   ${index + 1}. ${member.user.firstName} ${member.user.lastName} (${member.user.email})`);
                    console.log(`      - Active: ${member.isActive}, Role: ${member.role}`);
                } else {
                    console.log(`   ${index + 1}. [User reference missing] - Active: ${member.isActive}`);
                }
            });
        } else {
            console.log('❌ Class of 2020 not found');
        }

        // Check user's classGroups field
        console.log('\n🔗 USER\'S CLASS GROUPS FIELD:');
        console.log('='.repeat(60));
        if (user.classGroups && user.classGroups.length > 0) {
            for (const cgRef of user.classGroups) {
                const cg = await ClassGroup.findById(cgRef.group);
                if (cg) {
                    console.log(`✅ ${cg.name} (${cg.graduationYear})`);
                    console.log(`   - Is Admin: ${cgRef.isAdmin}`);
                    console.log(`   - Is Moderator: ${cgRef.isModerator}`);
                    console.log(`   - Is Active: ${cgRef.isActive}`);
                    console.log(`   - Joined: ${cgRef.joinDate}`);
                } else {
                    console.log(`❌ Class group reference ${cgRef.group} not found`);
                }
            }
        } else {
            console.log('❌ User has no class groups in their profile');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
};

checkMembership();
