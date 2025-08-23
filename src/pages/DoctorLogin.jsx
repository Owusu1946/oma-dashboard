import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneIcon, KeyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { mockDoctorAPI } from '../utils/mockDoctorAPI';
const DB_API_URL = import.meta.env.VITE_DB_API_URL || import.meta.env.VITE_API_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DOCTOR_API === 'true';
const API_BASE = (DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/,'');

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP input
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const toDbPhone = (value) => {
    let cleaned = String(value).replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '233' + cleaned.slice(1);
    return cleaned;
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      if (USE_MOCK) {
        // Use mock API in development
        await mockDoctorAPI.requestOTP(phoneNumber.trim());
        toast.success('OTP sent to your phone number (Mock Mode)');
      } else {
        // Call the real OTP request endpoint
        const payload = { phone_number: toDbPhone(phoneNumber) };
        console.log('[DoctorLogin][request-otp] API:', `${API_BASE}/auth/doctor/request-otp`, 'payload:', payload);
        const response = await fetch(`${API_BASE}/auth/doctor/request-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const raw = isJson ? await response.json() : await response.text();
        const result = isJson ? raw : { raw };
        console.log('[DoctorLogin][request-otp] status:', response.status, 'result:', result);

        if (!response.ok) {
          throw new Error((isJson ? (result.error || result.message) : result.raw) || 'Failed to send OTP');
        }

        toast.success('OTP sent to your phone number');
      }
      
      setStep(2);
      startCountdown();
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      if (USE_MOCK) {
        // Use mock API in development
        const result = await mockDoctorAPI.verifyOTP(phoneNumber.trim(), otp.trim());
        
        // Store the doctor token
        localStorage.setItem('doctorToken', result.token);
        localStorage.setItem('doctorPhone', phoneNumber.trim());
        
        toast.success('Login successful! (Mock Mode)');
      } else {
        // Call the real OTP verification endpoint
        const payload = { 
          phone_number: toDbPhone(phoneNumber),
          code: otp.trim() 
        };
        console.log('[DoctorLogin][verify-otp] API:', `${API_BASE}/auth/doctor/verify-otp`, 'payload:', payload);
        const response = await fetch(`${API_BASE}/auth/doctor/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const raw = isJson ? await response.json() : await response.text();
        const result = isJson ? raw : { raw };
        console.log('[DoctorLogin][verify-otp] status:', response.status, 'result:', result);

        if (!response.ok) {
          throw new Error((isJson ? (result.error || result.message) : result.raw) || 'Invalid OTP');
        }

        // Store the doctor token
        localStorage.setItem('doctorToken', result.token);
        localStorage.setItem('doctorPhone', phoneNumber.trim());
        
        toast.success('Login successful!');
      }
      
      // After successful login, redirect to dashboard
      navigate('/doctor/dashboard', { replace: true });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    handlePhoneSubmit(new Event('submit'));
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as +233 55 912 3456
    if (cleaned.length <= 3) {
      return `+${cleaned}`;
    } else if (cleaned.length <= 5) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 8) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    } else {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <PhoneIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            OMA Health Portal
          </h2>
          <p className="text-gray-600">
            {step === 1 
              ? 'Enter your phone number to receive a login code'
              : 'Enter the 6-digit code sent to your phone'
            }
          </p>
          {/* Branding chip removed in production */}
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+233 55 912 3456"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    disabled={loading}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  We'll send a 6-digit code to this number
                </p>
                {/* Mock hint removed in production */}
              </div>

              <button
                type="submit"
                disabled={loading || !phoneNumber.trim()}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    Send Code
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest"
                    disabled={loading}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
                {/* Mock hint removed in production */}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Verify & Login'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={countdown > 0}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 
                    ? `Resend code in ${countdown}s`
                    : 'Resend code'
                  }
                </button>
              </div>

              {/* Back to phone input */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setCountdown(0);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  ← Use different phone number
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Welcome to OMA Health - Your Telemedicine Platform</p>
          <p className="mt-1">
            Need help? Contact{' '}
            <a href="mailto:support@omahealth.com" className="text-blue-600 hover:text-blue-500">
              support@omahealth.com
            </a>
          </p>
          <p className="mt-2">
            <Link to="/admin/login" className="text-blue-600 hover:text-blue-500 underline">
              Admin Portal Access
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
