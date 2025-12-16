import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, LogOut } from 'lucide-react';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 px-4 md:px-8 flex items-center justify-between premium-header z-30 sticky top-0 transition-all duration-200">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:bg-white/10 rounded-lg lg:hidden transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white truncate lg:hidden">Asset.Sys</h1>

                {/* Search Bar - Desktop */}
                <div className="hidden md:block relative w-96 ml-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets, invoices..."
                        className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg text-sm transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-white leading-tight">{user?.name}</p>
                    <p className="text-xs font-medium text-gray-400">{user?.role === 'ADMIN' ? 'Administrator' : 'Team Member'}</p>
                </div>

                <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
