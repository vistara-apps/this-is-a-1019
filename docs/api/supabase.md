# Supabase API Documentation

This document provides detailed information about the Supabase integration in the Fish Ledger application.

## Overview

Fish Ledger uses Supabase as its backend service for data storage, authentication, and real-time updates. Supabase provides a PostgreSQL database with a RESTful API and real-time subscriptions.

## Authentication

### Sign Up

Creates a new user account.

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      shopName: 'My Fish Shop',
      subscriptionPlan: 'free'
    }
  }
});
```

### Sign In

Authenticates an existing user.

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out

Signs out the current user.

```javascript
const { error } = await supabase.auth.signOut();
```

### Reset Password

Sends a password reset email.

```javascript
const { error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://fishledger.com/reset-password'
});
```

### Update User Profile

Updates the user's profile data.

```javascript
const { data, error } = await supabase.auth.updateUser({
  data: {
    shopName: 'Updated Fish Shop',
    shopAddress: '123 Main St',
    shopCity: 'Anytown',
    shopState: 'CA',
    shopZipCode: '12345',
    shopPhone: '(123) 456-7890',
    shopWebsite: 'https://myfishshop.com'
  }
});
```

## Database Schema

### Tables

#### fish_items

Stores inventory items.

| Column | Type | Description |
|--------|------|-------------|
| itemId | uuid | Primary key |
| userId | uuid | Foreign key to auth.users |
| itemName | text | Name of the fish type |
| currentStock | numeric | Current stock quantity |
| unit | text | Unit of measurement (e.g., kg) |
| lowStockThreshold | numeric | Threshold for low stock alerts |
| pricePerUnit | numeric | Price per unit |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

#### sales

Stores sales records.

| Column | Type | Description |
|--------|------|-------------|
| saleId | uuid | Primary key |
| userId | uuid | Foreign key to auth.users |
| timestamp | timestamp | Sale timestamp |
| totalAmount | numeric | Total sale amount |
| paymentMethod | text | Payment method used |
| createdAt | timestamp | Creation timestamp |

#### sale_items

Stores items included in sales.

| Column | Type | Description |
|--------|------|-------------|
| saleItemId | uuid | Primary key |
| saleId | uuid | Foreign key to sales |
| itemId | uuid | Foreign key to fish_items |
| quantitySold | numeric | Quantity sold |
| pricePerUnit | numeric | Price per unit at time of sale |
| createdAt | timestamp | Creation timestamp |

#### profiles

Stores user profile information.

| Column | Type | Description |
|--------|------|-------------|
| userId | uuid | Primary key, foreign key to auth.users |
| shopName | text | Name of the fish shop |
| shopAddress | text | Shop address |
| shopCity | text | Shop city |
| shopState | text | Shop state/province |
| shopZipCode | text | Shop zip/postal code |
| shopPhone | text | Shop phone number |
| shopWebsite | text | Shop website URL |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

#### subscriptions

Stores subscription information.

| Column | Type | Description |
|--------|------|-------------|
| subscriptionId | uuid | Primary key |
| userId | uuid | Foreign key to auth.users |
| stripeSubscriptionId | text | Stripe subscription ID |
| plan | text | Subscription plan (free, basic, premium) |
| status | text | Subscription status |
| currentPeriodStart | timestamp | Current period start date |
| currentPeriodEnd | timestamp | Current period end date |
| cancelAtPeriodEnd | boolean | Whether subscription will cancel at period end |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

#### notification_preferences

Stores user notification preferences.

| Column | Type | Description |
|--------|------|-------------|
| userId | uuid | Primary key, foreign key to auth.users |
| emailEnabled | boolean | Whether email notifications are enabled |
| browserEnabled | boolean | Whether browser notifications are enabled |
| lowStockAlerts | boolean | Whether low stock alerts are enabled |
| salesSummary | boolean | Whether sales summary notifications are enabled |
| newFeatures | boolean | Whether new feature notifications are enabled |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

#### invoices

Stores invoice information.

| Column | Type | Description |
|--------|------|-------------|
| invoiceId | uuid | Primary key |
| userId | uuid | Foreign key to auth.users |
| stripeInvoiceId | text | Stripe invoice ID |
| amount | numeric | Invoice amount |
| status | text | Invoice status |
| description | text | Invoice description |
| invoiceUrl | text | URL to invoice PDF |
| created | timestamp | Invoice creation date |
| createdAt | timestamp | Record creation timestamp |

## API Functions

### Inventory Management

#### Get Inventory Items

```javascript
const { data, error } = await supabase
  .from('fish_items')
  .select('*')
  .eq('userId', userId);
