import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabase } from '../contexts/DatabaseContext';
import { 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  BellAlertIcon,
  HandRaisedIcon,
  UserIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import mockupEscalations from '../mockup/escalations';

// Status priorities for sorting (higher number = higher priority)
const STATUS_PRIORITY = {
  pending: 3,
  in_progress: 2,
  resolved: 1
};

export default function EscalationList() {
  const { isConnected, fetchEscalations, updateEscalationStatus } = useDatabase();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [useMockData, setUseMockData] = useState(!isConnected);

  useEffect(() => {
    loadEscalations();
  }, [isConnected, filterStatus]);

  const loadEscalations = async () => {
    try {
      setLoading(true);
      
      if (isConnected) {
        try {
          const data = await fetchEscalations(filterStatus === 'all' ? undefined : filterStatus);
          setEscalations(data || []);
          setUseMockData(false);
        } catch (error) {
          console.error('Error fetching escalations:', error);
          // Fall back to mockup data if the real API fails
          setEscalations(mockupEscalations);
          setUseMockData(true);
          setError('Failed to load real escalation data, showing mockup data instead');
          toast.error('Using mockup data for escalations');
        }
      } else {
        // No database connection, use mockup data
        setEscalations(mockupEscalations);
        setUseMockData(true);
      }
    } catch (error) {
      console.error('Error in loadEscalations:', error);
      setError('Failed to load escalations');
      toast.error('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      // If using mockup data, just update the local state
      if (useMockData) {
        const updatedEscalations = escalations.map(esc => {
          if (esc.id === id) {
            const updates = {
              ...esc,
              status,
              updated_at: new Date().toISOString()
            };
            
            if (status === 'resolved') {
              updates.resolved_at = new Date().toISOString();
              updates.resolved_by = 'Admin (Mockup)';
            }
            
            return updates;
          }
          return esc;
        });
        
        setEscalations(updatedEscalations);
        toast.success(`Escalation marked as ${status}`);
        return;
      }
      
      // Otherwise use the database context
      const success = await updateEscalationStatus(id, status);
      
      if (success) {
        toast.success(`Escalation marked as ${status}`);
        loadEscalations();
      } else {
        toast.error('Failed to update escalation');
      }
    } catch (error) {
      console.error('Error updating escalation:', error);
      toast.error('Failed to update escalation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            <BellAlertIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <ClockIcon className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {status}
          </span>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500';
      case 'in_progress':
        return 'border-l-blue-500';
      case 'resolved':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter escalations based on selected status
  const filteredEscalations = filterStatus === 'all'
    ? escalations
    : escalations.filter(esc => esc.status === filterStatus);

  // Sort escalations by status priority (pending first) and then by date
  const sortedEscalations = [...filteredEscalations].sort((a, b) => {
    // First sort by status priority
    const priorityDiff = (STATUS_PRIORITY[b.status] || 0) - (STATUS_PRIORITY[a.status] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by date (newest first)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const errorMessage = error && !useMockData ? (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg shadow-sm border border-red-200"
    >
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
        <p>{error}</p>
      </div>
        <button 
          onClick={loadEscalations}
        className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
    </motion.div>
  ) : null;

  const mockupDataBanner = useMockData ? (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-3 mb-6 bg-blue-50 text-blue-700 rounded-lg shadow-sm border border-blue-200 text-sm"
    >
      <div className="flex items-center">
        <HandRaisedIcon className="h-5 w-5 mr-2 text-blue-500" />
        <p>Using mockup data for demonstration purposes</p>
      </div>
    </motion.div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
        <h1 className="text-2xl font-semibold text-gray-900">Escalations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage patient escalations requiring healthcare professional attention
          </p>
        </div>
        <button 
          onClick={loadEscalations}
          disabled={loading}
          className="flex items-center btn btn-secondary"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {errorMessage}
      {mockupDataBanner}

      {/* Status Filter */}
      <div className="flex space-x-2 mb-6">
        <StatusFilterButton 
          status="all" 
          label="All"
          count={escalations.length}
          currentFilter={filterStatus} 
          onClick={() => setFilterStatus('all')} 
        />
        <StatusFilterButton 
          status="pending" 
          label="Pending" 
          count={escalations.filter(e => e.status === 'pending').length}
          currentFilter={filterStatus} 
          onClick={() => setFilterStatus('pending')} 
        />
        <StatusFilterButton 
          status="in_progress" 
          label="In Progress" 
          count={escalations.filter(e => e.status === 'in_progress').length}
          currentFilter={filterStatus} 
          onClick={() => setFilterStatus('in_progress')} 
        />
        <StatusFilterButton 
          status="resolved" 
          label="Resolved" 
          count={escalations.filter(e => e.status === 'resolved').length}
          currentFilter={filterStatus} 
          onClick={() => setFilterStatus('resolved')} 
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : sortedEscalations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No escalations found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {filterStatus === 'all' 
              ? 'There are currently no escalated cases that need your attention.'
              : `There are no ${filterStatus} escalations at this time.`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {sortedEscalations.map((escalation) => (
              <motion.div
                key={escalation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getStatusColor(escalation.status)} overflow-hidden`}
              >
                <div className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {escalation.users?.first_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {escalation.users?.phone_number || 'No phone number'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-gray-900">
                          {escalation.created_at ? format(new Date(escalation.created_at), 'MMM d, yyyy') : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {escalation.created_at ? formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true }) : ''}
                        </div>
                      </div>
                      {getStatusBadge(escalation.status)}
                    </div>
                  </div>
                  
                  {/* Reason (truncated) */}
                  <div className="mt-3">
                    <div 
                      className={`text-sm text-gray-700 ${expandedId !== escalation.id && 'line-clamp-2'}`}
                    >
                      {escalation.reason}
                    </div>
                    {escalation.reason.length > 100 && (
                      <button
                        onClick={() => handleToggleExpand(escalation.id)}
                        className="text-xs text-primary-600 hover:text-primary-800 mt-1 flex items-center"
                      >
                        {expandedId === escalation.id ? 'Show less' : 'Read more'}
                        <ChevronDownIcon 
                          className={`h-3 w-3 ml-1 transition-transform ${expandedId === escalation.id ? 'rotate-180' : ''}`} 
                        />
                      </button>
                    )}
                    </div>
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500 sm:hidden">
                      {escalation.created_at ? formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true }) : ''}
                    </div>
                    <div className="flex space-x-3 ml-auto">
                      <Link
                        to={`/chat/${escalation.session_id}`}
                        state={{ from: 'escalations' }}
                        className="btn btn-sm btn-outline flex items-center"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        View Chat
                      </Link>
                      
                      {escalation.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(escalation.id, 'in_progress')}
                          className="btn btn-sm btn-primary"
                        >
                          Take Case
                        </button>
                      )}
                      
                      {(escalation.status === 'pending' || escalation.status === 'in_progress') && (
                        <button
                          onClick={() => handleUpdateStatus(escalation.id, 'resolved')}
                          className="btn btn-sm btn-success"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Resolved details */}
                  {escalation.status === 'resolved' && escalation.resolved_by && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Resolved by {escalation.resolved_by} • {escalation.resolved_at ? formatDistanceToNow(new Date(escalation.resolved_at), { addSuffix: true }) : ''}
                    </div>
                  )}
                </div>
              </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// Status filter button component
function StatusFilterButton({ status, label, count, currentFilter, onClick }) {
  const isActive = currentFilter === status;
  
  let colorClasses = isActive 
    ? 'bg-primary-50 text-primary-700 border-primary-200 ring-primary-200'
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200';
    
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${colorClasses} transition-colors flex items-center`}
    >
      {label}
      <span className="ml-1.5 bg-white bg-opacity-80 text-xs rounded-full px-1.5 py-0.5 text-gray-600">
        {count}
      </span>
    </button>
  );
}
