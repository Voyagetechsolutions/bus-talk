import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/api';
import AdminLayout from '../components/admin/AdminLayout';
import StatsCard from '../components/admin/StatsCard';
import AdminCompanies from './admin/AdminCompanies';
import AdminDrivers from './admin/AdminDrivers';
import AdminBuses from './admin/AdminBuses';
import AdminPosts from './admin/AdminPosts';

const AdminDashboard: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const companies = useQuery(api.queries.getCompanies);
  const drivers = useQuery(api.queries.getDrivers);
  const buses = useQuery(api.queries.getBuses, { limit: 100 });
  const posts = useQuery(api.queries.getPostsFeed, { limit: 100 });
  const seedDatabase = useMutation(api.seed.seedDatabase);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedDatabase();
      setSeedResult(result.message);
    } catch (error: any) {
      setSeedResult(`Error: ${error.message}`);
    }
    setSeeding(false);
  };

  const hasNoData = !companies?.length && !drivers?.length && !buses?.length;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of Bus Talk"
      action={hasNoData ? (
        <button
          className="btn-primary"
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? 'Seeding...' : '🌱 Seed Database'}
        </button>
      ) : null}
    >
      {seedResult && (
        <div className="seed-result">
          {seedResult}
          <button onClick={() => setSeedResult(null)}>×</button>
        </div>
      )}

      <div className="stats-grid stats-grid-4">
        <StatsCard icon="🏢" value={companies?.length || 0} label="Companies" />
        <StatsCard icon="👨‍✈️" value={drivers?.length || 0} label="Drivers" />
        <StatsCard icon="🚌" value={buses?.length || 0} label="Buses" />
        <StatsCard icon="📝" value={posts?.posts?.length || 0} label="Posts" />
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {posts?.posts?.slice(0, 5).map((post: any) => (
              <div key={post._id} className="activity-item">
                <span className="activity-icon">
                  {post.type === 'sighting' ? '👁️' : '📰'}
                </span>
                <div className="activity-content">
                  <span className="activity-text">{post.caption?.slice(0, 50) || 'New post'}</span>
                  <span className="activity-time">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) || (
                <p className="empty-message">No recent activity</p>
              )}
          </div>
        </section>

        <section className="dashboard-section">
          <h3>Top Rated Buses</h3>
          <div className="top-list">
            {buses?.slice(0, 5).map((bus: any, index: number) => (
              <div key={bus._id} className="top-item">
                <span className="top-rank">#{index + 1}</span>
                <span className="top-name">{bus.fleet_number}</span>
                <span className="top-value">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
              </div>
            )) || (
                <p className="empty-message">No buses yet</p>
              )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

const Admin: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="companies" element={<AdminCompanies />} />
      <Route path="drivers" element={<AdminDrivers />} />
      <Route path="buses" element={<AdminBuses />} />
      <Route path="posts" element={<AdminPosts />} />
    </Routes>
  );
};

export default Admin;