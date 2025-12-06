require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function listAllDatabases() {
    try {
        // Connect to MongoDB
        const uri = 'mongodb://127.0.0.1:27017/?directConnection=true';
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB successfully!\n');

        // Get admin database to list all databases
        const adminDb = mongoose.connection.db.admin();
        const { databases } = await adminDb.listDatabases();

        console.log('='.repeat(70));
        console.log('ALL DATABASES IN MONGODB');
        console.log('='.repeat(70));
        console.log(`\nFound ${databases.length} database(s):\n`);

        // Check each database for users collection
        for (const db of databases) {
            console.log('-'.repeat(70));
            console.log(`📁 Database: ${db.name}`);
            console.log(`   Size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);

            // Connect to this specific database to check collections
            const dbConnection = mongoose.connection.client.db(db.name);
            const collections = await dbConnection.listCollections().toArray();

            console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);

            // Check if users collection exists
            const hasUsers = collections.some(c => c.name === 'users');
            if (hasUsers) {
                const userCount = await dbConnection.collection('users').countDocuments();
                console.log(`   👥 USER COUNT: ${userCount} users`);

                if (userCount > 0) {
                    // Get sample user emails
                    const sampleUsers = await dbConnection.collection('users')
                        .find({})
                        .limit(5)
                        .toArray();

                    console.log(`   📧 Sample users:`);
                    sampleUsers.forEach((user, i) => {
                        console.log(`      ${i + 1}. ${user.firstName || 'N/A'} ${user.lastName || 'N/A'} (${user.email})`);
                    });
                }
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ Database scan complete!');
        console.log('='.repeat(70));

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error listing databases:', error.message);
        process.exit(1);
    }
}

listAllDatabases();
