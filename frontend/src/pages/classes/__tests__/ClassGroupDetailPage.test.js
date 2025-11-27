import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ClassGroupDetailPage from '../ClassGroupDetailPage';
import classGroupService from '../../../services/classGroupService';
import authReducer from '../../../features/auth/authSlice';

// Mock axios first to avoid import issues
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        create: jest.fn(() => ({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() }
            }
        }))
    }
}));

// Mock the api module
jest.mock('../../../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() }
        }
    }
}));

// Mock the service
jest.mock('../../../services/classGroupService', () => ({
    __esModule: true,
    default: {
        fetchGroupById: jest.fn(),
        joinGroup: jest.fn(),
        leaveGroup: jest.fn()
    }
}));

// Mock notifications
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

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: 'test-group-id' }),
    useNavigate: () => mockNavigate
}));

const mockClassGroup = {
    _id: 'test-group-id',
    name: 'Class of 2020/21',
    description: 'Test class group description',
    graduationYear: 2020,
    motto: 'Test motto',
    coverImage: '/test-image.jpg',
    bannerImage: '/test-banner.jpg',
    memberCount: 50,
    postCount: 10,
    eventCount: 5,
    photoCount: 20,
    isMember: true,
    isAdmin: false,
    members: [
        {
            user: {
                _id: 'user1',
                firstName: 'John',
                lastName: 'Doe',
                profilePicture: '/avatar1.jpg',
                graduationYear: 2020
            },
            joinedAt: new Date('2024-01-01'),
            isActive: true
        }
    ],
    recentActivity: {
        posts: [
            {
                _id: 'post1',
                content: 'Test post content',
                author: {
                    _id: 'user1',
                    firstName: 'John',
                    lastName: 'Doe',
                    profilePicture: '/avatar1.jpg'
                },
                createdAt: new Date('2024-01-15'),
                reactions: []
            }
        ],
        events: [
            {
                _id: 'event1',
                title: 'Test Event',
                description: 'Test event description',
                startDate: new Date('2024-12-01'),
                location: 'Test Location',
                attendees: []
            }
        ],
        albums: [
            {
                _id: 'album1',
                title: 'Test Album',
                description: 'Test album description',
                coverPhoto: '/album-cover.jpg',
                photos: []
            }
        ]
    }
};

const createMockStore = (isAuthenticated = true) => {
    return configureStore({
        reducer: {
            auth: authReducer
        },
        preloadedState: {
            auth: {
                isAuthenticated,
                user: isAuthenticated ? { id: 'user1', firstName: 'John', lastName: 'Doe' } : null,
                token: isAuthenticated ? 'test-token' : null,
                loading: false,
                error: null
            }
        }
    });
};

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

