import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    CardActionArea
} from '@mui/material';
import { Link } from 'react-router-dom';

const HomeEventCard = ({ event }) => {
    const {
        _id,
        title,
        description,
        featuredImage,
        image,
    } = event;

    // Determine image source (using same logic as EventCard/HomePage)
    const displayImage = featuredImage || image || '/images/event-placeholder.jpg';

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'transparent', // Transparent background to blend in
            }}
        >
            <CardActionArea
                component={Link}
                to={`/events/${_id}`}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    '&:hover .MuiCardMedia-root': {
                        transform: 'scale(1.02)',
                    },
                    '&:hover .MuiTypography-h6': {
                        color: 'primary.main',
                    }
                }}
            >
                {/* Image Container with rounded corners */}
                <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, mb: 2 }}>
                    <CardMedia
                        component="img"
                        image={displayImage}
                        alt={title}
                        sx={{
                            height: 240,
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                        }}
                        onError={(e) => {
                            const currentSrc = e.target.src;
                            if (currentSrc.includes('/images/') || currentSrc.includes('/uploads/')) {
                                e.target.src = '/images/event-placeholder.jpg';
                            } else {
                                e.target.src = `/images/${displayImage}`;
                            }
                        }}
                    />
                </Box>

                <CardContent sx={{ p: 0, width: '100%' }}>
                    {/* Title */}
                    <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 500, // Slightly lighter bold
                            fontSize: '1.25rem',
                            mb: 1,
                            color: 'text.primary',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        {title}
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default HomeEventCard;
