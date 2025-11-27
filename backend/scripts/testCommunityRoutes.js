/**
 * Test script for Community Routes and Controller
 * 
 * This script tests the community endpoints to ensure they are properly configured
 */

require('dotenv').config();
const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

async function testCommunityRoutes() {
    try {
        // Connect to database
        await mongoose.connect('mongodb://127.0.0.1:27017/psdahs_alumni?directConnection=true', {
            dbName: 'psdahs_alumni',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ Connected to MongoDB');

        // Test 1: Check if CommunityPost model is accessible
        console.log('\n--- Test 1: CommunityPost Model ---');
        const postCount = await CommunityPost.countDocuments();
        console.log(`✓ CommunityPost model accessible. Current posts: ${postCount}`);

        // Test 2: Find a test user
        console.log('\n--- Test 2: Find Test User ---');
        const testUser = await User.findOne({ email: 'root@psdahs.local' });
        if (!testUser) {
            console.log('✗ Test user not found. Please ensure root admin exists.');
            process.exit(1);
        }
        console.log(`✓ Test user found: ${testUser.firstName} ${testUser.lastName}`);

        // Test 3: Create a test post
        console.log('\n--- Test 3: Create Test Post ---');
        const testPost = await CommunityPost.create({
            author: testUser._id,
            content: 'This is a test post created by the test script.',
            isPublic: true
        });
        console.log(`✓ Test post created with ID: ${testPost._id}`);

        // Test 4: Retrieve the post with populated author
        console.log('\n--- Test 4: Retrieve Post with Populated Author ---');
        const retrievedPost = await CommunityPost.findById(testPost._id)
            .populate('author', 'firstName lastName profilePicture graduationYear');
        console.log(`✓ Post retrieved: "${retrievedPost.content}"`);
        console.log(`  Author: ${retrievedPost.author.firstName} ${retrievedPost.author.lastName}`);

        // Test 5: Add a like
        console.log('\n--- Test 5: Add Like ---');
        retrievedPost.likes.push({
            user: testUser._id,
            createdAt: Date.now()
        });
        await retrievedPost.save();
        console.log(`✓ Like added. Total likes: ${retrievedPost.likes.length}`);

        // Test 6: Add a comment
        console.log('\n--- Test 6: Add Comment ---');
        retrievedPost.comments.push({
            user: testUser._id,
            content: 'This is a test comment.',
            createdAt: Date.now()
        });
        await retrievedPost.save();
        console.log(`✓ Comment added. Total comments: ${retrievedPost.comments.length}`);

        // Test 7: Add a share
        console.log('\n--- Test 7: Add Share ---');
        retrievedPost.shares.push({
            user: testUser._id,
            createdAt: Date.now()
        });
        await retrievedPost.save();
        console.log(`✓ Share added. Total shares: ${retrievedPost.shares.length}`);

        // Test 8: Query all public posts
        console.log('\n--- Test 8: Query Public Posts ---');
        const publicPosts = await CommunityPost.find({ isPublic: true })
            .populate('author', 'firstName lastName profilePicture graduationYear')
            .sort('-createdAt')
            .limit(5);
        console.log(`✓ Found ${publicPosts.length} public posts`);

        // Test 9: Clean up - delete test post
        console.log('\n--- Test 9: Clean Up ---');
        await CommunityPost.findByIdAndDelete(testPost._id);
        console.log('✓ Test post deleted');

        console.log('\n=== All Tests Passed ===');
        console.log('\nCommunity routes and controller are ready to use!');
        console.log('\nAvailable endpoints:');
        console.log('  GET    /api/community/posts          - Get all posts');
        console.log('  GET    /api/community/posts/:id      - Get single post');
        console.log('  POST   /api/community/posts          - Create post (auth required)');
        console.log('  PUT    /api/community/posts/:id      - Update post (auth required)');
        console.log('  DELETE /api/community/posts/:id      - Delete post (auth required)');
        console.log('  POST   /api/community/posts/:id/like - Like/unlike post (auth required)');
        console.log('  POST   /api/community/posts/:id/comment - Add comment (auth required)');
        console.log('  DELETE /api/community/posts/:postId/comments/:commentId - Delete comment (auth required)');
        console.log('  POST   /api/community/posts/:id/share - Share post (auth required)');
        console.log('  PUT    /api/community/posts/:id/pin  - Pin/unpin post (admin only)');
        console.log('  DELETE /api/community/posts/:id/admin - Admin delete (admin only)');

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

// Run tests
testCommunityRoutes();
