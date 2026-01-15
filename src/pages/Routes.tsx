import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';

const Routes: React.FC = () => {
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const buses = useQuery(api.queries.getBuses as any, { limit: 200 });

  const loading = buses === undefined;

  // Extract unique cities from routes
  const cities = useMemo(() => {
    if (!buses) return [];
    const citySet = new Set<string>();
    buses.forEach((bus: any) => {
      const routeParts = bus.route.split(/[-–—]/);
      routeParts.forEach((part: string) => {
        const city = part.trim();
        if (city) citySet.add(city);
      });
    });
    return Array.from(citySet).sort();
  }, [buses]);

  const filteredCities = (search: string) =>
    cities.filter(city => city.toLowerCase().includes(search.toLowerCase()));

  const filteredBuses = useMemo(() => {
    if (!buses || (!originSearch && !destinationSearch)) return [];
    
    return buses.filter((bus: any) => {
      const route = bus.route.toLowerCase();
      const matchOrigin = !originSearch || route.includes(originSearch.toLowerCase());
      const matchDest = !destinationSearch || route.includes(destinationSearch.toLowerCase());
      return matchOrigin && matchDest;
    }).sort((a: any, b: any) => (b.rating_avg || 0) - (a.rating_avg || 0));
  }, [buses, originSearch, destinationSearch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="editorial-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Bus Routes</h1>
            <p className="page-subtitle">Find the best service on your route</p>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="route-search-grid">
          <div className="search-field">
            <label className="search-label">From</label>
            <input
              type="text"
              placeholder="🔍 Search origin city..."
              value={originSearch}
              onChange={(e) => setOriginSearch(e.target.value)}
              className="route-search-input"
              list="origin-cities"
            />
            <datalist id="origin-cities">
              {filteredCities(originSearch).map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

          <div className="search-field">
            <label className="search-label">To</label>
            <input
              type="text"
              placeholder="🔍 Search destination city..."
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              className="route-search-input"
              list="destination-cities"
            />
            <datalist id="destination-cities">
              {filteredCities(destinationSearch).map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
        </div>
      </section>

      {/* Results */}
      {filteredBuses.length > 0 && (
        <section className="list-section">
          <h2 className="section-label">
            {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'} Found
          </h2>
          <div className="data-table">
            <div className="table-header">
              <span>#</span>
              <span>Bus</span>
              <span>Company</span>
              <span>Route</span>
              <span>Rating</span>
            </div>
            {filteredBuses.map((bus: any, index: number) => (
              <div key={bus._id} className="table-row">
                <span className="col-rank">{index + 1}</span>
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

      {(originSearch || destinationSearch) && filteredBuses.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🚌</div>
          <h3>No buses found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}

      {!originSearch && !destinationSearch && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3>Search for a route</h3>
          <p>Enter origin and/or destination to find buses</p>
        </div>
      )}

      <style>{`
        .search-section {
          max-width: 900px;
          margin: 0 auto 32px;
          padding: 0 16px;
        }

        .route-search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #1a1a1e;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #262626;
        }

        @media (max-width: 640px) {
          .route-search-grid {
            grid-template-columns: 1fr;
          }
        }

        .search-field {
          display: flex;
          flex-direction: column;
        }

        .search-label {
          font-size: 14px;
          font-weight: 600;
          color: #888;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .route-search-input {
          padding: 12px 16px;
          background: #0f0f12;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 15px;
          transition: all 0.2s;
        }

        .route-search-input:focus {
          outline: none;
          border-color: #14b8a6;
          background: #1a1a1e;
        }

        .route-search-input::placeholder {
          color: #555;
        }

        .empty-state {
          max-width: 600px;
          margin: 60px auto;
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #666;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default Routes;
