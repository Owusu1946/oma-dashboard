import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import Doctors from './pages/Doctors';
import Pharmacies from './pages/Pharmacies';
import KYCDashboard from './pages/KYCDashboard';
import ChatViewer from './pages/ChatViewer';
import EscalationList from './pages/EscalationList';
import ProtectedRoute from './components/ProtectedRoute';

import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';
import LandingPage from './pages/LandingPage';
import DoctorRegistration from './pages/DoctorRegistration';

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/admin/users/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
      <Route path="/admin/pharmacies" element={<ProtectedRoute><Pharmacies /></ProtectedRoute>} />
      <Route path="/admin/kyc" element={<ProtectedRoute><KYCDashboard /></ProtectedRoute>} />
      <Route path="/admin/chat" element={<ProtectedRoute><ChatViewer /></ProtectedRoute>} />
      <Route path="/admin/escalations" element={<ProtectedRoute><EscalationList /></ProtectedRoute>} />
      
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
