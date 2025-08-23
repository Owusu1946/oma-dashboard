import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneIcon, 
  KeyIcon, 
  ArrowRightIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { mockDoctorAPI } from '../utils/mockDoctorAPI';
import OtpInput from 'react18-input-otp';

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
        await mockDoctorAPI.requestOTP(phoneNumber.trim());
        toast.success('OTP sent to your phone number (Mock Mode)');
      } else {
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
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      if (USE_MOCK) {
        const result = await mockDoctorAPI.verifyOTP(phoneNumber.trim(), otp);
        localStorage.setItem('doctorToken', result.token);
        localStorage.setItem('doctorPhone', phoneNumber.trim());
        toast.success('Login successful! (Mock Mode)');
      } else {
        const payload = { 
          phone_number: toDbPhone(phoneNumber),
          code: otp
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

        localStorage.setItem('doctorToken', result.token);
        localStorage.setItem('doctorPhone', phoneNumber.trim());
        toast.success('Login successful!');
      }
      
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
    const cleaned = value.replace(/\D/g, '');
    
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">OMA Health</h1>
              <p className="text-slate-300 text-sm">Telemedicine Platform</p>
            </div>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6">
              Welcome to the Future of Healthcare
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Access your personalized dashboard to manage patient consultations, 
              prescriptions, and telemedicine sessions with ease.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-slate-300">Secure & HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-slate-300">24/7 Patient Access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-slate-300">Personalized Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">OMA Health</h1>
                <p className="text-slate-500 text-sm">Telemedicine Platform</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {step === 1 ? (
                  <PhoneIcon className="w-8 h-8 text-slate-600" />
                ) : (
                  <KeyIcon className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {step === 1 ? 'Sign In to Your Account' : 'Verify Your Identity'}
              </h2>
              <p className="text-slate-500">
                {step === 1 
                  ? 'Enter your phone number to receive a secure login code'
                  : 'Enter the 6-digit code sent to your phone'
                }
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="phone-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handlePhoneSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="+233 55 912 3456"
                        className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-lg transition-colors"
                        disabled={loading}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      We'll send a secure 6-digit code to this number
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                      Verification Code
                    </label>
                    <div className="flex justify-center">
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        isInputNum
                        shouldAutoFocus
                        inputStyle={{
                          width: '3rem',
                          height: '3rem',
                          margin: '0 0.25rem',
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          border: '2px solid #e2e8f0',
                          borderRadius: '0.75rem',
                          backgroundColor: '#ffffff',
                          color: '#1e293b',
                          transition: 'all 0.2s ease',
                        }}
                        focusStyle={{
                          border: '2px solid #0f172a',
                          boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)',
                        }}
                        containerStyle={{
                          gap: '0.5rem',
                        }}
                        disabledStyle={{
                          backgroundColor: '#f8fafc',
                          color: '#94a3b8',
                        }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-500 text-center">
                      Enter the 6-digit code sent to {phoneNumber}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={countdown > 0}
                      className="text-sm text-slate-600 hover:text-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {countdown > 0 
                        ? `Resend code in ${countdown}s`
                        : 'Resend verification code'
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
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      ← Use different phone number
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500">
            <p className="mb-2">Welcome to OMA Health - Your Telemedicine Platform</p>
            <p className="mb-3">
              Need help? Contact{' '}
              <a href="mailto:support@omahealth.com" className="text-slate-700 hover:text-slate-900 font-medium">
                support@omahealth.com
              </a>
            </p>
            <Link 
              to="/admin/login" 
              className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ShieldCheckIcon className="w-4 h-4 mr-1" />
              Admin Portal Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
