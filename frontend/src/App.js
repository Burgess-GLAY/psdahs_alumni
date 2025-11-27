import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { SnackbarProvider, useSnackbar } from 'notistack';
import theme from './theme';
import { setEnqueueSnackbar } from './utils/notifications';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import AboutPage from './pages/AboutPage';
import HistoryPage from './pages/about/HistoryPage';
import GiveBackPage from './pages/GiveBackPage';
import ConnectPage from './pages/alumni/ConnectPage';
import ProfilePage from './pages/user/ProfilePage';
import DashboardPage from './pages/user/DashboardPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminClassesPage from './pages/admin/AdminClassesPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import DonationPage from './pages/donations/DonationPage';
import AlumniDirectoryPage from './pages/alumni/AlumniDirectoryPage';
import UserProfileView from './pages/alumni/UserProfileView';
import ClassGroupsPage from './pages/classes/ClassGroupsPage';
import ClassGroupDetailPage from './pages/classes/ClassGroupDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ContactPage from './pages/ContactPage';
import CommunityPage from './pages/CommunityPage';
import GalleryPage from './pages/GalleryPage';
import AuthInitializer from './components/auth/AuthInitializer';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthModalProvider, useAuthModalContext } from './contexts/AuthModalContext';
import store from './store/store';
import { setStoreReference, setAuthModalReference } from './services/authService';

/**
 * AppContent component that uses the AuthModalContext
 * Separated to allow access to context hooks
 */
const AppContent = () => {
  const authModalContext = useAuthModalContext();
  const { isOpen, mode, redirectPath, close } = authModalContext;
  const { enqueueSnackbar } = useSnackbar();

  // Set up references for axios interceptor and notifications
  useEffect(() => {
    setStoreReference(store);
    setAuthModalReference(authModalContext);
    setEnqueueSnackbar(enqueueSnackbar);
  }, [authModalContext, enqueueSnackbar]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="give-back" element={<GiveBackPage />} />
            <Route path="network" element={<ConnectPage />} />

            {/* Protected User Routes */}
            <Route
              path="profile"
              element={
                <ProtectedRoute requiredRole="user">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="announcements"
              element={
                <ProtectedRoute requiredRole="user">
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="donate"
              element={
                <ProtectedRoute requiredRole="user">
                  <DonationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="alumni"
              element={
                <ProtectedRoute requiredRole="user">
                  <AlumniDirectoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="alumni/:userId"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="classes"
              element={
                <ProtectedRoute requiredRole="user">
                  <ClassGroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="class-groups/:id"
              element={
                <ProtectedRoute requiredRole="user">
                  <ClassGroupDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Using regular Layout with admin sidebar in Navbar */}
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ErrorBoundary fallbackMessage="An error occurred in the admin dashboard. Please try refreshing the page.">
                    <AdminDashboardPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ErrorBoundary fallbackMessage="An error occurred in the users management page.">
                    <AdminUsersPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/events"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ErrorBoundary fallbackMessage="An error occurred in the events management page.">
                    <AdminEventsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/classes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ErrorBoundary fallbackMessage="An error occurred in the classes management page.">
                    <AdminClassesPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/announcements"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ErrorBoundary fallbackMessage="An error occurred in the announcements management page.">
                    <AdminAnnouncementsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Box>

      {/* Global AuthModal controlled by context */}
      <AuthModal
        open={isOpen}
        onClose={close}
        defaultMode={mode}
        redirectAfterAuth={redirectPath}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <AuthModalProvider>
          <AuthInitializer>
            <AppContent />
          </AuthInitializer>
        </AuthModalProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
