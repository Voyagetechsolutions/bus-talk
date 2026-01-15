import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import CommentSystem from '../components/CommentSystem';
import type { Id } from '../convex/_generated/dataModel';

const CommunityDetail: React.FC = () => {
  const { slug } = useParams();
  const { user } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const community = useQuery(
    api.queries.getCommunity as any,
    slug ? { slug } : "skip"
  ) as { _id: Id<"communities">; name: string; description: string; icon?: string; members_count: number; posts_count: number } | null | undefined;

  const posts = useQuery(
    api.queries.getCommunityPosts as any,
    community?._id ? { community_id: community._id } : "skip"
  ) as Array<{
    _id: Id<"community_posts">;
    title: string;
    content: string;
    user_id: string;
    created_at: number;
    media: Array<{ url: string; type: 'image' | 'video'; storage_id?: string }>;
  }> | undefined;

  const isMember = useQuery(
    api.queries.isCommunityMember as any,
    community?._id && user?.id
      ? { community_id: community._id, user_id: user.id }
      : "skip"
  ) as boolean | undefined;

  const joinCommunity = useMutation(api.mutations.joinCommunity as any);
  const leaveCommunity = useMutation(api.mutations.leaveCommunity as any);
  const createCommunityPost = useMutation(api.mutations.createCommunityPost as any);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl as any);

  const handleJoin = async () => {
    if (!community?._id || !user?.id) return;
    await joinCommunity({ community_id: community._id, user_id: user.id });
  };

  const handleLeave = async () => {
    if (!community?._id || !user?.id) return;
    await leaveCommunity({ community_id: community._id, user_id: user.id });
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: 'image' | 'video'; storage_id?: string }> => {
    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }

    const result = await response.json();
    const storageId = result.storageId;
    const baseUrl = process.env.REACT_APP_CONVEX_URL;
    if (!baseUrl) {
      throw new Error('Missing REACT_APP_CONVEX_URL');
    }

    const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
    return {
      url: `${baseUrl}/getImage?storageId=${storageId}`,
      storage_id: storageId,
      type: mediaType,
    };
  };

  const handleSubmit = async () => {
    if (!community?._id || !user?.id) return;
    if (!title.trim() || !content.trim()) {
      setError('Please add a title and message.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const uploadedMedia: { url: string; type: 'image' | 'video'; storage_id?: string }[] = [];
      for (const file of mediaFiles) {
        const media = await uploadFile(file);
        uploadedMedia.push(media);
      }

      await createCommunityPost({
        community_id: community._id,
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        media: uploadedMedia,
      });

      setTitle('');
      setContent('');
      setMediaFiles([]);
    } catch (err: any) {
      setError(err.message ?? 'Unable to post right now.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setMediaFiles(Array.from(event.target.files));
  };

  if (community === undefined) {
    return (
      <div className="coach-talk-page">
        <div className="community-shell">
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="coach-talk-page">
        <div className="community-shell">
          <p>Community not found.</p>
          <Link to="/coach-talk" className="back-link">Back to Coach Talk</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-talk-page">
      <div className="community-shell">
        <header className="community-header">
          <div className="header-main">
            <Link to="/coach-talk" className="back-link">← Back to Coach Talk</Link>
            <div className="community-title">
              <span className="community-icon">{community.icon || '💬'}</span>
              <div>
                <h1>{community.name}</h1>
                <p>{community.description}</p>
                <span className="meta">
                  {community.members_count} members • {community.posts_count} posts
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            {user ? (
              isMember ? (
                <button className="join-btn joined" onClick={handleLeave}>Joined</button>
              ) : (
                <button className="join-btn" onClick={handleJoin}>Join Community</button>
              )
            ) : (
              <Link to="/profile" className="join-btn view-btn">Sign in to join</Link>
            )}
          </div>
        </header>

        <section className="community-compose">
          {user && isMember ? (
            <>
              <h2>Start a discussion</h2>
              <input
                type="text"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Share your thoughts with the community..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="compose-actions">
                <label className="upload-btn">
                  📷 Add photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <button className="submit-btn" onClick={handleSubmit} disabled={uploading}>
                  {uploading ? 'Posting...' : 'Post'}
                </button>
              </div>
              {mediaFiles.length > 0 && (
                <div className="upload-list">
                  {mediaFiles.map((file) => (
                    <span key={file.name}>{file.name}</span>
                  ))}
                </div>
              )}
              {error && <p className="error-text">{error}</p>}
            </>
          ) : (
            <div className="compose-locked">
              <h2>Join to post</h2>
              <p>Become a member to share photos and start discussions.</p>
            </div>
          )}
        </section>

        <section className="community-posts">
          <h2>Latest posts</h2>
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <article key={post._id} className="post-card">
                <div className="post-header">
                  <div>
                    <h3>{post.title}</h3>
                    <span>Member • {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p>{post.content}</p>
                {post.media?.length > 0 && (
                  <div className="post-media">
                    {post.media.map((media) => (
                      media.type === 'video' ? (
                        <video key={media.url} src={media.url} controls />
                      ) : (
                        <img key={media.url} src={media.url} alt="Community upload" />
                      )
                    ))}
                  </div>
                )}
                <CommentSystem postId={post._id} />
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No posts yet</h3>
              <p>Be the first to start a conversation in this community.</p>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .coach-talk-page {
          min-height: 100vh;
          background: #0a0a0c;
          color: #f5f5f7;
          padding-bottom: 80px;
        }

        .community-shell {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 16px 0;
        }

        .community-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          border-bottom: 1px solid #262626;
          padding-bottom: 20px;
        }

        .header-actions {
          margin-top: 8px;
        }

        .back-link {
          color: #71717a;
          text-decoration: none;
          font-size: 14px;
        }

        .community-title {
          display: flex;
          gap: 16px;
          margin-top: 16px;
        }

        .community-title h1 {
          font-size: 28px;
          margin-bottom: 6px;
        }

        .community-title p {
          color: #a1a1aa;
          margin-bottom: 4px;
        }

        .community-title .meta {
          font-size: 12px;
          color: #71717a;
        }

        .community-icon {
          width: 56px;
          height: 56px;
          background: #262626;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }

        .community-compose {
          background: #1a1a1e;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 20px;
          margin-top: 24px;
        }

        .community-compose h2 {
          margin-bottom: 16px;
          font-size: 18px;
        }

        .community-compose input,
        .community-compose textarea {
          width: 100%;
          padding: 12px;
          background: #0a0a0c;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .community-compose textarea {
          min-height: 120px;
          resize: vertical;
        }

        .compose-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #f59e0b;
          cursor: pointer;
          font-weight: 600;
        }

        .upload-btn input {
          display: none;
        }

        .submit-btn {
          padding: 10px 24px;
          background: #f59e0b;
          border: none;
          border-radius: 8px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
        }

        .upload-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          font-size: 12px;
          color: #a1a1aa;
        }

        .compose-locked {
          text-align: center;
          color: #a1a1aa;
        }

        .error-text {
          color: #f87171;
          margin-top: 8px;
        }

        .community-posts {
          margin-top: 32px;
        }

        .post-card {
          background: #1a1a1e;
          border: 1px solid #262626;
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 16px;
        }

        .post-header span {
          color: #71717a;
          font-size: 12px;
        }

        .post-card p {
          margin-top: 10px;
          color: #d4d4d8;
        }

        .post-media {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .post-media img,
        .post-media video {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #2d2d32;
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
        }

        .join-btn.joined {
          background: #f59e0b;
          color: #000;
        }

        .join-btn.view-btn {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 720px) {
          .community-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            display: flex;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CommunityDetail;
