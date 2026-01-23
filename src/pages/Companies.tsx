import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Search, Trash2, Box, FileText, Plus, X, AlertCircle } from 'lucide-react';
import { AssetForm } from '../components/forms/AssetForm';
import { BillForm } from '../components/forms/BillForm';
import { Modal } from '../components/common/Modal';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export const Companies: React.FC = () => {
    const { companies, assets, deleteCompany, addCompany, addAsset, addBill, addDepartment, departments } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialSector = searchParams.get('sector');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSector, setFilterSector] = useState(initialSector || 'ALL');

    // Update filter if URL param changes
    useEffect(() => {
        const sector = searchParams.get('sector');
        if (sector) setFilterSector(sector);
    }, [searchParams]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);

    const [newCompany, setNewCompany] = useState({
        name: '',
        address: '',
        location: '',
        contact: '',
        sector: '',
        logo: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await addCompany(newCompany);
            setIsAddModalOpen(false);
            setNewCompany({ name: '', address: '', location: '', contact: '', sector: '', logo: '', email: '', password: '' });
        } catch (err: any) {
            console.error('Registration Error:', err);
            let errorMessage = err.response?.data?.message;
            if (!errorMessage) {
                if (err.response) {
                    errorMessage = `Server Error (${err.response.status}): ${typeof err.response.data === 'string' ? err.response.data.substring(0, 100) : JSON.stringify(err.response.data)}`;
                } else if (err.request) {
                    errorMessage = 'Network Error: No response from server. Check your connection.';
                } else {
                    errorMessage = err.message || 'Unknown Error';
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAsset = async (data: any, newDeptName?: string) => {
        if (!selectedCompanyId) return;
        try {
            let deptId = data.departmentId;
            // Admin adding asset to a company - Departments are global? Or per company?
            // The schema says Department has NO companyId. So departments are global?
            // Let's assume global for now or that it doesn't matter for Admin.
            // Wait, if departments are global, fine.
            if (newDeptName) {
                const newDept = await addDepartment(newDeptName);
                deptId = newDept.id;
            }
            await addAsset({
                ...data,
                departmentId: deptId,
                companyId: selectedCompanyId
            });
            setIsAssetModalOpen(false);
            setSelectedCompanyId(null);
        } catch (err) {
            console.error('Failed to add asset', err);
            alert('Failed to add asset');
        }
    };

    const handleAddBill = async (data: any) => {
        if (!selectedCompanyId) return;
        try {
            await addBill({
                ...data,
                companyId: selectedCompanyId
            });
            setIsBillModalOpen(false);
            setSelectedCompanyId(null);
        } catch (err) {
            console.error('Failed to add bill', err);
            alert('Failed to add bill');
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name !== 'Planet Solutions' &&
        (filterSector === 'ALL' || c.sector === filterSector) &&
        (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getCompanyAssetCount = (companyId: string) => {
        return assets.filter(a => a.companyId === companyId).length;
    };

    const sectors = [
        "IT Company", "Production Company", "Public Sector",
        "Private Office", "Government Office", "College",
        "Cooperative", "Other"
    ];

    return (
        <div className="space-y-6">
            {/* Redirect non-admins */}
            {user?.role !== 'ADMIN' && (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
                    <p className="text-gray-500">You do not have permission to view this page.</p>
                </div>
            )}

            {user?.role === 'ADMIN' && (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Registered Companies</h2>
                            <p className="text-gray-500">Manage all companies using the platform</p>
                        </div>

                        <div className="flex gap-4 w-full sm:w-auto items-center">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                <Plus size={20} />
                                Add Company
                            </button>
                            {/* ... filters ... */}
                            <select
                                value={filterSector}
                                onChange={(e) => setFilterSector(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors bg-white text-gray-700 hidden sm:block"
                            >
                                <option value="ALL">All Categories</option>
                                {sectors.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((company) => (
                            <div key={company.id} className="premium-card p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-xl group relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={company.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}
                                        alt={company.name}
                                        className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{company.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                                {getCompanyAssetCount(company.id)} Assets
                                            </span>
                                            {company.sector && (
                                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                                                    {company.sector}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-gray-500 text-sm mb-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                                        <p className="line-clamp-2">{company.address}</p>
                                    </div>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => {
                                            setSelectedCompanyId(company.id);
                                            setIsAssetModalOpen(true);
                                        }}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                                        title="Add Asset"
                                    >
                                        <Box size={14} />
                                        Add Asset
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCompanyId(company.id);
                                            setIsBillModalOpen(true);
                                        }}
                                        className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5"
                                        title="Add Bill"
                                    >
                                        <FileText size={14} />
                                        Add Bill
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <button
                                        onClick={() => navigate(`/companies/${company.id}/dashboard`)}
                                        className="text-gray-700 font-semibold text-sm hover:text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View Dashboard
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Are you sure you want to delete ${company.name}? This cannot be undone.`)) {
                                                await deleteCompany(company.id);
                                            }
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Company"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Company Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900">Register New Company</h3>
                                    <button onClick={() => { setIsAddModalOpen(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleAddCompany} className="p-6 space-y-4">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
                                            <AlertCircle size={20} />
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCompany.name}
                                            onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                                        <select
                                            value={newCompany.sector}
                                            onChange={e => setNewCompany({ ...newCompany, sector: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select Sector</option>
                                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                            <input
                                                type="text"
                                                value={newCompany.contact}
                                                onChange={e => setNewCompany({ ...newCompany, contact: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="+1 234..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={newCompany.location}
                                                onChange={e => setNewCompany({ ...newCompany, location: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                        <textarea
                                            required
                                            value={newCompany.address}
                                            onChange={e => setNewCompany({ ...newCompany, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                                            placeholder="Detailed address..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={newCompany.logo}
                                            onChange={e => setNewCompany({ ...newCompany, logo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Admin Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={newCompany.email}
                                                onChange={e => setNewCompany({ ...newCompany, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="admin@company.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newCompany.password}
                                                onChange={e => setNewCompany({ ...newCompany, password: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddModalOpen(false); setError(''); }}
                                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Registering...
                                                </>
                                            ) : (
                                                'Register Company'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Asset Modal */}
                    <Modal isOpen={isAssetModalOpen} onClose={() => { setIsAssetModalOpen(false); setSelectedCompanyId(null); }} title="Add New Asset">
                        <AssetForm
                            initialData={null}
                            onClose={() => { setIsAssetModalOpen(false); setSelectedCompanyId(null); }}
                            onSubmit={handleAddAsset}
                            user={user}
                            departments={departments}
                        />
                    </Modal>

                    {/* Bill Modal */}
                    <Modal isOpen={isBillModalOpen} onClose={() => { setIsBillModalOpen(false); setSelectedCompanyId(null); }} title="Add New Bill">
                        <BillForm
                            onClose={() => { setIsBillModalOpen(false); setSelectedCompanyId(null); }}
                            onSubmit={handleAddBill}
                            assets={selectedCompanyId ? assets.filter(a => a.companyId === selectedCompanyId) : []}
                            companyId={selectedCompanyId || undefined}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};
