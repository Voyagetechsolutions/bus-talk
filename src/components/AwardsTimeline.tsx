import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AwardBadge from './AwardBadge';

interface Award {
  id: string;
  type: 'weekly' | 'monthly' | 'annual';
  title: string;
  date: string;
  votes?: number;
  week?: number;
  month?: number;
  year: number;
}

interface AwardsTimelineProps {
  awards: Award[];
}

const AwardsTimeline: React.FC<AwardsTimelineProps> = ({ awards }) => {
  const [expandedAward, setExpandedAward] = useState<string | null>(null);

  if (awards.length === 0) return null;

  const calculateAge = (dateStr: string) => {
    const awardDate = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - awardDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // months
  };

  const groupedByYear = awards.reduce((acc, award) => {
    if (!acc[award.year]) acc[award.year] = [];
    acc[award.year].push(award);
    return acc;
  }, {} as Record<number, Award[]>);

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Community Recognition</h3>
      
      <div className="space-y-4">
        {sortedYears.map(year => (
          <div key={year} className="flex items-center space-x-4">
            <div className="text-gray-400 font-mono text-sm w-12">{year}</div>
            <div className="h-px bg-gray-600 flex-1"></div>
            <div className="flex items-center space-x-3">
              {groupedByYear[year].map(award => (
                <motion.div
                  key={award.id}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setExpandedAward(expandedAward === award.id ? null : award.id)}
                >
                  <AwardBadge 
                    award={award} 
                    ageInMonths={calculateAge(award.date)}
                    size="medium"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Award Details */}
      <AnimatePresence>
        {expandedAward && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-gray-700 rounded-lg"
          >
            {(() => {
              const award = awards.find(a => a.id === expandedAward);
              if (!award) return null;
              
              return (
                <div>
                  <h4 className="font-semibold text-white mb-2">{award.title}</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      {award.type === 'weekly' && `Week ${award.week}, `}
                      {award.type === 'monthly' && `${new Date(award.date).toLocaleDateString('en-US', { month: 'long' })} `}
                      {award.year}
                    </p>
                    {award.votes && <p>{award.votes} community votes</p>}
                    <p className="text-gray-400">Voted by the Bus Talk community</p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AwardsTimeline;