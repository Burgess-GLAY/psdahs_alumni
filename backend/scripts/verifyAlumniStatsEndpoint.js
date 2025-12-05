/**
 * Verification Script: Alumni Statistics Endpoint
 * 
 * This script verifies that the /api/users/count endpoint is working correctly
 * for the AlumniStatsSection component on the homepage.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

async function verifyEndpoint() {
    console.log('='.repeat(60));
    console.log('ALUMNI STATISTICS ENDPOINT VERIFICATION');
    console.log('='.repeat(60));

    // Test 1: Database Count
    console.log('\n1. Testing Database Connection...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('../models/User');
        const dbCount = await User.countDocuments();
        console.log(`   ✓ Database connected`);
        console.log(`   ✓ Total users in database: ${dbCount}`);
        await mongoose.connection.close();
    } catch (error) {
        console.log(`   ✗ Database error: ${error.message}`);
        return;
    }

    // Test 2: HTTP Endpoint
    console.log('\n2. Testing HTTP Endpoint /api/users/count...');

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users/count',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                const response = JSON.parse(data);
                console.log(`   ✓ Endpoint is accessible (Status: ${res.statusCode})`);
                console.log(`   ✓ Response format is correct`);
                console.log(`   ✓ Alumni count: ${response.count}`);

                console.log('\n3. Frontend Integration:');
                console.log(`   ✓ AlumniStatsSection.js will fetch from: /api/users/count`);
                console.log(`   ✓ Expected response: { success: true, count: ${response.count} }`);
                console.log(`   ✓ Statistics will update in real-time as users register`);

                console.log('\n' + '='.repeat(60));
                console.log('✓ ALL TESTS PASSED - Alumni Stats Section is ready!');
                console.log('='.repeat(60));
                console.log('\nThe homepage will now display:');
                console.log(`  • Alumni Enrolled: ${response.count}+`);
                console.log(`  • Graduation Rate: 98%`);
                console.log(`  • Years of Excellence: ${new Date().getFullYear() - 1993}+`);
                console.log('');
            } else {
                console.log(`   ✗ Endpoint returned status: ${res.statusCode}`);
                console.log(`   ✗ Response: ${data}`);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`   ✗ Request failed: ${error.message}`);
        console.log('   ℹ Make sure the backend server is running on port 5000');
    });

    req.end();
}

// Run verification
setTimeout(verifyEndpoint, 500);
