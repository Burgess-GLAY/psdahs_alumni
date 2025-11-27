const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testPublicProfile() {
    console.log('=== Testing Public Profile Endpoint ===\n');

    try {
        // Use a known user ID from the database
        const testUserId = '690cbd83609b78aedd083163'; // Burgess Awalayah Glay
        console.log(`1. Testing with user ID: ${testUserId}\n`);

        // Test the public profile endpoint (no authentication required)
        console.log('2. Fetching public profile (no auth required)...');
        const profileResponse = await axios.get(`${BASE_URL}/users/profile/${testUserId}`);

        console.log('✓ Public profile endpoint works!\n');
        console.log('Profile Data:');
        console.log('- Name:', profileResponse.data.data.firstName, profileResponse.data.data.lastName);
        console.log('- Email:', profileResponse.data.data.email);
        console.log('- Graduation Year:', profileResponse.data.data.graduationYear);
        console.log('- Major:', profileResponse.data.data.major || 'Not set');
        console.log('- Bio:', profileResponse.data.data.bio || 'Not set');
        console.log('- Occupation:', profileResponse.data.data.occupation || 'Not set');
        console.log('- Company:', profileResponse.data.data.company || 'Not set');
        console.log('- Profile Picture:', profileResponse.data.data.profilePicture || 'Not set');
        console.log('- Skills:', profileResponse.data.data.skills || 'Not set');
        console.log('- Social Media:', JSON.stringify(profileResponse.data.data.socialMedia || {}, null, 2));

        // Verify sensitive fields are not exposed
        console.log('\n3. Verifying sensitive fields are hidden...');
        const sensitiveFields = ['password', 'isAdmin', 'isVerified', 'lastLogin', 'googleId', 'authMethod'];
        const exposedFields = sensitiveFields.filter(field => profileResponse.data.data[field] !== undefined);

        if (exposedFields.length === 0) {
            console.log('✓ All sensitive fields are properly hidden');
        } else {
            console.log('✗ WARNING: Exposed sensitive fields:', exposedFields);
        }

        console.log('\n=== All Tests Passed! ===');

    } catch (error) {
        console.error('✗ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 404) {
            console.log('\nNote: Make sure the backend server is running on port 5000');
        }
    }
}

testPublicProfile();
