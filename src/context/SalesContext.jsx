import React, { createContext, useContext, useState, useEffect } from 'react';
import { sales as salesService } from '../services/supabase';
import { useAuth } from './AuthContext';

const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load sales data from Supabase
  useEffect(() => {
    const fetchSales = async () => {
      if (!isAuthenticated || !user) {
        // If not authenticated, use localStorage data if available
        const savedSales = localStorage.getItem('fishSales');
        if (savedSales) {
          setSales(JSON.parse(savedSales));
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await salesService.getSales(user.id);
        setSales(data);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to load sales data');
        
        // Fallback to localStorage if available
        const savedSales = localStorage.getItem('fishSales');
        if (savedSales) {
          setSales(JSON.parse(savedSales));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSales();

    // Set up real-time subscription if authenticated
    let subscription;
    if (isAuthenticated && user) {
      subscription = salesService.subscribeToSales(user.id, (payload) => {
        // Update sales when changes occur
        fetchSales();
      });
    }

    return () => {
      // Clean up subscription
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, isAuthenticated]);

  // Add a new sale
  const addSale = async (sale) => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Fallback to localStorage if not authenticated
        const newSale = {
          ...sale,
          saleId: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        const updatedSales = [...sales, newSale];
        setSales(updatedSales);
        localStorage.setItem('fishSales', JSON.stringify(updatedSales));
        return newSale;
      }
      
      const saleWithUserId = {
        ...sale,
        userId: user.id
      };
      
      const newSale = await salesService.addSale(saleWithUserId);
      
      // Optimistically update the UI
      setSales(prev => [...prev, newSale]);
      
      return newSale;
    } catch (err) {
      console.error('Error adding sale:', err);
      setError('Failed to add sale');
      throw err;
    }
  };

  // Get sales for today
  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return sales.filter(sale => 
      new Date(sale.timestamp).toDateString() === today
    );
  };

  // Get total revenue
  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  // Get sales data for the last 7 days
  const getSalesData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const daySales = sales.filter(sale => 
        new Date(sale.timestamp).toDateString() === date.toDateString()
      );
      const dayRevenue = daySales.reduce((total, sale) => total + sale.totalAmount, 0);
      last7Days.push({
        day: dayName,
        revenue: dayRevenue,
        sales: daySales.length
      });
    }
    return last7Days;
  };

  // Get sales for a specific date range
  const getSalesByDateRange = async (startDate, endDate) => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Filter local sales if not authenticated
        const filteredSales = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
        return filteredSales;
      }
      
      const data = await salesService.getSalesByDateRange(user.id, startDate, endDate);
      return data;
    } catch (err) {
      console.error('Error fetching sales by date range:', err);
      setError('Failed to load sales for the specified date range');
      throw err;
    }
  };

  // Get sales statistics
  const getStatistics = async () => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Calculate statistics locally if not authenticated
        const totalSales = sales.length;
        const totalRevenue = getTotalRevenue();
        const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        return {
          totalSales,
          totalRevenue,
          averageSaleValue
        };
      }
      
      const data = await salesService.getStatistics(user.id);
      return data;
    } catch (err) {
      console.error('Error fetching sales statistics:', err);
      setError('Failed to load sales statistics');
      throw err;
    }
  };

  const value = {
    sales,
    loading,
    error,
    addSale,
    getTodaysSales,
    getTotalRevenue,
    getSalesData,
    getSalesByDateRange,
    getStatistics
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};

