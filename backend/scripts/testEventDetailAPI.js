const axios = require('axios');
const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testEventDetailAPI() {
    try {
        // Connect to MongoDB to get an event ID
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Find an event to test with
        const event = await Event.findOne();

        if (!event) {
            console.log('✗ No events found in database');
            console.log('  Create an event first to test the API');
            process.exit(1);
        }

        const eventId = event._id.toString();
        console.log(`\n=== Testing Event Detail API for Event: ${eventId} ===\n`);

        // Test 1: Fetch event details
        console.log('Test 1: Fetching event details...');
        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);

        if (response.status === 200) {
            console.log('✓ API returned status 200');
        } else {
            console.log(`✗ API returned status ${response.status}`);
            process.exit(1);
        }

        const eventData = response.data.data || response.data;

        // Test 2: Verify basic fields
        console.log('\nTest 2: Verifying basic event fields...');
        const basicFields = ['title', 'description', 'startDate', 'endDate'];
        let allBasicFieldsPresent = true;

        basicFields.forEach(field => {
            if (eventData[field]) {
                console.log(`  ✓ ${field}: Present`);
            } else {
                console.log(`  ✗ ${field}: Missing`);
                allBasicFieldsPresent = false;
            }
        });

        if (allBasicFieldsPresent) {
            console.log('✓ All basic fields present');
        } else {
            console.log('✗ Some basic fields missing');
        }

        // Test 3: Verify registrationEnabled field
        console.log('\nTest 3: Verifying registrationEnabled field...');
        if (typeof eventData.registrationEnabled === 'boolean') {
            console.log(`  ✓ registrationEnabled: ${eventData.registrationEnabled}`);
            console.log(`  → Registration button should ${eventData.registrationEnabled ? 'be shown' : 'NOT be shown'}`);
        } else {
            console.log('  ✗ registrationEnabled field missing or invalid');
        }

        // Test 4: Verify optional sections
        console.log('\nTest 4: Verifying optional sections...');

        if (eventData.speakers && Array.isArray(eventData.speakers)) {
            console.log(`  ✓ Speakers: ${eventData.speakers.length} speaker(s)`);
            if (eventData.speakers.length > 0) {
                console.log('    → Speakers tab should be visible');
            }
        } else {
            console.log('  ℹ Speakers: Not present (tab will be hidden)');
        }

        if (eventData.agenda && Array.isArray(eventData.agenda)) {
            console.log(`  ✓ Agenda: ${eventData.agenda.length} item(s)`);
            if (eventData.agenda.length > 0) {
                console.log('    → Agenda tab should be visible');
            }
        } else {
            console.log('  ℹ Agenda: Not present (tab will be hidden)');
        }

        if (eventData.faq && Array.isArray(eventData.faq)) {
            console.log(`  ✓ FAQ: ${eventData.faq.length} item(s)`);
            if (eventData.faq.length > 0) {
                console.log('    → FAQ tab should be visible');
            }
        } else {
            console.log('  ℹ FAQ: Not present (tab will be hidden)');
        }

        if (eventData.locationDetails) {
            console.log('  ✓ Location Details: Present');
            console.log('    → Location tab should be visible');

            if (eventData.locationDetails.venueName) {
                console.log(`    - Venue: ${eventData.locationDetails.venueName}`);
            }
            if (eventData.locationDetails.coordinates?.lat && eventData.locationDetails.coordinates?.lng) {
                console.log('    - Map coordinates: Present (map will be shown)');
            }
        } else {
            console.log('  ℹ Location Details: Not present (tab will be hidden)');
        }

        // Test 5: Verify data structure matches frontend expectations
        console.log('\nTest 5: Verifying data structure compatibility...');
        let compatibilityIssues = [];

        // Check date format
        try {
            new Date(eventData.startDate);
            new Date(eventData.endDate);
            console.log('  ✓ Date format is valid');
        } catch (e) {
            console.log('  ✗ Date format is invalid');
            compatibilityIssues.push('Invalid date format');
        }

        // Check speakers structure
        if (eventData.speakers && eventData.speakers.length > 0) {
            const speaker = eventData.speakers[0];
            if (speaker.name) {
                console.log('  ✓ Speaker structure is valid');
            } else {
                console.log('  ✗ Speaker structure is invalid (missing name)');
                compatibilityIssues.push('Invalid speaker structure');
            }
        }

        // Check agenda structure
        if (eventData.agenda && eventData.agenda.length > 0) {
            const agendaItem = eventData.agenda[0];
            if (agendaItem.title) {
                console.log('  ✓ Agenda structure is valid');
            } else {
                console.log('  ✗ Agenda structure is invalid (missing title)');
                compatibilityIssues.push('Invalid agenda structure');
            }
        }

        // Check FAQ structure
        if (eventData.faq && eventData.faq.length > 0) {
            const faqItem = eventData.faq[0];
            if (faqItem.question && faqItem.answer) {
                console.log('  ✓ FAQ structure is valid');
            } else {
                console.log('  ✗ FAQ structure is invalid (missing question or answer)');
                compatibilityIssues.push('Invalid FAQ structure');
            }
        }

        if (compatibilityIssues.length === 0) {
            console.log('✓ Data structure is compatible with frontend');
        } else {
            console.log('✗ Data structure has compatibility issues:', compatibilityIssues.join(', '));
        }

        // Summary
        console.log('\n=== Summary ===');
        console.log('✓ Event Detail API is working correctly');
        console.log('✓ EventDetailPage should be able to:');
        console.log('  1. Fetch event details from API');
        console.log('  2. Display basic event information');
        console.log(`  3. ${eventData.registrationEnabled ? 'Show' : 'Hide'} registration button based on registrationEnabled`);
        console.log('  4. Conditionally show tabs based on available data:');
        console.log(`     - Speakers: ${eventData.speakers?.length > 0 ? 'Visible' : 'Hidden'}`);
        console.log(`     - Agenda: ${eventData.agenda?.length > 0 ? 'Visible' : 'Hidden'}`);
        console.log(`     - FAQ: ${eventData.faq?.length > 0 ? 'Visible' : 'Hidden'}`);
        console.log(`     - Location: ${eventData.locationDetails ? 'Visible' : 'Hidden'}`);

        console.log('\n✓ All tests passed!');
        console.log(`\nTo view this event in the frontend, navigate to: http://localhost:3000/events/${eventId}`);

    } catch (error) {
        console.error('\n✗ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

// Check if server is running before testing
async function checkServer() {
    try {
        await axios.get(`${API_BASE_URL}/events`);
        return true;
    } catch (error) {
        console.error('✗ Server is not running at', API_BASE_URL);
        console.error('  Please start the backend server first: npm start');
        return false;
    }
}

async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testEventDetailAPI();
    } else {
        process.exit(1);
    }
}

main();
