import React, { useState, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { getAnonymousId } from '../utils/anonymousId';
import { getIsoWeek } from '../utils/date';

const Buses: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const buses = useQuery(api.queries.getBuses as any, { limit: 50 });
  const castVote = useMutation(api.mutations.castVote as any);
  const voterId = user?.id || getAnonymousId();
  const { week, year } = getIsoWeek(new Date());
  const voteSummary = useQuery(api.queries.getVoteSummary as any, {
    category: 'bus_of_week',
    year,
    week,
    user_id: voterId,
  });
  const userVote = voteSummary?.userVote ?? null;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const loading = buses === undefined;

  const filteredBuses = useMemo(() => {
    if (!buses) return [];

    let filtered = buses.filter((bus: any) =>
      bus.fleet_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a: any, b: any) => {
      if (sortBy === 'rating') return (b.rating_avg || 0) - (a.rating_avg || 0);
      if (sortBy === 'fleet') return a.fleet_number.localeCompare(b.fleet_number);
      return 0;
    });
  }, [buses, searchTerm, sortBy]);

  const featuredBuses = filteredBuses.slice(0, 4);
  const restBuses = filteredBuses.slice(4);

  const handleNominate = async (busId: string) => {
    if (userVote) return;
    await castVote({
      user_id: voterId,
      category: 'bus_of_week',
      nominee_id: busId,
      year,
      week,
      role: user?.role,
      spotter_status: user?.spotter_status,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="editorial-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Bus Fleet</h1>
            <p className="page-subtitle">Explore and rate buses across the network</p>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search buses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="rating">Sort by Rating</option>
          <option value="fleet">Sort by Fleet #</option>
        </select>
      </div>

      {/* Featured Grid */}
      <section className="featured-section">
        <h2 className="section-label">Top Rated</h2>
        <div className="bus-feature-grid">
          {featuredBuses.map((bus, index) => (
            <article key={bus._id} className="bus-feature-card">
              {bus.photos?.[0] && (
                <div className="bus-feature-image">
                  <img src={bus.photos[0]} alt={bus.fleet_number} />
                </div>
              )}
              <div className="bus-feature-header">
                <span className="bus-rank">{index + 1}</span>
                <span className="bus-rating">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
              </div>
              <h3 className="bus-fleet">{bus.fleet_number}</h3>
              <p className="bus-company">{bus.company?.name}</p>
              <p className="bus-route">{bus.route}</p>
              <div className="bus-actions">
                <button
                  className={`action-link ${userVote ? 'opacity-60' : ''}`}
                  onClick={() => handleNominate(bus._id)}
                  disabled={!!userVote}
                >
                  {userVote === bus._id ? 'Nominated' : 'Nominate'}
                </button>
                <button className="action-link" onClick={() => navigate('/rate-trip', { state: { busId: bus._id } })}>
                  Rate this bus →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* All Buses Table */}
      {restBuses.length > 0 && (
        <section className="list-section">
          <h2 className="section-label">All Buses</h2>
          <div className="data-table">
            <div className="table-header">
              <span>#</span>
              <span>Bus</span>
              <span>Company</span>
              <span>Route</span>
              <span>Rating</span>
            </div>
            {restBuses.map((bus, index) => (
              <div key={bus._id} className="table-row">
                <span className="col-rank">{index + 5}</span>
                <span className="col-name">
                  <div className="row-avatar">{bus.fleet_number.slice(0, 2)}</div>
                  <div>
                    <span className="row-title">{bus.fleet_number}</span>
                    <span className="row-subtitle">{bus.type || 'Standard'}</span>
                  </div>
                </span>
                <span className="col-stat">{bus.company?.name}</span>
                <span className="col-stat">{bus.route}</span>
                <span className="col-stat highlight">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Buses;
