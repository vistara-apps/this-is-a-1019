import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const savedSales = localStorage.getItem('fishSales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  const addSale = (sale) => {
    const newSale = {
      ...sale,
      saleId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    localStorage.setItem('fishSales', JSON.stringify(updatedSales));
    return newSale;
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return sales.filter(sale => 
      new Date(sale.timestamp).toDateString() === today
    );
  };

  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.totalAmount, 0);
  };

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

  const value = {
    sales,
    addSale,
    getTodaysSales,
    getTotalRevenue,
    getSalesData
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};