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

// Quick verification
const quickVerify = async () => {
    try {
        const class2020 = await ClassGroup.findOne({ graduationYear: 2020 });

        console.log('\n=== VERIFICATION RESULT ===');
        if (class2020) {
            console.log(`Graduation Year 2020 → "${class2020.name}"`);
            if (class2020.name === 'Class of 2019/20') {
                console.log('✅ SUCCESS! Correctly using previous year format (2019/20)');
            } else {
                console.log('❌ FAILED! Still using old format');
            }
        } else {
            console.log('❌ No class group found for graduation year 2020');
        }
        console.log('===========================\n');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run
(async () => {
    await connectDB();
    await quickVerify();
})();
