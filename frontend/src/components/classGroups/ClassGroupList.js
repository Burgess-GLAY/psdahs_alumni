import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  GroupAdd as GroupAddIcon,
  ExitToApp as LeaveIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCredentials } from '../../features/auth/authSlice';

const ClassGroupList = () => {
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [isLeaving, setIsLeaving] = useState(false);
  const [leavingGroupId, setLeavingGroupId] = useState(null);
  
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  // Fetch user's class groups
  const fetchMyClassGroups = async () => {
    try {
      const { data } = await axios.get('/api/users/me/class-groups');
      setClassGroups(data.data);
    } catch (error) {
      toast.error('Failed to load class groups');
      console.error('Error fetching class groups:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch available class groups to join
  const fetchAvailableGroups = async () => {
    try {
      const { data } = await axios.get('/api/class-groups/available');
      setAvailableGroups(data.data);
    } catch (error) {
      console.error('Error fetching available groups:', error);
    }
  };
  
  // Handle joining a class group
  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`/api/me/class-groups/${groupId}/join`);
      await Promise.all([
        fetchMyClassGroups(),
        fetchAvailableGroups()
      ]);
      // Refresh user info to update class groups in auth state
      const { data } = await axios.get('/api/auth/me');
      dispatch(setCredentials(data));
      toast.success('Successfully joined class group');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join class group');
    }
  };
  
  // Handle leaving a class group
  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this class group?')) return;
    
    setIsLeaving(true);
    setLeavingGroupId(groupId);
    
    try {
      await axios.post(`/api/me/class-groups/${groupId}/leave`);
      await fetchMyClassGroups();
      // Refresh user info to update class groups in auth state
      const { data } = await axios.get('/api/auth/me');
      dispatch(setCredentials(data));
      toast.success('Successfully left class group');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave class group');
    } finally {
      setIsLeaving(false);
      setLeavingGroupId(null);
    }
  };
  
  // Open join dialog and fetch available groups
  const handleOpenJoinDialog = async () => {
    setJoinDialogOpen(true);
    await fetchAvailableGroups();
  };
  
  // Filter available groups based on search and year filter
  const filteredAvailableGroups = availableGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.graduationYear.toString().includes(searchTerm);
    const matchesYear = yearFilter === 'all' || group.graduationYear.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });
  
  // Get unique years for filter
  const availableYears = [...new Set(availableGroups.map(g => g.graduationYear))].sort((a, b) => b - a);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchMyClassGroups();
  }, []);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Class Groups
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GroupAddIcon />}
          onClick={handleOpenJoinDialog}
        >
          Join a Class Group
        </Button>
      </Box>
      
      {classGroups.length === 0 ? (
        <Box textAlign="center" py={6}>
          <SchoolIcon color="action" style={{ fontSize: 60, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You haven't joined any class groups yet
          </Typography>
          <Typography color="textSecondary" paragraph>
            Join your class group to connect with your batchmates and stay updated.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<GroupAddIcon />}
            onClick={handleOpenJoinDialog}
          >
            Join a Class Group
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {classGroups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={group.image || '/images/class-groups/default-class-bg.jpg'}
                  alt={group.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {group.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {group.description}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {group.members?.length || 0} members
                    </Typography>
                  </Box>
                  <Chip
                    label={group.graduationYear}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  {group.role === 'admin' && (
                    <Chip
                      label="Admin"
                      size="small"
                      color="primary"
                      variant="filled"
                    />
                  )}
                </CardContent>
                <Box p={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    href={`/class-groups/${group._id}`}
                    sx={{ mb: 1 }}
                  >
                    View Group
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={isLeaving && leavingGroupId === group._id ? <CircularProgress size={20} /> : <LeaveIcon />}
                    disabled={isLeaving}
                    onClick={() => handleLeaveGroup(group._id)}
                  >
                    Leave Group
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Join Class Group Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Join a Class Group</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="body1" paragraph>
              Find and join your class group to connect with your batchmates. You can only join one class group per graduation year.
            </Typography>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                select
                variant="outlined"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Years</MenuItem>
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            
            {filteredAvailableGroups.length === 0 ? (
              <Box textAlign="center" py={4}>
                <SchoolIcon color="action" style={{ fontSize: 60, opacity: 0.5 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No class groups found
                </Typography>
                <Typography color="textSecondary">
                  {searchTerm || yearFilter !== 'all' 
                    ? 'Try adjusting your search criteria'
                    : 'All available class groups have been joined.'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredAvailableGroups.map((group) => (
                  <Grid item xs={12} key={group._id}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      p={2} 
                      border={1} 
                      borderColor="divider"
                      borderRadius={1}
                    >
                      <Avatar 
                        src={group.image} 
                        alt={group.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1">{group.name}</Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <PeopleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="textSecondary">
                            {group.memberCount || 0} members • Graduated {group.graduationYear}
                          </Typography>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleJoinGroup(group._id)}
                        disabled={group.isMember}
                      >
                        {group.isMember ? 'Joined' : 'Join'}
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassGroupList;
