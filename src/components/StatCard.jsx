import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-semibold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trendUp ? (
                <TrendingUp size={14} className="text-accent" />
              ) : (
                <TrendingDown size={14} className="text-red-400" />
              )}
              <span className={`text-xs ${trendUp ? 'text-accent' : 'text-red-400'}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;