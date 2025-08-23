import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { startNewChat } from '../utils/chatUtils';

export default function Users() {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useDatabase();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startingChat, setStartingChat] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [isConnected]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersError) throw usersError;
      
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.first_name?.toLowerCase() || '').includes(searchLower) ||
      (user.phone_number?.toLowerCase() || '').includes(searchLower)
    );
  });

  const handleStartChat = async (userId) => {
    setStartingChat(userId);
    await startNewChat(supabase, userId, navigate);
    setStartingChat(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all users of the platform
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center btn btn-secondary"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
            placeholder="Search users by name or phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchQuery ? 'No users matching your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/users/${user.id}`} className="flex items-center group">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 border border-gray-200 overflow-hidden">
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                              {user.first_name || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {user.phone_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.kyc_completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Incomplete
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_active ? format(new Date(user.last_active), 'MMM d, yyyy h:mm a') : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStartChat(user.id)}
                          disabled={startingChat === user.id}
                          className="btn btn-sm btn-primary flex items-center"
                        >
                          {startingChat === user.id ? (
                            <div className="animate-spin h-3 w-3 mr-1 border-t-2 border-b-2 border-white rounded-full"></div>
                          ) : (
                            <PaperAirplaneIcon className="h-3 w-3 mr-1" />
                          )}
                          Chat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
} 