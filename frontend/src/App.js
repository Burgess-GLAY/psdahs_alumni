import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
// import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import store from './store/store';
import theme from './theme';
import { AuthModalProvider, useAuthModalContext } from './contexts/AuthModalContext';
import AuthInitializer from './components/auth/AuthInitializer';
import AuthModal from './components/auth/AuthModal';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import GiveBackPage from './pages/GiveBackPage';
import CommunityPage from './pages/CommunityPage';
import GalleryPage from './pages/GalleryPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Event Pages
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';

// Class Group Pages
import ClassGroupsPage from './pages/classes/ClassGroupsPage';
import ClassGroupDetailPage from './pages/classes/ClassGroupDetailPage';

// User Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/user/ProfilePage';

// Alumni Pages
import AlumniDirectoryPage from './pages/alumni/AlumniDirectoryPage';
import ConnectPage from './pages/alumni/ConnectPage';
import UserProfileView from './pages/alumni/UserProfileView';

// Announcements Pages
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';

// Donation Pages
import DonationPage from './pages/donations/DonationPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminClassesPage from './pages/admin/AdminClassesPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminClassPhotosPage from './pages/admin/AdminClassPhotosPage';

// Component to handle the global AuthModal
const GlobalAuthModal = () => {
  const { isOpen, mode, redirectPath, close } = useAuthModalContext();

  return (
    <AuthModal
      open={isOpen}
      onClose={close}
      defaultMode={mode}
      redirectAfterAuth={redirectPath}
    />
  );
};

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '643185055987-0ppnrtpne7nbh924f5tu5mg9fdr33e7e.apps.googleusercontent.com';

  return (
    // <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <AuthModalProvider>
          <AuthInitializer>
            <BrowserRouter>
              <GlobalAuthModal />
              <Routes>
                {/* Public Routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/give-back" element={<GiveBackPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />

                  {/* Auth Pages (Standalone) */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Events */}
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />

                  {/* Class Groups */}
                  <Route path="/classes" element={<ClassGroupsPage />} />
                  <Route path="/classes/:id" element={<ClassGroupDetailPage />} />

                  {/* Alumni Routes */}
                  <Route path="/alumni" element={<AlumniDirectoryPage />} />
                  <Route path="/alumni/directory" element={<AlumniDirectoryPage />} />
                  <Route path="/alumni/connect" element={<ConnectPage />} />
                  <Route path="/alumni/:id" element={<UserProfileView />} />

                  {/* Announcements */}
                  <Route path="/announcements" element={<AnnouncementsPage />} />

                  {/* Donate - correct path used by navbar */}
                  <Route path="/donate" element={<DonationPage />} />

                  {/* Settings - redirect to profile for authenticated users */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected User Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="users/:id" element={<UserProfileView />} />
                  <Route path="events" element={<AdminEventsPage />} />
                  <Route path="classes" element={<AdminClassesPage />} />
                  <Route path="classes/:id" element={<ClassGroupDetailPage />} />
                  <Route path="photos" element={<AdminClassPhotosPage />} />
                  <Route path="announcements" element={<AdminAnnouncementsPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthInitializer>
        </AuthModalProvider>
      </ThemeProvider>
    </Provider>
    // </GoogleOAuthProvider>
  );
}

export default App;
