import React, { useState } from 'react';
import { Asset, AssetType, AssetStatus } from '../../types';
import { ImageIcon, X } from 'lucide-react';

interface AssetFormProps {
    initialData: Asset | null;
    onClose: () => void;
    onSubmit: (data: Partial<Asset>, newDeptName?: string) => void;
    user: any;
    departments: any[];
}

export const AssetForm: React.FC<AssetFormProps> = ({ initialData, onClose, onSubmit, user, departments }) => {
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
                        value={formData.industryCategory || ''}
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

            {/* Only show image upload for non-admin users, or if Admin wants to add? 
                Original code hid it for ADMIN. I'll keep logic same.
            */}
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
