import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/api';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import type { Id } from '../../convex/_generated/dataModel';

interface Post {
    _id: Id<"posts">;
    user_id: string;
    type: 'news' | 'sighting';
    title: string;
    content: string;
    media: { url: string; type: string }[];
    likes_count: number;
    comments_count: number;
    created_at: number;
}

const AdminPosts: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'news' | 'sighting'>('all');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const postsData = useQuery(api.queries.getPostsFeed as any, { limit: 100 });
    const posts = (postsData?.posts || []) as Post[];

    const filteredPosts = filter === 'all'
        ? posts
        : posts.filter(p => p.type === filter);

    const newsCount = posts.filter(p => p.type === 'news').length;
    const sightingsCount = posts.filter(p => p.type === 'sighting').length;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (postId: string) => {
        // Note: Would need to add deletePost mutation
        console.log('Delete post:', postId);
        setConfirmDelete(null);
    };

    return (
        <AdminLayout
            title="Posts"
            subtitle="Manage all posts and sightings"
        >
            {/* Stats */}
            <div className="stats-grid">
                <StatsCard icon="📝" value={posts.length} label="Total Posts" />
                <StatsCard icon="📰" value={newsCount} label="News Posts" />
                <StatsCard icon="📸" value={sightingsCount} label="Sightings" />
            </div>

            {/* Filter Tabs */}
            <div className="filter-bar">
                <div className="filter-tabs">
                    {(['all', 'news', 'sighting'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                        >
                            {f === 'all' ? 'All Posts' : f === 'news' ? '📰 News' : '📸 Sightings'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Table */}
            <div className="posts-table">
                {filteredPosts.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Media</th>
                                <th>Likes</th>
                                <th>Comments</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post) => (
                                <tr key={post._id}>
                                    <td>
                                        <span className={`post-type-badge ${post.type}`}>
                                            {post.type === 'news' ? '📰' : '📸'}
                                        </span>
                                    </td>
                                    <td className="post-title-cell">
                                        <span className="post-title">{post.title}</span>
                                        {post.content && (
                                            <span className="post-excerpt">{post.content.slice(0, 50)}...</span>
                                        )}
                                    </td>
                                    <td>{post.media.length > 0 ? `${post.media.length} files` : '-'}</td>
                                    <td>{post.likes_count}</td>
                                    <td>{post.comments_count}</td>
                                    <td className="date-cell">{formatDate(post.created_at)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon view"
                                                title="View"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                title="Delete"
                                                onClick={() => setConfirmDelete(post._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>No posts found</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="confirm-modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Post?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .filter-bar {
          margin-bottom: 20px;
        }
        
        .filter-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .filter-tab {
          padding: 8px 16px;
          background: #1f1f23;
          border: 1px solid #333;
          border-radius: 6px;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-tab:hover {
          background: #2a2a2e;
          color: #fff;
        }
        
        .filter-tab.active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #000;
        }
        
        .posts-table {
          background: #1a1a1e;
          border: 1px solid #262626;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .posts-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .posts-table th {
          text-align: left;
          padding: 12px 16px;
          background: #0f0f12;
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #262626;
        }
        
        .posts-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #1f1f23;
          color: #ddd;
          font-size: 14px;
        }
        
        .posts-table tr:hover {
          background: rgba(255,255,255,0.02);
        }
        
        .post-type-badge {
          font-size: 18px;
        }
        
        .post-title-cell {
          max-width: 300px;
        }
        
        .post-title {
          display: block;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .post-excerpt {
          display: block;
          color: #666;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .date-cell {
          white-space: nowrap;
          color: #666;
          font-size: 13px;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .btn-icon.view {
          background: #1f1f23;
        }
        
        .btn-icon.view:hover {
          background: #3b82f6;
        }
        
        .btn-icon.delete {
          background: #1f1f23;
        }
        
        .btn-icon.delete:hover {
          background: #ef4444;
        }
        
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #666;
        }
        
        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }
        
        .confirm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .confirm-modal {
          background: #1a1a1e;
          padding: 24px;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
        }
        
        .confirm-modal h3 {
          color: #fff;
          margin-bottom: 8px;
        }
        
        .confirm-modal p {
          color: #888;
          margin-bottom: 20px;
        }
        
        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .btn-secondary {
          padding: 8px 16px;
          background: #333;
          border: none;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
        }
        
        .btn-danger {
          padding: 8px 16px;
          background: #ef4444;
          border: none;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .posts-table {
            overflow-x: auto;
          }
          
          .posts-table table {
            min-width: 600px;
          }
        }
      `}</style>
        </AdminLayout>
    );
};

export default AdminPosts;
