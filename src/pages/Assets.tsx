import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Asset, AssetStatus, AssetType } from '../types';
import { Modal } from '../components/common/Modal';
import { Plus, Search, MoreVertical, Image as ImageIcon, Calendar, AlertCircle, X, Building2 } from 'lucide-react';

export const Assets: React.FC = () => {
    const { user } = useAuth();
    const { assets, addAsset, updateAsset, deleteAsset, getCompanyAssets } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<AssetType | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<AssetStatus | 'ALL'>('ALL');
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [selectedAssetForComplaint, setSelectedAssetForComplaint] = useState<Asset | null>(null);

    const relevantAssets = user?.role === 'ADMIN' ? assets : getCompanyAssets(user?.companyId || '');

    const filteredAssets = relevantAssets.filter((asset) => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || asset.type === filterType;
        const matchesStatus = filterStatus === 'ALL' || asset.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            deleteAsset(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    if (!user) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assets Management</h1>
                    <p className="text-gray-500">Manage and track all property assets</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Add New Asset
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="ALL">All Types</option>
                        <option value="AC">AC</option>
                        <option value="FAN">Fan</option>
                        <option value="GENERATOR">Generator</option>
                        <option value="COMPUTER">Computer</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="BROKEN">Broken</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">No assets found matching your criteria.</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-medium hover:underline">
                            Add your first asset
                        </button>
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <div key={asset.id} className="card group overflow-hidden">
                            {/* ... asset card content ... */}
                            <div className="relative h-48 bg-gray-100">
                                {asset.image ? (
                                    <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                        asset.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' :
                                            asset.status === 'BROKEN' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'}`}
                                >
                                    {asset.status.replace('_', ' ')}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{asset.name}</h3>
                                        <p className="text-sm text-gray-500">{asset.type}</p>
                                    </div>
                                    <div className="relative">
                                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-gray-400" />
                                        {asset.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        Warranty: {asset.warrantyExpiry}
                                    </div>
                                    {asset.amcExpiry && (
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <AlertCircle size={16} />
                                            AMC: {asset.amcExpiry}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setSelectedAssetForComplaint(asset);
                                            setIsComplaintModalOpen(true);
                                        }}
                                        className="w-full py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle size={16} />
                                        Report Issue
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
            >
                <AssetForm
                    initialData={editingAsset}
                    onClose={handleCloseModal}
                    onSubmit={async (data) => {
                        try {
                            if (editingAsset) {
                                updateAsset({ ...editingAsset, ...data });
                            } else {
                                await addAsset({
                                    // Backend generates ID
                                    id: undefined,
                                    companyId: user?.companyId,
                                    maintenanceHistory: [],
                                    ...data,
                                } as any);
                            }
                            handleCloseModal();
                        } catch (error) {
                            alert('Failed to save asset. Please try again.');
                            console.error(error);
                        }
                    }}
                    user={user}
                />
            </Modal>

            <Modal
                isOpen={isComplaintModalOpen}
                onClose={() => setIsComplaintModalOpen(false)}
                title="Report Issue / Complaint"
            >
                <ComplaintForm
                    asset={selectedAssetForComplaint}
                    onClose={() => setIsComplaintModalOpen(false)}
                    onSubmit={(complaint) => {
                        if (selectedAssetForComplaint) {
                            const updatedAsset = {
                                ...selectedAssetForComplaint,
                                status: 'MAINTENANCE' as AssetStatus, // Auto set to maintenance
                                maintenanceHistory: [
                                    ...selectedAssetForComplaint.maintenanceHistory,
                                    {
                                        id: `m${Date.now()}`,
                                        assetId: selectedAssetForComplaint.id,
                                        date: new Date().toISOString().split('T')[0],
                                        type: 'COMPLAINT',
                                        description: complaint.description,
                                        performedBy: user?.name || 'Unknown',
                                        status: 'PENDING',
                                    } as any // Type casting for simplicity in this step
                                ]
                            };
                            updateAsset(updatedAsset);
                        }
                        setIsComplaintModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
};

// Simplified Form Component
const AssetForm: React.FC<{
    initialData: Asset | null;
    onClose: () => void;
    onSubmit: (data: Partial<Asset>) => void;
    user: any; // Using any for simplicity here, ideally User type
}> = ({ initialData, onClose, onSubmit, user }) => {
    const [formData, setFormData] = useState<Partial<Asset>>(
        initialData || {
            name: '',
            type: 'AC',
            status: 'AVAILABLE',
            location: '',
            purchaseDate: '',
            warrantyExpiry: '',
            amcExpiry: '',
            image: '',
        }
    );

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(formData);
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="AC">AC</option>
                        <option value="FAN">Fan</option>
                        <option value="GENERATOR">Generator</option>
                        <option value="COMPUTER">Computer</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="BROKEN">Broken</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                    <input
                        type="date"
                        required
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
                    <input
                        type="date"
                        required
                        value={formData.warrantyExpiry}
                        onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AMC Expiry</label>
                    <input
                        type="date"
                        value={formData.amcExpiry || ''}
                        onChange={(e) => setFormData({ ...formData, amcExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Only show image upload for non-admin users */}
            {user?.role !== 'ADMIN' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                        <div className="space-y-1 text-center">
                            {formData.image ? (
                                <div className="relative">
                                    <img src={formData.image} alt="Preview" className="mx-auto h-32 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload a file</span>
                                            <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save Asset
                </button>
            </div>
        </form>
    );
};

const ComplaintForm: React.FC<{
    asset: Asset | null;
    onClose: () => void;
    onSubmit: (data: { description: string }) => void;
}> = ({ asset, onClose, onSubmit }) => {
    const [description, setDescription] = useState('');

    if (!asset) return null;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ description });
            }}
            className="space-y-4"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    {asset.name} ({asset.type})
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Describe the issue in detail..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    Submit Complaint
                </button>
            </div>
        </form>
    );
};
