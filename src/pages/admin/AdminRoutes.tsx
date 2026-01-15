import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/api';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';

interface Route {
  _id: string;
  origin: string;
  destination: string;
  distance?: number;
  companies?: string[];
}

const AdminRoutes: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
  });

  const routes = useQuery(api.queries.getRoutes) as Route[] | undefined;
  const createRoute = useMutation(api.mutations.createRoute);
  const deleteRoute = useMutation(api.mutations.deleteRoute);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoute({
        origin: formData.origin,
        destination: formData.destination,
        distance: formData.distance ? parseInt(formData.distance) : undefined,
      });
      setIsModalOpen(false);
      setFormData({ origin: '', destination: '', distance: '' });
    } catch (error) {
      console.error('Failed to create route:', error);
    }
  };

  const handleDelete = async (route: Route) => {
    if (window.confirm(`Delete route ${route.origin} - ${route.destination}?`)) {
      try {
        await deleteRoute({ id: route._id as any });
      } catch (error) {
        console.error('Failed to delete route:', error);
      }
    }
  };

  const columns = [
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    {
      key: 'distance',
      label: 'Distance (km)',
      render: (r: Route) => r.distance || '-',
    },
    {
      key: 'companies',
      label: 'Companies',
      render: (r: Route) => r.companies?.length || 0,
    },
  ];

  const uniqueCities = new Set<string>();
  routes?.forEach(r => {
    uniqueCities.add(r.origin);
    uniqueCities.add(r.destination);
  });

  return (
    <AdminLayout
      title="Routes & Cities"
      subtitle="Manage routes and cities"
      action={
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Route
        </button>
      }
    >
      <div className="stats-grid">
        <StatsCard icon="🗺️" value={routes?.length || 0} label="Total Routes" />
        <StatsCard icon="🏙️" value={uniqueCities.size} label="Cities" />
      </div>

      <DataTable
        columns={columns}
        data={routes || []}
        keyExtractor={(r) => r._id}
        onDelete={handleDelete}
        emptyMessage="No routes yet. Add your first route!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Route"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              Create
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Origin City *</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="e.g., Cape Town"
              required
            />
          </div>

          <div className="form-group">
            <label>Destination City *</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., Johannesburg"
              required
            />
          </div>

          <div className="form-group">
            <label>Distance (km)</label>
            <input
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              placeholder="e.g., 1400"
            />
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminRoutes;
