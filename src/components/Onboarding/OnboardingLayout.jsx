import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ShopSetup from './ShopSetup';
import SubscriptionSelect from './SubscriptionSelect';
import { CheckCircle } from 'lucide-react';

const OnboardingLayout = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has already completed any onboarding steps
    if (user?.user_metadata?.onboardingStep) {
      if (user.user_metadata.onboardingStep === 'shop-setup-completed') {
        setCurrentStep(2);
      } else if (user.user_metadata.onboardingStep === 'subscription-selected') {
        setCurrentStep(3);
        setIsCompleted(true);
      }
    }
  }, [user]);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    
    if (onComplete) {
      onComplete();
    }
  };

  const steps = [
    { number: 1, title: 'Shop Setup' },
    { number: 2, title: 'Choose Plan' },
    { number: 3, title: 'Complete' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 p-4">
      <div className="max-w-4xl mx-auto pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white">Welcome to Fish Ledger</h1>
          <p className="text-white/70 mt-2">Let's set up your account in just a few steps</p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number
                      ? 'bg-primary'
                      : 'bg-white/20'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={20} className="text-white" />
                    ) : (
                      <span className="text-white font-medium">{step.number}</span>
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${
                    currentStep >= step.number
                      ? 'text-white'
                      : 'text-white/50'
                  }`}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-2 ${
                    currentStep > index + 1
                      ? 'bg-primary'
                      : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 md:p-8">
          {currentStep === 1 && (
            <ShopSetup onNext={handleNext} />
          )}
          
          {currentStep === 2 && (
            <SubscriptionSelect 
              onNext={handleNext} 
              onSkip={handleNext} 
            />
          )}
          
          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="bg-green-500/20 rounded-full p-4 inline-flex mb-6">
                <CheckCircle size={48} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Setup Complete!</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Your Fish Ledger account is now ready to use. You can start managing your inventory and tracking sales right away.
              </p>
              <button
                onClick={handleComplete}
                className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;

