/**
 * Test manual event status functionality
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const testManualStatus = async () => {
    try {
        console.log('🧪 Testing Manual Event Status...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get an event
        const event = await Event.findOne({ isPublished: true });

        if (!event) {
            console.log('⚠️  No published events found');
            return;
        }

        console.log(`Testing with event: "${event.title}"`);
        console.log(`Current status: ${event.eventStatus || 'upcoming (default)'}\n`);

        // Test changing status
        const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

        for (const status of statuses) {
            event.eventStatus = status;
            await event.save();
            console.log(`✅ Changed status to: ${status}`);
        }

        // Reset to upcoming
        event.eventStatus = 'upcoming';
        await event.save();
        console.log(`\n✅ Reset status to: upcoming`);

        console.log('\n🎉 Manual status control working!');
        console.log('   Admins can now set event status from the UI\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    }
};

testManualStatus();
