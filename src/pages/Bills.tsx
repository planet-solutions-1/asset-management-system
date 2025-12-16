import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, FileText, Download } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const Bills: React.FC = () => {
    const { bills, addBill, deleteBill, assets } = useData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'ELECTRICITY',
        assetId: '',
        fileUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addBill({
                amount: parseFloat(formData.amount),
                date: formData.date,
                type: formData.type,
                assetId: formData.assetId || undefined,
                fileUrl: formData.fileUrl || undefined,
                companyId: user?.companyId
            });
            setIsModalOpen(false);
            setFormData({
                amount: '',
                date: new Date().toISOString().split('T')[0],
                type: 'ELECTRICITY',
                assetId: '',
                fileUrl: ''
            });
        } catch (err) {
            alert('Failed to add bill');
        }
    };

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center run-in">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bills & Expenses</h1>
                    <p className="text-gray-500">Manage utility bills and maintenance expenses</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} />
                    Add Bill
                </button>
            </div>

            {bills.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Bills Found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Upload your first utility bill or expense receipt to start tracking costs.</p>
                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        Upload New Bill
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bills.map((bill) => (
                        <div key={bill.id} className="premium-card p-5 hover:shadow-lg transition-shadow bg-white rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{bill.type}</h3>
                                        <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteBill(bill.id)}
                                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-2xl font-bold text-gray-900">₹{bill.amount.toLocaleString()}</p>
                                {bill.asset && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Linked to: <span className="font-medium">{bill.asset.name}</span>
                                    </p>
                                )}
                            </div>

                            {bill.fileUrl && (
                                <a
                                    href={bill.fileUrl}
                                    download={`bill-${bill.id}`}
                                    className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Download Receipt
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Bill">
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
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Bill</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
