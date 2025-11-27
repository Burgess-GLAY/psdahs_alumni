import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Avatar,
    Typography,
    Box,
    Button,
    IconButton,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    Facebook as FacebookIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const UserProfileView = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/users/profile/${userId}`);
                setUser(response.data.data || response.data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'User not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/alumni')}
                >
                    Back to Alumni Directory
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/alumni')}
                sx={{ mb: 3 }}
            >
                Back to Alumni Directory
            </Button>

            <Grid container spacing={3}>
                {/* Profile Header Card */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                                <Avatar
                                    src={getImageUrl(user.profilePicture)}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    sx={{ width: 150, height: 150 }}
                                >
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </Avatar>
                                <Box flex={1}>
                                    <Typography variant="h4" gutterBottom>
                                        {user.firstName} {user.lastName}
                                    </Typography>
                                    {user.occupation && (
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            {user.occupation}
                                        </Typography>
                                    )}
                                    {user.company && (
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                            at {user.company}
                                        </Typography>
                                    )}
                                    <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                                        {user.graduationYear && (
                                            <Chip
                                                icon={<CalendarIcon />}
                                                label={`Class of ${user.graduationYear}`}
                                                color="primary"
                                            />
                                        )}
                                        {user.major && (
                                            <Chip
                                                icon={<SchoolIcon />}
                                                label={user.major}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Contact Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {user.email && (
                                <Box display="flex" alignItems="center" mb={2}>
                                    <EmailIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">
                                            <a href={`mailto:${user.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                {user.email}
                                            </a>
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {user.phone && (
                                <Box display="flex" alignItems="center" mb={2}>
                                    <PhoneIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Phone
                                        </Typography>
                                        <Typography variant="body1">
                                            {user.phone}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {user.address && (
                                <Box display="flex" alignItems="center" mb={2}>
                                    <LocationIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Location
                                        </Typography>
                                        <Typography variant="body1">
                                            {typeof user.address === 'string'
                                                ? user.address
                                                : [
                                                    user.address.street,
                                                    user.address.city,
                                                    user.address.state,
                                                    user.address.zipCode,
                                                    user.address.country
                                                ].filter(Boolean).join(', ')
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Social Links */}
                            {(user.socialMedia?.linkedin || user.socialMedia?.twitter || user.socialMedia?.facebook || user.socialMedia?.instagram) && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Social Media
                                    </Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        {user.socialMedia?.linkedin && (
                                            <IconButton
                                                color="primary"
                                                href={user.socialMedia.linkedin.startsWith('http') ? user.socialMedia.linkedin : `https://${user.socialMedia.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <LinkedInIcon />
                                            </IconButton>
                                        )}
                                        {user.socialMedia?.twitter && (
                                            <IconButton
                                                color="primary"
                                                href={user.socialMedia.twitter.startsWith('http') ? user.socialMedia.twitter : `https://${user.socialMedia.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <TwitterIcon />
                                            </IconButton>
                                        )}
                                        {user.socialMedia?.facebook && (
                                            <IconButton
                                                color="primary"
                                                href={user.socialMedia.facebook.startsWith('http') ? user.socialMedia.facebook : `https://${user.socialMedia.facebook}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FacebookIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* About & Bio */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                About
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {user.bio ? (
                                <Typography variant="body1" paragraph>
                                    {user.bio}
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    No bio available
                                </Typography>
                            )}

                            {/* Skills */}
                            {user.skills && user.skills.length > 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                        Skills
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {user.skills.map((skill, index) => (
                                            <Chip key={index} label={skill} />
                                        ))}
                                    </Box>
                                </>
                            )}

                            {/* Education */}
                            {user.major && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                        Education
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box display="flex" alignItems="start" mb={2}>
                                        <SchoolIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="body1" fontWeight="medium">
                                                {user.major}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                PSDAHS Alumni Association
                                            </Typography>
                                            {user.graduationYear && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Graduated: {user.graduationYear}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </>
                            )}

                            {/* Work Experience */}
                            {(user.occupation || user.company) && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                        Work Experience
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box display="flex" alignItems="start" mb={2}>
                                        <WorkIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
                                        <Box>
                                            {user.occupation && (
                                                <Typography variant="body1" fontWeight="medium">
                                                    {user.occupation}
                                                </Typography>
                                            )}
                                            {user.company && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.company}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserProfileView;
