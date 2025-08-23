import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { mockDoctorAPI } from '../utils/mockDoctorAPI';
const DB_API_URL = import.meta.env.VITE_DB_API_URL || import.meta.env.VITE_API_URL;
const API_BASE = (DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/,'');
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DOCTOR_API === 'true';

export default function DoctorProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('doctorToken');
      const phone = localStorage.getItem('doctorPhone');
      
      if (!token || !phone) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (USE_MOCK) {
        // Use mock API in development
        try {
          await mockDoctorAPI.getDoctorProfile(token);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('doctorToken');
          localStorage.removeItem('doctorPhone');
          setIsAuthenticated(false);
        }
      } else {
        // Verify token with backend
        const response = await fetch(`${API_BASE}/doctor/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401 || response.status === 403) {
          // Token invalid/expired
          localStorage.removeItem('doctorToken');
          localStorage.removeItem('doctorPhone');
          setIsAuthenticated(false);
        } else {
          // Non-auth errors shouldn't bounce user back to login
          console.warn('Auth check non-OK status:', response.status);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Network/other errors: allow page to render and let API calls handle
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" replace state={{ from: location }} />;
  }

  return children;
}
