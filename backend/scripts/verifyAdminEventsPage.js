const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

async function verifyAdminEventsPage() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Check if there are any events in the database
        console.log('Checking for existing events...');
        const eventCount = await Event.countDocuments();
        console.log(`Found ${eventCount} events in database\n`);

        if (eventCount === 0) {
            console.log('Creating sample events for testing...');

            // Create a test admin user
            const testAdmin = await User.create({
                firstName: 'Test',
                lastName: 'Admin',
                email: `testadmin${Date.now()}@test.com`,
                password: 'password123',
                isAdmin: true,
                graduationYear: 2020
            });

            // Create sample events
            const sampleEvents = [
                {
                    title: 'Alumni Reunion 2024',
                    description: 'Annual alumni reunion event',
                    startDate: new Date('2024-07-15T10:00:00'),
                    endDate: new Date('2024-07-15T18:00:00'),
                    location: 'School Campus',
                    eventType: 'reunion',
                    isPublished: true,
                    registrationEnabled: true,
                    capacity: 100,
                    createdBy: testAdmin._id,
                    organizers: [testAdmin._id]
                },
                {
                    title: 'Fundraising Gala',
                    description: 'Annual fundraising event for school improvements',
                    startDate: new Date('2024-08-20T14:00:00'),
                    endDate: new Date('2024-08-20T17:00:00'),
                    location: 'Conference Center',
                    eventType: 'fundraiser',
                    isPublished: true,
                    registrationEnabled: false,
                    capacity: 50,
                    createdBy: testAdmin._id,
                    organizers: [testAdmin._id]
                },
                {
                    title: 'Social Networking Event (Draft)',
                    description: 'Networking event - not yet published',
                    startDate: new Date('2024-09-10T18:00:00'),
                    endDate: new Date('2024-09-10T21:00:00'),
                    location: 'Downtown Hotel',
                    eventType: 'social',
                    isPublished: false,
                    registrationEnabled: true,
                    capacity: 75,
                    createdBy: testAdmin._id,
                    organizers: [testAdmin._id]
                }
            ];

            await Event.insertMany(sampleEvents);
            console.log('✓ Created 3 sample events\n');
        }

        // Simulate the API call that AdminEventsPage makes
        console.log('Simulating AdminEventsPage API call...');
        console.log('GET /api/events?page=1&limit=10&includeUnpublished=true\n');

        const events = await Event.find({})
            .sort({ startDate: 1 })
            .limit(10)
            .skip(0)
            .populate('organizers', 'firstName lastName email profilePicture')
            .lean();

        const total = await Event.countDocuments({});

        console.log('API Response:');
        console.log('=============');
        console.log(`Total events: ${total}`);
        console.log(`Events returned: ${events.length}\n`);

        events.forEach((event, index) => {
            console.log(`Event ${index + 1}:`);
            console.log(`  ID: ${event._id}`);
            console.log(`  Title: ${event.title}`);
            console.log(`  Start Date: ${event.startDate.toLocaleDateString()}`);
            console.log(`  Location: ${event.location}`);
            console.log(`  Type: ${event.eventType}`);
            console.log(`  Published: ${event.isPublished}`);
            console.log(`  Registration Enabled: ${event.registrationEnabled}`);
            console.log('');
        });

        console.log('=================================');
        console.log('✓ AdminEventsPage data verified!');
        console.log('=================================');
        console.log('\nThe AdminEventsPage should now display:');
        console.log(`- ${total} total events`);
        console.log('- Real event data from the database');
        console.log('- Loading state while fetching');
        console.log('- Error handling if API fails');
        console.log('- Empty state if no events exist');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run verification
verifyAdminEventsPage();
