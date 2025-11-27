// Test script to verify backend User model role handling
// This tests that isAdmin field is returned correctly in all auth endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test credentials
const ADMIN_CREDENTIALS = {
    email: 'burgessglay12@gmail.com',
    password: 'Carp12345@'
};

const TEST_USER_CREDENTIALS = {
    email: `test_user_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    graduationYear: 2020
};

let adminToken = null;
let testUserToken = null;

// Helper function to derive role from user data (matches frontend logic)
const getUserRole = (user) => {
    if (!user) return 'guest';
    return user.isAdmin ? 'admin' : 'user';
};

// Helper function to validate user response structure
const validateUserResponse = (user, expectedRole) => {
    const checks = {
        hasId: !!user.id || !!user._id,
        hasEmail: !!user.email,
        hasFirstName: !!user.firstName,
        hasLastName: !!user.lastName,
        hasIsAdminField: user.hasOwnProperty('isAdmin'),
        isAdminIsBoolean: typeof user.isAdmin === 'boolean',
        derivedRole: getUserRole(user),
        roleMatches: getUserRole(user) === expectedRole
    };

    return checks;
};

async function testAdminLogin() {
    console.log('\n=== Test 1: Admin Login ===');
    console.log('Testing that admin user login returns isAdmin: true');

    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);

        const { token, user } = response.data;
        adminToken = token;

        console.log('✓ Login successful');
        console.log('Response structure:', {
            hasToken: !!token,
            hasUser: !!user,
            userFields: Object.keys(user)
        });

        const validation = validateUserResponse(user, 'admin');
        console.log('User validation:', validation);

        if (!validation.hasIsAdminField) {
            console.error('✗ FAIL: isAdmin field is missing from response');
            return false;
        }

        if (!validation.isAdminIsBoolean) {
            console.error('✗ FAIL: isAdmin is not a boolean');
            return false;
        }

        if (user.isAdmin !== true) {
            console.error('✗ FAIL: Expected isAdmin to be true for admin user');
            return false;
        }

        if (!validation.roleMatches) {
            console.error(`✗ FAIL: Derived role "${validation.derivedRole}" does not match expected "admin"`);
            return false;
        }

        console.log('✓ PASS: Admin user has isAdmin: true');
        console.log('✓ PASS: Role correctly derived as "admin"');
        return true;

    } catch (error) {
        console.error('✗ FAIL: Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function testAdminGetMe() {
    console.log('\n=== Test 2: Admin Get Current User (/api/auth/me) ===');
    console.log('Testing that /api/auth/me returns isAdmin field for admin');

    try {
        const response = await axios.get(`${BASE_URL}/api/auth/me`, {
            headers: { 'x-auth-token': adminToken }
        });

        const user = response.data;

        console.log('✓ Request successful');
        console.log('User fields:', Object.keys(user));

        const validation = validateUserResponse(user, 'admin');
        console.log('User validation:', validation);

        if (!validation.hasIsAdminField) {
            console.error('✗ FAIL: isAdmin field is missing from /api/auth/me response');
            return false;
        }

        if (user.isAdmin !== true) {
            console.error('✗ FAIL: Expected isAdmin to be true');
            return false;
        }

        if (!validation.roleMatches) {
            console.error(`✗ FAIL: Derived role "${validation.derivedRole}" does not match expected "admin"`);
            return false;
        }

        console.log('✓ PASS: /api/auth/me returns isAdmin: true for admin');
        console.log('✓ PASS: Role correctly derived as "admin"');
        return true;

    } catch (error) {
        console.error('✗ FAIL: Request failed:', error.response?.data || error.message);
        return false;
    }
}

async function testRegularUserRegistration() {
    console.log('\n=== Test 3: Regular User Registration ===');
    console.log('Testing that new user registration returns isAdmin: false');

    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER_CREDENTIALS);

        const { token, user } = response.data;
        testUserToken = token;

        console.log('✓ Registration successful');
        console.log('Response structure:', {
            hasToken: !!token,
            hasUser: !!user,
            userFields: Object.keys(user)
        });

        const validation = validateUserResponse(user, 'user');
        console.log('User validation:', validation);

        if (!validation.hasIsAdminField) {
            console.error('✗ FAIL: isAdmin field is missing from registration response');
            return false;
        }

        if (!validation.isAdminIsBoolean) {
            console.error('✗ FAIL: isAdmin is not a boolean');
            return false;
        }

        if (user.isAdmin !== false) {
            console.error('✗ FAIL: Expected isAdmin to be false for regular user');
            return false;
        }

        if (!validation.roleMatches) {
            console.error(`✗ FAIL: Derived role "${validation.derivedRole}" does not match expected "user"`);
            return false;
        }

        console.log('✓ PASS: Regular user has isAdmin: false');
        console.log('✓ PASS: Role correctly derived as "user"');
        return true;

    } catch (error) {
        console.error('✗ FAIL: Registration failed:', error.response?.data || error.message);
        return false;
    }
}

async function testRegularUserGetMe() {
    console.log('\n=== Test 4: Regular User Get Current User (/api/auth/me) ===');
    console.log('Testing that /api/auth/me returns isAdmin: false for regular user');

    try {
        const response = await axios.get(`${BASE_URL}/api/auth/me`, {
            headers: { 'x-auth-token': testUserToken }
        });

        const user = response.data;

        console.log('✓ Request successful');
        console.log('User fields:', Object.keys(user));

        const validation = validateUserResponse(user, 'user');
        console.log('User validation:', validation);

        if (!validation.hasIsAdminField) {
            console.error('✗ FAIL: isAdmin field is missing from /api/auth/me response');
            return false;
        }

        if (user.isAdmin !== false) {
            console.error('✗ FAIL: Expected isAdmin to be false');
            return false;
        }

        if (!validation.roleMatches) {
            console.error(`✗ FAIL: Derived role "${validation.derivedRole}" does not match expected "user"`);
            return false;
        }

        console.log('✓ PASS: /api/auth/me returns isAdmin: false for regular user');
        console.log('✓ PASS: Role correctly derived as "user"');
        return true;

    } catch (error) {
        console.error('✗ FAIL: Request failed:', error.response?.data || error.message);
        return false;
    }
}

async function testRoleDerivationLogic() {
    console.log('\n=== Test 5: Frontend Role Derivation Logic ===');
    console.log('Testing the getUserRole() function with various inputs');

    const testCases = [
        { input: null, expected: 'guest', description: 'null user' },
        { input: undefined, expected: 'guest', description: 'undefined user' },
        { input: { isAdmin: false }, expected: 'user', description: 'regular user' },
        { input: { isAdmin: true }, expected: 'admin', description: 'admin user' },
        { input: { isAdmin: false, email: 'test@example.com' }, expected: 'user', description: 'user with email' },
        { input: { isAdmin: true, email: 'admin@example.com' }, expected: 'admin', description: 'admin with email' },
    ];

    let allPassed = true;

    for (const testCase of testCases) {
        const result = getUserRole(testCase.input);
        const passed = result === testCase.expected;

        if (passed) {
            console.log(`✓ PASS: ${testCase.description} -> "${result}"`);
        } else {
            console.error(`✗ FAIL: ${testCase.description} -> expected "${testCase.expected}", got "${result}"`);
            allPassed = false;
        }
    }

    return allPassed;
}

async function runTests() {
    console.log('========================================================');
    console.log('Backend User Model Role Handling Test Suite');
    console.log('========================================================');
    console.log('Base URL:', BASE_URL);
    console.log('Testing that backend returns isAdmin field correctly');
    console.log('Testing that frontend can derive role from isAdmin');
    console.log('========================================================\n');

    const results = [];

    // Test admin user
    results.push(await testAdminLogin());
    if (adminToken) {
        results.push(await testAdminGetMe());
    }

    // Test regular user
    results.push(await testRegularUserRegistration());
    if (testUserToken) {
        results.push(await testRegularUserGetMe());
    }

    // Test role derivation logic
    results.push(await testRoleDerivationLogic());

    console.log('\n========================================================');
    console.log('Test Results Summary');
    console.log('========================================================');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('\n✅ ALL TESTS PASSED');
        console.log('\nVerification Complete:');
        console.log('✓ Backend returns isAdmin field correctly in login response');
        console.log('✓ Backend returns isAdmin field correctly in /api/auth/me');
        console.log('✓ Backend returns isAdmin field correctly in registration response');
        console.log('✓ Frontend can derive role from isAdmin (guest/user/admin)');
        console.log('✓ Role derivation logic handles all edge cases');
    } else {
        console.log('\n❌ SOME TESTS FAILED');
        console.log('Please review the failures above');
    }

    console.log('========================================================\n');

    process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
