/**
 * Complete Class Workflow Test
 * 
 * This script tests the full admin workflow for class groups:
 * 1. Create class → verify on public page
 * 2. Edit class → verify changes on public page
 * 3. Add members → verify member count
 * 4. Delete class → verify removal from public page
 * 
 * Requirements: 1.1, 1.3
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Test data
let adminToken = null;
let testClassId = null;
let testUserId = null;
let userToken = null;

// Color codes for console output
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

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logSuccess('Connected to MongoDB');
    } catch (error) {
        logError(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
}

// Authenticate as admin
async function authenticateAdmin() {
    logStep(1, 'Authenticate as Admin');

    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@psdahs.local',
            password: 'admin123'
        });

        adminToken = response.data.token;
        logSuccess('Admin authenticated successfully');
        logInfo(`Admin token: ${adminToken.substring(0, 20)}...`);
        return true;
    } catch (error) {
        logError(`Admin authentication failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Create a test user for membership testing
async function createTestUser() {
    logStep(2, 'Create Test User for Membership');

    try {
        const timestamp = Date.now();
        const testUserData = {
            firstName: 'Test',
            lastName: 'Member',
            email: `testmember${timestamp}@test.com`,
            password: 'Test123!',
            graduationYear: 2024
        };

        const response = await axios.post(`${API_BASE_URL}/auth/register`, testUserData);

        testUserId = response.data.user?.id || response.data.user?._id || response.data.data?._id;
        userToken = response.data.token;

        logSuccess('Test user created successfully');
        logInfo(`User ID: ${testUserId}`);
        logInfo(`User email: ${testUserData.email}`);
        return true;
    } catch (error) {
        logError(`Test user creation failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 1: Create a new class
async function createClass() {
    logStep(3, 'Create New Class via Admin');

    try {
        const timestamp = Date.now();
        const graduationYear = 2024;

        const classData = {
            name: `Test Class ${timestamp}`,
            description: 'This is a test class for workflow verification',
            graduationYear: graduationYear,
            motto: 'Test, Learn, Succeed',
            isPublic: true
        };

        logInfo(`Sending request to: ${API_BASE_URL}/class-groups`);
        logInfo(`x-auth-token: ${adminToken.substring(0, 20)}...`);

        const response = await axios.post(
            `${API_BASE_URL}/class-groups`,
            classData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': adminToken
                }
            }
        );

        testClassId = response.data.data._id;

        logSuccess('Class created successfully');
        logInfo(`Class ID: ${testClassId}`);
        logInfo(`Class Name: ${response.data.data.name}`);
        logInfo(`Graduation Year: ${response.data.data.graduationYear}`);
        logInfo(`Motto: ${response.data.data.motto}`);

        return response.data.data;
    } catch (error) {
        logError(`Class creation failed: ${error.response?.data?.error || error.message}`);
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Response data: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

// Step 2: Verify class appears on public page
async function verifyClassOnPublicPage(expectedClass) {
    logStep(4, 'Verify Class Appears on Public Page');

    try {
        const response = await axios.get(`${API_BASE_URL}/class-groups?limit=100`);

        const foundClass = response.data.data.find(c => c._id === testClassId);

        if (!foundClass) {
            logError('Class not found on public page');
            return false;
        }

        logSuccess('Class found on public page');

        // Verify all fields match
        const fieldsToCheck = ['name', 'description', 'graduationYear', 'motto'];
        let allFieldsMatch = true;

        for (const field of fieldsToCheck) {
            if (foundClass[field] === expectedClass[field]) {
                logSuccess(`  ${field}: ${foundClass[field]}`);
            } else {
                logError(`  ${field} mismatch: expected "${expectedClass[field]}", got "${foundClass[field]}"`);
                allFieldsMatch = false;
            }
        }

        return allFieldsMatch;
    } catch (error) {
        logError(`Public page verification failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 3: Edit the class
async function editClass() {
    logStep(5, 'Edit Class via Admin');

    try {
        const updateData = {
            name: 'Updated Test Class',
            description: 'This class has been updated',
            motto: 'Updated Motto: Excellence in Everything'
        };

        const response = await axios.put(
            `${API_BASE_URL}/class-groups/${testClassId}`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': adminToken
                }
            }
        );

        logSuccess('Class updated successfully');
        logInfo(`Updated Name: ${response.data.data.name}`);
        logInfo(`Updated Description: ${response.data.data.description}`);
        logInfo(`Updated Motto: ${response.data.data.motto}`);

        return response.data.data;
    } catch (error) {
        logError(`Class update failed: ${error.response?.data?.error || error.message}`);
        return null;
    }
}

// Step 4: Verify changes appear on public page
async function verifyClassUpdatesOnPublicPage(expectedClass) {
    logStep(6, 'Verify Class Updates Appear on Public Page');

    try {
        // Add a small delay to ensure database has propagated changes
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await axios.get(`${API_BASE_URL}/class-groups?limit=100`);

        const foundClass = response.data.data.find(c => c._id === testClassId);

        if (!foundClass) {
            logError('Class not found on public page after update');
            return false;
        }

        logSuccess('Updated class found on public page');

        // Verify updated fields
        const fieldsToCheck = ['name', 'description', 'motto'];
        let allFieldsMatch = true;

        for (const field of fieldsToCheck) {
            if (foundClass[field] === expectedClass[field]) {
                logSuccess(`  ${field}: ${foundClass[field]}`);
            } else {
                logError(`  ${field} mismatch: expected "${expectedClass[field]}", got "${foundClass[field]}"`);
                allFieldsMatch = false;
            }
        }

        return allFieldsMatch;
    } catch (error) {
        logError(`Public page verification failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 5: Add member to class
async function addMemberToClass() {
    logStep(7, 'Add Member to Class');

    try {
        const response = await axios.post(
            `${API_BASE_URL}/class-groups/${testClassId}/join`,
            {},
            {
                headers: {
                    'x-auth-token': userToken
                }
            }
        );

        logSuccess('Member added to class successfully');
        logInfo(`New member count: ${response.data.data.memberCount}`);

        return response.data.data.memberCount;
    } catch (error) {
        logError(`Adding member failed: ${error.response?.data?.error || error.message}`);
        return null;
    }
}

// Step 6: Verify member count on public page
async function verifyMemberCountOnPublicPage(expectedCount) {
    logStep(8, 'Verify Member Count on Public Page');

    try {
        // Add a small delay to ensure database has propagated changes
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await axios.get(`${API_BASE_URL}/class-groups?limit=100`);

        const foundClass = response.data.data.find(c => c._id === testClassId);

        if (!foundClass) {
            logError('Class not found on public page');
            return false;
        }

        logSuccess('Class found on public page');

        if (foundClass.memberCount === expectedCount) {
            logSuccess(`  Member count matches: ${foundClass.memberCount}`);
            return true;
        } else {
            logError(`  Member count mismatch: expected ${expectedCount}, got ${foundClass.memberCount}`);
            return false;
        }
    } catch (error) {
        logError(`Public page verification failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 7: Verify members list
async function verifyMembersList() {
    logStep(9, 'Verify Members List');

    try {
        const response = await axios.get(
            `${API_BASE_URL}/class-groups/${testClassId}/members`,
            {
                headers: {
                    'x-auth-token': adminToken
                }
            }
        );

        logSuccess('Members list retrieved successfully');
        logInfo(`Total members: ${response.data.count}`);

        const foundMember = response.data.data.find(m => m._id === testUserId);

        if (foundMember) {
            logSuccess(`  Test user found in members list`);
            logInfo(`    Name: ${foundMember.firstName} ${foundMember.lastName}`);
            logInfo(`    Email: ${foundMember.email}`);
            return true;
        } else {
            logError('  Test user not found in members list');
            return false;
        }
    } catch (error) {
        logError(`Members list verification failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 8: Delete the class
async function deleteClass() {
    logStep(10, 'Delete Class via Admin');

    try {
        await axios.delete(
            `${API_BASE_URL}/class-groups/${testClassId}`,
            {
                headers: {
                    'x-auth-token': adminToken
                }
            }
        );

        logSuccess('Class deleted successfully');
        return true;
    } catch (error) {
        logError(`Class deletion failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Step 9: Verify class removed from public page
async function verifyClassRemovedFromPublicPage() {
    logStep(11, 'Verify Class Removed from Public Page');

    try {
        // Add a small delay to ensure database has propagated changes
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await axios.get(`${API_BASE_URL}/class-groups?limit=100`);

        const foundClass = response.data.data.find(c => c._id === testClassId);

        if (!foundClass) {
            logSuccess('Class successfully removed from public page');
            return true;
        } else {
            logError('Class still appears on public page after deletion');
            return false;
        }
    } catch (error) {
        logError(`Public page verification failed: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

// Cleanup test user
async function cleanupTestUser() {
    logStep(12, 'Cleanup Test User');

    try {
        const User = require('../models/User');
        await User.findByIdAndDelete(testUserId);
        logSuccess('Test user cleaned up successfully');
    } catch (error) {
        logError(`Test user cleanup failed: ${error.message}`);
    }
}

// Main test execution
async function runCompleteWorkflowTest() {
    log('\n' + '='.repeat(60), 'yellow');
    log('COMPLETE CLASS WORKFLOW TEST', 'yellow');
    log('Testing: Create → Edit → Add Members → Delete', 'yellow');
    log('='.repeat(60) + '\n', 'yellow');

    await connectDB();

    const results = {
        adminAuth: false,
        userCreation: false,
        classCreation: false,
        classOnPublicPage: false,
        classEdit: false,
        classUpdatesOnPublicPage: false,
        memberAddition: false,
        memberCountOnPublicPage: false,
        membersList: false,
        classDeletion: false,
        classRemovedFromPublicPage: false
    };

    try {
        // Step 1: Authenticate as admin
        results.adminAuth = await authenticateAdmin();
        if (!results.adminAuth) {
            throw new Error('Admin authentication failed');
        }

        // Step 2: Create test user
        results.userCreation = await createTestUser();
        if (!results.userCreation) {
            throw new Error('Test user creation failed');
        }

        // Step 3: Create class
        const createdClass = await createClass();
        results.classCreation = !!createdClass;
        if (!results.classCreation) {
            throw new Error('Class creation failed');
        }

        // Step 4: Verify class on public page
        results.classOnPublicPage = await verifyClassOnPublicPage(createdClass);

        // Step 5: Edit class
        const updatedClass = await editClass();
        results.classEdit = !!updatedClass;
        if (!results.classEdit) {
            throw new Error('Class edit failed');
        }

        // Step 6: Verify updates on public page
        results.classUpdatesOnPublicPage = await verifyClassUpdatesOnPublicPage(updatedClass);

        // Step 7: Add member to class
        const newMemberCount = await addMemberToClass();
        results.memberAddition = !!newMemberCount;

        // Step 8: Verify member count on public page
        if (results.memberAddition) {
            results.memberCountOnPublicPage = await verifyMemberCountOnPublicPage(newMemberCount);
        }

        // Step 9: Verify members list
        results.membersList = await verifyMembersList();

        // Step 10: Delete class
        results.classDeletion = await deleteClass();

        // Step 11: Verify class removed from public page
        if (results.classDeletion) {
            results.classRemovedFromPublicPage = await verifyClassRemovedFromPublicPage();
        }

        // Step 12: Cleanup test user
        await cleanupTestUser();

    } catch (error) {
        logError(`\nTest execution error: ${error.message}`);
    } finally {
        await mongoose.connection.close();
        logInfo('\nDatabase connection closed');
    }

    // Print summary
    log('\n' + '='.repeat(60), 'yellow');
    log('TEST SUMMARY', 'yellow');
    log('='.repeat(60), 'yellow');

    const testResults = [
        { name: 'Admin Authentication', result: results.adminAuth },
        { name: 'Test User Creation', result: results.userCreation },
        { name: 'Class Creation', result: results.classCreation },
        { name: 'Class on Public Page', result: results.classOnPublicPage },
        { name: 'Class Edit', result: results.classEdit },
        { name: 'Class Updates on Public Page', result: results.classUpdatesOnPublicPage },
        { name: 'Member Addition', result: results.memberAddition },
        { name: 'Member Count on Public Page', result: results.memberCountOnPublicPage },
        { name: 'Members List Verification', result: results.membersList },
        { name: 'Class Deletion', result: results.classDeletion },
        { name: 'Class Removed from Public Page', result: results.classRemovedFromPublicPage }
    ];

    testResults.forEach(test => {
        if (test.result) {
            logSuccess(`${test.name}: PASSED`);
        } else {
            logError(`${test.name}: FAILED`);
        }
    });

    const passedTests = testResults.filter(t => t.result).length;
    const totalTests = testResults.length;

    log('\n' + '='.repeat(60), 'yellow');
    log(`FINAL RESULT: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'red');
    log('='.repeat(60) + '\n', 'yellow');

    // Exit with appropriate code
    process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the test
runCompleteWorkflowTest();
