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
  const [selectedBus, setSelectedBus] = useState<any>(null);
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

  const featuredBuses = filteredBuses.slice(0, 3);

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

      {/* Featured */}
      <section className="featured-section">
        <h2 className="section-label">Top Rated</h2>
        <div className="featured-grid-3">
          {featuredBuses.map((bus, index) => (
            <article key={bus._id} className={`featured-card ${index === 0 ? 'featured-primary' : ''}`}>
              <div className="featured-rank">{index + 1}</div>
              <div className="featured-avatar">
                {bus.photos?.[0] ? (
                  <img src={bus.photos[0]} alt={bus.fleet_number} />
                ) : (
                  bus.fleet_number.slice(0, 2)
                )}
              </div>
              <h3 className="featured-name">{bus.fleet_number}</h3>
              <div className="featured-stats">
                <span className="rating">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
                <span className="divider">•</span>
                <span>{bus.company?.name}</span>
              </div>
              <p className="featured-subtitle">{bus.route}</p>
              <div className="bus-actions">
                <button
                  className={`action-link ${userVote ? 'opacity-60' : ''}`}
                  onClick={() => handleNominate(bus._id)}
                  disabled={!!userVote}
                >
                  {userVote === bus._id ? 'Nominated' : 'Nominate'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* All Buses Grid */}
      <section className="list-section">
        <h2 className="section-label">All Buses</h2>
        <div className="companies-grid">
          {filteredBuses?.map((bus) => (
            <div key={bus._id} className="company-card" onClick={() => setSelectedBus(bus)} style={{ cursor: 'pointer' }}>
              <div className="company-logo">
                {bus.photos?.[0] ? (
                  <img src={bus.photos[0]} alt={bus.fleet_number} />
                ) : (
                  <span>{bus.fleet_number.slice(0, 2)}</span>
                )}
              </div>
              <div className="company-info">
                <h3 className="company-name">{bus.fleet_number}</h3>
                <div className="company-stats">
                  <span className="rating">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
                  <span>{bus.company?.name}</span>
                  <span>{bus.route}</span>
                </div>
              </div>
              <div className="company-actions">
                <button
                  className={`action-btn nominate ${userVote ? 'disabled' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleNominate(bus._id); }}
                  disabled={!!userVote}
                >
                  {userVote === bus._id ? 'Nominated' : 'Nominate'}
                </button>
                <button
                  className="action-btn rate"
                  onClick={(e) => { e.stopPropagation(); navigate('/rate-trip', { state: { busId: bus._id } }); }}
                >
                  Rate Bus
                </button>
              </div>
            </div>
          )) || []}
        </div>
      </section>

      {/* Bus Detail Modal */}
      {selectedBus && (
        <div className="modal-overlay" onClick={() => setSelectedBus(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{selectedBus.fleet_number}</h3>
              <button className="modal-close" onClick={() => setSelectedBus(null)}>×</button>
            </div>
            <div className="modal-body">
              {selectedBus.photos?.[0] && (
                <img src={selectedBus.photos[0]} alt={selectedBus.fleet_number} style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />
              )}
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <strong>Company:</strong> {selectedBus.company?.name}
                </div>
                <div>
                  <strong>Route:</strong> {selectedBus.route}
                </div>
                {selectedBus.type && (
                  <div>
                    <strong>Type:</strong> {selectedBus.type}
                  </div>
                )}
                {selectedBus.year && (
                  <div>
                    <strong>Year:</strong> {selectedBus.year}
                  </div>
                )}
                <div>
                  <strong>Rating:</strong> ⭐ {selectedBus.rating_avg?.toFixed(1) || '0.0'}
                </div>
                {selectedBus.last_seen && (
                  <div>
                    <strong>Last Seen:</strong> {new Date(selectedBus.last_seen).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-submit" 
                onClick={() => { setSelectedBus(null); navigate('/rate-trip', { state: { busId: selectedBus._id } }); }}
              >
                Rate This Bus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buses;
