import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = ({ onSuccess, onSignUpClick, onForgotPasswordClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuth();
  const { showError, showSuccess } = useUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await signIn({ email, password });
      showSuccess('Logged in successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Failed to log in. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/70">Sign in to your Fish Ledger account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-white/50" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-white/50" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 bg-white/10 border-white/20 rounded focus:ring-primary"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </button>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/80 text-white py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-white/70">
          Don't have an account?{' '}
          <button
            onClick={onSignUpClick}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

