import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import AuthLayout from './components/Auth/AuthLayout';
import OnboardingLayout from './components/Onboarding/OnboardingLayout';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, isAuthenticated, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Check if user needs onboarding
    if (isAuthenticated && user) {
      const onboardingCompleted = user.user_metadata?.onboardingStep === 'subscription-selected';
      setNeedsOnboarding(!onboardingCompleted);
    }
  }, [user, isAuthenticated]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthLayout onAuthSuccess={() => {}} />;
  }

  // Show onboarding if needed
  if (needsOnboarding) {
    return <OnboardingLayout onComplete={() => setNeedsOnboarding(false)} />;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500">
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          user={user}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
      <Toast />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <InventoryProvider>
              <SalesProvider>
                <AppContent />
              </SalesProvider>
            </InventoryProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}

export default App;

