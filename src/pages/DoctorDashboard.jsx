import { useState, useEffect } from 'react';
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
  BanknotesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { mockDoctorAPI } from '../utils/mockDoctorAPI';
const DB_API_URL = import.meta.env.VITE_DB_API_URL || import.meta.env.VITE_API_URL;
const API_BASE = (DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/,'');
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DOCTOR_API === 'true';

// ==================================
// API Fetcher Functions
// ==================================

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

const fetchDoctorFinance = async () => {
  // MOCK API: Replace with real API call
  console.log('[MOCK_API] Fetching doctor finance data...');
  return new Promise(resolve => setTimeout(() => resolve({
    totalEarnings: 1250.00,
    availableForPayout: 780.50,
    lastPayout: { date: '2025-08-15T10:00:00.000Z', amount: 400.00 },
    payoutHistory: [
      { id: 'p1', date: '2025-08-15T10:00:00.000Z', amount: 400.00, status: 'Completed' },
      { id: 'p2', date: '2025-07-28T14:30:00.000Z', amount: 350.50, status: 'Completed' },
      { id: 'p3', date: '2025-07-12T09:00:00.000Z', amount: 500.00, status: 'Completed' },
    ]
  }), 500));
};

const requestPayout = async (amount) => {
  // MOCK API: Replace with real API call
  console.log(`[MOCK_API] Requesting payout for amount: ${amount}`);
  if (amount <= 0) throw new Error('Invalid amount');
  return new Promise(resolve => setTimeout(() => resolve({ success: true, newBalance: 780.50 - amount }), 1000));
};


