import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import DashboardStats from '../components/DashboardStats';
import ActivityFeed from '../components/ActivityFeed';
import AnalyticsChart from '../components/AnalyticsChart';

export default function Dashboard() {
  const { stats, activities, loading, error, fetchDashboardData, fetchAnalyticsData } = useDatabase();
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('week');
  
  const loadAnalyticsData = useCallback(async (period) => {
    if (!fetchAnalyticsData) return;
    try {
      setAnalyticsLoading(true);
      const data = await fetchAnalyticsData(period);
      setChartData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [fetchAnalyticsData]);
  
  // Load analytics data on timeframe change
  useEffect(() => {
    loadAnalyticsData(timeframe);
  }, [timeframe, loadAnalyticsData]);
  
  const refreshData = () => {
    fetchDashboardData();
    loadAnalyticsData(timeframe);
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
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button 
          onClick={refreshData}
          disabled={loading || analyticsLoading}
          className="flex items-center btn btn-secondary"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Dashboard Stats */}
      <DashboardStats stats={stats} loading={loading} />
      
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Activity Feed */}
        <ActivityFeed 
          activities={activities} 
          loading={loading} 
          title="Recent Activity"
        />
        
        {/* Analytics Chart */}
        <AnalyticsChart 
          loading={analyticsLoading}
          title="Message Activity"
          data={chartData?.messages}
          onTimeframeChange={setTimeframe}
          timeframe={timeframe}
        />
      </div>
      
      {/* Revenue Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Performance</h2>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Revenue Trends</h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">₵{stats.totalRevenue?.toLocaleString() || '0'}</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </div>
          <AnalyticsChart 
            loading={analyticsLoading}
            data={chartData?.revenue}
            onTimeframeChange={setTimeframe}
            timeframe={timeframe}
            title="Revenue"
            height={200}
          />
        </div>
      </div>
      
      {/* KYC Metrics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">KYC Performance</h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* KYC Completion Chart */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">KYC Completions</h3>
            <AnalyticsChart 
              loading={analyticsLoading}
              data={chartData?.kyc}
              onTimeframeChange={setTimeframe}
              timeframe={timeframe}
              title="KYC Completions"
              height={200}
            />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center text-sm">
                <span className="font-medium text-gray-900">{stats.kycCompletedUsers}</span> users have completed KYC
                {stats.totalUsers > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({Math.round((stats.kycCompletedUsers / stats.totalUsers) * 100)}% of total users)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* User Signup Chart */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">New Users</h3>
            <AnalyticsChart 
              loading={analyticsLoading}
              data={chartData?.users}
              onTimeframeChange={setTimeframe}
              timeframe={timeframe}
              title="User Signups"
              height={200}
            />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center text-sm">
                <span className="font-medium text-gray-900">{stats.totalUsers}</span> total users registered
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Doctor Portal Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor Portal</h2>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">Main Portal Access</h3>
              <p className="text-gray-600 mb-4">
                The doctor portal is now the main entry point for the application. 
                Registered doctors can access their personalized dashboard to view bookings, 
                manage availability, and interact with patients.
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  to="/doctor/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <HeartIcon className="h-4 w-4 mr-2" />
                  Go to Main Portal
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Manage Doctors
                </Link>
                <Link
                  to="/admin/bookings"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  View Bookings
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <HeartIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
