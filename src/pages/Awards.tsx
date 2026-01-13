import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';

const Awards: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rankings');

  const buses = useQuery(api.queries.getBuses as any, { limit: 10 });
  const drivers = useQuery(api.queries.getDrivers as any);
  const companies = useQuery(api.queries.getCompanies as any);

  const loading = buses === undefined || drivers === undefined || companies === undefined;

  const tabs = [
    { id: 'rankings', label: 'Live Rankings' },
    { id: 'monthly', label: 'Monthly Awards' },
    { id: 'hall', label: 'Hall of Fame' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedBuses = [...(buses || [])].sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0)).slice(0, 10);
  const sortedDrivers = [...(drivers || [])].sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0)).slice(0, 10);
  const sortedCompanies = [...(companies || [])].sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0)).slice(0, 10);

  return (
    <div className="editorial-page">
      <header className="page-header centered">
        <h1 className="page-title">Awards & Rankings</h1>
        <p className="page-subtitle">Celebrating excellence in South African transport</p>
      </header>

      {/* Tabs */}
      <div className="awards-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`awards-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <div className="rankings-content">
          {/* Buses Rankings */}
          <section className="ranking-section">
            <h3 className="ranking-category">🚌 Top Buses</h3>
            <div className="ranking-list">
              {sortedBuses.map((bus, index) => (
                <div key={bus._id} className="ranking-row">
                  <span className="rank">{index + 1}</span>
                  <span className="name">{bus.fleet_number}</span>
                  <span className="detail">{bus.company?.name}</span>
                  <span className="score">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Drivers Rankings */}
          <section className="ranking-section">
            <h3 className="ranking-category">👨‍✈️ Top Drivers</h3>
            <div className="ranking-list">
              {sortedDrivers.map((driver, index) => (
                <div key={driver._id} className="ranking-row">
                  <span className="rank">{index + 1}</span>
                  <span className="name">{driver.name}</span>
                  <span className="detail">{driver.company?.name}</span>
                  <span className="score">⭐ {driver.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Companies Rankings */}
          <section className="ranking-section">
            <h3 className="ranking-category">🏢 Top Companies</h3>
            <div className="ranking-list">
              {sortedCompanies.map((company, index) => (
                <div key={company._id} className="ranking-row">
                  <span className="rank">{index + 1}</span>
                  <span className="name">{company.name}</span>
                  <span className="detail">{company.buses_count || 0} buses</span>
                  <span className="score">⭐ {company.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Monthly Awards Tab */}
      {activeTab === 'monthly' && (
        <div className="monthly-content">
          <div className="month-header">
            <h2 className="month-title">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="awards-grid">
            {[
              { icon: '🚌', name: 'Best Bus', status: 'pending' },
              { icon: '👨‍✈️', name: 'Best Driver', status: 'pending' },
              { icon: '🏢', name: 'Best Company', status: 'pending' },
              { icon: '📸', name: 'Top Spotter', status: 'pending' },
            ].map((award) => (
              <div key={award.name} className="award-card">
                <span className="award-icon">{award.icon}</span>
                <span className="award-name">{award.name}</span>
                <span className="award-status">Voting in progress</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hall of Fame Tab */}
      {activeTab === 'hall' && (
        <div className="hall-content">
          <div className="hall-placeholder">
            <span className="hall-icon">🏆</span>
            <h3>Hall of Fame</h3>
            <p>Previous winners and legendary achievements coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Awards;