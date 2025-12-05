require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs_alumni');
        console.log('✅ Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@psdahs.local' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Is Admin:', existingAdmin.isAdmin);
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@psdahs.local',
            password: hashedPassword,
            graduationYear: 2020,
            isAdmin: true,
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123');
        console.log('Is Admin:', adminUser.isAdmin);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdminUser();
