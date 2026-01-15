import React, { useState } from 'react';
import { Id } from '../convex/_generated/dataModel';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  storage_id?: string;
}

interface Post {
  _id: Id<"posts">;
  user_id: string;
  type: 'news' | 'sighting';
  title: string;
  content: string;
  media: MediaItem[];
  likes_count: number;
  boosts_count: number;
  comments_count: number;
  created_at: number;
}

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  profilePic?: string;
  isVerified?: boolean;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  username = 'User',
  profilePic,
  isVerified = false
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  if (!isOpen) return null;

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev < post.media.length - 1 ? prev + 1 : 0
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev > 0 ? prev - 1 : post.media.length - 1
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-[95vw] max-w-5xl h-[80vh] bg-[var(--bg-surface)] rounded-lg overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* LEFT: Media */}
          <div className="relative bg-black h-[45vh] md:h-full">
            {post.media.length > 0 ? (
              <>
                <div className="relative h-full w-full">
                  {post.media[currentMediaIndex].type === 'video' ? (
                    <video
                      src={post.media[currentMediaIndex].url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={post.media[currentMediaIndex].url}
                      alt={post.title}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                
                {post.media.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {post.media.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No media
              </div>
            )}
          </div>

          {/* RIGHT: Content */}
          <div className="h-full overflow-y-auto p-6 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    username[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{username}</span>
                    {isVerified && (
                      <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {formatDate(post.created_at)}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full"
              >
                ×
              </button>
            </div>

            {/* Post Type Badge */}
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                post.type === 'news' 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-teal-500/20 text-teal-400'
              }`}>
                {post.type === 'news' ? '📰 News' : '📷 Sighting'}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
              {post.title}
            </h2>

            {/* Content */}
            <div className="flex-1 mb-6">
              <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-subtle)]">
              <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes_count}</span>
              </button>
              <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comments_count}</span>
              </button>
              <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-amber)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;