/**
 * Quick test to verify the /api/events/featured endpoint works
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const testEndpoint = async () => {
    try {
        console.log('Testing /api/events/featured endpoint...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if there are any events in the database
        const totalEvents = await Event.countDocuments();
        console.log(`Total events in database: ${totalEvents}`);

        // Check for published events
        const publishedEvents = await Event.countDocuments({ isPublished: true });
        console.log(`Published events: ${publishedEvents}`);

        // Check for featured events
        const featuredEvents = await Event.countDocuments({
            isPublished: true,
            isFeaturedOnHomepage: true
        });
        console.log(`Featured events: ${featuredEvents}`);

        // Check for upcoming featured events
        const upcomingFeatured = await Event.countDocuments({
            isPublished: true,
            isFeaturedOnHomepage: true,
            startDate: { $gte: new Date() }
        });
        console.log(`Upcoming featured events: ${upcomingFeatured}\n`);

        if (upcomingFeatured === 0) {
            console.log('⚠️  No upcoming featured events found!');
            console.log('   This is why the homepage shows "Failed to load featured events"');
            console.log('   Solution: Mark some upcoming events as featured from the admin panel\n');

            // List some upcoming events that could be featured
            const upcomingEvents = await Event.find({
                isPublished: true,
                startDate: { $gte: new Date() }
            })
                .limit(5)
                .select('title startDate isFeaturedOnHomepage');

            if (upcomingEvents.length > 0) {
                console.log('   Available upcoming events to feature:');
                upcomingEvents.forEach((event, index) => {
                    console.log(`   ${index + 1}. ${event.title}`);
                    console.log(`      Date: ${event.startDate.toLocaleDateString()}`);
                    console.log(`      Featured: ${event.isFeaturedOnHomepage ? 'Yes' : 'No'}`);
                });
            } else {
                console.log('   No upcoming published events available');
            }
        } else {
            console.log('✅ Featured events are available!');

            const events = await Event.find({
                isPublished: true,
                isFeaturedOnHomepage: true,
                startDate: { $gte: new Date() }
            })
                .sort({ featuredOrder: 1, startDate: 1 })
                .limit(3)
                .select('title startDate featuredOrder');

            console.log('\nFeatured events that will show on homepage:');
            events.forEach((event, index) => {
                console.log(`${index + 1}. ${event.title}`);
                console.log(`   Date: ${event.startDate.toLocaleDateString()}`);
                console.log(`   Order: ${event.featuredOrder || 0}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
};

testEndpoint();
