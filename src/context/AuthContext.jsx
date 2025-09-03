import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, auth as supabaseAuth } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Sign up a new user
  const signUp = async ({ email, password, shopName }) => {
    try {
      setLoading(true);
      setError(null);
      const { user, session } = await supabaseAuth.signUp({ 
        email, 
        password, 
        shopName 
      });
      return { user, session };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in an existing user
  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      const { user, session } = await supabaseAuth.signIn({ email, password });
      return { user, session };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await supabaseAuth.signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await supabaseAuth.resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await supabaseAuth.updatePassword(newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      await supabaseAuth.updateProfile(updates);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get user profile data
  const getUserProfile = () => {
    return user?.user_metadata || {};
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated,
    getUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

