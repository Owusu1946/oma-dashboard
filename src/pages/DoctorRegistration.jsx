import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const API_BASE = (import.meta.env.VITE_DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/, '');

export default function DoctorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    specialty: '',
    bio: '',
    experience_years: '',
    medical_license_number: '',
    hospital_affiliation: '',
    consultation_fee: ''
  });
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/doctors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Registration successful!');
      setRegistrationComplete(true);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-lg mx-auto"
        >
          <ShieldCheckIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for registering. Our team will review your application. You will receive an email and a WhatsApp message once your account is approved.
          </p>
          <button
            onClick={() => navigate('/doctor/login')}
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Become an OMA Health Doctor</h2>
          <p className="mt-2 text-lg text-slate-600">Join our network of trusted medical professionals.</p>
        </div>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-slate-200/60"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField name="name" label="Full Name" icon={UserIcon} value={formData.name} onChange={handleChange} required />
            <InputField name="phone_number" label="Phone Number" icon={PhoneIcon} value={formData.phone_number} onChange={handleChange} required />
            <InputField name="email" label="Email Address" type="email" icon={EnvelopeIcon} value={formData.email} onChange={handleChange} required />
            <InputField name="specialty" label="Specialty" icon={AcademicCapIcon} value={formData.specialty} onChange={handleChange} />
            <InputField name="medical_license_number" label="Medical License Number" icon={IdentificationIcon} value={formData.medical_license_number} onChange={handleChange} required />
            <InputField name="hospital_affiliation" label="Hospital of Affiliation" icon={BuildingOfficeIcon} value={formData.hospital_affiliation} onChange={handleChange} />
            <InputField name="experience_years" label="Years of Experience" type="number" icon={AcademicCapIcon} value={formData.experience_years} onChange={handleChange} />
            <InputField name="consultation_fee" label="Consultation Fee (GHS)" type="number" icon={CurrencyDollarIcon} value={formData.consultation_fee} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">Biography</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              placeholder="Tell patients a little about yourself..."
            ></textarea>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
            >
              {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Submit Application'}
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/doctor/login" className="font-medium text-slate-800 hover:text-slate-600">
                Sign In
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

const InputField = ({ name, label, type = 'text', icon: Icon, value, onChange, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
      />
    </div>
  </div>
);
