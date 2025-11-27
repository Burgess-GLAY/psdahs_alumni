import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import ImpactStoryCard from './ImpactStoryCard';

const ImpactStoriesSection = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock data - replace with actual API call
    const mockStories = [
        {
            id: 1,
            title: 'Sarah\'s Journey: From Struggle to Success',
            excerpt:
                'Thanks to your generous scholarship donations, Sarah was able to complete her nursing degree and is now serving her community as a healthcare professional.',
            image: '/images/impact/scholarship-story.jpg',
            category: 'scholarships',
            date: '2024-01-15',
        },
        {
            id: 2,
            title: 'Emergency Support Helped John Get Back on His Feet',
            excerpt:
                'When John faced unexpected medical bills, our alumni support fund provided the assistance he needed. Today, he\'s back to work and paying it forward.',
            image: '/images/impact/alumni-support-story.jpg',
            category: 'alumni-support',
            date: '2024-02-20',
        },
        {
            id: 3,
            title: 'Mentorship Program Connects Generations',
            excerpt:
                'Our new mentorship program has connected over 100 alumni with current students, creating lasting relationships and career opportunities.',
            image: '/images/impact/program-story.jpg',
            category: 'programs',
            date: '2024-03-10',
        },
    ];

    useEffect(() => {
        // Simulate API call
        const fetchStories = async () => {
            try {
                setLoading(true);
                // TODO: Replace with actual API call
                // const response = await axios.get('/api/donations/impact-stories');
                // setStories(response.data.stories);

                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 500));
                setStories(mockStories);
                setError(null);
            } catch (err) {
                console.error('Error fetching impact stories:', err);
                setError('Failed to load impact stories');
                setStories(mockStories); // Fallback to mock data
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) {
        return (
            <Box sx={{ py: 8, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                        <CircularProgress />
                    </Box>
                </Container>
            </Box>
        );
    }

    if (error && stories.length === 0) {
        return (
            <Box sx={{ py: 8, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box textAlign="center" mb={6}>
                    <Typography
                        variant="h3"
                        component="h2"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                            mb: 2,
                        }}
                    >
                        Your Impact in Action
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            maxWidth: '700px',
                            mx: 'auto',
                            lineHeight: 1.7,
                        }}
                    >
                        See how your donations are making a real difference in the lives of our alumni and
                        students. These are just a few of the many success stories made possible by your
                        generosity.
                    </Typography>
                </Box>

                {/* Story Cards Grid */}
                <Grid container spacing={3}>
                    {stories.map((story) => (
                        <Grid item xs={12} sm={6} md={4} key={story.id}>
                            <ImpactStoryCard story={story} />
                        </Grid>
                    ))}
                </Grid>

                {/* Call to Action */}
                <Box textAlign="center" mt={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Every donation, no matter the size, creates ripples of positive change in our community.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default ImpactStoriesSection;
