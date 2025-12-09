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
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:transform-none lg:translate-x-0 flex flex-col h-full",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between lg:hidden mb-8">
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Menu</span>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-2 mb-8 hidden lg:flex">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Asset.Sys</span>
                    </div>

                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 px-2">Overview</p>

                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-black text-white shadow-lg shadow-black/5'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
