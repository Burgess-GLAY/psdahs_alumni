const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
require('dotenv').config();

async function testCommunityPostModel() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find or create a test user
        let testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            testUser = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'testpassword123',
                graduationYear: 2020
            });
            console.log('✓ Created test user');
        } else {
            console.log('✓ Found existing test user');
        }

        // Test 1: Create a post
        console.log('\n--- Test 1: Create Post ---');
        const post = await CommunityPost.create({
            author: testUser._id,
            content: 'This is a test post for the community!',
            isPublic: true
        });
        console.log('✓ Post created:', post._id);
        console.log('  Content:', post.content);
        console.log('  Author:', post.author);

        // Test 2: Add a like
        console.log('\n--- Test 2: Add Like ---');
        await post.addLike(testUser._id);
        console.log('✓ Like added');
        console.log('  Like count:', post.likeCount);
        console.log('  Is liked by user:', post.isLikedBy(testUser._id));

        // Test 3: Add a comment
        console.log('\n--- Test 3: Add Comment ---');
        await post.addComment(testUser._id, 'Great post!');
        console.log('✓ Comment added');
        console.log('  Comment count:', post.commentCount);

        // Test 4: Add a share
        console.log('\n--- Test 4: Add Share ---');
        await post.addShare(testUser._id);
        console.log('✓ Share added');
        console.log('  Share count:', post.shareCount);

        // Test 5: Fetch with population
        console.log('\n--- Test 5: Fetch with Population ---');
        const populatedPost = await CommunityPost.findById(post._id)
            .populate('author', 'firstName lastName email graduationYear')
            .populate('likes.user', 'firstName lastName')
            .populate('comments.user', 'firstName lastName');
        console.log('✓ Post fetched with population');
        console.log('  Author name:', populatedPost.author.firstName, populatedPost.author.lastName);
        console.log('  Likes:', populatedPost.likes.length);
        console.log('  Comments:', populatedPost.comments.length);
        console.log('  Shares:', populatedPost.shares.length);

        // Test 6: Test pagination
        console.log('\n--- Test 6: Test Pagination ---');
        const result = await CommunityPost.getPaginated({
            page: 1,
            limit: 10,
            isPublic: true
        });
        console.log('✓ Pagination works');
        console.log('  Total posts:', result.pagination.total);
        console.log('  Current page:', result.pagination.page);
        console.log('  Total pages:', result.pagination.pages);

        // Test 7: Test indexes
        console.log('\n--- Test 7: Verify Indexes ---');
        const indexes = await CommunityPost.collection.getIndexes();
        console.log('✓ Indexes found:');
        Object.keys(indexes).forEach(indexName => {
            console.log('  -', indexName);
        });

        // Test 8: Remove like
        console.log('\n--- Test 8: Remove Like ---');
        await post.removeLike(testUser._id);
        console.log('✓ Like removed');
        console.log('  Like count:', post.likeCount);

        // Test 9: Remove comment
        console.log('\n--- Test 9: Remove Comment ---');
        const commentId = post.comments[0]._id;
        await post.removeComment(commentId);
        console.log('✓ Comment removed');
        console.log('  Comment count:', post.commentCount);

        // Cleanup
        console.log('\n--- Cleanup ---');
        await CommunityPost.findByIdAndDelete(post._id);
        console.log('✓ Test post deleted');

        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testCommunityPostModel();
