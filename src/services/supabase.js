import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const auth = {
  // Sign up a new user
  signUp: async ({ email, password, shopName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          shopName,
          subscriptionPlan: 'free', // Default to free plan
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in an existing user
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out the current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  },

  // Update password
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  },

  // Get the current user
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user;
  },

  // Get the current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Update user profile
  updateProfile: async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    
    if (error) throw error;
    return data;
  },
};

// Inventory functions
export const inventory = {
  // Get all inventory items for the current user
  getItems: async (userId) => {
    const { data, error } = await supabase
      .from('fish_items')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data;
  },

  // Add a new inventory item
  addItem: async (item) => {
    const { data, error } = await supabase
      .from('fish_items')
      .insert([item])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update an inventory item
  updateItem: async (itemId, updates) => {
    const { data, error } = await supabase
      .from('fish_items')
      .update(updates)
      .eq('itemId', itemId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete an inventory item
  deleteItem: async (itemId) => {
    const { error } = await supabase
      .from('fish_items')
      .delete()
      .eq('itemId', itemId);
    
    if (error) throw error;
  },

  // Subscribe to inventory changes
  subscribeToInventory: (userId, callback) => {
    return supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fish_items',
          filter: `userId=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Get low stock items
  getLowStockItems: async (userId) => {
    const { data, error } = await supabase.rpc('get_low_stock_items', { user_id: userId });
    
    if (error) throw error;
    return data;
  },
};

// Sales functions
export const sales = {
  // Get all sales for the current user
  getSales: async (userId) => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items(*)
      `)
      .eq('userId', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Add a new sale
  addSale: async (sale) => {
    // Start a transaction
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{
        userId: sale.userId,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
      }])
      .select();
    
    if (saleError) throw saleError;
    
    const saleId = saleData[0].saleId;
    
    // Add sale items
    const saleItems = sale.items.map(item => ({
      saleId,
      itemId: item.itemId,
      quantitySold: item.quantity,
      pricePerUnit: item.pricePerUnit,
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) throw itemsError;
    
    return { ...saleData[0], items: saleItems };
  },

  // Get sales for a specific date range
  getSalesByDateRange: async (userId, startDate, endDate) => {
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
    
    if (error) throw error;
    return data;
  },

  // Subscribe to sales changes
  subscribeToSales: (userId, callback) => {
    return supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `userId=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Get sales statistics
  getStatistics: async (userId) => {
    const { data, error } = await supabase.rpc('get_sales_statistics', { user_id: userId });
    
    if (error) throw error;
    return data;
  },
};

// User functions
export const users = {
  // Get user profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('userId', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Get subscription details
  getSubscription: async (userId) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },
};

export default {
  auth,
  inventory,
  sales,
  users,
};

