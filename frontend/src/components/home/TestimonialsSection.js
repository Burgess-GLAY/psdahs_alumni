import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    FormatQuote as QuoteIcon,
    ArrowBackIos as ArrowBackIcon,
    ArrowForwardIos as ArrowForwardIcon
} from '@mui/icons-material';

const testimonials = [
    {
        id: 1,
        name: 'Burgess Awalayah Glay',
        role: 'Class of 2020',
        image: '/images/burgess.jpg',
        quote: 'Being part of the PSDAHS Alumni Network has been transformative. The connections I\'ve made and the opportunities to give back to our community have been invaluable. It\'s amazing to see how our network continues to grow and support each other.'
    },
    {
        id: 2,
        name: 'Edmond',
        role: 'Distinguished Alumni',
        image: '/images/edmond.jpeg',
        quote: 'The PSDAHS Alumni Association has provided me with incredible networking opportunities and a platform to mentor the next generation. The sense of community and shared values keeps me engaged and inspired to contribute more.'
    },
    {
        id: 3,
        name: 'Nicholas',
        role: 'Alumni Member',
        image: '/images/nicholas.jpeg',
        quote: 'Reconnecting with my classmates through the alumni network has been one of the best decisions I\'ve made. The events, mentorship programs, and collaborative initiatives have enriched both my personal and professional life tremendously.'
    },
    {
        id: 4,
        name: 'Lee',
        role: 'Alumni Leader',
        image: '/images/lee.jpeg',
        quote: 'The PSDAHS Alumni Network has opened doors I never imagined. From career opportunities to lifelong friendships, being an active member has been one of the most rewarding experiences of my life. I\'m proud to be part of this incredible community.'
    }
];

const TestimonialsSection = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [currentIndex, setCurrentIndex] = useState(0);

    const itemsPerPage = isMobile ? 1 : 3;

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    // Get visible testimonials based on current index
    const getVisibleTestimonials = () => {
        if (isMobile) {
            return [testimonials[currentIndex]];
        }

        // For desktop, show 3 items starting from currentIndex
        const visible = [];
        for (let i = 0; i < itemsPerPage; i++) {
            const index = (currentIndex + i) % testimonials.length;
            visible.push(testimonials[index]);
        }
        return visible;
    };

    const visibleTestimonials = getVisibleTestimonials();

    return (
        <Box bgcolor="grey.50" py={8}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {/* Section Header */}
                <Box textAlign="center" mb={6}>
                    <Typography variant="overline" color="primary" fontWeight="bold" gutterBottom>
                        TESTIMONIALS
                    </Typography>
                    <Typography variant="h3" component="h2" gutterBottom>
                        What Our Alumni Say
                    </Typography>
                    <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 700, mx: 'auto' }}>
                        Hear from our community members about their experiences with the PSDAHS Alumni Network
                    </Typography>
                </Box>

                {/* Testimonials Grid */}
                <Box position="relative">
                    {/* Navigation Arrows - Desktop */}
                    {!isMobile && (
                        <>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    position: 'absolute',
                                    left: -20,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'white',
                                    boxShadow: 2,
                                    zIndex: 10,
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                    },
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: -20,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'white',
                                    boxShadow: 2,
                                    zIndex: 10,
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                    },
                                }}
                            >
                                <ArrowForwardIcon />
                            </IconButton>
                        </>
                    )}

                    {/* Testimonials Cards */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(3, 1fr)'
                            },
                            gap: 4,
                            transition: 'all 0.5s ease-in-out',
                        }}
                    >
                        {visibleTestimonials.map((testimonial, index) => (
                            <Card
                                key={testimonial.id}
                                elevation={3}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.shadows[12],
                                    },
                                }}
                            >
                                {/* Quote Icon */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        color: 'primary.main',
                                        opacity: 0.2,
                                    }}
                                >
                                    <QuoteIcon sx={{ fontSize: 60 }} />
                                </Box>

                                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                                    {/* Avatar and Info */}
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <Avatar
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mr: 2,
                                                border: `4px solid ${theme.palette.primary.main}`,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="h6" fontWeight={600}>
                                                {testimonial.name}
                                            </Typography>
                                            <Typography variant="body2" color="primary">
                                                {testimonial.role}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Quote */}
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            fontStyle: 'italic',
                                            lineHeight: 1.8,
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    >
                                        "{testimonial.quote}"
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Navigation Arrows - Mobile */}
                    {isMobile && (
                        <Box display="flex" justifyContent="center" gap={2} mt={4}>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    bgcolor: 'white',
                                    boxShadow: 2,
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                    },
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box display="flex" alignItems="center" gap={1}>
                                {testimonials.map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                ))}
                            </Box>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    bgcolor: 'white',
                                    boxShadow: 2,
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                    },
                                }}
                            >
                                <ArrowForwardIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default TestimonialsSection;
