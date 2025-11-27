const mongoose = require('mongoose');
const Event = require('./backend/models/Event');
require('dotenv').config();

async function listEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const events = await Event.find({}).limit(3);
    console.log('Found events:');
    events.forEach(event => {
      console.log(`ID: ${event._id}, Title: ${event.title}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listEvents();
