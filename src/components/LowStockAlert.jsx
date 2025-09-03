import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const LowStockAlert = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-400 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="text-white font-medium mb-2">Low Stock Alert</h3>
          <div className="space-y-1">
            {alerts.map((item) => (
              <p key={item.itemId} className="text-white/80 text-sm">
                <span className="font-medium">{item.itemName}</span> - Only {item.currentStock} {item.unit} remaining (threshold: {item.lowStockThreshold})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;