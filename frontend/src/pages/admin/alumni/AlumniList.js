import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox, 
  Chip, 
  Divider, 
  FormControl, 
  Grid, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  OutlinedInput, 
  Paper, 
  Select, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  TableSortLabel, 
  TextField, 
  Toolbar, 
  Tooltip, 
  Typography,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AlumniFilter from '../../../components/admin/alumni/AlumniFilter';
import alumniService from '../../../services/alumniService';
import LoadingScreen from '../../../components/common/LoadingScreen';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

// Table header cells
const headCells = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'graduationYear', label: 'Class', sortable: true },
  { id: 'occupation', label: 'Occupation', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false }
];

// Enhanced Table Head
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={props.numSelected > 0 && props.numSelected < props.rowCount}
            checked={props.rowCount > 0 && props.numSelected === props.rowCount}
            onChange={props.onSelectAllClick}
            inputProps={{ 'aria-label': 'select all alumni' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// Enhanced Table Toolbar
const EnhancedTableToolbar = (props) => {
  const { numSelected, onSearch, onRefresh, onExport, onDeleteSelected } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      onSearch(searchTerm);
    }
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Box sx={{ flex: '1 1 100%' }}>
          <FormControl variant="outlined" size="small" sx={{ width: '100%', maxWidth: 500 }}>
            <OutlinedInput
              id="search-alumni"
              placeholder="Search alumni by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => onSearch(searchTerm)}
                    edge="end"
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={onDeleteSelected} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton onClick={onExport}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/alumni/new')}
              sx={{ ml: 1 }}
            >
              Add Alumni
            </Button>
          </>
        )}
      </Stack>
    </Toolbar>
  );
};

const AlumniList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for table data and pagination
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('lastName');
  
  // Filter states
  const [filters, setFilters] = useState({
    graduationYear: '',
    status: '',
    occupation: '',
  });
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch alumni data
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search,
        sort: `${order === 'desc' ? '-' : ''}${orderBy}`,
        ...filters
      };
      
      const data = await alumniService.getAlumni(params);
      setAlumni(data.alumni);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch alumni:', err);
      setError('Failed to load alumni. Please try again.');
      toast.error('Failed to load alumni');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAlumni();
  }, [page, rowsPerPage, order, orderBy, search, filters]);

  // Handle sort request
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all click
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = alumni.map((n) => n._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Handle row click
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearch('');
    setFilters({
      graduationYear: '',
      status: '',
      occupation: '',
    });
    setSelected([]);
    fetchAlumni();
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await alumniService.exportAlumni('csv');
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alumni-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export alumni data');
    }
  };

  // Handle delete
  const handleDeleteClick = (alumnus) => {
    setSelectedAlumnus(alumnus);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedAlumnus) {
        await alumniService.deleteAlumnus(selectedAlumnus._id);
        toast.success('Alumnus deleted successfully');
        fetchAlumni();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete alumnus');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAlumnus(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - total) : 0;

  if (loading && page === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onDeleteSelected={() => {}}
        />
        
        <Box sx={{ px: 2, pb: 2 }}>
          <AlumniFilter 
            filters={filters}
            onChange={handleFilterChange}
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
          />
        </Box>
        
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={alumni.length}
            />
            <TableBody>
              {alumni.map((alumnus, index) => {
                const isItemSelected = isSelected(alumnus._id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, alumnus._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={alumnus._id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      sx={{ pl: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={alumnus.profilePicture} 
                          alt={`${alumnus.firstName} ${alumnus.lastName}`}
                          sx={{ width: 36, height: 36, mr: 2 }}
                        >
                          {alumnus.firstName?.charAt(0)}{alumnus.lastName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {`${alumnus.firstName} ${alumnus.lastName}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {alumnus.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{alumnus.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`Class of ${alumnus.graduationYear}`} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{alumnus.occupation || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={alumnus.isActive ? 'Active' : 'Inactive'}
                        color={alumnus.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/alumni/${alumnus._id}/edit`);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(alumnus);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Alumnus"
        content={`Are you sure you want to delete ${selectedAlumnus ? `${selectedAlumnus.firstName} ${selectedAlumnus.lastName}` : 'this alumnus'}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default AlumniList;
