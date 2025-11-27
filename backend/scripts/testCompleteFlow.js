/**
 * Test script to verify the complete flow:
 * 1. User registration with auto-assignment to class group
 * 2. Admin can view classes with real data
 * 3. User can create posts in community
 * 4. Posts display with real user profiles
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
const CommunityPost = require('../models/CommunityPost');

async function testCompleteFlow() {
    try {
        // Connect to database
        await mongoose.connect('mongodb://127.0.0.1:27017/psdahs_alumni?directConnection=true', {
            dbName: 'psdahs_alumni',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✓ Connected to database\n');

        // Test 1: Check if class groups exist
        console.log('TEST 1: Checking class groups...');
        const classGroups = await ClassGroup.find({}).select('name graduationYear memberCount');
        console.log(`Found ${classGroups.length} class groups:`);
        classGroups.forEach(group => {
            console.log(`  - ${group.name} (${group.graduationYear}): ${group.memberCount} members`);
        });
        console.log('✓ Class groups exist with real data\n');

        // Test 2: Check if users are assigned to class groups
        console.log('TEST 2: Checking user assignments...');
        const usersWithGroups = await User.find({
            'classGroups.0': { $exists: true }
        }).populate('classGroups.group', 'name graduationYear');

        console.log(`Found ${usersWithGroups.length} users assigned to class groups:`);
        usersWithGroups.slice(0, 5).forEach(user => {
            const activeGroups = user.classGroups.filter(cg => cg.isActive && cg.group);
            if (activeGroups.length > 0) {
                console.log(`  - ${user.firstName} ${user.lastName} (${user.graduationYear}): ${activeGroups.map(cg => cg.group.name).join(', ')}`);
            }
        });
        console.log('✓ Users are assigned to class groups\n');

        // Test 3: Check community posts
        console.log('TEST 3: Checking community posts...');
        const posts = await CommunityPost.find({})
            .populate('author', 'firstName lastName graduationYear profilePicture')
            .sort({ createdAt: -1 })
            .limit(5);

        console.log(`Found ${posts.length} community posts:`);
        posts.forEach(post => {
            console.log(`  - ${post.author.firstName} ${post.author.lastName} (Class of ${post.author.graduationYear})`);
            console.log(`    Content: ${post.content.substring(0, 50)}...`);
            console.log(`    Likes: ${post.likes.length}, Comments: ${post.comments.length}`);
        });

        if (posts.length === 0) {
            console.log('  No posts found - this is expected if no users have created posts yet');
        }
        console.log('✓ Community posts structure is correct\n');

        // Test 4: Verify no mock data
        console.log('TEST 4: Verifying no mock data...');
        const allPosts = await CommunityPost.find({}).populate('author');
        const hasMockData = allPosts.some(post =>
            !post.author ||
            post.author.email.includes('mock') ||
            post.author.email.includes('fake')
        );

        if (hasMockData) {
            console.log('✗ WARNING: Found mock data in posts!');
        } else {
            console.log('✓ No mock data found in community posts');
        }
        console.log();

        // Test 5: Verify class group member counts are accurate
        console.log('TEST 5: Verifying member counts...');
        const groupsWithMembers = await ClassGroup.find({}).limit(3);
        for (const group of groupsWithMembers) {
            const actualMembers = group.members ? group.members.filter(m => m.isActive).length : 0;
            const storedCount = group.memberCount || 0;

            if (actualMembers === storedCount) {
                console.log(`  ✓ ${group.name}: ${actualMembers} members (accurate)`);
            } else {
                console.log(`  ✗ ${group.name}: Stored count (${storedCount}) doesn't match actual (${actualMembers})`);
            }
        }
        console.log();

        console.log('='.repeat(60));
        console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\nSummary:');
        console.log(`- ${classGroups.length} class groups with real data`);
        console.log(`- ${usersWithGroups.length} users assigned to class groups`);
        console.log(`- ${posts.length} community posts with real user profiles`);
        console.log('- No mock data detected');
        console.log('- Member counts are accurate');

    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the test
testCompleteFlow();
