/**
 * Integration tests for Edit Event functionality in AdminEventsPage
 * 
 * Tests Requirements:
 * - 3.1: Edit button opens pre-filled form dialog
 * - 3.2: Form is pre-populated with existing event data
 * - 3.3: Updated event data is saved via PUT request
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AdminEventsPage from '../AdminEventsPage';
import api from '../../../services/api';

// Mock the API
jest.mock('../../../services/api');

// Mock notifications
jest.mock('../../../utils/notifications', () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
}));

// Create a mock store
const createMockStore = () => {
    return configureStore({
        reducer: {
            auth: (state = { user: { isAdmin: true }, token: 'test-token' }) => state,
        },
    });
};

// Mock event data
const mockEvent = {
    _id: '123',
    title: 'Test Event',
    description: 'Test Description',
    category: 'reunion',
    startDate: '2024-12-01T10:00:00.000Z',
    endDate: '2024-12-01T18:00:00.000Z',
    location: 'Test Location',
    capacity: 100,
    registrationEnabled: true,
    featuredImage: 'test-image.jpg',
    speakers: [
        {
            name: 'John Doe',
            title: 'Speaker',
            bio: 'Test bio',
            photo: 'speaker.jpg',
            order: 0,
        },
    ],
    agenda: [
        {
            time: '10:00 AM',
            title: 'Opening',
            description: 'Opening remarks',
            speaker: 'John Doe',
            order: 0,
        },
    ],
    faq: [
        {
            question: 'Test question?',
            answer: 'Test answer',
            order: 0,
        },
    ],
    locationDetails: {
        venueName: 'Test Venue',
        address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country',
        },
        coordinates: {
            lat: 40.7128,
            lng: -74.0060,
        },
        directions: 'Test directions',
        parkingInfo: 'Test parking',
    },
    isPublished: true,
    eventType: 'reunion',
};

describe('AdminEventsPage - Edit Functionality', () => {
    let store;

    beforeEach(() => {
        store = createMockStore();
        jest.clearAllMocks();

        // Mock API responses
        api.get.mockResolvedValue({
            data: {
                success: true,
                data: [mockEvent],
                total: 1,
            },
        });
    });

    const renderComponent = () => {
        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <AdminEventsPage />
                </BrowserRouter>
            </Provider>
        );
    };

    test('Requirement 3.1: Edit button opens EventFormDialog', async () => {
        renderComponent();

        // Wait for events to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Find and click the Edit button
        const editButton = screen.getByLabelText('Edit Test Event');
        await userEvent.click(editButton);

        // Verify dialog opens
        await waitFor(() => {
            expect(screen.getByText('Edit Event')).toBeInTheDocument();
        });
    });

    test('Requirement 3.2: Form is pre-populated with existing event data', async () => {
        renderComponent();

        // Wait for events to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click Edit button
        const editButton = screen.getByLabelText('Edit Test Event');
        await userEvent.click(editButton);

        // Wait for dialog to open
        await waitFor(() => {
            expect(screen.getByText('Edit Event')).toBeInTheDocument();
        });

        // Verify basic fields are pre-populated
        expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();

        // Verify registration toggle is checked
        const registrationToggle = screen.getByRole('checkbox', { name: /enable registration/i });
        expect(registrationToggle).toBeChecked();

        // Verify speaker data is pre-populated
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Speaker')).toBeInTheDocument();

        // Verify agenda data is pre-populated
        expect(screen.getByDisplayValue('10:00 AM')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Opening')).toBeInTheDocument();

        // Verify FAQ data is pre-populated
        expect(screen.getByDisplayValue('Test question?')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test answer')).toBeInTheDocument();

        // Verify location details are pre-populated
        expect(screen.getByDisplayValue('Test Venue')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test City')).toBeInTheDocument();
    });

    test('Requirement 3.3: Updated event data is saved via PUT request', async () => {
        // Mock successful update
        api.put.mockResolvedValue({
            data: {
                success: true,
                data: { ...mockEvent, title: 'Updated Event' },
            },
        });

        renderComponent();

        // Wait for events to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click Edit button
        const editButton = screen.getByLabelText('Edit Test Event');
        await userEvent.click(editButton);

        // Wait for dialog to open
        await waitFor(() => {
            expect(screen.getByText('Edit Event')).toBeInTheDocument();
        });

        // Update the title
        const titleInput = screen.getByDisplayValue('Test Event');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, 'Updated Event');

        // Submit the form
        const updateButton = screen.getByRole('button', { name: /update event/i });
        await userEvent.click(updateButton);

        // Verify PUT request was made with correct data
        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(
                '/events/123',
                expect.any(FormData)
            );
        });

        // Verify success notification
        const { showSuccess } = require('../../../utils/notifications');
        expect(showSuccess).toHaveBeenCalledWith('Event updated successfully!');

        // Verify dialog closes
        await waitFor(() => {
            expect(screen.queryByText('Edit Event')).not.toBeInTheDocument();
        });

        // Verify events list is refreshed
        expect(api.get).toHaveBeenCalledTimes(2); // Initial load + refresh after update
    });

    test('Edit button passes correct event object to dialog', async () => {
        renderComponent();

        // Wait for events to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click Edit button
        const editButton = screen.getByLabelText('Edit Test Event');
        await userEvent.click(editButton);

        // Verify dialog opens with "Edit Event" title (not "Create New Event")
        await waitFor(() => {
            expect(screen.getByText('Edit Event')).toBeInTheDocument();
            expect(screen.queryByText('Create New Event')).not.toBeInTheDocument();
        });

        // Verify the submit button says "Update Event" (not "Create Event")
        expect(screen.getByRole('button', { name: /update event/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^create event$/i })).not.toBeInTheDocument();
    });

    test('Edit functionality handles API errors gracefully', async () => {
        // Mock API error
        api.put.mockRejectedValue({
            response: {
                data: {
                    message: 'Failed to update event',
                },
            },
        });

        renderComponent();

        // Wait for events to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click Edit button
        const editButton = screen.getByLabelText('Edit Test Event');
        await userEvent.click(editButton);

        // Wait for dialog to open
        await waitFor(() => {
            expect(screen.getByText('Edit Event')).toBeInTheDocument();
        });

        // Update the title
        const titleInput = screen.getByDisplayValue('Test Event');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, 'Updated Event');

        // Submit the form
        const updateButton = screen.getByRole('button', { name: /update event/i });
        await userEvent.click(updateButton);

        // Verify error notification
        await waitFor(() => {
            const { showError } = require('../../../utils/notifications');
            expect(showError).toHaveBeenCalledWith('Failed to update event');
        });

        // Verify dialog remains open (doesn't close on error)
        expect(screen.getByText('Edit Event')).toBeInTheDocument();
    });

    test('Events list refreshes after successful update', async () => {
        const updatedEvent = { ...mockEvent, title: 'Updated Event' };

        // Mock successful update
        api.put.mockResolvedValue({
            data: {
                success: true,
                data: updatedEvent,
            },
        });

        // Mock refreshed events list
        api.get.mockResolvedValueOnce({
            data: {
                success: true,
                data: [mockEvent],
                total: 1,
            },
        }).mockResolvedValueOnce({
            data: {
                success: true,
                data: [updatedEvent],
                total: 1,
            },
        });

        renderComponent();

        // Wait for initial events to load
        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        // Click Edit button
        const editButton = screen.getByLabelText('Edit Test Event');
        await userEvent.click(editButton);

        // Wait for dialog to open
        await waitFor(() => {
            expect(screen.getByText('Edit Event')).toBeInTheDocument();
        });

        // Update the title
        const titleInput = screen.getByDisplayValue('Test Event');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, 'Updated Event');

        // Submit the form
        const updateButton = screen.getByRole('button', { name: /update event/i });
        await userEvent.click(updateButton);

        // Wait for update to complete and list to refresh
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledTimes(2);
        });
    });
});
