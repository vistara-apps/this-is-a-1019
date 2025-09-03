import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Bell, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
  ];

  return (
    <>
      {/* Mobile menu backdrop */}
      <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 z-50 transform -translate-x-full md:translate-x-0 transition-transform">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Fish Ledger</h1>
          <p className="text-white/70 text-sm">{user?.shopName}</p>
        </div>
        
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="border-t border-white/20 pt-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;