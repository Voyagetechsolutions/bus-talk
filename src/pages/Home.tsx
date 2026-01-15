import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';
import type { Id } from '../convex/_generated/dataModel';
import { useAppStore } from '../hooks/useStore';
import FeedPost, { FeedPostSkeleton } from '../components/FeedPost';
import CommentSection from '../components/CommentSection';
import { prefetchUsers } from '../utils/userCache';
import { getIsoWeek } from '../utils/date';
import '../styles/feed.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);

  const feedData = useQuery(api.queries.getPostsFeed as any, { limit: 20 });
  const loading = feedData === undefined;
  const posts = feedData?.posts || [];
  const currentUserId = user?.id;

  const { week, year } = getIsoWeek(new Date());
  const busOfWeek = useQuery(api.queries.getTopNominees as any, {
    category: 'bus_of_week',
    year,
    week,
    limit: 1,
  });
  const winner = busOfWeek?.[0];

  // Prefetch user data for all posts
  useEffect(() => {
    if (posts.length > 0) {
      const userIds = Array.from(new Set(posts.map((p: any) => p.user_id))) as string[];
      prefetchUsers(userIds);
    }
  }, [posts]);

  return (
    <div className="home-page">
      {/* Hero Header */}
      <header className="blog-header">
        <div className="blog-header-content">
          <span className="blog-tag">SOUTH AFRICA'S TRANSPORT CULTURE</span>
          <h1 className="blog-title">Bus Talk</h1>
          <p className="blog-subtitle">
            Your source for bus news, sightings, and community discussions
          </p>
        </div>
        <div className="blog-actions">
          <button className="blog-cta secondary" onClick={() => navigate('/posts')}>
            📰 Spotter News
          </button>
        </div>
      </header>

      {/* Bus of the Week Banner */}
      {winner && (
        <section className="bus-of-week-banner">
          <div className="banner-badge">🏆 BUS OF THE WEEK</div>
          <div className="banner-content">
            <div className="banner-photo">
              {winner.photos?.[0] ? (
                <img src={winner.photos[0]} alt={winner.fleet_number} />
              ) : (
                <div className="banner-photo-placeholder">🚌</div>
              )}
            </div>
            <div className="banner-info">
              <h2 className="banner-title">{winner.company?.name} {winner.fleet_number}</h2>
              <div className="banner-stats">
                <span>⭐ {winner.rating_avg?.toFixed(1) || '0.0'}</span>
                <span>•</span>
                <span>🗳️ {winner.votes} votes</span>
              </div>
              <p className="banner-route">{winner.route} | {winner.type || 'Standard'}</p>
              <div className="banner-actions">
                <button className="banner-btn primary" onClick={() => navigate('/buses')}>
                  View Profile
                </button>
                <button className="banner-btn secondary" onClick={() => navigate('/vote')}>
                  Vote Next Week
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Explore Section */}
      <section className="blog-section">
        <div className="section-header">
          <h2>Explore</h2>
        </div>
        <div className="explore-grid">
          <button className="explore-card" onClick={() => navigate('/routes')}>
            <span className="explore-icon">🗺️</span>
            <h3>Routes</h3>
            <p>Find best service by route</p>
          </button>
          <button className="explore-card" onClick={() => navigate('/buses')}>
            <span className="explore-icon">🚌</span>
            <h3>Buses</h3>
            <p>Browse fleet ratings</p>
          </button>
          <button className="explore-card" onClick={() => navigate('/companies')}>
            <span className="explore-icon">🏢</span>
            <h3>Companies</h3>
            <p>Compare operators</p>
          </button>
          <button className="explore-card" onClick={() => navigate('/drivers')}>
            <span className="explore-icon">👨‍✈️</span>
            <h3>Drivers</h3>
            <p>Top rated drivers</p>
          </button>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="blog-section">
        <div className="section-header">
          <h2>Latest Posts</h2>
          <span className="section-count">{posts.length} articles</span>
        </div>
      </section>

      {/* Feed */}
      <main className="blog-feed">
        {loading ? (
          <>
            <FeedPostSkeleton />
            <FeedPostSkeleton />
            <FeedPostSkeleton />
          </>
        ) : posts.length > 0 ? (
          posts.map((post: any, index: number) => (
            <FeedPost
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onCommentClick={(postId) => setSelectedPostId(postId)}
              featured={index === 0}
            />
          ))
        ) : (
          <div className="feed-empty">
            <div className="feed-empty-icon">🚌</div>
            <h3>No Posts Yet</h3>
            <p>Be the first to share a bus sighting or news update!</p>
          </div>
        )}
      </main>

      {/* Comment Section Modal */}
      {selectedPostId && (
        <CommentSection
          postId={selectedPostId}
          currentUserId={currentUserId as any}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}

      <style>{`
        .home-page {
          min-height: 100vh;
          background-color: #0a0a0c;
          color: #f5f5f7;
        }

        .blog-header {
          text-align: center;
          padding: 48px 24px;
          background: linear-gradient(180deg, #1a1a1e 0%, #0a0a0c 100%);
          border-bottom: 1px solid #262626;
        }

        .blog-header-content {
          max-width: 600px;
          margin: 0 auto 24px;
        }

        .blog-tag {
          display: inline-block;
          color: #f59e0b;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .blog-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 12px;
          font-family: 'Georgia', serif;
        }

        @media (max-width: 640px) {
          .blog-title {
            font-size: 36px;
          }
        }

        .blog-subtitle {
          font-size: 18px;
          color: #71717a;
          line-height: 1.5;
        }

        .blog-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .blog-cta {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .blog-cta.primary {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
        }

        .blog-cta.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .blog-cta.secondary {
          background: #1f1f23;
          color: #f5f5f7;
          border: 1px solid #333;
        }

        .blog-cta.secondary:hover {
          background: #2a2a2e;
        }

        .blog-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .section-count {
          color: #71717a;
          font-size: 14px;
        }

        .bus-of-week-banner {
          max-width: 900px;
          margin: 0 auto 32px;
          padding: 0 16px;
        }

        .banner-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .banner-content {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          background: linear-gradient(135deg, #1a1a1e 0%, #0f0f12 100%);
          border: 1px solid #f59e0b;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2);
        }

        @media (max-width: 640px) {
          .banner-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        .banner-photo {
          width: 200px;
          height: 150px;
          border-radius: 12px;
          overflow: hidden;
          background: #0a0a0c;
        }

        @media (max-width: 640px) {
          .banner-photo {
            width: 100%;
            height: 200px;
            margin: 0 auto;
          }
        }

        .banner-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .banner-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .banner-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .banner-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #888;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .banner-stats {
            justify-content: center;
          }
        }

        .banner-route {
          font-size: 14px;
          color: #aaa;
          margin-bottom: 16px;
        }

        .banner-actions {
          display: flex;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .banner-actions {
            justify-content: center;
          }
        }

        .banner-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .banner-btn.primary {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
        }

        .banner-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .banner-btn.secondary {
          background: #1f1f23;
          color: #f5f5f7;
          border: 1px solid #333;
        }

        .banner-btn.secondary:hover {
          background: #2a2a2e;
        }

        .explore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .explore-card {
          background: #1a1a1e;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .explore-card:hover {
          border-color: #f59e0b;
          transform: translateY(-2px);
        }

        .explore-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 12px;
        }

        .explore-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .explore-card p {
          font-size: 13px;
          color: #71717a;
        }
      `}</style>
    </div>
  );
};

export default Home;