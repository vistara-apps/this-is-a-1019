import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import ResetPassword from './ResetPassword';

const AuthLayout = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'reset-password'

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Fish Ledger</h1>
          <p className="text-white/70 mt-2">Effortlessly track your fish stock and manage sales like a pro</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 md:p-8">
          {currentView === 'login' && (
            <Login
              onSuccess={onAuthSuccess}
              onSignUpClick={() => handleViewChange('signup')}
              onForgotPasswordClick={() => handleViewChange('reset-password')}
            />
          )}
          
          {currentView === 'signup' && (
            <SignUp
              onSuccess={() => handleViewChange('login')}
              onLoginClick={() => handleViewChange('login')}
            />
          )}
          
          {currentView === 'reset-password' && (
            <ResetPassword
              onLoginClick={() => handleViewChange('login')}
            />
          )}
        </div>
        
        <div className="text-center mt-8 text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} Fish Ledger. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

