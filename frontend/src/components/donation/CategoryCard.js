import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

const CategoryCard = ({ icon, title, description, isSelected, onClick }) => {
    return (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                border: isSelected ? '3px solid' : '2px solid transparent',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    borderColor: isSelected ? 'primary.main' : 'primary.light',
                },
            }}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                >
                    <CheckIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
            )}

            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Icon */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: isSelected ? 'primary.main' : 'primary.light',
                        color: isSelected ? 'white' : 'primary.main',
                        mb: 3,
                        mx: 'auto',
                        transition: 'all 0.3s ease',
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 40 } })}
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    textAlign="center"
                    sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: isSelected ? 'primary.main' : 'text.primary',
                    }}
                >
                    {title}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{
                        lineHeight: 1.6,
                        flex: 1,
                    }}
                >
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CategoryCard;
