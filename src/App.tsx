import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import DonorMap from './pages/DonorMap';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// New Auth & Verification Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VerifyMobile from './pages/VerifyMobile';

// New Public Info Pages
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

// New Dashboards
import HospitalDashboard from './pages/HospitalDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import AdminDashboard from './pages/AdminDashboard';

// New User Pages
import Notifications from './pages/Notifications';
import EmergencyContacts from './pages/EmergencyContacts';
import RequestTracking from './pages/RequestTracking';

// Layout
import DashboardLayout from './components/Layout/DashboardLayout';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    // Redirect to default dashboard if unauthorized
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'hospital') return <Navigate to="/hospital" />;
    if (user.role === 'blood_bank') return <Navigate to="/blood-bank" />;
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        {!user && <Header />}
        <main className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />

            {/* Auth Routes */}
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Layout Wrapper for Dashboard/Protected Routes */}
            <Route element={<DashboardLayout />}>
              {/* General Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['donor', 'recipient']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/emergency" element={
                <ProtectedRoute>
                  <Emergency />
                </ProtectedRoute>
              } />
              <Route path="/find-donors" element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorMap />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Verification & User pages */}
              <Route path="/verify-mobile" element={
                <ProtectedRoute>
                  <VerifyMobile />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/emergency-contacts" element={
                <ProtectedRoute>
                  <EmergencyContacts />
                </ProtectedRoute>
              } />
              <Route path="/tracking/:requestId" element={
                <ProtectedRoute>
                  <RequestTracking />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Navigate to="/profile" replace />
                </ProtectedRoute>
              } />

              {/* Specialized Dashboards */}
              <Route path="/hospital" element={
                <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/blood-bank" element={
                <ProtectedRoute allowedRoles={['blood_bank', 'admin']}>
                  <BloodBankDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={
              <Navigate to={
                user
                  ? user.role === 'admin' ? '/admin'
                    : user.role === 'hospital' ? '/hospital'
                    : user.role === 'blood_bank' ? '/blood-bank'
                    : '/dashboard'
                  : '/'
              } />
            } />
          </Routes>
        </main>
      </div>
      {!user && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
export default App;