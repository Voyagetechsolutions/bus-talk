import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { getAnonymousId } from '../utils/anonymousId';
import { getIsoWeek } from '../utils/date';

const Companies: React.FC = () => {
  const { user } = useAppStore();
  const companies = useQuery(api.queries.getCompanies as any);
  const castVote = useMutation(api.mutations.castVote as any);
  const rateCompany = useMutation(api.mutations.rateCompany as any);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; company: any | null }>({ isOpen: false, company: null });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
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

  const openRatingModal = (company: any) => {
    setRatingModal({ isOpen: true, company });
    setRating(0);
    setComment('');
  };

  const closeRatingModal = () => {
    setRatingModal({ isOpen: false, company: null });
    setRating(0);
    setComment('');
  };

  const handleRateCompany = async () => {
    if (!ratingModal.company || rating === 0) return;
    
    const userId = user?.id || getAnonymousId();
    
    await rateCompany({
      user_id: userId,
      company_id: ratingModal.company._id,
      rating,
      comment: comment.trim() || undefined,
    });
    
    closeRatingModal();
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

      {/* All Companies Grid */}
      <section className="list-section">
        <h2 className="section-label">All Companies</h2>
        <div className="companies-grid">
          {companies?.map((company) => (
            <div key={company._id} className="company-card">
              <div className="company-logo">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} />
                ) : (
                  <span>{company.name[0]}</span>
                )}
              </div>
              <div className="company-info">
                <h3 className="company-name">{company.name}</h3>
                <div className="company-stats">
                  <span className="rating">⭐ {company.rating_avg?.toFixed(1) || '0.0'}</span>
                  <span>{company.buses_count || 0} buses</span>
                  <span>{company.routes_count || 0} routes</span>
                </div>
              </div>
              <div className="company-actions">
                <button
                  className={`action-btn nominate ${userVote ? 'disabled' : ''}`}
                  onClick={() => handleNominate(company._id)}
                  disabled={!!userVote}
                >
                  {userVote === company._id ? 'Nominated' : 'Nominate'}
                </button>
                <button
                  className="action-btn rate"
                  onClick={() => openRatingModal(company)}
                >
                  Rate Company
                </button>
              </div>
            </div>
          )) || []}
        </div>
      </section>

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="modal-overlay" onClick={closeRatingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rate {ratingModal.company?.name}</h3>
              <button className="modal-close" onClick={closeRatingModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="rating-section">
                <label>Overall Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`star ${star <= rating ? 'active' : ''}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="comment-section">
                <label>Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this company..."
                  maxLength={200}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeRatingModal}>Cancel</button>
              <button 
                className="btn-submit" 
                onClick={handleRateCompany}
                disabled={rating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
