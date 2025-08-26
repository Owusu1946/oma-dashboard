import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
// import { mockDoctorAPI } from '../utils/mockDoctorAPI';
const DB_API_URL = import.meta.env.VITE_DB_API_URL || import.meta.env.VITE_API_URL;
const API_BASE = (DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/,'');
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DOCTOR_API === 'true';

// ==================================
// API Fetcher Functions
// ==================================

const fetchDoctorAnalytics = async () => {
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE}/doctor/analytics`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

const fetchDoctorProfile = async () => {
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE}/doctor/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch doctor profile');
  return response.json();
};

const fetchDoctorBookings = async ({ queryKey }) => {
  const [_key, { page, limit, sortField, sortOrder }] = queryKey;
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  
  const params = new URLSearchParams({ page, limit, sortField, sortOrder });
  const response = await fetch(`${API_BASE}/doctor/bookings?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

const fetchDoctorPrescriptions = async () => {
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE}/doctor/prescriptions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch prescriptions');
  return response.json();
};

const fetchDoctorFinance = async () => {
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE}/doctor/finance`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch finance data');
  return response.json();
};

const requestPayout = async ({ amount, paymentMethod }) => {
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE}/doctor/payouts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Payout request failed');
  }
  return response.json();
};

const savePaymentMethod = async (paymentMethod) => {
  const token = localStorage.getItem('doctorToken');
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE}/doctor/payment-method`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: paymentMethod.provider,
      details: { number: paymentMethod.number },
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save payment method');
  }
  return response.json();
};


