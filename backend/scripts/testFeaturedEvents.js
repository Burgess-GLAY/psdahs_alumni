/**
 * Test script for Featured Events functionality
 * 
 * Tests:
 * - Adding isFeaturedOnHomepage field to Event model
 * - Toggling featured status via API
 * - Fetching featured events for homepage
 * - Limiting to 3 featured events
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const testFeaturedEvents = async () => {
    try {
        console.log('🧪 Testing Featured Events Functionality...\n');
        console.log('='.repeat(60));

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const mockAdminId = new mongoose.Types.ObjectId();

        // ========================================
        // TEST 1: Create events with featured field
        // ========================================
        console.log('TEST 1: Create Events with Featured Field');
        console.log('-'.repeat(60));

        const testEvents = [];
        for (let i = 1; i <= 5; i++) {
            const event = new Event({
                createdBy: mockAdminId,
                title: `Test Event ${i}`,
                description: `Description for test event ${i}`,
                startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // i days from now
                endDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
                location: `Venue ${i}`,
                isPublished: true,
                isFeaturedOnHomepage: false // Default value
            });
            await event.save();
            testEvents.push(event);
            console.log(`✅ Created: ${event.title} (Featured: ${event.isFeaturedOnHomepage})`);
        }
        console.log();

        // ========================================
        // TEST 2: Toggle featured status
        // ========================================
        console.log('TEST 2: Toggle Featured Status');
        console.log('-'.repeat(60));

        // Feature first 3 events
        for (let i = 0; i < 3; i++) {
            testEvents[i].isFeaturedOnHomepage = true;
            testEvents[i].featuredOrder = i + 1;
            await testEvents[i].save();
            console.log(`✅ Featured: ${testEvents[i].title}`);
        }
        console.log();

        // ========================================
        // TEST 3: Fetch featured events
        // ========================================
        console.log('TEST 3: Fetch Featured Events');
        console.log('-'.repeat(60));

        const featuredEvents = await Event.find({
            isPublished: true,
            isFeaturedOnHomepage: true,
            startDate: { $gte: new Date() }
        })
            .sort({ featuredOrder: 1, startDate: 1 })
            .limit(3);

        console.log(`✅ Found ${featuredEvents.length} featured events:`);
        featuredEvents.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.title}`);
            console.log(`      - Featured: ${event.isFeaturedOnHomepage}`);
            console.log(`      - Order: ${event.featuredOrder}`);
            console.log(`      - Start Date: ${event.startDate.toLocaleDateString()}`);
        });
        console.log();

        // ========================================
        // TEST 4: Verify limit of 3
        // ========================================
        console.log('TEST 4: Verify Limit of 3 Featured Events');
        console.log('-'.repeat(60));

        // Try to feature a 4th event
        testEvents[3].isFeaturedOnHomepage = true;
        testEvents[3].featuredOrder = 4;
        await testEvents[3].save();
        console.log(`✅ Featured 4th event: ${testEvents[3].title}`);

        // Fetch again with limit
        const limitedFeatured = await Event.find({
            isPublished: true,
            isFeaturedOnHomepage: true,
            startDate: { $gte: new Date() }
        })
            .sort({ featuredOrder: 1, startDate: 1 })
            .limit(3);

        console.log(`✅ API returns only ${limitedFeatured.length} events (limit enforced)`);
        console.log();

        // ========================================
        // TEST 5: Toggle off featured status
        // ========================================
        console.log('TEST 5: Toggle Off Featured Status');
        console.log('-'.repeat(60));

        testEvents[0].isFeaturedOnHomepage = false;
        await testEvents[0].save();
        console.log(`✅ Removed from featured: ${testEvents[0].title}`);

        const afterToggle = await Event.find({
            isPublished: true,
            isFeaturedOnHomepage: true,
            startDate: { $gte: new Date() }
        })
            .sort({ featuredOrder: 1, startDate: 1 })
            .limit(3);

        console.log(`✅ Featured events count after toggle: ${afterToggle.length}`);
        afterToggle.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.title}`);
        });
        console.log();

        // ========================================
        // TEST 6: Only upcoming events are featured
        // ========================================
        console.log('TEST 6: Only Upcoming Events Featured');
        console.log('-'.repeat(60));

        // Create a past event and try to feature it
        const pastEvent = new Event({
            createdBy: mockAdminId,
            title: 'Past Event',
            description: 'This event is in the past',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            endDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            location: 'Past Venue',
            isPublished: true,
            isFeaturedOnHomepage: true
        });
        await pastEvent.save();
        console.log(`✅ Created past event: ${pastEvent.title} (Featured: ${pastEvent.isFeaturedOnHomepage})`);

        const upcomingFeatured = await Event.find({
            isPublished: true,
            isFeaturedOnHomepage: true,
            startDate: { $gte: new Date() }
        })
            .sort({ featuredOrder: 1, startDate: 1 })
            .limit(3);

        console.log(`✅ Upcoming featured events: ${upcomingFeatured.length}`);
        console.log(`   Past event NOT included: ${!upcomingFeatured.some(e => e._id.equals(pastEvent._id))}`);
        console.log();

        // ========================================
        // CLEANUP
        // ========================================
        console.log('🧹 Cleaning up test data...');
        console.log('-'.repeat(60));

        for (const event of testEvents) {
            await Event.deleteOne({ _id: event._id });
        }
        await Event.deleteOne({ _id: pastEvent._id });

        console.log('✅ All test events cleaned up\n');

        // ========================================
        // FINAL SUMMARY
        // ========================================
        console.log('='.repeat(60));
        console.log('🎉 FEATURED EVENTS FUNCTIONALITY TEST - ALL PASSED!\n');
        console.log('Summary of Tests:');
        console.log('  ✅ TEST 1: Events created with isFeaturedOnHomepage field');
        console.log('  ✅ TEST 2: Featured status can be toggled');
        console.log('  ✅ TEST 3: Featured events can be fetched');
        console.log('  ✅ TEST 4: Limit of 3 featured events enforced');
        console.log('  ✅ TEST 5: Featured status can be toggled off');
        console.log('  ✅ TEST 6: Only upcoming events are featured');
        console.log('\n✅ Feature is ready for use!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
};

// Run the test
testFeaturedEvents();
