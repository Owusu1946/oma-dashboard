import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  UserCircleIcon, 
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import ActivityFeed from '../components/ActivityFeed';
import { startNewChat } from '../utils/chatUtils';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const { isConnected } = useDatabase();
  const [user, setUser] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId, isConnected]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      if (!userData) throw new Error('User not found');
      
      setUser(userData);
      
      // Fetch KYC data
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();
      
      if (kycError && kycError.code !== 'PGRST116') {
        // If error is not "no rows returned", it's a real error
        throw kycError;
      }
      
      if (kycData) {
        setKycData(kycData);
      }
      
      // Fetch user sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(5);
      
      if (sessionError) throw sessionError;
      setSessions(sessionData || []);
      
      // Create activities from user data
      const activities = [];
      
      // User registration activity
      if (userData.created_at) {
        activities.push({
          id: `user-registration-${userData.id}`,
          type: 'newUser',
          title: 'Joined OMA',
          description: `${userData.first_name || 'User'} registered with phone number ${userData.phone_number}`,
          timestamp: userData.created_at
        });
      }
      
      // KYC completion activity
      if (userData.kyc_completed && userData.kyc_completed_at) {
        activities.push({
          id: `kyc-completion-${userData.id}`,
          type: 'completed',
          title: 'Completed KYC',
          description: `${userData.first_name || 'User'} completed Know Your Customer verification`,
          timestamp: userData.kyc_completed_at
        });
      }
      
      // Add session activities
      if (sessionData) {
        sessionData.forEach(session => {
          activities.push({
            id: `session-${session.id}`,
            type: 'session',
            title: `${session.status === 'active' ? 'Active Session' : 'Session History'}`,
            description: `Session ${session.status === 'active' ? 'started' : 'ended'} ${session.started_at ? format(new Date(session.started_at), 'MMM d, yyyy') : ''}`,
            timestamp: session.started_at,
            link: {
              url: `/chat/${session.id}`,
              text: 'View conversation'
            }
          });
        });
      }
      
      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setUserActivities(activities);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(`Failed to load user data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    setStartingChat(true);
    await startNewChat(supabase, userId, navigate);
    setStartingChat(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchUserData}
          className="mt-2 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link to="/users" className="inline-flex items-center text-primary-600 hover:text-primary-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Users
        </Link>
        <button
          onClick={handleStartChat}
          disabled={loading || startingChat}
          className="btn btn-primary flex items-center"
        >
          {startingChat ? (
            <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
          ) : (
            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
          )}
          Start Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex flex-col items-center pb-6">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <UserCircleIcon className="h-20 w-20 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold">
                {user?.first_name || 'User'} {kycData?.name && user?.first_name !== kycData?.name && `(${kycData.name})`}
              </h2>
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1" />
                {user?.phone_number || 'No phone number'}
              </div>
              {user?.kyc_completed && (
                <div className="mt-2 inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  KYC Verified
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">User Information</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium">{kycData?.gender || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Age Range</p>
                    <p className="text-sm font-medium">{kycData?.age_range || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">{kycData?.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm font-medium">
                    {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Active</p>
                  <p className="text-sm font-medium">
                    {user?.last_active ? format(new Date(user.last_active), 'MMMM d, yyyy h:mm a') : 'Unknown'}
                  </p>
                </div>
                {user?.kyc_completed_at && (
                  <div>
                    <p className="text-xs text-gray-500">KYC Completed</p>
                    <p className="text-sm font-medium">
                      {format(new Date(user.kyc_completed_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {sessions.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Sessions</h3>
                <div className="space-y-2">
                  {sessions.map(session => (
                    <Link 
                      key={session.id}
                      to={`/chat/${session.id}`}
                      className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {session.status === 'active' ? 'Active Session' : 'Past Session'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.started_at ? format(new Date(session.started_at), 'MMM d, yyyy h:mm a') : 'Unknown'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed 
            activities={userActivities} 
            loading={false} 
            title="User Activity"
            useMockupIfEmpty={false}
            initialLimit={10}
          />
        </div>
      </div>
    </motion.div>
  );
} 