// ==================================
// Main Dashboard Component
// ==================================

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationsButtonRef = useRef(null);

  useEffect(() => {
    document.title = "Doctor Dashboard | OMA Health";
    const updateMetaDescription = (content) => {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = "description";
            document.head.appendChild(meta);
        }
        meta.content = content;
    };
    updateMetaDescription("Manage your patient consultations, prescriptions, and telemedicine sessions on the OMA Health dashboard.");
  }, []);

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    { id: 1, type: 'booking', message: 'New booking from John Doe.', time: '2m ago', read: false },
    { id: 2, type: 'payment', message: 'Payout of ₵400.00 processed.', time: '1h ago', read: false },
    { id: 3, type: 'reminder', message: 'Upcoming appointment with Jane Smith in 30 minutes.', time: '1d ago', read: true },
    { id: 4, type: 'system', message: 'Your profile has been updated.', time: '2d ago', read: true },
  ];

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsOpen &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  // Check auth on component mount
  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (!token) {
      navigate('/doctor/login');
    }
  }, [navigate]);
  
  // React Query for Doctor Profile
  const { data: doctor, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['doctorProfile'],
    queryFn: fetchDoctorProfile,
    staleTime: Infinity, // Profile data is stable
    onError: () => {
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('doctorPhone');
      navigate('/doctor/login');
    },
  });

  // React Query for Bookings (will be used in BookingsView)
  // This initial fetch helps populate the stats on the main dashboard
  const { data: initialBookingsData, isLoading: areInitialBookingsLoading } = useQuery({
    queryKey: ['bookings', { page: 1, limit: 5, sortField: 'consultation_date', sortOrder: 'desc' }],
    queryFn: fetchDoctorBookings,
  });

  const { data: initialPrescriptionsData } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: fetchDoctorPrescriptions,
  });

  const { data: upcomingBookingsData, isLoading: areUpcomingBookingsLoading } = useQuery({
    queryKey: ['bookings', 'upcoming'],
    queryFn: async () => {
      const token = localStorage.getItem('doctorToken');
      if (!token) throw new Error('No auth token found');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const params = new URLSearchParams({
        page: 1,
        limit: 5,
        sortField: 'consultation_date',
        sortOrder: 'asc',
        status: 'confirmed',
        from_date: today.toISOString()
      });
      const response = await fetch(`${API_BASE}/doctor/bookings?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch upcoming bookings');
      return response.json();
    },
  });

  // Mutations for doctor actions
  const mutation = useMutation({
    mutationFn: async ({ url, method = 'PUT', body }) => {
      const token = localStorage.getItem('doctorToken');
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success('Action successful!');
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      // Show meet link modal on acceptance
      if (variables.body.action === 'accept' && data.call_room_url) {
        setMeetLink(data.call_room_url);
        setIsMeetModalOpen(true);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const waitingNotificationMutation = useMutation({
    mutationFn: async (bookingId) => {
      const token = localStorage.getItem('doctorToken');
      const response = await fetch(`${API_BASE}/doctor/bookings/${bookingId}/waiting`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Patient has been notified that you're waiting.");
      queryClient.invalidateQueries({ queryKey: ['bookings', 'upcoming'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const setStatus = (status) => {
    mutation.mutate({
      url: `${API_BASE}/doctor/status`,
      body: { availability_status: status },
    });
  };

  const actOnBooking = (bookingId, action, extra = {}) => {
    mutation.mutate({
      url: `${API_BASE}/doctor/bookings/${bookingId}`,
      body: { action, ...extra },
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorPhone');
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate('/doctor/login');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const stats = initialBookingsData ? {
    totalBookings: initialBookingsData.total,
    pendingBookings: initialBookingsData.pending,
    completedBookings: initialBookingsData.completed,
    totalEarnings: initialBookingsData.earnings,
  } : { totalBookings: 0, pendingBookings: 0, completedBookings: 0, totalEarnings: 0 };
  
  const prescriptionStats = initialPrescriptionsData ? {
    pending: initialPrescriptionsData.pending,
  } : { pending: 0 };
  
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'bookings', name: 'Bookings', icon: CalendarDaysIcon, badge: stats.pendingBookings },
    { id: 'prescriptions', name: 'Prescriptions', icon: DocumentTextIcon, badge: prescriptionStats.pending },
    { id: 'availability', name: 'Availability', icon: CalendarIcon },
    { id: 'finance', name: 'Finance', icon: BanknotesIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'chat', name: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  // Handle creating a new prescription
  const handleCreatePrescription = async (prescriptionData) => {
    try {
      const token = localStorage.getItem('doctorToken');
      const resp = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });
      if (!resp.ok) throw new Error('Failed to create prescription');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast.success('Prescription created successfully');
    } catch (error) {
      console.error('Create prescription error:', error);
      toast.error('Failed to create prescription');
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('doctorToken');
      const resp = await fetch(`${API_BASE}/doctor/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.prescriptions || [];
      }
      return [];
    } catch (error) {
      console.error('Fetch prescriptions error:', error);
      return [];
    }
  };

  // Fetch availability
  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('doctorToken');
      const resp = await fetch(`${API_BASE}/doctor/availability`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.availability || [];
      }
      return [];
    } catch (error) {
      console.error('Fetch availability error:', error);
      return [];
    }
  };

  // Update availability
  const updateAvailability = async (availabilityData) => {
    const token = localStorage.getItem('doctorToken');
    const resp = await fetch(`${API_BASE}/doctor/availability`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability: availabilityData })
    });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: 'Failed to update availability' }));
      throw new Error(errorData.error || 'Unknown error');
    }
    return resp.json();
  };

  // Render sidebar content
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/60 h-16">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            {doctor?.profile_image_url ? (
              <img src={doctor.profile_image_url} alt="Doctor" className="w-full h-full rounded-lg object-cover" />
            ) : (
              <UserCircleIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Dr. {doctor?.name || 'Doctor'}</h2>
            <p className="text-xs text-slate-500">{doctor?.specialty || 'Medicine'}</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-600 lg:hidden"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isActive ? 'bg-white text-slate-900' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-slate-200/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  if (isProfileLoading) {
    return <LoadingSpinner />;
  }

  if (isProfileError || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load doctor information</p>
          <button
            onClick={() => navigate('/doctor/login')}
            className="text-blue-600 hover:text-blue-500"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 lg:hidden"
      >
        {renderSidebarContent()}
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:static lg:z-auto w-64 bg-white border-r border-slate-200/60">
        {renderSidebarContent()}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-slate-500 hover:text-slate-700 lg:hidden"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900 capitalize">{activeView}</h1>
                  {USE_MOCK && (
                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Mock Mode
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative" ref={notificationsButtonRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-500 hover:text-slate-700 relative"
                  >
                  <BellIcon className="w-5 h-5" />
                    {mockNotifications.some(n => !n.read) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-100">
                          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              </div>
                        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                          {mockNotifications.map(notification => (
                            <div key={notification.id} className={`p-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                              <p className="text-sm text-slate-800">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                            </div>
                          ))}
                           {mockNotifications.length === 0 && (
                            <p className="p-4 text-sm text-slate-500 text-center">No new notifications.</p>
                          )}
                        </div>
                        <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                          <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="p-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Google Meet Link Modal */}
      <AnimatePresence>
        {isMeetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-600 mb-6">
                  A Google Meet link has been generated and sent to the patient.
                </p>
                <div className="relative bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={meetLink}
                    className="w-full bg-transparent text-slate-700 focus:outline-none pr-12"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ClipboardDocumentIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setIsMeetModalOpen(false)}
                  className="mt-6 w-full px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render the active view content
  function renderActiveView() {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'bookings':
        return <BookingsView />;
      case 'prescriptions':
        return <PrescriptionsView />;
      case 'availability':
        return <AvailabilityView />;
      case 'finance':
        return <FinanceView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'chat':
        return <ChatView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  }

  // Dashboard view component
  function DashboardView() {
    const sendRemindersMutation = useMutation({
      mutationFn: async () => {
        const token = localStorage.getItem('doctorToken');
        const response = await fetch(`${API_BASE}/doctor/bookings/send-reminders`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send reminders');
        }
        return response.json();
      },
      onSuccess: (data) => {
        if (data.remindersSent > 0) {
          const patientEmailsSent = data.details.filter(d => d.patient.email === 'sent').length;
          const doctorEmailsSent = data.details.filter(d => d.doctor.email === 'sent').length;
          const totalEmails = patientEmailsSent + doctorEmailsSent;
          
          let message = `${data.remindersSent} booking(s) processed.`;
          if (totalEmails > 0) {
              message += ` ${totalEmails} email reminder(s) sent.`;
          } else {
              message += ` No emails were sent. Check patient/doctor profiles for email addresses.`;
          }
          
          toast.success(message, { duration: 5000 });
          queryClient.invalidateQueries({ queryKey: ['bookings', 'upcoming'] });
        } else {
          toast.success('No new reminders to send.');
        }
        console.log('Reminder results:', data.details); // Also log to console for debugging
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    return (
      <div className="space-y-6">
        {/* Status Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Status</h2>
              <p className="text-sm text-slate-500">
                Currently {doctor?.availability_status === 'available' ? 'available' : 
                         doctor?.availability_status === 'busy' ? 'busy' : 'offline'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setStatus('available')} 
                disabled={mutation.isLoading} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  doctor?.availability_status === 'available' 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                Available
              </button>
              <button 
                onClick={() => setStatus('busy')} 
                disabled={mutation.isLoading} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  doctor?.availability_status === 'busy' 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                Busy
              </button>
              <button 
                onClick={() => setStatus('unavailable')} 
                disabled={mutation.isLoading} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  doctor?.availability_status === 'unavailable' 
                    ? 'bg-slate-200 text-slate-700 border border-slate-300' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.completedBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Earnings</p>
            <p className="text-2xl font-bold text-slate-900">₵{stats.totalEarnings.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Upcoming Appointments & Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h3>
              <button
                onClick={() => sendRemindersMutation.mutate()}
                disabled={sendRemindersMutation.isLoading}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {sendRemindersMutation.isLoading ? 'Sending...' : 'Send Reminders'}
              </button>
            </div>
            <div>
              {areUpcomingBookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-32"></div>
                      </div>
                      <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                    </div>
                  ))}
                </div>
              ) : upcomingBookingsData?.bookings?.length > 0 ? (
                <ul role="list" className="divide-y divide-slate-100">
                  {upcomingBookingsData.bookings.map((booking) => {
                    const consultationTime = new Date(booking.consultation_date);
                    const now = new Date();
                    const isJoinable = now >= consultationTime;

                    return (
                      <li key={booking.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{booking.users?.first_name || 'Patient'}</p>
                            <p className="text-sm text-slate-500">{formatDate(booking.consultation_date)}</p>
                            {booking.reminder_sent_at && (
                              <p className="text-xs text-emerald-600 mt-1 flex items-center">
                                <BellIcon className="w-3 h-3 mr-1" /> Reminder Sent
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isJoinable && (
                              <button
                                onClick={() => waitingNotificationMutation.mutate(booking.id)}
                                disabled={waitingNotificationMutation.isLoading || booking.doctor_waiting_notification_sent_at}
                                className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                              >
                                {booking.doctor_waiting_notification_sent_at ? 'Notified' : "I'm Waiting"}
                              </button>
                            )}
                            <a 
                              href={isJoinable ? (booking.call_room_url || '#') : '#'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                                isJoinable 
                                  ? 'bg-slate-900 hover:bg-slate-800' 
                                  : 'bg-slate-300 cursor-not-allowed'
                              }`}
                              onClick={(e) => !isJoinable && e.preventDefault()}
                            >
                                <VideoCameraIcon className="w-4 h-4" />
                                <span>Join</span>
                            </a>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-slate-500 text-center py-4">No upcoming confirmed appointments.</p>
              )}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <button
                  onClick={() => setActiveView('bookings')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                  View all
              </button>
            </div>
            <div>
              {areInitialBookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-32"></div>
                      </div>
                      <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                    </div>
                  ))}
                </div>
              ) : initialBookingsData?.bookings?.length > 0 ? (
                <ul role="list" className="divide-y divide-slate-100">
                  {initialBookingsData.bookings.slice(0, 5).map((booking) => (
                    <li key={booking.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{booking.users?.first_name || 'Patient'}</p>
                          <p className="text-sm text-slate-500">{formatDate(booking.consultation_date)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Bookings view component
  function BookingsView() {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ field: 'consultation_date', order: 'desc' });
  
    const { data: bookingsData, isLoading, isError, error, isFetching } = useQuery({
      queryKey: ['bookings', { page, limit: 10, sortField: sort.field, sortOrder: sort.order }],
      queryFn: fetchDoctorBookings,
      keepPreviousData: true,
    });
  
    const handleSort = (field) => {
      setSort(current => ({
        field,
        order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
      }));
    };

    const SortableHeader = ({ field, children }) => (
      <th onClick={() => handleSort(field)} className="cursor-pointer text-left text-sm font-semibold text-slate-900 px-6 py-3">
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {sort.field === field && (
            sort.order === 'asc' ? <ChevronUpIcon className="w-4 h-4 text-slate-500" /> : <ChevronDownIcon className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </th>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">All Bookings</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">{stats.pendingBookings} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          {isLoading ? (
            <BookingsTableSkeleton />
          ) : isError ? (
            <p className="p-6 text-center text-red-500">Error: {error.message}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200/60">
                  <tr>
                    <SortableHeader field="users.first_name">Patient</SortableHeader>
                    <SortableHeader field="consultation_date">Date</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                  <tbody className="md:divide-y md:divide-slate-100">
                  {bookingsData?.bookings.map((booking) => (
                      <tr key={booking.id} className="block md:table-row border-b last:border-b-0 border-slate-100 md:border-none">
                        <td className="p-4 md:px-6 md:py-4 md:whitespace-nowrap text-sm flex justify-between items-center md:table-cell">
                          <strong className="md:hidden text-slate-600">Patient</strong>
                          <span className="font-medium text-slate-900 text-right md:text-left">{booking.users?.first_name || 'Patient'}</span>
                      </td>
                        <td className="p-4 pt-0 md:px-6 md:py-4 md:whitespace-nowrap text-sm text-slate-500 flex justify-between items-center md:table-cell">
                          <strong className="md:hidden text-slate-600">Date</strong>
                          <span>{booking.consultation_date ? formatDate(booking.consultation_date) : 'Date not set'}</span>
                      </td>
                        <td className="p-4 pt-0 md:px-6 md:py-4 md:whitespace-nowrap text-sm flex justify-between items-center md:table-cell">
                          <strong className="md:hidden text-slate-600">Status</strong>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                        <td className="p-4 pt-2 md:px-6 md:py-4 md:whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 justify-end">
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => actOnBooking(booking.id, 'accept')} 
                              disabled={mutation.isLoading} 
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Accept"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => actOnBooking(booking.id, 'reject')} 
                              disabled={mutation.isLoading} 
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={async () => {
                              const room = prompt('Enter call room URL (optional)', booking.call_room_url || '');
                              await actOnBooking(booking.id, 'start', { call_room_url: room || undefined, consultation_mode: 'video' });
                            }} 
                            disabled={mutation.isLoading} 
                                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Start</span>
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <span className="text-sm text-slate-400">Completed</span>
                        )}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="p-4 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {bookingsData?.pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (bookingsData?.pagination.totalPages || 1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Prescriptions view component
  function PrescriptionsView() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [patientToConfirm, setPatientToConfirm] = useState(null);
    const [newPrescription, setNewPrescription] = useState({
      user_id: '',
      patient_phone: '',
      medications: [{ name: '', dosage: '', quantity: '', instructions: '' }],
      delivery_address: '',
      notes: ''
    });

    const { data: prescriptionsData, isLoading, isError, error } = useQuery({
      queryKey: ['prescriptions'],
      queryFn: fetchDoctorPrescriptions,
    });

    const generatePrescriptionHTML = (prescription, doctor) => {
      const medicationsHTML = prescription.prescription_items
        .map(
          (item) => `
            <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; margin-bottom: 16px;">
              <p style="font-weight: 600; font-size: 1.125rem; color: #1e293b; margin: 0;">${item.medication_name || item.name}</p>
              <div style="margin-top: 8px; font-size: 0.875rem;">
                <p style="margin: 4px 0;"><strong style="font-weight: 500; color: #475569;">Dosage:</strong> ${item.dosage}</p>
                <p style="margin: 4px 0;"><strong style="font-weight: 500; color: #475569;">Quantity:</strong> ${item.quantity}</p>
              </div>
              <p style="margin-top: 8px; font-size: 0.875rem;"><strong style="font-weight: 500; color: #475569;">Instructions:</strong> ${item.instructions}</p>
            </div>
          `
        )
        .join('');
    
      return `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #334155; background-color: #f1f5f9; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
            <div style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <h1 style="font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 0;">OMA Health</h1>
              <p style="color: #64748b; margin: 4px 0 0;">Your Trusted Telemedicine Partner</p>
            </div>
    
            <table style="width: 100%; margin: 32px 0; border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 16px; vertical-align: top;">
                  <h2 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0;">Dr. ${doctor.name}</h2>
                  <p style="font-size: 0.875rem; color: #475569; margin: 4px 0 0;">${doctor.specialty}</p>
                  <p style="font-size: 0.875rem; color: #475569; margin: 4px 0 0;">${doctor.phone_number}</p>
                </td>
                <td style="padding-bottom: 16px; text-align: right; vertical-align: top;">
                  <h2 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0;">Patient: ${prescription.patient?.first_name || 'N/A'}</h2>
                  <p style="font-size: 0.875rem; color: #475569; margin: 4px 0 0;">Date: ${new Date(prescription.created_at).toLocaleDateString()}</p>
                  <p style="font-size: 0.875rem; color: #475569; margin: 4px 0 0;">Reference ID: ${prescription.reference_id}</p>
                </td>
              </tr>
            </table>
    
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 700; text-align: center; margin-bottom: 24px; padding: 8px 0; background-color: #f1f5f9; border-radius: 8px;">E-Prescription (Rx)</h2>
              ${medicationsHTML}
            </div>
            
            ${prescription.notes ? `
            <div style="margin-top: 24px;">
                <h3 style="font-size: 1rem; font-weight: 600; color: #0f172a;">Doctor's Notes:</h3>
                <p style="font-size: 0.875rem; color: #475569; border-left: 3px solid #cbd5e1; padding-left: 12px; margin: 8px 0; white-space: pre-wrap;">${prescription.notes}</p>
            </div>` : ''}
    
            <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.75rem; color: #64748b;">
              <p>This is a digitally generated prescription and does not require a physical signature.</p>
              <p>&copy; ${new Date().getFullYear()} OMA Health. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const findPatientMutation = useMutation({
      mutationFn: async (phoneNumber) => {
        const token = localStorage.getItem('doctorToken');
        const userResp = await fetch(`${API_BASE}/users/phone/${normalizeDbPhoneNumber(phoneNumber)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!userResp.ok) {
          if (userResp.status === 404) throw new Error('Patient not found with this phone number.');
          const errorData = await userResp.json().catch(() => ({ error: 'Failed to fetch patient details.' }));
          throw new Error(errorData.error);
        }
        return userResp.json();
      },
      onSuccess: (patient) => {
        setPatientToConfirm(patient);
        setIsConfirmModalOpen(true);
      },
      onError: (error) => {
        toast.error(error.message);
      }
    });

    const normalizeDbPhoneNumber = (phoneNumber) => {
      let cleaned = String(phoneNumber).replace(/\D/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = '233' + cleaned.substring(1);
      }
      return cleaned;
    };

    const sendEmailMutation = useMutation({
      mutationFn: async (emailData) => {
        console.log('[E-Prescription] Firing API call to send HTML email.');
        const token = localStorage.getItem('doctorToken');
        const resp = await fetch(`${API_BASE}/doctor/prescriptions/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });
        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({ error: 'Failed to send email.' }));
          console.error('[E-Prescription] Error from backend API:', errorData);
          throw new Error(errorData.error || 'Failed to send email');
        }
        console.log('[E-Prescription] Received successful response from backend.');
        return resp.json();
      },
      onSuccess: () => {
        toast.success('E-Prescription sent to patient successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to send email: ${error.message}`);
      }
    });

    const createPrescriptionMutation = useMutation({
      mutationFn: async (prescriptionData) => {
        const token = localStorage.getItem('doctorToken');
        // User is already fetched and confirmed.
        const payload = {
          user_id: prescriptionData.user_id,
          medications: prescriptionData.medications.filter(m => m.name),
          delivery_address: prescriptionData.delivery_address,
          notes: prescriptionData.notes
        };

        const resp = await fetch(`${API_BASE}/doctor/prescriptions`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(errorData.error || 'Failed to create prescription');
        }
        const newPrescription = await resp.json();

        // Enrich the prescription object for the email
        return {
          ...newPrescription,
          patient: patientToConfirm, // Use patient data from state
          prescription_items: payload.medications,
          notes: payload.notes,
        };
      },
      onSuccess: (prescriptionWithDetails) => {
        toast.success('Prescription created successfully');
        queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        
        console.log('[E-Prescription] Prescription created. Preparing to send email.', prescriptionWithDetails);
        
        if (!prescriptionWithDetails.patient?.email) {
            toast.error("Patient does not have an email on file. Prescription saved but not sent.");
            console.error('[E-Prescription] Error: Patient email is missing from patient object:', prescriptionWithDetails.patient);
        } else {
            const htmlContent = generatePrescriptionHTML(prescriptionWithDetails, doctor);
            sendEmailMutation.mutate({
              userEmail: prescriptionWithDetails.patient.email,
              userName: prescriptionWithDetails.patient.first_name,
              doctorName: doctor.name,
              htmlContent: htmlContent,
            });
        }

        // Reset form state
        setShowCreateForm(false);
        setIsConfirmModalOpen(false);
        setPatientToConfirm(null);
        setNewPrescription({
          user_id: '',
          patient_phone: '',
          medications: [{ name: '', dosage: '', quantity: '', instructions: '' }],
          delivery_address: '',
          notes: ''
        });
      },
      onError: (error) => {
        console.error('Create prescription error:', error);
        toast.error(error.message);
      }
    });

    const addMedication = () => {
      setNewPrescription(prev => ({
        ...prev,
        medications: [...prev.medications, { name: '', dosage: '', quantity: '', instructions: '' }]
      }));
    };

    const updateMedication = (index, field, value) => {
      setNewPrescription(prev => ({
        ...prev,
        medications: prev.medications.map((med, i) => 
          i === index ? { ...med, [field]: value } : med
        )
      }));
    };

    const removeMedication = (index) => {
      setNewPrescription(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    };

    const handleFindPatientSubmit = () => {
      if (!newPrescription.patient_phone) {
        toast.error('Patient phone number is required.');
        return;
      }
      if (newPrescription.medications.every(m => !m.name)) {
        toast.error('At least one medication name is required.');
        return;
      }
      findPatientMutation.mutate(newPrescription.patient_phone);
    };

    const handleConfirmAndCreate = () => {
      if (!patientToConfirm) return;
      
      const prescriptionPayload = {
        ...newPrescription,
        user_id: patientToConfirm.id,
      };
      
      createPrescriptionMutation.mutate(prescriptionPayload);
    };

    if (showCreateForm) {
      return (
        <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">New Prescription</h2>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <div className="space-y-6">
              {/* Patient Info */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Patient Phone Number</label>
                <input
                  type="tel"
                  value={newPrescription.patient_phone}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, patient_phone: e.target.value }))}
                  placeholder="0123456789"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-slate-700">Medications</label>
                  <button
                    onClick={addMedication}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {newPrescription.medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-lg">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="Medication name"
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="Dosage"
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <input
                        type="text"
                        value={med.quantity}
                        onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="Instructions"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        {newPrescription.medications.length > 1 && (
                          <button
                            onClick={() => removeMedication(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Address (Optional)</label>
                <textarea
                  value={newPrescription.delivery_address}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, delivery_address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                    onClick={handleFindPatientSubmit}
                    disabled={findPatientMutation.isLoading}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {findPatientMutation.isLoading ? 'Finding Patient...' : 'Find Patient & Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
          
          <PatientConfirmModal
            isOpen={isConfirmModalOpen}
            patient={patientToConfirm}
            onClose={() => {
              setIsConfirmModalOpen(false);
              setPatientToConfirm(null);
            }}
            onConfirm={handleConfirmAndCreate}
            isLoading={createPrescriptionMutation.isLoading}
          />
        </>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Prescriptions</h2>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Prescription</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60">
          {isLoading ? (
            <p className="p-6 text-center text-slate-500">Loading prescriptions...</p>
          ) : isError ? (
            <p className="p-6 text-center text-red-500">Error: {error.message}</p>
          ) : (
            (prescriptionsData?.prescriptions || []).map((prescription, index) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50/50 transition-colors border-b last:border-b-0 border-slate-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-slate-900">
                        {prescription.patient?.first_name || 'Patient'}
                      </h4>
                      <span className="text-sm text-slate-500">
                        #{prescription.reference_id}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        prescription.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                        prescription.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      Created: {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                    {prescription.prescription_items && (
                      <div className="text-sm text-slate-600">
                        <p className="font-medium mb-1">Medications:</p>
                        <ul className="list-disc list-inside">
                          {prescription.prescription_items.map((item, idx) => (
                            <li key={idx}>
                              {item.medication_name || item.name} - {item.dosage} (Qty: {item.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">
                      {prescription.pharmacy?.name || 'No pharmacy assigned'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {prescriptionsData?.prescriptions?.length === 0 && !isLoading && (
            <p className="p-6 text-center text-slate-500">No prescriptions found.</p>
          )}
        </div>
      </div>
    );
  }

  // Availability view component
  function AvailabilityView() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const { data: fetchedAvailability, isLoading: isAvailabilityLoading } = useQuery({
        queryKey: ['availability'],
        queryFn: fetchAvailability,
    });
    
    const [editableAvailability, setEditableAvailability] = useState(
      days.map((day, index) => ({
        day_of_week: index,
        day_name: day,
        start_time: '09:00',
        end_time: '17:00',
        is_active: false
      }))
    );

    useEffect(() => {
      if (fetchedAvailability) {
        const availabilityMap = new Map(fetchedAvailability.map(item => [item.day_of_week, item]));
        
        setEditableAvailability(days.map((day, index) => {
            const existingSlot = availabilityMap.get(index);
            if (existingSlot) {
                return {
                    day_of_week: index,
                    day_name: day,
                    start_time: existingSlot.start_time.slice(0, 5),
                    end_time: existingSlot.end_time.slice(0, 5),
                    is_active: existingSlot.is_active,
                };
            }
            return {
                day_of_week: index,
                day_name: day,
                start_time: '09:00',
                end_time: '17:00',
                is_active: false,
            };
        }));
      }
    }, [fetchedAvailability]);

    const availabilityMutation = useMutation({
        mutationFn: updateAvailability,
        onSuccess: () => {
            toast.success('Availability updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['availability'] });
        },
        onError: (error) => {
            toast.error(`Failed to update availability: ${error.message}`);
        }
    });

    const updateDayAvailability = (dayIndex, field, value) => {
      setEditableAvailability(prev => 
        prev.map((day, index) => 
          index === dayIndex ? { ...day, [field]: value } : day
        )
      );
    };

    const saveAvailability = () => {
      const activeSlots = editableAvailability
        .filter(slot => slot.is_active)
        .map(slot => ({
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: slot.is_active,
        }));
      availabilityMutation.mutate(activeSlots);
    };
    
    if (isAvailabilityLoading) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Availability Schedule</h2>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
                  <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
                  <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Availability Schedule</h2>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="space-y-4">
            {editableAvailability.map((daySlot, index) => (
              <div key={daySlot.day_name} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                <div className="w-24">
                  <p className="font-medium text-slate-900">{daySlot.day_name}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="time"
                    value={daySlot.start_time}
                    onChange={(e) => updateDayAvailability(index, 'start_time', e.target.value)}
                    disabled={!daySlot.is_active}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    value={daySlot.end_time}
                    onChange={(e) => updateDayAvailability(index, 'end_time', e.target.value)}
                    disabled={!daySlot.is_active}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <button 
                    onClick={() => updateDayAvailability(index, 'is_active', !daySlot.is_active)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      daySlot.is_active
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {daySlot.is_active ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button 
              onClick={saveAvailability}
              disabled={availabilityMutation.isLoading}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {availabilityMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics view component
  function AnalyticsView() {
    const { data: analyticsData, isLoading, isError, error } = useQuery({
      queryKey: ['doctorAnalytics'],
      queryFn: fetchDoctorAnalytics,
    });

    if (isLoading) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Analytics & Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 mt-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      );
    }

    if (isError) {
      return <p className="text-red-500">Error fetching analytics: {error.message}</p>;
    }

    const BarChart = ({ data, dataKey, label }) => {
      const maxValue = Math.max(...data.map(d => d[dataKey]), 0);
      return (
        <div>
          <h4 className="text-md font-medium text-slate-800 mb-4">{label}</h4>
          <div className="flex justify-around items-end h-64 space-x-2">
            {data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-slate-200 hover:bg-slate-300 transition-colors"
                  style={{ height: `${(d[dataKey] / (maxValue || 1)) * 100}%` }}
                  title={`${d.month}: ${d[dataKey]}`}
                ></div>
                <span className="text-xs text-slate-500 mt-2">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Analytics & Insights</h2>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-slate-900">₵{analyticsData?.totalEarnings?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Consultations</h3>
            <p className="text-3xl font-bold text-slate-900">{analyticsData?.totalConsultations || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Unique Patients</h3>
            <p className="text-3xl font-bold text-slate-900">{analyticsData?.uniquePatients || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-slate-900">{analyticsData?.conversionRate || 0}%</p>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Performance (Last 6 Months)</h3>
          {analyticsData?.monthlyPerformance?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BarChart data={analyticsData.monthlyPerformance} dataKey="earnings" label="Earnings (₵)" />
              <BarChart data={analyticsData.monthlyPerformance} dataKey="consultations" label="Consultations" />
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Not enough data to display performance chart.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat view component
  function ChatView() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Messages</h2>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No messages yet</p>
            <p className="text-sm text-slate-400">Patient messages will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  // Profile view component
  function ProfileView() {
    const [editableProfile, setEditableProfile] = useState(null);

    useEffect(() => {
      if (doctor) {
        setEditableProfile({ ...doctor });
      }
    }, [doctor]);

    const handleProfileChange = (e) => {
      const { name, value } = e.target;
      setEditableProfile(prev => (prev ? { ...prev, [name]: value } : null));
    };

    const handleProfileSave = () => {
      if (!editableProfile) return;
      
      const {
        // Exclude non-editable fields before sending to the API
        id,
        consultation_fee,
        currency,
        availability_status,
        profile_image_url,
        created_at,
        password_hash,
        password_salt,
        is_active,
        registration_status,
        ...updateData
      } = editableProfile;

      mutation.mutate({
        url: `${API_BASE}/doctor/me`,
        method: 'PUT',
        body: updateData,
      });
    };

    if (!editableProfile) {
      return (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Profile Settings</h2>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={editableProfile.name || ''}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
              <input
                id="specialty"
                name="specialty"
                type="text"
                value={editableProfile.specialty || ''}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={editableProfile.phone_number || ''}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label htmlFor="consultation_fee" className="block text-sm font-medium text-slate-700 mb-2">Consultation Fee (₵)</label>
              <input
                id="consultation_fee"
                name="consultation_fee"
                type="number"
                value={editableProfile.consultation_fee || ''}
                disabled // This field is not editable
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 text-slate-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={editableProfile.bio || ''}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              onClick={handleProfileSave}
              disabled={mutation.isLoading}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Settings view component
  function SettingsView() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="ml-3 text-sm text-slate-700">Email notifications for new bookings</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="ml-3 text-sm text-slate-700">SMS reminders for appointments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="ml-3 text-sm text-slate-700">Weekly performance reports</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Privacy</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="ml-3 text-sm text-slate-700">Show profile to patients</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="ml-3 text-sm text-slate-700">Allow direct messages from patients</span>
                </label>
              </div>
            </div>

            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Finance view component
  function FinanceView() {
    const [payoutAmount, setPayoutAmount] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const { data: financeData, isLoading, isError, error } = useQuery({
      queryKey: ['doctorFinance'],
      queryFn: fetchDoctorFinance,
    });
    
    const payoutMutation = useMutation({
      mutationFn: requestPayout,
      onSuccess: (data) => {
        toast.success('Payout request submitted successfully!');
        queryClient.invalidateQueries({ queryKey: ['doctorFinance'] });
        setPayoutAmount('');
      },
      onError: (error) => {
        toast.error(`Payout failed: ${error.message}`);
      }
    });

    const paymentMethodMutation = useMutation({
      mutationFn: savePaymentMethod,
      onSuccess: (data) => {
        toast.success('Payment method saved!');
        queryClient.invalidateQueries({ queryKey: ['doctorFinance'] });
        setIsPaymentModalOpen(false);
      },
      onError: (error) => {
        toast.error(`Failed to save method: ${error.message}`);
      },
    });

    const handlePayoutRequest = (e) => {
      e.preventDefault();
      
      if (!financeData?.paymentMethod) {
        setIsPaymentModalOpen(true);
        return;
      }

      const amount = parseFloat(payoutAmount);
      if (!amount || amount <= 0 || amount > financeData?.availableForPayout) {
        toast.error('Please enter a valid amount within your available balance.');
        return;
      }
      payoutMutation.mutate({ amount, paymentMethod: financeData.paymentMethod });
    };

    if (isLoading) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Finance Overview</h2>
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading financial data...</p>
          </div>
        </div>
      );
    }

    if (isError) {
      return <p className="text-red-500">Error: {error.message}</p>;
    }

    return (
      <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Finance Overview</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-slate-900">₵{financeData?.totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">This is your total revenue before platform commission.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Available for Payout</h3>
            <p className="text-3xl font-bold text-emerald-600">₵{financeData?.availableForPayout.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">After 15% platform commission.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Last Payout</h3>
            {financeData?.lastPayout ? (
              <>
                <p className="text-3xl font-bold text-slate-900">₵{financeData.lastPayout.amount.toFixed(2)}</p>
                <p className="text-xs text-slate-400">on {formatDate(financeData.lastPayout.requested_at)}</p>
              </>
            ) : (
              <p className="text-lg text-slate-400 mt-2">No payout history</p>
            )}
          </div>
        </div>

        {/* Payout Request */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Payout</h3>
            <form onSubmit={handlePayoutRequest} className="space-y-4">
              <div>
                <label htmlFor="payoutAmount" className="block text-sm font-medium text-slate-700 mb-2">Amount (₵)</label>
                <input
                  type="number"
                  id="payoutAmount"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g., 150.00"
                  max={financeData?.availableForPayout}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
                {financeData?.paymentMethod && (
                  <div className="text-xs text-slate-500">
                    Payout to: {financeData.paymentMethod.provider} ({financeData.paymentMethod.details.number})
                    <button type="button" onClick={() => setIsPaymentModalOpen(true)} className="ml-2 text-blue-600 hover:underline">Change</button>
                  </div>
                )}
              <button
                type="submit"
                disabled={payoutMutation.isLoading}
                className="w-full px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                  {payoutMutation.isLoading
                    ? 'Processing...'
                    : financeData?.paymentMethod
                    ? 'Request Withdrawal'
                    : 'Add Payment Method'}
              </button>
            </form>
          </div>

          {/* Payout History */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payout History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="py-2 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData?.payoutHistory && financeData.payoutHistory.length > 0 ? (
                    financeData.payoutHistory.map(payout => (
                      <tr key={payout.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-sm text-slate-500">{formatDate(payout.requested_at)}</td>
                        <td className="py-3 text-sm font-medium text-slate-900">₵{Number(payout.amount).toFixed(2)}</td>
                        <td className="py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payout.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              payout.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-500">
                        <BanknotesIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No payout requests have been made.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
        
        <PaymentMethodModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={paymentMethodMutation.mutate}
          isLoading={paymentMethodMutation.isLoading}
          currentMethod={financeData?.paymentMethod}
        />
      </>
    );
  }
}

// ==================================
// Shimmer Loading Skeleton
// ==================================
function BookingsTableSkeleton() {
  return (
    <div>
      {/* Mobile skeleton */}
      <div className="md:hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 animate-pulse">
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 bg-slate-200 rounded w-2/5"></div>
              <div className="h-5 bg-slate-200 rounded-full w-20"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-3/5 mb-4"></div>
            <div className="flex space-x-2 justify-end">
              <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop skeleton */}
      <div className="hidden md:block">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200/60">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold text-slate-400">Patient</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-slate-400">Date</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-slate-400">Status</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-b-0 animate-pulse">
                <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                <td className="py-4 px-6"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================================
// Payment Method Modal Component
// ==================================
function PaymentMethodModal({ isOpen, onClose, onSave, isLoading, currentMethod }) {
  const [provider, setProvider] = useState('MTN Mobile Money');
  const [number, setNumber] = useState('');

  useEffect(() => {
    if (currentMethod) {
      setProvider(currentMethod.provider);
      setNumber(currentMethod.details?.number || '');
    } else {
      setProvider('MTN Mobile Money');
      setNumber('');
    }
  }, [currentMethod, isOpen]);

  const handleSave = () => {
    if (!number.trim()) {
      toast.error('Please enter a valid mobile money number.');
      return;
    }
    onSave({ provider, number });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Method</h2>
              <p className="text-slate-600 mb-6">
                Add your mobile money details for withdrawals.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option>MTN Mobile Money</option>
                  <option>Telecel Cash</option>
                </select>
              </div>
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="024 123 4567"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Method'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================================
// Patient Confirmation Modal
// ==================================
function PatientConfirmModal({ isOpen, patient, onClose, onConfirm, isLoading }) {
  if (!isOpen || !patient) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircleIcon className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Patient</h2>
          <p className="text-slate-600 mb-6">
            Please confirm this is the correct patient before creating a prescription.
          </p>
        </div>

        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Name:</span>
            <span className="font-semibold text-slate-800">{patient.first_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Phone:</span>
            <span className="text-slate-800">{patient.phone_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Email:</span>
            <span className="text-slate-800">{patient.email || 'N/A'}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Confirm & Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
