const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./backend/models/User');

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/psdahs_alumni', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Successfully connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    
    console.log('\nUsers in database:');
    console.log('-----------------');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
      console.log(`Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log('-----------------');
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
