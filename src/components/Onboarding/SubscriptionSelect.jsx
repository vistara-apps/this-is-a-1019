import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Check, X, ArrowRight, CreditCard } from 'lucide-react';

const SubscriptionSelect = ({ onNext, onSkip }) => {
  const [selectedPlan, setSelectedPlan] = useState('basic'); // 'free', 'basic', 'premium'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateProfile } = useAuth();
  const { showError, showSuccess } = useUI();

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

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      
      // Update user profile with selected plan
      await updateProfile({
        selectedPlan,
        onboardingStep: 'subscription-selected'
      });
      
      showSuccess(`${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan selected`);
      
      if (onNext) {
        onNext(selectedPlan);
      }
    } catch (error) {
      console.error('Subscription selection error:', error);
      showError(error.message || 'Failed to select subscription plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      
      // Update user profile with free plan
      await updateProfile({
        selectedPlan: 'free',
        onboardingStep: 'subscription-selected'
      });
      
      if (onSkip) {
        onSkip();
      }
    } catch (error) {
      console.error('Subscription skip error:', error);
      showError(error.message || 'Failed to skip subscription selection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-white/10 rounded-full p-3 inline-flex mb-4">
          <CreditCard size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-white/70">Select the subscription plan that best fits your business needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white/10 backdrop-blur-sm rounded-lg border ${
              selectedPlan === plan.id
                ? 'border-primary'
                : 'border-white/20'
            } p-6 cursor-pointer transition-all hover:transform hover:scale-[1.02]`}
            onClick={() => setSelectedPlan(plan.id)}
          >
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
                  : 'bg-white/20'
              }`}>
                {selectedPlan === plan.id && <Check size={14} className="text-white" />}
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
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={handleSkip}
          className="text-white/70 hover:text-white transition-colors"
        >
          Skip for now, start with Free plan
        </button>
        
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue with {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSelect;

