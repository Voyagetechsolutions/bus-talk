import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import { getIsoWeek, getNextSaturdayLabel } from '../utils/date';
import { getAnonymousId } from '../utils/anonymousId';

const Vote: React.FC = () => {
  const { user } = useAppStore();
  const castVote = useMutation(api.mutations.castVote as any);
  const { week, year } = getIsoWeek(new Date());
  const voterId = user?.id || getAnonymousId();

  const busNominees = useQuery(api.queries.getTopNominees as any, {
    category: 'bus_of_week',
    year,
    week,
    limit: 5,
  }) as any[] | undefined;
  const companyNominees = useQuery(api.queries.getTopNominees as any, {
    category: 'company_of_week',
    year,
    week,
    limit: 5,
  }) as any[] | undefined;
  const driverNominees = useQuery(api.queries.getTopNominees as any, {
    category: 'driver_of_week',
    year,
    week,
    limit: 5,
  }) as any[] | undefined;

  const busVoteSummary = useQuery(api.queries.getVoteSummary as any, {
    category: 'bus_of_week',
    year,
    week,
    user_id: voterId,
  });
  const companyVoteSummary = useQuery(api.queries.getVoteSummary as any, {
    category: 'company_of_week',
    year,
    week,
    user_id: voterId,
  });
  const driverVoteSummary = useQuery(api.queries.getVoteSummary as any, {
    category: 'driver_of_week',
    year,
    week,
    user_id: voterId,
  });

  const loading = busNominees === undefined || companyNominees === undefined || driverNominees === undefined;

  const handleVote = async (nomineeId: string, category: string, userVote: string | null) => {
    if (userVote) return;
    await castVote({
      user_id: voterId,
      category,
      nominee_id: nomineeId,
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

  const buildList = (items: any[] | undefined, summary: any) => {
    const votesByNominee = summary?.votesByNominee ?? {};
    const userVote = summary?.userVote ?? null;
    const list = (items || []).map((item: any) => {
      const voteData = votesByNominee[item._id] || { total: 0, weighted: 0 };
      return {
        ...item,
        votes: voteData.total,
        weightedVotes: voteData.weighted,
        hasVoted: item._id === userVote,
      };
    });
    const maxVotes = Math.max(...list.map((i: any) => i.weightedVotes), 1);
    return { list, maxVotes, userVote };
  };

  const busesWithVotes = buildList(busNominees, busVoteSummary);
  const companiesWithVotes = buildList(companyNominees, companyVoteSummary);
  const driversWithVotes = buildList(driverNominees, driverVoteSummary);
  const closingLabel = getNextSaturdayLabel(new Date());

  return (
    <div className="editorial-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Weekly Voting</h1>
            <p className="page-subtitle">Vote for the top 5 nominees in each category</p>
          </div>
          <div className="vote-timer">
            <span className="timer-label">Voting closes in</span>
            <span className="timer-value">{closingLabel}</span>
          </div>
        </div>
      </header>

      {/* Top 5 Buses */}
      <section className="vote-nominees">
        <h2 className="section-label">Top 5 Buses</h2>
        {busesWithVotes.list.map((bus, index) => {
          const percentage = (bus.weightedVotes / busesWithVotes.maxVotes) * 100;

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
                    onClick={() => handleVote(bus._id, 'bus_of_week', busesWithVotes.userVote)}
                    disabled={!!busesWithVotes.userVote}
                    className={`vote-btn ${busesWithVotes.userVote ? 'disabled' : ''}`}
                  >
                    Vote
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Top 5 Companies */}
      <section className="vote-nominees">
        <h2 className="section-label">Top 5 Companies</h2>
        {companiesWithVotes.list.map((company, index) => {
          const percentage = (company.weightedVotes / companiesWithVotes.maxVotes) * 100;

          return (
            <article key={company._id} className="nominee-card">
              <div className="nominee-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              <div className="nominee-info">
                <div className="nominee-header">
                  <h3 className="nominee-name">{company.name}</h3>
                  <span className="nominee-rating">⭐ {company.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
                <p className="nominee-route">{company.buses_count || 0} buses</p>

                <div className="vote-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="vote-count">
                    {company.votes} votes • {company.weightedVotes} weighted
                  </span>
                </div>
              </div>

              <div className="nominee-action">
                {company.hasVoted ? (
                  <span className="voted-badge">✓ Voted</span>
                ) : (
                  <button
                    onClick={() => handleVote(company._id, 'company_of_week', companiesWithVotes.userVote)}
                    disabled={!!companiesWithVotes.userVote}
                    className={`vote-btn ${companiesWithVotes.userVote ? 'disabled' : ''}`}
                  >
                    Vote
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Top 5 Drivers */}
      <section className="vote-nominees">
        <h2 className="section-label">Top 5 Drivers</h2>
        {driversWithVotes.list.map((driver, index) => {
          const percentage = (driver.weightedVotes / driversWithVotes.maxVotes) * 100;

          return (
            <article key={driver._id} className="nominee-card">
              <div className="nominee-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              <div className="nominee-info">
                <div className="nominee-header">
                  <h3 className="nominee-name">{driver.name}</h3>
                  <span className="nominee-rating">⭐ {driver.rating_avg?.toFixed(1) || '0.0'}</span>
                </div>
                <p className="nominee-route">{driver.company?.name || 'Independent'}</p>

                <div className="vote-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="vote-count">
                    {driver.votes} votes • {driver.weightedVotes} weighted
                  </span>
                </div>
              </div>

              <div className="nominee-action">
                {driver.hasVoted ? (
                  <span className="voted-badge">✓ Voted</span>
                ) : (
                  <button
                    onClick={() => handleVote(driver._id, 'driver_of_week', driversWithVotes.userVote)}
                    disabled={!!driversWithVotes.userVote}
                    className={`vote-btn ${driversWithVotes.userVote ? 'disabled' : ''}`}
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
          <div className="rule">• One vote per category per week</div>
          <div className="rule">• Spotter votes carry more weight</div>
          <div className="rule">• Only top 5 nominees shown</div>
          <div className="rule">• Results revealed every Saturday</div>
        </div>
      </section>

      <div className="signin-prompt">
        <p>Voting is open to everyone. Sign in for weighted votes and spotter perks.</p>
      </div>
    </div>
  );
};

export default Vote;
