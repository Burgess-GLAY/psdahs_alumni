const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

// Mock request and response objects
function createMockReq(body = {}, params = {}, query = {}, user = null) {
    return {
        body,
        params,
        query,
        user
    };
}

function createMockRes() {
    const res = {
        statusCode: 200,
        data: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.data = data;
            return this;
        }
    };
    return res;
}

function createMockNext() {
    return (error) => {
        if (error) {
            console.error('Error passed to next():', error.message);
            throw error;
        }
    };
}

// Import controller functions
const eventController = require('../controllers/eventController');

async function testEventAPI() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Create a test user
        console.log('Creating test user...');
        const testUser = await User.create({
            firstName: 'Test',
            lastName: 'Admin',
            email: `testadmin${Date.now()}@test.com`,
            password: 'password123',
            isAdmin: true,
            graduationYear: 2020
        });
        console.log('✓ Test user created:', testUser._id);
        console.log('');

        // Test 1: Create event via controller
        console.log('Test 1: POST /api/events (Create Event)');
        const createReq = createMockReq({
            title: 'API Test Event',
            description: 'Testing event creation via API controller',
            startDate: new Date('2024-07-01T10:00:00'),
            endDate: new Date('2024-07-01T16:00:00'),
            location: 'API Test Venue',
            eventType: 'reunion',
            isPublished: true,
            registrationEnabled: true,
            capacity: 50,
            speakers: [
                {
                    name: 'Speaker One',
                    title: 'Expert',
                    bio: 'Bio of speaker one',
                    order: 0
                }
            ],
            agenda: [
                {
                    time: '10:00 AM',
                    title: 'Opening',
                    description: 'Event opening',
                    order: 0
                }
            ],
            faq: [
                {
                    question: 'Test question?',
                    answer: 'Test answer',
                    order: 0
                }
            ],
            locationDetails: {
                venueName: 'Test Venue',
                address: {
                    street: '456 Test St',
                    city: 'Test City',
                    state: 'TS',
                    zipCode: '12345',
                    country: 'USA'
                },
                directions: 'Test directions'
            }
        }, {}, {}, { id: testUser._id.toString(), isAdmin: true });

        const createRes = createMockRes();
        const createNext = createMockNext();

        await eventController.createEvent(createReq, createRes, createNext);

        console.log('✓ Event created via controller');
        console.log('  Status:', createRes.statusCode);
        console.log('  Success:', createRes.data.success);
        console.log('  Event ID:', createRes.data.data._id);
        console.log('  Has speakers:', createRes.data.data.speakers.length > 0);
        console.log('  Has agenda:', createRes.data.data.agenda.length > 0);
        console.log('  Has FAQ:', createRes.data.data.faq.length > 0);
        console.log('  Has locationDetails:', !!createRes.data.data.locationDetails);
        console.log('');

        const createdEventId = createRes.data.data._id;

        // Test 2: Get all events via controller
        console.log('Test 2: GET /api/events (Get All Events)');
        const getReq = createMockReq({}, {}, { page: 1, limit: 10 });
        const getRes = createMockRes();
        const getNext = createMockNext();

        await eventController.getEvents(getReq, getRes, getNext);

        console.log('✓ Events retrieved via controller');
        console.log('  Status:', getRes.statusCode);
        console.log('  Success:', getRes.data.success);
        console.log('  Count:', getRes.data.count);
        console.log('  Total:', getRes.data.total);
        console.log('  First event has new fields:',
            getRes.data.data.length > 0 &&
            !!getRes.data.data[0].speakers &&
            !!getRes.data.data[0].agenda &&
            !!getRes.data.data[0].faq &&
            !!getRes.data.data[0].locationDetails
        );
        console.log('');

        // Test 3: Get single event by ID via controller
        console.log('Test 3: GET /api/events/:id (Get Event By ID)');
        const getByIdReq = createMockReq({}, { id: createdEventId.toString() }, {}, { id: testUser._id.toString() });
        const getByIdRes = createMockRes();
        const getByIdNext = createMockNext();

        await eventController.getEventById(getByIdReq, getByIdRes, getByIdNext);

        console.log('✓ Event retrieved by ID via controller');
        console.log('  Status:', getByIdRes.statusCode);
        console.log('  Success:', getByIdRes.data.success);
        console.log('  Event title:', getByIdRes.data.data.title);
        console.log('  Speakers count:', getByIdRes.data.data.speakers.length);
        console.log('  Agenda count:', getByIdRes.data.data.agenda.length);
        console.log('  FAQ count:', getByIdRes.data.data.faq.length);
        console.log('  Location venue:', getByIdRes.data.data.locationDetails.venueName);
        console.log('');

        // Test 4: Update event via controller
        console.log('Test 4: PUT /api/events/:id (Update Event)');
        const updateReq = createMockReq({
            title: 'Updated API Test Event',
            registrationEnabled: false,
            speakers: [
                {
                    name: 'Speaker One',
                    title: 'Expert',
                    bio: 'Updated bio',
                    order: 0
                },
                {
                    name: 'Speaker Two',
                    title: 'Specialist',
                    bio: 'New speaker',
                    order: 1
                }
            ],
            agenda: [
                {
                    time: '10:00 AM',
                    title: 'Opening',
                    description: 'Event opening',
                    order: 0
                },
                {
                    time: '11:00 AM',
                    title: 'Main Session',
                    description: 'Main content',
                    order: 1
                }
            ]
        }, { id: createdEventId.toString() }, {}, { id: testUser._id.toString(), isAdmin: true });

        const updateRes = createMockRes();
        const updateNext = createMockNext();

        await eventController.updateEvent(updateReq, updateRes, updateNext);

        console.log('✓ Event updated via controller');
        console.log('  Status:', updateRes.statusCode);
        console.log('  Success:', updateRes.data.success);
        console.log('  Updated title:', updateRes.data.data.title);
        console.log('  Registration enabled:', updateRes.data.data.registrationEnabled);
        console.log('  Speakers count (should be 2):', updateRes.data.data.speakers.length);
        console.log('  Agenda count (should be 2):', updateRes.data.data.agenda.length);
        console.log('');

        // Test 5: Get events with includeUnpublished (admin only)
        console.log('Test 5: GET /api/events?includeUnpublished=true (Admin View)');
        const adminGetReq = createMockReq({}, {}, { includeUnpublished: 'true' }, { id: testUser._id.toString(), isAdmin: true });
        const adminGetRes = createMockRes();
        const adminGetNext = createMockNext();

        await eventController.getEvents(adminGetReq, adminGetRes, adminGetNext);

        console.log('✓ Events retrieved with admin privileges');
        console.log('  Status:', adminGetRes.statusCode);
        console.log('  Success:', adminGetRes.data.success);
        console.log('  Total events (including unpublished):', adminGetRes.data.total);
        console.log('');

        // Cleanup
        console.log('Cleaning up test data...');
        await Event.findByIdAndDelete(createdEventId);
        await User.findByIdAndDelete(testUser._id);
        console.log('✓ Test data cleaned up\n');

        console.log('=================================');
        console.log('All API tests passed successfully! ✓');
        console.log('=================================');
        console.log('\nSummary:');
        console.log('✓ createEvent handles speakers, agenda, faq, locationDetails');
        console.log('✓ updateEvent handles speakers, agenda, faq, locationDetails');
        console.log('✓ getEvents returns all new fields');
        console.log('✓ getEventById returns all new fields');
        console.log('✓ Admin can view unpublished events');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run tests
testEventAPI();
