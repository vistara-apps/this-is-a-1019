import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import Modal from './Modal';
import AddItemForm from './AddItemForm';
import EditItemForm from './EditItemForm';

const Inventory = () => {
  const { inventory, deleteItem } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(itemId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Inventory Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Fish Type
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white font-medium">Fish Type</th>
                <th className="text-left p-4 text-white font-medium">Current Stock</th>
                <th className="text-left p-4 text-white font-medium">Unit</th>
                <th className="text-left p-4 text-white font-medium">Price per Unit</th>
                <th className="text-left p-4 text-white font-medium">Low Stock Alert</th>
                <th className="text-left p-4 text-white font-medium">Status</th>
                <th className="text-left p-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.itemId} className="border-t border-white/10">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 rounded-lg p-2">
                        <Package size={16} className="text-white" />
                      </div>
                      <span className="text-white font-medium">{item.itemName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{item.currentStock}</td>
                  <td className="p-4 text-white/70">{item.unit}</td>
                  <td className="p-4 text-white">${item.pricePerUnit}</td>
                  <td className="p-4 text-white/70">{item.lowStockThreshold} {item.unit}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.currentStock <= item.lowStockThreshold
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : item.currentStock <= item.lowStockThreshold * 2
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {item.currentStock <= item.lowStockThreshold
                        ? 'Low Stock'
                        : item.currentStock <= item.lowStockThreshold * 2
                        ? 'Medium'
                        : 'In Stock'
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.itemId)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {inventory.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="text-white/30 mx-auto mb-4" />
              <p className="text-white/70">No fish types added yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg mt-4 transition-colors"
              >
                Add Your First Fish Type
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Fish Type">
        <AddItemForm onClose={() => setShowAddModal(false)} />
      </Modal>

      <Modal 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        title="Edit Fish Type"
      >
        {editingItem && (
          <EditItemForm 
            item={editingItem} 
            onClose={() => setEditingItem(null)} 
          />
        )}
      </Modal>
    </div>
  );
};

export default Inventory;