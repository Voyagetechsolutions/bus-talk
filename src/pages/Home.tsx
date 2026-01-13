import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';
import type { Id } from '../convex/_generated/dataModel';
import { useAppStore } from '../hooks/useStore';
import FeedPost, { FeedPostSkeleton } from '../components/FeedPost';
import CommentSection from '../components/CommentSection';
import { prefetchUsers } from '../utils/userCache';
import '../styles/feed.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);

  const feedData = useQuery(api.queries.getPostsFeed as any, { limit: 20 });
  const loading = feedData === undefined;
  const posts = feedData?.posts || [];
  const currentUserId = user?.id;

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
          <button className="blog-cta primary" onClick={() => navigate('/spot-bus')}>
            📷 Post Sighting
          </button>
          <button className="blog-cta secondary" onClick={() => navigate('/posts')}>
            📰 Spotter News
          </button>
        </div>
      </header>

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
            <button className="feed-cta-btn" onClick={() => navigate('/spot-bus')}>
              📸 Post a Sighting
            </button>
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
      `}</style>
    </div>
  );
};

export default Home;