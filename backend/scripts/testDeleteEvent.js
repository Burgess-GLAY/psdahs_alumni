const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

async function testDeleteEvent() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find any user to use as createdBy
        console.log('\n1. Finding a user...');
        let user = await User.findOne({ role: 'admin' });
        if (!user) {
            user = await User.findOne();
        }
        if (!user) {
            console.log('✗ No user found. Please create a user first.');
            return;
        }
        console.log('✓ User found:', user.email);

        // Create a test event
        console.log('\n2. Creating a test event...');
        const testEvent = await Event.create({
            title: 'Test Event for Deletion',
            description: 'This event will be deleted',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-01'),
            location: 'Test Location',
            eventType: 'other',
            isPublished: false,
            registrationEnabled: false,
            createdBy: user._id
        });
        console.log('✓ Test event created:', testEvent._id);

        // Verify event exists
        console.log('\n3. Verifying event exists...');
        const foundEvent = await Event.findById(testEvent._id);
        if (foundEvent) {
            console.log('✓ Event found:', foundEvent.title);
        } else {
            console.log('✗ Event not found');
            return;
        }

        // Delete the event
        console.log('\n4. Deleting the event...');
        await Event.findByIdAndDelete(testEvent._id);
        console.log('✓ Event deleted');

        // Verify event is deleted
        console.log('\n5. Verifying event is deleted...');
        const deletedEvent = await Event.findById(testEvent._id);
        if (!deletedEvent) {
            console.log('✓ Event successfully deleted (not found in database)');
        } else {
            console.log('✗ Event still exists in database');
        }

        console.log('\n✓ All delete tests passed!');

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

testDeleteEvent();
