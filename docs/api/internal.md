# Fish Ledger Internal API Documentation

This document provides detailed information about the internal API structure of the Fish Ledger application.

## Overview

Fish Ledger is built using React with a modular architecture. The application uses Context API for state management and custom hooks for shared functionality. The backend is powered by Supabase, and payment processing is handled by Stripe.

## Context API

### AuthContext

Manages user authentication state and operations.

**Provider:** `AuthProvider`

**Hook:** `useAuth()`

**State:**
- `user`: The current authenticated user
- `session`: The current session
- `loading`: Whether authentication is in progress
- `error`: Any authentication error

**Methods:**
- `signUp({ email, password, shopName })`: Register a new user
- `signIn({ email, password })`: Authenticate a user
- `signOut()`: Sign out the current user
- `resetPassword(email)`: Send a password reset email
- `updatePassword(newPassword)`: Update the user's password
- `updateProfile(updates)`: Update the user's profile
- `isAuthenticated`: Boolean indicating if a user is authenticated
- `getUserProfile()`: Get the user's profile data

**Example:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await signIn({ email, password });
      // Handle successful login
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => handleLogin('user@example.com', 'password')}>Sign In</button>
      )}
    </div>
  );
}
```

### InventoryContext

Manages inventory data and operations.

**Provider:** `InventoryProvider`

**Hook:** `useInventory()`

**State:**
- `inventory`: Array of inventory items
- `lowStockAlerts`: Array of items with low stock
- `loading`: Whether inventory data is loading
- `error`: Any inventory error

**Methods:**
- `addItem(item)`: Add a new inventory item
- `updateStock(itemId, newStock)`: Update an item's stock quantity
- `updateItem(itemId, updates)`: Update an inventory item
- `deleteItem(itemId)`: Delete an inventory item
- `processSale(saleItems)`: Process a sale and update inventory

**Example:**
```jsx
import { useInventory } from '../context/InventoryContext';

