import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import classGroupService from '../../services/classGroupService';
import { ClassGroupNotifications } from '../../utils/notifications';
import ClassGroupCard from '../../components/classGroups/ClassGroupCard';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

const ClassGroupsPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // State for filtering and display
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('year-desc');

  // State for groups data
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all class groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          limit: 100,
          sortBy: sortBy
        };

        // Add filter for my groups if on that tab
        if (activeTab === 'my-groups' && isAuthenticated) {
          params.filter = 'my-groups';
        }

        const res = await classGroupService.fetchGroups(params);
        const data = res.data || [];
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to load class groups. Please try again.');
        ClassGroupNotifications.networkError();
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [sortBy, activeTab, isAuthenticated]);

  // Event handlers
  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm(''); // Clear search when switching tabs
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Join/Leave handlers
  const handleJoinGroup = async (groupId) => {
    if (!isAuthenticated) {
      ClassGroupNotifications.authRequired();
      return;
    }

    try {
      const response = await classGroupService.joinGroup(groupId);
      const groupName = response.data?.classGroup?.name || 'the class group';

      // Update groups list with optimistic update
      setGroups(groups.map(g =>
        (g._id === groupId || g.id === groupId)
          ? { ...g, isMember: true, memberCount: (g.memberCount || 0) + 1 }
          : g
      ));

      // Show success notification
      ClassGroupNotifications.joinSuccess(groupName);
    } catch (e) {
      console.error('Join group failed', e);

      // Show error notification
      if (e.response?.data?.code === 'ALREADY_MEMBER') {
        ClassGroupNotifications.alreadyMember();
      } else if (e.message?.includes('network') || !e.response) {
        ClassGroupNotifications.networkError();
      } else {
        ClassGroupNotifications.joinError(e.response?.data?.error);
      }
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!isAuthenticated) {
      ClassGroupNotifications.authRequired();
      return;
    }

    try {
      await classGroupService.leaveGroup(groupId);
      const group = groups.find(g => g._id === groupId || g.id === groupId);
      const groupName = group?.name || 'the class group';

      // Update groups list with optimistic update
      setGroups(groups.map(g =>
        (g._id === groupId || g.id === groupId)
          ? { ...g, isMember: false, memberCount: Math.max((g.memberCount || 1) - 1, 0) }
          : g
      ));

      // Show success notification
      ClassGroupNotifications.leaveSuccess(groupName);
    } catch (e) {
      console.error('Leave group failed', e);

      // Show error notification
      if (e.response?.data?.code === 'NOT_MEMBER') {
        ClassGroupNotifications.notMember();
      } else if (e.message?.includes('network') || !e.response) {
        ClassGroupNotifications.networkError();
      } else {
        ClassGroupNotifications.leaveError(e.response?.data?.error);
      }
    }
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter(group => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      group.name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower) ||
      group.graduationYear?.toString().includes(searchTerm) ||
      group.motto?.toLowerCase().includes(searchLower)
    );
  });

  // Separate groups by membership
  const myGroups = filteredGroups.filter(group => group.isMember);
  const allGroups = filteredGroups;

  // Determine which groups to display based on active tab
  const displayGroups = activeTab === 'my-groups' ? myGroups : allGroups;



  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Class Groups
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with your classmates, share memories, and stay updated with your graduating class.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }
          }}
        >
          <Tab
            label={`All Groups (${allGroups.length})`}
            value="all"
          />
          <Tab
            label={`My Groups (${myGroups.length})`}
            value="my-groups"
            disabled={!isAuthenticated}
          />
        </Tabs>
      </Box>

      {/* Search and Sort Controls */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by class name or year..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="year-desc">Year (Newest First)</MenuItem>
                <MenuItem value="year-asc">Year (Oldest First)</MenuItem>
                <MenuItem value="members-desc">Most Members</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Groups Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <ClassGroupCard loading={true} />
            </Grid>
          ))}
        </Grid>
      ) : displayGroups.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === 'my-groups'
              ? "You haven't joined any class groups yet"
              : searchTerm
                ? "No class groups found"
                : "No class groups available"}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {activeTab === 'my-groups'
              ? "Switch to 'All Groups' to discover and join class groups"
              : searchTerm
                ? "Try adjusting your search criteria"
                : "Class groups will appear here once they are created"}
          </Typography>
          {activeTab === 'my-groups' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveTab('all')}
              sx={{ mt: 2 }}
            >
              Browse All Groups
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayGroups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group._id || group.id}>
              <ClassGroupCard
                classGroup={group}
                isMember={group.isMember}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
                isAuthenticated={isAuthenticated}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ClassGroupsPage;
