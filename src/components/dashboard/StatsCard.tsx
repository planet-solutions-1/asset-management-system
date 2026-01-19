import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon; // Made optional to match user's simple card if needed
    gradient: 'card-1' | 'card-2' | 'card-3' | 'card-4';
    className?: string;
    onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, gradient, className, onClick }) => {
    // Simplified gradient map for the 3D icon background
    const gradientColors: Record<string, string> = {
        'card-1': 'from-blue-400 to-blue-600 shadow-blue-500/40',
        'card-2': 'from-emerald-400 to-emerald-600 shadow-emerald-500/40',
        'card-3': 'from-rose-400 to-rose-600 shadow-rose-500/40',
        'card-4': 'from-purple-400 to-purple-600 shadow-purple-500/40',
    };

    // Default to blue if gradient not found
    const colorClass = gradientColors[gradient] || 'from-blue-400 to-blue-600 shadow-blue-500/40';

    return (
        <div
            onClick={onClick}
            className={`premium-card p-6 ${className} bg-white border border-slate-100/60 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] 
            ${onClick ? 'cursor-pointer hover:border-blue-200 hover:-translate-y-1' : ''} 
            hover:shadow-xl transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
                {/* 3D Icon Container */}
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg transform transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 flex items-center justify-center text-white`}>
                    {Icon ? <Icon size={22} strokeWidth={2.5} className="drop-shadow-md" /> : <div className="w-5 h-5" />}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-slate-800 tracking-tight drop-shadow-sm">{value}</p>
            </div>
        </div>
    );
};
