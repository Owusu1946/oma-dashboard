import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import Dashboard from './pages/Dashboard';
import EscalationList from './pages/EscalationList';
import ChatViewer from './pages/ChatViewer';
import KYCDashboard from './pages/KYCDashboard';
import UserProfile from './pages/UserProfile';
import Users from './pages/Users';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Pharmacies from './pages/Pharmacies';
// Doctor-specific imports
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Main Entry Point - Redirect to Doctor Login */}
      <Route path="/" element={<Navigate to="/doctor/login" replace />} />
      
      {/* Doctor Portal Routes */}
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/dashboard" element={
        <DoctorProtectedRoute>
          <DoctorDashboard />
        </DoctorProtectedRoute>
      } />
      
      {/* Admin Portal Routes */}
      <Route path="/admin/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <DatabaseProvider>
            <Layout />
          </DatabaseProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="escalations" element={<EscalationList />} />
        <Route path="chat/:sessionId" element={<ChatViewer />} />
        <Route path="kyc" element={<KYCDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:userId" element={<UserProfile />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:doctorId" element={<DoctorProfile />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:bookingId" element={<BookingDetails />} />
        <Route path="pharmacies" element={<Pharmacies />} />
      </Route>
    </Routes>
  );
}

export default App;
