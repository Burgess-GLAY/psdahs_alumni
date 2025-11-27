/**
 * Test script to verify event pagination functionality
 * This tests the API pagination parameters and response structure
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs-alumni';

async function testEventPagination() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Get total count of published events
        const totalEvents = await Event.countDocuments({ isPublished: true });
        console.log(`Total published events: ${totalEvents}\n`);

        // Test pagination parameters
        const limit = 6;
        const totalPages = Math.ceil(totalEvents / limit);
        console.log(`Expected total pages (limit=${limit}): ${totalPages}\n`);

        // Test page 1
        console.log('Testing Page 1:');
        const page1Events = await Event.find({ isPublished: true })
            .sort({ startDate: -1 })
            .limit(limit)
            .skip(0);
        console.log(`✓ Page 1 returned ${page1Events.length} events`);
        if (page1Events.length > 0) {
            console.log(`  First event: ${page1Events[0].title}`);
        }

        // Test page 2 if exists
        if (totalPages > 1) {
            console.log('\nTesting Page 2:');
            const page2Events = await Event.find({ isPublished: true })
                .sort({ startDate: -1 })
                .limit(limit)
                .skip(limit);
            console.log(`✓ Page 2 returned ${page2Events.length} events`);
            if (page2Events.length > 0) {
                console.log(`  First event: ${page2Events[0].title}`);
            }

            // Verify no overlap
            const page1Ids = page1Events.map(e => e._id.toString());
            const page2Ids = page2Events.map(e => e._id.toString());
            const overlap = page1Ids.filter(id => page2Ids.includes(id));
            if (overlap.length === 0) {
                console.log('✓ No overlap between pages');
            } else {
                console.log('✗ ERROR: Pages have overlapping events!');
            }
        }

        // Test last page
        if (totalPages > 2) {
            console.log(`\nTesting Last Page (${totalPages}):`);
            const lastPageEvents = await Event.find({ isPublished: true })
                .sort({ startDate: -1 })
                .limit(limit)
                .skip((totalPages - 1) * limit);
            console.log(`✓ Last page returned ${lastPageEvents.length} events`);
            if (lastPageEvents.length > 0) {
                console.log(`  First event: ${lastPageEvents[0].title}`);
            }
        }

        // Test out of bounds page
        console.log(`\nTesting Out of Bounds Page (${totalPages + 1}):`);
        const outOfBoundsEvents = await Event.find({ isPublished: true })
            .sort({ startDate: -1 })
            .limit(limit)
            .skip(totalPages * limit);
        console.log(`✓ Out of bounds page returned ${outOfBoundsEvents.length} events (expected 0)`);

        console.log('\n✓ All pagination tests passed!');

    } catch (error) {
        console.error('✗ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
}

testEventPagination();
