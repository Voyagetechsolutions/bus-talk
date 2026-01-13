import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  url, 
  description = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      color: 'bg-green-600 hover:bg-green-500'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'bg-blue-500 hover:bg-blue-400'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-blue-600 hover:bg-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'bg-blue-700 hover:bg-blue-600'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'bg-blue-400 hover:bg-blue-300'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-accent-yellow">Share this post</h3>
            
            <p className="text-gray-400 text-sm mb-6 line-clamp-2">{title}</p>

            {/* Native Share (if supported) */}
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full mb-4 p-3 bg-accent-cyan text-black rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
              >
                📱 Share via device
              </button>
            )}

            {/* Social Media Links */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {shareLinks.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${platform.color} text-white p-3 rounded-lg text-center font-semibold transition-colors flex items-center justify-center space-x-2`}
                >
                  <span>{platform.icon}</span>
                  <span>{platform.name}</span>
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {copied ? '✅ Link copied!' : '🔗 Copy link'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-3 p-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Share Button Component
interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  url = window.location.href, 
  description = '',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center space-x-1 text-gray-400 hover:text-accent-cyan transition-colors ${className}`}
      >
        <span>📤</span>
        <span>Share</span>
      </button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        url={url}
        description={description}
      />
    </>
  );
};

export { ShareModal, ShareButton };