import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Settings, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Box, label: 'Assets', path: '/assets' },
        ...(user?.role === 'ADMIN' ? [{ icon: Building2, label: 'Companies', path: '/companies' }] : []),
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white shadow-xl z-10 flex flex-col hidden lg:flex">
            <div className="p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</p>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
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
            </div>
        </aside>
    );
};
