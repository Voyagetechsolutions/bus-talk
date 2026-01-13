import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';
import type { Id } from '../convex/_generated/dataModel';
import { useAppStore } from '../hooks/useStore';
import FeedPost from '../components/FeedPost';
import CommentSection from '../components/CommentSection';

const Posts: React.FC = () => {
  const { user } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);

  const feedData = useQuery(api.queries.getPostsFeed as any, { limit: 20 });
  const loading = feedData === undefined;

  const posts = feedData?.posts?.filter((p: any) => {
    if (filter === 'boosted') return p.boosts_count > 0;
    if (filter === 'recent') return p.created_at > Date.now() - 86400000;
    return true;
  }).filter((p: any) => p.type === 'news') || [];

  const featuredPost = posts[0];
  const restPosts = posts.slice(1);
  const currentUserId = user?.id as Id<"users"> | undefined;

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
            <h1 className="page-title">Spotter News</h1>
            <p className="page-subtitle">Updates and stories from verified spotters</p>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'boosted', 'recent'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
          >
            {f === 'all' ? 'All Posts' : f === 'boosted' ? '🚀 Boosted' : '🕐 Recent'}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <section className="featured-post">
          <FeedPost
            post={featuredPost}
            currentUserId={currentUserId}
            onCommentClick={(postId) => setSelectedPostId(postId)}
          />
        </section>
      )}

      {/* Posts List */}
      {restPosts.length > 0 && (
        <section className="posts-list-section">
          {restPosts.map((post) => (
            <FeedPost
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onCommentClick={(postId) => setSelectedPostId(postId)}
            />
          ))}
        </section>
      )}

      {posts.length === 0 && (
        <div className="empty-state">
          <h3>No Posts Yet</h3>
          <p>News posts from verified spotters will appear here.</p>
        </div>
      )}

      {selectedPostId && (
        <CommentSection
          postId={selectedPostId}
          currentUserId={currentUserId}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
};

export default Posts;