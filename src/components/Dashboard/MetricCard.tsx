import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'orange' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    emerald: 'bg-emerald-500 text-emerald-600 bg-emerald-50',
    orange: 'bg-orange-500 text-orange-600 bg-orange-50',
    red: 'bg-red-500 text-red-600 bg-red-50'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change.isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              <span>{change.isPositive ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;