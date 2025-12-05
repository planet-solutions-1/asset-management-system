import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="premium-header h-20 px-8 flex items-center justify-between shadow-md z-20">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">🏢 Asset Management</h1>
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
