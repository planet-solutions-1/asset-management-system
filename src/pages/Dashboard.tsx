import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatsCard } from '../components/dashboard/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Building2, User as UserIcon, ShieldAlert, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

import { Modal } from '../components/common/Modal';

interface ThreadAlert {
    id: string;
    message: string;
    type: string;
    isResolved: boolean;
    createdAt: string;
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { assets, companies, getCompanyAssets } = useData();
    const navigate = useNavigate();
    const { companyId } = useParams();

    const [isBreakdownOpen, setIsBreakdownOpen] = React.useState(false);
    // Security Alerts State
    const [securityAlerts, setSecurityAlerts] = React.useState<ThreadAlert[]>([]);

    // Fetch alerts for Admin
    React.useEffect(() => {
        if (user?.role === 'ADMIN') {
            api.get('/alerts').then(res => setSecurityAlerts(res.data)).catch(console.error);
        }
    }, [user]);

    const handleResolveAlert = async (id: string) => {
        try {
            await api.put(`/alerts/${id}/resolve`);
            setSecurityAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true } : a));
        } catch (err) {
            console.error('Failed to resolve alert', err);
        }
    };

    // If Admin is viewing a specific company dashboard, use that ID. Otherwise fallback to user's company or show all for admin on main dash.
    const targetCompanyId = user?.role === 'ADMIN' && companyId ? companyId : user?.companyId;

    const relevantAssets = user?.role === 'ADMIN' && !targetCompanyId
        ? assets
        : getCompanyAssets(targetCompanyId || '');

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

    const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444'];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {targetCompanyId
                            ? `${companies.find(c => c.id === targetCompanyId)?.name} Dashboard`
                            : 'Dashboard Overview'}
                    </h2>
                    <p className="text-gray-500">Welcome back, {user?.name}</p>
                    {targetCompanyId && companies.find(c => c.id === targetCompanyId)?.sector && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            {companies.find(c => c.id === targetCompanyId)?.sector}
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-lg shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* SECURITY ALERTS SECTION (ADMIN ONLY) */}
            {user?.role === 'ADMIN' && securityAlerts.some(a => !a.isResolved) && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                        <ShieldAlert className="text-red-600" />
                        Security Warnings
                    </h3>
                    <div className="space-y-3">
                        {securityAlerts.filter(a => !a.isResolved).map(alert => (
                            <div key={alert.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Suspicious Activity Detected</p>
                                    <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleResolveAlert(alert.id)}
                                    className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 shrink-0"
                                >
                                    <Check size={14} />
                                    Dismiss
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Assets"
                    value={totalAssets}
                    gradient="card-1"
                    icon={Activity}
                    onClick={() => setIsBreakdownOpen(true)}
                />
                <StatsCard
                    title="Available"
                    value={availableAssets}
                    gradient="card-2"
                    icon={CheckCircle}
                />
                <StatsCard
                    title="In Maintenance"
                    value={maintenanceAssets}
                    gradient="card-3"
                    icon={Clock}
                />
                {!targetCompanyId && (
                    <StatsCard
                        title="Registered Companies"
                        value={totalCompanies}
                        gradient="card-4"
                        icon={Building2}
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
                                <BarChart data={barData} barSize={40}>
                                    <defs>
                                        <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorInUse" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorBroken" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 4 }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                            color: '#1e293b',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {barData.map((entry, index) => {
                                            const colorMap: Record<string, string> = {
                                                'Available': 'url(#colorAvailable)',
                                                'In Use': 'url(#colorInUse)',
                                                'Maintenance': 'url(#colorMaintenance)',
                                                'Broken': 'url(#colorBroken)'
                                            };
                                            return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#3b82f6'} />;
                                        })}
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
                    {(user?.role !== 'ADMIN' || targetCompanyId) && (
                        <div className="premium-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" />
                                {user?.role === 'ADMIN' ? 'Company Details' : 'Company Profile'}
                            </h3>
                            {companies.find(c => c.id === (targetCompanyId || user?.companyId)) ? (
                                <div className="flex items-start gap-4">
                                    <img
                                        src={companies.find(c => c.id === (targetCompanyId || user?.companyId))?.logo}
                                        alt="Company Logo"
                                        className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm"
                                    />
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">
                                            {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.name}
                                        </h4>
                                        <div className="space-y-1 mt-2 text-sm text-gray-600">
                                            {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.address && (
                                                <p className="flex items-start gap-2">
                                                    <span className="font-semibold text-gray-700 shrink-0">Address:</span>
                                                    {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.address}
                                                </p>
                                            )}
                                            {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.location && (
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700 shrink-0">Location:</span>
                                                    {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.location}
                                                </p>
                                            )}
                                            {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.contact && (
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700 shrink-0">Contact:</span>
                                                    {companies.find(c => c.id === (targetCompanyId || user?.companyId))?.contact}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                                                Active Plan
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
                        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/assets')}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 group transition-all duration-300"
                            >
                                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 group-hover:bg-white/20 group-hover:text-white transition-colors mb-3">
                                    <CheckCircle size={24} />
                                </div>
                                <span className="font-bold text-gray-700 group-hover:text-white text-sm">Manage Assets</span>
                            </button>

                            {user?.role === 'ADMIN' && (
                                <>
                                    <button
                                        onClick={() => navigate('/companies')}
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-emerald-600 group transition-all duration-300"
                                    >
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600 group-hover:bg-white/20 group-hover:text-white transition-colors mb-3">
                                            <Building2 size={24} />
                                        </div>
                                        <span className="font-bold text-gray-700 group-hover:text-white text-sm">Companies</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/users')}
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-violet-600 group transition-all duration-300"
                                    >
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-violet-600 group-hover:bg-white/20 group-hover:text-white transition-colors mb-3">
                                            <UserIcon size={24} />
                                        </div>
                                        <span className="font-bold text-gray-700 group-hover:text-white text-sm">Users</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => navigate('/bills')}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-cyan-600 group transition-all duration-300"
                            >
                                <div className="p-3 bg-white rounded-xl shadow-sm text-cyan-600 group-hover:bg-white/20 group-hover:text-white transition-colors mb-3">
                                    <Activity size={24} />
                                </div>
                                <span className="font-bold text-gray-700 group-hover:text-white text-sm">Manage Bills</span>
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

            {/* Asset Breakdown Modal */}
            <Modal isOpen={isBreakdownOpen} onClose={() => setIsBreakdownOpen(false)} title="Asset Inventory Breakdown">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(relevantAssets.reduce((acc, asset) => {
                        acc[asset.type] = (acc[asset.type] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>))
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => (
                            <div key={type} className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                <h4 className="text-gray-500 text-xs font-bold uppercase mb-1">{type}</h4>
                                <p className="text-2xl font-bold text-gray-800">{count}</p>
                            </div>
                        ))}
                    {relevantAssets.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-4">No assets found</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => navigate('/assets')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        View Full Asset List
                    </button>
                </div>
            </Modal>
        </div>
    );
};
