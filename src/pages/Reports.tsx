import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
    const { assets, getCompanyAssets } = useData();
    const { user } = useAuth();
    const [reportType, setReportType] = useState<'MAINTENANCE' | 'ASSET_STATUS'>('MAINTENANCE');

    const relevantAssets = user?.role === 'ADMIN' ? assets : getCompanyAssets(user?.companyId || '');

    const generateReportData = () => {
        if (reportType === 'MAINTENANCE') {
            return relevantAssets.flatMap(asset =>
                asset.maintenanceHistory.map(log => ({
                    assetName: asset.name,
                    ...log
                }))
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            return relevantAssets.map(asset => ({
                name: asset.name,
                type: asset.type,
                status: asset.status,
                location: asset.location,
                purchaseDate: asset.purchaseDate
            }));
        }
    };

    const reportData = generateReportData();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Reports Generation</h2>
                    <p className="text-gray-500">Generate and download system reports</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="btn btn-primary gap-2"
                >
                    <Download size={20} />
                    Export / Print
                </button>
            </div>

            <div className="premium-card p-6 no-print">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setReportType('MAINTENANCE')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === 'MAINTENANCE'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Maintenance Logs
                    </button>
                    <button
                        onClick={() => setReportType('ASSET_STATUS')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === 'ASSET_STATUS'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Asset Status
                    </button>
                </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white p-8 shadow-lg rounded-none max-w-4xl mx-auto print:shadow-none print:w-full">
                <div className="text-center mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Management System</h1>
                    <h2 className="text-xl text-gray-600 uppercase tracking-wide">
                        {reportType === 'MAINTENANCE' ? 'Maintenance & Complaint Report' : 'Asset Inventory Status'}
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-800">
                            {reportType === 'MAINTENANCE' ? (
                                <>
                                    <th className="py-3 font-bold">Date</th>
                                    <th className="py-3 font-bold">Asset</th>
                                    <th className="py-3 font-bold">Type</th>
                                    <th className="py-3 font-bold">Description</th>
                                    <th className="py-3 font-bold">Status</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 font-bold">Asset Name</th>
                                    <th className="py-3 font-bold">Type</th>
                                    <th className="py-3 font-bold">Location</th>
                                    <th className="py-3 font-bold">Status</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item: any, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                {reportType === 'MAINTENANCE' ? (
                                    <>
                                        <td className="py-3 text-sm text-gray-600">{item.date}</td>
                                        <td className="py-3 font-medium">{item.assetName}</td>
                                        <td className="py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.type === 'COMPLAINT' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-gray-600">{item.description}</td>
                                        <td className="py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {item.status || 'Completed'}
                                            </span>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3 font-medium">{item.name}</td>
                                        <td className="py-3 text-sm text-gray-600">{item.type}</td>
                                        <td className="py-3 text-sm text-gray-600">{item.location}</td>
                                        <td className="py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' :
                                                        item.status === 'BROKEN' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
