require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const recreateAdminUser = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs_alumni');
        console.log('✅ Connected to MongoDB');

        // Delete existing admin user if exists
        const existingAdmin = await User.findOne({ email: 'admin@psdahs.local' });

        if (existingAdmin) {
            await User.deleteOne({ email: 'admin@psdahs.local' });
            console.log('✅ Deleted existing admin user');
        }

        // Create admin user (password will be hashed by pre-save hook)
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@psdahs.local',
            password: 'admin123', // Plain text - will be hashed by pre-save hook
            graduationYear: 2020,
            authMethod: 'local',
            isAdmin: true,
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123 (plain text for login)');
        console.log('Is Admin:', adminUser.isAdmin);
        console.log('Auth Method:', adminUser.authMethod);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

recreateAdminUser();
