import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Settings, Building2, User as UserIcon, X, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Box, label: 'Assets', path: '/assets' },
        { icon: FileText, label: 'Bills', path: '/bills' },
        ...(user?.role === 'ADMIN'
            ? [
                { icon: Building2, label: 'Companies', path: '/companies' },
                { icon: UserIcon, label: 'Users', path: '/users' }
            ]
            : []),
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out lg:transform-none lg:flex flex-col h-full",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between lg:hidden mb-6">
                        <span className="text-xl font-bold text-gray-800">Menu</span>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 hidden lg:block">Main Menu</p>

                    <nav className="space-y-2 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose()} // Close sidebar on nav click (mobile)
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    )
                                }
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-gray-100 lg:hidden">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
