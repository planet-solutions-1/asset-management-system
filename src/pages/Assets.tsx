
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Asset, AssetStatus, AssetType } from '../types';
import { Modal } from '../components/common/Modal';
import { Plus, Search, MoreVertical, Image as ImageIcon, AlertCircle, X, Building2 } from 'lucide-react';

export const Assets: React.FC = () => {
    const { user } = useAuth();
    const { assets, addAsset, updateAsset, deleteAsset, getCompanyAssets, departments, addDepartment } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<AssetType | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<AssetStatus | 'ALL'>('ALL');
    const [filterDepartment] = useState('ALL'); // Fixed: Removed unused setter as per user request to hide filter UI
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [selectedAssetForComplaint, setSelectedAssetForComplaint] = useState<Asset | null>(null);

    const relevantAssets = user?.role === 'ADMIN' ? assets : getCompanyAssets(user?.companyId || '');

    const filteredAssets = relevantAssets.filter((asset) => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || asset.type === filterType;
        const matchesStatus = filterStatus === 'ALL' || asset.status === filterStatus;
        const matchesDepartment = filterDepartment === 'ALL' || asset.departmentId === filterDepartment;
        return matchesSearch && matchesType && matchesStatus && matchesDepartment;
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add New Asset
                </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center bg-white/80 backdrop-blur-xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search assets by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 shadow-sm focus:bg-white"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-600 hover:border-blue-300 transition-colors shadow-sm cursor-pointer w-full md:w-auto"
                        >
                            <option value="ALL">All Types</option>
                            <option value="AC">AC</option>
                            <option value="FAN">Fan</option>
                            <option value="GENERATOR">Generator</option>
                            <option value="COMPUTER">Computer</option>
                            <option value="PRINTER">Printer</option>
                            <option value="PROJECTOR">Projector</option>
                            <option value="SERVER">Server</option>
                            <option value="VEHICLE">Vehicle</option>
                            <option value="FURNITURE">Furniture</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                    <div className="relative group">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-600 hover:border-blue-300 transition-colors shadow-sm cursor-pointer w-full md:w-auto"
                        >
                            <option value="ALL">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="IN_USE">In Use</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="BROKEN">Broken</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>

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
                        <div key={asset.id} className="premium-card group relative flex flex-col h-full bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                            <div className="relative h-48 bg-slate-100 overflow-hidden rounded-t-2xl">
                                {asset.image ? (
                                    <img src={asset.image} alt={asset.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300">
                                        <ImageIcon size={40} className="opacity-50" />
                                    </div>
                                )}
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border border-white/20
                    ${asset.status === 'AVAILABLE' ? 'bg-emerald-500/90 text-white' :
                                        asset.status === 'MAINTENANCE' ? 'bg-amber-500/90 text-white' :
                                            asset.status === 'BROKEN' ? 'bg-red-500/90 text-white' :
                                                'bg-blue-500/90 text-white'
                                    } `}
                                >
                                    {asset.status.replace('_', ' ')}
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1" title={asset.name}>{asset.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                {asset.type}
                                            </span>
                                            {asset.departmentId && (
                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 truncate max-w-[100px]">
                                                    {departments.find(d => d.id === asset.departmentId)?.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>


                                <div className="space-y-3 text-sm text-gray-600 mt-2 mb-4 flex-1">
                                    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                            <span className="text-[10px] font-bold">ID</span>
                                        </div>
                                        <span className="font-mono text-gray-700 text-xs">#{asset.id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <Building2 size={14} />
                                        </div>
                                        <span className="truncate">{asset.location}</span>
                                    </div>
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
                    onSubmit={async (data, newDeptName) => {
                        try {
                            let finalDepartmentId = data.departmentId;

                            // Create new department if name provided
                            if (newDeptName && newDeptName.trim()) {
                                const newDept = await addDepartment(newDeptName.trim());
                                finalDepartmentId = newDept?.id;
                            }

                            const assetData = {
                                ...data,
                                departmentId: finalDepartmentId === 'NEW' ? undefined : finalDepartmentId, // Ensure no 'NEW' id
                                // Sanitize optional fields
                                amcExpiry: data.amcExpiry === '' ? undefined : data.amcExpiry,
                                image: data.image === '' ? undefined : data.image,
                            };

                            if (editingAsset) {
                                await updateAsset({ ...editingAsset, ...assetData });
                            } else {
                                await addAsset({
                                    id: undefined,
                                    maintenanceHistory: [],
                                    ...assetData,
                                } as any);
                            }
                            handleCloseModal();
                        } catch (error: any) {
                            const msg = error.response?.data?.message || error.message || 'Failed to save asset';
                            alert(`Error: ${msg} `);
                            console.error(error);
                        }
                    }}

                    user={user}
                    departments={departments}
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
                                    ...(selectedAssetForComplaint.maintenanceHistory || []),
                                    {
                                        id: `m${Date.now()} `,
                                        assetId: selectedAssetForComplaint.id,
                                        date: new Date().toISOString().split('T')[0],
                                        type: 'COMPLAINT',
                                        description: complaint.description,
                                        performedBy: user?.name || 'Unknown',
                                        status: 'PENDING',
                                    } as any
                                ]
                            };
                            updateAsset(updatedAsset);
                        }
                        setIsComplaintModalOpen(false);
                    }}
                />
            </Modal>
        </div >
    );
};

// Simplified Form Component
const AssetForm: React.FC<{
    initialData: Asset | null;
    onClose: () => void;
    onSubmit: (data: Partial<Asset>, newDeptName?: string) => void;
    user: any;
    departments: any[];
}> = ({ initialData, onClose, onSubmit, user, departments }) => {
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
            isPowered: false,
            departmentId: '',
            industryCategory: '',
        }
    );
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isCreatingDept, setIsCreatingDept] = useState(false);

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
                onSubmit(formData, newDepartmentName);
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry Category</label>
                    <select
                        value={formData.industryCategory}
                        onChange={(e) => setFormData({ ...formData, industryCategory: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="">Select Category</option>
                        <option value="IT Company">IT Company</option>
                        <option value="Production Company">Production Company</option>
                        <option value="Public Sector">Public Sector</option>
                        <option value="Private Sector">Private Sector</option>
                        <option value="College">College</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="space-y-2">
                        <select
                            value={isCreatingDept ? 'NEW' : (formData.departmentId || '')}
                            onChange={(e) => {
                                if (e.target.value === 'NEW') {
                                    setIsCreatingDept(true);
                                    setFormData({ ...formData, departmentId: '' });
                                } else {
                                    setIsCreatingDept(false);
                                    setFormData({ ...formData, departmentId: e.target.value });
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">No Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                            <option value="NEW" className="font-bold text-blue-600">+ Add New Department</option>
                        </select>
                        {isCreatingDept && (
                            <input
                                type="text"
                                value={newDepartmentName}
                                onChange={(e) => setNewDepartmentName(e.target.value)}
                                placeholder="Enter department name"
                                className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                autoFocus
                            />
                        )}
                    </div>

                </div>
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
                        <option value="PRINTER">Printer</option>
                        <option value="PROJECTOR">Projector</option>
                        <option value="SERVER">Server</option>
                        <option value="VEHICLE">Vehicle</option>
                        <option value="FURNITURE">Furniture</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Power Type</label>
                    <select
                        value={formData.isPowered ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, isPowered: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="false">Non-Powered</option>
                        <option value="true">Powered</option>
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
            {
                user?.role !== 'ADMIN' && (
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
                )
            }

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
        </form >
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
