const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassGroup = require('../models/ClassGroup');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/psdahs_alumni', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

// Class mottos for specific years (can be expanded)
const classMottos = {
    2007: 'Ad Altiora Tendo',
    2008: 'Ad Altiora Tendo',
    2009: 'Ad Altiora Tendo',
    2010: 'Ad Altiora Tendo',
    2011: 'Ad Altiora Tendo',
    2012: 'Ad Altiora Tendo',
    2013: 'Ad Altiora Tendo',
    2014: 'Ad Altiora Tendo',
    2015: 'Ad Altiora Tendo',
    2016: 'Ad Altiora Tendo',
    2017: 'Ad Altiora Tendo',
    2018: 'Ad Altiora Tendo',
    2019: 'Ad Altiora Tendo',
    2020: 'Ad Altiora Tendo',
    2021: 'Ad Altiora Tendo',
    2022: 'Ad Altiora Tendo',
    2023: 'Ad Altiora Tendo',
    2024: 'Ad Altiora Tendo'
};

// Migrate and ensure all class groups from 2007/2008 to 2024/2025 exist
const migrateClassGroups = async () => {
    try {
        console.log('Starting class groups migration...');
        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (let year = 2007; year <= 2024; year++) {
            const nextYear = year + 1;
            const academicYear = `${year}/${nextYear.toString().slice(-2)}`;
            const groupName = `Class of ${academicYear}`;

            // Check if class group already exists
            const existingGroup = await ClassGroup.findOne({ graduationYear: year });

            if (existingGroup) {
                // Update existing group to add motto field if missing
                let needsUpdate = false;

                if (!existingGroup.motto && classMottos[year]) {
                    existingGroup.motto = classMottos[year];
                    needsUpdate = true;
                }

                // Ensure coverImage has a value (placeholder or actual)
                if (!existingGroup.coverImage) {
                    existingGroup.coverImage = `/images/class-groups/placeholder-${year}.jpg`;
                    needsUpdate = true;
                }

                // Ensure bannerImage has a value
                if (!existingGroup.bannerImage) {
                    existingGroup.bannerImage = `/images/class-groups/banner-${year}.jpg`;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await existingGroup.save();
                    updated++;
                    console.log(`✓ Updated: ${groupName}`);
                } else {
                    skipped++;
                    console.log(`- Skipped (already exists): ${groupName}`);
                }
            } else {
                // Create new class group
                const newGroup = new ClassGroup({
                    name: groupName,
                    description: `Official group for PSD AHS alumni who graduated in the academic year ${academicYear}. Connect with your classmates, share memories, and stay updated on class reunions and events.`,
                    graduationYear: year,
                    motto: classMottos[year] || 'Ad Altiora Tendo',
                    coverImage: `/images/class-groups/placeholder-${year}.jpg`,
                    bannerImage: `/images/class-groups/banner-${year}.jpg`,
                    isPublic: true,
                    memberCount: 0,
                    postCount: 0,
                    eventCount: 0,
                    photoCount: 0,
                    members: [],
                    admins: [],
                    posts: [],
                    events: [],
                    albums: [],
                    tags: [`class-${year}`, `grad-${year}`, 'alumni', 'psd-ahs'],
                    settings: {
                        allowMemberPosts: true,
                        requireApproval: false,
                        sendNotifications: true
                    }
                });

                await newGroup.save();
                created++;
                console.log(`✓ Created: ${groupName}`);
            }
        }

        console.log('\n=== Migration Summary ===');
        console.log(`Created: ${created} class groups`);
        console.log(`Updated: ${updated} class groups`);
        console.log(`Skipped: ${skipped} class groups`);
        console.log(`Total: ${created + updated + skipped} class groups`);

        // Close the connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');

    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};

// Run the migration
(async () => {
    await connectDB();
    await migrateClassGroups();
})();
