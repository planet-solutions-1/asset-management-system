import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon; // Made optional to match user's simple card if needed
    gradient: 'card-1' | 'card-2' | 'card-3' | 'card-4';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, gradient }) => {
    // Mapping props to the CSS classes defined in index.css
    const gradientClass = `stat-card-${gradient.split('-')[1]}`;

    return (
        <div className={`p-6 rounded-xl text-white shadow-lg transform transition-transform hover:-translate-y-1 ${gradientClass}`}>
            <h3 className="text-lg font-medium opacity-90 mb-2">{title}</h3>
            <div className="text-4xl font-bold">{value}</div>
        </div>
    );
};
