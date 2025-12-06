require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Event = require('../models/Event');

const publishAllEvents = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs_alumni');
        console.log('✅ Connected to MongoDB');

        // Find all unpublished events
        const unpublishedEvents = await Event.find({ isPublished: false });

        console.log(`Found ${unpublishedEvents.length} unpublished event(s)`);

        if (unpublishedEvents.length === 0) {
            console.log('✅ All events are already published!');
            process.exit(0);
        }

        // Update all to published
        const result = await Event.updateMany(
            { isPublished: false },
            { $set: { isPublished: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} event(s) to published status`);

        // Show the updated events
        console.log('\nPublished events:');
        unpublishedEvents.forEach(event => {
            console.log(`  - ${event.title} (${event._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

publishAllEvents();
