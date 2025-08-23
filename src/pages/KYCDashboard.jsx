import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDatabase } from '../contexts/DatabaseContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import KYCStats from '../components/KYCStats';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityFeed from '../components/ActivityFeed';

export default function KYCDashboard() {
  const { stats, activities, loading, error, fetchDashboardData } = useDatabase();
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('week');
  
  // Load analytics data
  useEffect(() => {
    fetchAnalyticsData(timeframe);
  }, [timeframe]);
  
  // Fetch analytics data based on the selected timeframe
  const fetchAnalyticsData = async (period) => {
    try {
      setAnalyticsLoading(true);
      const data = await useDatabase().fetchAnalyticsData(period);
      setChartData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Filter activities to only show KYC related ones
  const kycActivities = activities.filter(activity => 
    activity.type === 'completed' || 
    activity.title.includes('KYC') ||
    activity.description.includes('KYC')
  );

  const refreshData = () => {
    fetchDashboardData();
    fetchAnalyticsData(timeframe);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={refreshData}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">KYC Dashboard</h1>
        <button 
          onClick={refreshData}
          disabled={loading || analyticsLoading}
          className="flex items-center btn btn-secondary"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* KYC Statistics */}
      <KYCStats stats={stats} loading={loading} />
      
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* KYC Activity Feed */}
        <ActivityFeed 
          activities={kycActivities} 
          loading={loading} 
          title="Recent KYC Activity"
          initialLimit={5}
        />
        
        {/* KYC Completion Chart */}
        <AnalyticsChart 
          loading={analyticsLoading}
          title="KYC Completions"
          data={chartData?.kyc}
          onTimeframeChange={setTimeframe}
          timeframe={timeframe}
        />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">KYC vs User Growth</h2>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Comparison Chart</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">New User Registrations</h4>
              <AnalyticsChart 
                loading={analyticsLoading}
                title="User Signups"
                data={chartData?.users}
                onTimeframeChange={setTimeframe}
                timeframe={timeframe}
                height={200}
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">KYC Completions</h4>
              <AnalyticsChart 
                loading={analyticsLoading}
                title="KYC Completions"
                data={chartData?.kyc}
                onTimeframeChange={setTimeframe}
                timeframe={timeframe}
                height={200}
              />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-xl font-semibold">
                  {stats.totalUsers > 0 
                    ? `${Math.round((stats.kycCompletedUsers / stats.totalUsers) * 100)}%` 
                    : '0%'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending KYC</p>
                <p className="text-xl font-semibold">
                  {stats.totalUsers - stats.kycCompletedUsers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}