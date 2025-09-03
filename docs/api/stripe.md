# Stripe API Documentation

This document provides detailed information about the Stripe integration in the Fish Ledger application.

## Overview

Fish Ledger uses Stripe as its payment processing service for subscription management. Stripe provides a secure way to handle payments, subscriptions, and invoices.

## Subscription Plans

Fish Ledger offers the following subscription plans:

| Plan | Price | Features |
|------|-------|----------|
| Free | $0/month | Basic inventory management (up to 10 fish types) |
| Basic | $15/month | Enhanced inventory management with alerts (up to 50 fish types) |
| Premium | $25/month | Complete solution with all features (unlimited fish types) |

## Client-Side Integration

### Loading Stripe.js

```javascript
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
```

### Creating a Checkout Session

```javascript
const createCheckoutSession = async (priceId, customerId, successUrl, cancelUrl) => {
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
```

### Creating a Customer Portal Session

```javascript
const createCustomerPortalSession = async (customerId, returnUrl) => {
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
```

### Getting Subscription Details

```javascript
const getSubscriptionDetails = async (subscriptionId) => {
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
```

### Canceling a Subscription

```javascript
const cancelSubscription = async (subscriptionId) => {
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
```

## Server-Side API Endpoints

### Create Checkout Session

**Endpoint:** `/api/create-checkout-session`

**Method:** POST

**Request Body:**
```json
{
  "priceId": "price_basic",
  "customerId": "cus_123456789",
  "successUrl": "https://fishledger.com/subscription/success",
  "cancelUrl": "https://fishledger.com/subscription/cancel"
}
```

**Response:**
```json
{
  "id": "cs_test_123456789",
  "url": "https://checkout.stripe.com/pay/cs_test_123456789"
}
```

**Implementation:**
```javascript
// Server-side implementation using Stripe Node.js SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, customerId, successUrl, cancelUrl } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Create Customer Portal Session

**Endpoint:** `/api/create-customer-portal-session`

**Method:** POST

**Request Body:**
```json
{
  "customerId": "cus_123456789",
  "returnUrl": "https://fishledger.com/account"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/cs_test_123456789"
}
```

**Implementation:**
```javascript
// Server-side implementation using Stripe Node.js SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-customer-portal-session', async (req, res) => {
  const { customerId, returnUrl } = req.body;
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Get Subscription Details

**Endpoint:** `/api/subscriptions/:subscriptionId`

**Method:** GET

**Response:**
```json
{
  "id": "sub_123456789",
  "status": "active",
  "current_period_start": 1609459200,
  "current_period_end": 1612137600,
  "plan": {
    "id": "price_basic",
    "nickname": "Basic Plan",
    "amount": 1500,
    "interval": "month"
  },
  "cancel_at_period_end": false
}
```

**Implementation:**
```javascript
// Server-side implementation using Stripe Node.js SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.get('/api/subscriptions/:subscriptionId', async (req, res) => {
  const { subscriptionId } = req.params;
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    res.json(subscription);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Cancel Subscription

**Endpoint:** `/api/subscriptions/:subscriptionId/cancel`

**Method:** POST

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123456789",
    "status": "canceled"
  }
}
```

**Implementation:**
```javascript
// Server-side implementation using Stripe Node.js SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/subscriptions/:subscriptionId/cancel', async (req, res) => {
  const { subscriptionId } = req.params;
  
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Webhook Handling

Stripe webhooks are used to receive notifications about events that happen in your Stripe account, such as successful payments, subscription updates, and more.

### Webhook Endpoint

**Endpoint:** `/api/webhooks/stripe`

**Method:** POST

**Implementation:**
```javascript
// Server-side implementation using Stripe Node.js SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      // Handle subscription created
      await handleSubscriptionCreated(subscriptionCreated);
      break;
    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      // Handle subscription updated
      await handleSubscriptionUpdated(subscriptionUpdated);
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      // Handle subscription deleted
      await handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case 'invoice.paid':
      const invoicePaid = event.data.object;
      // Handle invoice paid
      await handleInvoicePaid(invoicePaid);
      break;
    case 'invoice.payment_failed':
      const invoiceFailed = event.data.object;
      // Handle invoice payment failed
      await handleInvoicePaymentFailed(invoiceFailed);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Return a 200 response to acknowledge receipt of the event
  res.send();
});
```

## Error Handling

When working with the Stripe API, it's important to handle errors properly. Stripe errors include detailed information about what went wrong.

```javascript
try {
  // Stripe API call
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Card declined
    console.error('Card declined:', error.message);
  } else if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters
    console.error('Invalid parameters:', error.message);
  } else if (error.type === 'StripeAPIError') {
    // API error
    console.error('API error:', error.message);
  } else if (error.type === 'StripeConnectionError') {
    // Connection error
    console.error('Connection error:', error.message);
  } else if (error.type === 'StripeAuthenticationError') {
    // Authentication error
    console.error('Authentication error:', error.message);
  } else if (error.type === 'StripeRateLimitError') {
    // Rate limit error
    console.error('Rate limit error:', error.message);
  } else {
    // Unknown error
    console.error('Unknown error:', error.message);
  }
}
```

## Security Considerations

- Never expose your Stripe secret key in client-side code
- Always use Stripe.js to collect payment information
- Use webhooks to receive notifications about events
- Validate webhook signatures to prevent tampering
- Use HTTPS for all API calls
- Keep your Stripe SDK up to date
- Follow PCI compliance guidelines

