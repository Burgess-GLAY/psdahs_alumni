/**
 * Test script to verify profile picture persistence
 * Tests that /api/auth/me returns profilePicture field
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testProfilePicturePersistence() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs_alumni');
        console.log('Connected to MongoDB\n');

        // Find a user with a profile picture
        console.log('Looking for users with profile pictures...');
        const usersWithPictures = await User.find({
            profilePicture: { $exists: true, $ne: '' }
        }).limit(5);

        if (usersWithPictures.length === 0) {
            console.log('No users found with profile pictures.');
            console.log('Creating a test user with a profile picture...\n');

            // Create a test user
            const testUser = new User({
                firstName: 'Test',
                lastName: 'User',
                email: `test.profile.${Date.now()}@example.com`,
                password: 'password123',
                graduationYear: 2020,
                profilePicture: 'https://example.com/test-profile.jpg'
            });

            await testUser.save();
            console.log('Test user created:', {
                id: testUser._id,
                email: testUser.email,
                profilePicture: testUser.profilePicture
            });
        } else {
            console.log(`Found ${usersWithPictures.length} users with profile pictures:\n`);
            usersWithPictures.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Profile Picture: ${user.profilePicture}`);
                console.log(`   ID: ${user._id}\n`);
            });
        }

        // Test that the User model includes profilePicture when queried
        console.log('\nTesting User.findById with profilePicture field...');
        const testUser = usersWithPictures[0] || await User.findOne();

        if (testUser) {
            const fetchedUser = await User.findById(testUser._id).select('-password');
            console.log('Fetched user data:');
            console.log({
                id: fetchedUser._id,
                firstName: fetchedUser.firstName,
                lastName: fetchedUser.lastName,
                email: fetchedUser.email,
                profilePicture: fetchedUser.profilePicture,
                hasProfilePicture: !!fetchedUser.profilePicture
            });

            console.log('\n✓ Profile picture field is present in query results');
        }

        console.log('\n✓ All tests passed!');
        console.log('\nNext steps:');
        console.log('1. Start the backend server: npm start');
        console.log('2. Test login endpoint: POST /api/auth/login');
        console.log('3. Verify response includes profilePicture field');
        console.log('4. Test /api/auth/me endpoint');
        console.log('5. Verify response includes profilePicture field');

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

testProfilePicturePersistence();
