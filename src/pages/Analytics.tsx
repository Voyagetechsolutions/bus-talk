import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAppStore } from '../hooks/useStore';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalRatings: number;
  totalBoosts: number;
  topBuses: any[];
  topDrivers: any[];
  recentActivity: any[];
  userGrowth: any[];
}

const Analytics: React.FC = () => {
  const { user } = useAppStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active users (posted/rated in last 30 days)
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Get total ratings
      const { count: totalRatings } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true });

      // Get total boosts
      const { count: totalBoosts } = await supabase
        .from('boosts')
        .select('*', { count: 'exact', head: true });

      // Get top buses
      const { data: topBuses } = await supabase
        .from('buses')
        .select(`
          *,
          company:companies(name)
        `)
        .order('rating_avg', { ascending: false })
        .limit(5);

      // Get top drivers
      const { data: topDrivers } = await supabase
        .from('drivers')
        .select(`
          *,
          company:companies(name)
        `)
        .order('rating_avg', { ascending: false })
        .limit(5);

      // Get recent activity
      const { data: recentPosts } = await supabase
        .from('posts')
        .select(`
          id, title, type, timestamp,
          user:users(username)
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      const { data: recentRatings } = await supabase
        .from('ratings')
        .select(`
          id, created_at,
          user:users(username),
          bus:buses(fleet_number)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const recentActivity = [
        ...(recentPosts || []).map(post => ({
          type: 'post',
          title: `${(post.user as any)?.username || 'Unknown'} posted "${post.title}"`,
          timestamp: post.timestamp,
          icon: post.type === 'news' ? '📰' : '📸'
        })),
        ...(recentRatings || []).map(rating => ({
          type: 'rating',
          title: `${(rating.user as any)?.username || 'Unknown'} rated ${(rating.bus as any)?.fleet_number || 'Unknown Bus'}`,
          timestamp: rating.created_at,
          icon: '⭐'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

      setData({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalPosts: totalPosts || 0,
        totalRatings: totalRatings || 0,
        totalBoosts: totalBoosts || 0,
        topBuses: topBuses || [],
        topDrivers: topDrivers || [],
        recentActivity,
        userGrowth: [] // TODO: Implement user growth tracking
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    
    setLoading(false);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-400">You need admin privileges to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent-cyan">Analytics Dashboard</h1>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:border-accent-cyan"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="card text-center">
          <h3 className="text-lg font-bold text-accent-yellow">Total Users</h3>
          <p className="text-3xl font-bold">{data?.totalUsers}</p>
          <p className="text-sm text-gray-400">Registered</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-bold text-accent-green">Active Users</h3>
          <p className="text-3xl font-bold">{data?.activeUsers}</p>
          <p className="text-sm text-gray-400">Last 30 days</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-bold text-accent-cyan">Posts</h3>
          <p className="text-3xl font-bold">{data?.totalPosts}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-bold text-accent-red">Ratings</h3>
          <p className="text-3xl font-bold">{data?.totalRatings}</p>
          <p className="text-sm text-gray-400">Trip reviews</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-bold text-purple-400">Boosts</h3>
          <p className="text-3xl font-bold">{data?.totalBoosts}</p>
          <p className="text-sm text-gray-400">Post boosts</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Top Rated Buses</h2>
          <div className="space-y-3">
            {data?.topBuses.map((bus, index) => (
              <div key={bus.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <span className="font-semibold">{bus.fleet_number}</span>
                  <span className="text-gray-400 text-sm ml-2">{bus.company?.name}</span>
                </div>
                <span className="text-accent-yellow font-bold">{bus.rating_avg.toFixed(1)} ⭐</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Top Rated Drivers</h2>
          <div className="space-y-3">
            {data?.topDrivers.map((driver, index) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <span className="font-semibold">{driver.name}</span>
                  <span className="text-gray-400 text-sm ml-2">{driver.company?.name}</span>
                </div>
                <span className="text-accent-yellow font-bold">{driver.rating_avg.toFixed(1)} ⭐</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data?.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded">
              <span className="text-lg">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm">{activity.title}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;