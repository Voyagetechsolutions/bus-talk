import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useStore';
import { supabase } from '../utils/supabase';
import { BADGES } from '../utils/badges';

interface UserStats {
  ratingsCount: number;
  ratingsAvg: number;
  sightingsCount: number;
  boostsGiven: number;
  reputationScore: number;
  achievements: string[];
  recentActivity: any[];
  savedBuses: any[];
}

const UserDashboard: React.FC = () => {
  const { user } = useAppStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get ratings count and average
      const { data: ratings } = await supabase
        .from('ratings')
        .select('punctuality, cleanliness, comfort, behavior')
        .eq('user_id', user.id);

      // Get sightings count
      const { count: sightingsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'sighting');

      // Get boosts given
      const { count: boostsGiven } = await supabase
        .from('boosts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get recent activity
      const { data: recentRatings } = await supabase
        .from('ratings')
        .select(`
          id, created_at, punctuality, cleanliness, comfort, behavior,
          bus:buses(fleet_number, route),
          driver:drivers(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: recentSightings } = await supabase
        .from('posts')
        .select('id, title, timestamp, likes_count, boosts_count')
        .eq('user_id', user.id)
        .eq('type', 'sighting')
        .order('timestamp', { ascending: false })
        .limit(5);

      // Calculate stats
      const ratingsAvg = ratings?.length 
        ? ratings.reduce((sum, r) => sum + (r.punctuality + r.cleanliness + r.comfort + r.behavior) / 4, 0) / ratings.length
        : 0;

      const recentActivity = [
        ...(recentRatings || []).map(r => ({
          type: 'rating',
          title: `Rated ${(r.bus as any)?.fleet_number || 'Unknown Bus'} - ${(r.bus as any)?.route || 'Unknown Route'}`,
          subtitle: `${((r.punctuality + r.cleanliness + r.comfort + r.behavior) / 4).toFixed(1)} stars`,
          timestamp: r.created_at,
          icon: '⭐'
        })),
        ...(recentSightings || []).map(s => ({
          type: 'sighting',
          title: s.title,
          subtitle: `${s.likes_count} likes, ${s.boosts_count} boosts`,
          timestamp: s.timestamp,
          icon: '📸'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setStats({
        ratingsCount: ratings?.length || 0,
        ratingsAvg: ratingsAvg,
        sightingsCount: sightingsCount || 0,
        boostsGiven: boostsGiven || 0,
        reputationScore: Math.min(100, (ratings?.length || 0) * 2 + (sightingsCount || 0) * 3 + (boostsGiven || 0)),
        achievements: user.badges || [],
        recentActivity,
        savedBuses: [] // TODO: Implement saved buses
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h2>
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-accent-cyan mb-2">My Dashboard</h1>
        <p className="text-gray-400">Track your Bus Talk journey</p>
      </div>

      {/* Overview Cards */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card text-center"
          >
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="text-lg font-bold text-accent-yellow">Ratings</h3>
            <p className="text-2xl font-bold">{stats?.ratingsCount}</p>
            <p className="text-sm text-gray-400">
              Avg: {stats?.ratingsAvg.toFixed(1)} stars
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card text-center"
          >
            <div className="text-3xl mb-2">📸</div>
            <h3 className="text-lg font-bold text-accent-green">Sightings</h3>
            <p className="text-2xl font-bold">{stats?.sightingsCount}</p>
            <p className="text-sm text-gray-400">Posted</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card text-center"
          >
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="text-lg font-bold text-accent-red">Boosts</h3>
            <p className="text-2xl font-bold">{stats?.boostsGiven}</p>
            <p className="text-sm text-gray-400">Given</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card text-center"
          >
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-lg font-bold text-accent-cyan">Reputation</h3>
            <p className="text-2xl font-bold">{stats?.reputationScore}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-accent-cyan h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, stats?.reputationScore || 0)}%` }}
              ></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-4 border-b border-gray-600">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'activity', label: 'Activity', icon: '📝' },
          { id: 'achievements', label: 'Achievements', icon: '🏆' },
          { id: 'saved', label: 'Saved', icon: '💾' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'text-accent-cyan border-b-2 border-accent-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'activity' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats?.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
              >
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold">{activity.title}</h4>
                  <p className="text-sm text-gray-400">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.values(BADGES).map((badge) => {
              const earned = stats?.achievements.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center p-4 bg-gray-700 rounded-lg ${!earned ? 'opacity-50' : ''}`}
                >
                  <div className={`text-3xl mb-2 ${earned ? badge.color : 'text-gray-500'}`}>
                    {badge.icon}
                  </div>
                  <h4 className="font-semibold">{badge.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                  {earned && (
                    <div className="mt-2">
                      <span className="text-xs bg-accent-yellow text-black px-2 py-1 rounded">
                        EARNED
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Saved Items</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💾</div>
            <p className="text-gray-400">Save your favorite buses, drivers, and routes</p>
            <p className="text-sm text-gray-500 mt-2">Feature coming soon!</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserDashboard;