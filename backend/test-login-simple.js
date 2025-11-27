// Simple login test
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Attempting login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'burgessglay12@gmail.com',
      password: 'Carp12345@'
    });
    
    console.log('SUCCESS!');
    console.log('Token:', response.data.token);
    console.log('\nUse this token in your requests:');
    console.log('x-auth-token:', response.data.token);
  } catch (error) {
    console.log('FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

testLogin();
