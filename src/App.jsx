import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import Doctors from './pages/Doctors';
import Pharmacies from './pages/Pharmacies';
import KYCDashboard from './pages/KYCDashboard';
import ChatViewer from './pages/ChatViewer';
import EscalationList from './pages/EscalationList';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';
import LandingPage from './pages/LandingPage';
import DoctorRegistration from './pages/DoctorRegistration';
import LegalPage from './pages/LegalPage';

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/legal/:section" element={<LegalPage />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:userId" element={<UserProfile />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:bookingId" element={<BookingDetails />} />
        <Route path="pharmacies" element={<Pharmacies />} />
        <Route path="kyc" element={<KYCDashboard />} />
        <Route path="chat" element={<ChatViewer />} />
        <Route path="chat/:userId" element={<ChatViewer />} />
        <Route path="escalations" element={<EscalationList />} />
      </Route>
      
      {/* Doctor Routes */}
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/register" element={<DoctorRegistration />} />
      <Route 
        path="/doctor/dashboard" 
        element={
          <DoctorProtectedRoute>
            <DoctorDashboard />
          </DoctorProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
