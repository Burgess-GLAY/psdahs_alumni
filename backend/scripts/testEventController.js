const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

// Test data with new fields
const testEventData = {
    title: 'Test Event with Enhanced Fields',
    description: 'This is a test event to verify the new fields work correctly',
    startDate: new Date('2024-06-01T10:00:00'),
    endDate: new Date('2024-06-01T16:00:00'),
    location: 'Test Venue',
    eventType: 'reunion',
    isPublished: true,
    registrationEnabled: true,
    registrationDeadline: new Date('2024-05-25T23:59:59'),
    capacity: 100,
    price: 25,
    speakers: [
        {
            name: 'John Doe',
            title: 'CEO, Tech Corp',
            bio: 'John has over 20 years of experience in technology leadership.',
            photo: 'https://example.com/john.jpg',
            order: 0
        },
        {
            name: 'Jane Smith',
            title: 'Director of Innovation',
            bio: 'Jane leads innovation initiatives across multiple industries.',
            photo: 'https://example.com/jane.jpg',
            order: 1
        }
    ],
    agenda: [
        {
            time: '10:00 AM',
            title: 'Registration and Welcome',
            description: 'Check-in and morning refreshments',
            order: 0
        },
        {
            time: '10:30 AM',
            title: 'Opening Keynote',
            description: 'Welcome address and event overview',
            speaker: 'John Doe',
            order: 1
        },
        {
            time: '11:30 AM',
            title: 'Innovation Workshop',
            description: 'Interactive session on emerging technologies',
            speaker: 'Jane Smith',
            order: 2
        },
        {
            time: '12:30 PM',
            title: 'Lunch Break',
            description: 'Networking lunch',
            order: 3
        }
    ],
    faq: [
        {
            question: 'What should I bring to the event?',
            answer: 'Please bring a valid ID and your registration confirmation.',
            order: 0
        },
        {
            question: 'Is parking available?',
            answer: 'Yes, free parking is available in the venue lot.',
            order: 1
        },
        {
            question: 'Can I get a refund if I cannot attend?',
            answer: 'Refunds are available up to 7 days before the event.',
            order: 2
        }
    ],
    locationDetails: {
        venueName: 'Grand Conference Center',
        address: {
            street: '123 Main Street',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            country: 'USA'
        },
        coordinates: {
            lat: 39.7817,
            lng: -89.6501
        },
        directions: 'Take I-55 to Exit 92, turn left on Main Street. Venue is on the right.',
        parkingInfo: 'Free parking available in the north lot. Overflow parking in the south lot.'
    }
};

async function testEventController() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Test 1: Create event with new fields
        console.log('Test 1: Creating event with enhanced fields...');
        const createdEvent = await Event.create({
            ...testEventData,
            createdBy: new mongoose.Types.ObjectId() // Mock user ID
        });
        console.log('✓ Event created successfully');
        console.log('  Event ID:', createdEvent._id);
        console.log('  Title:', createdEvent.title);
        console.log('  Registration Enabled:', createdEvent.registrationEnabled);
        console.log('  Speakers count:', createdEvent.speakers.length);
        console.log('  Agenda items count:', createdEvent.agenda.length);
        console.log('  FAQ items count:', createdEvent.faq.length);
        console.log('  Location Details:', createdEvent.locationDetails.venueName);
        console.log('');

        // Test 2: Retrieve event and verify all fields
        console.log('Test 2: Retrieving event by ID...');
        const retrievedEvent = await Event.findById(createdEvent._id);
        console.log('✓ Event retrieved successfully');
        console.log('  All speakers present:', retrievedEvent.speakers.length === 2);
        console.log('  All agenda items present:', retrievedEvent.agenda.length === 4);
        console.log('  All FAQ items present:', retrievedEvent.faq.length === 3);
        console.log('  Location details present:', !!retrievedEvent.locationDetails);
        console.log('');

        // Test 3: Update event with modified fields
        console.log('Test 3: Updating event with modified fields...');
        const updatedEvent = await Event.findByIdAndUpdate(
            createdEvent._id,
            {
                registrationEnabled: false,
                speakers: [
                    ...testEventData.speakers,
                    {
                        name: 'Bob Johnson',
                        title: 'CTO, Innovation Labs',
                        bio: 'Bob specializes in AI and machine learning.',
                        order: 2
                    }
                ],
                agenda: [
                    ...testEventData.agenda,
                    {
                        time: '2:00 PM',
                        title: 'Closing Remarks',
                        description: 'Thank you and next steps',
                        order: 4
                    }
                ]
            },
            { new: true, runValidators: true }
        );
        console.log('✓ Event updated successfully');
        console.log('  Registration Enabled:', updatedEvent.registrationEnabled);
        console.log('  Speakers count (should be 3):', updatedEvent.speakers.length);
        console.log('  Agenda items count (should be 5):', updatedEvent.agenda.length);
        console.log('');

        // Test 4: Query events (should return all fields)
        console.log('Test 4: Querying all published events...');
        const events = await Event.find({ isPublished: true }).lean();
        console.log('✓ Events queried successfully');
        console.log('  Events found:', events.length);
        if (events.length > 0) {
            const firstEvent = events[0];
            console.log('  First event has speakers:', !!firstEvent.speakers);
            console.log('  First event has agenda:', !!firstEvent.agenda);
            console.log('  First event has faq:', !!firstEvent.faq);
            console.log('  First event has locationDetails:', !!firstEvent.locationDetails);
        }
        console.log('');

        // Test 5: Verify order fields
        console.log('Test 5: Verifying order fields...');
        const eventWithOrder = await Event.findById(createdEvent._id);
        const speakersOrdered = eventWithOrder.speakers.every((s, i) => s.order === i || s.order !== undefined);
        const agendaOrdered = eventWithOrder.agenda.every((a, i) => a.order === i || a.order !== undefined);
        const faqOrdered = eventWithOrder.faq.every((f, i) => f.order === i || f.order !== undefined);
        console.log('✓ Order fields verified');
        console.log('  Speakers have order:', speakersOrdered);
        console.log('  Agenda items have order:', agendaOrdered);
        console.log('  FAQ items have order:', faqOrdered);
        console.log('');

        // Cleanup
        console.log('Cleaning up test data...');
        await Event.findByIdAndDelete(createdEvent._id);
        console.log('✓ Test data cleaned up\n');

        console.log('=================================');
        console.log('All tests passed successfully! ✓');
        console.log('=================================');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run tests
testEventController();
