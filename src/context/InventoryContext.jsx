import React, { createContext, useContext, useState, useEffect } from 'react';
import { inventory as inventoryService } from '../services/supabase';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load inventory data from Supabase
  useEffect(() => {
    const fetchInventory = async () => {
      if (!isAuthenticated || !user) {
        // If not authenticated, use demo data
        const demoInventory = [
          {
            itemId: '1',
            itemName: 'Salmon',
            currentStock: 15,
            unit: 'kg',
            lowStockThreshold: 5,
            pricePerUnit: 25.99
          },
          {
            itemId: '2',
            itemName: 'Tuna',
            currentStock: 8,
            unit: 'kg',
            lowStockThreshold: 10,
            pricePerUnit: 35.50
          },
          {
            itemId: '3',
            itemName: 'Cod',
            currentStock: 20,
            unit: 'kg',
            lowStockThreshold: 8,
            pricePerUnit: 18.75
          },
          {
            itemId: '4',
            itemName: 'Mackerel',
            currentStock: 3,
            unit: 'kg',
            lowStockThreshold: 5,
            pricePerUnit: 12.99
          }
        ];
        setInventory(demoInventory);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await inventoryService.getItems(user.id);
        setInventory(data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory data');
        
        // Fallback to localStorage if available
        const savedInventory = localStorage.getItem('fishInventory');
        if (savedInventory) {
          setInventory(JSON.parse(savedInventory));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    // Set up real-time subscription if authenticated
    let subscription;
    if (isAuthenticated && user) {
      subscription = inventoryService.subscribeToInventory(user.id, (payload) => {
        // Update inventory when changes occur
        fetchInventory();
      });
    }

    return () => {
      // Clean up subscription
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, isAuthenticated]);

  // Check for low stock and create alerts
  useEffect(() => {
    const alerts = inventory.filter(item => item.currentStock <= item.lowStockThreshold);
    setLowStockAlerts(alerts);
  }, [inventory]);

  // Add a new inventory item
  const addItem = async (item) => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Fallback to localStorage if not authenticated
        const newItem = {
          ...item,
          itemId: Date.now().toString()
        };
        const updatedInventory = [...inventory, newItem];
        setInventory(updatedInventory);
        localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
        return newItem;
      }
      
      const newItem = {
        ...item,
        userId: user.id
      };
      
      const addedItem = await inventoryService.addItem(newItem);
      
      // Optimistically update the UI
      setInventory(prev => [...prev, addedItem]);
      
      return addedItem;
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
      throw err;
    }
  };

  // Update stock quantity for an item
  const updateStock = async (itemId, newStock) => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Fallback to localStorage if not authenticated
        const updatedInventory = inventory.map(item => 
          item.itemId === itemId ? { ...item, currentStock: newStock } : item
        );
        setInventory(updatedInventory);
        localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
        return;
      }
      
      await inventoryService.updateItem(itemId, { currentStock: newStock });
      
      // Optimistically update the UI
      setInventory(prev => 
        prev.map(item => item.itemId === itemId ? { ...item, currentStock: newStock } : item)
      );
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock');
      throw err;
    }
  };

  // Update an inventory item
  const updateItem = async (itemId, updates) => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Fallback to localStorage if not authenticated
        const updatedInventory = inventory.map(item => 
          item.itemId === itemId ? { ...item, ...updates } : item
        );
        setInventory(updatedInventory);
        localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
        return;
      }
      
      await inventoryService.updateItem(itemId, updates);
      
      // Optimistically update the UI
      setInventory(prev => 
        prev.map(item => item.itemId === itemId ? { ...item, ...updates } : item)
      );
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
      throw err;
    }
  };

  // Delete an inventory item
  const deleteItem = async (itemId) => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        // Fallback to localStorage if not authenticated
        const updatedInventory = inventory.filter(item => item.itemId !== itemId);
        setInventory(updatedInventory);
        localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
        return;
      }
      
      await inventoryService.deleteItem(itemId);
      
      // Optimistically update the UI
      setInventory(prev => prev.filter(item => item.itemId !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
      throw err;
    }
  };

  // Process a sale and update inventory
  const processSale = async (saleItems) => {
    try {
      setError(null);
      
      // Update each item's stock based on the sale
      for (const saleItem of saleItems) {
        const item = inventory.find(i => i.itemId === saleItem.itemId);
        if (item) {
          const newStock = Math.max(0, item.currentStock - saleItem.quantity);
          await updateStock(item.itemId, newStock);
        }
      }
    } catch (err) {
      console.error('Error processing sale:', err);
      setError('Failed to process sale');
      throw err;
    }
  };

  const value = {
    inventory,
    lowStockAlerts,
    loading,
    error,
    addItem,
    updateStock,
    updateItem,
    deleteItem,
    processSale
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

