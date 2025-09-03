import { useContext } from 'react';
import SubscriptionContext from '../context/SubscriptionContext';

/**
 * Custom hook for accessing subscription data and functionality
 * @returns {Object} Subscription context values and helper functions
 */
const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  /**
   * Check if the current plan allows a specific feature
   * @param {string} featureName - Name of the feature to check
   * @returns {boolean} Whether the feature is available
   */
  const canUseFeature = (featureName) => {
    return context.hasFeature(featureName);
  };
  
  /**
   * Check if the user has reached their inventory limit
   * @param {number} currentCount - Current number of inventory items
   * @returns {boolean} Whether the limit has been reached
   */
  const hasReachedInventoryLimit = (currentCount) => {
    const limit = context.getInventoryLimit();
    return currentCount >= limit;
  };
  
  /**
   * Get the remaining inventory slots available
   * @param {number} currentCount - Current number of inventory items
   * @returns {number} Number of remaining slots
   */
  const getRemainingInventorySlots = (currentCount) => {
    const limit = context.getInventoryLimit();
    return Math.max(0, limit - currentCount);
  };
  
  /**
   * Check if the user needs to upgrade to use a feature
   * @param {string} featureName - Name of the feature to check
   * @returns {boolean} Whether an upgrade is needed
   */
  const needsUpgradeForFeature = (featureName) => {
    return !context.hasFeature(featureName);
  };
  
  /**
   * Get the plan that provides a specific feature
   * @param {string} featureName - Name of the feature
   * @returns {string|null} The plan name or null if not found
   */
  const getPlanForFeature = (featureName) => {
    const currentPlan = context.getCurrentPlan();
    
    // If current plan has the feature, return it
    if (context.hasFeature(featureName)) {
      return currentPlan;
    }
    
    // Otherwise, determine which plan provides the feature
    if (featureName === 'lowStockAlerts') {
      return 'basic';
    } else if (featureName === 'customerAlerts' || featureName === 'advancedReporting') {
      return 'premium';
    }
    
    return null;
  };
  
  return {
    ...context,
    canUseFeature,
    hasReachedInventoryLimit,
    getRemainingInventorySlots,
    needsUpgradeForFeature,
    getPlanForFeature
  };
};

export default useSubscription;

