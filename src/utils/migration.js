import { inventory as inventoryService, sales as salesService } from '../services/supabase';

/**
 * Migrates inventory data from localStorage to Supabase
 * @param {string} userId - The user ID to associate with the migrated data
 * @returns {Promise<{success: boolean, migrated: number, errors: number}>}
 */
export const migrateInventory = async (userId) => {
  try {
    // Get inventory data from localStorage
    const savedInventory = localStorage.getItem('fishInventory');
    if (!savedInventory) {
      return { success: true, migrated: 0, errors: 0 };
    }
    
    const inventoryData = JSON.parse(savedInventory);
    if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
      return { success: true, migrated: 0, errors: 0 };
    }
    
    // Prepare data for Supabase
    const items = inventoryData.map(item => ({
      ...item,
      userId
    }));
    
    // Track migration results
    let migrated = 0;
    let errors = 0;
    
    // Migrate each item individually to handle errors better
    for (const item of items) {
      try {
        await inventoryService.addItem(item);
        migrated++;
      } catch (error) {
        console.error('Error migrating inventory item:', error);
        errors++;
      }
    }
    
    return {
      success: errors === 0,
      migrated,
      errors
    };
  } catch (error) {
    console.error('Error in inventory migration:', error);
    return {
      success: false,
      migrated: 0,
      errors: 1,
      error: error.message
    };
  }
};

/**
 * Migrates sales data from localStorage to Supabase
 * @param {string} userId - The user ID to associate with the migrated data
 * @returns {Promise<{success: boolean, migrated: number, errors: number}>}
 */
export const migrateSales = async (userId) => {
  try {
    // Get sales data from localStorage
    const savedSales = localStorage.getItem('fishSales');
    if (!savedSales) {
      return { success: true, migrated: 0, errors: 0 };
    }
    
    const salesData = JSON.parse(savedSales);
    if (!Array.isArray(salesData) || salesData.length === 0) {
      return { success: true, migrated: 0, errors: 0 };
    }
    
    // Track migration results
    let migrated = 0;
    let errors = 0;
    
    // Migrate each sale individually
    for (const sale of salesData) {
      try {
        const saleWithUserId = {
          ...sale,
          userId
        };
        
        await salesService.addSale(saleWithUserId);
        migrated++;
      } catch (error) {
        console.error('Error migrating sale:', error);
        errors++;
      }
    }
    
    return {
      success: errors === 0,
      migrated,
      errors
    };
  } catch (error) {
    console.error('Error in sales migration:', error);
    return {
      success: false,
      migrated: 0,
      errors: 1,
      error: error.message
    };
  }
};

/**
 * Migrates all data from localStorage to Supabase
 * @param {string} userId - The user ID to associate with the migrated data
 * @returns {Promise<{success: boolean, inventory: object, sales: object}>}
 */
export const migrateAllData = async (userId) => {
  const inventoryResult = await migrateInventory(userId);
  const salesResult = await migrateSales(userId);
  
  return {
    success: inventoryResult.success && salesResult.success,
    inventory: inventoryResult,
    sales: salesResult
  };
};

/**
 * Clears localStorage data after successful migration
 * @param {boolean} clearInventory - Whether to clear inventory data
 * @param {boolean} clearSales - Whether to clear sales data
 */
export const clearLocalData = (clearInventory = true, clearSales = true) => {
  if (clearInventory) {
    localStorage.removeItem('fishInventory');
  }
  
  if (clearSales) {
    localStorage.removeItem('fishSales');
  }
};

export default {
  migrateInventory,
  migrateSales,
  migrateAllData,
  clearLocalData
};

