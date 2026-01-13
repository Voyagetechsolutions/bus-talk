import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { Bus, Driver, Company, User } from '../types';

interface RankingItem {
  id: string;
  name: string;
  rating: number;
  momentum: 'up' | 'down' | 'stable';
  change: number;
  subtitle?: string;
}

const Rankings: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('buses');
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [activeCategory]);

  const fetchRankings = async () => {
    setLoading(true);
    
    try {
      let data: any[] = [];
      
      switch (activeCategory) {
        case 'buses':
          const { data: buses } = await supabase
            .from('buses')
            .select(`
              *,
              company:companies(name)
            `)
            .order('rating_avg', { ascending: false })
            .limit(20);
          
          data = buses?.map(bus => ({
            id: bus.id,
            name: bus.fleet_number,
            rating: bus.rating_avg,
            subtitle: `${bus.company?.name} • ${bus.route}`,
            momentum: calculateMomentum(bus.rating_avg),
            change: Math.random() * 0.5 - 0.25 // Mock momentum change
          })) || [];
          break;
          
        case 'drivers':
          const { data: drivers } = await supabase
            .from('drivers')
            .select(`
              *,
              company:companies(name)
            `)
            .order('rating_avg', { ascending: false })
            .limit(20);
          
          data = drivers?.map(driver => ({
            id: driver.id,
            name: driver.name,
            rating: driver.rating_avg,
            subtitle: `${driver.company?.name} • ${driver.experience_years}y exp`,
            momentum: calculateMomentum(driver.rating_avg),
            change: Math.random() * 0.5 - 0.25
          })) || [];
          break;
          
        case 'companies':
          const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .order('rating_avg', { ascending: false })
            .limit(20);
          
          data = companies?.map(company => ({
            id: company.id,
            name: company.name,
            rating: company.rating_avg,
            subtitle: `${company.buses_count} buses • ${company.routes_count} routes`,
            momentum: calculateMomentum(company.rating_avg),
            change: Math.random() * 0.5 - 0.25
          })) || [];
          break;
          
        case 'spotters':
          const { data: spotters } = await supabase
            .from('users')
            .select('*')
            .eq('spotter_status', true)
            .order('created_at', { ascending: true })
            .limit(20);
          
          data = spotters?.map((spotter, index) => ({
            id: spotter.id,
            name: spotter.username,
            rating: 5.0 - (index * 0.1), // Mock rating based on position
            subtitle: `${spotter.badges.length} badges`,
            momentum: 'stable' as const,
            change: 0
          })) || [];
          break;
      }
      
      setRankings(data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
    
    setLoading(false);
  };

  const calculateMomentum = (rating: number): 'up' | 'down' | 'stable' => {
    const random = Math.random();
    if (rating > 4.5) return random > 0.7 ? 'up' : 'stable';
    if (rating < 3.5) return random > 0.7 ? 'down' : 'stable';
    return random > 0.6 ? (random > 0.8 ? 'up' : 'down') : 'stable';
  };

  const getMomentumIcon = (momentum: string, change: number) => {
    switch (momentum) {
      case 'up': return <span className="text-green-400">↗️ +{Math.abs(change).toFixed(2)}</span>;
      case 'down': return <span className="text-red-400">↘️ -{Math.abs(change).toFixed(2)}</span>;
      default: return <span className="text-gray-400">→ {change.toFixed(2)}</span>;
    }
  };

  const categories = [
    { id: 'buses', name: 'Top Buses', icon: '🚌' },
    { id: 'drivers', name: 'Top Drivers', icon: '👨‍✈️' },
    { id: 'companies', name: 'Top Companies', icon: '🏢' },
    { id: 'spotters', name: 'Top Spotters', icon: '📸' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-accent-cyan mb-4">Live Rankings</h1>
        <p className="text-gray-400">Real-time performance rankings with momentum tracking</p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeCategory === category.id
                ? 'bg-accent-cyan text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Rankings List */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3">
          {rankings.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card flex items-center justify-between ${
                index < 3 ? 'border-l-4 border-accent-yellow' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-yellow-600 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  {item.subtitle && (
                    <p className="text-gray-400 text-sm">{item.subtitle}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-accent-yellow">
                      {item.rating.toFixed(1)}
                    </span>
                    <span className="text-yellow-400">⭐</span>
                  </div>
                  <div className="text-sm">
                    {getMomentumIcon(item.momentum, item.change)}
                  </div>
                </div>
                
                {index < 3 && (
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {rankings.length === 0 && (
          <div className="card text-center">
            <h3 className="text-xl font-bold mb-2">No Rankings Yet</h3>
            <p className="text-gray-400">
              Rankings will appear as users rate and interact with content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings;