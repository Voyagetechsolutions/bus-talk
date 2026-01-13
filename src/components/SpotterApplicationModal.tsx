import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAppStore } from '../hooks/useStore';

interface SpotterApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpotterApplicationModal: React.FC<SpotterApplicationModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAppStore();
  const [reason, setReason] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('spotter_applications')
        .insert({
          user_id: user.id,
          reason: reason.trim(),
          experience: experience.trim() || null
        });

      if (error) throw error;

      alert('Application submitted! Admins will review it soon.');
      setReason('');
      setExperience('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-accent-yellow">
          Apply for Verified Spotter Status
        </h2>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Verified Spotter Benefits:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Create news posts and bus sightings</li>
            <li>• Boost posts to increase visibility</li>
            <li>• Vote in monthly awards with higher weight</li>
            <li>• Get verified badge next to your name</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Why do you want to become a verified spotter? *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan h-24"
              placeholder="Tell us about your passion for buses and why you'd be a good spotter..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Bus spotting experience (optional)
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan h-20"
              placeholder="Share any relevant experience, knowledge, or contributions to the bus community..."
            />
          </div>

          {error && (
            <p className="text-accent-red text-sm">{error}</p>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SpotterApplicationModal;