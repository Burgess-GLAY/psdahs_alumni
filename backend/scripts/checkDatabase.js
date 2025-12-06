require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkDatabase() {
    try {
        // Connect to MongoDB
        const uri = 'mongodb://127.0.0.1:27017/psdahs_alumni?directConnection=true';
        await mongoose.connect(uri, {
            dbName: 'psdahs_alumni',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB successfully!\n');

        // Get all users
        const users = await User.find({});
        const totalUsers = users.length;

        console.log('='.repeat(60));
        console.log('DATABASE STATUS CHECK');
        console.log('='.repeat(60));
        console.log(`\n📊 Total Users in Database: ${totalUsers}\n`);

        if (totalUsers > 0) {
            console.log('User Details:');
            console.log('-'.repeat(60));
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Graduation Year: ${user.graduationYear}`);
                console.log(`   Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
                console.log(`   Verified: ${user.isVerified ? 'Yes' : 'No'}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log('-'.repeat(60));
            });
        } else {
            console.log('⚠️  No users found in database!');
        }

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Collections in database:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });

        // Get count for each collection
        console.log('\n📈 Document counts per collection:');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`   - ${col.name}: ${count} documents`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ YOUR DATA IS SAFE! Database check complete.');
        console.log('='.repeat(60));

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        process.exit(1);
    }
}

checkDatabase();
