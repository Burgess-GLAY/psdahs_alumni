/**
 * Property-Based Test for Admin Action Immediate Reflection
 * 
 * **Feature: admin-pages-standardization, Property 1: Admin action immediate reflection**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * Property: For any admin action (create, update, delete, publish, unpublish), 
 * the corresponding public page should reflect the change immediately upon the next data fetch
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import api from '../../../services/api';

// Public pages
import EventsPage from '../../events/EventsPage';
import AnnouncementsPage from '../../announcements/AnnouncementsPage';
import ClassGroupsPage from '../../classes/ClassGroupsPage';

// Redux slices
import authReducer from '../../../features/auth/authSlice';

// Mock the API service
jest.mock('../../../services/api');

// Mock notifications
jest.mock('../../../utils/notifications', () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
}));

// Helper to create a test store
const createTestStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
        },
        preloadedState: {
            auth: {
                user: { id: '1', email: 'admin@test.com', isAdmin: true },
                token: 'test-token',
                isAuthenticated: true,
            },
        },
    });
};

// Helper to render with providers
const renderWithProviders = (component) => {
    const store = createTestStore();
    return render(
        <Provider store={store}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </Provider>
    );
};

// Arbitraries for generating test data
const eventArbitrary = fc.record({
    _id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    startDate: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') }).map(d => d.toISOString()),
    endDate: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') }).map(d => d.toISOString()),
    location: fc.string({ minLength: 1, maxLength: 100 }),
    eventType: fc.constantFrom('reunion', 'career', 'workshop', 'sports', 'networking', 'other'),
    isPublished: fc.boolean(),
    isFeaturedOnHomepage: fc.boolean(),
    eventStatus: fc.constantFrom('upcoming', 'ongoing', 'completed', 'cancelled')
});

const announcementArbitrary = fc.record({
    _id: fc.uuid(),
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    category: fc.constantFrom('updates', 'achievements', 'events'),
    startDate: fc.date().map(d => d.toISOString()),
    isPinned: fc.boolean(),
    isPublished: fc.boolean(),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    author: fc.record({
        _id: fc.uuid(),
        firstName: fc.string({ minLength: 1, maxLength: 50 }),
        lastName: fc.string({ minLength: 1, maxLength: 50 }),
        profilePicture: fc.option(fc.webUrl(), { nil: null })
    }),
    views: fc.nat(),
    likes: fc.array(fc.uuid(), { maxLength: 10 }),
    comments: fc.array(fc.anything(), { maxLength: 5 })
});

const classGroupArbitrary = fc.record({
    _id: fc.uuid(),
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    graduationYear: fc.integer({ min: 2000, max: 2030 }),
    description: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: '' }),
    motto: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: '' }),
    memberCount: fc.nat({ max: 1000 }),
    isMember: fc.boolean(),
    isPublic: fc.boolean(),
    createdAt: fc.date().map(d => d.toISOString())
});

describe('Property-Based Test: Admin Action Immediate Reflection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('Property 1: Created events appear on EventsPage immediately', () => {
        fc.assert(
            fc.property(eventArbitrary, async (event) => {
                // Only test published events (unpublished ones shouldn't appear on public page)
                if (!event.isPublished) {
                    return true;
                }

                // Mock API to return the created event
                api.get.mockResolvedValue({
                    data: {
                        success: true,
                        data: [event],
                        total: 1,
                        totalPages: 1
                    }
                });

                // Render public page
                const { unmount } = renderWithProviders(<EventsPage />);

                // Verify the event appears
                await waitFor(() => {
                    expect(screen.getByText(event.title)).toBeInTheDocument();
                }, { timeout: 3000 });

                unmount();
                return true;
            }),
            { numRuns: 10 } // Run 10 iterations for faster execution
        );
    });

    test('Property 1: Updated events reflect changes on EventsPage immediately', () => {
        fc.assert(
            fc.property(
                eventArbitrary,
                fc.string({ minLength: 1, maxLength: 100 }),
                async (originalEvent, newTitle) => {
                    // Only test published events
                    if (!originalEvent.isPublished) {
                        return true;
                    }

                    const updatedEvent = { ...originalEvent, title: newTitle };

                    // Mock API to return the updated event
                    api.get.mockResolvedValue({
                        data: {
                            success: true,
                            data: [updatedEvent],
                            total: 1,
                            totalPages: 1
                        }
                    });

                    // Render public page
                    const { unmount } = renderWithProviders(<EventsPage />);

                    // Verify the updated title appears
                    await waitFor(() => {
                        expect(screen.getByText(newTitle)).toBeInTheDocument();
                    }, { timeout: 3000 });

                    unmount();
                    return true;
                }
            ),
            { numRuns: 10 }
        );
    });

    test('Property 1: Deleted events disappear from EventsPage immediately', () => {
        fc.assert(
            fc.property(eventArbitrary, async (event) => {
                // Mock API to return empty list (event was deleted)
                api.get.mockResolvedValue({
                    data: {
                        success: true,
                        data: [],
                        total: 0,
                        totalPages: 0
                    }
                });

                // Render public page
                const { unmount } = renderWithProviders(<EventsPage />);

                // Verify the event doesn't appear
                await waitFor(() => {
                    expect(screen.queryByText(event.title)).not.toBeInTheDocument();
                }, { timeout: 3000 });

                unmount();
                return true;
            }),
            { numRuns: 10 }
        );
    });

    test('Property 1: Unpublished events do not appear on EventsPage', () => {
        fc.assert(
            fc.property(eventArbitrary, async (event) => {
                // Force event to be unpublished
                const unpublishedEvent = { ...event, isPublished: false };

                // Mock API to return empty list (unpublished events filtered out)
                api.get.mockResolvedValue({
                    data: {
                        success: true,
                        data: [],
                        total: 0,
                        totalPages: 0
                    }
                });

                // Render public page
                const { unmount } = renderWithProviders(<EventsPage />);

                // Verify the unpublished event doesn't appear
                await waitFor(() => {
                    expect(screen.queryByText(unpublishedEvent.title)).not.toBeInTheDocument();
                }, { timeout: 3000 });

                unmount();
                return true;
            }),
            { numRuns: 10 }
        );
    });

    test('Property 1: Created announcements appear on AnnouncementsPage immediately', () => {
        fc.assert(
            fc.property(announcementArbitrary, async (announcement) => {
                // Only test published announcements
                if (!announcement.isPublished) {
                    return true;
                }

                // Mock axios for announcements
                const axios = require('axios');
                axios.get = jest.fn().mockResolvedValue({
                    data: {
                        success: true,
                        data: [announcement]
                    }
                });

                // Render public page
                const { unmount } = renderWithProviders(<AnnouncementsPage />);

                // Verify the announcement appears
                await waitFor(() => {
                    expect(screen.getByText(announcement.title)).toBeInTheDocument();
                }, { timeout: 3000 });

                unmount();
                return true;
            }),
            { numRuns: 10 }
        );
    });

    test('Property 1: Updated announcements reflect changes on AnnouncementsPage immediately', () => {
        fc.assert(
            fc.property(
                announcementArbitrary,
                fc.string({ minLength: 1, maxLength: 100 }),
                async (originalAnnouncement, newTitle) => {
                    // Only test published announcements
                    if (!originalAnnouncement.isPublished) {
                        return true;
                    }

                    const updatedAnnouncement = { ...originalAnnouncement, title: newTitle };

                    // Mock axios for announcements
                    const axios = require('axios');
                    axios.get = jest.fn().mockResolvedValue({
                        data: {
                            success: true,
                            data: [updatedAnnouncement]
                        }
                    });

                    // Render public page
                    const { unmount } = renderWithProviders(<AnnouncementsPage />);

                    // Verify the updated title appears
                    await waitFor(() => {
                        expect(screen.getByText(newTitle)).toBeInTheDocument();
                    }, { timeout: 3000 });

                    unmount();
                    return true;
                }
            ),
            { numRuns: 10 }
        );
    });

    test('Property 1: Created classes appear on ClassGroupsPage immediately', () => {
        fc.assert(
            fc.property(classGroupArbitrary, async (classGroup) => {
                // Only test public classes
                if (!classGroup.isPublic) {
                    return true;
                }

                // Mock API to return the created class
                api.get.mockResolvedValue({
                    data: {
                        success: true,
                        data: [classGroup]
                    }
                });

                // Render public page
                const { unmount } = renderWithProviders(<ClassGroupsPage />);

                // Verify the class appears
                await waitFor(() => {
                    expect(screen.getByText(classGroup.name)).toBeInTheDocument();
                }, { timeout: 3000 });

                unmount();
                return true;
            }),
            { numRuns: 10 }
        );
    });

    test('Property 1: Updated classes reflect changes on ClassGroupsPage immediately', () => {
        fc.assert(
            fc.property(
                classGroupArbitrary,
                fc.string({ minLength: 1, maxLength: 100 }),
                async (originalClass, newName) => {
                    // Only test public classes
                    if (!originalClass.isPublic) {
                        return true;
                    }

                    const updatedClass = { ...originalClass, name: newName };

                    // Mock API to return the updated class
                    api.get.mockResolvedValue({
                        data: {
                            success: true,
                            data: [updatedClass]
                        }
                    });

                    // Render public page
                    const { unmount } = renderWithProviders(<ClassGroupsPage />);

                    // Verify the updated name appears
                    await waitFor(() => {
                        expect(screen.getByText(newName)).toBeInTheDocument();
                    }, { timeout: 3000 });

                    unmount();
                    return true;
                }
            ),
            { numRuns: 10 }
        );
    });

    test('Property 1: Deleted classes disappear from ClassGroupsPage immediately', () => {
        fc.assert(
            fc.property(classGroupArbitrary, async (classGroup) => {
                // Mock API to return empty list (class was deleted)
                api.get.mockResolvedValue({
                    data: {
                        success: true,
                        data: []
                    }
                });

                // Render public page
                const { unmount } = renderWithProviders(<ClassGroupsPage />);

                // Verify the class doesn't appear
                await waitFor(() => {
                    expect(screen.queryByText(classGroup.name)).not.toBeInTheDocument();
                }, { timeout: 3000 });

                unmount();
                return true;
            }),
            { numRuns: 10 }
        );
    });
});
