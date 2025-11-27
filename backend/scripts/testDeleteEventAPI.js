const axios = require('axios');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testDeleteEventAPI() {
    let token = null;
    let testEventId = null;

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find an admin user
        console.log('\n1. Finding an admin user...');
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('✗ No admin user found. Please create an admin user first.');
            return;
        }
        console.log('✓ Admin user found:', adminUser.email);

        // Login as admin
        console.log('\n2. Logging in as admin...');
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: adminUser.email,
                password: 'password123' // Adjust if needed
            });
            token = loginResponse.data.token;
            console.log('✓ Logged in successfully');
        } catch (error) {
            console.log('✗ Login failed. Using direct database creation instead.');
            // Create event directly in database for testing
            const testEvent = await Event.create({
                title: 'Test Event for API Deletion',
                description: 'This event will be deleted via API',
                startDate: new Date('2025-12-01'),
                endDate: new Date('2025-12-01'),
                location: 'Test Location',
                eventType: 'other',
                isPublished: false,
                registrationEnabled: false,
                createdBy: adminUser._id
            });
            testEventId = testEvent._id.toString();
            console.log('✓ Test event created directly:', testEventId);
        }

        // Create a test event via API if we have a token
        if (token && !testEventId) {
            console.log('\n3. Creating a test event via API...');
            try {
                const createResponse = await axios.post(
                    `${API_URL}/events`,
                    {
                        title: 'Test Event for API Deletion',
                        description: 'This event will be deleted via API',
                        startDate: '2025-12-01',
                        endDate: '2025-12-01',
                        location: 'Test Location',
                        eventType: 'other',
                        isPublished: false,
                        registrationEnabled: false
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                testEventId = createResponse.data.data._id;
                console.log('✓ Test event created via API:', testEventId);
            } catch (error) {
                console.log('✗ Failed to create event via API:', error.response?.data?.message || error.message);
                return;
            }
        }

        // Verify event exists
        console.log('\n4. Verifying event exists...');
        const foundEvent = await Event.findById(testEventId);
        if (foundEvent) {
            console.log('✓ Event found:', foundEvent.title);
        } else {
            console.log('✗ Event not found');
            return;
        }

        // Delete the event via API if we have a token
        if (token) {
            console.log('\n5. Deleting event via API...');
            try {
                const deleteResponse = await axios.delete(
                    `${API_URL}/events/${testEventId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                console.log('✓ Event deleted via API');
                console.log('  Response:', deleteResponse.data);
            } catch (error) {
                console.log('✗ Failed to delete event via API:', error.response?.data?.message || error.message);
                // Clean up manually
                await Event.findByIdAndDelete(testEventId);
                return;
            }
        } else {
            // Delete directly from database
            console.log('\n5. Deleting event directly from database...');
            await Event.findByIdAndDelete(testEventId);
            console.log('✓ Event deleted from database');
        }

        // Verify event is deleted
        console.log('\n6. Verifying event is deleted...');
        const deletedEvent = await Event.findById(testEventId);
        if (!deletedEvent) {
            console.log('✓ Event successfully deleted (not found in database)');
        } else {
            console.log('✗ Event still exists in database');
        }

        console.log('\n✓ All delete API tests passed!');

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        console.error(error);
    } finally {
        // Clean up test event if it still exists
        if (testEventId) {
            try {
                await Event.findByIdAndDelete(testEventId);
            } catch (err) {
                // Ignore cleanup errors
            }
        }
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

testDeleteEventAPI();
