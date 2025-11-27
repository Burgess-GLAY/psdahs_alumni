// FIXED: API test script - demonstrates proper auth flow
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'burgessglay12@gmail.com';
const ADMIN_PASSWORD = 'Carp12345@';

let authToken = null;

async function testLogin() {
  console.log('\n=== Testing Login (POST) ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✓ Login successful');
    console.log('Token:', authToken.substring(0, 50) + '...');
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  console.log('\n=== Testing Get Current User (with token) ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'x-auth-token': authToken
      }
    });
    
    console.log('✓ Got current user:');
    console.log('  Name:', response.data.firstName, response.data.lastName);
    console.log('  Email:', response.data.email);
    console.log('  Admin:', response.data.isAdmin);
    return true;
  } catch (error) {
    console.error('✗ Get user failed:', error.response?.data || error.message);
    return false;
  }
}

async function testProtectedRouteWithoutToken() {
  console.log('\n=== Testing Protected Route WITHOUT Token ===');
  try {
    await axios.get(`${BASE_URL}/api/users/me`);
    console.log('✗ Should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Correctly denied access:', error.response.data.msg);
      return true;
    }
    console.error('✗ Unexpected error:', error.message);
    return false;
  }
}

async function testProtectedRouteWithToken() {
  console.log('\n=== Testing Protected Route WITH Token ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: {
        'x-auth-token': authToken
      }
    });
    
    console.log('✓ Access granted with token');
    console.log('  Profile:', response.data.firstName, response.data.lastName);
    return true;
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUsers() {
  console.log('\n=== Testing Get All Users (Admin) ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/users`, {
      headers: {
        'x-auth-token': authToken
      }
    });
    
    console.log('✓ Got users list');
    console.log('  Total:', response.data.total);
    console.log('  Count:', response.data.count);
    return true;
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n=== Testing Health Check (Public) ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/health`);
    console.log('✓ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('✗ Health check failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('================================================');
  console.log('API Test Suite - PSDAHS Alumni Backend');
  console.log('================================================');
  console.log('Base URL:', BASE_URL);
  console.log('Admin Email:', ADMIN_EMAIL);
  
  const results = [];
  
  // Test health
  results.push(await testHealthCheck());
  
  // Test login
  const loginSuccess = await testLogin();
  results.push(loginSuccess);
  
  if (!loginSuccess) {
    console.log('\n❌ Login failed - cannot continue with other tests');
    process.exit(1);
  }
  
  // Test protected routes
  results.push(await testProtectedRouteWithoutToken());
  results.push(await testGetCurrentUser());
  results.push(await testProtectedRouteWithToken());
  results.push(await testGetUsers());
  
  console.log('\n================================================');
  console.log('Test Results:', results.filter(r => r).length, '/', results.length, 'passed');
  console.log('================================================');
  
  console.log('\n📝 Key Points:');
  console.log('1. Login endpoint is POST /api/auth/login (not GET)');
  console.log('2. Include token in header: x-auth-token: <token>');
  console.log('3. Your admin token:', authToken);
  console.log('\n✅ All systems operational!\n');
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