function InventoryList() {
  const { inventory, loading, deleteItem } = useInventory();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <ul>
      {inventory.map(item => (
        <li key={item.itemId}>
          {item.itemName} - {item.currentStock} {item.unit}
          <button onClick={() => deleteItem(item.itemId)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### SalesContext

Manages sales data and operations.

**Provider:** `SalesProvider`

**Hook:** `useSales()`

**State:**
- `sales`: Array of sales
- `loading`: Whether sales data is loading
- `error`: Any sales error

**Methods:**
- `addSale(sale)`: Add a new sale
- `getTodaysSales()`: Get sales for today
- `getTotalRevenue()`: Get total revenue
- `getSalesData()`: Get sales data for the last 7 days
- `getSalesByDateRange(startDate, endDate)`: Get sales for a specific date range
- `getStatistics()`: Get sales statistics

**Example:**
```jsx
import { useSales } from '../context/SalesContext';

function SalesSummary() {
  const { getTodaysSales, getTotalRevenue } = useSales();
  
  const todaysSales = getTodaysSales();
  const totalRevenue = getTotalRevenue();
  
  return (
    <div>
      <p>Today's Sales: {todaysSales.length}</p>
      <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
    </div>
  );
}
```

### SubscriptionContext

Manages subscription data and operations.

**Provider:** `SubscriptionProvider`

**Hook:** `useSubscription()`

**State:**
- `subscription`: The user's subscription data
- `loading`: Whether subscription data is loading
- `error`: Any subscription error

**Methods:**
- `hasFeature(featureName)`: Check if a feature is available in the current subscription
- `getInventoryLimit()`: Get the inventory limit for the current subscription
- `isSubscriptionActive()`: Check if the current subscription is active
- `getCurrentPlan()`: Get the current subscription plan
- `getExpirationDate()`: Get subscription expiration date

**Example:**
```jsx
import { useSubscription } from '../context/SubscriptionContext';

function FeatureCheck() {
  const { hasFeature, getCurrentPlan } = useSubscription();
  
  const canUseAdvancedReporting = hasFeature('advancedReporting');
  const currentPlan = getCurrentPlan();
  
  return (
    <div>
      <p>Current Plan: {currentPlan}</p>
      {canUseAdvancedReporting ? (
        <button>View Advanced Reports</button>
      ) : (
        <p>Upgrade to access Advanced Reports</p>
      )}
    </div>
  );
}
```

### UIContext

Manages UI state and operations.

**Provider:** `UIProvider`

**Hook:** `useUI()`

**State:**
- `toasts`: Array of toast notifications
- `isLoading`: Global loading state
- `globalError`: Global error state

**Methods:**
- `addToast(message, type, duration)`: Add a toast notification
- `removeToast(id)`: Remove a toast notification
- `showSuccess(message, duration)`: Show a success toast
- `showError(message, duration)`: Show an error toast
- `showWarning(message, duration)`: Show a warning toast
- `showInfo(message, duration)`: Show an info toast
- `setLoading(loading)`: Set global loading state
- `setError(error)`: Set global error state
- `clearError()`: Clear global error state

**Example:**
```jsx
import { useUI } from '../context/UIContext';

function SaveButton({ onSave }) {
  const { showSuccess, showError, setLoading } = useUI();
  
  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave();
      showSuccess('Saved successfully');
    } catch (error) {
      showError(error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

## Custom Hooks

### useErrorHandler

Provides error handling utilities for async operations.

**Import:** `import useErrorHandler from '../hooks/useErrorHandler';`

**Returns:**
- `error`: Current error state
- `isLoading`: Loading state
- `handleAsync(asyncFn, options)`: Wrap an async function with error handling
- `clearError()`: Clear the current error
- `setError(error)`: Set an error manually

**Example:**
```jsx
import useErrorHandler from '../hooks/useErrorHandler';

function DataFetcher() {
  const { error, isLoading, handleAsync } = useErrorHandler();
  const [data, setData] = useState(null);
  
  const fetchData = handleAsync(async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    setData(data);
    return data;
  }, { errorMessage: 'Failed to fetch data' });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>{/* Render data */}</div>;
}
```

### useSubscription

Provides subscription-related utilities.

**Import:** `import useSubscription from '../hooks/useSubscription';`

**Returns:**
- All properties and methods from SubscriptionContext
- `canUseFeature(featureName)`: Check if a feature is available
- `hasReachedInventoryLimit(currentCount)`: Check if inventory limit is reached
- `getRemainingInventorySlots(currentCount)`: Get remaining inventory slots
- `needsUpgradeForFeature(featureName)`: Check if upgrade is needed for a feature
- `getPlanForFeature(featureName)`: Get the plan that provides a feature

**Example:**
```jsx
import useSubscription from '../hooks/useSubscription';

function InventoryCounter() {
  const { hasReachedInventoryLimit, getRemainingInventorySlots } = useSubscription();
  const inventoryCount = 8; // Current inventory count
  
  const limitReached = hasReachedInventoryLimit(inventoryCount);
  const remainingSlots = getRemainingInventorySlots(inventoryCount);
  
  return (
    <div>
      {limitReached ? (
        <p>You've reached your inventory limit. Upgrade to add more items.</p>
      ) : (
        <p>You can add {remainingSlots} more items.</p>
      )}
    </div>
  );
}
```

## Utility Functions

### permissions.js

Provides utilities for checking feature permissions based on subscription plans.

**Import:** `import permissions from '../utils/permissions';`

**Functions:**
- `planHasFeature(planId, featureName)`: Check if a plan has a feature
- `getPlanInventoryLimit(planId)`: Get inventory limit for a plan
- `hasReachedInventoryLimit(planId, currentCount)`: Check if inventory limit is reached
- `getMinimumPlanForFeature(featureName)`: Get minimum plan required for a feature
- `requiresUpgrade(currentPlan, featureName)`: Check if upgrade is required for a feature
- `getPlanFeatures(planId)`: Get all features for a plan

**Example:**
```jsx
import permissions from '../utils/permissions';

function FeatureInfo() {
  const minimumPlan = permissions.getMinimumPlanForFeature('lowStockAlerts');
  const basicPlanLimit = permissions.getPlanInventoryLimit('basic');
  
  return (
    <div>
      <p>Low Stock Alerts are available in the {minimumPlan} plan and above.</p>
      <p>The Basic plan allows up to {basicPlanLimit} inventory items.</p>
    </div>
  );
}
```

### migration.js

Provides utilities for migrating data from localStorage to Supabase.

**Import:** `import migration from '../utils/migration';`

**Functions:**
- `migrateInventory(userId)`: Migrate inventory data
- `migrateSales(userId)`: Migrate sales data
- `migrateAllData(userId)`: Migrate all data
- `clearLocalData(clearInventory, clearSales)`: Clear localStorage data

**Example:**
```jsx
import migration from '../utils/migration';

async function migrateUserData(userId) {
  try {
    const result = await migration.migrateAllData(userId);
    
    if (result.success) {
      console.log('Migration successful');
      migration.clearLocalData();
    } else {
      console.error('Migration failed', result);
    }
    
    return result;
  } catch (error) {
    console.error('Migration error', error);
    throw error;
  }
}
```

## Components

### Common Components

#### ErrorBoundary

Catches JavaScript errors in child components and displays a fallback UI.

**Props:**
- `children`: React nodes to render
- `showDetails`: Whether to show error details (default: true in development)

**Example:**
```jsx
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### Toast

Displays toast notifications.

**Example:**
```jsx
import Toast from './components/common/Toast';
import { UIProvider } from './context/UIContext';

function App() {
  return (
    <UIProvider>
      <div>
        {/* App content */}
        <Toast />
      </div>
    </UIProvider>
  );
}
```

#### UpgradePrompt

Displays a prompt to upgrade when a feature is not available in the current plan.

**Props:**
- `featureName`: Name of the feature requiring upgrade
- `featureDescription`: Description of the feature
- `children`: Content to display when feature is available

**Example:**
```jsx
import UpgradePrompt from './components/common/UpgradePrompt';

function AdvancedReports() {
  return (
    <UpgradePrompt
      featureName="advancedReporting"
      featureDescription="Upgrade to Premium to access detailed sales analytics and reports."
    >
      <div>{/* Advanced reports content */}</div>
    </UpgradePrompt>
  );
}
```

### Auth Components

#### AuthLayout

Manages authentication views (login, signup, reset password).

**Props:**
- `onAuthSuccess`: Callback when authentication is successful

**Example:**
```jsx
import AuthLayout from './components/Auth/AuthLayout';

function App() {
  const handleAuthSuccess = () => {
    console.log('Authentication successful');
  };
  
  return <AuthLayout onAuthSuccess={handleAuthSuccess} />;
}
```

### Onboarding Components

#### OnboardingLayout

Manages onboarding flow for new users.

**Props:**
- `onComplete`: Callback when onboarding is complete

**Example:**
```jsx
import OnboardingLayout from './components/Onboarding/OnboardingLayout';

function App() {
  const handleOnboardingComplete = () => {
    console.log('Onboarding complete');
  };
  
  return <OnboardingLayout onComplete={handleOnboardingComplete} />;
}
```

### Migration Components

#### MigrationWizard

Guides users through migrating data from localStorage to Supabase.

**Props:**
- `onComplete`: Callback when migration is complete

**Example:**
```jsx
import MigrationWizard from './components/Migration/MigrationWizard';

function DataMigration() {
  const handleMigrationComplete = () => {
    console.log('Migration complete');
  };
  
  return <MigrationWizard onComplete={handleMigrationComplete} />;
}
```

## Services

### supabase.js

Provides Supabase client and API functions.

**Import:** `import { supabase, auth, inventory, sales, users } from '../services/supabase';`

**Example:**
```jsx
import { inventory } from '../services/supabase';

async function fetchInventory(userId) {
  try {
    const items = await inventory.getItems(userId);
    return items;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}
```

### stripe.js

Provides Stripe API functions.

**Import:** `import { PLANS, createCheckoutSession } from '../services/stripe';`

**Example:**
```jsx
import { PLANS, createCheckoutSession } from '../services/stripe';

async function subscribeToPlan(planId, userId) {
  try {
    const plan = PLANS[planId.toUpperCase()];
    
    if (!plan || !plan.stripePriceId) {
      throw new Error('Invalid plan selected');
    }
    
    await createCheckoutSession(
      plan.stripePriceId,
      userId,
      `${window.location.origin}/subscription/success`,
      `${window.location.origin}/subscription/cancel`
    );
    
    // User will be redirected to Stripe Checkout
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}
```

### notifications.js

Provides notification functions.

**Import:** `import notifications from '../services/notifications';`

**Example:**
```jsx
import notifications from '../services/notifications';

async function setupNotifications(userId) {
  try {
    // Request browser notification permission
    const { granted } = await notifications.requestNotificationPermission();
    
    if (granted) {
      // Save notification preferences
      await notifications.saveNotificationPreferences(userId, {
        emailEnabled: true,
        browserEnabled: true,
        lowStockAlerts: true,
        salesSummary: true,
        newFeatures: true
      });
      
      // Send a test notification
      notifications.sendBrowserNotification('Notifications Enabled', {
        body: 'You will now receive notifications from Fish Ledger'
      });
    }
  } catch (error) {
    console.error('Notification setup error:', error);
  }
}
```

## Error Handling

Fish Ledger uses a consistent approach to error handling:

1. **Try-Catch Blocks**: All async operations are wrapped in try-catch blocks
2. **Error Context**: Errors include context about where they occurred
3. **User Feedback**: Errors are displayed to users via toast notifications
4. **Logging**: Errors are logged to the console for debugging
5. **Fallbacks**: When possible, fallback mechanisms are provided

**Example:**
```jsx
try {
  // Async operation
  const result = await someAsyncFunction();
  return result;
} catch (error) {
  // Log error
  console.error('Error in someAsyncFunction:', error);
  
  // Show user feedback
  showError(error.message || 'An error occurred');
  
  // Use fallback if available
  return fallbackValue;
}
```

## Data Flow

1. **User Action**: User interacts with the UI
2. **Context Method**: Context method is called
3. **Service Call**: Service function makes API call
4. **State Update**: Context updates state with result
5. **UI Update**: Components re-render with new state

**Example:**
```jsx
// 1. User clicks "Add Item" button
const handleAddItem = async () => {
  try {
    // 2. Call context method
    const newItem = await addItem({
      itemName,
      currentStock,
      unit,
      lowStockThreshold,
      pricePerUnit
    });
    
    // 5. UI feedback
    showSuccess('Item added successfully');
    resetForm();
  } catch (error) {
    showError(error.message || 'Failed to add item');
  }
};

// 3. Context method calls service function
const addItem = async (item) => {
  try {
    // Service call
    const newItem = await inventoryService.addItem({
      ...item,
      userId: user.id
    });
    
    // 4. Update state
    setInventory(prev => [...prev, newItem]);
    
    return newItem;
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};
```

