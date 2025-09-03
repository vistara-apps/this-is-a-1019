import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { User, Mail, Store, MapPin, Phone, Globe, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showError, showSuccess } = useUI();
  
  const [profileData, setProfileData] = useState({
    email: '',
    shopName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        shopName: user.user_metadata?.shopName || '',
        address: user.user_metadata?.shopAddress || '',
        city: user.user_metadata?.shopCity || '',
        state: user.user_metadata?.shopState || '',
        zipCode: user.user_metadata?.shopZipCode || '',
        phone: user.user_metadata?.shopPhone || '',
        website: user.user_metadata?.shopWebsite || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.shopName) {
      showError('Shop name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updateProfile({
        shopName: profileData.shopName,
        shopAddress: profileData.address,
        shopCity: profileData.city,
        shopState: profileData.state,
        shopZipCode: profileData.zipCode,
        shopPhone: profileData.phone,
        shopWebsite: profileData.website
      });
      
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      showError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Account Profile</h1>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-white/50" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-white/50">Email cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-white mb-2">
                Shop Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store size={18} className="text-white/50" />
                </div>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  value={profileData.shopName}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your Fish Shop"
                  required
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-white/50" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={profileData.address}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="123 Main St"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={profileData.city}
                onChange={handleChange}
                className="bg-white/10 border border-white/20 text-white rounded-lg block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Anytown"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-white mb-2">
                  State/Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={profileData.state}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="CA"
                />
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-white mb-2">
                  Zip/Postal Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={profileData.zipCode}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="12345"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-white/50" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe size={18} className="text-white/50" />
                </div>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={profileData.website}
                  onChange={handleChange}
                  className="bg-white/10 border border-white/20 text-white rounded-lg block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://yourfishshop.com"
                />
              </div>
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
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

