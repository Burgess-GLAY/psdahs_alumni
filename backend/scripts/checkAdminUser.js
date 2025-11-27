require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function checkAdmin() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-network');
        console.log('✅ Connected\n');

        const User = require('../models/User');

        // Find all admin users
        const admins = await User.find({ isAdmin: true }).select('firstName lastName email isAdmin');

        console.log('Admin users found:');
        if (admins.length === 0) {
            console.log('❌ No admin users found!');
        } else {
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Admin: ${admin.isAdmin}`);
                console.log('');
            });
        }

        // Also check all users
        const allUsers = await User.find().select('firstName lastName email isAdmin');
        console.log(`\nTotal users in database: ${allUsers.length}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAdmin();
