const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

async function testEventDetailPage() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find an event to test with
        const event = await Event.findOne();

        if (!event) {
            console.log('✗ No events found in database');
            console.log('  Create an event first to test the detail page');
            process.exit(1);
        }

        console.log('\n=== Event Detail Page Data Test ===\n');
        console.log('Event ID:', event._id);
        console.log('Title:', event.title);
        console.log('Description:', event.description ? '✓ Present' : '✗ Missing');
        console.log('Start Date:', event.startDate);
        console.log('End Date:', event.endDate);
        console.log('Location:', event.location || 'Not set');
        console.log('Featured Image:', event.featuredImage ? '✓ Present' : '✗ Missing');
        console.log('Category:', event.category || 'Not set');
        console.log('Capacity:', event.capacity || 'Not set');
        console.log('Registration Enabled:', event.registrationEnabled ? '✓ Yes' : '✗ No');

        console.log('\n--- Speakers ---');
        if (event.speakers && event.speakers.length > 0) {
            console.log(`✓ ${event.speakers.length} speaker(s) found`);
            event.speakers.forEach((speaker, index) => {
                console.log(`  ${index + 1}. ${speaker.name}`);
                console.log(`     Title: ${speaker.title || 'Not set'}`);
                console.log(`     Bio: ${speaker.bio ? 'Present' : 'Not set'}`);
                console.log(`     Photo: ${speaker.photo ? 'Present' : 'Not set'}`);
            });
        } else {
            console.log('✗ No speakers');
        }

        console.log('\n--- Agenda ---');
        if (event.agenda && event.agenda.length > 0) {
            console.log(`✓ ${event.agenda.length} agenda item(s) found`);
            event.agenda.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.time} - ${item.title}`);
                if (item.description) console.log(`     Description: ${item.description}`);
                if (item.speaker) console.log(`     Speaker: ${item.speaker}`);
            });
        } else {
            console.log('✗ No agenda items');
        }

        console.log('\n--- FAQ ---');
        if (event.faq && event.faq.length > 0) {
            console.log(`✓ ${event.faq.length} FAQ item(s) found`);
            event.faq.forEach((item, index) => {
                console.log(`  ${index + 1}. Q: ${item.question}`);
                console.log(`     A: ${item.answer}`);
            });
        } else {
            console.log('✗ No FAQ items');
        }

        console.log('\n--- Location Details ---');
        if (event.locationDetails) {
            console.log('✓ Location details present');
            console.log('  Venue Name:', event.locationDetails.venueName || 'Not set');
            if (event.locationDetails.address) {
                console.log('  Address:');
                console.log('    Street:', event.locationDetails.address.street || 'Not set');
                console.log('    City:', event.locationDetails.address.city || 'Not set');
                console.log('    State:', event.locationDetails.address.state || 'Not set');
                console.log('    Zip:', event.locationDetails.address.zipCode || 'Not set');
                console.log('    Country:', event.locationDetails.address.country || 'Not set');
            }
            if (event.locationDetails.coordinates) {
                console.log('  Coordinates:',
                    event.locationDetails.coordinates.lat && event.locationDetails.coordinates.lng
                        ? `${event.locationDetails.coordinates.lat}, ${event.locationDetails.coordinates.lng}`
                        : 'Not set'
                );
            }
            console.log('  Directions:', event.locationDetails.directions ? 'Present' : 'Not set');
            console.log('  Parking Info:', event.locationDetails.parkingInfo ? 'Present' : 'Not set');
        } else {
            console.log('✗ No location details');
        }

        console.log('\n=== Summary ===');
        console.log('✓ Event detail page should display:');
        console.log('  - Basic event information');
        console.log('  - Registration button (only if registrationEnabled is true)');
        if (event.speakers && event.speakers.length > 0) {
            console.log('  - Speakers section');
        }
        if (event.agenda && event.agenda.length > 0) {
            console.log('  - Agenda section');
        }
        if (event.faq && event.faq.length > 0) {
            console.log('  - FAQ section');
        }
        if (event.locationDetails) {
            console.log('  - Location details section');
        }

        console.log('\n✓ Test completed successfully');
        console.log(`\nTo view this event, navigate to: /events/${event._id}`);

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

testEventDetailPage();
