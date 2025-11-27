import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Container,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    Avatar,
    Alert,
    Paper,
    IconButton,
    Skeleton,
    Chip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    People as PeopleIcon,
    Event as EventIcon,
    Photo as PhotoIcon,
    Article as ArticleIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import classGroupService from '../../services/classGroupService';
import { ClassGroupNotifications } from '../../utils/notifications';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import MembershipActions from '../../components/classGroups/MembershipActions';
import { formatCount, formatNumber } from '../../utils/formatters';
import CreatePostDialog from '../../components/classGroups/CreatePostDialog';

const ClassGroupDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // State
    const [classGroup, setClassGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [openPostDialog, setOpenPostDialog] = useState(false);

    // Fetch class group details
    useEffect(() => {
        const fetchGroupDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await classGroupService.fetchGroupById(id);
                setClassGroup(response.data);
            } catch (err) {
                console.error('Error fetching class group:', err);
                setError('Failed to load class group details. Please try again.');
                ClassGroupNotifications.networkError();
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGroupDetails();
        }
    }, [id]);

    // Handle tab change
    const handleTabChange = (_event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle membership action success
    const handleMembershipSuccess = ({ action, memberCount }) => {
        // Update local state based on action
        setClassGroup(prev => ({
            ...prev,
            isMember: action === 'join',
            memberCount: memberCount !== undefined ? memberCount : (
                action === 'join'
                    ? (prev.memberCount || 0) + 1
                    : Math.max((prev.memberCount || 1) - 1, 0)
            )
        }));
    };

    // Handle post creation
    const handleOpenPostDialog = () => {
        setOpenPostDialog(true);
    };

    const handleClosePostDialog = () => {
        setOpenPostDialog(false);
    };

    const handleSubmitPost = async (postData) => {
        try {
            // TODO: Implement API call to create post
            console.log('Creating post:', postData);
            // For now, just close the dialog
            // In production, you would:
            // 1. Upload images to server/cloud storage
            // 2. Create post with API call
            // 3. Refresh posts list
            handleClosePostDialog();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    // Loading state
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
                <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
                <Box display="flex" gap={2} mb={3}>
                    <Skeleton variant="rectangular" width={120} height={40} />
                    <Skeleton variant="rectangular" width={120} height={40} />
                </Box>
                <Skeleton variant="rectangular" height={400} />
            </Container>
        );
    }

    // Error state
    if (error || !classGroup) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Class group not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/class-groups')}
                >
                    Back to Class Groups
                </Button>
            </Container>
        );
    }

    const {
        name,
        description,
        graduationYear,
        motto,
        coverImage,
        bannerImage,
        memberCount,
        postCount,
        eventCount,
        photoCount,
        isMember,
        isAdmin,
        members = [],
        recentActivity = {}
    } = classGroup;

    const { posts = [], events = [], albums = [] } = recentActivity;

    return (
        <Container maxWidth="xl" sx={{ mt: 0, mb: 4, px: 0 }}>
            {/* Class Photo Banner */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 200, sm: 300, md: 400 },
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${bannerImage || coverImage || '/images/class-groups/default-class-bg.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    mb: 3
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ pb: 3, color: 'white' }}>
                        {/* Back Button */}
                        <IconButton
                            onClick={() => navigate('/class-groups')}
                            sx={{
                                color: 'white',
                                mb: 2,
                                bgcolor: 'rgba(0, 0, 0, 0.3)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        {/* Class Name and Year */}
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <SchoolIcon sx={{ fontSize: 40 }} />
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                }}
                            >
                                {name}
                            </Typography>
                        </Box>

                        {/* Graduation Year Badge */}
                        <Chip
                            label={`Class of ${graduationYear}`}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                mb: motto ? 1 : 0
                            }}
                        />

                        {/* Motto */}
                        {motto && (
                            <Typography
                                variant="h6"
                                sx={{
                                    fontStyle: 'italic',
                                    mt: 1,
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                }}
                            >
                                "{motto}"
                            </Typography>
                        )}
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {/* Stats and Actions Bar */}
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Stats */}
                        <Grid item xs={12} md={6}>
                            <Box display="flex" gap={3} flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PeopleIcon color="primary" />
                                    <Typography variant="body1">
                                        <strong>{formatNumber(memberCount || 0)}</strong> {(memberCount || 0) === 1 ? 'Member' : 'Members'}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ArticleIcon color="primary" />
                                    <Typography variant="body1">
                                        <strong>{formatNumber(postCount || 0)}</strong> {(postCount || 0) === 1 ? 'Post' : 'Posts'}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <EventIcon color="primary" />
                                    <Typography variant="body1">
                                        <strong>{formatNumber(eventCount || 0)}</strong> {(eventCount || 0) === 1 ? 'Event' : 'Events'}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PhotoIcon color="primary" />
                                    <Typography variant="body1">
                                        <strong>{formatNumber(photoCount || 0)}</strong> {(photoCount || 0) === 1 ? 'Photo' : 'Photos'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Join/Leave Button */}
                        <Grid item xs={12} md={6}>
                            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                <MembershipActions
                                    classGroup={classGroup}
                                    isMember={isMember}
                                    onSuccess={handleMembershipSuccess}
                                    isAuthenticated={isAuthenticated}
                                    showMemberBadge={true}
                                    variant="contained"
                                    size="medium"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Description */}
                {description && (
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                            {description}
                        </Typography>
                    </Paper>
                )}

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem'
                            }
                        }}
                    >
                        <Tab
                            label={`Posts (${formatNumber(postCount || 0)})`}
                            value="posts"
                            icon={<ArticleIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label={`Members (${formatNumber(memberCount || 0)})`}
                            value="members"
                            icon={<PeopleIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label={`Events (${formatNumber(eventCount || 0)})`}
                            value="events"
                            icon={<EventIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label={`Photos (${formatNumber(photoCount || 0)})`}
                            value="photos"
                            icon={<PhotoIcon />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                <Box>
                    {/* Posts Tab */}
                    {activeTab === 'posts' && (
                        <Box>
                            {/* Create Post Button - Only for members */}
                            {isMember && (
                                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleOpenPostDialog}
                                        sx={{ py: 1.5 }}
                                    >
                                        What's on your mind? Share with your classmates
                                    </Button>
                                </Paper>
                            )}

                            {posts.length === 0 ? (
                                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                                    <ArticleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No posts yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isMember
                                            ? 'Be the first to share something with your classmates!'
                                            : 'Join this group to see and create posts'}
                                    </Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={2}>
                                    {posts.map((post) => (
                                        <Grid item xs={12} key={post._id}>
                                            <Card>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                                        <Avatar
                                                            src={post.author?.profilePicture}
                                                            alt={`${post.author?.firstName} ${post.author?.lastName}`}
                                                        >
                                                            {post.author?.firstName?.[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {post.author?.firstName} {post.author?.lastName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(post.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body1">{post.content}</Typography>
                                                    {post.reactions && post.reactions.length > 0 && (
                                                        <Box mt={2}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {post.reactions.length} {post.reactions.length === 1 ? 'reaction' : 'reactions'}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <Box>
                            {members.length === 0 ? (
                                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                                    <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        No members yet
                                    </Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={2}>
                                    {members.filter(m => m.isActive).map((member) => (
                                        <Grid item xs={12} sm={6} md={4} key={member.user?._id}>
                                            <Card>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Avatar
                                                            src={member.user?.profilePicture}
                                                            alt={`${member.user?.firstName} ${member.user?.lastName}`}
                                                            sx={{ width: 56, height: 56 }}
                                                        >
                                                            {member.user?.firstName?.[0]}
                                                        </Avatar>
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {member.user?.firstName} {member.user?.lastName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Class of {member.user?.graduationYear}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <Box>
                            {events.length === 0 ? (
                                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                                    <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No upcoming events
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isMember
                                            ? 'Check back later for upcoming class events'
                                            : 'Join this group to see events'}
                                    </Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={2}>
                                    {events.map((event) => (
                                        <Grid item xs={12} md={6} key={event._id}>
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                                        {event.title}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <EventIcon fontSize="small" color="primary" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(event.startDate).toLocaleDateString()} at{' '}
                                                            {new Date(event.startDate).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </Typography>
                                                    </Box>
                                                    {event.location && (
                                                        <Typography variant="body2" color="text.secondary" mb={1}>
                                                            📍 {event.location}
                                                        </Typography>
                                                    )}
                                                    {event.description && (
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            {event.description}
                                                        </Typography>
                                                    )}
                                                    {event.attendees && event.attendees.length > 0 && (
                                                        <Box mt={2}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Photos Tab */}
                    {activeTab === 'photos' && (
                        <Box>
                            {albums.length === 0 ? (
                                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                                    <PhotoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No photo albums yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isMember
                                            ? 'Create an album to share memories with your classmates'
                                            : 'Join this group to see photo albums'}
                                    </Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={2}>
                                    {albums.map((album) => (
                                        <Grid item xs={12} sm={6} md={4} key={album._id}>
                                            <Card>
                                                {album.coverPhoto && (
                                                    <Box
                                                        component="img"
                                                        src={album.coverPhoto}
                                                        alt={album.title}
                                                        sx={{
                                                            width: '100%',
                                                            height: 200,
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                )}
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                                        {album.title}
                                                    </Typography>
                                                    {album.description && (
                                                        <Typography variant="body2" color="text.secondary" mb={1}>
                                                            {album.description}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {album.photos?.length || 0} {album.photos?.length === 1 ? 'photo' : 'photos'}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}
                </Box>
            </Container>

            {/* Create Post Dialog */}
            <CreatePostDialog
                open={openPostDialog}
                onClose={handleClosePostDialog}
                onSubmit={handleSubmitPost}
            />
        </Container>
    );
};

export default ClassGroupDetailPage;
