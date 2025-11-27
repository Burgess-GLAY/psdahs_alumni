/**
 * Tests for ClassGroupsPage component
 * 
 * Tests cover:
 * - Filtering by "All Groups" and "My Groups"
 * - Search functionality
 * - Sort options
 * - Membership status display
 * - Responsive layout
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ClassGroupsPage from '../ClassGroupsPage';
import classGroupService from '../../../services/classGroupService';
import { ClassGroupNotifications } from '../../../utils/notifications';

// Mock axios first to avoid import issues
jest.mock('axios');

// Mock dependencies
jest.mock('../../../services/classGroupService', () => ({
    __esModule: true,
    default: {
        fetchGroups: jest.fn(),
        joinGroup: jest.fn(),
        leaveGroup: jest.fn()
    }
}));

jest.mock('../../../utils/notifications', () => ({
    ClassGroupNotifications: {
        networkError: jest.fn(),
        authRequired: jest.fn(),
        joinSuccess: jest.fn(),
        leaveSuccess: jest.fn(),
        alreadyMember: jest.fn(),
        notMember: jest.fn(),
        joinError: jest.fn(),
        leaveError: jest.fn()
    }
}));

jest.mock('../../../components/classGroups/ClassGroupCard', () => {
    return function MockClassGroupCard({ classGroup, isMember, loading }) {
        if (loading) {
            return <div data-testid="loading-card">Loading...</div>;
        }
        return (
            <div data-testid={`class-group-card-${classGroup._id}`}>
                <h3>{classGroup.name}</h3>
                <p>{classGroup.memberCount} members</p>
                {isMember && <span data-testid="member-badge">Member</span>}
            </div>
        );
    };
});

// Mock data
const mockClassGroups = [
    {
        _id: '1',
        name: 'Class of 2024/25',
        graduationYear: 2024,
        memberCount: 50,
        isMember: true,
        coverImage: '/images/2024.jpg',
        motto: 'Excellence in all we do'
    },
    {
        _id: '2',
        name: 'Class of 2023/24',
        graduationYear: 2023,
        memberCount: 45,
        isMember: false,
        coverImage: '/images/2023.jpg',
        motto: 'Together we rise'
    },
    {
        _id: '3',
        name: 'Class of 2022/23',
        graduationYear: 2022,
        memberCount: 60,
        isMember: true,
        coverImage: '/images/2022.jpg',
        motto: 'Strength in unity'
    },
    {
        _id: '4',
        name: 'Class of 2021/22',
        graduationYear: 2021,
        memberCount: 30,
        isMember: false,
        coverImage: '/images/2021.jpg'
    }
];

// Helper function to create mock store
const createMockStore = (isAuthenticated = true) => {
    return configureStore({
        reducer: {
            auth: (state = { isAuthenticated, user: isAuthenticated ? { id: 'user1', name: 'Test User' } : null }) => state
        }
    });
};

// Helper function to render component with providers
const renderWithProviders = (component, { isAuthenticated = true } = {}) => {
    const store = createMockStore(isAuthenticated);
    return render(
        <Provider store={store}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </Provider>
    );
};

describe('ClassGroupsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        classGroupService.fetchGroups.mockResolvedValue({
            data: mockClassGroups
        });
    });

    describe('Initial Rendering', () => {
        test('should render page header and description', async () => {
            renderWithProviders(<ClassGroupsPage />);

            expect(screen.getByText('Class Groups')).toBeInTheDocument();
            expect(screen.getByText(/Connect with your classmates/i)).toBeInTheDocument();
        });

        test('should show loading skeletons while fetching data', () => {
            renderWithProviders(<ClassGroupsPage />);

            const loadingCards = screen.getAllByTestId('loading-card');
            expect(loadingCards).toHaveLength(6);
        });

        test('should fetch and display class groups on mount', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(classGroupService.fetchGroups).toHaveBeenCalledWith({
                    limit: 100,
                    sortBy: 'year-desc'
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Class of 2024/25')).toBeInTheDocument();
                expect(screen.getByText('Class of 2023/24')).toBeInTheDocument();
            });
        });
    });

    describe('Tab Filtering - All Groups vs My Groups', () => {
        test('should display "All Groups" tab by default', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                const allGroupsTab = screen.getByRole('tab', { name: /All Groups/i });
                expect(allGroupsTab).toHaveAttribute('aria-selected', 'true');
            });
        });

        test('should show all groups in "All Groups" tab', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
                expect(screen.getByTestId('class-group-card-2')).toBeInTheDocument();
                expect(screen.getByTestId('class-group-card-3')).toBeInTheDocument();
                expect(screen.getByTestId('class-group-card-4')).toBeInTheDocument();
            });
        });

        test('should switch to "My Groups" tab and filter groups', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const myGroupsTab = screen.getByRole('tab', { name: /My Groups/i });
            fireEvent.click(myGroupsTab);

            await waitFor(() => {
                expect(classGroupService.fetchGroups).toHaveBeenCalledWith({
                    limit: 100,
                    sortBy: 'year-desc',
                    filter: 'my-groups'
                });
            });
        });

        test('should show correct group count in tab labels', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /All Groups \(4\)/i })).toBeInTheDocument();
                expect(screen.getByRole('tab', { name: /My Groups \(2\)/i })).toBeInTheDocument();
            });
        });

        test('should disable "My Groups" tab when user is not authenticated', async () => {
            renderWithProviders(<ClassGroupsPage />, { isAuthenticated: false });

            await waitFor(() => {
                const myGroupsTab = screen.getByRole('tab', { name: /My Groups/i });
                expect(myGroupsTab).toHaveAttribute('aria-disabled', 'true');
            });
        });

        test('should clear search when switching tabs', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            // Enter search term
            const searchInput = screen.getByPlaceholderText(/Search by class name or year/i);
            fireEvent.change(searchInput, { target: { value: '2024' } });
            expect(searchInput.value).toBe('2024');

            // Switch tabs
            const myGroupsTab = screen.getByRole('tab', { name: /My Groups/i });
            fireEvent.click(myGroupsTab);

            // Search should be cleared
            expect(searchInput.value).toBe('');
        });
    });

    describe('Search Functionality', () => {
        test('should filter groups by class name', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/Search by class name or year/i);
            fireEvent.change(searchInput, { target: { value: '2024' } });

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
                expect(screen.queryByTestId('class-group-card-2')).not.toBeInTheDocument();
            });
        });

        test('should filter groups by graduation year', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/Search by class name or year/i);
            fireEvent.change(searchInput, { target: { value: '2023' } });

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-2')).toBeInTheDocument();
                expect(screen.queryByTestId('class-group-card-1')).not.toBeInTheDocument();
            });
        });

        test('should filter groups by motto', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/Search by class name or year/i);
            fireEvent.change(searchInput, { target: { value: 'Excellence' } });

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
                expect(screen.queryByTestId('class-group-card-2')).not.toBeInTheDocument();
            });
        });

        test('should show empty state when no groups match search', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/Search by class name or year/i);
            fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

            await waitFor(() => {
                expect(screen.getByText(/No class groups found/i)).toBeInTheDocument();
                expect(screen.getByText(/Try adjusting your search criteria/i)).toBeInTheDocument();
            });
        });

        test('should perform case-insensitive search', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/Search by class name or year/i);
            fireEvent.change(searchInput, { target: { value: 'EXCELLENCE' } });

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });
        });
    });

    describe('Sort Options', () => {
        test('should sort by year descending by default', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(classGroupService.fetchGroups).toHaveBeenCalledWith(
                    expect.objectContaining({ sortBy: 'year-desc' })
                );
            });
        });

        test('should change sort to year ascending', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const sortSelect = screen.getByLabelText(/Sort By/i);
            fireEvent.mouseDown(sortSelect);

            const yearAscOption = await screen.findByText('Year (Oldest First)');
            fireEvent.click(yearAscOption);

            await waitFor(() => {
                expect(classGroupService.fetchGroups).toHaveBeenCalledWith(
                    expect.objectContaining({ sortBy: 'year-asc' })
                );
            });
        });

        test('should change sort to most members', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const sortSelect = screen.getByLabelText(/Sort By/i);
            fireEvent.mouseDown(sortSelect);

            const membersDescOption = await screen.findByText('Most Members');
            fireEvent.click(membersDescOption);

            await waitFor(() => {
                expect(classGroupService.fetchGroups).toHaveBeenCalledWith(
                    expect.objectContaining({ sortBy: 'members-desc' })
                );
            });
        });
    });

    describe('Membership Status Display', () => {
        test('should display member badge for groups user belongs to', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                const card1 = screen.getByTestId('class-group-card-1');
                const card3 = screen.getByTestId('class-group-card-3');

                expect(within(card1).getByTestId('member-badge')).toBeInTheDocument();
                expect(within(card3).getByTestId('member-badge')).toBeInTheDocument();
            });
        });

        test('should not display member badge for groups user does not belong to', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                const card2 = screen.getByTestId('class-group-card-2');
                const card4 = screen.getByTestId('class-group-card-4');

                expect(within(card2).queryByTestId('member-badge')).not.toBeInTheDocument();
                expect(within(card4).queryByTestId('member-badge')).not.toBeInTheDocument();
            });
        });

        test('should show correct member count for each group', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByText('50 members')).toBeInTheDocument();
                expect(screen.getByText('45 members')).toBeInTheDocument();
                expect(screen.getByText('60 members')).toBeInTheDocument();
                expect(screen.getByText('30 members')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('should display error message when fetch fails', async () => {
            classGroupService.fetchGroups.mockRejectedValueOnce(new Error('Network error'));

            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load class groups/i)).toBeInTheDocument();
            });

            expect(ClassGroupNotifications.networkError).toHaveBeenCalled();
        });

        test('should allow dismissing error alert', async () => {
            classGroupService.fetchGroups.mockRejectedValueOnce(new Error('Network error'));

            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load class groups/i)).toBeInTheDocument();
            });

            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText(/Failed to load class groups/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Empty States', () => {
        test('should show empty state for "My Groups" when user has no groups', async () => {
            const emptyGroups = mockClassGroups.map(g => ({ ...g, isMember: false }));
            classGroupService.fetchGroups.mockResolvedValue({ data: emptyGroups });

            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const myGroupsTab = screen.getByRole('tab', { name: /My Groups/i });
            fireEvent.click(myGroupsTab);

            await waitFor(() => {
                expect(screen.getByText(/You haven't joined any class groups yet/i)).toBeInTheDocument();
                expect(screen.getByText(/Switch to 'All Groups'/i)).toBeInTheDocument();
            });
        });

        test('should show "Browse All Groups" button in empty "My Groups" state', async () => {
            const emptyGroups = mockClassGroups.map(g => ({ ...g, isMember: false }));
            classGroupService.fetchGroups.mockResolvedValue({ data: emptyGroups });

            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const myGroupsTab = screen.getByRole('tab', { name: /My Groups/i });
            fireEvent.click(myGroupsTab);

            await waitFor(() => {
                const browseButton = screen.getByRole('button', { name: /Browse All Groups/i });
                expect(browseButton).toBeInTheDocument();
            });
        });

        test('should switch to "All Groups" when clicking "Browse All Groups" button', async () => {
            const emptyGroups = mockClassGroups.map(g => ({ ...g, isMember: false }));
            classGroupService.fetchGroups.mockResolvedValue({ data: emptyGroups });

            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('class-group-card-1')).toBeInTheDocument();
            });

            const myGroupsTab = screen.getByRole('tab', { name: /My Groups/i });
            fireEvent.click(myGroupsTab);

            await waitFor(() => {
                const browseButton = screen.getByRole('button', { name: /Browse All Groups/i });
                fireEvent.click(browseButton);
            });

            await waitFor(() => {
                const allGroupsTab = screen.getByRole('tab', { name: /All Groups/i });
                expect(allGroupsTab).toHaveAttribute('aria-selected', 'true');
            });
        });

        test('should show empty state when no groups exist', async () => {
            classGroupService.fetchGroups.mockResolvedValue({ data: [] });

            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getByText(/No class groups available/i)).toBeInTheDocument();
                expect(screen.getByText(/Class groups will appear here once they are created/i)).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Layout', () => {
        test('should render groups in a grid layout', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                const grid = screen.getByTestId('class-group-card-1').closest('[class*="MuiGrid-root"]');
                expect(grid).toBeInTheDocument();
            });
        });

        test('should render all groups when data is loaded', async () => {
            renderWithProviders(<ClassGroupsPage />);

            await waitFor(() => {
                expect(screen.getAllByTestId(/class-group-card-/)).toHaveLength(4);
            });
        });
    });
});
