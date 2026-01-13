import React from 'react';
import { motion } from 'framer-motion';

interface Award {
  id: string;
  type: 'weekly' | 'monthly' | 'annual';
  title: string;
  date: string;
  votes?: number;
}

interface AwardBadgeProps {
  award: Award;
  ageInMonths: number;
  size?: 'small' | 'medium' | 'large';
}

const AwardBadge: React.FC<AwardBadgeProps> = ({ award, ageInMonths, size = 'medium' }) => {
  const getAgeCategory = () => {
    if (ageInMonths <= 3) return 'fresh';
    if (ageInMonths <= 12) return 'recent';
    return 'legacy';
  };

  const getBadgeStyle = () => {
    const ageCategory = getAgeCategory();
    const baseSize = size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-10 h-10' : 'w-8 h-8';
    
    switch (ageCategory) {
      case 'fresh':
        return {
          container: `${baseSize} rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg`,
          glow: true,
          opacity: 'opacity-100'
        };
      case 'recent':
        return {
          container: `${baseSize} rounded-full bg-yellow-500 shadow-md`,
          glow: false,
          opacity: 'opacity-90'
        };
      case 'legacy':
        return {
          container: `${baseSize} rounded-full border-2 border-gray-500 bg-transparent`,
          glow: false,
          opacity: 'opacity-70'
        };
    }
  };

  const getShapeClass = () => {
    switch (award.type) {
      case 'weekly':
        return 'rounded-full'; // Circle
      case 'monthly':
        return 'rounded-lg'; // Hexagon-like
      case 'annual':
        return 'rounded-md'; // Shield-like
    }
  };

  const style = getBadgeStyle();
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative group">
      <motion.div
        className={`${style.container} ${style.opacity} flex items-center justify-center text-black font-bold text-xs ${getShapeClass()}`}
        animate={style.glow ? { 
          boxShadow: [
            '0 0 0 rgba(251, 191, 36, 0.5)',
            '0 0 20px rgba(251, 191, 36, 0.3)',
            '0 0 0 rgba(251, 191, 36, 0.5)'
          ]
        } : {}}
        transition={style.glow ? { duration: 6, repeat: Infinity } : {}}
      >
        🏆
      </motion.div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        <div className="font-semibold">{award.title}</div>
        <div className="text-gray-400">{formatDate(award.date)}</div>
        {award.votes && <div className="text-gray-400">{award.votes} votes</div>}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default AwardBadge;