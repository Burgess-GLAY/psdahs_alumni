import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    People as PeopleIcon,
    Share as ShareIcon,
    FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
    const {
        _id,
        title,
        description,
        featuredImage,
        image,
        date,
        time,
        location,
        category,
        participantsCount,
    } = event;

    // Validate date and handle invalid dates
    const eventDate = date ? new Date(date) : null;
    const isValidDate = eventDate && !isNaN(eventDate.getTime());
    const month = isValidDate ? eventDate.toLocaleString('default', { month: 'short' }).toUpperCase() : 'TBA';
    const day = isValidDate ? eventDate.getDate() : '';

    // Determine image source
    const displayImage = featuredImage || image || '/images/event-placeholder.jpg';

    return (
        <Card
            component={Link}
            to={`/events/${_id}`}
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                },
                position: 'relative',
                overflow: 'visible',
            }}
        >
            {/* Image Container */}
            <Box sx={{ position: 'relative', height: 240 }}>
                <CardMedia
                    component="img"
                    image={displayImage}
                    alt={title}
                    sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }}
                    onError={(e) => {
                        // If image fails to load
                        const currentSrc = e.target.src;
                        // If it's already trying /images/ or /uploads/, fallback to placeholder
                        if (currentSrc.includes('/images/') || currentSrc.includes('/uploads/')) {
                            e.target.src = '/images/event-placeholder.jpg';
                        } else {
                            // Otherwise try adding /images/ prefix (for legacy images)
                            e.target.src = `/images/${displayImage}`;
                        }
                    }}
                />

                {/* Date Badge */}
                {isValidDate && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: '#000000',
                            color: 'white',
                            borderRadius: 2,
                            p: 1,
                            minWidth: 50,
                            textAlign: 'center',
                            boxShadow: 2,
                        }}
                    >
                        <Typography variant="caption" display="block" sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1 }}>
                            {month}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                            {day}
                        </Typography>
                    </Box>
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                {/* Meta Row: Category & Time */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip
                        label={category || 'General'}
                        size="small"
                        sx={{
                            bgcolor: '#FFE4E9',
                            color: '#E91E63',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 24,
                            textTransform: 'uppercase',
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ bgcolor: '#f5f5f5', px: 1, py: 0.5, borderRadius: 1 }}>
                            {time || 'TBA'}
                        </Typography>
                    </Box>
                </Stack>

                {/* Title */}
                <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        mb: 1.5,
                        height: '2.6rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2.5,
                        height: '4.8rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        wordBreak: 'break-word',
                    }}
                >
                    {description || 'Join us for this exciting event. Click for more details.'}
                </Typography>

                {/* Details: Location & Participants */}
                <Stack spacing={1} mb={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: 'text.disabled' }} />
                        <Typography variant="body2" noWrap>
                            {location || 'TBA'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <PeopleIcon sx={{ fontSize: 18, mr: 1, color: 'text.disabled' }} />
                        <Typography variant="body2">
                            {participantsCount || 0} Participants
                        </Typography>
                    </Box>
                </Stack>

                {/* Footer Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                    <Button
                        variant="contained"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        sx={{
                            bgcolor: '#E91E63',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 3,
                            '&:hover': {
                                bgcolor: '#C2185B',
                            },
                        }}
                    >
                        Register Now
                    </Button>

                    <Box>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            sx={{ bgcolor: '#f5f5f5', mr: 1, '&:hover': { bgcolor: '#e0e0e0' } }}
                        >
                            <ShareIcon fontSize="small" color="action" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            sx={{ bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#e0e0e0' } }}
                        >
                            <FavoriteBorderIcon fontSize="small" color="action" />
                        </IconButton>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default EventCard;
