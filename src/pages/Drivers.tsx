import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { getAnonymousId } from '../utils/anonymousId';
import { getIsoWeek } from '../utils/date';

const Drivers: React.FC = () => {
  const { user } = useAppStore();
  const drivers = useQuery(api.queries.getDrivers as any);
  const castVote = useMutation(api.mutations.castVote as any);
  const voterId = user?.id || getAnonymousId();
  const { week, year } = getIsoWeek(new Date());
  const voteSummary = useQuery(api.queries.getVoteSummary as any, {
    category: 'driver_of_week',
    year,
    week,
    user_id: voterId,
  });
  const userVote = voteSummary?.userVote ?? null;
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

  const handleNominate = async (driverId: string) => {
    if (userVote) return;
    await castVote({
      user_id: voterId,
      category: 'driver_of_week',
      nominee_id: driverId,
      year,
      week,
      role: user?.role,
      spotter_status: user?.spotter_status,
    });
  };

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
              <div className="driver-avatar">
                {driver.photo ? (
                  <img src={driver.photo} alt={driver.name} />
                ) : (
                  driver.name[0]
                )}
              </div>
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
              <button
                className={`action-link ${userVote ? 'opacity-60' : ''}`}
                onClick={() => handleNominate(driver._id)}
                disabled={!!userVote}
              >
                {userVote === driver._id ? 'Nominated' : 'Nominate'}
              </button>
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
                  <div className="row-avatar-coral">
                    {driver.photo ? (
                      <img src={driver.photo} alt={driver.name} />
                    ) : (
                      driver.name[0]
                    )}
                  </div>
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
