# Fish Ledger Services

This directory contains service modules that handle external API integrations and data operations for the Fish Ledger application.

## Overview

Services are responsible for:
- Making API calls to external services (Supabase, Stripe)
- Handling authentication and authorization
- Managing data operations
- Providing a clean interface for the rest of the application

## Services

### supabase.js

Handles all interactions with the Supabase backend.

**Exports:**
- `supabase`: The Supabase client instance
- `auth`: Authentication functions
- `inventory`: Inventory data operations
- `sales`: Sales data operations
- `users`: User profile operations

**Usage:**
```javascript
import { supabase, auth, inventory, sales, users } from './services/supabase';

// Authentication
await auth.signIn({ email, password });

// Inventory operations
const items = await inventory.getItems(userId);

// Sales operations
const todaySales = await sales.getSalesByDateRange(
  userId,
  new Date().toISOString().split('T')[0],
  new Date().toISOString()
);

// User operations
const profile = await users.getProfile(userId);
```

### stripe.js

Handles payment processing and subscription management via Stripe.

**Exports:**
- `PLANS`: Subscription plan definitions
- `createCheckoutSession`: Create a Stripe Checkout session
- `createCustomerPortalSession`: Create a Stripe Customer Portal session
- `getSubscriptionDetails`: Get details of a subscription
- `cancelSubscription`: Cancel a subscription

**Usage:**
```javascript
import { PLANS, createCheckoutSession } from './services/stripe';

// Get plan details
const basicPlan = PLANS.BASIC;

// Create checkout session
await createCheckoutSession(
  basicPlan.stripePriceId,
  userId,
  successUrl,
  cancelUrl
);
```

### notifications.js

Handles browser and email notifications.

**Exports:**
- `requestNotificationPermission`: Request permission for browser notifications
- `sendBrowserNotification`: Send a browser notification
- `saveNotificationPreferences`: Save notification preferences
- `getNotificationPreferences`: Get notification preferences
- `sendEmailNotification`: Send an email notification
- `sendLowStockAlert`: Send a low stock alert
- `sendSalesSummary`: Send a sales summary notification

**Usage:**
```javascript
import notifications from './services/notifications';

// Request permission
const { granted } = await notifications.requestNotificationPermission();

// Send browser notification
notifications.sendBrowserNotification('Low Stock Alert', {
  body: 'Some items are running low on stock'
});

// Send email notification
await notifications.sendEmailNotification(userId, 'low-stock-alert', {
  items: lowStockItems
});
```

## Best Practices

1. **Error Handling**: All service functions should handle errors properly and provide meaningful error messages.

```javascript
try {
  // API call
} catch (error) {
  console.error('Error in service function:', error);
  throw error; // Re-throw for the caller to handle
}
```

2. **Authentication**: Always check for authentication before making API calls.

```javascript
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing');
}
```

3. **Data Validation**: Validate data before sending it to external services.

```javascript
if (!item || !item.itemName) {
  throw new Error('Invalid item data');
}
```

4. **Optimistic Updates**: When possible, update the UI optimistically before waiting for API responses.

```javascript
// Update UI immediately
setInventory(prev => [...prev, newItem]);

// Then make API call
try {
  await inventoryService.addItem(newItem);
} catch (error) {
  // Revert UI update on error
  setInventory(prev => prev.filter(item => item.id !== newItem.id));
  throw error;
}
```

5. **Caching**: Cache responses when appropriate to reduce API calls.

```javascript
// Check cache first
const cachedData = localStorage.getItem('cachedData');
if (cachedData && isNotExpired(cachedData)) {
  return JSON.parse(cachedData).data;
}

// Make API call if not cached
const data = await apiCall();

// Update cache
localStorage.setItem('cachedData', JSON.stringify({
  data,
  timestamp: Date.now()
}));

return data;
```

6. **Rate Limiting**: Respect API rate limits and implement retry logic when necessary.

```javascript
const MAX_RETRIES = 3;
let retries = 0;

while (retries < MAX_RETRIES) {
  try {
    return await apiCall();
  } catch (error) {
    if (error.status === 429) { // Too Many Requests
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    } else {
      throw error;
    }
  }
}

throw new Error('Max retries exceeded');
```

7. **Environment Variables**: Use environment variables for API keys and other sensitive information.

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## Adding a New Service

1. Create a new file in the `services` directory
2. Export functions and/or objects that provide a clean interface
3. Handle all API calls and data operations within the service
4. Document the service in this README

## Testing Services

Services should be tested in isolation from the rest of the application. Use mock data and API responses to test service functions.

```javascript
// Example test for inventory service
test('getItems returns inventory items', async () => {
  // Mock Supabase response
  jest.spyOn(supabase, 'from').mockImplementation(() => ({
    select: () => ({
      eq: () => Promise.resolve({
        data: [{ itemId: '1', itemName: 'Test Item' }],
        error: null
      })
    })
  }));
  
  // Call service function
  const items = await inventory.getItems('user-123');
  
  // Assert result
  expect(items).toEqual([{ itemId: '1', itemName: 'Test Item' }]);
});
```

