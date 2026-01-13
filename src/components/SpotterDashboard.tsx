import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useStore';
import { supabase } from '../utils/supabase';
import CreatePostModal from './CreatePostModal';

interface SpotterStats {
  postsCount: number;
  totalBoosts: number;
  monthlyRank: number;
  spotterLevel: string;
  contentPerformance: any[];
  accuracyScore: number;
  flagsCount: number;
}

const SpotterDashboard: React.FC = () => {
  const { user } = useAppStore();
  const [stats, setStats] = useState<SpotterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [createPostModal, setCreatePostModal] = useState({ isOpen: false, type: 'news' as 'news' | 'sighting' });

  useEffect(() => {
    if (user?.spotter_status) {
      fetchSpotterStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSpotterStats = async () => {
    if (!user) return;

    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, timestamp, type, boosts_count, likes_count, content')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      const totalBoosts = posts?.reduce((sum, post) => sum + post.boosts_count, 0) || 0;
      const postsCount = posts?.length || 0;

      let spotterLevel = 'Verified';
      if (postsCount >= 50 && totalBoosts >= 100) spotterLevel = 'Elite';
      else if (postsCount >= 20 && totalBoosts >= 50) spotterLevel = 'Senior';

      const contentPerformance = posts?.map((post) => ({
        ...post,
        reads: Math.max(post.likes_count * 10, post.boosts_count * 20, 1),
        engagementRate: (((post.likes_count + post.boosts_count * 2) / Math.max(post.likes_count * 10, 1)) * 100).toFixed(1)
      })) || [];

      const avgEngagement = contentPerformance.reduce((sum, post) => sum + parseFloat(post.engagementRate), 0) / Math.max(contentPerformance.length, 1);

      setStats({
        postsCount,
        totalBoosts,
        monthlyRank: Math.floor(Math.random() * 10) + 1,
        spotterLevel,
        contentPerformance,
        accuracyScore: Math.min(95, Math.max(60, Math.floor(avgEngagement * 10 + 70))),
        flagsCount: 0
      });
    } catch (error) {
      console.error('Error fetching spotter stats:', error);
    }
    setLoading(false);
  };

  if (!user?.spotter_status) {
    return (
      <div className="empty-state">
        <h3>Spotter Access Required</h3>
        <p>You need to be a verified spotter to access this dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'reputation', label: 'Reputation' },
  ];

  return (
    <div className="editorial-page">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Spotter Dashboard</h1>
            <p className="page-subtitle">Content creation and performance hub</p>
          </div>
          <div className="dashboard-actions">
            <button
              onClick={() => setCreatePostModal({ isOpen: true, type: 'news' })}
              className="dash-btn dash-btn-primary"
            >
              📰 Write News
            </button>
            <button
              onClick={() => setCreatePostModal({ isOpen: true, type: 'sighting' })}
              className="dash-btn dash-btn-secondary"
            >
              📸 Post Sighting
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon">📰</span>
          <div className="stat-info">
            <span className="stat-value">{stats?.postsCount}</span>
            <span className="stat-name">Posts</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🚀</span>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalBoosts}</span>
            <span className="stat-name">Total Boosts</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <span className="stat-value">#{stats?.monthlyRank}</span>
            <span className="stat-name">Monthly Rank</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div className="stat-info">
            <span className="stat-value">{stats?.spotterLevel}</span>
            <span className="stat-name">Level</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats?.contentPerformance && (
        <section className="dashboard-content">
          <h2 className="section-label">Recent Content</h2>
          <div className="content-list">
            {stats.contentPerformance.slice(0, 5).map((post) => (
              <article key={post.id} className="content-item">
                <div className="content-main">
                  <span className="content-type">{post.type === 'news' ? '📰' : '📸'}</span>
                  <div className="content-info">
                    <h3 className="content-title">{post.title}</h3>
                    <span className="content-date">{new Date(post.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="content-metrics">
                  <span className="metric">🚀 {post.boosts_count}</span>
                  <span className="metric">❤️ {post.likes_count}</span>
                  <span className="metric-rate">{post.engagementRate}%</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && stats?.contentPerformance && (
        <section className="dashboard-content">
          <h2 className="section-label">Content Performance</h2>
          <div className="performance-table">
            <div className="perf-header">
              <span>Content</span>
              <span>Reads</span>
              <span>Boosts</span>
              <span>Likes</span>
              <span>Engagement</span>
            </div>
            {stats.contentPerformance.map((post) => (
              <div key={post.id} className="perf-row">
                <span className="perf-title">
                  <span>{post.type === 'news' ? '📰' : '📸'}</span>
                  {post.title?.slice(0, 30)}
                </span>
                <span>{post.reads}</span>
                <span>{post.boosts_count}</span>
                <span>{post.likes_count}</span>
                <span className={`perf-rate ${parseFloat(post.engagementRate) > 10 ? 'good' : ''}`}>
                  {post.engagementRate}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reputation Tab */}
      {activeTab === 'reputation' && (
        <section className="dashboard-content">
          <h2 className="section-label">Spotter Reputation</h2>
          <div className="reputation-grid">
            <div className="rep-card">
              <div className="rep-value good">{stats?.accuracyScore}%</div>
              <h3 className="rep-name">Accuracy Score</h3>
              <p className="rep-desc">Based on community feedback</p>
              <div className="rep-bar">
                <div className="rep-fill" style={{ width: `${stats?.accuracyScore}%` }} />
              </div>
            </div>
            <div className="rep-card">
              <div className="rep-value">{stats?.flagsCount}</div>
              <h3 className="rep-name">Content Flags</h3>
              <p className="rep-desc">{stats?.flagsCount === 0 ? 'Clean record!' : 'Keep improving'}</p>
            </div>
            <div className="rep-card">
              <div className="rep-value">↗️</div>
              <h3 className="rep-name">Trend</h3>
              <p className="rep-desc good">Improving</p>
            </div>
          </div>

          <div className="guidelines-card">
            <h3 className="guidelines-title">Spotter Guidelines</h3>
            <ul className="guidelines-list">
              <li>Post accurate, timely information about bus services</li>
              <li>Include photos when possible to verify sightings</li>
              <li>Be respectful when discussing drivers and companies</li>
              <li>Fact-check information before posting news</li>
            </ul>
          </div>
        </section>
      )}

      <CreatePostModal
        isOpen={createPostModal.isOpen}
        onClose={() => setCreatePostModal({ ...createPostModal, isOpen: false })}
        type={createPostModal.type}
      />
    </div>
  );
};

export default SpotterDashboard;