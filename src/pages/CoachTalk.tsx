import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import type { Id } from '../convex/_generated/dataModel';

interface Community {
    _id: Id<"communities">;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    members_count: number;
    posts_count: number;
    created_at: number;
}

const CoachTalk: React.FC = () => {
    const { user } = useAppStore();
    const navigate = useNavigate();
    const [showCreate, setShowCreate] = useState(false);
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '' });

    const communities = useQuery(api.queries.getCommunities as any) as Community[] | undefined;
    const memberships = useQuery(
        api.queries.getUserCommunityMemberships as any,
        user?.id ? { user_id: user.id } : "skip"
    ) as Id<"communities">[] | undefined;
    const createCommunity = useMutation(api.mutations.createCommunity as any);
    const joinCommunity = useMutation(api.mutations.joinCommunity as any);
    const leaveCommunity = useMutation(api.mutations.leaveCommunity as any);

    const handleCreate = async () => {
        if (!user?.id || !newCommunity.name) return;

        const slug = newCommunity.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const result = await createCommunity({
            name: newCommunity.name,
            slug,
            description: newCommunity.description,
            icon: '💬',
            created_by: user.id,
        });

        setNewCommunity({ name: '', description: '' });
        setShowCreate(false);

        if (result?.slug) {
            navigate(`/coach-talk/${result.slug}`);
        }
    };

    const handleJoin = async (communityId: Id<"communities">) => {
        if (!user?.id) return;
        await joinCommunity({ community_id: communityId, user_id: user.id });
    };

    const handleLeave = async (communityId: Id<"communities">) => {
        if (!user?.id) return;
        await leaveCommunity({ community_id: communityId, user_id: user.id });
    };



    return (
        <div className="coach-talk-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>🗣️ Coach Talk</h1>
                    <p>Join communities and discuss everything buses</p>
                </div>
                {user && (
                    <button className="create-btn" onClick={() => setShowCreate(true)}>
                        + Create Community
                    </button>
                )}
            </header>

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create Community</h2>
                        <input
                            type="text"
                            placeholder="Community Name"
                            value={newCommunity.name}
                            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                        />
                        <textarea
                            placeholder="Description (what's this community about?)"
                            value={newCommunity.description}
                            onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button className="submit-btn" onClick={handleCreate}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Communities Grid */}
            <section className="communities-section">
                <h2>🔥 Popular Communities</h2>
                <div className="communities-grid">
                    {/* Show from database */}
                    {communities && communities.length > 0 ? (
                        communities.map((c) => (
                            <div key={c._id} className="community-card">
                                <Link to={`/coach-talk/${c.slug}`} className="community-icon">
                                    {c.icon || '💬'}
                                </Link>
                                <div className="community-info">
                                    <Link to={`/coach-talk/${c.slug}`} className="community-link">
                                        <h3>{c.name}</h3>
                                    </Link>
                                    <p>{c.description}</p>
                                    <span className="members">{c.members_count} members • {c.posts_count} posts</span>
                                </div>
                                {user ? (
                                    memberships?.includes(c._id) ? (
                                        <button className="join-btn joined" onClick={() => handleLeave(c._id)}>Joined</button>
                                    ) : (
                                        <button className="join-btn" onClick={() => handleJoin(c._id)}>Join</button>
                                    )
                                ) : (
                                    <Link to={`/coach-talk/${c.slug}`} className="join-btn view-btn">View</Link>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <h3>No communities yet</h3>
                            <p>Be the first to create a community!</p>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
        .coach-talk-page {
          min-height: 100vh;
          background: #0a0a0c;
          color: #f5f5f7;
          padding-bottom: 100px;
        }

        .page-header {
          padding: 32px 24px;
          background: linear-gradient(180deg, #1a1a1e 0%, #0a0a0c 100%);
          border-bottom: 1px solid #262626;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 700;
        }

        .page-header p {
          color: #71717a;
          margin-top: 4px;
        }

        .create-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          border-radius: 8px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .create-btn:hover {
          transform: translateY(-2px);
        }

        .communities-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .communities-section h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .communities-grid {
          display: grid;
          gap: 16px;
        }

        .community-card {
          background: #1a1a1e;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .community-card:hover {
          border-color: #333;
          background: #1f1f23;
        }

        .community-icon {
          width: 48px;
          height: 48px;
          background: #262626;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          text-decoration: none;
          color: inherit;
        }

        .community-link {
          text-decoration: none;
          color: inherit;
        }

        .community-info {
          flex: 1;
          min-width: 0;
        }

        .community-info h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .community-info p {
          color: #71717a;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .members {
          font-size: 12px;
          color: #52525b;
        }

        .join-btn {
          padding: 8px 20px;
          background: transparent;
          border: 1px solid #f59e0b;
          color: #f59e0b;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .join-btn.joined {
          background: #f59e0b;
          color: #000;
        }

        .join-btn.view-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .join-btn:hover {
          background: #f59e0b;
          color: #000;
        }

        .community-card.suggested .join-btn {
          border-color: #333;
          color: #666;
          cursor: default;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }

        .modal-content {
          background: #1a1a1e;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 450px;
        }

        .modal-content h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .modal-content input,
        .modal-content textarea {
          width: 100%;
          padding: 12px;
          background: #0a0a0c;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .modal-content textarea {
          min-height: 100px;
          resize: vertical;
        }

        .modal-content input:focus,
        .modal-content textarea:focus {
          outline: none;
          border-color: #f59e0b;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: #333;
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
        }

        .submit-btn {
          padding: 10px 20px;
          background: #f59e0b;
          border: none;
          border-radius: 8px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </div>
    );
};

export default CoachTalk;
