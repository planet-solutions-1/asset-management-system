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
                "fixed lg:static inset-y-0 left-0 z-50 w-72 m-4 sidebar-panel rounded-3xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:transform-none lg:translate-x-0 flex flex-col h-[calc(100vh-2rem)]",
                isOpen ? "translate-x-0" : "-translate-x-[120%]"
            )}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center justify-between lg:hidden mb-8">
                        <span className="text-xl font-bold text-gray-800 tracking-tight">Menu</span>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-2 mb-8 hidden lg:flex">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">A</div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">Asset.Sys</span>
                    </div>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Overview</p>

                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                                        isActive
                                            ? 'bg-blue-50 text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    )
                                }

                            >
                                <div className={clsx(
                                    "p-1.5 rounded-lg transition-colors",
                                    // Use a simpler approach: Apply colors based on active state or hover
                                    // But user asked for "only add colour to the icons"
                                    "text-blue-600 bg-blue-100/50 group-hover:bg-blue-600 group-hover:text-white"
                                )}>
                                    <item.icon size={18} />
                                </div>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>


                    <div className="mt-auto pt-6 border-t border-gray-100 lg:hidden">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
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
