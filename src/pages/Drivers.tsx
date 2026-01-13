import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';

const Drivers: React.FC = () => {
  const drivers = useQuery(api.queries.getDrivers as any);
  const loading = drivers === undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedDrivers = [...(drivers || [])].sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  const featuredDrivers = sortedDrivers.slice(0, 3);
  const restDrivers = sortedDrivers.slice(3);

  return (
    <div className="editorial-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Bus Drivers</h1>
            <p className="page-subtitle">The professionals behind the wheel</p>
          </div>
        </div>
      </header>

      {/* Featured Drivers */}
      <section className="featured-section">
        <h2 className="section-label">Top Rated</h2>
        <div className="driver-feature-grid">
          {featuredDrivers.map((driver, index) => (
            <article key={driver._id} className="driver-card">
              <div className="driver-rank">{index + 1}</div>
              <div className="driver-avatar">{driver.name[0]}</div>
              <h3 className="driver-name">{driver.name}</h3>
              <p className="driver-company">{driver.company?.name}</p>
              <div className="driver-stats">
                <span>{driver.experience_years}y exp</span>
                <span className="rating-badge">⭐ {driver.rating_avg?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="driver-routes">
                {driver.routes.slice(0, 2).map((route: string, i: number) => (
                  <span key={i} className="route-tag">{route}</span>
                ))}
                {driver.routes.length > 2 && (
                  <span className="route-more">+{driver.routes.length - 2}</span>
                )}
              </div>
              <button className="rate-btn">Rate Driver</button>
            </article>
          ))}
        </div>
      </section>

      {/* All Drivers Table */}
      {restDrivers.length > 0 && (
        <section className="list-section">
          <h2 className="section-label">All Drivers</h2>
          <div className="data-table">
            <div className="table-header">
              <span>#</span>
              <span>Driver</span>
              <span>Company</span>
              <span>Exp</span>
              <span>Rating</span>
            </div>
            {restDrivers.map((driver, index) => (
              <div key={driver._id} className="table-row">
                <span className="col-rank">{index + 4}</span>
                <span className="col-name">
                  <div className="row-avatar-coral">{driver.name[0]}</div>
                  <span className="row-title">{driver.name}</span>
                </span>
                <span className="col-stat">{driver.company?.name}</span>
                <span className="col-stat">{driver.experience_years}y</span>
                <span className="col-stat highlight">⭐ {driver.rating_avg?.toFixed(1) || '0.0'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Drivers;