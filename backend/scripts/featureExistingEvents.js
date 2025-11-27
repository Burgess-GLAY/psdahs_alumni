/**
 * Script to feature existing upcoming events
 * Run this to mark some events as featured for the homepage
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const featureEvents = async () => {
    try {
        console.log('🌟 Featuring Upcoming Events for Homepage...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get upcoming published events
        const upcomingEvents = await Event.find({
            isPublished: true,
            startDate: { $gte: new Date() }
        })
            .sort({ startDate: 1 })
            .limit(3);

        if (upcomingEvents.length === 0) {
            console.log('⚠️  No upcoming published events found to feature');
            console.log('   Create some events first from the admin panel\n');
            return;
        }

        console.log(`Found ${upcomingEvents.length} upcoming events to feature:\n`);

        // Feature these events
        for (let i = 0; i < upcomingEvents.length; i++) {
            const event = upcomingEvents[i];
            event.isFeaturedOnHomepage = true;
            event.featuredOrder = i + 1;
            await event.save();

            console.log(`✅ Featured: ${event.title}`);
            console.log(`   Date: ${event.startDate.toLocaleDateString()}`);
            console.log(`   Order: ${event.featuredOrder}\n`);
        }

        console.log('🎉 Done! These events will now appear on the homepage');
        console.log('   Visit the homepage to see them');
        console.log('   Or go to Admin → Manage Events to change featured status\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    }
};

featureEvents();
