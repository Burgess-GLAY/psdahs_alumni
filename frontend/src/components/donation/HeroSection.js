import React from 'react';
import { Box, Container, Typography, Grid, Chip } from '@mui/material';
import {
    Security as SecurityIcon,
    VerifiedUser as VerifiedIcon,
    Receipt as ReceiptIcon,
    Favorite as FavoriteIcon,
    School as SchoolIcon,
    People as PeopleIcon,
} from '@mui/icons-material';

const HeroSection = () => {
    const impactStats = [
        { icon: <PeopleIcon />, value: '500+', label: 'Alumni Supported' },
        { icon: <SchoolIcon />, value: '150+', label: 'Scholarships Awarded' },
        { icon: <FavoriteIcon />, value: '$250K+', label: 'Total Impact' },
    ];

    const trustBadges = [
        { icon: <SecurityIcon />, label: 'Secure Payment' },
        { icon: <ReceiptIcon />, label: 'Tax-Deductible' },
        { icon: <VerifiedIcon />, label: '501(c)(3) Nonprofit' },
    ];

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: { xs: 6, md: 10 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                },
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Main Headline */}
                <Box textAlign="center" mb={6}>
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                            mb: 2,
                        }}
                    >
                        Support Our Alumni Community
                    </Typography>
                    <Typography
                        variant="h5"
                        component="p"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                            fontWeight: 400,
                            opacity: 0.95,
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Your contribution helps fellow alumni in need, funds scholarships for deserving students,
                        and strengthens our alumni programs and community initiatives.
                    </Typography>
                </Box>

                {/* Impact Statistics */}
                <Grid container spacing={3} justifyContent="center" mb={5}>
                    {impactStats.map((stat, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Box
                                textAlign="center"
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        mb: 2,
                                    }}
                                >
                                    {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                                </Box>
                                <Typography
                                    variant="h3"
                                    component="div"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        mb: 1,
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontSize: { xs: '0.875rem', md: '1rem' },
                                        opacity: 0.9,
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Trust Badges */}
                <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="center"
                    gap={2}
                    sx={{ mt: 4 }}
                >
                    {trustBadges.map((badge, index) => (
                        <Chip
                            key={index}
                            icon={React.cloneElement(badge.icon, { sx: { color: 'white !important' } })}
                            label={badge.label}
                            sx={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                py: 2.5,
                                px: 2,
                                '& .MuiChip-icon': {
                                    color: 'white',
                                },
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.3)',
                                },
                            }}
                        />
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default HeroSection;
