import React, { useRef, useState } from 'react';
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
    experience_years?: number;
    photo?: string;
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
        experience_years: ''
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const drivers = useQuery(api.queries.getDrivers) as Driver[] | undefined;
    const companies = useQuery(api.queries.getCompanies) as Company[] | undefined;
    const createDriver = useMutation(api.mutations.createDriver);
    const deleteDriver = useMutation(api.mutations.deleteDriver);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl as any);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (driver?: Driver) => {
        if (driver) {
            setEditingDriver(driver);
            setFormData({
                name: driver.name,
                company_id: driver.company_id || '',
                routes: driver.routes?.join(', ') || '',
                experience_years: driver.experience_years?.toString() || ''
            });
            setPhotoPreview(driver.photo || null);
            setPhotoFile(null);
        } else {
            setEditingDriver(null);
            setFormData({ name: '', company_id: '', routes: '', experience_years: '' });
            setPhotoFile(null);
            setPhotoPreview(null);
        }
        setIsModalOpen(true);
    };

    const uploadPhoto = async (file: File): Promise<string | undefined> => {
        try {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });
            if (!response.ok) {
                console.error('Photo upload failed');
                return undefined;
            }
            const { storageId } = await response.json();
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
            let photoStorageId: string | undefined;
            if (photoFile) {
                photoStorageId = await uploadPhoto(photoFile);
            }
            await createDriver({
                name: formData.name,
                company_id: formData.company_id || undefined,
                routes: formData.routes.split(',').map(r => r.trim()).filter(Boolean),
                experience_years: formData.experience_years ? parseInt(formData.experience_years) : 0,
                photo: photoStorageId,
            });
            setIsModalOpen(false);
            setFormData({ name: '', company_id: '', routes: '', experience_years: '' });
            setPhotoFile(null);
            setPhotoPreview(null);
        } catch (error) {
            console.error('Failed to create driver:', error);
        }
        setUploading(false);
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
        {
            key: 'photo',
            label: 'Photo',
            width: '60px',
            render: (d: Driver) => (
                <div className="table-logo">
                    {d.photo ? <img src={d.photo} alt={d.name} /> : 'dY`"ƒ??ƒo^‹,?'}
                </div>
            )
        },
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
            render: (d: Driver) => d.experience_years ? `${d.experience_years} yrs` : '-'
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
                        <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
                            {uploading ? 'Uploading...' : editingDriver ? 'Update' : 'Create'}
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
                            value={formData.experience_years}
                            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                            placeholder="e.g., 5"
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Driver Photo</label>
                        <input
                            type="file"
                            ref={photoInputRef}
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                        <div
                            className="logo-upload-area"
                            onClick={() => photoInputRef.current?.click()}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Driver preview" className="logo-preview" />
                            ) : (
                                <div className="logo-placeholder">
                                    <span>dY"ú</span>
                                    <p>Click to upload photo</p>
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
          object-fit: cover;
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

export default AdminDrivers;
