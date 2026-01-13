import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import BusCard from './BusCard';
import PostCard from './PostCard';

interface SearchResult {
  type: 'bus' | 'driver' | 'company' | 'post';
  data: any;
}

const AdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    minRating: 0,
    company: '',
    sortBy: 'relevance'
  });

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search buses
      if (filters.type === 'all' || filters.type === 'bus') {
        const { data: buses } = await supabase
          .from('buses')
          .select(`
            *,
            company:companies(name, logo)
          `)
          .or(`fleet_number.ilike.%${query}%,route.ilike.%${query}%,type.ilike.%${query}%`)
          .gte('rating_avg', filters.minRating)
          .order(filters.sortBy === 'rating' ? 'rating_avg' : 'fleet_number', { ascending: false })
          .limit(20);

        buses?.forEach(bus => {
          searchResults.push({ type: 'bus', data: bus });
        });
      }

      // Search drivers
      if (filters.type === 'all' || filters.type === 'driver') {
        const { data: drivers } = await supabase
          .from('drivers')
          .select(`
            *,
            company:companies(name, logo)
          `)
          .ilike('name', `%${query}%`)
          .gte('rating_avg', filters.minRating)
          .order(filters.sortBy === 'rating' ? 'rating_avg' : 'name', { ascending: false })
          .limit(20);

        drivers?.forEach(driver => {
          searchResults.push({ type: 'driver', data: driver });
        });
      }

      // Search companies
      if (filters.type === 'all' || filters.type === 'company') {
        const { data: companies } = await supabase
          .from('companies')
          .select('*')
          .ilike('name', `%${query}%`)
          .gte('rating_avg', filters.minRating)
          .order(filters.sortBy === 'rating' ? 'rating_avg' : 'name', { ascending: false })
          .limit(20);

        companies?.forEach(company => {
          searchResults.push({ type: 'company', data: company });
        });
      }

      // Search posts
      if (filters.type === 'all' || filters.type === 'post') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users(username, spotter_status)
          `)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('timestamp', { ascending: false })
          .limit(20);

        posts?.forEach(post => {
          searchResults.push({ type: 'post', data: post });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    }

    setLoading(false);
  };

  const renderResult = (result: SearchResult, index: number) => {
    switch (result.type) {
      case 'bus':
        return (
          <motion.div
            key={`bus-${result.data.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <BusCard bus={result.data} />
          </motion.div>
        );

      case 'driver':
        return (
          <motion.div
            key={`driver-${result.data.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent-cyan rounded-full flex items-center justify-center font-bold text-black">
                {result.data.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{result.data.name}</h3>
                <p className="text-gray-400 text-sm">{result.data.company?.name}</p>
                <p className="text-gray-400 text-sm">{result.data.experience_years} years experience</p>
              </div>
              <div className="text-right">
                <div className="text-accent-yellow font-bold">{result.data.rating_avg.toFixed(1)} ⭐</div>
              </div>
            </div>
          </motion.div>
        );

      case 'company':
        return (
          <motion.div
            key={`company-${result.data.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center font-bold text-white">
                {result.data.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{result.data.name}</h3>
                <p className="text-gray-400 text-sm">{result.data.buses_count} buses • {result.data.routes_count} routes</p>
              </div>
              <div className="text-right">
                <div className="text-accent-yellow font-bold">{result.data.rating_avg.toFixed(1)} ⭐</div>
              </div>
            </div>
          </motion.div>
        );

      case 'post':
        return (
          <motion.div
            key={`post-${result.data.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PostCard post={result.data} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-accent-cyan mb-4">Advanced Search</h1>
        <p className="text-gray-400">Find buses, drivers, companies, and posts</p>
      </div>

      {/* Search Input */}
      <div className="card">
        <input
          type="text"
          placeholder="Search for buses, drivers, companies, or posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-accent-cyan text-lg"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="font-bold mb-4">Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-accent-cyan"
            >
              <option value="all">All</option>
              <option value="bus">Buses</option>
              <option value="driver">Drivers</option>
              <option value="company">Companies</option>
              <option value="post">Posts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-accent-cyan"
            >
              <option value={0}>Any Rating</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-accent-cyan"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: 'all', minRating: 0, company: '', sortBy: 'relevance' })}
              className="w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan"></div>
        </div>
      )}

      {!loading && query.length > 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Search Results ({results.length})
          </h2>
          
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, index) => renderResult(result, index))}
            </div>
          ) : (
            <div className="card text-center">
              <h3 className="text-lg font-bold mb-2">No Results Found</h3>
              <p className="text-gray-400">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      )}

      {query.length <= 2 && (
        <div className="card text-center">
          <h3 className="text-lg font-bold mb-2">Start Searching</h3>
          <p className="text-gray-400">Enter at least 3 characters to search.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;