describe('ClassGroupDetailPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
    });

    describe('Data Loading and Display', () => {
        test('loads and displays class group data', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Check if key information is displayed
            expect(screen.getByText('Class of 2020')).toBeInTheDocument();
            expect(screen.getByText('"Test motto"')).toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument(); // Member count
        });

        test('displays loading state while fetching data', () => {
            classGroupService.fetchGroupById.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({ data: mockClassGroup }), 100))
            );

            const { container } = renderWithProviders(<ClassGroupDetailPage />);

            // Check for loading skeletons (MUI Skeleton components)
            const skeletons = container.querySelectorAll('.MuiSkeleton-root');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        test('displays error message when data fetch fails', async () => {
            classGroupService.fetchGroupById.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load class group details/i)).toBeInTheDocument();
            });
        });

        test('displays all class group statistics', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Check all stats are displayed
            expect(screen.getByText('50')).toBeInTheDocument(); // Member count
            expect(screen.getByText('10')).toBeInTheDocument(); // Post count
            expect(screen.getByText('5')).toBeInTheDocument(); // Event count
            expect(screen.getByText('20')).toBeInTheDocument(); // Photo count
        });

        test('displays class photo banner', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Banner should have background image
            const banner = screen.getByText('Class of 2020/21').closest('div').parentElement.parentElement;
            expect(banner).toHaveStyle({ backgroundImage: expect.stringContaining('/test-banner.jpg') });
        });
    });

    describe('Tab Navigation', () => {
        test('displays all tabs for posts, members, events, and photos', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Check if all tabs are present
            expect(screen.getByRole('tab', { name: /Posts/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /Members/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /Events/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /Photos/i })).toBeInTheDocument();
        });

        test('switches to members tab when clicked', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Members tab
            const membersTab = screen.getByRole('tab', { name: /Members/i });
            fireEvent.click(membersTab);

            // Check if member content is displayed
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });
        });

        test('switches to events tab when clicked', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Events tab
            const eventsTab = screen.getByRole('tab', { name: /Events/i });
            fireEvent.click(eventsTab);

            // Check if event content is displayed
            await waitFor(() => {
                expect(screen.getByText('Test Event')).toBeInTheDocument();
            });
        });

        test('switches to photos tab when clicked', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Photos tab
            const photosTab = screen.getByRole('tab', { name: /Photos/i });
            fireEvent.click(photosTab);

            // Check if album content is displayed
            await waitFor(() => {
                expect(screen.getByText('Test Album')).toBeInTheDocument();
            });
        });

        test('posts tab is active by default', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Posts tab should be selected
            const postsTab = screen.getByRole('tab', { name: /Posts/i });
            expect(postsTab).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('Member List Display', () => {
        test('displays member list in members tab', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Members tab
            const membersTab = screen.getByRole('tab', { name: /Members/i });
            fireEvent.click(membersTab);

            // Check if member is displayed
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });
        });

        test('displays member details including graduation year and join date', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Members tab
            const membersTab = screen.getByRole('tab', { name: /Members/i });
            fireEvent.click(membersTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getAllByText('Class of 2020').length).toBeGreaterThan(0);
                expect(screen.getByText(/Joined/i)).toBeInTheDocument();
            });
        });

        test('displays empty state when no members exist', async () => {
            const groupWithNoMembers = {
                ...mockClassGroup,
                members: [],
                memberCount: 0
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: groupWithNoMembers
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Members tab
            const membersTab = screen.getByRole('tab', { name: /Members/i });
            fireEvent.click(membersTab);

            await waitFor(() => {
                expect(screen.getByText('No members yet')).toBeInTheDocument();
            });
        });

        test('filters out inactive members from display', async () => {
            const groupWithInactiveMembers = {
                ...mockClassGroup,
                members: [
                    ...mockClassGroup.members,
                    {
                        user: {
                            _id: 'user2',
                            firstName: 'Jane',
                            lastName: 'Smith',
                            profilePicture: '/avatar2.jpg',
                            graduationYear: 2020
                        },
                        joinedAt: new Date('2024-01-01'),
                        isActive: false
                    }
                ]
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: groupWithInactiveMembers
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Members tab
            const membersTab = screen.getByRole('tab', { name: /Members/i });
            fireEvent.click(membersTab);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            // Inactive member should not be displayed
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });
    });

    describe('Content Filtering by Class Group', () => {
        test('displays posts specific to the class group', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Posts tab is active by default
            expect(screen.getByText('Test post content')).toBeInTheDocument();
        });

        test('displays events specific to the class group', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Events tab
            const eventsTab = screen.getByRole('tab', { name: /Events/i });
            fireEvent.click(eventsTab);

            await waitFor(() => {
                expect(screen.getByText('Test Event')).toBeInTheDocument();
                expect(screen.getByText('Test event description')).toBeInTheDocument();
            });
        });

        test('displays photo albums specific to the class group', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Photos tab
            const photosTab = screen.getByRole('tab', { name: /Photos/i });
            fireEvent.click(photosTab);

            await waitFor(() => {
                expect(screen.getByText('Test Album')).toBeInTheDocument();
                expect(screen.getByText('Test album description')).toBeInTheDocument();
            });
        });

        test('displays empty state for posts when none exist', async () => {
            const groupWithNoPosts = {
                ...mockClassGroup,
                recentActivity: {
                    posts: [],
                    events: mockClassGroup.recentActivity.events,
                    albums: mockClassGroup.recentActivity.albums
                },
                postCount: 0
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: groupWithNoPosts
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Posts tab is active by default
            expect(screen.getByText('No posts yet')).toBeInTheDocument();
        });

        test('displays empty state for events when none exist', async () => {
            const groupWithNoEvents = {
                ...mockClassGroup,
                recentActivity: {
                    posts: mockClassGroup.recentActivity.posts,
                    events: [],
                    albums: mockClassGroup.recentActivity.albums
                },
                eventCount: 0
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: groupWithNoEvents
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Events tab
            const eventsTab = screen.getByRole('tab', { name: /Events/i });
            fireEvent.click(eventsTab);

            await waitFor(() => {
                expect(screen.getByText('No upcoming events')).toBeInTheDocument();
            });
        });

        test('displays empty state for photos when none exist', async () => {
            const groupWithNoAlbums = {
                ...mockClassGroup,
                recentActivity: {
                    posts: mockClassGroup.recentActivity.posts,
                    events: mockClassGroup.recentActivity.events,
                    albums: []
                },
                photoCount: 0
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: groupWithNoAlbums
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click on Photos tab
            const photosTab = screen.getByRole('tab', { name: /Photos/i });
            fireEvent.click(photosTab);

            await waitFor(() => {
                expect(screen.getByText('No photo albums yet')).toBeInTheDocument();
            });
        });
    });

    describe('Join/Leave Button Visibility', () => {
        test('shows join button when user is not a member', async () => {
            const nonMemberGroup = {
                ...mockClassGroup,
                isMember: false
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: nonMemberGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Check if Join button is displayed
            expect(screen.getByRole('button', { name: /Join Group/i })).toBeInTheDocument();
            // Member badge should not be displayed
            expect(screen.queryByText('Member')).not.toBeInTheDocument();
        });

        test('shows leave button and member badge when user is a member', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Check if Leave button is displayed
            expect(screen.getByRole('button', { name: /Leave Group/i })).toBeInTheDocument();
            // Check if Member badge is displayed
            expect(screen.getByText('Member')).toBeInTheDocument();
            // Join button should not be displayed
            expect(screen.queryByRole('button', { name: /Join Group/i })).not.toBeInTheDocument();
        });

        test('disables join button when user is not authenticated', async () => {
            const nonMemberGroup = {
                ...mockClassGroup,
                isMember: false
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: nonMemberGroup
            });

            renderWithProviders(<ClassGroupDetailPage />, { isAuthenticated: false });

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Join button should be disabled
            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            expect(joinButton).toBeDisabled();
        });

        test('updates UI after successful join', async () => {
            const nonMemberGroup = {
                ...mockClassGroup,
                isMember: false,
                memberCount: 49
            };

            classGroupService.fetchGroupById.mockResolvedValue({
                data: nonMemberGroup
            });
            classGroupService.joinGroup.mockResolvedValue({
                success: true,
                data: { memberCount: 50 }
            });

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click join button
            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            // Wait for UI to update
            await waitFor(() => {
                expect(screen.getByText('Member')).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /Leave Group/i })).toBeInTheDocument();
            });

            // Member count should be updated
            expect(screen.getByText('50')).toBeInTheDocument();
        });

        test('updates UI after successful leave', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });
            classGroupService.leaveGroup.mockResolvedValue({
                success: true,
                data: { memberCount: 49 }
            });

            // Mock window.confirm
            window.confirm = jest.fn(() => true);

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click leave button
            const leaveButton = screen.getByRole('button', { name: /Leave Group/i });
            fireEvent.click(leaveButton);

            // Wait for UI to update
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Join Group/i })).toBeInTheDocument();
            });

            // Member badge should be removed
            expect(screen.queryByText('Member')).not.toBeInTheDocument();
            // Member count should be updated
            expect(screen.getByText('49')).toBeInTheDocument();
        });

        test('shows confirmation dialog before leaving group', async () => {
            classGroupService.fetchGroupById.mockResolvedValue({
                data: mockClassGroup
            });

            // Mock window.confirm
            window.confirm = jest.fn(() => false);

            renderWithProviders(<ClassGroupDetailPage />);

            await waitFor(() => {
                expect(screen.getByText('Class of 2020/21')).toBeInTheDocument();
            });

            // Click leave button
            const leaveButton = screen.getByRole('button', { name: /Leave Group/i });
            fireEvent.click(leaveButton);

            // Confirm dialog should be called
            expect(window.confirm).toHaveBeenCalledWith(
                expect.stringContaining('Are you sure you want to leave')
            );

            // UI should not change if user cancels
            expect(screen.getByText('Member')).toBeInTheDocument();
        });
    });
});
