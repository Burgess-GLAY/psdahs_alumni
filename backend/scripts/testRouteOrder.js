// Simple script to verify route order is correct
const express = require('express');

console.log('Testing Route Order Logic\n');
console.log('=========================\n');

// Simulate Express route matching
const routes = [
    { method: 'GET', path: '/', name: 'getEvents' },
    { method: 'GET', path: '/upcoming', name: 'getUpcomingEvents' },
    { method: 'GET', path: '/featured', name: 'getFeaturedEvents' },
    { method: 'GET', path: '/user/registered', name: 'getUserRegisteredEvents' },
    { method: 'POST', path: '/:id/register', name: 'registerForEvent' },
    { method: 'DELETE', path: '/:id/register', name: 'cancelEventRegistration' },
    { method: 'POST', path: '/', name: 'createEvent' },
    { method: 'PUT', path: '/:id/featured', name: 'toggleFeaturedStatus' },
    { method: 'PUT', path: '/:id/status', name: 'updateEventStatus' },
    { method: 'GET', path: '/:id/attendees', name: 'getEventAttendees' },
    { method: 'PUT', path: '/:id', name: 'updateEvent' },
    { method: 'DELETE', path: '/:id', name: 'deleteEvent' },
    { method: 'GET', path: '/:id', name: 'getEventById' }
];

// Test URLs
const testUrls = [
    { method: 'GET', url: '/api/events' },
    { method: 'GET', url: '/api/events/upcoming' },
    { method: 'GET', url: '/api/events/featured' },
    { method: 'GET', url: '/api/events/123456' },
    { method: 'PUT', url: '/api/events/123456/featured' },
    { method: 'PUT', url: '/api/events/123456/status' },
    { method: 'GET', url: '/api/events/123456/attendees' },
    { method: 'PUT', url: '/api/events/123456' },
    { method: 'DELETE', url: '/api/events/123456' }
];

function matchRoute(method, url) {
    // Remove /api/events prefix
    const path = url.replace('/api/events', '') || '/';

    for (const route of routes) {
        if (route.method !== method) continue;

        // Exact match
        if (route.path === path) {
            return route.name;
        }

        // Pattern match for :id
        const routePattern = route.path.replace(':id', '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        if (regex.test(path)) {
            return route.name;
        }
    }

    return 'NO MATCH';
}

console.log('Route Matching Test:\n');
testUrls.forEach(test => {
    const match = matchRoute(test.method, test.url);
    const status = match !== 'NO MATCH' ? '✅' : '❌';
    console.log(`${status} ${test.method.padEnd(6)} ${test.url.padEnd(40)} → ${match}`);
});

console.log('\n=========================\n');
console.log('Expected Results:');
console.log('✅ All routes should match correctly');
console.log('✅ /featured and /status should NOT match getEventById');
console.log('✅ Specific routes should match before generic /:id route');
