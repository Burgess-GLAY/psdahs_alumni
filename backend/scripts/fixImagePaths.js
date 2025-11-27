/**
 * Script to fix image paths in the database
 * Updates old /images/ paths to /uploads/ for uploaded files
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

async function fixImagePaths() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/psdahs_alumni?directConnection=true', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');
        console.log('Starting image path migration...\n');

        // Fix announcement images
        console.log('Checking announcements...');
        const announcements = await Announcement.find({ imageUrl: { $exists: true, $ne: null } });
        let announcementUpdates = 0;

        for (const announcement of announcements) {
            // Only update if it's an uploaded file (not a class-groups image)
            if (announcement.imageUrl &&
                announcement.imageUrl.startsWith('/images/') &&
                !announcement.imageUrl.includes('/class-groups/')) {

                const oldPath = announcement.imageUrl;
                const newPath = announcement.imageUrl.replace('/images/', '/uploads/');

                announcement.imageUrl = newPath;
                await announcement.save();

                console.log(`  Updated announcement "${announcement.title}"`);
                console.log(`    From: ${oldPath}`);
                console.log(`    To:   ${newPath}`);
                announcementUpdates++;
            }
        }

        console.log(`\n✅ Updated ${announcementUpdates} announcement images\n`);

        // Fix user profile pictures
        console.log('Checking user profile pictures...');
        const users = await User.find({ profilePicture: { $exists: true, $ne: null } });
        let userUpdates = 0;

        for (const user of users) {
            // Only update if it's an uploaded file (not a default image)
            if (user.profilePicture &&
                user.profilePicture.startsWith('/images/') &&
                !user.profilePicture.includes('/default')) {

                const oldPath = user.profilePicture;
                const newPath = user.profilePicture.replace('/images/', '/uploads/');

                user.profilePicture = newPath;
                await user.save();

                console.log(`  Updated user "${user.firstName} ${user.lastName}"`);
                console.log(`    From: ${oldPath}`);
                console.log(`    To:   ${newPath}`);
                userUpdates++;
            }
        }

        console.log(`\n✅ Updated ${userUpdates} user profile pictures\n`);

        // Summary
        console.log('='.repeat(50));
        console.log('Migration Summary:');
        console.log(`  Announcements: ${announcementUpdates} updated`);
        console.log(`  Users: ${userUpdates} updated`);
        console.log(`  Total: ${announcementUpdates + userUpdates} records updated`);
        console.log('='.repeat(50));

        console.log('\n✅ Image path migration completed successfully!');

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the migration
fixImagePaths();
