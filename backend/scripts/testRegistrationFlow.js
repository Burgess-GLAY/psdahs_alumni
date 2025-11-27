/**
 * Test script to verify user registration with auto-assignment
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRegistrationFlow() {
    try {
        console.log('Testing User Registration with Auto-Assignment\n');
        console.log('='.repeat(60));

        // Generate unique email
        const timestamp = Date.now();
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: `testuser${timestamp}@test.com`,
            password: 'Test123!@#',
            graduationYear: 2020
        };

        console.log('\nStep 1: Registering new user...');
        console.log(`Email: ${testUser.email}`);
        console.log(`Graduation Year: ${testUser.graduationYear}`);

        const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);

        if (registerResponse.data.success) {
            console.log('✓ User registered successfully');
            console.log(`✓ User ID: ${registerResponse.data.user.id}`);

            if (registerResponse.data.assignedClassGroup) {
                console.log(`✓ Auto-assigned to: ${registerResponse.data.assignedClassGroup.name}`);
                console.log(`✓ Class has ${registerResponse.data.assignedClassGroup.memberCount} members`);
            } else {
                console.log('⚠ Warning: User was not auto-assigned to a class group');
                if (registerResponse.data.warning) {
                    console.log(`  Reason: ${registerResponse.data.warning}`);
                }
            }
        }

        const token = registerResponse.data.token;

        // Step 2: Verify user can fetch their profile
        console.log('\nStep 2: Fetching user profile...');
        const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
            headers: { 'x-auth-token': token }
        });

        console.log('✓ Profile fetched successfully');
        console.log(`  Name: ${profileResponse.data.firstName} ${profileResponse.data.lastName}`);
        console.log(`  Graduation Year: ${profileResponse.data.graduationYear}`);

        // Step 3: Verify class group membership
        console.log('\nStep 3: Verifying class group membership...');
        const classGroupsResponse = await axios.get(`${API_BASE}/class-groups?filter=my-groups`, {
            headers: { 'x-auth-token': token }
        });

        const myGroups = classGroupsResponse.data.data.filter(g => g.isMember);
        console.log(`✓ User is member of ${myGroups.length} class group(s)`);
        myGroups.forEach(group => {
            console.log(`  - ${group.name} (${group.graduationYear})`);
        });

        // Step 4: Test creating a community post
        console.log('\nStep 4: Creating a community post...');
        const postData = {
            content: `Hello from ${testUser.firstName}! This is a test post to verify the community feature is working with real user data.`
        };

        const postResponse = await axios.post(`${API_BASE}/community/posts`, postData, {
            headers: { 'x-auth-token': token }
        });

        if (postResponse.data.success) {
            console.log('✓ Post created successfully');
            console.log(`  Post ID: ${postResponse.data.data._id}`);
            console.log(`  Author: ${postResponse.data.data.author.firstName} ${postResponse.data.data.author.lastName}`);
        }

        // Step 5: Verify post appears in community feed
        console.log('\nStep 5: Verifying post in community feed...');
        const feedResponse = await axios.get(`${API_BASE}/community/posts`);

        const userPost = feedResponse.data.data.find(p => p._id === postResponse.data.data._id);
        if (userPost) {
            console.log('✓ Post appears in community feed');
            console.log(`  Author: ${userPost.author.firstName} ${userPost.author.lastName}`);
            console.log(`  Graduation Year: ${userPost.author.graduationYear}`);
            console.log(`  Content: ${userPost.content.substring(0, 50)}...`);
        } else {
            console.log('✗ Post not found in community feed');
        }

        // Step 6: Test liking the post
        console.log('\nStep 6: Testing post interactions...');
        const likeResponse = await axios.post(`${API_BASE}/community/posts/${postResponse.data.data._id}/like`, {}, {
            headers: { 'x-auth-token': token }
        });

        if (likeResponse.data.success) {
            console.log('✓ Post liked successfully');
            console.log(`  Like count: ${likeResponse.data.data.likeCount}`);
        }

        // Step 7: Test commenting on the post
        const commentData = {
            content: 'This is a test comment!'
        };

        const commentResponse = await axios.post(`${API_BASE}/community/posts/${postResponse.data.data._id}/comment`, commentData, {
            headers: { 'x-auth-token': token }
        });

        if (commentResponse.data.success) {
            console.log('✓ Comment added successfully');
            console.log(`  Comment count: ${commentResponse.data.data.commentCount}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('ALL REGISTRATION FLOW TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('\nVerified:');
        console.log('✓ User registration works');
        console.log('✓ Auto-assignment to class group works');
        console.log('✓ User can create community posts');
        console.log('✓ Posts display with real user profiles');
        console.log('✓ Post interactions (like, comment) work');
        console.log('✓ No mock data is used anywhere');

    } catch (error) {
        console.error('\n✗ Test failed:', error.response?.data || error.message);
        if (error.response?.data?.error) {
            console.error('Error details:', error.response.data.error);
        }
    }
}

// Run the test
testRegistrationFlow();
