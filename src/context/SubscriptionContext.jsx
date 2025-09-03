import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as usersService } from '../services/supabase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load subscription data from Supabase
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated || !user) {
        // If not authenticated, use a default free subscription
        setSubscription({
          plan: 'free',
          status: 'active',
          features: {
            inventoryLimit: 10,
            lowStockAlerts: false,
            customerAlerts: false,
            advancedReporting: false
          }
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await usersService.getSubscription(user.id);
        
        if (data) {
          setSubscription(data);
        } else {
          // No subscription found, set default free plan
          setSubscription({
            plan: 'free',
            status: 'active',
            features: {
              inventoryLimit: 10,
              lowStockAlerts: false,
              customerAlerts: false,
              advancedReporting: false
            }
          });
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription data');
        
        // Set default free plan on error
        setSubscription({
          plan: 'free',
          status: 'active',
          features: {
            inventoryLimit: 10,
            lowStockAlerts: false,
            customerAlerts: false,
            advancedReporting: false
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, isAuthenticated]);

  // Check if a feature is available in the current subscription
  const hasFeature = (featureName) => {
    if (!subscription) return false;
    
    // Define features for each plan
    const planFeatures = {
      free: {
        inventoryLimit: 10,
        lowStockAlerts: false,
        customerAlerts: false,
        advancedReporting: false
      },
      basic: {
        inventoryLimit: 50,
        lowStockAlerts: true,
        customerAlerts: false,
        advancedReporting: false
      },
      premium: {
        inventoryLimit: 1000,
        lowStockAlerts: true,
        customerAlerts: true,
        advancedReporting: true
      }
    };
    
    // Get features for the current plan
    const features = subscription.features || planFeatures[subscription.plan] || planFeatures.free;
    
    return features[featureName] || false;
  };

  // Get the inventory limit for the current subscription
  const getInventoryLimit = () => {
    if (!subscription) return 10; // Default limit for free plan
    
    const planLimits = {
      free: 10,
      basic: 50,
      premium: 1000
    };
    
    return subscription.features?.inventoryLimit || planLimits[subscription.plan] || 10;
  };

  // Check if the current subscription is active
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
  };

  // Get the current subscription plan
  const getCurrentPlan = () => {
    if (!subscription) return 'free';
    return subscription.plan || 'free';
  };

  // Get subscription expiration date
  const getExpirationDate = () => {
    if (!subscription || !subscription.currentPeriodEnd) return null;
    return new Date(subscription.currentPeriodEnd);
  };

  const value = {
    subscription,
    loading,
    error,
    hasFeature,
    getInventoryLimit,
    isSubscriptionActive,
    getCurrentPlan,
    getExpirationDate
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

