import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ResetPassword = ({ onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  const { showError, showSuccess } = useUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setIsSuccess(true);
      showSuccess('Password reset instructions sent to your email');
    } catch (error) {
      console.error('Reset password error:', error);
      showError(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
        <p className="text-white/70">
          {isSuccess
            ? 'Check your email for reset instructions'
            : 'Enter your email to receive password reset instructions'}
        </p>
      </div>
      
      {!isSuccess ? (
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
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/80 text-white py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Reset Instructions</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
          <div className="bg-green-500/20 rounded-full p-3 inline-flex mb-4">
            <Mail size={24} className="text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Check Your Email</h3>
          <p className="text-white/70 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-white/50 text-sm mb-4">
            If you don't see the email, check your spam folder or request another reset.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Send another reset link
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <button
          onClick={onLoginClick}
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;

