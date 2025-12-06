const { MongoClient } = require('mongodb');

async function findAllDatabases() {
    const client = new MongoClient('mongodb://127.0.0.1:27017');

    try {
        await client.connect();
        console.log('Connected to MongoDB\n');

        // List all databases
        const adminDb = client.db().admin();
        const { databases } = await adminDb.listDatabases();

        console.log('=== ALL DATABASES ON LOCAL MONGODB ===\n');

        for (const dbInfo of databases) {
            console.log(`Database: ${dbInfo.name}`);
            console.log(`Size: ${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);

            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();

            console.log(`Collections (${collections.length}):`);

            for (const coll of collections) {
                const count = await db.collection(coll.name).countDocuments();
                console.log(`  - ${coll.name}: ${count} documents`);

                // Show sample data for users collection
                if (coll.name === 'users' && count > 0) {
                    const users = await db.collection('users').find({}).limit(5).toArray();
                    console.log(`    Sample users:`);
                    users.forEach(user => {
                        console.log(`      * ${user.firstName} ${user.lastName} (${user.email})`);
                    });
                }

                // Show sample data for events collection
                if (coll.name === 'events' && count > 0) {
                    const events = await db.collection('events').find({}).limit(3).toArray();
                    console.log(`    Sample events:`);
                    events.forEach(event => {
                        console.log(`      * ${event.title}`);
                    });
                }
            }
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

findAllDatabases();