```

#### Add Inventory Item

```javascript
const { data, error } = await supabase
  .from('fish_items')
  .insert([{
    userId,
    itemName,
    currentStock,
    unit,
    lowStockThreshold,
    pricePerUnit
  }])
  .select();
```

#### Update Inventory Item

```javascript
const { data, error } = await supabase
  .from('fish_items')
  .update({
    itemName,
    currentStock,
    unit,
    lowStockThreshold,
    pricePerUnit
  })
  .eq('itemId', itemId)
  .select();
```

#### Delete Inventory Item

```javascript
const { error } = await supabase
  .from('fish_items')
  .delete()
  .eq('itemId', itemId);
```

#### Get Low Stock Items

```javascript
const { data, error } = await supabase.rpc('get_low_stock_items', { user_id: userId });
```

### Sales Management

#### Get Sales

```javascript
const { data, error } = await supabase
  .from('sales')
  .select(`
    *,
    sale_items(*)
  `)
  .eq('userId', userId)
  .order('timestamp', { ascending: false });
```

#### Add Sale

```javascript
// Add sale record
const { data: saleData, error: saleError } = await supabase
  .from('sales')
  .insert([{
    userId,
    totalAmount,
    paymentMethod
  }])
  .select();

// Add sale items
const saleId = saleData[0].saleId;
const saleItems = items.map(item => ({
  saleId,
  itemId: item.itemId,
  quantitySold: item.quantity,
  pricePerUnit: item.pricePerUnit
}));

const { error: itemsError } = await supabase
  .from('sale_items')
  .insert(saleItems);
```

#### Get Sales by Date Range

```javascript
const { data, error } = await supabase
  .from('sales')
  .select(`
    *,
    sale_items(*)
  `)
  .eq('userId', userId)
  .gte('timestamp', startDate)
  .lte('timestamp', endDate)
  .order('timestamp', { ascending: false });
```

### Real-time Subscriptions

#### Subscribe to Inventory Changes

```javascript
const subscription = supabase
  .channel('inventory-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'fish_items',
      filter: `userId=eq.${userId}`,
    },
    (payload) => {
      // Handle change
      console.log('Inventory change:', payload);
    }
  )
  .subscribe();
```

#### Subscribe to Sales Changes

```javascript
const subscription = supabase
  .channel('sales-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sales',
      filter: `userId=eq.${userId}`,
    },
    (payload) => {
      // Handle change
      console.log('Sales change:', payload);
    }
  )
  .subscribe();
```

## Edge Functions

### Send Notification

Sends an email notification to a user.

```javascript
const { error } = await supabase.functions.invoke('send-notification', {
  body: {
    userId,
    type, // 'low-stock-alert', 'sales-summary', etc.
    data // Additional data for the notification
  }
});
```

### Check Inventory

Scheduled function that checks inventory levels and sends notifications for low stock.

```javascript
// This function is triggered by a cron job
// No client-side invocation
```

## Error Handling

All Supabase API calls return an object with `data` and `error` properties. Always check for errors before using the data.

```javascript
const { data, error } = await supabase.from('fish_items').select('*');

if (error) {
  console.error('Error fetching inventory:', error);
  // Handle error
  return;
}

// Use data
console.log('Inventory items:', data);
```

## Rate Limits

Supabase imposes rate limits on API calls. The exact limits depend on your Supabase plan. For most operations, the limits are generous enough for normal usage.

## Security Considerations

- Always use Row Level Security (RLS) policies to restrict access to data
- Never expose your Supabase service key in client-side code
- Use the anon key for client-side operations
- Validate user input before sending it to Supabase
- Use prepared statements to prevent SQL injection

