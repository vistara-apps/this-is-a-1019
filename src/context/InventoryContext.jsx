import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Load initial inventory from localStorage
    const savedInventory = localStorage.getItem('fishInventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Demo data
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
      localStorage.setItem('fishInventory', JSON.stringify(demoInventory));
    }
  }, []);

  useEffect(() => {
    // Check for low stock and create alerts
    const alerts = inventory.filter(item => item.currentStock <= item.lowStockThreshold);
    setLowStockAlerts(alerts);
  }, [inventory]);

  const addItem = (item) => {
    const newItem = {
      ...item,
      itemId: Date.now().toString()
    };
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
  };

  const updateStock = (itemId, newStock) => {
    const updatedInventory = inventory.map(item => 
      item.itemId === itemId ? { ...item, currentStock: newStock } : item
    );
    setInventory(updatedInventory);
    localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
  };

  const updateItem = (itemId, updates) => {
    const updatedInventory = inventory.map(item => 
      item.itemId === itemId ? { ...item, ...updates } : item
    );
    setInventory(updatedInventory);
    localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
  };

  const deleteItem = (itemId) => {
    const updatedInventory = inventory.filter(item => item.itemId !== itemId);
    setInventory(updatedInventory);
    localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
  };

  const processsale = (saleItems) => {
    const updatedInventory = inventory.map(item => {
      const saleItem = saleItems.find(sale => sale.itemId === item.itemId);
      if (saleItem) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock - saleItem.quantity)
        };
      }
      return item;
    });
    setInventory(updatedInventory);
    localStorage.setItem('fishInventory', JSON.stringify(updatedInventory));
  };

  const value = {
    inventory,
    lowStockAlerts,
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