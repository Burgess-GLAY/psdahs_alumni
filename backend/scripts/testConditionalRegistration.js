/**
 * Test script to verify conditional registration button functionality
 * Tests that events display correct buttons based on registrationEnabled field
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

const testConditionalRegistration = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get a user to use as createdBy
        console.log('👤 Finding a user for createdBy field...');
        const user = await User.findOne();
        if (!user) {
            console.error('❌ No users found in database. Please create a user first.');
            return;
        }
        console.log(`✅ Using user: ${user.email} (${user._id})\n`);

        // Clean up any test events
        console.log('🧹 Cleaning up existing test events...');
        await Event.deleteMany({
            title: {
                $in: [
                    'Test Event - Registration Enabled',
                    'Test Event - Registration Disabled'
                ]
            }
        });
        console.log('✅ Cleanup complete\n');

        // Create test event with registration enabled
        console.log('📝 Creating test event with registration ENABLED...');
        const eventWithRegistration = await Event.create({
            title: 'Test Event - Registration Enabled',
            description: 'This event should show a "Register Now" button',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
            location: 'Test Venue',
            eventType: 'meeting',
            registrationEnabled: true, // Registration ENABLED
            capacity: 50,
            isPublished: true,
            createdBy: user._id
        });
        console.log('✅ Created event with registration enabled:');
        console.log(`   ID: ${eventWithRegistration._id}`);
        console.log(`   Title: ${eventWithRegistration.title}`);
        console.log(`   Registration Enabled: ${eventWithRegistration.registrationEnabled}`);
        console.log('   Expected Button: "Register Now"\n');

        // Create test event with registration disabled
        console.log('📝 Creating test event with registration DISABLED...');
        const eventWithoutRegistration = await Event.create({
            title: 'Test Event - Registration Disabled',
            description: 'This event should show a "View Details" button only',
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
            location: 'Test Venue 2',
            eventType: 'social',
            registrationEnabled: false, // Registration DISABLED (default)
            isPublished: true,
            createdBy: user._id
        });
        console.log('✅ Created event with registration disabled:');
        console.log(`   ID: ${eventWithoutRegistration._id}`);
        console.log(`   Title: ${eventWithoutRegistration.title}`);
        console.log(`   Registration Enabled: ${eventWithoutRegistration.registrationEnabled}`);
        console.log('   Expected Button: "View Details"\n');

        // Verify by fetching events
        console.log('🔍 Fetching events to verify...');
        const events = await Event.find({
            title: {
                $in: [
                    'Test Event - Registration Enabled',
                    'Test Event - Registration Disabled'
                ]
            }
        }).select('title registrationEnabled');

        console.log('\n📊 Verification Results:');
        console.log('========================');
        events.forEach(event => {
            const buttonType = event.registrationEnabled ? '"Register Now"' : '"View Details"';
            console.log(`\n${event.title}`);
            console.log(`  Registration Enabled: ${event.registrationEnabled}`);
            console.log(`  Should Display: ${buttonType} button`);
        });

        console.log('\n\n✅ Test Complete!');
        console.log('\n📋 Manual Testing Instructions:');
        console.log('================================');
        console.log('1. Start the frontend application');
        console.log('2. Navigate to /events page');
        console.log('3. Look for the two test events created above');
        console.log('4. Verify:');
        console.log('   - "Test Event - Registration Enabled" shows "Register Now" button');
        console.log('   - "Test Event - Registration Disabled" shows only "View Details" button');
        console.log('5. Test both Grid View and List View layouts');
        console.log('\n💡 To clean up test events, run:');
        console.log('   await Event.deleteMany({ title: /Test Event/ })');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

testConditionalRegistration();
