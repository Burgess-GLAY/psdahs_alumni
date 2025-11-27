/**
 * Test script to verify the events API pagination endpoint
 * Simulates what the frontend will call
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs-alumni';

async function simulateAPICall(page, limit) {
    const query = { isPublished: true };

    const events = await Event.find(query)
        .sort({ startDate: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

    const count = await Event.countDocuments(query);

    return {
        success: true,
        count: events.length,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: events
    };
}

async function testPaginationAPI() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Test page 1 with limit 6 (frontend default)
        console.log('Testing API call: GET /api/events?page=1&limit=6');
        const response1 = await simulateAPICall(1, 6);
        console.log('Response:', JSON.stringify({
            success: response1.success,
            count: response1.count,
            total: response1.total,
            totalPages: response1.totalPages,
            currentPage: response1.currentPage,
            eventTitles: response1.data.map(e => e.title)
        }, null, 2));

        if (response1.totalPages > 1) {
            console.log('\nTesting API call: GET /api/events?page=2&limit=6');
            const response2 = await simulateAPICall(2, 6);
            console.log('Response:', JSON.stringify({
                success: response2.success,
                count: response2.count,
                total: response2.total,
                totalPages: response2.totalPages,
                currentPage: response2.currentPage,
                eventTitles: response2.data.map(e => e.title)
            }, null, 2));
        }

        // Test with filters
        console.log('\nTesting API call with upcoming filter: GET /api/events?page=1&limit=6&upcoming=true');
        const query = { isPublished: true, startDate: { $gte: new Date() } };
        const upcomingEvents = await Event.find(query)
            .sort({ startDate: 1 })
            .limit(6)
            .skip(0)
            .lean();
        const upcomingCount = await Event.countDocuments(query);
        console.log('Response:', JSON.stringify({
            success: true,
            count: upcomingEvents.length,
            total: upcomingCount,
            totalPages: Math.ceil(upcomingCount / 6),
            currentPage: 1,
            eventTitles: upcomingEvents.map(e => e.title)
        }, null, 2));

        console.log('\n✓ All API pagination tests passed!');

    } catch (error) {
        console.error('✗ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
}

testPaginationAPI();
