import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon; // Made optional to match user's simple card if needed
    gradient: 'card-1' | 'card-2' | 'card-3' | 'card-4';
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, gradient, className }) => { // Destructured className
    // Mapping props to the CSS classes defined in index.css
    const gradientClass = `stat-card-${gradient.split('-')[1]}`;

    return (
        <div className={`premium-card p-6 ${className} ${gradientClass} transition-transform hover:scale-105 duration-200`}> {/* Merged className with existing classes */}
            <div className="flex justify-between items-start">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
                {/* Icon would go here if it were used */}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
};
