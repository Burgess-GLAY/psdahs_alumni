/**
 * Tests for MembershipActions component
 * 
 * Tests cover:
 * - Successful join operation
 * - Duplicate join prevention
 * - UI updates after join
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MembershipActions from '../MembershipActions';
import classGroupService from '../../../services/classGroupService';
import { ClassGroupNotifications } from '../../../utils/notifications';

// Mock dependencies
jest.mock('../../../services/classGroupService');
jest.mock('../../../utils/notifications', () => ({
    ClassGroupNotifications: {
        joinSuccess: jest.fn(),
        joinError: jest.fn(),
        alreadyMember: jest.fn(),
        networkError: jest.fn(),
        leaveSuccess: jest.fn(),
        leaveError: jest.fn(),
        notMember: jest.fn()
    }
}));

// Mock class group data
const mockClassGroup = {
    _id: 'group123',
    name: 'Class of 2020/21',
    graduationYear: 2020,
    memberCount: 50
};

describe('MembershipActions - Join Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Successful Join Operation', () => {
        test('should successfully join a class group', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    message: 'Successfully joined Class of 2020/21',
                    classGroup: { ...mockClassGroup, memberCount: 51 },
                    memberCount: 51
                }
            };

            classGroupService.joinGroup.mockResolvedValue(mockResponse);
            const onSuccess = jest.fn();

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    onSuccess={onSuccess}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(classGroupService.joinGroup).toHaveBeenCalledWith('group123');
            });

            await waitFor(() => {
                expect(ClassGroupNotifications.joinSuccess).toHaveBeenCalledWith('Class of 2020/21');
            });

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith({
                    action: 'join',
                    classGroup: mockResponse.data.classGroup,
                    memberCount: 51
                });
            });
        });

        test('should show loading state during join operation', async () => {
            classGroupService.joinGroup.mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 100))
            );

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            // Check for loading spinner
            await waitFor(() => {
                expect(screen.getByRole('progressbar')).toBeInTheDocument();
            });

            // Button should be disabled during loading
            await waitFor(() => {
                const button = screen.getByRole('button');
                expect(button).toBeDisabled();
            });
        });

        test('should perform optimistic UI update on join', async () => {
            classGroupService.joinGroup.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    data: { success: true, memberCount: 51 }
                }), 100))
            );

            const { rerender } = render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            // Optimistic update should show member badge immediately
            await waitFor(() => {
                expect(screen.getByText('Member')).toBeInTheDocument();
            });

            // Wait for actual API call to complete
            await waitFor(() => {
                expect(classGroupService.joinGroup).toHaveBeenCalled();
            });
        });

        test('should call onSuccess callback with correct data', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    classGroup: { ...mockClassGroup, memberCount: 51 },
                    memberCount: 51
                }
            };

            classGroupService.joinGroup.mockResolvedValue(mockResponse);
            const onSuccess = jest.fn();

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    onSuccess={onSuccess}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(
                    expect.objectContaining({
                        action: 'join',
                        memberCount: 51
                    })
                );
            });
        });
    });

    describe('Duplicate Join Prevention', () => {
        test('should handle ALREADY_MEMBER error', async () => {
            const error = {
                response: {
                    data: {
                        code: 'ALREADY_MEMBER',
                        error: 'You are already a member of this class group'
                    }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.alreadyMember).toHaveBeenCalled();
            });
        });

        test('should revert optimistic update on duplicate join error', async () => {
            const error = {
                response: {
                    data: {
                        code: 'ALREADY_MEMBER',
                        error: 'You are already a member of this class group'
                    }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            // Wait for error to be handled
            await waitFor(() => {
                expect(ClassGroupNotifications.alreadyMember).toHaveBeenCalled();
            });

            // Should revert to showing join button
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Join Group/i })).toBeInTheDocument();
            });
        });

        test('should not call onSuccess when join fails with ALREADY_MEMBER', async () => {
            const error = {
                response: {
                    data: {
                        code: 'ALREADY_MEMBER'
                    }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);
            const onSuccess = jest.fn();

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    onSuccess={onSuccess}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.alreadyMember).toHaveBeenCalled();
            });

            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe('UI Updates After Join', () => {
        test('should show member badge after successful join', async () => {
            classGroupService.joinGroup.mockResolvedValue({
                data: { success: true, memberCount: 51 }
            });

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(screen.getByText('Member')).toBeInTheDocument();
            });
        });

        test('should show leave button after successful join', async () => {
            classGroupService.joinGroup.mockResolvedValue({
                data: { success: true, memberCount: 51 }
            });

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Leave Group/i })).toBeInTheDocument();
            });
        });

        test('should hide join button after successful join', async () => {
            classGroupService.joinGroup.mockResolvedValue({
                data: { success: true, memberCount: 51 }
            });

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /Join Group/i })).not.toBeInTheDocument();
            });
        });

        test('should hide member badge when showMemberBadge is false', async () => {
            classGroupService.joinGroup.mockResolvedValue({
                data: { success: true, memberCount: 51 }
            });

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                    showMemberBadge={false}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Leave Group/i })).toBeInTheDocument();
            });

            expect(screen.queryByText('Member')).not.toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors', async () => {
            const error = {
                code: 'ERR_NETWORK',
                message: 'Network Error'
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.networkError).toHaveBeenCalled();
            });
        });

        test('should handle 401 unauthorized errors', async () => {
            const error = {
                response: {
                    status: 401,
                    data: { error: 'Unauthorized' }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.joinError).toHaveBeenCalledWith(
                    'Please log in to join this class group'
                );
            });
        });

        test('should handle 404 not found errors', async () => {
            const error = {
                response: {
                    status: 404,
                    data: { error: 'Class group not found' }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.joinError).toHaveBeenCalledWith(
                    'Class group not found'
                );
            });
        });

        test('should handle generic server errors', async () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: 'Internal server error' }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.joinError).toHaveBeenCalledWith(
                    'Internal server error'
                );
            });
        });

        test('should prevent join when not authenticated', async () => {
            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={false}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            expect(joinButton).toBeDisabled();
        });

        test('should show error when joining without authentication', async () => {
            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={false}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });

            // Force click even though disabled
            fireEvent.click(joinButton);

            // Should not call the service
            expect(classGroupService.joinGroup).not.toHaveBeenCalled();
        });

        test('should handle invalid class group', async () => {
            render(
                <MembershipActions
                    classGroup={null}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            await waitFor(() => {
                expect(ClassGroupNotifications.joinError).toHaveBeenCalledWith(
                    'Invalid class group'
                );
            });

            expect(classGroupService.joinGroup).not.toHaveBeenCalled();
        });

        test('should revert optimistic update on error', async () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: 'Server error' }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            // Wait for error
            await waitFor(() => {
                expect(ClassGroupNotifications.joinError).toHaveBeenCalled();
            });

            // Should show join button again
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Join Group/i })).toBeInTheDocument();
            });
        });

        test('should re-enable button after error', async () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: 'Server error' }
                }
            };

            classGroupService.joinGroup.mockRejectedValue(error);

            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            fireEvent.click(joinButton);

            // Wait for error
            await waitFor(() => {
                expect(ClassGroupNotifications.joinError).toHaveBeenCalled();
            });

            // Button should be enabled again
            await waitFor(() => {
                expect(joinButton).not.toBeDisabled();
            });
        });
    });

    describe('Button Variants and Sizes', () => {
        test('should render with contained variant by default', () => {
            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            expect(joinButton).toHaveClass('MuiButton-contained');
        });

        test('should render with outlined variant', () => {
            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                    variant="outlined"
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            expect(joinButton).toHaveClass('MuiButton-outlined');
        });

        test('should render with small size', () => {
            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                    size="small"
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            expect(joinButton).toHaveClass('MuiButton-sizeSmall');
        });

        test('should render with full width', () => {
            render(
                <MembershipActions
                    classGroup={mockClassGroup}
                    isMember={false}
                    isAuthenticated={true}
                    fullWidth={true}
                />
            );

            const joinButton = screen.getByRole('button', { name: /Join Group/i });
            expect(joinButton).toHaveClass('MuiButton-fullWidth');
        });
    });
});
