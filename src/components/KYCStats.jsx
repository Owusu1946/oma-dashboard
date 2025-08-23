import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CheckBadgeIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';
import { StatCardSkeleton } from './ShimmerLoading';

const KYCStatCard = ({ title, value, percentage, icon: Icon, color, loading, delay = 0 }) => {
  if (loading) {
    return <StatCardSkeleton />;
  }

  const bgColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-600`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="card hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center">
        <div className={`${bgColorClass} p-3 rounded-full`}>
          <Icon className={`h-6 w-6 ${textColorClass}`} />
        </div>
        <div className="ml-4">
          <h2 className="text-gray-500 text-sm font-medium">{title}</h2>
          <div className="flex items-center">
            <motion.p 
              key={value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-semibold text-gray-900"
            >
              {value}
            </motion.p>
            {percentage !== undefined && (
              <span className="ml-2 text-sm font-medium text-green-600">
                {percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function KYCStats({ stats, loading }) {
  const { totalUsers, kycCompletedUsers } = stats || { totalUsers: 0, kycCompletedUsers: 0 };
  
  // Calculate completion percentage
  const completionPercentage = totalUsers > 0 
    ? Math.round((kycCompletedUsers / totalUsers) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <KYCStatCard
        title="Total Users"
        value={totalUsers}
        icon={UserGroupIcon}
        color="blue"
        loading={loading}
        delay={0}
      />
      <KYCStatCard
        title="KYC Completed"
        value={kycCompletedUsers}
        icon={CheckBadgeIcon}
        color="green"
        loading={loading}
        delay={1}
      />
      <KYCStatCard
        title="Completion Rate"
        value={`${completionPercentage}%`}
        icon={ArrowTrendingUpIcon}
        color="purple"
        loading={loading}
        delay={2}
      />
      <KYCStatCard
        title="Pending KYC"
        value={totalUsers - kycCompletedUsers}
        icon={UserIcon}
        color="yellow"
        loading={loading}
        delay={3}
      />
    </div>
  );
} 