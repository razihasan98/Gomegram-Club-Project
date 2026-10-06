import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ClubProvider } from './context/ClubContext';
import { GlobalLoader } from './components/public/GlobalLoader';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { MembersPage } from './pages/public/MembersPage';
import { EventsPage } from './pages/public/EventsPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { LoginPage } from './pages/public/LoginPage';

// Admin Pages
import { DashboardOverview } from './pages/admin/DashboardOverview';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminFees } from './pages/admin/AdminFees';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminEventExpenses } from './pages/admin/AdminEventExpenses';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminJourneys } from './pages/admin/AdminJourneys';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import AdminSlider from './pages/admin/AdminSlider';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ClubProvider>
          <BrowserRouter>
            <GlobalLoader />
            <ScrollToTop />
            <Routes>
              {/* Public Website Routes (with Navbar & Footer) */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
              </Route>

              {/* Standalone Admin Login (No Public Navbar/Footer) */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/login" element={<Navigate to="/admin/login" replace />} />

              {/* Protected Admin Console Routes (with Admin Sidebar) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardOverview />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="expenses" element={<AdminEventExpenses />} />
                <Route path="fees" element={<AdminFees />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="journeys" element={<AdminJourneys />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="slider" element={<AdminSlider />} />
              </Route>

              {/* 404 Catch-All Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ClubProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
