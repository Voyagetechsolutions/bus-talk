import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/api';
import type { Id } from '../convex/_generated/dataModel';

interface CommentUser {
    _id: Id<"users">;
    username: string;
    profile_pic?: string;
    spotter_status: boolean;
}

interface Comment {
    _id: Id<"comments">;
    post_id: Id<"posts">;
    user_id: Id<"users">;
    parent_id?: Id<"comments">;
    content: string;
    likes_count: number;
    replies_count: number;
    created_at: number;
    user?: CommentUser | null;
}

interface CommentSectionProps {
    postId: Id<"posts">;
    currentUserId?: Id<"users">;
    isOpen: boolean;
    onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    postId,
    currentUserId,
    isOpen,
    onClose
}) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ id: Id<"comments">; username: string } | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

    const comments = useQuery(
        api.queries.getComments as any,
        postId ? { postId, limit: 50 } : "skip"
    ) as Comment[] | undefined;
    const createComment = useMutation(api.mutations.createComment as any);
    const likeComment = useMutation(api.mutations.likeComment as any);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUserId) return;

        try {
            await createComment({
                post_id: postId,
                user_id: currentUserId,
                content: newComment.trim(),
                parent_id: replyingTo?.id,
            });
            setNewComment('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    const handleLikeComment = async (commentId: Id<"comments">) => {
        if (!currentUserId) return;
        try {
            await likeComment({ comment_id: commentId, user_id: currentUserId });
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const toggleReplies = (commentId: string) => {
        setExpandedReplies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    const timeAgo = (timestamp: number): string => {
        const diff = Math.floor((Date.now() - timestamp) / 60000);
        if (diff < 60) return `${diff}m`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h`;
        return `${Math.floor(diff / 1440)}d`;
    };

    if (!isOpen) return null;

    return (
        <div className="comment-overlay" onClick={onClose}>
            <div className="comment-sheet" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="comment-header">
                    <h3>Comments</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                    {comments?.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            currentUserId={currentUserId}
                            onLike={handleLikeComment}
                            onReply={(username) => setReplyingTo({ id: comment._id, username })}
                            isExpanded={expandedReplies.has(comment._id)}
                            onToggleReplies={() => toggleReplies(comment._id)}
                            timeAgo={timeAgo}
                        />
                    ))}

                    {comments?.length === 0 && (
                        <div className="no-comments">
                            <p>No comments yet</p>
                            <p className="hint">Be the first to comment</p>
                        </div>
                    )}
                </div>

                {/* Comment Input */}
                <form className="comment-form" onSubmit={handleSubmit}>
                    {replyingTo && (
                        <div className="replying-to">
                            Replying to @{replyingTo.username}
                            <button type="button" onClick={() => setReplyingTo(null)}>×</button>
                        </div>
                    )}
                    <div className="comment-input-row">
                        <input
                            type="text"
                            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="comment-input"
                        />
                        <button
                            type="submit"
                            className="post-btn"
                            disabled={!newComment.trim()}
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Individual Comment Item
interface CommentItemProps {
    comment: Comment;
    currentUserId?: Id<"users">;
    onLike: (id: Id<"comments">) => void;
    onReply: (username: string) => void;
    isExpanded: boolean;
    onToggleReplies: () => void;
    timeAgo: (timestamp: number) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    currentUserId,
    onLike,
    onReply,
    isExpanded,
    onToggleReplies,
    timeAgo,
}) => {
    const replies = useQuery(
        api.queries.getReplies as any,
        isExpanded ? { commentId: comment._id, limit: 10 } : "skip"
    ) as Comment[] | undefined;

    return (
        <div className="comment-item">
            <div className="comment-avatar">
                {comment.user?.profile_pic ? (
                    <img src={comment.user.profile_pic} alt="" />
                ) : (
                    <span>{comment.user?.username?.[0]?.toUpperCase()}</span>
                )}
            </div>

            <div className="comment-body">
                <div className="comment-content">
                    <span className="comment-username">
                        {comment.user?.username}
                        {comment.user?.spotter_status && <span className="verified-small">✓</span>}
                    </span>
                    <span className="comment-text">{comment.content}</span>
                </div>

                <div className="comment-meta">
                    <span className="comment-time">{timeAgo(comment.created_at)}</span>
                    {comment.likes_count > 0 && (
                        <span className="comment-likes">{comment.likes_count} likes</span>
                    )}
                    <button
                        className="reply-btn"
                        onClick={() => onReply(comment.user?.username || '')}
                    >
                        Reply
                    </button>
                </div>

                {/* View Replies */}
                {comment.replies_count > 0 && (
                    <button className="view-replies" onClick={onToggleReplies}>
                        {isExpanded ? '— Hide replies' : `— View ${comment.replies_count} replies`}
                    </button>
                )}

                {/* Replies */}
                {isExpanded && replies && (
                    <div className="replies-list">
                        {replies.map((reply) => (
                            <div key={reply._id} className="reply-item">
                                <div className="comment-avatar small">
                                    {reply.user?.profile_pic ? (
                                        <img src={reply.user.profile_pic} alt="" />
                                    ) : (
                                        <span>{reply.user?.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="reply-body">
                                    <div className="comment-content">
                                        <span className="comment-username">{reply.user?.username}</span>
                                        <span className="comment-text">{reply.content}</span>
                                    </div>
                                    <div className="comment-meta">
                                        <span className="comment-time">{timeAgo(reply.created_at)}</span>
                                        {reply.likes_count > 0 && (
                                            <span className="comment-likes">{reply.likes_count} likes</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="like-comment-btn"
                                    onClick={() => onLike(reply._id)}
                                >
                                    🤍
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                className="like-comment-btn"
                onClick={() => onLike(comment._id)}
            >
                🤍
            </button>
        </div>
    );
};

export default CommentSection;
