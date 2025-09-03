import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate user login
    const savedUser = localStorage.getItem('fishLedgerUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Demo user
      const demoUser = {
        userId: '1',
        email: 'demo@fishledger.com',
        shopName: 'Fresh Fish Market'
      };
      setUser(demoUser);
      localStorage.setItem('fishLedgerUser', JSON.stringify(demoUser));
    }
  }, []);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'pos':
        return <POS />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <InventoryProvider>
      <SalesProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500">
          <div className="flex">
            <Sidebar 
              currentView={currentView} 
              setCurrentView={setCurrentView}
              user={user}
            />
            <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64">
              {renderContent()}
            </main>
          </div>
        </div>
      </SalesProvider>
    </InventoryProvider>
  );
}

export default App;