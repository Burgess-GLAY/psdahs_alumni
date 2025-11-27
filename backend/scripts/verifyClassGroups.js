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

// Verify class groups
const verifyClassGroups = async () => {
    try {
        console.log('Verifying class groups in database...\n');

        const classGroups = await ClassGroup.find({})
            .sort({ graduationYear: 1 })
            .select('name graduationYear motto coverImage bannerImage memberCount');

        console.log(`Found ${classGroups.length} class groups:\n`);

        classGroups.forEach((group, index) => {
            console.log(`${index + 1}. ${group.name}`);
            console.log(`   Year: ${group.graduationYear}`);
            console.log(`   Motto: ${group.motto || 'Not set'}`);
            console.log(`   Cover Image: ${group.coverImage || 'Not set'}`);
            console.log(`   Banner Image: ${group.bannerImage || 'Not set'}`);
            console.log(`   Members: ${group.memberCount}`);
            console.log('');
        });

        // Verify all years from 2007 to 2024 exist
        const expectedYears = [];
        for (let year = 2007; year <= 2024; year++) {
            expectedYears.push(year);
        }

        const existingYears = classGroups.map(g => g.graduationYear);
        const missingYears = expectedYears.filter(y => !existingYears.includes(y));

        if (missingYears.length > 0) {
            console.log('⚠️  Missing class groups for years:', missingYears.join(', '));
        } else {
            console.log('✅ All class groups from 2007 to 2024 exist!');
        }

        // Check for motto field
        const groupsWithMotto = classGroups.filter(g => g.motto && g.motto.length > 0);
        console.log(`\n✅ ${groupsWithMotto.length}/${classGroups.length} groups have motto field set`);

        // Check for images
        const groupsWithCover = classGroups.filter(g => g.coverImage);
        const groupsWithBanner = classGroups.filter(g => g.bannerImage);
        console.log(`✅ ${groupsWithCover.length}/${classGroups.length} groups have cover image`);
        console.log(`✅ ${groupsWithBanner.length}/${classGroups.length} groups have banner image`);

        // Close the connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');

    } catch (error) {
        console.error('Error verifying class groups:', error);
        process.exit(1);
    }
};

// Run the verification
(async () => {
    await connectDB();
    await verifyClassGroups();
})();
