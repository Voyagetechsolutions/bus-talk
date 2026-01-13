import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import type { Id } from '../convex/_generated/dataModel';
import { getUserById } from '../utils/userCache';
import '../styles/feed.css';

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

interface UserData {
    id: string;
    username: string;
    profile_pic?: string;
    spotter_status: boolean;
    role: string;
}

interface FeedPostProps {
    post: Post;
    currentUserId?: string;
    onCommentClick: (postId: Id<"posts">) => void;
    featured?: boolean;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, currentUserId, onCommentClick, featured }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);

    const likePost = useMutation(api.mutations.likePost as any);
    const toggleFollow = useMutation(api.mutations.toggleFollow as any);

    // Check if following
    const followingStatus = useQuery(
        api.queries.isFollowing as any,
        currentUserId && post.user_id && currentUserId !== post.user_id
            ? { follower_id: currentUserId, following_id: post.user_id }
            : "skip"
    );

    // Fetch user data from Supabase
    useEffect(() => {
        const fetchUser = async () => {
            if (post.user_id) {
                const user = await getUserById(post.user_id);
                if (user) setUserData(user);
            }
        };
        fetchUser();
    }, [post.user_id]);

    useEffect(() => {
        if (followingStatus !== undefined && followingStatus !== "skip") {
            setIsFollowing(followingStatus as boolean);
        }
    }, [followingStatus]);

    const handleLike = async () => {
        if (!currentUserId) return;
        try {
            const result = await likePost({
                post_id: post._id,
                user_id: currentUserId,
            });
            setLiked(result.liked);
            setLikesCount(result.likes_count);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleFollow = async () => {
        if (!currentUserId || !post.user_id || currentUserId === post.user_id) return;
        try {
            const result = await toggleFollow({
                follower_id: currentUserId,
                following_id: post.user_id,
            });
            setIsFollowing(result.following);
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const username = userData?.username || 'Loading...';
    const isVerified = userData?.spotter_status || false;
    const profilePic = userData?.profile_pic;
    const isOwnPost = currentUserId === post.user_id;
    const hasMedia = post.media.length > 0;
    const currentMedia = post.media[0];

    return (
        <article className={`post-card ${hasMedia ? 'has-media' : ''} ${featured ? 'featured' : ''}`}>
            <div className="post-card-inner">
                {/* Media Section */}
                {hasMedia && (
                    <div className="post-card-media">
                        {currentMedia.type === 'video' ? (
                            <video src={currentMedia.url} controls playsInline preload="metadata" />
                        ) : (
                            <img src={currentMedia.url} alt={post.title} loading="lazy" />
                        )}
                        {post.media.length > 1 && (
                            <span className="post-media-count">+{post.media.length - 1}</span>
                        )}
                    </div>
                )}

                {/* Content Section */}
                <div className="post-card-content">
                    {/* Author */}
                    <div className="post-author">
                        <div className="post-author-info">
                            <div className="post-author-avatar">
                                {profilePic ? (
                                    <img src={profilePic} alt={username} />
                                ) : (
                                    <span>{username[0]?.toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <div className="post-author-details">
                                <span className="post-author-name">
                                    {username}
                                    {isVerified && <span className="post-author-verified">Verified</span>}
                                </span>
                                <span className="post-author-meta">{formatDate(post.created_at)}</span>
                            </div>
                        </div>
                        {!isOwnPost && currentUserId && (
                            <button
                                className={`post-follow-btn ${isFollowing ? 'following' : ''}`}
                                onClick={handleFollow}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {/* Post Type Badge */}
                    <span className={`post-type-badge ${post.type}`}>
                        {post.type === 'news' ? '📰 News' : '📷 Sighting'}
                    </span>

                    {/* Title */}
                    <h2 className="post-title">{post.title}</h2>

                    {/* Excerpt */}
                    {post.content && (
                        <p className="post-excerpt">{post.content}</p>
                    )}

                    {/* Actions */}
                    <div className="post-actions">
                        <div className="post-stats">
                            <button className={`post-stat ${liked ? 'liked' : ''}`} onClick={handleLike}>
                                <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span>{likesCount}</span>
                            </button>
                            <button className="post-stat" onClick={() => onCommentClick(post._id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <span>{post.comments_count}</span>
                            </button>
                        </div>
                        <button className="post-read-more" onClick={() => onCommentClick(post._id)}>
                            Read more →
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

// Loading Skeleton
export const FeedPostSkeleton: React.FC = () => (
    <div className="skeleton-card">
        <div className="skeleton-card-inner">
            <div className="skeleton-media" />
            <div className="skeleton-content">
                <div className="skeleton-badge" />
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text" />
                <div className="skeleton-text" />
            </div>
        </div>
    </div>
);

export default FeedPost;
