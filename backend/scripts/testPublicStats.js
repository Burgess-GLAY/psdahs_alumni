const axios = require('axios');

async function testPublicStats() {
    try {
        console.log('Testing public stats endpoint...');
        const response = await axios.get('http://localhost:5000/api/users/public-stats');
        console.log('Success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

testPublicStats();
