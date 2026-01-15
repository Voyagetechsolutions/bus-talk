import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';
import type { Id } from '../convex/_generated/dataModel';

interface Comment {
  _id: Id<"community_comments">;
  post_id: Id<"community_posts">;
  user_id: string;
  parent_id?: Id<"community_comments">;
  content: string;
  upvotes: number;
  downvotes: number;
  replies_count: number;
  created_at: number;
}

interface CommentSystemProps {
  postId: Id<"community_posts">;
}

const CommentSystem: React.FC<CommentSystemProps> = ({ postId }) => {
  const { user } = useAppStore();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Id<"community_comments"> | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<Id<"community_comments">>>(new Set());

  const comments = useQuery(api.queries.getCommunityComments as any, { post_id: postId }) as Comment[] | undefined;
  const createComment = useMutation(api.mutations.createCommunityComment as any);
  const voteComment = useMutation(api.mutations.voteCommunityComment as any);

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    await createComment({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });
    
    setNewComment('');
  };

  const handleSubmitReply = async () => {
    if (!user || !replyText.trim() || !replyingTo) return;
    
    await createComment({
      post_id: postId,
      user_id: user.id,
      content: replyText.trim(),
      parent_id: replyingTo,
    });
    
    setReplyText('');
    setReplyingTo(null);
  };

  const handleVote = async (commentId: Id<"community_comments">, voteType: 'upvote' | 'downvote') => {
    if (!user) return;
    await voteComment({
      comment_id: commentId,
      user_id: user.id,
      vote_type: voteType,
    });
  };

  const toggleReplies = (commentId: Id<"community_comments">) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const clearReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const topLevelComments = comments?.filter(c => !c.parent_id) || [];
  const getReplies = (parentId: Id<"community_comments">) => 
    comments?.filter(c => c.parent_id === parentId) || [];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="comment-system">
      {/* New Comment Form */}
      {user ? (
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
          />
          <div className="comment-actions">
            <button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="submit-btn"
            >
              Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-prompt">
          <p>Sign in to join the discussion</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {topLevelComments.map((comment) => (
          <div key={comment._id} className="comment-thread">
            <div className="comment">
              <div className="comment-vote">
                <button 
                  onClick={() => handleVote(comment._id, 'upvote')}
                  className="vote-btn upvote"
                >
                  ▲
                </button>
                <span className="vote-score">{comment.upvotes - comment.downvotes}</span>
                <button 
                  onClick={() => handleVote(comment._id, 'downvote')}
                  className="vote-btn downvote"
                >
                  ▼
                </button>
              </div>
              
              <div className="comment-content">
                <div className="comment-meta">
                  <span className="comment-author">User</span>
                  <span className="comment-time">{formatDate(comment.created_at)}</span>
                </div>
                
                <div className="comment-text">{comment.content}</div>
                
                <div className="comment-actions">
                  {user && (
                    <button 
                      onClick={() => setReplyingTo(comment._id)}
                      className="reply-btn"
                    >
                      Reply
                    </button>
                  )}
                  
                  {comment.replies_count > 0 && (
                    <button 
                      onClick={() => toggleReplies(comment._id)}
                      className="replies-btn"
                    >
                      {expandedReplies.has(comment._id) ? 'Hide' : 'Show'} {comment.replies_count} replies
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="reply-form">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="reply-input"
                    />
                    <div className="reply-actions">
                      <button 
                        onClick={handleSubmitReply}
                        disabled={!replyText.trim()}
                        className="submit-btn small"
                      >
                        Reply
                      </button>
                      <button 
                        onClick={clearReply}
                        className="cancel-btn small"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {expandedReplies.has(comment._id) && (
                  <div className="replies">
                    {getReplies(comment._id).map((reply) => (
                      <div key={reply._id} className="reply">
                        <div className="comment-vote">
                          <button 
                            onClick={() => handleVote(reply._id, 'upvote')}
                            className="vote-btn upvote small"
                          >
                            ▲
                          </button>
                          <span className="vote-score small">{reply.upvotes - reply.downvotes}</span>
                          <button 
                            onClick={() => handleVote(reply._id, 'downvote')}
                            className="vote-btn downvote small"
                          >
                            ▼
                          </button>
                        </div>
                        
                        <div className="comment-content">
                          <div className="comment-meta">
                            <span className="comment-author">User</span>
                            <span className="comment-time">{formatDate(reply.created_at)}</span>
                          </div>
                          <div className="comment-text">{reply.content}</div>
                          
                          <div className="comment-actions">
                            {user && (
                              <button 
                                onClick={() => setReplyingTo(reply._id)}
                                className="reply-btn"
                              >
                                Reply
                              </button>
                            )}
                          </div>

                          {/* Reply Form for nested replies */}
                          {replyingTo === reply._id && (
                            <div className="reply-form">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="reply-input"
                              />
                              <div className="reply-actions">
                                <button 
                                  onClick={handleSubmitReply}
                                  disabled={!replyText.trim()}
                                  className="submit-btn small"
                                >
                                  Reply
                                </button>
                                <button 
                                  onClick={clearReply}
                                  className="cancel-btn small"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .comment-system {
          margin-top: 24px;
        }

        .comment-form, .reply-form {
          margin-bottom: 20px;
        }

        .comment-input, .reply-input {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          background: #1a1a1e;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          resize: vertical;
          font-family: inherit;
        }

        .reply-input {
          min-height: 60px;
          margin-top: 8px;
        }

        .comment-actions, .reply-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .submit-btn {
          padding: 8px 16px;
          background: #f59e0b;
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn.small {
          padding: 6px 12px;
          font-size: 14px;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: transparent;
          color: #a1a1aa;
          border: 1px solid #333;
          border-radius: 6px;
          cursor: pointer;
        }

        .cancel-btn.small {
          padding: 6px 12px;
          font-size: 14px;
        }

        .auth-prompt {
          text-align: center;
          padding: 20px;
          color: #a1a1aa;
          background: #1a1a1e;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .comment-thread {
          margin-bottom: 16px;
        }

        .comment, .reply {
          display: flex;
          gap: 12px;
          padding: 12px 0;
        }

        .reply {
          margin-left: 20px;
          padding-left: 20px;
          border-left: 2px solid #333;
        }

        .comment-vote {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 40px;
        }

        .vote-btn {
          background: none;
          border: none;
          color: #71717a;
          cursor: pointer;
          font-size: 12px;
          padding: 4px;
          border-radius: 4px;
        }

        .vote-btn.small {
          font-size: 10px;
          padding: 2px;
        }

        .vote-btn:hover {
          background: #333;
        }

        .vote-btn.upvote:hover {
          color: #f59e0b;
        }

        .vote-btn.downvote:hover {
          color: #f87171;
        }

        .vote-score {
          font-size: 12px;
          font-weight: 600;
          color: #a1a1aa;
        }

        .vote-score.small {
          font-size: 10px;
        }

        .comment-content {
          flex: 1;
        }

        .comment-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .comment-author {
          font-weight: 600;
          color: #f59e0b;
        }

        .comment-time {
          color: #71717a;
        }

        .comment-text {
          color: #d4d4d8;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .comment-actions {
          display: flex;
          gap: 12px;
        }

        .reply-btn, .replies-btn {
          background: none;
          border: none;
          color: #71717a;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .reply-btn:hover, .replies-btn:hover {
          color: #a1a1aa;
        }

        .replies {
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
};

export default CommentSystem;