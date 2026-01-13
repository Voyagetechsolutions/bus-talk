import React from 'react';

interface StatsCardProps {
    icon: string;
    value: number | string;
    label: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, trend }) => {
    return (
        <div className="stats-card">
            <div className="stats-icon">{icon}</div>
            <div className="stats-content">
                <div className="stats-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                <div className="stats-label">{label}</div>
                {trend && (
                    <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
