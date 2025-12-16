
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Layers, Plus, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Departments: React.FC = () => {
    const { departments, addDepartment, deleteDepartment } = useData();
    const { user } = useAuth();
    const [newDeptName, setNewDeptName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;

        setLoading(true);
        setError('');
        try {
            await addDepartment(newDeptName.trim());
            setNewDeptName('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const dept = departments.find(d => d.id === id);
        if (dept?._count?.assets && dept._count.assets > 0) {
            alert('Cannot delete department with assigned assets.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await deleteDepartment(id);
            } catch (err: any) {
                alert(err.response?.data?.error || 'Failed to delete department');
            }
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="p-8 text-center text-gray-500">
                You do not have permission to view this page.
            </div>
        );
    }

    return (
        <div className="p-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Layers className="text-black" />
                    Departments
                </h1>
                <p className="text-gray-500">Manage sub-institutions and categories</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="premium-card p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus size={20} />
                            Add Department
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    placeholder="e.g. Computer Science"
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={loading || !newDeptName.trim()}
                                className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Adding...' : 'Add Department'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="premium-card overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">
                                Existing Departments ({departments.length})
                            </h2>
                        </div>
                        {departments.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No departments added yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {departments.map((dept) => (
                                    <div key={dept.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {dept._count?.assets || 0} Assets Assigned
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Department"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
