/**
 * Task 10.1: Complete Admin Workflow Test for Events
 * 
 * This script tests the complete event management workflow:
 * 1. Create event → verify on public page
 * 2. Edit event → verify changes on public page
 * 3. Toggle featured → verify on homepage
 * 4. Change status → verify on public page
 * 5. Delete event → verify removal from public page
 * 
 * Requirements: 1.1, 1.2
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testEventId = '';

// Colors for console output
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

// Helper function to login as admin
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

// Step 1: Create event and verify on public page
async function testCreateEvent() {
    logStep(1, 'Create Event → Verify on Public Page');

    try {
        // Create event data
        const eventData = {
            title: `Test Event ${Date.now()}`,
            description: 'This is a test event created by the integration test script',
            category: 'workshop',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
            location: 'Test Location - Main Hall',
            capacity: 100,
            registrationEnabled: true,
            eventStatus: 'upcoming'
        };

        logInfo(`Creating event: "${eventData.title}"`);

        // Create event via admin API
        const createResponse = await axios.post(`${API_BASE_URL}/events`, eventData, {
            headers: { 'x-auth-token': authToken }
        });

        if (createResponse.data.success) {
            testEventId = createResponse.data.data._id;
            logSuccess(`Event created successfully with ID: ${testEventId}`);
        } else {
            throw new Error('Event creation failed');
        }

        // Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify event appears on public events page
        logInfo('Verifying event appears on public events page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/events`);

        const eventOnPublicPage = publicResponse.data.data.find(e => e._id === testEventId);

        if (eventOnPublicPage) {
            logSuccess('Event found on public events page');
            logInfo(`  Title: ${eventOnPublicPage.title}`);
            logInfo(`  Location: ${eventOnPublicPage.location}`);
            logInfo(`  Status: ${eventOnPublicPage.eventStatus}`);
            return true;
        } else {
            logError('Event NOT found on public events page');
            return false;
        }
    } catch (error) {
        logError(`Create event test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 2: Edit event and verify changes on public page
async function testEditEvent() {
    logStep(2, 'Edit Event → Verify Changes on Public Page');

    try {
        const updatedData = {
            title: `Updated Test Event ${Date.now()}`,
            description: 'This event has been updated by the integration test',
            location: 'Updated Location - Conference Room B',
            capacity: 150
        };

        logInfo(`Updating event ${testEventId}...`);
        logInfo(`  New title: "${updatedData.title}"`);
        logInfo(`  New location: "${updatedData.location}"`);

        // Update event via admin API
        const updateResponse = await axios.put(
            `${API_BASE_URL}/events/${testEventId}`,
            updatedData,
            { headers: { 'x-auth-token': authToken } }
        );

        if (updateResponse.data.success) {
            logSuccess('Event updated successfully');
        } else {
            throw new Error('Event update failed');
        }

        // Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify changes appear on public page
        logInfo('Verifying changes on public events page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/events/${testEventId}`);

        const updatedEvent = publicResponse.data.data;

        if (updatedEvent.title === updatedData.title &&
            updatedEvent.location === updatedData.location &&
            updatedEvent.capacity === updatedData.capacity) {
            logSuccess('All changes verified on public page');
            logInfo(`  Title: ${updatedEvent.title}`);
            logInfo(`  Location: ${updatedEvent.location}`);
            logInfo(`  Capacity: ${updatedEvent.capacity}`);
            return true;
        } else {
            logError('Changes NOT reflected on public page');
            logInfo(`  Expected title: ${updatedData.title}`);
            logInfo(`  Actual title: ${updatedEvent.title}`);
            return false;
        }
    } catch (error) {
        logError(`Edit event test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 3: Toggle featured and verify on homepage
async function testToggleFeatured() {
    logStep(3, 'Toggle Featured → Verify on Homepage');

    try {
        logInfo(`Setting event ${testEventId} as featured...`);

        // Toggle featured status
        const toggleResponse = await axios.put(
            `${API_BASE_URL}/events/${testEventId}/featured`,
            { isFeatured: true },
            { headers: { 'x-auth-token': authToken } }
        );

        if (toggleResponse.data.success) {
            logSuccess('Event set as featured');
        } else {
            throw new Error('Toggle featured failed');
        }

        // Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify event appears in featured events
        logInfo('Verifying event appears in featured events...');
        const featuredResponse = await axios.get(`${API_BASE_URL}/events/featured`);

        const isFeatured = featuredResponse.data.data.some(e => e._id === testEventId);

        if (isFeatured) {
            logSuccess('Event found in featured events list');
            return true;
        } else {
            logError('Event NOT found in featured events list');
            return false;
        }
    } catch (error) {
        logError(`Toggle featured test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 4: Change status and verify on public page
async function testChangeStatus() {
    logStep(4, 'Change Status → Verify on Public Page');

    try {
        const newStatus = 'ongoing';
        logInfo(`Changing event status to "${newStatus}"...`);

        // Update event status
        const statusResponse = await axios.put(
            `${API_BASE_URL}/events/${testEventId}`,
            { eventStatus: newStatus },
            { headers: { 'x-auth-token': authToken } }
        );

        if (statusResponse.data.success) {
            logSuccess(`Event status changed to "${newStatus}"`);
        } else {
            throw new Error('Status change failed');
        }

        // Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify status change on public page
        logInfo('Verifying status change on public page...');
        const publicResponse = await axios.get(`${API_BASE_URL}/events/${testEventId}`);

        const updatedEvent = publicResponse.data.data;

        if (updatedEvent.eventStatus === newStatus) {
            logSuccess(`Status verified as "${newStatus}" on public page`);
            return true;
        } else {
            logError(`Status NOT updated on public page`);
            logInfo(`  Expected: ${newStatus}`);
            logInfo(`  Actual: ${updatedEvent.eventStatus}`);
            return false;
        }
    } catch (error) {
        logError(`Change status test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 5: Delete event and verify removal from public page
async function testDeleteEvent() {
    logStep(5, 'Delete Event → Verify Removal from Public Page');

    try {
        logInfo(`Deleting event ${testEventId}...`);

        // Delete event via admin API
        const deleteResponse = await axios.delete(
            `${API_BASE_URL}/events/${testEventId}`,
            { headers: { 'x-auth-token': authToken } }
        );

        if (deleteResponse.data.success) {
            logSuccess('Event deleted successfully');
        } else {
            throw new Error('Event deletion failed');
        }

        // Wait a moment for database to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify event is removed from public page
        logInfo('Verifying event is removed from public page...');

        try {
            const publicResponse = await axios.get(`${API_BASE_URL}/events/${testEventId}`);

            // If we get here, the event still exists
            logError('Event still exists on public page (should be deleted)');
            return false;
        } catch (error) {
            if (error.response?.status === 404) {
                logSuccess('Event successfully removed from public page (404 response)');
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        logError(`Delete event test failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Main test runner
async function runCompleteWorkflowTest() {
    log('\n' + '='.repeat(60), 'yellow');
    log('TASK 10.1: COMPLETE EVENT ADMIN WORKFLOW TEST', 'yellow');
    log('='.repeat(60) + '\n', 'yellow');

    const results = {
        login: false,
        create: false,
        edit: false,
        featured: false,
        status: false,
        delete: false
    };

    try {
        // Login
        results.login = await loginAsAdmin();
        if (!results.login) {
            logError('Cannot proceed without admin authentication');
            return results;
        }

        // Run all workflow steps
        results.create = await testCreateEvent();
        if (results.create) {
            results.edit = await testEditEvent();
            results.featured = await testToggleFeatured();
            results.status = await testChangeStatus();
            results.delete = await testDeleteEvent();
        }

        // Print summary
        log('\n' + '='.repeat(60), 'yellow');
        log('TEST SUMMARY', 'yellow');
        log('='.repeat(60), 'yellow');

        const steps = [
            { name: 'Admin Login', result: results.login },
            { name: 'Create Event → Public Page', result: results.create },
            { name: 'Edit Event → Public Page', result: results.edit },
            { name: 'Toggle Featured → Homepage', result: results.featured },
            { name: 'Change Status → Public Page', result: results.status },
            { name: 'Delete Event → Public Page', result: results.delete }
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

// Run the test
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
