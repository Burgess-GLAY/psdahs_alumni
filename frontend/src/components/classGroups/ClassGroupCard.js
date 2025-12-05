import { useState, useEffect } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    Button,
    Skeleton
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MembershipActions from './MembershipActions';
import { formatMemberCount } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUtils';

const ClassGroupCard = ({
    classGroup,
    isMember = false,
    onJoin,
    onLeave,
    loading = false,
    isAuthenticated = true
}) => {
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [localMemberStatus, setLocalMemberStatus] = useState(isMember);
    const [localMemberCount, setLocalMemberCount] = useState(classGroup?.memberCount || 0);

    // Sync local state with props when they change
    useEffect(() => {
        setLocalMemberStatus(isMember);
    }, [isMember]);

    useEffect(() => {
        setLocalMemberCount(classGroup?.memberCount || 0);
    }, [classGroup?.memberCount]);

    const handleCardClick = () => {
        navigate(`/classes/${classGroup._id}`);
    };

    const handleMembershipSuccess = ({ action, memberCount }) => {
        // Update local state immediately for optimistic UI
        setLocalMemberStatus(action === 'join');
        if (memberCount !== undefined) {
            setLocalMemberCount(memberCount);
        } else {
            setLocalMemberCount(prev =>
                action === 'join' ? prev + 1 : Math.max(prev - 1, 0)
            );
        }

        // Call parent handlers if provided
        if (action === 'join' && onJoin) {
            onJoin(classGroup._id);
        } else if (action === 'leave' && onLeave) {
            onLeave(classGroup._id);
        }
    };

    if (loading) {
        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </CardContent>
                <CardActions>
                    <Skeleton variant="rectangular" width="100%" height={36} />
                </CardActions>
            </Card>
        );
    }

    const defaultImage = '/images/class-groups/default-class-bg.jpg';
    const imageUrl = imageError ? defaultImage : getImageUrl(classGroup.coverImage || classGroup.bannerImage || defaultImage);

    return (
        <Card
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 12
                }
            }}
            onClick={handleCardClick}
        >
            {/* Class Photo Banner - Fixed aspect ratio */}
            <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                {!imageLoaded && (
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    />
                )}
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={classGroup.name}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                    }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: imageLoaded ? 'block' : 'none'
                    }}
                />

                {/* Member Badge Overlay */}
                {localMemberStatus && (
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Member"
                        color="success"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            fontWeight: 600,
                            boxShadow: 2
                        }}
                    />
                )}
            </Box>

            {/* Card Content - EXACT fixed heights */}
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                {/* Class Name - EXACT fixed height */}
                <Box display="flex" alignItems="center" height="1.5rem" mb={1}>
                    <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 20, flexShrink: 0 }} />
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.5,
                        }}
                    >
                        {classGroup.name}
                    </Typography>
                </Box>

                {/* Graduation Year - EXACT fixed height */}
                <Box mb={1.5} height="24px">
                    <Chip
                        label={`Class of ${classGroup.graduationYear}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500, height: '24px' }}
                    />
                </Box>

                {/* Motto/Description - EXACT fixed height */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1.5,
                        height: '2.4rem',
                        fontStyle: classGroup.motto ? 'italic' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                    }}
                >
                    {classGroup.motto ? `"${classGroup.motto}"` : '\u00A0'}
                </Typography>

                {/* Member Count - EXACT fixed height */}
                <Box display="flex" alignItems="center" height="1.5rem">
                    <PeopleIcon color="action" fontSize="small" sx={{ mr: 0.5, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {formatMemberCount(localMemberCount)}
                    </Typography>
                </Box>
            </CardContent>

            {/* Card Actions - EXACT fixed heights */}
            <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                {/* Membership Actions - EXACT fixed height */}
                <Box width="100%" height="36px" onClick={(e) => e.stopPropagation()}>
                    <MembershipActions
                        classGroup={classGroup}
                        isMember={localMemberStatus}
                        onSuccess={handleMembershipSuccess}
                        isAuthenticated={isAuthenticated}
                        showMemberBadge={false}
                        variant="outlined"
                        size="small"
                        fullWidth={true}
                    />
                </Box>

                {/* View Group Button - EXACT fixed height */}
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleCardClick}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        height: '36px',
                    }}
                >
                    View Group
                </Button>
            </CardActions>
        </Card>
    );
};

export default ClassGroupCard;
