import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Search } from 'lucide-react';

export const Companies: React.FC = () => {
    const { companies, assets } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSector, setFilterSector] = useState('ALL');

    const filteredCompanies = companies.filter(c =>
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

                        <div className="flex gap-4 w-full sm:w-auto">
                            <select
                                value={filterSector}
                                onChange={(e) => setFilterSector(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors bg-white text-gray-700"
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
                            <div key={company.id} className="premium-card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="w-16 h-16 rounded-xl object-cover shadow-sm"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{company.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
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

                                <div className="flex items-start gap-2 text-gray-500 text-sm">
                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                    <p>{company.address}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <button className="text-[#667eea] font-semibold text-sm hover:underline">
                                        View Details
                                    </button>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Building2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
