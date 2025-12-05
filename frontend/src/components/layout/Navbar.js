import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Divider,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Container,
  Badge,
  Drawer,
  List,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  VolunteerActivism,
  AccountCircle,
  Settings,
  ExitToApp,
  Notifications as NotificationsIcon,
  AdminPanelSettings,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Announcement as AnnouncementIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { selectUser, selectRole, logoutUser } from '../../features/auth/authSlice';
import { getNavigationForRole } from '../../config/roleConfig';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Navbar = ({ onLoginClick, onSignUpClick }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const role = useSelector(selectRole);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  const [openItems, setOpenItems] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMobileToggle = () => setMobileOpen(!mobileOpen);
  const handleAdminSidebarToggle = () => setAdminSidebarOpen(!adminSidebarOpen);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Close menu first
      handleMenuClose();

      // Dispatch logout action
      dispatch(logoutUser());

      // Always redirect to home page after logout
      console.log('[Navbar] User logged out, redirecting to home page');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    setOpenItems({});
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Get navigation items based on current role from centralized config
  const navItems = getNavigationForRole(role);

  // Debug logging for admin navigation
  useEffect(() => {
    console.log('[Navbar] Current navigation state:', {
      role,
      isAuthenticated: role !== 'guest',
      currentUser: currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        isAdmin: currentUser.isAdmin,
      } : null,
      navItemsCount: navItems.length,
      timestamp: new Date().toISOString(),
    });
  }, [role, currentUser, navItems.length]);

  // Profile menu
  const menuId = 'user-account-menu';
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { mt: 1.5, minWidth: 200 },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="subtitle2">{currentUser?.name || 'User'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {currentUser?.email || ''}
        </Typography>
      </Box>

      <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        My Profile
      </MenuItem>

      {role === 'admin' && (
        <MenuItem component={RouterLink} to="/admin" onClick={handleMenuClose}>
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          Admin Dashboard
        </MenuItem>
      )}

      <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleLogout} disabled={isLoggingOut} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          {isLoggingOut ? (
            <CircularProgress size={20} color="error" />
          ) : (
            <ExitToApp fontSize="small" color="error" />
          )}
        </ListItemIcon>
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </MenuItem>
    </Menu>
  );

  // Mobile drawer
  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      {/* User Profile Section - For Authenticated Users */}
      {role !== 'guest' && (
        <>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                src={currentUser?.profilePicture}
                alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                sx={{ width: 48, height: 48, mr: 2, bgcolor: 'white', color: 'primary.main' }}
              >
                {currentUser?.firstName?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {currentUser?.firstName} {currentUser?.lastName || currentUser?.name || 'User'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {currentUser?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      <List>
        {/* Navigation Items */}
        {navItems.map((item) => (
          <Box key={item.text}>
            <ListItem
              button
              component={item.path ? RouterLink : 'button'}
              to={item.path}
              onClick={(e) => {
                if (!item.path) {
                  e.preventDefault();
                  setOpenItems({ ...openItems, [item.text]: !openItems[item.text] });
                } else setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.children &&
                (openItems[item.text] ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            {item.children && (
              <Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem
                      key={child.text}
                      button
                      component={RouterLink}
                      to={child.path}
                      sx={{ pl: 4 }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <ListItemText primary={child.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}

        <Divider />

        {/* Donate Button */}
        <ListItem button component={RouterLink} to="/donate" onClick={() => setMobileOpen(false)}>
          <ListItemIcon>
            <VolunteerActivism sx={{ color: 'deeppink' }} />
          </ListItemIcon>
          <ListItemText primary="Donate Now" />
        </ListItem>

        {/* Dashboard - For Admins Only */}
        {role === 'admin' && (
          <>
            <Divider />
            <ListItem
              button
              onClick={() => {
                setMobileOpen(false);
                handleAdminSidebarToggle();
              }}
            >
              <ListItemIcon>
                <AdminPanelSettings color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ color: 'primary', fontWeight: 600 }}
              />
            </ListItem>
          </>
        )}

        {/* User Profile & Settings - For Authenticated Users */}
        {role !== 'guest' ? (
          <>
            <Divider />
            <ListItem button component={RouterLink} to="/profile" onClick={() => setMobileOpen(false)}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem button component={RouterLink} to="/settings" onClick={() => setMobileOpen(false)}>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              <ListItemIcon>
                {isLoggingOut ? (
                  <CircularProgress size={24} color="error" />
                ) : (
                  <ExitToApp color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={isLoggingOut ? 'Logging out...' : 'Logout'}
                primaryTypographyProps={{ color: 'error.main' }}
              />
            </ListItem>
          </>
        ) : (
          /* Login & Sign Up - For Guests */
          <>
            <Divider />
            <ListItem
              button
              component={RouterLink}
              to="/login"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <AccountCircle color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Login"
                primaryTypographyProps={{ color: 'primary', fontWeight: 600 }}
              />
            </ListItem>
            <ListItem
              button
              component={RouterLink}
              to="/register"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <AccountCircle color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Sign Up"
                primaryTypographyProps={{ color: 'primary', fontWeight: 600 }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth={false}>
          <Toolbar>
            {/* Logo Left */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 700,
                  mr: 2,
                }}
              >
                PSDAHS ALUMNI
              </Typography>
            </Box>

            {/* Center: Desktop Nav */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
                {navItems.map((item) => (
                  <Box key={item.text} sx={{ position: 'relative' }}>
                    <Button
                      component={item.path ? RouterLink : 'button'}
                      to={item.path}
                      onClick={() =>
                        item.children &&
                        setOpenItems({ ...openItems, [item.text]: !openItems[item.text] })
                      }
                      endIcon={
                        item.children
                          ? openItems[item.text]
                            ? <ExpandLess />
                            : <ExpandMore />
                          : null
                      }
                      sx={{
                        color:
                          location.pathname === item.path ||
                            (item.children &&
                              item.children.some((c) => c.path === location.pathname))
                            ? 'primary.main'
                            : 'text.primary',
                        fontWeight: 500,
                        mx: 1,
                        px: 2,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.icon && <Box sx={{ mr: 0.5 }}>{item.icon}</Box>}
                      {item.text}
                    </Button>
                    {item.children && openItems[item.text] && (
                      <Paper
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 10,
                          minWidth: 180,
                          boxShadow: 3,
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        {item.children.map((child) => (
                          <Button
                            key={child.text}
                            component={RouterLink}
                            to={child.path}
                            fullWidth
                            sx={{
                              justifyContent: 'flex-start',
                              px: 2,
                              py: 1.2,
                              color:
                                location.pathname === child.path
                                  ? 'primary.main'
                                  : 'text.primary',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            {child.text}
                          </Button>
                        ))}
                      </Paper>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Right: Donate + About + User */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/about"
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                >
                  About Us
                </Button>
                <Button
                  component={RouterLink}
                  to="/donate"
                  variant="contained"
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'deeppink',
                    '&:hover': { bgcolor: 'hotpink' },
                    textTransform: 'none',
                  }}
                >
                  Donate Now
                </Button>

                {role !== 'guest' ? (
                  <>
                    {/* Dashboard Button - For all authenticated users */}
                    {role === 'admin' ? (
                      <Button
                        onClick={handleAdminSidebarToggle}
                        startIcon={<AdminPanelSettings fontSize="small" />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.813rem',
                          px: 1.5,
                          py: 0.5,
                          mr: 1
                        }}
                      >
                        Dashboard
                      </Button>
                    ) : (
                      <Button
                        component={RouterLink}
                        to="/dashboard"
                        startIcon={<DashboardIcon fontSize="small" />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.813rem',
                          px: 1.5,
                          py: 0.5,
                          mr: 1
                        }}
                      >
                        Dashboard
                      </Button>
                    )}

                    <IconButton sx={{ ml: 1 }}>
                      <StyledBadge badgeContent={4} color="error">
                        <NotificationsIcon />
                      </StyledBadge>
                    </IconButton>
                    <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                      <Avatar
                        src={currentUser?.profilePicture}
                        alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                        sx={{ width: 36, height: 36 }}
                      >
                        {currentUser?.firstName?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      sx={{ 
                        textTransform: 'none',
                        pointerEvents: 'auto',
                        zIndex: 1,
                        position: 'relative'
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      color="primary"
                      sx={{ 
                        textTransform: 'none',
                        pointerEvents: 'auto',
                        zIndex: 1,
                        position: 'relative'
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleMobileToggle}>
        {drawer}
      </Drawer>

      {/* Admin Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={adminSidebarOpen}
        onClose={handleAdminSidebarToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            marginTop: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminPanelSettings sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Admin Panel
            </Typography>
          </Box>
          <IconButton onClick={handleAdminSidebarToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <List sx={{ pt: 2 }}>
          <ListItem
            button
            component={RouterLink}
            to="/dashboard"
            onClick={handleAdminSidebarToggle}
            selected={location.pathname === '/dashboard'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon color={location.pathname === '/dashboard' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/dashboard' ? 600 : 400,
              }}
            />
          </ListItem>

          <ListItem
            button
            component={RouterLink}
            to="/admin/users"
            onClick={handleAdminSidebarToggle}
            selected={location.pathname === '/admin/users'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <PeopleIcon color={location.pathname === '/admin/users' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Manage Users"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/admin/users' ? 600 : 400,
              }}
            />
          </ListItem>

          <ListItem
            button
            component={RouterLink}
            to="/admin/events"
            onClick={handleAdminSidebarToggle}
            selected={location.pathname === '/admin/events'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <EventIcon color={location.pathname === '/admin/events' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Manage Events"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/admin/events' ? 600 : 400,
              }}
            />
          </ListItem>

          <ListItem
            button
            component={RouterLink}
            to="/admin/classes"
            onClick={handleAdminSidebarToggle}
            selected={location.pathname === '/admin/classes'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <SchoolIcon color={location.pathname === '/admin/classes' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Manage Classes"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/admin/classes' ? 600 : 400,
              }}
            />
          </ListItem>

          <ListItem
            button
            component={RouterLink}
            to="/admin/announcements"
            onClick={handleAdminSidebarToggle}
            selected={location.pathname === '/admin/announcements'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <AnnouncementIcon color={location.pathname === '/admin/announcements' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Manage Announcements"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/admin/announcements' ? 600 : 400,
              }}
            />
          </ListItem>
        </List>

        <Divider sx={{ mt: 'auto' }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            PSDAHS Alumni Portal
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Admin Dashboard v1.0
          </Typography>
        </Box>
      </Drawer>

      {renderProfileMenu}
    </>
  );
};

export default Navbar;
