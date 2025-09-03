import { PLANS } from '../services/stripe';

/**
 * Check if a feature is available in a specific subscription plan
 * @param {string} planId - The subscription plan ID
 * @param {string} featureName - The feature to check
 * @returns {boolean} Whether the feature is available
 */
export const planHasFeature = (planId, featureName) => {
  const plan = PLANS[planId?.toUpperCase()] || PLANS.FREE;
  return !!plan.features[featureName];
};

/**
 * Get the inventory limit for a specific subscription plan
 * @param {string} planId - The subscription plan ID
 * @returns {number} The inventory limit
 */
export const getPlanInventoryLimit = (planId) => {
  const plan = PLANS[planId?.toUpperCase()] || PLANS.FREE;
  return plan.features.inventoryLimit || 10;
};

/**
 * Check if a user has reached their inventory limit
 * @param {string} planId - The subscription plan ID
 * @param {number} currentCount - Current number of inventory items
 * @returns {boolean} Whether the limit has been reached
 */
export const hasReachedInventoryLimit = (planId, currentCount) => {
  const limit = getPlanInventoryLimit(planId);
  return currentCount >= limit;
};

/**
 * Get the minimum plan required for a specific feature
 * @param {string} featureName - The feature to check
 * @returns {string} The minimum plan ID required
 */
export const getMinimumPlanForFeature = (featureName) => {
  if (planHasFeature('free', featureName)) {
    return 'free';
  } else if (planHasFeature('basic', featureName)) {
    return 'basic';
  } else if (planHasFeature('premium', featureName)) {
    return 'premium';
  }
  
  return 'premium'; // Default to premium if feature not found
};

/**
 * Check if a plan upgrade is required for a specific feature
 * @param {string} currentPlan - The current subscription plan ID
 * @param {string} featureName - The feature to check
 * @returns {boolean} Whether an upgrade is required
 */
export const requiresUpgrade = (currentPlan, featureName) => {
  const minimumPlan = getMinimumPlanForFeature(featureName);
  
  if (minimumPlan === 'free') {
    return false;
  } else if (minimumPlan === 'basic') {
    return currentPlan === 'free';
  } else if (minimumPlan === 'premium') {
    return currentPlan === 'free' || currentPlan === 'basic';
  }
  
  return true;
};

/**
 * Get all features available in a specific subscription plan
 * @param {string} planId - The subscription plan ID
 * @returns {Object} Object with feature names as keys and boolean values
 */
export const getPlanFeatures = (planId) => {
  const plan = PLANS[planId?.toUpperCase()] || PLANS.FREE;
  return { ...plan.features };
};

export default {
  planHasFeature,
  getPlanInventoryLimit,
  hasReachedInventoryLimit,
  getMinimumPlanForFeature,
  requiresUpgrade,
  getPlanFeatures
};

