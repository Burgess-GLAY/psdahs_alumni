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

// Generate class groups from 2007/2008 to 2024/2025
const generateClassGroups = async () => {
  try {
    const classGroups = [];

    for (let year = 2007; year <= 2024; year++) {
      const prevYear = year - 1;
      const academicYear = `${prevYear}/${year.toString().slice(-2)}`;
      const groupName = `Class of ${academicYear}`;

      // Default image path - replace with actual image paths
      const imageUrl = `/images/class-groups/class-${year}.jpg`;

      classGroups.push({
        name: groupName,
        description: `Official group for PSD AHS alumni who graduated in the academic year ${academicYear}`,
        graduationYear: year,
        image: imageUrl,
        isPublic: true,
        tags: [`class-${year}`, `grad-${year}`, 'alumni', 'psd-ahs'],
        location: 'Precious Blood Secondary School, Denu, Ghana',
        website: `https://alumni.psd-ghana.org/class-${year}`,
        contactEmail: `class${year}@psd-ghana.org`,
        socialMedia: {
          facebook: `https://facebook.com/groups/psd-ahs-${year}`,
          whatsapp: `https://chat.whatsapp.com/psd-ahs-${year}`,
          telegram: `https://t.me/psd-ahs-${year}`
        },
        settings: {
          allowMemberPosts: true,
          approvalRequired: false,
          eventsEnabled: true,
          photosEnabled: true,
          discussionsEnabled: true
        }
      });
    }

    // Clear existing class groups to regenerate with new naming convention
    await ClassGroup.deleteMany({});
    console.log('Cleared existing class groups');


    // Insert new class groups
    const result = await ClassGroup.insertMany(classGroups);
    console.log(`Successfully created ${result.length} class groups`);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');

    return result;
  } catch (error) {
    console.error('Error generating class groups:', error);
    process.exit(1);
  }
};

// Run the script
(async () => {
  await connectDB();
  await generateClassGroups();
})();
