import React from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

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
                flexDirection: 'row', // Horizontal layout
                alignItems: 'flex-start',
                p: 2,
                borderRadius: 4,
                boxShadow: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    borderColor: 'primary.main',
                },
                border: '1px solid',
                borderColor: 'grey.200',
            }}
        >
            {/* Thumbnail Image Box */}
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    minWidth: 80,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mr: 3,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {image ? (
                    <CardMedia
                        component="img"
                        image={image}
                        alt={title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
                )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        label={getCategoryLabel(category)}
                        color={getCategoryColor(category)}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                    />
                    {date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption">
                                {new Date(date).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        mb: 1,
                        lineHeight: 1.3,
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        lineHeight: 1.5,
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {excerpt}
                </Typography>
            </Box>
        </Card>
    );
};

export default ImpactStoryCard;
