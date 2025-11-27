import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ClassGroupList from '../components/classGroups/ClassGroupList';

const ClassGroupsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Class Groups
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect with your batchmates and stay updated with your class group. Join your graduation year's group to get started.
        </Typography>
      </Box>
      
      <ClassGroupList />
    </Container>
  );
};

export default ClassGroupsPage;
