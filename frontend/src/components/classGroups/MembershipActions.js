import { useState } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    Chip
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    ExitToApp as ExitToAppIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import classGroupService from '../../services/classGroupService';
import { ClassGroupNotifications } from '../../utils/notifications';

/**
 * MembershipActions Component
 * 
 * Handles join/leave actions for class groups with:
 * - Loading states during API calls
 * - Success/error notifications
 * - Confirmation dialog for leave action
 * - Optimistic UI updates
 * 
 * @param {Object} props
 * @param {Object} props.classGroup - The class group object
 * @param {string} props.classGroup._id - Class group ID
 * @param {string} props.classGroup.name - Class group name
 * @param {boolean} props.isMember - Whether the user is currently a member
 * @param {Function} props.onSuccess - Callback after successful join/leave
 * @param {boolean} props.isAuthenticated - Whether the user is authenticated
 * @param {boolean} props.showMemberBadge - Whether to show the "Member" badge (default: true)
 * @param {string} props.variant - Button variant: 'contained' | 'outlined' | 'text' (default: 'contained')
 * @param {string} props.size - Button size: 'small' | 'medium' | 'large' (default: 'medium')
 * @param {boolean} props.fullWidth - Whether buttons should be full width (default: false)
 */
const MembershipActions = ({
    classGroup,
    isMember = false,
    onSuccess,
    isAuthenticated = true,
    showMemberBadge = true,
    variant = 'contained',
    size = 'medium',
    fullWidth = false
}) => {
    const [loading, setLoading] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [optimisticState, setOptimisticState] = useState(null);

    // Use optimistic state if available, otherwise use prop
    const currentMemberStatus = optimisticState !== null ? optimisticState : isMember;

    /**
     * Handle join group action
     */
    const handleJoin = async () => {
        if (!isAuthenticated) {
            ClassGroupNotifications.joinError('Please log in to join this class group');
            return;
        }

        if (!classGroup?._id) {
            ClassGroupNotifications.joinError('Invalid class group');
            return;
        }

        setLoading(true);

        // Optimistic update
        setOptimisticState(true);

        try {
            const response = await classGroupService.joinGroup(classGroup._id);

            // Show success notification
            ClassGroupNotifications.joinSuccess(classGroup.name);

            // Call success callback with updated data
            if (onSuccess) {
                onSuccess({
                    action: 'join',
                    classGroup: response.data?.classGroup || classGroup,
                    memberCount: response.data?.memberCount
                });
            }
        } catch (error) {
            console.error('Join group failed:', error);

            // Revert optimistic update
            setOptimisticState(null);

            // Handle specific error cases
            if (error.response?.data?.code === 'ALREADY_MEMBER') {
                ClassGroupNotifications.alreadyMember();
            } else if (error.response?.status === 401) {
                ClassGroupNotifications.joinError('Please log in to join this class group');
            } else if (error.response?.status === 404) {
                ClassGroupNotifications.joinError('Class group not found');
            } else if (error.code === 'ERR_NETWORK') {
                ClassGroupNotifications.networkError();
            } else {
                const errorMessage = error.response?.data?.error || error.response?.data?.message;
                ClassGroupNotifications.joinError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle leave group action
     */
    const handleLeave = async () => {
        if (!isAuthenticated) {
            ClassGroupNotifications.leaveError('Please log in to leave this class group');
            return;
        }

        if (!classGroup?._id) {
            ClassGroupNotifications.leaveError('Invalid class group');
            return;
        }

        setLoading(true);
        setShowLeaveDialog(false);

        // Optimistic update
        setOptimisticState(false);

        try {
            const response = await classGroupService.leaveGroup(classGroup._id);

            // Show success notification
            ClassGroupNotifications.leaveSuccess(classGroup.name);

            // Call success callback with updated data
            if (onSuccess) {
                onSuccess({
                    action: 'leave',
                    classGroup: classGroup,
                    memberCount: response.data?.memberCount
                });
            }
        } catch (error) {
            console.error('Leave group failed:', error);

            // Revert optimistic update
            setOptimisticState(null);

            // Handle specific error cases
            if (error.response?.data?.code === 'NOT_MEMBER') {
                ClassGroupNotifications.notMember();
            } else if (error.response?.status === 401) {
                ClassGroupNotifications.leaveError('Please log in to leave this class group');
            } else if (error.response?.status === 404) {
                ClassGroupNotifications.leaveError('Class group not found');
            } else if (error.code === 'ERR_NETWORK') {
                ClassGroupNotifications.networkError();
            } else {
                const errorMessage = error.response?.data?.error || error.response?.data?.message;
                ClassGroupNotifications.leaveError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Open leave confirmation dialog
     */
    const handleLeaveClick = () => {
        setShowLeaveDialog(true);
    };

    /**
     * Close leave confirmation dialog
     */
    const handleCancelLeave = () => {
        setShowLeaveDialog(false);
    };

    return (
        <>
            <Box display="flex" alignItems="center" gap={2}>
                {currentMemberStatus ? (
                    <>
                        {/* Member Badge */}
                        {showMemberBadge && (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Member"
                                color="success"
                                size={size === 'small' ? 'small' : 'medium'}
                                sx={{ fontWeight: 600 }}
                            />
                        )}

                        {/* Leave Button */}
                        <Button
                            variant={variant === 'contained' ? 'outlined' : variant}
                            color="error"
                            size={size}
                            fullWidth={fullWidth}
                            startIcon={loading ? null : <ExitToAppIcon />}
                            onClick={handleLeaveClick}
                            disabled={loading || !isAuthenticated}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: fullWidth ? undefined : 120
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                'Leave Group'
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Join Button */}
                        <Button
                            variant={variant}
                            color="primary"
                            size={size}
                            fullWidth={fullWidth}
                            startIcon={loading ? null : <PersonAddIcon />}
                            onClick={handleJoin}
                            disabled={loading || !isAuthenticated}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: fullWidth ? undefined : 120
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                'Join Group'
                            )}
                        </Button>
                    </>
                )}
            </Box>

            {/* Leave Confirmation Dialog */}
            <Dialog
                open={showLeaveDialog}
                onClose={handleCancelLeave}
                aria-labelledby="leave-dialog-title"
                aria-describedby="leave-dialog-description"
            >
                <DialogTitle id="leave-dialog-title">
                    Leave {classGroup?.name}?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="leave-dialog-description">
                        Are you sure you want to leave {classGroup?.name}? You can always rejoin later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCancelLeave}
                        color="inherit"
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLeave}
                        color="error"
                        variant="contained"
                        autoFocus
                        sx={{ textTransform: 'none' }}
                    >
                        Leave Group
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MembershipActions;
