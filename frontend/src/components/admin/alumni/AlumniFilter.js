import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Chip, 
  Collapse, 
  Divider, 
  FormControl, 
  Grid, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Select, 
  Slider, 
  TextField, 
  Typography,
  useTheme
} from '@mui/material';
import { 
  FilterList as FilterListIcon, 
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from(
  { length: 30 },
  (_, i) => currentYear - i
);

const OCCUPATIONS = [
  'Software Engineer',
  'Doctor',
  'Teacher',
  'Engineer',
  'Business Owner',
  'Researcher',
  'Designer',
  'Lawyer',
  'Accountant',
  'Architect',
  'Other'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending Approval' },
];

const AlumniFilter = ({ 
  filters, 
  onChange, 
  open: openProp = false, 
  onClose 
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(openProp);

  // Sync local state with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (field) => (event) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle range filter change
  const handleRangeChange = (field) => (event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    onChange(localFilters);
    if (onClose) onClose();
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      graduationYear: '',
      status: '',
      occupation: '',
      search: ''
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    value => value !== '' && value !== null && value !== undefined
  ).length;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip 
              label={activeFilterCount} 
              size="small" 
              color="primary" 
              sx={{ ml: 1, height: 20, minWidth: 20 }}
            />
          )}
        </Box>
        <Box>
          {activeFilterCount > 0 && (
            <Button 
              size="small" 
              onClick={handleResetFilters}
              sx={{ mr: 1 }}
            >
              Clear All
            </Button>
          )}
          <IconButton 
            size="small" 
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Hide filters' : 'Show filters'}
          >
            {open ? <CloseIcon fontSize="small" /> : <FilterListIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={open}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider
          }}
        >
          <Grid container spacing={2}>
            {/* Graduation Year Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="graduation-year-filter-label">Graduation Year</InputLabel>
                <Select
                  labelId="graduation-year-filter-label"
                  id="graduation-year-filter"
                  value={localFilters.graduationYear || ''}
                  label="Graduation Year"
                  onChange={handleFilterChange('graduationYear')}
                >
                  <MenuItem value="">
                    <em>All Years</em>
                  </MenuItem>
                  {GRADUATION_YEARS.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={localFilters.status || ''}
                  label="Status"
                  onChange={handleFilterChange('status')}
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Occupation Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="occupation-filter-label">Occupation</InputLabel>
                <Select
                  labelId="occupation-filter-label"
                  id="occupation-filter"
                  value={localFilters.occupation || ''}
                  label="Occupation"
                  onChange={handleFilterChange('occupation')}
                >
                  <MenuItem value="">
                    <em>All Occupations</em>
                  </MenuItem>
                  {OCCUPATIONS.map(occupation => (
                    <MenuItem key={occupation} value={occupation}>
                      {occupation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Search within results */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search within results"
                variant="outlined"
                value={localFilters.search || ''}
                onChange={handleFilterChange('search')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={handleApplyFilters}
                      edge="end"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleApplyFilters}
              startIcon={<CheckIcon />}
            >
              Apply Filters
            </Button>
          </Box>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.graduationYear && (
                  <Chip 
                    label={`Class of ${filters.graduationYear}`}
                    onDelete={() => handleFilterChange('graduationYear')({ target: { value: '' } })}
                    size="small"
                  />
                )}
                {filters.status && (
                  <Chip 
                    label={`Status: ${STATUS_OPTIONS.find(s => s.value === filters.status)?.label || filters.status}`}
                    onDelete={() => handleFilterChange('status')({ target: { value: '' } })}
                    size="small"
                  />
                )}
                {filters.occupation && (
                  <Chip 
                    label={`Occupation: ${filters.occupation}`}
                    onDelete={() => handleFilterChange('occupation')({ target: { value: '' } })}
                    size="small"
                  />
                )}
                {filters.search && (
                  <Chip 
                    label={`Search: ${filters.search}`}
                    onDelete={() => handleFilterChange('search')({ target: { value: '' } })}
                    size="small"
                  />
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
};

export default AlumniFilter;
