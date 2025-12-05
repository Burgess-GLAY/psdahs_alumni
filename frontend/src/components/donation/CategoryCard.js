import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

const CategoryCard = ({ icon, title, description, isSelected, onClick }) => {
    return (
        <Card
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                position: 'relative',
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.main' : 'grey.200',
                borderRadius: 4,
                boxShadow: isSelected ? 4 : 1,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                },
            }}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                >
                    <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                </Box>
            )}

            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 3 }}>
                {/* Icon Box */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        minWidth: 64,
                        borderRadius: 3,
                        bgcolor: isSelected ? 'primary.main' : 'grey.100',
                        color: isSelected ? 'white' : 'primary.main',
                        transition: 'all 0.3s ease',
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 32 } })}
                </Box>

                {/* Text Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            mb: 1,
                            color: 'text.primary',
                            lineHeight: 1.3,
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
                            fontSize: '0.9rem',
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CategoryCard;
