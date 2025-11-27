import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import {
    Favorite as FavoriteIcon,
    School as SchoolIcon,
    Groups as GroupsIcon,
} from '@mui/icons-material';
import CategoryCard from './CategoryCard';

const DonationCategoriesSection = ({ selectedCategory, onCategorySelect }) => {
    const categories = [
        {
            id: 'alumni-support',
            icon: <FavoriteIcon />,
            title: 'Fellow Alumni in Need',
            description:
                'Support alumni facing financial hardship, medical emergencies, or unexpected life challenges. Your contribution provides direct assistance to members of our community when they need it most.',
        },
        {
            id: 'scholarships',
            icon: <SchoolIcon />,
            title: 'Scholarships',
            description:
                'Help deserving students achieve their educational dreams by funding scholarships. Your donation removes financial barriers and creates opportunities for the next generation of alumni.',
        },
        {
            id: 'programs',
            icon: <GroupsIcon />,
            title: 'Alumni Programs',
            description:
                'Strengthen our alumni community through networking events, professional development workshops, mentorship programs, and social gatherings that keep our bonds strong.',
        },
    ];

    return (
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'grey.50' }}>
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
                        Where Your Donation Goes
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
                        Choose a category that resonates with you, or support all areas by selecting "All Categories"
                        during your donation.
                    </Typography>
                </Box>

                {/* Category Cards */}
                <Grid container spacing={3}>
                    {categories.map((category) => (
                        <Grid item xs={12} sm={6} md={4} key={category.id}>
                            <CategoryCard
                                icon={category.icon}
                                title={category.title}
                                description={category.description}
                                isSelected={selectedCategory === category.id}
                                onClick={() => onCategorySelect(category.id)}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Optional: All Categories Option */}
                <Box textAlign="center" mt={4}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontStyle: 'italic',
                        }}
                    >
                        Not sure which to choose? You can select "All Categories" when making your donation to
                        support all three areas equally.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default DonationCategoriesSection;
