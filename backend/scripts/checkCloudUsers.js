const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../../.env');

require('dotenv').config({ path: envPath });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkCloudUsers() {
    const output = [];
    const log = (msg) => {
        console.log(msg);
        output.push(msg);
    };

    try {
        log(`Resolved .env path: ${envPath}`);
        log(`File exists: ${fs.existsSync(envPath)}`);

        log('Connecting to MongoDB Atlas...');
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                log('Env file content preview:');
                log(envContent.substring(0, 200));
            }
            throw new Error('MONGODB_URI is undefined in .env');
        }

        log(`URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);

        await mongoose.connect(uri);
        log('Connected!');

        const users = await User.find({});
        log(`Total Users: ${users.length}`);

        if (users.length > 0) {
            log('Users found:');
            users.forEach(u => log(`- ${u.firstName} ${u.lastName} (${u.email})`));
        } else {
            log('No users found.');
        }

        await mongoose.connection.close();
        fs.writeFileSync('check_users_output.txt', output.join('\n'));
    } catch (err) {
        console.error('Error:', err);
        fs.writeFileSync('check_users_output.txt', `Error: ${err.message}\nLog:\n${output.join('\n')}`);
    }
}

checkCloudUsers();
