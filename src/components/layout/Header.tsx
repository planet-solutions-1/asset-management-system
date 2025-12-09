import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, LogOut } from 'lucide-react';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <header className="premium-header h-20 px-4 md:px-8 flex items-center justify-between shadow-md z-20 sticky top-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-white hover:bg-white/20 rounded-lg lg:hidden"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">🏢 Asset Manager</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-tight">{user?.name}</p>
                        <p className="text-xs opacity-80">{user?.role === 'ADMIN' ? 'Administrator' : 'User'}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};
