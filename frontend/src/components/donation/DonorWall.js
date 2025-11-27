import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Mock data - replace with API call
const MOCK_DONORS = [
  { id: 1, name: 'John D.', amount: 1000, date: '2023-11-10', anonymous: false, level: 'platinum' },
  { id: 2, name: 'Sarah M.', amount: 500, date: '2023-11-09', anonymous: false, level: 'gold' },
  { id: 3, name: 'Anonymous', amount: 300, date: '2023-11-08', anonymous: true, level: 'silver' },
  { id: 4, name: 'Robert J.', amount: 200, date: '2023-11-07', anonymous: false, level: 'silver' },
  { id: 5, name: 'Lisa K.', amount: 100, date: '2023-11-06', anonymous: false, level: 'bronze' },
  { id: 6, name: 'Michael B.', amount: 50, date: '2023-11-05', anonymous: false, level: 'bronze' },
  { id: 7, name: 'Anonymous', amount: 25, date: '2023-11-04', anonymous: true, level: 'bronze' },
];

const DONATION_LEVELS = {
  platinum: { min: 1000, label: 'Platinum', color: '#e5e4e2' },
  gold: { min: 500, label: 'Gold', color: '#ffd700' },
  silver: { min: 200, label: 'Silver', color: '#c0c0c0' },
  bronze: { min: 0, label: 'Bronze', color: '#cd7f32' }
};

const getDonationLevel = (amount) => {
  if (amount >= DONATION_LEVELS.platinum.min) return 'platinum';
  if (amount >= DONATION_LEVELS.gold.min) return 'gold';
  if (amount >= DONATION_LEVELS.silver.min) return 'silver';
  return 'bronze';
};

const DonorWall = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [hasMore, setHasMore] = useState(true);

  // Simulate API call
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch from your API:
        // const response = await fetch(`/api/donors?page=${page}&limit=${itemsPerPage}`);
        // const data = await response.json();
        
        // For demo, use mock data with pagination
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedDonors = MOCK_DONORS.slice(0, endIndex);
        
        setDonors(paginatedDonors);
        setHasMore(endIndex < MOCK_DONORS.length);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [page]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Our Generous Donors
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        We're grateful for the generous support of our community. Your contributions make a difference!
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.entries(DONATION_LEVELS).map(([key, level]) => (
          <Grid item key={key} xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                textAlign: 'center',
                backgroundColor: level.color + '20',
                border: `2px solid ${level.color}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrophyIcon sx={{ color: level.color, fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="h3">
                {level.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {key === 'bronze' 
                  ? 'Up to $199' 
                  : key === 'silver'
                  ? '$200 - $499'
                  : key === 'gold'
                  ? '$500 - $999'
                  : '$1,000+'}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <List sx={{ mb: 4 }}>
        {donors.map((donor, index) => (
          <React.Fragment key={donor.id}>
            <ListItem 
              alignItems="flex-start"
              sx={{
                p: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderRadius: 1
                }
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    bgcolor: DONATION_LEVELS[donor.level].color + '30',
                    color: DONATION_LEVELS[donor.level].color,
                    width: 48,
                    height: 48,
                    fontSize: '1.2rem',
                    border: `2px solid ${DONATION_LEVELS[donor.level].color}`
                  }}
                >
                  {donor.anonymous ? (
                    <VisibilityIcon />
                  ) : (
                    getInitials(donor.name)
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" component="span">
                      {donor.anonymous ? 'Anonymous Donor' : donor.name}
                    </Typography>
                    <Chip 
                      label={DONATION_LEVELS[donor.level].label}
                      size="small"
                      sx={{
                        backgroundColor: DONATION_LEVELS[donor.level].color + '30',
                        color: DONATION_LEVELS[donor.level].color,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'inline-block', mr: 1, fontWeight: 'bold' }}
                    >
                      {formatCurrency(donor.amount)}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      on {formatDate(donor.date)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < donors.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      {hasMore && (
        <Box display="flex" justifyContent="center" mt={2} mb={4}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DonorWall;
