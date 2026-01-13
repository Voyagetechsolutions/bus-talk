import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/api';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';

interface Company {
    _id: string;
    name: string;
    logo_url?: string;
    routes?: string[];
    buses_count?: number;
}

const AdminCompanies: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({ name: '', logo_url: '', routes: '' });

    const companies = useQuery(api.queries.getCompanies) as Company[] | undefined;
    const createCompany = useMutation(api.mutations.createCompany);
    const deleteCompany = useMutation(api.mutations.deleteCompany);

    const handleOpenModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                logo_url: company.logo_url || '',
                routes: company.routes?.join(', ') || ''
            });
        } else {
            setEditingCompany(null);
            setFormData({ name: '', logo_url: '', routes: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCompany({
                name: formData.name,
                logo_url: formData.logo_url || undefined,
                routes: formData.routes.split(',').map(r => r.trim()).filter(Boolean)
            });
            setIsModalOpen(false);
            setFormData({ name: '', logo_url: '', routes: '' });
        } catch (error) {
            console.error('Failed to create company:', error);
        }
    };

    const handleDelete = async (company: Company) => {
        if (window.confirm(`Delete ${company.name}?`)) {
            try {
                await deleteCompany({ id: company._id as any });
            } catch (error) {
                console.error('Failed to delete company:', error);
            }
        }
    };

    const columns = [
        {
            key: 'logo',
            label: 'Logo',
            width: '60px',
            render: (c: Company) => (
                <div className="table-logo">
                    {c.logo_url ? <img src={c.logo_url} alt={c.name} /> : '🏢'}
                </div>
            )
        },
        { key: 'name', label: 'Company Name' },
        {
            key: 'buses_count',
            label: 'Buses',
            render: (c: Company) => c.buses_count || 0
        },
        {
            key: 'routes',
            label: 'Routes',
            render: (c: Company) => (
                <div className="route-tags">
                    {c.routes?.slice(0, 3).map((r, i) => (
                        <span key={i} className="route-tag">{r}</span>
                    ))}
                    {(c.routes?.length || 0) > 3 && <span className="route-tag">+{(c.routes?.length || 0) - 3}</span>}
                </div>
            )
        }
    ];

    const totalBuses = companies?.reduce((sum, c) => sum + (c.buses_count || 0), 0) || 0;
    const totalRoutes = companies?.reduce((sum, c) => sum + (c.routes?.length || 0), 0) || 0;

    return (
        <AdminLayout
            title="Companies"
            subtitle="Manage transport companies"
            action={
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    + Add Company
                </button>
            }
        >
            <div className="stats-grid">
                <StatsCard icon="🏢" value={companies?.length || 0} label="Total Companies" />
                <StatsCard icon="🚌" value={totalBuses} label="Total Buses" />
                <StatsCard icon="🛤️" value={totalRoutes} label="Total Routes" />
            </div>

            <DataTable
                columns={columns}
                data={companies || []}
                keyExtractor={(c) => c._id}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                emptyMessage="No companies yet. Add your first company!"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCompany ? 'Edit Company' : 'Add Company'}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSubmit}>
                            {editingCompany ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Company Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Golden Arrow"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Logo URL</label>
                        <input
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>

                    <div className="form-group">
                        <label>Routes (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.routes}
                            onChange={(e) => setFormData({ ...formData, routes: e.target.value })}
                            placeholder="e.g., Route 1, Route 2, A01"
                        />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminCompanies;
