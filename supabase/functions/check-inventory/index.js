// Supabase Edge Function for checking inventory levels
// This function is deployed to Supabase Edge Functions and scheduled to run periodically

// Import required modules
// Note: In a real deployment, you would use the Supabase Edge Runtime
// which provides access to these modules
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to get all users with active subscriptions
async function getActiveUsers() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('userId')
    .in('status', ['active', 'trialing'])
    .eq('cancelAtPeriodEnd', false);
  
  if (error) {
    throw error;
  }
  
  return data.map(item => item.userId);
}

// Function to get low stock items for a user
async function getLowStockItems(userId) {
  const { data, error } = await supabase
    .from('fish_items')
    .select('*')
    .eq('userId', userId)
    .lte('currentStock', supabase.raw('low_stock_threshold'));
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Function to check if user has notification preferences enabled
async function shouldNotifyUser(userId) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('emailEnabled, lowStockAlerts')
    .eq('userId', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error;
  }
  
  // Default to true if no preferences found
  if (!data) {
    return true;
  }
  
  return data.emailEnabled && data.lowStockAlerts;
}

// Function to check if user has been notified recently
async function wasRecentlyNotified(userId) {
  const { data, error } = await supabase
    .from('notification_history')
    .select('created_at')
    .eq('userId', userId)
    .eq('type', 'low-stock-alert')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    throw error;
  }
  
  if (!data || data.length === 0) {
    return false;
  }
  
  // Check if last notification was within the last 24 hours
  const lastNotification = new Date(data[0].created_at);
  const now = new Date();
  const hoursSinceLastNotification = (now - lastNotification) / (1000 * 60 * 60);
  
  return hoursSinceLastNotification < 24;
}

// Function to record notification in history
async function recordNotification(userId, type) {
  const { error } = await supabase
    .from('notification_history')
    .insert([{
      userId,
      type
    }]);
  
  if (error) {
    throw error;
  }
}

// Function to send notification
async function sendNotification(userId, items) {
  const { error } = await supabase.functions.invoke('send-notification', {
    body: {
      userId,
      type: 'low-stock-alert',
      data: { items }
    }
  });
  
  if (error) {
    throw error;
  }
}

// Main handler function
Deno.serve(async (req) => {
  try {
    // Get all active users
    const activeUsers = await getActiveUsers();
    
    // Process each user
    const results = [];
    
    for (const userId of activeUsers) {
      try {
        // Check if user should be notified
        const shouldNotify = await shouldNotifyUser(userId);
        
        if (!shouldNotify) {
          results.push({ userId, status: 'skipped', reason: 'notifications disabled' });
          continue;
        }
        
        // Check if user was recently notified
        const recentlyNotified = await wasRecentlyNotified(userId);
        
        if (recentlyNotified) {
          results.push({ userId, status: 'skipped', reason: 'recently notified' });
          continue;
        }
        
        // Get low stock items
        const lowStockItems = await getLowStockItems(userId);
        
        if (lowStockItems.length === 0) {
          results.push({ userId, status: 'skipped', reason: 'no low stock items' });
          continue;
        }
        
        // Send notification
        await sendNotification(userId, lowStockItems);
        
        // Record notification
        await recordNotification(userId, 'low-stock-alert');
        
        results.push({ userId, status: 'notified', itemCount: lowStockItems.length });
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.push({ userId, status: 'error', error: error.message });
      }
    }
    
    // Return results
    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking inventory:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

