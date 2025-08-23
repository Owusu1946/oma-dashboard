import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ChatBubbleOvalLeftEllipsisIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { ActivityFeedSkeleton } from './ShimmerLoading';
import mockupActivities from '../mockup/activities';

// Activity type icons
const ActivityIcon = ({ type }) => {
  const iconMap = {
    message: ChatBubbleOvalLeftEllipsisIcon,
    escalation: ExclamationCircleIcon,
    newUser: UserPlusIcon,
    session: PhoneIcon,
    completed: CheckCircleIcon,
    cancelled: XCircleIcon
  };
  
  const colorMap = {
    message: 'bg-blue-100 text-blue-600',
    escalation: 'bg-red-100 text-red-600',
    newUser: 'bg-green-100 text-green-600',
    session: 'bg-indigo-100 text-indigo-600',
    completed: 'bg-emerald-100 text-emerald-600',
    cancelled: 'bg-gray-100 text-gray-600'
  };
  
  const Icon = iconMap[type] || ChatBubbleOvalLeftEllipsisIcon;
  const colorClass = colorMap[type] || 'bg-gray-100 text-gray-600';
  
  return (
    <div className={`${colorClass} p-2 rounded-full`}>
      <Icon className="h-5 w-5" />
    </div>
  );
};

// Time formatter with tooltip
const TimeAgo = ({ date }) => {
  const formattedDate = format(new Date(date), 'MMM d, yyyy h:mm a');
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });
  
  return (
    <span 
      className="text-sm text-gray-500" 
      title={formattedDate}
    >
      {timeAgo}
    </span>
  );
};

/**
 * Activity item component
 */
const ActivityItem = ({ activity, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex space-x-3"
    >
      <ActivityIcon type={activity.type} />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{activity.title}</h3>
          <TimeAgo date={activity.timestamp} />
        </div>
        <p className="text-sm text-gray-600">{activity.description}</p>
        
        {activity.link && (
          <Link 
            to={activity.link.url} 
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            {activity.link.text}
          </Link>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Activity feed component
 */
export default function ActivityFeed({ 
  activities = [], 
  loading, 
  title = "Recent Activity", 
  useMockupIfEmpty = true,
  initialLimit = 4  // Default to showing 4 items initially
}) {
  const [showAll, setShowAll] = useState(false);
  
  if (loading) {
    return <ActivityFeedSkeleton items={5} />;
  }
  
  // Use mockup data if no activities are provided and useMockupIfEmpty is true
  const displayActivities = (!activities || activities.length === 0) && useMockupIfEmpty 
    ? mockupActivities
    : activities;
  
  if (!displayActivities || displayActivities.length === 0) {
    return (
      <div className="card text-center py-8">
        <h2 className="font-semibold text-xl mb-2">{title}</h2>
        <p className="text-gray-500">No recent activity to display.</p>
      </div>
    );
  }
  
  // Limit the number of activities to display unless showAll is true
  const visibleActivities = showAll 
    ? displayActivities 
    : displayActivities.slice(0, initialLimit);
  
  const hasMoreActivities = displayActivities.length > initialLimit;
  
  return (
    <div className="card">
      <h2 className="font-semibold text-xl mb-6">{title}</h2>
      
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {visibleActivities.map((activity, index) => (
            <ActivityItem 
              key={activity.id || index} 
              activity={activity} 
              index={index} 
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Toggle button to show all/less activities */}
      {hasMoreActivities && (
        <motion.div 
          className="mt-6 pt-4 border-t border-gray-200 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronUpIcon className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                View All ({displayActivities.length})
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
} 