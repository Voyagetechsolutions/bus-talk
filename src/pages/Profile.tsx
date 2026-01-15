import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { BADGES } from '../utils/badges';
import AuthModal from '../components/AuthModal';
import UserDashboard from '../components/UserDashboard';
import SpotterDashboard from '../components/SpotterDashboard';

interface UserStats {
  postsCount: number;
  ratingsCount: number;
  boostsCount: number;
  rank: number;
}

const Profile: React.FC = () => {
  const { user } = useAppStore();
  const posts = useQuery(api.queries.getPostsFeed as any, { limit: 100 });
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState<UserStats>({ postsCount: 0, ratingsCount: 0, boostsCount: 0, rank: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && posts) {
      calculateStats();
    }
  }, [user, posts]);

  const calculateStats = () => {
    if (!user || !posts?.posts) return;

    const userPosts = posts.posts.filter((p: any) => p.user_id === user.id);
    const postsCount = userPosts.length;
    
    setStats({
      postsCount,
      ratingsCount: 0, // Will be updated when ratings system is implemented
      boostsCount: 0,  // Will be updated when boosts system is implemented
      rank: 0
    });

    // Recent activity from posts
    const activity = userPosts.slice(0, 5).map((post: any) => ({
      type: 'post',
      title: post.title,
      subtitle: post.type === 'news' ? 'News Post' : 'Bus Sighting',
      timestamp: post.created_at,
      icon: post.type === 'news' ? '📰' : '📸'
    }));

    setRecentActivity(activity);
  };

  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' as 'signin' | 'signup' });

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        <button 
          onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
          className="btn-primary"
        >
          Sign In
        </button>
        
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          mode={authModal.mode}
          onModeChange={(mode) => setAuthModal({ ...authModal, mode })}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* View Toggle */}
      <div className="flex justify-center space-x-4 border-b border-gray-600">
        <button
          onClick={() => setActiveView('profile')}
          className={`px-6 py-3 font-semibold ${
            activeView === 'profile'
              ? 'text-accent-cyan border-b-2 border-accent-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          👤 Profile
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-6 py-3 font-semibold ${
            activeView === 'dashboard'
              ? 'text-accent-cyan border-b-2 border-accent-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 Dashboard
        </button>
      </div>

      {/* Dashboard Views */}
      {activeView === 'dashboard' && (
        user?.spotter_status ? <SpotterDashboard /> : <UserDashboard />
      )}

      {/* Profile View */}
      {activeView === 'profile' && (
        <>
          {/* Profile Header */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-accent-cyan rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-black">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-400">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-accent-red text-white' :
                    user.spotter_status ? 'bg-accent-yellow text-black' :
                    'bg-gray-600 text-white'
                  }`}>
                    {user.role === 'admin' ? 'Admin' :
                     user.spotter_status ? 'Verified Spotter' : 'Regular User'}
                  </span>
                  {user.badges && user.badges.length > 0 && (
                    <div className="flex space-x-1">
                      {user.badges.slice(0, 3).map((badgeId, index) => {
                        const badge = BADGES[badgeId];
                        return badge ? (
                          <span key={index} className={badge.color} title={badge.name}>
                            {badge.icon}
                          </span>
                        ) : null;
                      })}
                      {user.badges.length > 3 && (
                        <span className="text-gray-400 text-xs">+{user.badges.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {loading ? (
              <div className="animate-pulse">
                <div className="grid md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold text-accent-yellow">Posts</h3>
                  <p className="text-2xl font-bold">{stats.postsCount}</p>
                  <p className="text-xs text-gray-400">News & Sightings</p>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold text-accent-cyan">Ratings</h3>
                  <p className="text-2xl font-bold">{stats.ratingsCount}</p>
                  <p className="text-xs text-gray-400">Trip Reviews</p>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold text-accent-red">Boosts</h3>
                  <p className="text-2xl font-bold">{stats.boostsCount}</p>
                  <p className="text-xs text-gray-400">Posts Boosted</p>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold text-white">Member Since</h3>
                  <p className="text-sm font-bold">{user.created_at ? new Date(parseInt(user.created_at)).toLocaleDateString() : 'Invalid Date'}</p>
                  <p className="text-xs text-gray-400">Join Date</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <span className="text-xl">{activity.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{activity.title}</h4>
                      <p className="text-sm text-gray-400">{activity.subtitle}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-700 rounded-lg text-center">
                  <p className="text-sm text-gray-400">No recent activity</p>
                  <p className="text-xs text-gray-500 mt-1">Start rating trips or posting sightings!</p>
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Badges</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.values(BADGES).map((badge) => {
                const earned = user.badges?.includes(badge.id);
                return (
                  <div key={badge.id} className={`text-center p-4 bg-gray-700 rounded-lg ${!earned ? 'opacity-50' : ''}`}>
                    <div className={`text-2xl mb-2 ${earned ? badge.color : 'text-gray-500'}`}>
                      {badge.icon}
                    </div>
                    <h4 className="font-semibold">{badge.name}</h4>
                    <p className="text-xs text-gray-400">{badge.description}</p>
                    {earned && (
                      <div className="mt-2">
                        <span className="text-xs bg-accent-yellow text-black px-2 py-1 rounded">
                          EARNED
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Profile;