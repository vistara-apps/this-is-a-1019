// Stripe service for handling subscription payments
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Load Stripe.js dynamically
const loadStripe = async () => {
  if (!window.Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.body.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => {
        resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
      };
    });
  }
  
  return window.Stripe(STRIPE_PUBLISHABLE_KEY);
};

// Subscription plans
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      inventoryLimit: 10,
      lowStockAlerts: false,
      customerAlerts: false,
      advancedReporting: false
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 15,
    stripePriceId: 'price_basic', // Replace with actual Stripe price ID
    features: {
      inventoryLimit: 50,
      lowStockAlerts: true,
      customerAlerts: false,
      advancedReporting: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 25,
    stripePriceId: 'price_premium', // Replace with actual Stripe price ID
    features: {
      inventoryLimit: 1000,
      lowStockAlerts: true,
      customerAlerts: true,
      advancedReporting: true
    }
  }
};

// Create a checkout session for subscription
export const createCheckoutSession = async (priceId, customerId, successUrl, cancelUrl) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: successUrl || window.location.origin + '/subscription/success',
        cancelUrl: cancelUrl || window.location.origin + '/subscription/cancel',
      }),
    });
    
    const session = await response.json();
    
    if (!session || !session.id) {
      throw new Error('Failed to create checkout session');
    }
    
    const stripe = await loadStripe();
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create a customer portal session for managing subscription
export const createCustomerPortalSession = async (customerId, returnUrl) => {
  try {
    const response = await fetch('/api/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: returnUrl || window.location.origin + '/account',
      }),
    });
    
    const session = await response.json();
    
    if (!session || !session.url) {
      throw new Error('Failed to create customer portal session');
    }
    
    window.location.href = session.url;
    
    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
};

// Get subscription details
export const getSubscriptionDetails = async (subscriptionId) => {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const subscription = await response.json();
    
    if (!subscription) {
      throw new Error('Failed to get subscription details');
    }
    
    return subscription;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to cancel subscription');
    }
    
    return result;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export default {
  PLANS,
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
};

