import React from 'react';
import { motion } from 'framer-motion';
import { Bus } from '../types';
import AwardBadge from './AwardBadge';

interface BusCardProps {
  bus: Bus;
  compact?: boolean;
}

const BusCard: React.FC<BusCardProps> = ({ bus, compact = false }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < Math.floor(rating) ? 'text-accent-amber drop-shadow-md' : 'text-gray-600'
          }`}
      >
        ⭐
      </span>
    ));
  };

  return (
    <motion.div
      className={`card ${compact ? 'p-4' : 'p-6'}`}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="avatar avatar-sm">
            {bus.company?.name?.[0] || 'B'}
          </div>
          <div className="flex items-center space-x-2">
            <div>
              <h3 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}>
                {bus.fleet_number}
              </h3>
              <p className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                {bus.company?.name}
              </p>
            </div>
            {/* Mock award for demo - replace with real data */}
            {bus.rating_avg > 4.5 && (
              <AwardBadge
                award={{
                  id: '1',
                  type: 'weekly',
                  title: 'Bus of the Week',
                  date: '2024-01-15'
                }}
                ageInMonths={1}
                size="small"
              />
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1">
            {renderStars(bus.rating_avg)}
          </div>
          <p className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            {bus.rating_avg.toFixed(1)}
          </p>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Route:</span> {bus.route}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Type:</span> {bus.type}
            </p>
            {bus.last_seen && (
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Last Seen:</span> {bus.last_seen}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <button className="btn-primary text-sm flex-1">Rate This Bus</button>
            <button className="btn-secondary text-sm flex-1">Spot It</button>
          </div>
        </>
      )}

      {compact && (
        <div className="mt-2">
          <p className="text-xs text-gray-400">{bus.route}</p>
        </div>
      )}
    </motion.div>
  );
};

export default BusCard;