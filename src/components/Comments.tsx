import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAppStore } from '../hooks/useStore';
import { Comment } from '../types';

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const { user } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Real-time subscription
    const subscription = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload: any) => {
          setComments(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(username, spotter_status)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim()
      });

    if (!error) {
      setNewComment('');
    }
    setLoading(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="mt-4 border-t border-gray-600 pt-4">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-sm font-bold text-black">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-accent-cyan text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-accent-cyan text-black rounded text-sm font-semibold disabled:opacity-50"
            >
              {loading ? '...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex space-x-3"
          >
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
              {comment.user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{comment.user?.username}</span>
                {comment.user?.spotter_status && (
                  <span className="text-accent-yellow text-xs">✓</span>
                )}
                <span className="text-gray-400 text-xs">{formatTimeAgo(comment.created_at)}</span>
              </div>
              <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
            </div>
          </motion.div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default Comments;