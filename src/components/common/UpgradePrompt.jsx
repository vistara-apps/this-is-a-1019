import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { Lock, ArrowUpRight } from 'lucide-react';

/**
 * Component to prompt users to upgrade their subscription when trying to access premium features
 * @param {Object} props - Component props
 * @param {string} props.featureName - Name of the feature requiring upgrade
 * @param {string} props.featureDescription - Description of the feature
 * @param {React.ReactNode} props.children - Content to display when feature is available
 * @returns {React.ReactNode} Upgrade prompt or children
 */
const UpgradePrompt = ({ featureName, featureDescription, children }) => {
  const { canUseFeature, getPlanForFeature } = useSubscription();
  
  // If the user can use the feature, render the children
  if (canUseFeature(featureName)) {
    return children;
  }
  
  // Otherwise, show an upgrade prompt
  const requiredPlan = getPlanForFeature(featureName);
  const planName = requiredPlan ? requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1) : 'Premium';
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 text-center">
      <div className="bg-primary/20 rounded-full p-3 inline-flex mb-4">
        <Lock size={24} className="text-primary" />
      </div>
      
      <h3 className="text-lg font-medium text-white mb-2">
        {featureName} is a {planName} Feature
      </h3>
      
      <p className="text-white/70 mb-6">
        {featureDescription || `Upgrade to the ${planName} plan to unlock this feature and more.`}
      </p>
      
      <a
        href="/subscription/plans"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors"
      >
        <span>Upgrade to {planName}</span>
        <ArrowUpRight size={18} />
      </a>
    </div>
  );
};

export default UpgradePrompt;

