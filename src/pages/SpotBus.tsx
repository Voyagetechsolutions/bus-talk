import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAppStore } from '../hooks/useStore';

const SpotBus: React.FC = () => {
  const { user } = useAppStore();
  const [companies, setCompanies] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchBuses(selectedCompany);
    } else {
      setBuses([]);
      setSelectedBus('');
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchBuses = async (companyId: string) => {
    try {
      const { data } = await supabase
        .from('buses')
        .select('id, fleet_number, route, type')
        .eq('company_id', companyId)
        .order('fleet_number');
      setBuses(data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBus) return;

    setLoading(true);
    try {
      // Update bus last_seen
      await supabase
        .from('buses')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', selectedBus);

      // Create sighting post
      const bus = buses.find(b => b.id === selectedBus);
      const company = companies.find(c => c.id === selectedCompany);
      
      await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          type: 'sighting',
          title: `Spotted ${bus?.fleet_number} - ${company?.name}`,
          content: `${bus?.fleet_number} (${bus?.route}) spotted at ${location}${notes ? `. ${notes}` : ''}`,
          media_urls: []
        });

      // Reset form
      setSelectedCompany('');
      setSelectedBus('');
      setLocation('');
      setNotes('');
      
      alert('Bus sighting recorded!');
    } catch (error) {
      console.error('Error recording sighting:', error);
      alert('Error recording sighting');
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="text-center py-12">Please sign in to spot buses.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-accent-cyan">Spot a Bus</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg"
            required
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Bus</label>
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg"
            required
            disabled={!selectedCompany}
          >
            <option value="">Select Bus</option>
            {buses.map(bus => (
              <option key={bus.id} value={bus.id}>
                {bus.fleet_number} - {bus.route} ({bus.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Location</label>
          <input
            type="text"
            placeholder="Where did you spot this bus?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Notes (optional)</label>
          <textarea
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg h-24"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedBus}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {loading ? 'Recording...' : 'Record Sighting'}
        </button>
      </form>
    </div>
  );
};

export default SpotBus;