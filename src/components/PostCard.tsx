import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Post } from '../types';
import { useAppStore } from '../hooks/useStore';
import { supabase } from '../utils/supabase';
import Comments from './Comments';
import ImageModal from './ImageModal';
import MediaCarousel from './MediaCarousel';
import { ShareButton } from './ShareButton';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, boostPost } = useAppStore();
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);

  const handleBoost = async () => {
    if (!user || !user.spotter_status) return;

    try {
      const { error } = await supabase
        .from('boosts')
        .insert({
          post_id: post.id,
          user_id: user.id
        });

      if (!error) {
        boostPost(post.id);
      }
    } catch (error) {
      console.error('Error boosting post:', error);
    }
  };

  const handleLike = async () => {
    if (!user || liking) return;

    setLiking(true);
    const wasLiked = liked;
    const newLikeCount = wasLiked ? localLikes - 1 : localLikes + 1;

    // Optimistic update
    setLiked(!wasLiked);
    setLocalLikes(newLikeCount);

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: user.id });

        if (error) throw error;
      }

      // Update post likes count
      await supabase
        .from('posts')
        .update({ likes_count: newLikeCount })
        .eq('id', post.id);

    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLiked(wasLiked);
      setLocalLikes(wasLiked ? localLikes : localLikes);
    }

    setLiking(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <motion.div
      className="card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <span className="font-bold">
              {post.user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{post.user?.username}</span>
              {post.user?.spotter_status && (
                <span className="badge badge-verified">✓ Verified</span>
              )}
              {user && user.id !== post.user_id && (
                <button className="text-xs text-accent-teal hover:text-accent-teal-300 font-medium">
                  Follow
                </button>
              )}
            </div>
            <span className="text-gray-400 text-sm">{formatTimeAgo(post.timestamp)}</span>
          </div>
        </div>

        <span className={`badge ${post.type === 'news' ? 'badge-coral' : 'badge-teal'
          }`}>
          {post.type.toUpperCase()}
        </span>
      </div>

      <h3 className="text-lg font-bold mb-2">{post.title}</h3>
      <p className="text-gray-300 mb-4">{post.content}</p>

      <MediaCarousel
        mediaUrls={post.media_urls}
        onMediaClick={setSelectedImage}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors font-medium text-sm ${liked ? 'text-accent-coral' : 'text-gray-400 hover:text-accent-coral'
              }`}
            whileTap={{ scale: 0.95 }}
          >
            <span>{liked ? '❤️' : '♡'}</span>
            <span>{localLikes}</span>
          </motion.button>

          {user?.spotter_status && (
            <motion.button
              onClick={handleBoost}
              className="boost-btn flex items-center space-x-1"
              whileTap={{ scale: 0.95 }}
            >
              <span>🚀</span>
              <span>{post.boosts_count}</span>
            </motion.button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            💬 {showComments ? 'Hide' : 'Comments'}
          </button>

          <ShareButton
            title={post.title}
            description={post.content}
            url={`${window.location.origin}/post/${post.id}`}
          />
        </div>
      </div>

      {showComments && <Comments postId={post.id} />}

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        alt="Post image"
      />
    </motion.div>
  );
};

export default PostCard;