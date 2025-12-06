require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const makeUserAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs_alumni');
        console.log('✅ Connected to MongoDB');

        const email = 'burgessglay12@gmail.com';

        // Find the user
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`Current admin status: ${user.isAdmin}`);

        // Update to admin
        user.isAdmin = true;
        await user.save();

        console.log('✅ User updated successfully!');
        console.log(`New admin status: ${user.isAdmin}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

makeUserAdmin();