// ==================================
// Main Dashboard Component
// ==================================

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [copied, setCopied] = useState(false);

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
  const { data: initialBookingsData } = useQuery({
    queryKey: ['bookings', { page: 1, limit: 5, sortField: 'consultation_date', sortOrder: 'desc' }],
    queryFn: fetchDoctorBookings,
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
  
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'bookings', name: 'Bookings', icon: CalendarDaysIcon, badge: stats.pendingBookings },
    { id: 'prescriptions', name: 'Prescriptions', icon: DocumentTextIcon },
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
    try {
      const token = localStorage.getItem('doctorToken');
      const resp = await fetch(`${API_BASE}/doctor/availability`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      });
      if (!resp.ok) throw new Error('Failed to update availability');
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success('Availability updated');
    } catch (error) {
      console.error('Update availability error:', error);
      toast.error('Failed to update availability');
    }
  };

  // Render sidebar content
  const renderSidebarContent = () => (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
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
      <nav className="p-4 space-y-2">
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
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
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
                <button className="p-2 text-slate-500 hover:text-slate-700 relative">
                  <BellIcon className="w-5 h-5" />
                  {/* Notifications are not managed by React Query yet, so this badge will not update automatically */}
                  {/* For now, it's a placeholder. In a real app, you'd manage notifications state here */}
                  {/* Example: const { data: notifications } = useQuery({ queryKey: ['notifications'] }); */}
                  {/* {notifications?.length > 0 && ( */}
                  {/*   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> */}
                  {/* )} */}
                </button>
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* This section will be updated to use React Query for bookings */}
            {/* For now, it will show a placeholder or the last few from mock */}
            {/* In a real app, you'd fetch recent bookings from the API */}
            {/* Example: const { data: recentBookings } = useQuery({ queryKey: ['recentBookings'] }); */}
            {/* {recentBookings?.slice(0, 3).map((booking, index) => ( */}
            {/*   <div key={booking.id} className="flex items-center justify-between py-2"> */}
            {/*     <div> */}
            {/*       <p className="font-medium text-slate-900">{booking.users?.first_name || 'Patient'}</p> */}
            {/*       <p className="text-sm text-slate-500">{formatDate(booking.consultation_date)}</p> */}
            {/*     </div> */}
            {/*     <span className={`px-2 py-1 text-xs font-medium rounded-full ${ */}
            {/*       booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : */}
            {/*       booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : */}
            {/*       'bg-amber-100 text-amber-700' */}
            {/*     }`}> */}
            {/*       {booking.status} */}
            {/*     </span> */}
            {/*   </div> */}
            {/* ))} */}
            <p className="text-slate-500 text-center">Recent activity data will be updated with React Query.</p>
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

        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-center text-slate-500">Loading bookings...</p>
          ) : isError ? (
            <p className="p-6 text-center text-red-500">Error: {error.message}</p>
          ) : (
            <>
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr>
                    <SortableHeader field="users.first_name">Patient</SortableHeader>
                    <SortableHeader field="consultation_date">Date</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingsData?.bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium text-slate-900">
                        {booking.users?.first_name || 'Patient'}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm text-slate-500">
                        {booking.consultation_date ? formatDate(booking.consultation_date) : 'Date not set'}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
                            <button 
                              onClick={async () => {
                                const when = prompt('Enter new date/time (YYYY-MM-DDTHH:mm)');
                                if (when) await actOnBooking(booking.id, 'reschedule', { consultation_date: when });
                              }} 
                              disabled={mutation.isLoading} 
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reschedule"
                            >
                              <ClockIcon className="w-5 h-5" />
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
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Start</span>
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <span className="text-sm text-slate-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    const [newPrescription, setNewPrescription] = useState({
      user_id: '',
      patient_phone: '',
      medications: [{ name: '', dosage: '', quantity: '', instructions: '' }],
      delivery_address: '',
      notes: ''
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

    const handleCreatePrescription = async () => {
      if (!newPrescription.patient_phone || newPrescription.medications.some(m => !m.name)) {
        toast.error('Please fill in all required fields');
        return;
      }

      try {
        // First, find user by phone number
        const token = localStorage.getItem('doctorToken');
        const userResp = await fetch(`${API_BASE}/users/phone/${newPrescription.patient_phone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userResp.ok) {
          toast.error('Patient not found with this phone number');
          return;
        }

        const user = await userResp.json();
        
        const prescriptionData = {
          user_id: user.id,
          medications: newPrescription.medications.filter(m => m.name),
          delivery_address: newPrescription.delivery_address,
          notes: newPrescription.notes
        };

        const resp = await fetch(`${API_BASE}/doctor/prescriptions`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(prescriptionData)
        });

        if (!resp.ok) throw new Error('Failed to create prescription');
        
        queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        toast.success('Prescription created successfully');

        setShowCreateForm(false);
        setNewPrescription({
          user_id: '',
          patient_phone: '',
          medications: [{ name: '', dosage: '', quantity: '', instructions: '' }],
          delivery_address: '',
          notes: ''
        });
      } catch (error) {
        console.error('Create prescription error:', error);
        toast.error('Failed to create prescription');
      }
    };

    if (showCreateForm) {
      return (
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
                  onClick={handleCreatePrescription}
                  disabled={mutation.isLoading}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {mutation.isLoading ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>
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
          {/* This section will be updated to use React Query for prescriptions */}
          {/* For now, it will show a placeholder or the last few from mock */}
          {/* In a real app, you'd fetch prescriptions from the API */}
          {/* Example: const { data: prescriptions } = useQuery({ queryKey: ['prescriptions'] }); */}
          {/* {prescriptions?.map((prescription, index) => ( */}
          {/*   <motion.div */}
          {/*     key={prescription.id} */}
          {/*     initial={{ opacity: 0, y: 20 }} */}
          {/*     animate={{ opacity: 1, y: 0 }} */}
          {/*     transition={{ duration: 0.3, delay: index * 0.05 }} */}
          {/*     className="p-6 hover:bg-slate-50/50 transition-colors" */}
          {/*   > */}
          {/*     <div className="flex items-start justify-between"> */}
          {/*       <div className="flex-1"> */}
          {/*         <div className="flex items-center space-x-3 mb-2"> */}
          {/*           <h4 className="font-medium text-slate-900"> */}
          {/*             {prescription.patient?.first_name || 'Patient'} */}
          {/*           </h4> */}
          {/*           <span className="text-sm text-slate-500"> */}
          {/*             #{prescription.reference_id} */}
          {/*           </span> */}
          {/*           <span className={`px-2 py-1 text-xs font-medium rounded-full ${ */}
          {/*             prescription.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : */}
          {/*             prescription.status === 'processing' ? 'bg-blue-100 text-blue-700' : */}
          {/*             'bg-amber-100 text-amber-700' */}
          {/*           }`}> */}
          {/*             {prescription.status} */}
          {/*           </span> */}
          {/*         </div> */}
          {/*         <p className="text-sm text-slate-500 mb-2"> */}
          {/*           Created: {new Date(prescription.created_at).toLocaleDateString()} */}
          {/*         </p> */}
          {/*         {prescription.prescription_items && ( */}
          {/*           <div className="text-sm text-slate-600"> */}
          {/*             <p className="font-medium mb-1">Medications:</p> */}
          {/*             <ul className="list-disc list-inside"> */}
          {/*               {prescription.prescription_items.map((item, idx) => ( */}
          {/*                 <li key={idx}> */}
          {/*                   {item.medication_name} - {item.dosage} (Qty: {item.quantity}) */}
          {/*                 </li> */}
          {/*               ))} */}
          {/*             </ul> */}
          {/*           </div> */}
          {/*         )} */}
          {/*       </div> */}
          {/*        */}
          {/*       <div className="flex items-center space-x-2"> */}
          {/*         <span className="text-sm text-slate-400"> */}
          {/*           {prescription.pharmacy?.name || 'No pharmacy assigned'} */}
          {/*         </span> */}
          {/*       </div> */}
          {/*     </div> */}
          {/*   </motion.div> */}
          {/* ))} */}
          <p className="text-slate-500 text-center">Prescriptions data will be updated with React Query.</p>
        </div>
      </div>
    );
  }

  // Availability view component
  function AvailabilityView() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [editableAvailability, setEditableAvailability] = useState(
      days.map((day, index) => ({
        day_of_week: index + 1,
        day_name: day,
        start_time: '09:00',
        end_time: '17:00',
        is_active: true
      }))
    );

    useEffect(() => {
      // Update editable availability when availability data changes
      // This will be updated to use React Query for availability
      // For now, it's a placeholder.
      // Example: const { data: availability } = useQuery({ queryKey: ['availability'] });
      // if (availability && availability.length > 0) {
      //   const updatedAvailability = days.map((day, index) => {
      //     const existingSlot = availability.find(slot => slot.day_of_week === index + 1);
      //     return existingSlot ? {
      //       ...existingSlot,
      //       day_name: day
      //     } : {
      //       day_of_week: index + 1,
      //       day_name: day,
      //       start_time: '09:00',
      //       end_time: '17:00',
      //       is_active: false
      //     };
      //   });
      //   setEditableAvailability(updatedAvailability);
      // }
    }, []); // Removed availability from dependency array as it's not managed by React Query yet

    const updateDayAvailability = (dayIndex, field, value) => {
      setEditableAvailability(prev => 
        prev.map((day, index) => 
          index === dayIndex ? { ...day, [field]: value } : day
        )
      );
    };

    const saveAvailability = async () => {
      const activeSlots = editableAvailability.filter(slot => slot.is_active);
      // This will be updated to use React Query for availability
      // For now, it's a placeholder.
      // Example: mutation.mutate({ url: `${API_BASE}/doctor/availability`, body: activeSlots });
      // queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.info('Availability saving is not yet implemented with React Query.');
    };
    
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

  // Analytics view component
  function AnalyticsView() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Analytics & Insights</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Performance</h3>
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Analytics coming soon</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Satisfaction</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">4.8</span>
              </div>
              <p className="text-slate-500">Average Rating</p>
            </div>
          </div>
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
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Profile Settings</h2>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={doctor?.name || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
              <input
                type="text"
                defaultValue={doctor?.specialty || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                defaultValue={doctor?.phone_number || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Fee (₵)</label>
              <input
                type="number"
                defaultValue={doctor?.consultation_fee || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
              <textarea
                rows={4}
                defaultValue={doctor?.bio || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
              Save Changes
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

    const { data: financeData, isLoading } = useQuery({
      queryKey: ['doctorFinance'],
      queryFn: fetchDoctorFinance,
    });
    
    const payoutMutation = useMutation({
      mutationFn: requestPayout,
      onSuccess: () => {
        toast.success('Payout request submitted successfully!');
        queryClient.invalidateQueries({ queryKey: ['doctorFinance'] });
        setPayoutAmount('');
      },
      onError: (error) => {
        toast.error(`Payout failed: ${error.message}`);
      }
    });

    const handlePayoutRequest = (e) => {
      e.preventDefault();
      const amount = parseFloat(payoutAmount);
      if (!amount || amount <= 0 || amount > financeData?.availableForPayout) {
        toast.error('Please enter a valid amount within your available balance.');
        return;
      }
      payoutMutation.mutate(amount);
    };

    if (isLoading) {
      return <p>Loading financial data...</p>;
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Finance Overview</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-slate-900">₵{financeData?.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Available for Payout</h3>
            <p className="text-3xl font-bold text-emerald-600">₵{financeData?.availableForPayout.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Last Payout</h3>
            <p className="text-3xl font-bold text-slate-900">₵{financeData?.lastPayout.amount.toFixed(2)}</p>
            <p className="text-xs text-slate-400">on {formatDate(financeData?.lastPayout.date)}</p>
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
              <button
                type="submit"
                disabled={payoutMutation.isLoading}
                className="w-full px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {payoutMutation.isLoading ? 'Processing...' : 'Request Withdrawal'}
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
                  {financeData?.payoutHistory.map(payout => (
                    <tr key={payout.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 text-sm text-slate-500">{formatDate(payout.date)}</td>
                      <td className="py-3 text-sm font-medium text-slate-900">₵{payout.amount.toFixed(2)}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payout.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
