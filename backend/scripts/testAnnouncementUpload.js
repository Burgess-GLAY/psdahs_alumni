const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAnnouncementCreation() {
    try {
        // First, login to get a token
        console.log('Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'root@psdahs.local',
            password: 'Carp12345@'
        });

        const token = loginResponse.data.token;
        console.log('Login successful! Token received.');

        // Create FormData
        const formData = new FormData();
        formData.append('title', 'Test Announcement with Image');
        formData.append('description', 'This is a test announcement to verify image upload functionality.');
        formData.append('category', 'updates');
        formData.append('startDate', new Date().toISOString());
        formData.append('isPublished', 'true');
        formData.append('tags[]', 'test');
        formData.append('tags[]', 'important');

        // Check if we have a test image, if not create a simple one
        const testImagePath = path.join(__dirname, '../uploads/temp/test-image.txt');
        if (!fs.existsSync(testImagePath)) {
            console.log('Creating test file...');
            fs.writeFileSync(testImagePath, 'This is a test file');
        }

        // Append the file
        formData.append('image', fs.createReadStream(testImagePath));

        console.log('Creating announcement...');
        const response = await axios.post('http://localhost:5000/api/announcements', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-auth-token': token
            }
        });

        console.log('Success! Announcement created:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAnnouncementCreation();
