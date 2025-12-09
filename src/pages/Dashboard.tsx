import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Building2, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { assets, companies, getCompanyAssets } = useData();
    const navigate = useNavigate();

    const relevantAssets = user?.role === 'ADMIN' ? assets : getCompanyAssets(user?.companyId || '');

    const totalAssets = relevantAssets.length;
    const availableAssets = relevantAssets.filter(a => a.status === 'AVAILABLE').length;
    const maintenanceAssets = relevantAssets.filter(a => a.status === 'MAINTENANCE').length;
    const brokenAssets = relevantAssets.filter(a => a.status === 'BROKEN').length;
    const totalCompanies = companies.length;

    const barData = [
        { name: 'Available', value: availableAssets },
        { name: 'In Use', value: relevantAssets.filter(a => a.status === 'IN_USE').length },
        { name: 'Maintenance', value: maintenanceAssets },
        { name: 'Broken', value: brokenAssets },
    ];

    const pieData = [
        { name: 'Available', value: availableAssets },
        { name: 'In Use', value: relevantAssets.filter(a => a.status === 'IN_USE').length },
        { name: 'Issues', value: maintenanceAssets + brokenAssets },
    ];

    const COLORS = ['#4facfe', '#43e97b', '#fa709a', '#f5576c'];
    const PIE_COLORS = ['#4facfe', '#43e97b', '#f5576c'];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <p className="text-gray-500">Welcome back, {user?.name}</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Assets"
                    value={totalAssets}
                    gradient="card-1"
                />
                <StatsCard
                    title="Available"
                    value={availableAssets}
                    gradient="card-2"
                />
                <StatsCard
                    title="In Maintenance"
                    value={maintenanceAssets}
                    gradient="card-3"
                />
                {user?.role === 'ADMIN' && (
                    <StatsCard
                        title="Registered Companies"
                        value={totalCompanies}
                        gradient="card-4"
                    />
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Asset Status Bar Chart */}
                    <div className="premium-card p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Asset Status Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} barSize={50}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                        formatter={(value, name) => [value, name]}
                                    />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                        {barData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="premium-card p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-[#667eea]" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {relevantAssets
                                .flatMap(a => (a.maintenanceHistory || []).map(h => ({ ...h, assetName: a.name })))
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 5)
                                .map((log, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{log.type} - {log.assetName}</p>
                                            <p className="text-xs text-gray-500">
                                                {log.description} • {new Date(log.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`ml-auto px-2 py-1 text-xs rounded-full font-bold
                                            ${log.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                log.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'}`}>
                                            {log.status}
                                        </div>
                                    </div>
                                ))}
                            {relevantAssets.flatMap(a => a.maintenanceHistory || []).length === 0 && (
                                <p className="text-center text-gray-500 py-4">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Alerts */}
                <div className="space-y-8">
                    {/* Company Profile Card */}
                    {user?.role !== 'ADMIN' && (
                        <div className="premium-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" />
                                Company Profile
                            </h3>
                            {companies.find(c => c.id === user?.companyId) ? (
                                <div className="flex items-start gap-4">
                                    <img
                                        src={companies.find(c => c.id === user?.companyId)?.logo}
                                        alt="Company Logo"
                                        className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm"
                                    />
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">
                                            {companies.find(c => c.id === user?.companyId)?.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {companies.find(c => c.id === user?.companyId)?.address}
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                                                Premium Plan
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Company details not available.</p>
                            )}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="premium-card p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/assets')}
                                className="w-full py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors text-left px-4 flex items-center gap-3"
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm"><CheckCircle size={18} /></div>
                                Manage Assets
                            </button>
                            <button
                                onClick={() => navigate('/reports')} // Will implement reports later
                                className="w-full py-3 bg-purple-50 text-purple-600 font-semibold rounded-xl hover:bg-purple-100 transition-colors text-left px-4 flex items-center gap-3"
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm"><Activity size={18} /></div>
                                Generate Report
                            </button>
                            {user?.role === 'ADMIN' && (
                                <>
                                    <button
                                        onClick={() => navigate('/companies')}
                                        className="w-full py-3 bg-green-50 text-green-600 font-semibold rounded-xl hover:bg-green-100 transition-colors text-left px-4 flex items-center gap-3"
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><Building2 size={18} /></div>
                                        Manage Companies
                                    </button>
                                    <button
                                        onClick={() => navigate('/users')}
                                        className="w-full py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors text-left px-4 flex items-center gap-3"
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><UserIcon size={18} /></div>
                                        Manage Users
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => navigate('/bills')}
                                className="w-full py-3 bg-cyan-50 text-cyan-600 font-semibold rounded-xl hover:bg-cyan-100 transition-colors text-left px-4 flex items-center gap-3"
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm"><Activity size={18} /></div>
                                Manage Bills
                            </button>
                        </div>
                    </div>

                    {/* System Health / Alerts */}
                    <div className="premium-card p-6 bg-gradient-to-br from-orange-50 to-red-50 border-none">
                        <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Attention Needed
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-white/60 p-3 rounded-lg text-sm text-red-700 font-medium flex justify-between">
                                <span>Broken Assets</span>
                                <span className="font-bold">{brokenAssets}</span>
                            </div>
                            <div className="bg-white/60 p-3 rounded-lg text-sm text-orange-700 font-medium flex justify-between">
                                <span>In Maintenance</span>
                                <span className="font-bold">{maintenanceAssets}</span>
                            </div>

                            {/* Expiry Alerts */}
                            {relevantAssets.filter(a => a.amcExpiry && new Date(a.amcExpiry) < new Date(new Date().setDate(new Date().getDate() + 30))).length > 0 && (
                                <div className="bg-white/60 p-3 rounded-lg text-sm text-purple-700 font-medium">
                                    {relevantAssets.filter(a => a.amcExpiry && new Date(a.amcExpiry) < new Date(new Date().setDate(new Date().getDate() + 30))).length} Assets AMC Expiring Soon
                                </div>
                            )}

                            {relevantAssets.filter(a => new Date(a.warrantyExpiry) < new Date(new Date().setDate(new Date().getDate() + 30))).length > 0 && (
                                <div className="bg-white/60 p-3 rounded-lg text-sm text-blue-700 font-medium">
                                    {relevantAssets.filter(a => new Date(a.warrantyExpiry) < new Date(new Date().setDate(new Date().getDate() + 30))).length} Assets Warranty Expiring Soon
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Asset Health Pie Chart */}
                    <div className="premium-card p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Asset Health</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4facfe]"></div>Available</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#43e97b]"></div>In Use</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f5576c]"></div>Issues</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
