/**
 * Test script for joining class groups
 * Tests the POST /api/class-groups/:id/join endpoint
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs-alumni';

async function testJoinClassGroup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find a test user (not admin)
        const testUser = await User.findOne({ isAdmin: false }).limit(1);

        if (!testUser) {
            console.log('❌ No test user found. Please create a user first.');
            return;
        }

        console.log(`Test User: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
        console.log(`Graduation Year: ${testUser.graduationYear}`);
        console.log(`Current Class Groups: ${testUser.classGroups.length}\n`);

        // Find a class group the user is NOT a member of
        const allGroups = await ClassGroup.find({});
        const userGroupIds = testUser.classGroups
            .filter(cg => cg.isActive)
            .map(cg => cg.group.toString());

        const availableGroup = allGroups.find(
            group => !userGroupIds.includes(group._id.toString())
        );

        if (!availableGroup) {
            console.log('❌ No available class groups to join. User is already in all groups.');
            return;
        }

        console.log(`Target Class Group: ${availableGroup.name}`);
        console.log(`Graduation Year: ${availableGroup.graduationYear}`);
        console.log(`Current Member Count: ${availableGroup.memberCount}\n`);

        // Test 1: Join the class group
        console.log('TEST 1: Joining class group...');
        const classGroupService = require('../services/classGroupService');

        const result = await classGroupService.joinClassGroup(
            testUser._id.toString(),
            availableGroup._id.toString()
        );

        if (result.success) {
            console.log('✅ Successfully joined class group');
            console.log(`   Message: ${result.message}`);
            console.log(`   New Member Count: ${result.classGroup.memberCount}\n`);
        } else {
            console.log(`❌ Failed to join: ${result.error}\n`);
            return;
        }

        // Verify the changes
        console.log('VERIFICATION: Checking database changes...');

        const updatedGroup = await ClassGroup.findById(availableGroup._id);
        const updatedUser = await User.findById(testUser._id);

        // Check class group
        const memberInGroup = updatedGroup.members.find(
            m => m.user.toString() === testUser._id.toString() && m.isActive
        );

        if (memberInGroup) {
            console.log('✅ User found in class group members array');
            console.log(`   Joined At: ${memberInGroup.joinedAt}`);
            console.log(`   Role: ${memberInGroup.role}`);
            console.log(`   Is Active: ${memberInGroup.isActive}`);
        } else {
            console.log('❌ User NOT found in class group members array');
        }

        // Check member count
        if (updatedGroup.memberCount === availableGroup.memberCount + 1) {
            console.log(`✅ Member count incremented correctly: ${updatedGroup.memberCount}`);
        } else {
            console.log(`❌ Member count incorrect: Expected ${availableGroup.memberCount + 1}, Got ${updatedGroup.memberCount}`);
        }

        // Check user's classGroups array
        const groupInUser = updatedUser.classGroups.find(
            cg => cg.group.toString() === availableGroup._id.toString() && cg.isActive
        );

        if (groupInUser) {
            console.log('✅ Class group found in user\'s classGroups array');
            console.log(`   Join Date: ${groupInUser.joinDate}`);
            console.log(`   Is Active: ${groupInUser.isActive}`);
        } else {
            console.log('❌ Class group NOT found in user\'s classGroups array');
        }

        console.log('\n');

        // Test 2: Try to join the same group again (should fail)
        console.log('TEST 2: Attempting to join the same group again (should fail)...');

        const duplicateResult = await classGroupService.joinClassGroup(
            testUser._id.toString(),
            availableGroup._id.toString()
        );

        if (!duplicateResult.success && duplicateResult.code === 'ALREADY_MEMBER') {
            console.log('✅ Correctly prevented duplicate join');
            console.log(`   Error: ${duplicateResult.error}\n`);
        } else {
            console.log('❌ Should have prevented duplicate join\n');
        }

        // Test 3: Verify member count didn't change
        const finalGroup = await ClassGroup.findById(availableGroup._id);
        if (finalGroup.memberCount === updatedGroup.memberCount) {
            console.log('✅ Member count remained unchanged after duplicate attempt');
            console.log(`   Member Count: ${finalGroup.memberCount}\n`);
        } else {
            console.log('❌ Member count changed unexpectedly\n');
        }

        console.log('='.repeat(60));
        console.log('ALL TESTS COMPLETED');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the test
testJoinClassGroup();
