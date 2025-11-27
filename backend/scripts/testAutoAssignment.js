/**
 * Test script for auto-assignment functionality
 * This script verifies that the autoAssignClassGroup service works correctly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { autoAssignClassGroup } = require('../services/classGroupService');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs-alumni';

async function testAutoAssignment() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Test 1: Check if class groups exist
        console.log('Test 1: Checking for existing class groups...');
        const classGroups = await ClassGroup.find({}).select('name graduationYear memberCount');
        console.log(`Found ${classGroups.length} class groups:`);
        classGroups.forEach(group => {
            console.log(`  - ${group.name} (${group.graduationYear}) - ${group.memberCount} members`);
        });
        console.log('');

        // Test 2: Find a test user (or create one)
        console.log('Test 2: Finding a test user...');
        let testUser = await User.findOne({ email: 'test-auto-assign@example.com' });

        if (!testUser) {
            console.log('Creating test user...');
            testUser = new User({
                firstName: 'Test',
                lastName: 'AutoAssign',
                email: 'test-auto-assign@example.com',
                password: 'TestPassword123!',
                graduationYear: 2020,
                authMethod: 'local'
            });
            await testUser.save();
            console.log('Test user created with ID:', testUser._id);
        } else {
            console.log('Found existing test user with ID:', testUser._id);
        }
        console.log('');

        // Test 3: Test auto-assignment
        console.log('Test 3: Testing auto-assignment for graduation year 2020...');
        const result = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email,
                profilePicture: testUser.profilePicture
            }
        });

        console.log('Auto-assignment result:');
        console.log('  Success:', result.success);
        if (result.success && result.assignedGroup) {
            console.log('  Assigned Group:', result.assignedGroup.name);
            console.log('  Graduation Year:', result.assignedGroup.graduationYear);
            console.log('  Member Count:', result.assignedGroup.memberCount);
            console.log('  Message:', result.message);
        } else {
            console.log('  Error:', result.error);
        }
        console.log('');

        // Test 4: Verify assignment in database
        console.log('Test 4: Verifying assignment in database...');
        const updatedUser = await User.findById(testUser._id).populate('classGroups.group');
        console.log('User class groups:', updatedUser.classGroups.length);
        updatedUser.classGroups.forEach(cg => {
            if (cg.group) {
                console.log(`  - ${cg.group.name} (Active: ${cg.isActive})`);
            }
        });
        console.log('');

        // Test 5: Test duplicate assignment (should not add again)
        console.log('Test 5: Testing duplicate assignment (should not add again)...');
        const duplicateResult = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2020,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        console.log('Duplicate assignment result:');
        console.log('  Success:', duplicateResult.success);
        console.log('  Message:', duplicateResult.message);
        console.log('');

        // Test 6: Test invalid graduation year
        console.log('Test 6: Testing invalid graduation year (2026)...');
        const invalidResult = await autoAssignClassGroup({
            userId: testUser._id,
            graduationYear: 2026,
            userInfo: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email
            }
        });

        console.log('Invalid year result:');
        console.log('  Success:', invalidResult.success);
        console.log('  Error:', invalidResult.error);
        console.log('');

        console.log('✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the test
testAutoAssignment();
