import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Mail, Lock, User, Store, UserPlus } from 'lucide-react';

const SignUp = ({ onSuccess, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp } = useAuth();
  const { showError, showSuccess } = useUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !shopName) {
      showError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await signUp({ email, password, shopName });
      showSuccess('Account created successfully! Please check your email to confirm your account.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Signup error:', error);
      showError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-white/70">Start managing your fish inventory today</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label htmlFor="shop-name" className="block text-sm font-medium text-white mb-2">
            Shop Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Store size={18} className="text-white/50" />
            </div>
            <input
              id="shop-name"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your Fish Shop"
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
              minLength={6}
            />
          </div>
          <p className="mt-1 text-xs text-white/50">Must be at least 6 characters long</p>
        </div>
        
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-white/50" />
            </div>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 bg-white/10 border-white/20 rounded focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-white/70">
            I agree to the{' '}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </a>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/80 text-white py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-white/70">
          Already have an account?{' '}
          <button
            onClick={onLoginClick}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

