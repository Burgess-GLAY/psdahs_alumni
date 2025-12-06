const mongoose = require('mongoose');
const Event = require('../models/Event');

async function checkEvents() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/psdahs_alumni');
        console.log('Connected to DB');

        const events = await Event.find({});
        console.log('Found', events.length, 'events');

        events.forEach(event => {
            console.log('--------------------------------');
            console.log('Title:', event.title);
            console.log('Image Field:', event.image);
            console.log('ID:', event._id);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEvents();
