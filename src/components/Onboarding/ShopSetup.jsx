import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Store, MapPin, Phone, Globe, ArrowRight } from 'lucide-react';

const ShopSetup = ({ onNext }) => {
  const { user, updateProfile } = useAuth();
  const { showError, showSuccess } = useUI();
  
  const [shopData, setShopData] = useState({
    shopName: user?.user_metadata?.shopName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shopData.shopName) {
      showError('Shop name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updateProfile({
        shopName: shopData.shopName,
        shopAddress: shopData.address,
        shopCity: shopData.city,
        shopState: shopData.state,
        shopZipCode: shopData.zipCode,
        shopPhone: shopData.phone,
        shopWebsite: shopData.website,
        onboardingStep: 'shop-setup-completed'
      });
      
      showSuccess('Shop information saved successfully');
      
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Shop setup error:', error);
      showError(error.message || 'Failed to save shop information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-white/10 rounded-full p-3 inline-flex mb-4">
          <Store size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Set Up Your Shop</h2>
        <p className="text-white/70">Tell us about your fish shop to personalize your experience</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="shopName" className="block text-sm font-medium text-white mb-2">
              Shop Name*
            </label>
            <input
              id="shopName"
              name="shopName"
              type="text"
              value={shopData.shopName}
              onChange={handleChange}
              className="bg-white/10 border border-white/20 text-white rounded-lg block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your Fish Shop"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
              Street Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={shopData.address}
              onChange={handleChange}
              className="bg-white/10 border border-white/20 text-white rounded-lg block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="123 Main St"
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={shopData.city}
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
                value={shopData.state}
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
                value={shopData.zipCode}
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
                value={shopData.phone}
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
                value={shopData.website}
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
                <span>Continue</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopSetup;

