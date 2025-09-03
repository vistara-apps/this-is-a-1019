import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import StatCard from './StatCard';
import LowStockAlert from './LowStockAlert';

const Dashboard = () => {
  const { inventory, lowStockAlerts } = useInventory();
  const { getTodaysSales, getTotalRevenue, getSalesData } = useSales();

  const todaysSales = getTodaysSales();
  const totalRevenue = getTotalRevenue();
  const salesData = getSalesData();
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <div className="text-white/70 text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <LowStockAlert alerts={lowStockAlerts} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={todaysSales.length}
          icon={ShoppingCart}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={Package}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockAlerts.length}
          icon={AlertTriangle}
          trend={lowStockAlerts.length > 0 ? "Attention needed" : "All good"}
          trendUp={lowStockAlerts.length === 0}
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Sales Overview (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#gradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-md transition-colors">
              Add New Fish Type
            </button>
            <button className="w-full bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors">
              Process Sale
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            {todaysSales.slice(0, 3).map((sale, index) => (
              <div key={index} className="flex justify-between text-white/70">
                <span>Sale #{sale.saleId.slice(-4)}</span>
                <span>${sale.totalAmount.toFixed(2)}</span>
              </div>
            ))}
            {todaysSales.length === 0 && (
              <p className="text-white/50">No sales today yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;