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
    const [breakdownType, setBreakdownType] = React.useState<'ALL' | 'AVAILABLE' | 'MAINTENANCE'>('ALL');
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

    // If Admin is viewing a specific company dashboard, use that ID. 
    // If Admin is on main dashboard, show Global Stats (targetCompanyId = null).
    // Regular users always see their company dashboard.
    const targetCompanyId = user?.role === 'ADMIN' ? (companyId || null) : user?.companyId;

    const relevantAssets = user?.role === 'ADMIN' && !targetCompanyId
        ? assets
        : getCompanyAssets(targetCompanyId || '');

    // Helper to open specific breakdown
    const openBreakdown = (type: 'ALL' | 'AVAILABLE' | 'MAINTENANCE') => {
        setBreakdownType(type);
        setIsBreakdownOpen(true);
    };

    // Filter assets for the modal based on selected card
    const assetsForBreakdown = React.useMemo(() => {
        if (breakdownType === 'ALL') return relevantAssets;
        return relevantAssets.filter(a => a.status === breakdownType);
    }, [relevantAssets, breakdownType]);

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
                    onClick={() => openBreakdown('ALL')}
                />
                <StatsCard
                    title="Available"
                    value={availableAssets}
                    gradient="card-2"
                    icon={CheckCircle}
                    onClick={() => openBreakdown('AVAILABLE')}
                />
                <StatsCard
                    title="In Maintenance"
                    value={maintenanceAssets}
                    gradient="card-3"
                    icon={Clock}
                    onClick={() => openBreakdown('MAINTENANCE')}
                />
                {user?.role === 'ADMIN' && (
                    <StatsCard
                        title="Registered Companies"
                        value={totalCompanies}
                        gradient="card-4"
                        icon={Building2}
                    />
                )}
            </div>

// ... (skip to modal)

            {/* Asset Breakdown Modal */}
            <Modal
                isOpen={isBreakdownOpen}
                onClose={() => setIsBreakdownOpen(false)}
                title={`${breakdownType === 'ALL' ? 'Total' : breakdownType === 'AVAILABLE' ? 'Available' : 'In Maintenance'} Assets Breakdown`}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(assetsForBreakdown.reduce((acc, asset) => {
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
                    {assetsForBreakdown.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-4">No assets found for this category</p>
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
