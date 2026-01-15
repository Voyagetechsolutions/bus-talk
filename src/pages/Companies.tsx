import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { getAnonymousId } from '../utils/anonymousId';
import { getIsoWeek } from '../utils/date';

const Companies: React.FC = () => {
  const { user } = useAppStore();
  const companies = useQuery(api.queries.getCompanies as any);
  const castVote = useMutation(api.mutations.castVote as any);
  const voterId = user?.id || getAnonymousId();
  const { week, year } = getIsoWeek(new Date());
  const voteSummary = useQuery(api.queries.getVoteSummary as any, {
    category: 'company_of_week',
    year,
    week,
    user_id: voterId,
  });
  const userVote = voteSummary?.userVote ?? null;
  const loading = companies === undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedCompanies = [...(companies || [])].sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  const featuredCompanies = sortedCompanies.slice(0, 3);
  const restCompanies = sortedCompanies.slice(3);

  const handleNominate = async (companyId: string) => {
    if (userVote) return;
    await castVote({
      user_id: voterId,
      category: 'company_of_week',
      nominee_id: companyId,
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
            <h1 className="page-title">Bus Companies</h1>
            <p className="page-subtitle">South Africa's leading transport operators</p>
          </div>
        </div>
      </header>

      {/* Featured */}
      <section className="featured-section">
        <h2 className="section-label">Top Rated</h2>
        <div className="featured-grid-3">
          {featuredCompanies.map((company, index) => (
            <article key={company._id} className={`featured-card ${index === 0 ? 'featured-primary' : ''}`}>
              <div className="featured-rank">{index + 1}</div>
              <div className="featured-avatar">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} />
                ) : (
                  company.name[0]
                )}
              </div>
              <h3 className="featured-name">{company.name}</h3>
              <div className="featured-stats">
                <span className="rating">⭐ {company.rating_avg?.toFixed(1) || '0.0'}</span>
                <span className="divider">•</span>
                <span>{company.buses_count || 0} buses</span>
                <span className="divider">•</span>
                <span>{company.routes_count || 0} routes</span>
              </div>
              <div className="bus-actions">
                <button
                  className={`action-link ${userVote ? 'opacity-60' : ''}`}
                  onClick={() => handleNominate(company._id)}
                  disabled={!!userVote}
                >
                  {userVote === company._id ? 'Nominated' : 'Nominate'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* All Companies Table */}
      {restCompanies.length > 0 && (
        <section className="list-section">
          <h2 className="section-label">All Companies</h2>
          <div className="data-table">
            <div className="table-header">
              <span>#</span>
              <span>Company</span>
              <span>Buses</span>
              <span>Routes</span>
              <span>Rating</span>
            </div>
            {restCompanies.map((company, index) => (
              <div key={company._id} className="table-row">
                <span className="col-rank">{index + 4}</span>
                <span className="col-name">
                  <div className="row-avatar">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} />
                    ) : (
                      company.name[0]
                    )}
                  </div>
                  <span className="row-title">{company.name}</span>
                </span>
                <span className="col-stat">{company.buses_count || 0}</span>
                <span className="col-stat">{company.routes_count || 0}</span>
                <span className="col-stat highlight">⭐ {company.rating_avg?.toFixed(1) || '0.0'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Companies;
