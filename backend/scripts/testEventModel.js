require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

async function testEventModel() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Create a test event with new fields
        const testEvent = {
            title: 'Test Event with New Fields',
            description: 'Testing the enhanced event model',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-02'),
            location: 'Test Location',
            createdBy: new mongoose.Types.ObjectId(),

            // New fields
            registrationEnabled: true,
            speakers: [
                {
                    name: 'John Doe',
                    title: 'CEO',
                    bio: 'Experienced speaker',
                    photo: '/images/john.jpg',
                    order: 1
                },
                {
                    name: 'Jane Smith',
                    title: 'CTO',
                    bio: 'Tech expert',
                    photo: '/images/jane.jpg',
                    order: 2
                }
            ],
            agenda: [
                {
                    time: '09:00 AM',
                    title: 'Opening Remarks',
                    description: 'Welcome and introduction',
                    speaker: 'John Doe',
                    order: 1
                },
                {
                    time: '10:00 AM',
                    title: 'Technical Session',
                    description: 'Deep dive into technology',
                    speaker: 'Jane Smith',
                    order: 2
                }
            ],
            faq: [
                {
                    question: 'What should I bring?',
                    answer: 'Just yourself and enthusiasm!',
                    order: 1
                },
                {
                    question: 'Is parking available?',
                    answer: 'Yes, free parking is available.',
                    order: 2
                }
            ],
            locationDetails: {
                venueName: 'Grand Conference Hall',
                address: {
                    street: '123 Main St',
                    city: 'Freetown',
                    state: 'Western Area',
                    zipCode: '00000',
                    country: 'Sierra Leone'
                },
                coordinates: {
                    lat: 8.4657,
                    lng: -13.2317
                },
                directions: 'Take the main road and turn left at the roundabout',
                parkingInfo: 'Free parking available in the rear lot'
            }
        };

        // Validate the event
        const event = new Event(testEvent);
        const validationError = event.validateSync();

        if (validationError) {
            console.error('✗ Validation failed:', validationError.message);
            process.exit(1);
        }

        console.log('✓ Event model validation passed');

        // Check all new fields are present
        console.log('\n=== Checking New Fields ===');
        console.log('✓ registrationEnabled:', event.registrationEnabled);
        console.log('✓ speakers count:', event.speakers.length);
        console.log('✓ agenda count:', event.agenda.length);
        console.log('✓ faq count:', event.faq.length);
        console.log('✓ locationDetails present:', !!event.locationDetails);

        // Verify speaker fields
        console.log('\n=== Speaker Fields ===');
        event.speakers.forEach((speaker, idx) => {
            console.log(`Speaker ${idx + 1}:`, {
                name: speaker.name,
                title: speaker.title,
                bio: speaker.bio,
                photo: speaker.photo,
                order: speaker.order
            });
        });

        // Verify agenda fields
        console.log('\n=== Agenda Fields ===');
        event.agenda.forEach((item, idx) => {
            console.log(`Agenda ${idx + 1}:`, {
                time: item.time,
                title: item.title,
                description: item.description,
                speaker: item.speaker,
                order: item.order
            });
        });

        // Verify FAQ fields
        console.log('\n=== FAQ Fields ===');
        event.faq.forEach((item, idx) => {
            console.log(`FAQ ${idx + 1}:`, {
                question: item.question,
                answer: item.answer,
                order: item.order
            });
        });

        // Verify location details
        console.log('\n=== Location Details ===');
        console.log('Venue:', event.locationDetails.venueName);
        console.log('Address:', event.locationDetails.address);
        console.log('Coordinates:', event.locationDetails.coordinates);
        console.log('Directions:', event.locationDetails.directions);
        console.log('Parking:', event.locationDetails.parkingInfo);

        console.log('\n✓ All new fields are working correctly!');

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

testEventModel();
