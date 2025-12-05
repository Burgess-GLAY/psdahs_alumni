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
  Fade,
  Pagination as MuiPagination,
  Stack
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
  const [page, setPage] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const itemsPerPage = 12; // 4 columns x 3 rows

  // State for groups data
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all class groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      setFadeIn(false);

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

        // Trigger fade in after data is loaded
        setTimeout(() => setFadeIn(true), 50);
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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab, sortBy]);

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

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Calculate pagination
  const totalPages = Math.ceil(displayGroups.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = displayGroups.slice(startIndex, endIndex);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Page Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
          Class Groups
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
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

      {/* Groups Grid - 4 columns, equal size cards */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
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
        <>
          <Fade in={fadeIn} timeout={300}>
            <Grid container spacing={3}>
              {paginatedGroups.map((group) => (
                <Grid item xs={12} sm={6} md={3} key={group._id || group.id} sx={{ display: 'flex' }}>
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
          </Fade>

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <Box mt={6} display="flex" justifyContent="center">
              <Stack spacing={2}>
                <MuiPagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      '&.Mui-selected': {
                        transform: 'scale(1.15)',
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ClassGroupsPage;
