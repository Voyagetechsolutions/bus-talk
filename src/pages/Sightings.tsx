import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';
import type { Id } from '../convex/_generated/dataModel';
import { useAppStore } from '../hooks/useStore';
import FeedPost, { FeedPostSkeleton } from '../components/FeedPost';
import CommentSection from '../components/CommentSection';
import { prefetchUsers } from '../utils/userCache';
import '../styles/feed.css';

const Sightings: React.FC = () => {
  const { user } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);

  const feedData = useQuery(api.queries.getPostsFeed as any, { limit: 30 });
  const loading = feedData === undefined;

  // Filter for sightings only
  const sightings = (feedData?.posts || [])
    .filter((p: any) => p.type === 'sighting')
    .filter((p: any) => {
      if (filter === 'photos') return p.media.length > 0;
      if (filter === 'recent') return p.created_at > Date.now() - 86400000;
      return true;
    });

  const currentUserId = user?.id;

  // Prefetch user data
  useEffect(() => {
    if (sightings.length > 0) {
      const userIds = Array.from(new Set(sightings.map((p: any) => p.user_id))) as string[];
      prefetchUsers(userIds);
    }
  }, [sightings]);

  return (
    <div className="sightings-page">
      {/* Header */}
      <header className="sightings-header">
        <h1>Bus Sightings</h1>
        <p>Community sightings and photos from across South Africa</p>
      </header>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {[
            { id: 'all', label: 'All Sightings' },
            { id: 'photos', label: 'With Photos' },
            { id: 'recent', label: 'Today' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-tab ${filter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="results-count">{sightings.length} results</span>
      </div>

      {/* Feed */}
      <main className="blog-feed">
        {loading ? (
          <>
            <FeedPostSkeleton />
            <FeedPostSkeleton />
            <FeedPostSkeleton />
          </>
        ) : sightings.length > 0 ? (
          sightings.map((sighting: any) => (
            <FeedPost
              key={sighting._id}
              post={sighting}
              currentUserId={currentUserId}
              onCommentClick={(postId) => setSelectedPostId(postId)}
            />
          ))
        ) : (
          <div className="feed-empty">
            <div className="feed-empty-icon">📷</div>
            <h3>No Sightings Found</h3>
            <p>Try a different filter or be the first to post!</p>
          </div>
        )}
      </main>

      {/* Comment Modal */}
      {selectedPostId && (
        <CommentSection
          postId={selectedPostId}
          currentUserId={currentUserId as any}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}

      <style>{`
        .sightings-page {
          min-height: 100vh;
          background-color: #0a0a0c;
          color: #f5f5f7;
          padding-bottom: 100px;
        }

        .sightings-header {
          text-align: center;
          padding: 40px 24px 24px;
          border-bottom: 1px solid #262626;
        }

        .sightings-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .sightings-header p {
          color: #71717a;
          font-size: 16px;
        }

        .filter-bar {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab {
          padding: 8px 16px;
          background: #1a1a1e;
          border: 1px solid #262626;
          border-radius: 6px;
          color: #a1a1aa;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          background: #222;
          color: #f5f5f7;
        }

        .filter-tab.active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #000;
          font-weight: 600;
        }

        .results-count {
          color: #71717a;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default Sightings;