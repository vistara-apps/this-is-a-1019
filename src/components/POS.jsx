import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';

const POS = () => {
  const { inventory, processSale } = useInventory();
  const { addSale } = useSales();
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.itemId === item.itemId);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.itemId === item.itemId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item =>
      item.itemId === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.itemId !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0);
  };

  const handleSaleProcess = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Check stock availability
    for (const cartItem of cart) {
      const inventoryItem = inventory.find(item => item.itemId === cartItem.itemId);
      if (!inventoryItem || inventoryItem.currentStock < cartItem.quantity) {
        alert(`Insufficient stock for ${cartItem.itemName}. Available: ${inventoryItem?.currentStock || 0}`);
        return;
      }
    }

    const sale = {
      totalAmount: calculateTotal(),
      paymentMethod,
      items: cart.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        total: item.quantity * item.pricePerUnit
      }))
    };

    addSale(sale);
    processSale(cart.map(item => ({ itemId: item.itemId, quantity: item.quantity })));
    setCart([]);
    alert('Sale processed successfully!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-white">Select Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map((item) => (
              <div key={item.itemId} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium">{item.itemName}</h3>
                    <p className="text-white/70 text-sm">${item.pricePerUnit} per {item.unit}</p>
                    <p className="text-white/50 text-xs">Stock: {item.currentStock} {item.unit}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.currentStock === 0}
                    className="bg-accent hover:bg-accent/80 disabled:bg-gray-500/50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {item.currentStock <= item.lowStockThreshold && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded px-2 py-1">
                    <span className="text-red-400 text-xs">Low Stock</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} className="text-white" />
            <h2 className="text-lg font-medium text-white">Cart</h2>
          </div>

          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.itemName}</p>
                  <p className="text-white/70 text-xs">${item.pricePerUnit} per {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    className="bg-white/10 hover:bg-white/20 text-white p-1 rounded"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                    className="bg-white/10 hover:bg-white/20 text-white p-1 rounded"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-1 rounded ml-2"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-white/50 text-center py-8">Cart is empty</p>
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="border-t border-white/20 pt-4 mb-4">
                <div className="flex justify-between text-white font-semibold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-white text-sm font-medium mb-2 block">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital">Digital Payment</option>
                </select>
              </div>

              <button
                onClick={handleSaleProcess}
                className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <CreditCard size={20} />
                Process Sale
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;
