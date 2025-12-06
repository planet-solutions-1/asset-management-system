import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { Plus, Search, Trash2, User as UserIcon, Shield, Lock } from 'lucide-react';

export const Users: React.FC = () => {
    const { users, addUser, deleteUser } = useData();
    const { user: currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to remove this user? They will no longer be able to login.')) {
            try {
                await deleteUser(id);
            } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage access and roles for your company</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Add New User
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full bg-gray-100"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            {user.role === 'ADMIN' ? (
                                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg" title="Admin">
                                    <Shield size={16} />
                                </span>
                            ) : (
                                <span className="bg-gray-100 text-gray-500 p-1.5 rounded-lg" title="User">
                                    <UserIcon size={16} />
                                </span>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                                {user.role}
                            </span>

                            {user.id !== currentUser?.id && (
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    title="Remove User"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New User"
            >
                <AddUserForm
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await addUser(data);
                            setIsModalOpen(false);
                        } catch (error: any) {
                            alert(error.response?.data?.message || 'Failed to add user');
                        }
                    }}
                />
            </Modal>
        </div>
    );
};

const AddUserForm: React.FC<{
    onClose: () => void;
    onSubmit: (data: any) => void;
}> = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER'
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(formData);
            }}
            className="space-y-4"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="john@company.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="••••••••"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`
                        relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                        ${formData.role === 'USER' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-gray-300'}
                    `}>
                        <input
                            type="radio"
                            name="role"
                            value="USER"
                            checked={formData.role === 'USER'}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="sr-only"
                        />
                        <span className="font-medium text-sm">Regular User</span>
                    </label>

                    <label className={`
                        relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                        ${formData.role === 'ADMIN' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-gray-300'}
                    `}>
                        <input
                            type="radio"
                            name="role"
                            value="ADMIN"
                            checked={formData.role === 'ADMIN'}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="sr-only"
                        />
                        <span className="font-medium text-sm">Admin</span>
                    </label>
                </div>
            </div>

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
                    Create User
                </button>
            </div>
        </form>
    );
};
