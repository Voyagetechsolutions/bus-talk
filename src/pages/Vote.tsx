import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { getIsoWeek, getNextSaturdayLabel } from '../utils/date';

const Vote: React.FC = () => {
  const { user } = useAppStore();
  const buses = useQuery(api.queries.getTopBuses as any, { limit: 5 });
  const castVote = useMutation(api.mutations.castVote as any);
  const { week, year } = getIsoWeek(new Date());
  const voteSummary = useQuery(api.queries.getBusVoteSummary as any, {
    category: 'bus_of_week',
    year,
    week,
    user_id: user?.id,
  });
  const userVote = voteSummary?.userVote ?? null;

  const loading = buses === undefined;

  const handleVote = async (busId: string) => {
    if (!user || userVote) return;
    await castVote({
      user_id: user.id,
      category: 'bus_of_week',
      nominee_id: busId,
      year,
      week,
      role: user.role,
      spotter_status: user.spotter_status,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const votesByNominee = voteSummary?.votesByNominee ?? {};
  const busesWithVotes = buses?.map((bus: any) => {
    const voteData = votesByNominee[bus._id] || { total: 0, weighted: 0 };
    return {
      ...bus,
      votes: voteData.total,
      weightedVotes: voteData.weighted,
      hasVoted: bus._id === userVote,
    };
  }) || [];

  const maxVotes = Math.max(...busesWithVotes.map((b: any) => b.weightedVotes), 1);
  const closingLabel = getNextSaturdayLabel(new Date());

  return (
    <div className="editorial-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Bus of the Week</h1>
            <p className="page-subtitle">Cast your vote for this week's top performer</p>
          </div>
          <div className="vote-timer">
            <span className="timer-label">Voting closes in</span>
            <span className="timer-value">{closingLabel}</span>
          </div>
        </div>
      </header>

      {/* Nominees */}
      <section className="vote-nominees">
        {busesWithVotes.map((bus, index) => {
          const percentage = (bus.weightedVotes / maxVotes) * 100;

          return (
            <article key={bus._id} className="nominee-card">
              <div className="nominee-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              <div className="nominee-info">
                <div className="nominee-header">
                  <h3 className="nominee-name">{bus.company?.name} — {bus.fleet_number}</h3>
                  <span className="nominee-rating">⭐ {bus.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
                <p className="nominee-route">{bus.route}</p>

                <div className="vote-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="vote-count">
                    {bus.votes} votes • {bus.weightedVotes} weighted
                  </span>
                </div>
              </div>

              <div className="nominee-action">
                {bus.hasVoted ? (
                  <span className="voted-badge">✓ Voted</span>
                ) : (
                  <button
                    onClick={() => handleVote(bus._id)}
                    disabled={!user || !!userVote}
                    className={`vote-btn ${!user || userVote ? 'disabled' : ''}`}
                  >
                    Vote
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* How Voting Works */}
      <section className="voting-rules">
        <h3 className="rules-title">How voting works</h3>
        <div className="rules-grid">
          <div className="rule">• One vote per user per week</div>
          <div className="rule">• Spotter votes carry more weight</div>
          <div className="rule">• System activity is factored in</div>
          <div className="rule">• Results revealed every Saturday</div>
        </div>
      </section>

      {!user && (
        <div className="signin-prompt">
          <p>Sign in to vote for your favorite bus</p>
        </div>
      )}
    </div>
  );
};

export default Vote;
