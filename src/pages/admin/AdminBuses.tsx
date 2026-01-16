import React, { useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/api';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';

interface Bus {
    _id: string;
    fleet_number: string;
    company_id?: string;
    company?: { name: string };
    route: string;
    type?: string;
    year?: number;
    rating_avg?: number;
    photos?: string[];
}

interface Company {
    _id: string;
    name: string;
}

const BUS_TYPES = [
    'Volvo B7RLE',
    'Mercedes Citaro',
    'MAN Lion\'s City',
    'BYD K9',
    'Alexander Dennis Enviro',
    'Scania Citywide',
    'Other'
];

const AdminBuses: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBus, setEditingBus] = useState<Bus | null>(null);
    const [formData, setFormData] = useState({
        fleet_number: '',
        company_id: '',
        route: '',
        type: '',
        year: ''
    });
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const buses = useQuery(api.queries.getBuses, { limit: 100 }) as Bus[] | undefined;
    const companies = useQuery(api.queries.getCompanies) as Company[] | undefined;
    const createBus = useMutation(api.mutations.createBus);
    const updateBus = useMutation(api.mutations.updateBus);
    const deleteBus = useMutation(api.mutations.deleteBus);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl as any);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter((file) =>
            file.type.startsWith('image/')
        );
        const previews = files.map((file) => URL.createObjectURL(file));
        setPhotoFiles((prev) => [...prev, ...files]);
        setPhotoPreviews((prev) => [...prev, ...previews]);
    };

    const removePhoto = (index: number) => {
        setPhotoPreviews((prev) => {
            const next = [...prev];
            const [removed] = next.splice(index, 1);
            if (removed) URL.revokeObjectURL(removed);
            return next;
        });
        setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOpenModal = (bus?: Bus) => {
        if (bus) {
            setEditingBus(bus);
            setFormData({
                fleet_number: bus.fleet_number,
                company_id: bus.company_id || '',
                route: bus.route,
                type: bus.type || '',
                year: bus.year?.toString() || ''
            });
            setPhotoPreviews(bus.photos || []);
            setPhotoFiles([]);
        } else {
            setEditingBus(null);
            setFormData({ fleet_number: '', company_id: '', route: '', type: '', year: '' });
            setPhotoFiles([]);
            setPhotoPreviews([]);
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
            const uploadedPhotos: string[] = [];
            for (const file of photoFiles) {
                const storageId = await uploadPhoto(file);
                if (storageId) uploadedPhotos.push(storageId);
            }

            if (editingBus) {
                await updateBus({
                    id: editingBus._id as any,
                    fleet_number: formData.fleet_number,
                    company_id: formData.company_id ? formData.company_id as any : undefined,
                    route: formData.route,
                    type: formData.type || undefined,
                    year: formData.year ? parseInt(formData.year) : undefined,
                    photos: uploadedPhotos.length > 0 ? uploadedPhotos : editingBus.photos,
                });
            } else {
                if (!formData.company_id) {
                    alert('Please select a company');
                    setUploading(false);
                    return;
                }
                await createBus({
                    fleet_number: formData.fleet_number,
                    company_id: formData.company_id as any,
                    route: formData.route,
                    type: formData.type || undefined,
                    year: formData.year ? parseInt(formData.year) : undefined,
                    photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
                });
            }

            setIsModalOpen(false);
            setFormData({ fleet_number: '', company_id: '', route: '', type: '', year: '' });
            setPhotoFiles([]);
            setPhotoPreviews([]);
        } catch (error) {
            console.error('Failed to save bus:', error);
        }
        setUploading(false);
    };

    const handleDelete = async (bus: Bus) => {
        if (window.confirm(`Delete bus ${bus.fleet_number}?`)) {
            try {
                await deleteBus({ id: bus._id as any });
            } catch (error) {
                console.error('Failed to delete bus:', error);
            }
        }
    };

    const columns = [
        {
            key: 'photos',
            label: 'Photo',
            width: '60px',
            render: (b: Bus) => (
                <div className="table-logo">
                    {b.photos?.[0] ? <img src={b.photos[0]} alt={b.fleet_number} /> : 'dY"ú'}
                </div>
            )
        },
        { key: 'fleet_number', label: 'Fleet #', width: '100px' },
        {
            key: 'company',
            label: 'Company',
            render: (b: Bus) => b.company?.name || '-'
        },
        { key: 'route', label: 'Route' },
        { key: 'type', label: 'Type', render: (b: Bus) => b.type || '-' },
        { key: 'year', label: 'Year', width: '80px', render: (b: Bus) => b.year || '-' },
        {
            key: 'rating_avg',
            label: 'Rating',
            width: '80px',
            render: (b: Bus) => (
                <span className="rating-badge">⭐ {b.rating_avg?.toFixed(1) || '0.0'}</span>
            )
        }
    ];

    const avgRating = buses?.length ?
        (buses.reduce((sum, b) => sum + (b.rating_avg || 0), 0) / buses.length).toFixed(1) :
        '0.0';

    const uniqueRoutes = new Set(buses?.map(b => b.route));

    return (
        <AdminLayout
            title="Buses"
            subtitle="Manage fleet vehicles"
            action={
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    + Add Bus
                </button>
            }
        >
            <div className="stats-grid">
                <StatsCard icon="🚌" value={buses?.length || 0} label="Total Buses" />
                <StatsCard icon="⭐" value={avgRating} label="Avg Rating" />
                <StatsCard icon="🛤️" value={uniqueRoutes.size} label="Active Routes" />
            </div>

            <DataTable
                columns={columns}
                data={buses || []}
                keyExtractor={(b) => b._id}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                emptyMessage="No buses yet. Add your first bus!"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBus ? 'Edit Bus' : 'Add Bus'}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
                            {uploading ? 'Uploading...' : editingBus ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fleet Number *</label>
                            <input
                                type="text"
                                value={formData.fleet_number}
                                onChange={(e) => setFormData({ ...formData, fleet_number: e.target.value })}
                                placeholder="e.g., GA001"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                placeholder="e.g., 2024"
                                min="1990"
                                max="2030"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Company *</label>
                        <select
                            value={formData.company_id}
                            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                            required
                        >
                            <option value="">Select Company</option>
                            {companies?.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Route *</label>
                        <input
                            type="text"
                            value={formData.route}
                            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                            placeholder="e.g., Route 104"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Bus Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="">Select Type</option>
                            {BUS_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Bus Photos</label>
                        <input
                            type="file"
                            ref={photoInputRef}
                            accept="image/*"
                            multiple
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={() => photoInputRef.current?.click()}
                        >
                            dY"ú Add Photos
                        </button>
                        {photoPreviews.length > 0 && (
                            <div className="media-preview-grid">
                                {photoPreviews.map((src, index) => (
                                    <div key={`${src}-${index}`} className="media-preview-item">
                                        <img src={src} alt="" className="preview-media" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="remove-media-btn"
                                        >
                                            A-
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminBuses;
