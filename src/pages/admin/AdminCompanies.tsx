import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/api';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';

interface Company {
    _id: string;
    name: string;
    logo?: string;
    routes?: string[];
    buses_count?: number;
    rating_avg?: number;
}

const AdminCompanies: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({ name: '', routes: '' });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const companies = useQuery(api.queries.getCompanies) as Company[] | undefined;
    const createCompany = useMutation(api.mutations.createCompany);
    const deleteCompany = useMutation(api.mutations.deleteCompany);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl as any);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                routes: company.routes?.join(', ') || ''
            });
            setLogoPreview(company.logo || null);
        } else {
            setEditingCompany(null);
            setFormData({ name: '', routes: '' });
            setLogoFile(null);
            setLogoPreview(null);
        }
        setIsModalOpen(true);
    };

    const uploadLogo = async (file: File): Promise<string | undefined> => {
        try {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!response.ok) {
                console.error('Logo upload failed');
                return undefined;
            }

            const { storageId } = await response.json();
            // Return the storage URL that will be resolved
            return storageId;
        } catch (error) {
            console.error('Upload error:', error);
            return undefined;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let logoStorageId: string | undefined;

            // Upload logo if selected
            if (logoFile) {
                logoStorageId = await uploadLogo(logoFile);
            }

            await createCompany({
                name: formData.name,
                logo: logoStorageId,
            });

            setIsModalOpen(false);
            setFormData({ name: '', routes: '' });
            setLogoFile(null);
            setLogoPreview(null);
        } catch (error) {
            console.error('Failed to create company:', error);
        }
        setUploading(false);
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
                    {c.logo ? <img src={c.logo} alt={c.name} /> : '🏢'}
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
            key: 'rating_avg',
            label: 'Rating',
            render: (c: Company) => `⭐ ${(c.rating_avg || 0).toFixed(1)}`
        }
    ];

    const totalBuses = companies?.reduce((sum, c) => sum + (c.buses_count || 0), 0) || 0;

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
                        <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
                            {uploading ? 'Uploading...' : editingCompany ? 'Update' : 'Create'}
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
                        <label>Company Logo</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div
                            className="logo-upload-area"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                            ) : (
                                <div className="logo-placeholder">
                                    <span>📷</span>
                                    <p>Click to upload logo</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>

            <style>{`
        .hidden {
          display: none;
        }
        
        .logo-upload-area {
          width: 100%;
          height: 120px;
          border: 2px dashed #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          overflow: hidden;
        }
        
        .logo-upload-area:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }
        
        .logo-preview {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .logo-placeholder {
          text-align: center;
          color: #666;
        }
        
        .logo-placeholder span {
          font-size: 32px;
        }
        
        .logo-placeholder p {
          margin-top: 8px;
          font-size: 13px;
        }
      `}</style>
        </AdminLayout>
    );
};

export default AdminCompanies;
