import React, { useState } from 'react';
import { Asset } from '../../types';

interface BillFormProps {
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    assets: Asset[];
    companyId?: string; // Optional context
}

export const BillForm: React.FC<BillFormProps> = ({ onClose, onSubmit, assets }) => {
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'ELECTRICITY',
        assetId: '',
        fileUrl: ''
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, fileUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                amount: parseFloat(formData.amount),
                date: formData.date,
                type: formData.type,
                assetId: formData.assetId || undefined,
                fileUrl: formData.fileUrl || undefined,
            });
        } catch (err) {
            console.error(err);
            alert('Failed to add bill');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Type</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="ELECTRICITY">Electricity</option>
                    <option value="INTERNET">Internet</option>
                    <option value="AMC">AMC</option>
                    <option value="REPAIR">Repair</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Asset (Optional)</label>
                <select
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="">None</option>
                    {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill/Receipt Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Bill</button>
            </div>
        </form>
    );
};
