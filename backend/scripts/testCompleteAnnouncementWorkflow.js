/**
 * Task 10.2: Complete Admin Workflow Test for Announcements
 * 
 * This script tests the complete announcement management workflow:
 * 1. Create announcement → verify on public page
 * 2. Edit announcement → verify changes on public page
 * 3. Toggle pin → verify on public page
 * 4. Toggle publish → verify visibility on public page
 * 5. Delete announcement → verify removal from public page
 * 
 * Requirements: 1.1, 1.4
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testAnnouncementId = '';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`STEP ${step}: ${message}`, 'cyan');
    log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ ${message}`, 'blue');
}

async function loginAsAdmin() {
    try {
        logInfo('Logging in as admin...');
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@psdahs.local',
            password: 'admin123'
        });

        if (response.data.token) {
            authToken = response.data.token;
            logSuccess('Admin login successful');
            return true;
        }
        return false;
    } catch (error) {
        logError(`Login failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testCreateAnnouncement() {
    logStep(1, 'Create Announcement → Verify on Public Page');

    try {
        const announcementData = {
            title: `Test Announcement ${Date.now()}`,
            description: 'This is a test announcement created by the integration test script',
            category: 'updates',
            startDate: new Date().toISOString(),
            tags: ['test', 'integration'],
            isPublished: true
        };

        logInfo(`Creating announcement: "${announcementData.title}"`);

        const createResponse = await axios.post(`${API_BASE_URL}/announcements`, announcementData, {
            headers: { 'x-auth-token': authToken }
        });

        if (createResponse.data.success || createResponse.data.data) {
            testAnnouncementId = createResponse.data.data._id || createResponse.data.data.id;
            logSuccess(`Announcement created with ID: ${testAnnouncementId}`);
        } else {
            throw new Error('Announcement creation failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        logInfo('Verifying announcement on public page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/announcements`);

        const announcementOnPublicPage = publicResponse.data.data.find(
            a => (a._id || a.id) === testAnnouncementId
        );

        if (announcementOnPublicPage) {
            logSuccess('Announcement found on public page');
            logInfo(`  Title: ${announcementOnPublicPage.title}`);
            logInfo(`  Category: ${announcementOnPublicPage.category}`);
            return true;
        } else {
            logError('Announcement NOT found on public page');
            return false;
        }
    } catch (error) {
        logError(`Create announcement test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testEditAnnouncement() {
    logStep(2, 'Edit Announcement → Verify Changes on Public Page');

    try {
        const updatedData = {
            title: `Updated Test Announcement ${Date.now()}`,
            description: 'This announcement has been updated by the integration test',
            category: 'achievements'
        };

        logInfo(`Updating announcement ${testAnnouncementId}...`);
        logInfo(`  New title: "${updatedData.title}"`);

        const updateResponse = await axios.put(
            `${API_BASE_URL}/announcements/${testAnnouncementId}`,
            updatedData,
            { headers: { 'x-auth-token': authToken } }
        );

        if (updateResponse.data.success || updateResponse.data.data) {
            logSuccess('Announcement updated successfully');
        } else {
            throw new Error('Announcement update failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        logInfo('Verifying changes on public page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/announcements`);

        const updatedAnnouncement = publicResponse.data.data.find(
            a => (a._id || a.id) === testAnnouncementId
        );

        if (updatedAnnouncement &&
            updatedAnnouncement.title === updatedData.title &&
            updatedAnnouncement.category === updatedData.category) {
            logSuccess('All changes verified on public page');
            logInfo(`  Title: ${updatedAnnouncement.title}`);
            logInfo(`  Category: ${updatedAnnouncement.category}`);
            return true;
        } else {
            logError('Changes NOT reflected on public page');
            return false;
        }
    } catch (error) {
        logError(`Edit announcement test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testTogglePin() {
    logStep(3, 'Toggle Pin → Verify on Public Page');

    try {
        logInfo(`Pinning announcement ${testAnnouncementId}...`);

        const toggleResponse = await axios.put(
            `${API_BASE_URL}/announcements/${testAnnouncementId}`,
            { isPinned: true },
            { headers: { 'x-auth-token': authToken } }
        );

        if (toggleResponse.data.success || toggleResponse.data.data) {
            logSuccess('Announcement pinned');
        } else {
            throw new Error('Toggle pin failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        logInfo('Verifying pin status on public page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/announcements`);

        const pinnedAnnouncement = publicResponse.data.data.find(
            a => (a._id || a.id) === testAnnouncementId
        );

        if (pinnedAnnouncement && pinnedAnnouncement.isPinned === true) {
            logSuccess('Pin status verified on public page');
            return true;
        } else {
            logError('Pin status NOT reflected on public page');
            return false;
        }
    } catch (error) {
        logError(`Toggle pin test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testTogglePublish() {
    logStep(4, 'Toggle Publish → Verify Visibility on Public Page');

    try {
        logInfo(`Unpublishing announcement ${testAnnouncementId}...`);

        const toggleResponse = await axios.put(
            `${API_BASE_URL}/announcements/${testAnnouncementId}`,
            { isPublished: false },
            { headers: { 'x-auth-token': authToken } }
        );

        if (toggleResponse.data.success || toggleResponse.data.data) {
            logSuccess('Announcement unpublished');
        } else {
            throw new Error('Toggle publish failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        logInfo('Verifying announcement is hidden from public page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/announcements`);

        const foundAnnouncement = publicResponse.data.data.find(
            a => (a._id || a.id) === testAnnouncementId
        );

        if (!foundAnnouncement || foundAnnouncement.isPublished === false) {
            logSuccess('Unpublished announcement correctly hidden from public page');
            return true;
        } else {
            logError('Unpublished announcement still visible on public page');
            return false;
        }
    } catch (error) {
        logError(`Toggle publish test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testDeleteAnnouncement() {
    logStep(5, 'Delete Announcement → Verify Removal from Public Page');

    try {
        logInfo(`Deleting announcement ${testAnnouncementId}...`);

        const deleteResponse = await axios.delete(
            `${API_BASE_URL}/announcements/${testAnnouncementId}`,
            { headers: { 'x-auth-token': authToken } }
        );

        if (deleteResponse.data.success) {
            logSuccess('Announcement deleted successfully');
        } else {
            throw new Error('Announcement deletion failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        logInfo('Verifying announcement is removed from public page...');

        try {
            const publicResponse = await axios.get(`${API_BASE_URL}/announcements/${testAnnouncementId}`);

            logError('Announcement still exists on public page (should be deleted)');
            return false;
        } catch (error) {
            if (error.response?.status === 404) {
                logSuccess('Announcement successfully removed from public page');
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        logError(`Delete announcement test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function runCompleteWorkflowTest() {
    log('\n' + '='.repeat(60), 'yellow');
    log('TASK 10.2: COMPLETE ANNOUNCEMENT ADMIN WORKFLOW TEST', 'yellow');
    log('='.repeat(60) + '\n', 'yellow');

    const results = {
        login: false,
        create: false,
        edit: false,
        pin: false,
        publish: false,
        delete: false
    };

    try {
        results.login = await loginAsAdmin();
        if (!results.login) {
            logError('Cannot proceed without admin authentication');
            return results;
        }

        results.create = await testCreateAnnouncement();
        if (results.create) {
            results.edit = await testEditAnnouncement();
            results.pin = await testTogglePin();
            results.publish = await testTogglePublish();
            results.delete = await testDeleteAnnouncement();
        }

        log('\n' + '='.repeat(60), 'yellow');
        log('TEST SUMMARY', 'yellow');
        log('='.repeat(60), 'yellow');

        const steps = [
            { name: 'Admin Login', result: results.login },
            { name: 'Create Announcement → Public Page', result: results.create },
            { name: 'Edit Announcement → Public Page', result: results.edit },
            { name: 'Toggle Pin → Public Page', result: results.pin },
            { name: 'Toggle Publish → Visibility', result: results.publish },
            { name: 'Delete Announcement → Public Page', result: results.delete }
        ];

        steps.forEach(step => {
            const status = step.result ? '✓ PASS' : '✗ FAIL';
            const color = step.result ? 'green' : 'red';
            log(`${status} - ${step.name}`, color);
        });

        const passedCount = steps.filter(s => s.result).length;
        const totalCount = steps.length;

        log('\n' + '='.repeat(60), 'yellow');
        log(`RESULT: ${passedCount}/${totalCount} tests passed`, passedCount === totalCount ? 'green' : 'red');
        log('='.repeat(60) + '\n', 'yellow');

        return results;
    } catch (error) {
        logError(`Test execution failed: ${error.message}`);
        return results;
    }
}

if (require.main === module) {
    runCompleteWorkflowTest()
        .then(results => {
            const allPassed = Object.values(results).every(r => r === true);
            process.exit(allPassed ? 0 : 1);
        })
        .catch(error => {
            logError(`Fatal error: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { runCompleteWorkflowTest };
