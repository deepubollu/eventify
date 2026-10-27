import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// 13 Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExploreEventsPage } from './pages/ExploreEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { DigitalTicketPage } from './pages/DigitalTicketPage';
import { QrVerificationPage } from './pages/QrVerificationPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* 1. Home page */}
              <Route path="/" element={<HomePage />} />

              {/* 2. Login page */}
              <Route path="/login" element={<LoginPage />} />

              {/* 3. Registration page */}
              <Route path="/register" element={<RegisterPage />} />

              {/* 4. Explore Events page */}
              <Route path="/events" element={<ExploreEventsPage />} />

              {/* 5. Event Details page */}
              <Route path="/events/:id" element={<EventDetailsPage />} />

              {/* 6. Create Event page (organizer, admin) */}
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />

              {/* 7. Edit Event page (organizer, admin) */}
              <Route
                path="/edit-event/:id"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />

              {/* 8. My Bookings page */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* 9. Digital Ticket page with QR code */}
              <Route path="/ticket/:ticketId" element={<DigitalTicketPage />} />

              {/* 10. QR Scanner and Verification page */}
              <Route
                path="/verify-ticket"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <QrVerificationPage />
                  </ProtectedRoute>
                }
              />

              {/* 11. Organizer Dashboard */}
              <Route
                path="/organizer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 12. Admin Dashboard */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 13. User Profile page */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

