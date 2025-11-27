/**
 * Test script to verify login and /api/auth/me return profilePicture
 * This simulates the full login flow
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test user credentials (use the user we found in the database)
const TEST_USER = {
    email: 'burgessglay12@gmail.com',
    password: 'Carp12345@'
};

async function testLoginFlow() {
    console.log('Testing Profile Picture Persistence Flow\n');
    console.log('='.repeat(50));

    try {
        // Step 1: Login
        console.log('\n1. Testing Login Endpoint');
        console.log(`   POST ${API_URL}/api/auth/login`);
        console.log(`   Email: ${TEST_USER.email}`);

        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });

        console.log('\n   ✓ Login successful!');
        console.log('   Response data:');
        console.log('   - Has token:', !!loginResponse.data.token);
        console.log('   - Has user:', !!loginResponse.data.user);
        console.log('   - User ID:', loginResponse.data.user?.id);
        console.log('   - User email:', loginResponse.data.user?.email);
        console.log('   - User firstName:', loginResponse.data.user?.firstName);
        console.log('   - User lastName:', loginResponse.data.user?.lastName);
        console.log('   - Has profilePicture:', !!loginResponse.data.user?.profilePicture);
        console.log('   - ProfilePicture value:', loginResponse.data.user?.profilePicture);

        if (!loginResponse.data.user?.profilePicture) {
            console.log('\n   ⚠ WARNING: profilePicture is missing from login response!');
        } else {
            console.log('\n   ✓ profilePicture is present in login response');
        }

        const token = loginResponse.data.token;

        // Step 2: Test /api/auth/me
        console.log('\n2. Testing /api/auth/me Endpoint');
        console.log(`   GET ${API_URL}/api/auth/me`);
        console.log('   x-auth-token: [token]');

        const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
                'x-auth-token': token
            }
        });

        console.log('\n   ✓ /api/auth/me successful!');
        console.log('   Response data:');
        console.log('   - User ID:', meResponse.data._id);
        console.log('   - User email:', meResponse.data.email);
        console.log('   - User firstName:', meResponse.data.firstName);
        console.log('   - User lastName:', meResponse.data.lastName);
        console.log('   - Has profilePicture:', !!meResponse.data.profilePicture);
        console.log('   - ProfilePicture value:', meResponse.data.profilePicture);

        if (!meResponse.data.profilePicture) {
            console.log('\n   ⚠ WARNING: profilePicture is missing from /api/auth/me response!');
        } else {
            console.log('\n   ✓ profilePicture is present in /api/auth/me response');
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('TEST SUMMARY');
        console.log('='.repeat(50));

        const loginHasProfilePicture = !!loginResponse.data.user?.profilePicture;
        const meHasProfilePicture = !!meResponse.data.profilePicture;

        if (loginHasProfilePicture && meHasProfilePicture) {
            console.log('\n✓ ALL TESTS PASSED!');
            console.log('  - Login endpoint returns profilePicture');
            console.log('  - /api/auth/me endpoint returns profilePicture');
            console.log('\nProfile picture persistence should work correctly.');
        } else {
            console.log('\n✗ TESTS FAILED!');
            if (!loginHasProfilePicture) {
                console.log('  - Login endpoint does NOT return profilePicture');
            }
            if (!meHasProfilePicture) {
                console.log('  - /api/auth/me endpoint does NOT return profilePicture');
            }
        }

    } catch (error) {
        console.error('\n✗ Error during test:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Message:', error.message);
        }
        console.error('\nMake sure:');
        console.error('1. Backend server is running (npm start in backend directory)');
        console.error('2. MongoDB is running');
        console.error('3. Test user credentials are correct');
    }
}

// Run the test
console.log('Starting test...');
console.log('Note: Make sure the backend server is running!\n');

testLoginFlow();
