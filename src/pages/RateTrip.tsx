import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface Bus {
  id: string;
  fleet_number: string;
  route: string;
}

const RateTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppStore();
  const busIdFromState = (location.state as any)?.busId;
  
  const companies = useQuery(api.queries.getCompanies as any);
  const buses = useQuery(api.queries.getBuses as any, { limit: 100 });
  const createRating = useMutation(api.mutations.createRating as any);
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [overallRating, setOverallRating] = useState<number>(0);
  const [companySearch, setCompanySearch] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailRatings, setDetailRatings] = useState({
    punctuality: 0,
    cleanliness: 0,
    comfort: 0,
    behavior: 0
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (busIdFromState && buses) {
      const bus = buses.find((b: any) => b._id === busIdFromState);
      if (bus) {
        setSelectedCompany(bus.company_id);
        setSelectedBus(bus._id);
      }
    }
  }, [busIdFromState, buses]);

  const filteredCompanies = companies?.filter((c: any) => 
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  ) || [];

  const filteredBuses = buses?.filter((b: any) => 
    selectedCompany ? b.company_id === selectedCompany : false
  ) || [];

  const handleSubmit = async () => {
    if (!user || !selectedBus || overallRating === 0) return;

    setLoading(true);
    try {
      await createRating({
        user_id: user.id,
        bus_id: selectedBus,
        trip_date: new Date().toISOString().split('T')[0],
        punctuality: detailRatings.punctuality || overallRating,
        cleanliness: detailRatings.cleanliness || overallRating,
        comfort: detailRatings.comfort || overallRating,
        behavior: detailRatings.behavior || overallRating,
        comment: comment.trim() || undefined
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Rating submission error:', error);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Sign in to rate trips</h1>
        <p className="text-gray-400">You need to be signed in to rate your bus trips.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-4 text-accent-yellow">Thanks!</h1>
        <p className="text-xl text-gray-300 mb-4">Your rating helped shape this bus's score</p>
        <div className="space-y-2">
          <button onClick={() => navigate('/')} className="btn-primary mr-4">
            View bus page
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Rate another trip
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Rate Your Trip</h1>
        <p className="text-gray-400">Short. Calm. Not corporate.</p>
      </motion.div>

      {/* Step 1: Trip Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Identify the Trip</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <input
              type="text"
              placeholder="🔍 Search company..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan mb-2"
            />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan"
            >
              <option value="">Select company...</option>
              {filteredCompanies.map((company: any) => (
                <option key={company._id} value={company._id}>{company.name}</option>
              ))}
            </select>
          </div>

          {selectedCompany && (
            <div>
              <label className="block text-sm font-medium mb-2">Fleet Number</label>
              <select
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan"
              >
                <option value="">Select bus...</option>
                {filteredBuses.map((bus: any) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.fleet_number} - {bus.route}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </motion.div>

      {/* Step 2: Overall Rating */}
      {selectedBus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-6 text-center"
        >
          <h2 className="text-xl font-semibold mb-4">How was the trip overall?</h2>
          
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setOverallRating(star)}
                className={`text-4xl transition-colors ${
                  star <= overallRating ? 'text-accent-yellow' : 'text-gray-600'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>

          {/* Detailed Ratings */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-accent-cyan hover:text-cyan-400 text-sm"
          >
            Care about details? Add them (optional) {showDetails ? '▴' : '▾'}
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-3"
            >
              {[
                { key: 'punctuality', icon: '🕒', label: 'Punctuality' },
                { key: 'cleanliness', icon: '🧼', label: 'Cleanliness' },
                { key: 'comfort', icon: '🪑', label: 'Comfort' },
                { key: 'behavior', icon: '🧑‍✈️', label: 'Driver Behavior' }
              ].map(({ key, icon, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="text-xl">{icon}</span>
                    <span>{label}</span>
                  </span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(dot => (
                      <button
                        key={dot}
                        onClick={() => setDetailRatings(prev => ({ ...prev, [key]: dot }))}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          dot <= detailRatings[key as keyof typeof detailRatings]
                            ? 'bg-accent-cyan'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 3: Comment */}
      {overallRating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-6"
        >
          <label className="block text-lg font-semibold mb-2">Anything worth mentioning?</label>
          <p className="text-sm text-gray-400 mb-3">One sentence is enough.</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Great driver, smooth ride..."
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan h-20 resize-none"
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/200</p>
        </motion.div>
      )}

      {/* Step 4: Submit */}
      {overallRating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Posting Rating...' : 'Post Rating'}
          </button>
          <p className="text-sm text-gray-400 mt-3">
            Scores are for fun and community discussion.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RateTrip;