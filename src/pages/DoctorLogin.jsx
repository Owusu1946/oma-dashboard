import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneIcon, 
  KeyIcon, 
  ArrowRightIcon,
  UserIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { mockDoctorAPI } from '../utils/mockDoctorAPI';
import OtpInput from 'react18-input-otp';

const DB_API_URL = import.meta.env.VITE_DB_API_URL || import.meta.env.VITE_API_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DOCTOR_API === 'true';
const API_BASE = (DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/,'');

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone', 'setPassword', 'enterPassword'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Doctor Login | OMA Health";
    const updateMetaDescription = (content) => {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = "description";
            document.head.appendChild(meta);
        }
        meta.content = content;
    };
    updateMetaDescription("Doctor login for OMA Health telemedicine platform. Access your dashboard to manage patient consultations.");
  }, []);

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
        const payload = { phone_number: toDbPhone(phoneNumber) };
      console.log('[DoctorLogin][check-phone] API:', `${API_BASE}/auth/doctor/check-phone`, 'payload:', payload);
      const response = await fetch(`${API_BASE}/auth/doctor/check-phone`, {
          method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

      const result = await response.json();
      console.log('[DoctorLogin][check-phone] status:', response.status, 'result:', result);

        if (!response.ok) {
        throw new Error(result.error || 'Failed to verify phone number');
        }

      if (result.status === 'NEEDS_PASSWORD_SETUP') {
        setStep('setPassword');
      } else if (result.status === 'READY_FOR_LOGIN') {
        setStep('enterPassword');
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      toast.error(error.message || 'Failed to verify phone number');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 'setPassword') {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
    }

    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = step === 'setPassword' ? 'setup-password' : 'login';
        const payload = { 
          phone_number: toDbPhone(phoneNumber),
        password,
        };
      
      console.log(`[DoctorLogin][${endpoint}] API:`, `${API_BASE}/auth/doctor/${endpoint}`, 'payload:', payload);
      const response = await fetch(`${API_BASE}/auth/doctor/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

      const result = await response.json();
      console.log(`[DoctorLogin][${endpoint}] status:`, response.status, 'result:', result);

        if (!response.ok) {
        throw new Error(result.error || 'Login failed');
        }

        localStorage.setItem('doctorToken', result.token);
        localStorage.setItem('doctorPhone', phoneNumber.trim());
      // You may want to store more doctor info from result.doctor
      localStorage.setItem('doctorInfo', JSON.stringify(result.doctor));
        toast.success('Login successful!');
      
      navigate('/doctor/dashboard', { replace: true });
    } catch (error) {
      console.error('Error during login/setup:', error);
      toast.error(error.message || 'Login failed');
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

  const getTitle = () => {
    if (step === 'phone') return 'Sign In to Your Account';
    if (step === 'setPassword') return 'Create Your Secure Password';
    return 'Enter Your Password';
  };

  const getDescription = () => {
    if (step === 'phone') return 'Enter your phone number to begin.';
    if (step === 'setPassword') return 'This is a one-time setup to secure your account.';
    return `Welcome back! Please enter the password for ${phoneNumber}`;
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
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-xl p-8 hover:shadow-2xl transition-shadow"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {step === 'phone' ? (
                  <PhoneIcon className="w-8 h-8 text-slate-600" />
                ) : (
                  <KeyIcon className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {getTitle()}
              </h2>
              <p className="text-slate-500">
                {getDescription()}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'phone' ? (
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
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || !phoneNumber.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Continue
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="password-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="password_field" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="password_field"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your secure password"
                        className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-lg transition-colors"
                        disabled={loading}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeSlashIcon/> : <EyeIcon/>}
                      </button>
                    </div>
                    {step === 'setPassword' && <p className="mt-2 text-sm text-slate-500">Must be at least 8 characters long.</p>}
                  </div>

                  {step === 'setPassword' && (
                    <div>
                      <label htmlFor="confirm_password_field" className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          id="confirm_password_field"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-lg transition-colors"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !password}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </motion.button>

                  <div className="text-center">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      whileHover={{ x: -5 }}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      ← Use different phone number
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500">
            <p className="mb-2">
              Don't have an account?{' '}
              <Link to="/doctor/register" className="font-medium text-slate-700 hover:text-slate-900">
                Register
              </Link>
            </p>
            <p className="mt-3">
              Need help? Contact{' '}
              <a href="mailto:support@omahealth.com" className="text-slate-700 hover:text-slate-900 font-medium">
                support@omahealth.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
