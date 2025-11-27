import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  IconButton,
  Divider,
  Pagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import classGroupService from '../../services/classGroupService';

const currentYear = new Date().getFullYear();
const startYear = 2007;

const graduationYears = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
const locations = [];
const degrees = [];

const AlumniDirectoryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    graduationYear: '',
    location: '',
    degree: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (filterName) => (event) => {
    setFilters({
      ...filters,
      [filterName]: event.target.value,
    });
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      graduationYear: '',
      location: '',
      degree: '',
    });
    setSearchTerm('');
  };

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await classGroupService.fetchGroups({ year: filters.graduationYear || undefined, limit: 100 });
        setGroups(res.data || []);
        if (!selectedGroup && res.data && res.data.length > 0) {
          setSelectedGroup(res.data[0]);
        }
      } catch {
        setGroups([]);
      }
    };
    loadGroups();
  }, [filters.graduationYear, selectedGroup]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedGroup) {
        setMembers([]);
        return;
      }
      try {
        const res = await classGroupService.fetchMembers(selectedGroup._id || selectedGroup.id);
        setMembers(res.data || []);
      } catch {
        setMembers([]);
      }
    };
    loadMembers();
  }, [selectedGroup]);

  const filteredAlumni = members
    .filter((alumni) => {
      // Filter out placeholder users - must have email and real names
      if (!alumni.email || !alumni.firstName || !alumni.lastName) return false;
      // Filter out obvious fake/test users
      if (alumni.email.includes('test') || alumni.email.includes('fake') || alumni.email.includes('example')) return false;

      const name = `${alumni.firstName || ''} ${alumni.lastName || ''}`.trim().toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      const matchesFilters = (!filters.graduationYear || (alumni.graduationYear && alumni.graduationYear.toString() === filters.graduationYear));
      return matchesSearch && matchesFilters;
    });

  // Get current alumni for pagination
  const indexOfLastAlumni = page * itemsPerPage;
  const indexOfFirstAlumni = indexOfLastAlumni - itemsPerPage;
  const currentAlumni = filteredAlumni.slice(indexOfFirstAlumni, indexOfLastAlumni);
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Alumni Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with fellow alumni, expand your professional network, and discover opportunities.
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Box
        sx={{
          mb: 4,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={showFilters ? 12 : 6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name, profession, company, or skills..."
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
          <Grid item xs={12} md={showFilters ? 12 : 6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Class Year</InputLabel>
              <Select
                value={filters.graduationYear}
                onChange={handleFilterChange('graduationYear')}
                label="Class Year"
              >
                <MenuItem value="">Any Year</MenuItem>
                {graduationYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Class Group</InputLabel>
              <Select
                value={selectedGroup?._id || ''}
                onChange={(e) => {
                  const g = groups.find((gr) => (gr._id || gr.id) === e.target.value);
                  setSelectedGroup(g || null);
                }}
                label="Class Group"
              >
                <MenuItem value="">All</MenuItem>
                {groups.map((gr) => (
                  <MenuItem key={gr._id || gr.id} value={gr._id || gr.id}>
                    {gr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth={isMobile}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Graduation Year</InputLabel>
                  <Select
                    value={filters.graduationYear}
                    onChange={handleFilterChange('graduationYear')}
                    label="Graduation Year"
                  >
                    <MenuItem value="">Any Year</MenuItem>
                    {graduationYears.map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={filters.location}
                    onChange={handleFilterChange('location')}
                    label="Location"
                  >
                    <MenuItem value="">Any Location</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Degree</InputLabel>
                  <Select
                    value={filters.degree}
                    onChange={handleFilterChange('degree')}
                    label="Degree"
                  >
                    <MenuItem value="">Any Degree</MenuItem>
                    {degrees.map((degree) => (
                      <MenuItem key={degree} value={degree}>
                        {degree}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {(filters.graduationYear || filters.location || filters.degree) && (
                <Grid item xs={12}>
                  <Button
                    startIcon={<CloseIcon />}
                    onClick={clearFilters}
                    color="inherit"
                    size="small"
                  >
                    Clear Filters
                  </Button>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Box>

      {/* Results Count */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" color="text.secondary">
          {filteredAlumni.length} {filteredAlumni.length === 1 ? 'alumnus' : 'alumni'} found
        </Typography>
        <Box>
          <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Sort by:
          </Typography>
          <Select
            value="recent"
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="grad-year">Graduation Year</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Alumni Grid */}
      {currentAlumni.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {currentAlumni.map((alumni) => (
              <Grid item xs={12} sm={6} lg={4} key={alumni._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={
                      <Avatar
                        src={alumni.profilePicture}
                        alt={`${alumni.firstName || ''} ${alumni.lastName || ''}`}
                        sx={{ width: 60, height: 60 }}
                      />
                    }
                    title={
                      <Typography variant="h6" component="div">
                        {(alumni.firstName || '') + ' ' + (alumni.lastName || '')}
                        <Typography variant="subtitle2" color="text.secondary">
                          {alumni.graduationYear ? `Class of ${alumni.graduationYear}` : ''}
                        </Typography>
                      </Typography>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box mb={2}>
                      {alumni.occupation && (
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <WorkIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {alumni.occupation}
                          </Typography>
                        </Box>
                      )}
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {alumni.address || ''}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <SchoolIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {alumni.degree || ''}
                        </Typography>
                      </Box>
                    </Box>

                    {alumni.bio && (
                      <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                        {alumni.bio.length > 150
                          ? `${alumni.bio.substring(0, 150)}...`
                          : alumni.bio}
                      </Typography>
                    )}

                    <Box mb={2}>
                      {(alumni.skills || []).slice(0, 4).map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {(alumni.skills || []).length > 4 && (
                        <Chip
                          label={`+${(alumni.skills || []).length - 4} more`}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between">
                      <IconButton
                        size="small"
                        color="primary"
                        href={`mailto:${alumni.email || ''}`}
                        title="Email"
                      >
                        <EmailIcon />
                      </IconButton>
                      {alumni.socialLinks?.linkedin && (
                        <IconButton
                          size="small"
                          color="primary"
                          href={`https://${alumni.socialLinks.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn"
                        >
                          <LinkedInIcon />
                        </IconButton>
                      )}
                      {alumni.socialLinks?.twitter && (
                        <IconButton
                          size="small"
                          color="primary"
                          href={`https://${alumni.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Twitter"
                        >
                          <TwitterIcon />
                        </IconButton>
                      )}
                      {alumni.socialLinks?.facebook && (
                        <IconButton
                          size="small"
                          color="primary"
                          href={`https://${alumni.socialLinks.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Facebook"
                        >
                          <FacebookIcon />
                        </IconButton>
                      )}
                      <Box flexGrow={1} />
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ ml: 1 }}
                        onClick={() => navigate(`/alumni/${alumni._id}`)}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
          textAlign="center"
          p={4}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedGroup ? 'No verified alumni found in this group' : 'No verified alumni found'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {selectedGroup
              ? 'This group may be private or have no members with complete profiles yet.'
              : 'Try adjusting your filters or selecting a different class year/group.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontStyle: 'italic' }}>
            Only alumni with verified profiles and complete information are displayed.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={clearFilters}
            startIcon={<CloseIcon />}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default AlumniDirectoryPage;
