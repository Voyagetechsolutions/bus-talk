import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RevealProps {
  winner: {
    id: string;
    fleet_number: string;
    company: { name: string; logo?: string };
    route: string;
    votes: number;
    totalVotes: number;
    imageUrl?: string;
  };
  onRevealComplete: () => void;
}

const BusOfTheWeekReveal: React.FC<RevealProps> = ({ winner, onRevealComplete }) => {
  const [stage, setStage] = useState<'countdown' | 'reveal' | 'celebrate' | 'complete'>('countdown');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage === 'countdown' && countdown > 1) {
        setCountdown(countdown - 1);
      } else if (stage === 'countdown' && countdown === 1) {
        setStage('reveal');
      } else if (stage === 'reveal') {
        setTimeout(() => setStage('celebrate'), 800);
      } else if (stage === 'celebrate') {
        setTimeout(() => {
          setStage('complete');
          onRevealComplete();
        }, 2000);
      }
    }, stage === 'countdown' ? 400 : 0);

    return () => clearTimeout(timer);
  }, [stage, countdown, onRevealComplete]);

  const votePercentage = (winner.votes / winner.totalVotes) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        {/* Countdown Stage */}
        {stage === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Bus of the Week</h2>
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-6xl font-bold text-accent-yellow"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}

        {/* Reveal Stage */}
        {(stage === 'reveal' || stage === 'celebrate' || stage === 'complete') && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 relative overflow-hidden"
          >
            {/* Light Sweep Effect */}
            {stage === 'celebrate' && (
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            )}

            {/* Winner Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-6"
            >
              <div className="text-4xl mb-2">🏆</div>
              <h1 className="text-3xl font-bold text-accent-yellow">Bus of the Week</h1>
            </motion.div>

            {/* Bus Image Placeholder */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-5xl">🚌</span>
            </motion.div>

            {/* Winner Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">
                {winner.company.name} {winner.fleet_number}
              </h2>
              <p className="text-gray-300 text-lg">{winner.route}</p>
              
              {/* Vote Results */}
              <div className="space-y-2">
                <p className="text-accent-cyan font-semibold">
                  {winner.votes} votes ({votePercentage.toFixed(1)}%)
                </p>
                
                {/* Animated Vote Bar */}
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${votePercentage}%` }}
                    transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-accent-cyan to-blue-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Soft Glow Effect */}
            {stage === 'celebrate' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl shadow-2xl shadow-accent-cyan/20"
              />
            )}

            {/* Action Buttons */}
            {stage === 'complete' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center space-x-4 mt-8"
              >
                <button className="px-6 py-2 bg-accent-yellow text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                  View Bus Profile
                </button>
                <button className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                  Share Result
                </button>
                <button className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                  See Full Rankings
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BusOfTheWeekReveal;