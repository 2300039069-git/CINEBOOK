import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/public/HomePage';
import MoviesPage from './pages/public/MoviesPage';
import MovieDetailPage from './pages/public/MovieDetailPage';
import EventsPage from './pages/public/EventsPage';
import TheatresPage from './pages/public/TheatresPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import { AboutPage, ContactPage, TermsPage, PrivacyPage, CancellationPolicyPage } from './pages/public/StaticPages';
import SeatSelectionPage from './pages/customer/SeatSelectionPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Partner / Exhibitor Portal Pages
import PartnerLayout from './pages/partner/PartnerLayout';
import PartnerDashboardPage from './pages/partner/PartnerDashboardPage';
import PartnerScreensPage from './pages/partner/PartnerScreensPage';
import PartnerShowsPage from './pages/partner/PartnerShowsPage';
import PartnerSettlementsPage from './pages/partner/PartnerSettlementsPage';
import PartnerScannerPage from './pages/partner/PartnerScannerPage';
import PartnerProfilePage from './pages/partner/PartnerProfilePage';
import PartnerAuthPage from './pages/partner/PartnerAuthPage';

// 3D Cinematic Intro, Private Access Gate & Automated AI Cinema Bot
import CinematicIntro3D from './components/common/CinematicIntro3D';
import PrivateAccessGate from './components/common/PrivateAccessGate';
import CineBotSupportModal from './components/common/CineBotSupportModal';

import { useAuth } from './context/AuthContext';

// Protected Route Component for Admins
const AdminRoute = ({ children }) => {
  const { user, isSuperAdmin, isTheatreAdmin } = useAuth();
  if (!user || (!isSuperAdmin && !isTheatreAdmin)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(() => {
    // Show 3D intro if opening home / first time in session
    const seen = sessionStorage.getItem('cinebook_intro_seen');
    return !seen && (location.pathname === '/' || location.pathname === '/welcome');
  });

  const handleCompleteIntro = () => {
    sessionStorage.setItem('cinebook_intro_seen', 'true');
    setShowIntro(false);
  };

  return (
    <PrivateAccessGate>
      {showIntro ? (
        <CinematicIntro3D onComplete={handleCompleteIntro} />
      ) : (
        <div className="flex flex-col min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] transition-colors duration-300 relative">
          <Routes>
            {/* Dedicated Route to Replay 3D Intro */}
            <Route path="/welcome" element={<CinematicIntro3D onComplete={handleCompleteIntro} />} />

            {/* Dedicated Partner / Exhibitor Portal Routes (with its own standalone dashboard layout) */}
            <Route path="/partner/login" element={<PartnerAuthPage />} />
            <Route path="/partner/register" element={<PartnerAuthPage />} />
            <Route path="/partner" element={<PartnerLayout />}>
              <Route index element={<PartnerDashboardPage />} />
              <Route path="screens" element={<PartnerScreensPage />} />
              <Route path="shows" element={<PartnerShowsPage />} />
              <Route path="settlements" element={<PartnerSettlementsPage />} />
              <Route path="scanner" element={<PartnerScannerPage />} />
              <Route path="profile" element={<PartnerProfilePage />} />
            </Route>

            {/* Public & Customer Routes with Global Customer Navbar & Footer */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      {/* Public Pages */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/movies" element={<MoviesPage />} />
                      <Route path="/movie/:slug" element={<MovieDetailPage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/theatres" element={<TheatresPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      
                      {/* Static / Policy Pages */}
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />

                      {/* Customer Booking Flow */}
                      <Route path="/seat-selection/:showId" element={<SeatSelectionPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
                      <Route path="/my-bookings" element={<MyBookingsPage />} />
                      <Route path="/dashboard" element={<CustomerDashboardPage />} />

                      {/* Admin Portal */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminDashboardPage />
                          </AdminRoute>
                        }
                      />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>

          {/* 24/7 Automated CineBot AI Assistant & Instant Refund Widget */}
          <CineBotSupportModal />
        </div>
      )}
    </PrivateAccessGate>
  );
}

export default App;
