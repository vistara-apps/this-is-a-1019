// Notification service for handling email and in-app notifications
import { supabase } from './supabase';

// Check if browser supports notifications
const checkNotificationSupport = () => {
  return 'Notification' in window;
};

// Request permission for browser notifications
export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) {
    return { granted: false, reason: 'not-supported' };
  }
  
  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted', reason: permission };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, reason: 'error' };
  }
};

// Send a browser notification
export const sendBrowserNotification = (title, options = {}) => {
  if (!checkNotificationSupport()) {
    console.warn('Browser notifications not supported');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }
  
  try {
    return new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });
  } catch (error) {
    console.error('Error sending browser notification:', error);
    return null;
  }
};

// Save notification preferences to Supabase
export const saveNotificationPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        userId,
        ...preferences
      })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    throw error;
  }
};

// Get notification preferences from Supabase
export const getNotificationPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    
    // Return default preferences if none found
    return data || {
      userId,
      emailEnabled: true,
      browserEnabled: true,
      lowStockAlerts: true,
      salesSummary: true,
      newFeatures: true
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
};

// Send an email notification via Supabase Edge Function
export const sendEmailNotification = async (userId, type, data) => {
  try {
    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        type,
        data
      }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Send a low stock alert
export const sendLowStockAlert = async (userId, items) => {
  try {
    // Get user notification preferences
    const preferences = await getNotificationPreferences(userId);
    
    // Send browser notification if enabled
    if (preferences.browserEnabled && preferences.lowStockAlerts) {
      const itemNames = items.map(item => item.itemName).join(', ');
      sendBrowserNotification('Low Stock Alert', {
        body: `The following items are running low: ${itemNames}`,
        tag: 'low-stock-alert'
      });
    }
    
    // Send email notification if enabled
    if (preferences.emailEnabled && preferences.lowStockAlerts) {
      await sendEmailNotification(userId, 'low-stock-alert', { items });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending low stock alert:', error);
    throw error;
  }
};

// Send a sales summary notification
export const sendSalesSummary = async (userId, summaryData) => {
  try {
    // Get user notification preferences
    const preferences = await getNotificationPreferences(userId);
    
    // Send browser notification if enabled
    if (preferences.browserEnabled && preferences.salesSummary) {
      sendBrowserNotification('Sales Summary', {
        body: `Your daily sales summary is ready. Total sales: $${summaryData.totalAmount.toFixed(2)}`,
        tag: 'sales-summary'
      });
    }
    
    // Send email notification if enabled
    if (preferences.emailEnabled && preferences.salesSummary) {
      await sendEmailNotification(userId, 'sales-summary', summaryData);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending sales summary:', error);
    throw error;
  }
};

export default {
  requestNotificationPermission,
  sendBrowserNotification,
  saveNotificationPreferences,
  getNotificationPreferences,
  sendEmailNotification,
  sendLowStockAlert,
  sendSalesSummary
};

