import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StatCardSkeleton } from './ShimmerLoading';

/**
 * Animated stat card component
 */
function StatCard({ icon: Icon, title, value, color, href, loading, delay = 0 }) {
  const bgColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-600`;
  
  const cardContent = (
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
          <motion.p 
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-semibold text-gray-900"
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href}>
        {cardContent}
      </Link>
    );
  }
  
  return cardContent;
}

/**
 * Dashboard stats grid component
 */
export default function DashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }
  
  const { pendingEscalations, totalUsers, activeSessions, totalMessages, avgResponseTime, totalRevenue } = stats;
  
  const statCards = [
    {
      title: "Pending Escalations",
      value: pendingEscalations,
      icon: ExclamationTriangleIcon,
      color: "red",
      href: "/escalations",
      delay: 0
    },
    {
      title: "Active Sessions",
      value: activeSessions,
      icon: ChatBubbleLeftRightIcon,
      color: "green",
      delay: 1
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: UserGroupIcon,
      color: "blue",
      href: "/users",
      delay: 2
    },
    {
      title: "Total Messages",
      value: totalMessages,
      icon: ChartBarIcon,
      color: "purple",
      delay: 3
    }
  ];
  
  // If we have avgResponseTime, add it to the stats
  if (avgResponseTime !== undefined) {
    statCards.push({
      title: "Avg Response Time",
      value: `${avgResponseTime}s`,
      icon: ClockIcon,
      color: "yellow",
      delay: 4
    });
  }
  
  // Add revenue card
  if (totalRevenue !== undefined) {
    statCards.push({
      title: "Total Revenue",
      value: `₵${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "emerald",
      delay: 5
    });
  }
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <StatCard 
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          href={card.href}
          loading={loading}
          delay={card.delay}
        />
      ))}
    </div>
  );
} 