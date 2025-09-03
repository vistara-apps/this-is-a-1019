import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

const EditItemForm = ({ item, onClose }) => {
  const { updateItem } = useInventory();
  const [formData, setFormData] = useState({
    itemName: item.itemName,
    currentStock: item.currentStock.toString(),
    unit: item.unit,
    pricePerUnit: item.pricePerUnit.toString(),
    lowStockThreshold: item.lowStockThreshold.toString()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.currentStock || !formData.pricePerUnit || !formData.lowStockThreshold) {
      alert('Please fill in all fields');
      return;
    }

    updateItem(item.itemId, {
      ...formData,
      currentStock: parseFloat(formData.currentStock),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      lowStockThreshold: parseFloat(formData.lowStockThreshold)
    });

    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white text-sm font-medium mb-2">Fish Type Name</label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Current Stock</label>
          <input
            type="number"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
            <option value="pieces">pieces</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Price per Unit ($)</label>
        <input
          type="number"
          name="pricePerUnit"
          value={formData.pricePerUnit}
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Low Stock Threshold</label>
        <input
          type="number"
          name="lowStockThreshold"
          value={formData.lowStockThreshold}
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
          min="0"
          step="0.1"
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Update Item
        </button>
      </div>
    </form>
  );
};

export default EditItemForm;