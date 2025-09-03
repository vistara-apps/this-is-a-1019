import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Bell, Mail, BellOff, Save } from 'lucide-react';
import { getNotificationPreferences, saveNotificationPreferences, requestNotificationPermission } from '../../services/notifications';

const NotificationSettings = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useUI();
  
  const [settings, setSettings] = useState({
    emailEnabled: true,
    browserEnabled: true,
    lowStockAlerts: true,
    salesSummary: true,
    newFeatures: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    // Check browser notification permission
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
    
    // Load notification preferences
    const loadPreferences = async () => {
      if (user) {
        try {
          const preferences = await getNotificationPreferences(user.id);
          setSettings(preferences);
        } catch (error) {
          console.error('Error loading notification preferences:', error);
          showError('Failed to load notification preferences');
        }
      }
    };
    
    loadPreferences();
  }, [user, showError]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleRequestPermission = async () => {
    try {
      const { granted, reason } = await requestNotificationPermission();
      setBrowserPermission(granted ? 'granted' : reason);
      
      if (granted) {
        showSuccess('Browser notification permission granted');
        setSettings(prev => ({ ...prev, browserEnabled: true }));
      } else {
        showError(`Browser notification permission ${reason}`);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showError('Failed to request notification permission');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      await saveNotificationPreferences(user.id, settings);
      
      showSuccess('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showError(error.message || 'Failed to save notification preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Notification Settings</h1>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white mb-4">Notification Channels</h2>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <Mail size={20} className="text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Email Notifications</h3>
                  <p className="text-white/70 text-sm">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailEnabled"
                  checked={settings.emailEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <Bell size={20} className="text-white mr-3" />
                <div>
                  <h3 className="text-white font-medium">Browser Notifications</h3>
                  <p className="text-white/70 text-sm">Receive notifications in your browser</p>
                </div>
              </div>
              {browserPermission === 'granted' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="browserEnabled"
                    checked={settings.browserEnabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="bg-primary hover:bg-primary/80 text-white px-3 py-1.5 text-sm rounded-lg transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-medium text-white mb-4">Notification Types</h2>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Low Stock Alerts</h3>
                <p className="text-white/70 text-sm">Get notified when inventory items are running low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="lowStockAlerts"
                  checked={settings.lowStockAlerts}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Sales Summary</h3>
                <p className="text-white/70 text-sm">Receive daily and weekly sales summaries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="salesSummary"
                  checked={settings.salesSummary}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">New Features & Updates</h3>
                <p className="text-white/70 text-sm">Stay informed about new features and app updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="newFeatures"
                  checked={settings.newFeatures}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;

