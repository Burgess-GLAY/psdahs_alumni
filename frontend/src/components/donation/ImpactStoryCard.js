import React from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';

const ImpactStoryCard = ({ story }) => {
    const { title, excerpt, image, category, date } = story;

    const getCategoryColor = (cat) => {
        const colorMap = {
            'alumni-support': 'error',
            'scholarships': 'primary',
            'programs': 'success',
        };
        return colorMap[cat] || 'default';
    };

    const getCategoryLabel = (cat) => {
        const labelMap = {
            'alumni-support': 'Alumni Support',
            'scholarships': 'Scholarship',
            'programs': 'Program',
        };
        return labelMap[cat] || 'Impact';
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                },
            }}
        >
            {/* Image */}
            {image && (
                <CardMedia
                    component="img"
                    height="200"
                    image={image}
                    alt={title}
                    sx={{
                        objectFit: 'cover',
                    }}
                />
            )}

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Category Chip */}
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={getCategoryLabel(category)}
                        color={getCategoryColor(category)}
                        size="small"
                    />
                </Box>

                {/* Title */}
                <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        mb: 1.5,
                    }}
                >
                    {title}
                </Typography>

                {/* Excerpt */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        lineHeight: 1.6,
                        mb: 2,
                        flexGrow: 1,
                    }}
                >
                    {excerpt}
                </Typography>

                {/* Date */}
                {date && (
                    <Typography variant="caption" color="text.secondary">
                        {new Date(date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default ImpactStoryCard;
