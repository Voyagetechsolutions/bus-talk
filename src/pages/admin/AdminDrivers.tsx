import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/api';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';

interface Driver {
    _id: string;
    name: string;
    company_id?: string;
    company?: { name: string };
    routes?: string[];
    rating_avg?: number;
    years_experience?: number;
}

interface Company {
    _id: string;
    name: string;
}

const AdminDrivers: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        company_id: '',
        routes: '',
        years_experience: ''
    });

    const drivers = useQuery(api.queries.getDrivers) as Driver[] | undefined;
    const companies = useQuery(api.queries.getCompanies) as Company[] | undefined;
    const createDriver = useMutation(api.mutations.createDriver);
    const deleteDriver = useMutation(api.mutations.deleteDriver);

    const handleOpenModal = (driver?: Driver) => {
        if (driver) {
            setEditingDriver(driver);
            setFormData({
                name: driver.name,
                company_id: driver.company_id || '',
                routes: driver.routes?.join(', ') || '',
                years_experience: driver.years_experience?.toString() || ''
            });
        } else {
            setEditingDriver(null);
            setFormData({ name: '', company_id: '', routes: '', years_experience: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createDriver({
                name: formData.name,
                company_id: formData.company_id || undefined,
                routes: formData.routes.split(',').map(r => r.trim()).filter(Boolean),
                years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined
            });
            setIsModalOpen(false);
            setFormData({ name: '', company_id: '', routes: '', years_experience: '' });
        } catch (error) {
            console.error('Failed to create driver:', error);
        }
    };

    const handleDelete = async (driver: Driver) => {
        if (window.confirm(`Delete ${driver.name}?`)) {
            try {
                await deleteDriver({ id: driver._id as any });
            } catch (error) {
                console.error('Failed to delete driver:', error);
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Driver Name' },
        {
            key: 'company',
            label: 'Company',
            render: (d: Driver) => d.company?.name || '-'
        },
        {
            key: 'routes',
            label: 'Routes',
            render: (d: Driver) => (
                <div className="route-tags">
                    {d.routes?.slice(0, 2).map((r, i) => (
                        <span key={i} className="route-tag">{r}</span>
                    ))}
                    {(d.routes?.length || 0) > 2 && <span className="route-tag">+{(d.routes?.length || 0) - 2}</span>}
                </div>
            )
        },
        {
            key: 'rating_avg',
            label: 'Rating',
            render: (d: Driver) => (
                <span className="rating-badge">⭐ {d.rating_avg?.toFixed(1) || '0.0'}</span>
            )
        },
        {
            key: 'years_experience',
            label: 'Experience',
            render: (d: Driver) => d.years_experience ? `${d.years_experience} yrs` : '-'
        }
    ];

    const uniqueRoutes = new Set(drivers?.flatMap(d => d.routes || []));

    return (
        <AdminLayout
            title="Drivers"
            subtitle="Manage bus drivers"
            action={
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    + Add Driver
                </button>
            }
        >
            <div className="stats-grid">
                <StatsCard icon="👨‍✈️" value={drivers?.length || 0} label="Total Drivers" />
                <StatsCard icon="🛤️" value={uniqueRoutes.size} label="Active Routes" />
                <StatsCard
                    icon="⭐"
                    value={drivers?.length ?
                        (drivers.reduce((sum, d) => sum + (d.rating_avg || 0), 0) / drivers.length).toFixed(1) :
                        '0.0'
                    }
                    label="Avg Rating"
                />
            </div>

            <DataTable
                columns={columns}
                data={drivers || []}
                keyExtractor={(d) => d._id}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                emptyMessage="No drivers yet. Add your first driver!"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDriver ? 'Edit Driver' : 'Add Driver'}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSubmit}>
                            {editingDriver ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Driver Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Sipho Mthembu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Company</label>
                        <select
                            value={formData.company_id}
                            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                        >
                            <option value="">Select Company</option>
                            {companies?.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Routes (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.routes}
                            onChange={(e) => setFormData({ ...formData, routes: e.target.value })}
                            placeholder="e.g., Route 104, Route 106"
                        />
                    </div>

                    <div className="form-group">
                        <label>Years of Experience</label>
                        <input
                            type="number"
                            value={formData.years_experience}
                            onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                            placeholder="e.g., 5"
                            min="0"
                        />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminDrivers;
