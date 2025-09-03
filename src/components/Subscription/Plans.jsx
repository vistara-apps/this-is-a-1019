import React, { useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Check, X, CreditCard, ArrowRight } from 'lucide-react';
import { PLANS, createCheckoutSession } from '../../services/stripe';

const Plans = () => {
  const { subscription, getCurrentPlan, isSubscriptionActive } = useSubscription();
  const { user } = useAuth();
  const { showError } = useUI();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentPlan = getCurrentPlan();
  const isActive = isSubscriptionActive();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic inventory management for small shops',
      features: [
        { text: 'Up to 10 fish types', included: true },
        { text: 'Basic sales tracking', included: true },
        { text: 'Simple dashboard', included: true },
        { text: 'Low stock alerts', included: false },
        { text: 'Customer notifications', included: false },
        { text: 'Advanced reporting', included: false }
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$15',
      period: 'per month',
      description: 'Enhanced inventory management with alerts',
      features: [
        { text: 'Up to 50 fish types', included: true },
        { text: 'Detailed sales tracking', included: true },
        { text: 'Advanced dashboard', included: true },
        { text: 'Low stock alerts', included: true },
        { text: 'Customer notifications', included: false },
        { text: 'Advanced reporting', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$25',
      period: 'per month',
      description: 'Complete solution for larger fish shops',
      features: [
        { text: 'Unlimited fish types', included: true },
        { text: 'Comprehensive sales tracking', included: true },
        { text: 'Full-featured dashboard', included: true },
        { text: 'Low stock alerts', included: true },
        { text: 'Customer notifications', included: true },
        { text: 'Advanced reporting', included: true }
      ]
    }
  ];

  const handleSelectPlan = (planId) => {
    if (planId === currentPlan) {
      return; // Don't select current plan
    }
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan === 'free' || !user) {
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const planDetails = PLANS[selectedPlan.toUpperCase()];
      if (!planDetails || !planDetails.stripePriceId) {
        throw new Error('Invalid plan selected');
      }
      
      await createCheckoutSession(
        planDetails.stripePriceId,
        user.id,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/subscription/cancel`
      );
      
      // Note: The user will be redirected to Stripe Checkout
    } catch (error) {
      console.error('Subscription error:', error);
      showError(error.message || 'Failed to process subscription. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Subscription Plans</h1>
      </div>
      
      {/* Current Plan */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h2 className="text-lg font-medium text-white mb-4">Current Plan</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center">
              <span className="text-xl font-semibold text-white mr-2">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isActive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-white/70 mt-1">
              {currentPlan === 'free' 
                ? 'Basic inventory management for small shops' 
                : currentPlan === 'basic'
                ? 'Enhanced inventory management with alerts'
                : 'Complete solution for larger fish shops'}
            </p>
            {subscription && subscription.currentPeriodEnd && (
              <p className="text-white/50 text-sm mt-2">
                {currentPlan !== 'free' && `Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            )}
          </div>
          
          {currentPlan !== 'free' && (
            <button
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => window.location.href = '/subscription/manage'}
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>
      
      {/* Available Plans */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h2 className="text-lg font-medium text-white mb-6">Available Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg border ${
                selectedPlan === plan.id
                  ? 'border-primary'
                  : currentPlan === plan.id
                  ? 'border-green-400/50'
                  : 'border-white/20'
              } p-6 cursor-pointer transition-all hover:transform hover:scale-[1.02] ${
                currentPlan === plan.id ? 'relative' : ''
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {currentPlan === plan.id && (
                <div className="absolute top-0 right-0 bg-green-400 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                  Current
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/70 text-sm ml-1">{plan.period}</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedPlan === plan.id
                    ? 'bg-primary'
                    : currentPlan === plan.id
                    ? 'bg-green-400'
                    : 'bg-white/20'
                }`}>
                  {(selectedPlan === plan.id || currentPlan === plan.id) && (
                    <Check size={14} className="text-white" />
                  )}
                </div>
              </div>
              
              <p className="text-white/70 text-sm mb-4">{plan.description}</p>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`mt-0.5 mr-2 ${
                      feature.included ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {feature.included ? <Check size={16} /> : <X size={16} />}
                    </div>
                    <span className={feature.included ? 'text-white' : 'text-white/50'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {selectedPlan && selectedPlan !== currentPlan && (
          <div className="flex justify-end">
            <button
              onClick={handleSubscribe}
              disabled={isProcessing || selectedPlan === 'free'}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Processing...</span>
                </>
              ) : selectedPlan === 'free' ? (
                <>
                  <span>Downgrade to Free</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Subscribe to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;

