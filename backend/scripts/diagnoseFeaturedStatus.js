require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials - replace with your admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function diagnose() {
    try {
        console.log('🔍 Diagnosing Featured Status Update Issue...\n');

        // Step 1: Login as admin
        console.log('Step 1: Logging in as admin...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (!loginResponse.data.token) {
            console.error('❌ Login failed - no token received');
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('Token:', token.substring(0, 20) + '...\n');

        // Step 2: Get events list
        console.log('Step 2: Fetching events...');
        const eventsResponse = await axios.get(`${API_URL}/events`, {
            headers: {
                'x-auth-token': token
            },
            params: {
                includeUnpublished: 'true'
            }
        });

        if (!eventsResponse.data.success || eventsResponse.data.data.length === 0) {
            console.error('❌ No events found');
            return;
        }

        const testEvent = eventsResponse.data.data[0];
        console.log('✅ Found events');
        console.log(`Test Event: ${testEvent.title} (ID: ${testEvent._id})`);
        console.log(`Current Featured Status: ${testEvent.isFeaturedOnHomepage || false}\n`);

        // Step 3: Test featured toggle endpoint
        console.log('Step 3: Testing featured toggle endpoint...');
        try {
            const featuredResponse = await axios.put(
                `${API_URL}/events/${testEvent._id}/featured`,
                {},
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Featured toggle successful!');
            console.log('Response:', JSON.stringify(featuredResponse.data, null, 2));
            console.log(`New Featured Status: ${featuredResponse.data.data.isFeaturedOnHomepage}\n`);
        } catch (error) {
            console.error('❌ Featured toggle failed!');
            console.error('Status:', error.response?.status);
            console.error('Error:', error.response?.data);
            console.error('Full error:', error.message);
        }

        // Step 4: Test status update endpoint
        console.log('\nStep 4: Testing status update endpoint...');
        try {
            const statusResponse = await axios.put(
                `${API_URL}/events/${testEvent._id}/status`,
                { status: 'ongoing' },
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Status update successful!');
            console.log('Response:', JSON.stringify(statusResponse.data, null, 2));
            console.log(`New Status: ${statusResponse.data.data.eventStatus}\n`);
        } catch (error) {
            console.error('❌ Status update failed!');
            console.error('Status:', error.response?.status);
            console.error('Error:', error.response?.data);
            console.error('Full error:', error.message);
        }

        // Step 5: Check database connection
        console.log('\nStep 5: Checking database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-network');
        console.log('✅ Database connected');

        const Event = require('../models/Event');
        const dbEvent = await Event.findById(testEvent._id);
        console.log('Event in DB:');
        console.log(`  - Title: ${dbEvent.title}`);
        console.log(`  - Featured: ${dbEvent.isFeaturedOnHomepage}`);
        console.log(`  - Status: ${dbEvent.eventStatus}`);
        console.log(`  - Published: ${dbEvent.isPublished}`);

        await mongoose.connection.close();
        console.log('\n✅ Diagnosis complete!');

    } catch (error) {
        console.error('\n❌ Diagnosis failed:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

diagnose();
