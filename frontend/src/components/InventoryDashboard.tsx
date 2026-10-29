import React, { useEffect, useState } from 'react';
import { getInventory, addInventoryItem, buyInventoryItem, sellInventoryItem, type InventoryItem } from '../api';

const InventoryDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Add item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
  // Dialog state
  const [actionItem, setActionItem] = useState<{ id: string, name: string } | null>(null);
  const [actionType, setActionType] = useState<'BUY' | 'SELL' | null>(null);
  const [actionQty, setActionQty] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQty || !newItemPrice) return;
    try {
      await addInventoryItem({
        name: newItemName,
        quantity: parseInt(newItemQty, 10),
        price: parseFloat(newItemPrice)
      });
      setNewItemName('');
      setNewItemQty('');
      setNewItemPrice('');
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const submitAction = async () => {
    if (!actionItem || !actionType || !actionQty) return;
    try {
      const qty = parseInt(actionQty, 10);
      if (actionType === 'BUY') {
        await buyInventoryItem(actionItem.id, qty);
      } else {
        await sellInventoryItem(actionItem.id, qty);
      }
      setActionItem(null);
      setActionType(null);
      setActionQty('');
      fetchInventory();
    } catch (err) {
      alert("Failed to process transaction. Ensure you have enough stock before selling.");
      console.error(err);
    }
  };

  const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar: Add Item Form & Stats */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Total Warehouse Value</h3>
          <p className="text-2xl font-bold text-blue-600">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-grow">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Add New Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input value={newItemName} onChange={e => setNewItemName(e.target.value)} required placeholder="Item Name" className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
               </div>
               <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" min="0" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} required placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" min="0" step="any" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2.5 font-medium hover:bg-blue-700 transition">Add Item</button>
          </form>
        </div>
      </div>

      {/* Main Content: Inventory Grid */}
      <div className="w-full lg:w-2/3 bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative min-h-[400px]">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-md font-semibold text-gray-800">Current Stock Levels</h3>
           <button onClick={fetchInventory} className="text-blue-600 text-sm hover:underline">Refresh</button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-gray-200 text-sm text-gray-600">
                 <th className="py-2">Item Name</th>
                 <th className="py-2 text-right">Price</th>
                 <th className="py-2 text-right">Quantity</th>
                 <th className="py-2 text-center">Actions</th>
               </tr>
             </thead>
             <tbody>
               {inventory.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No items in stock. Add some items to begin.</td>
                 </tr>
               ) : (
                 inventory.map(item => (
                   <tr key={item.id} className="border-b border-gray-100 text-sm text-gray-800">
                     <td className="py-3">{item.name}</td>
                     <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                     <td className="py-3 text-right font-semibold">{item.quantity}</td>
                     <td className="py-3 text-center space-x-2">
                        <button 
                           onClick={() => { setActionItem({id: item.id, name: item.name}); setActionType('BUY'); }}
                           className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition"
                        >Buy</button>
                        <button 
                           onClick={() => { setActionItem({id: item.id, name: item.name}); setActionType('SELL'); }}
                           className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition"
                        >Sell</button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        )}

        {/* Action Modal Overlay */}
        {actionItem && (
           <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-4 border border-gray-200 shadow-lg rounded-xl">
             <h3 className="text-lg font-bold mb-2">{actionType === 'BUY' ? 'Buy Stock' : 'Sell Stock'}</h3>
             <p className="text-sm text-gray-600 mb-6">{actionType === 'BUY' ? 'Increase' : 'Decrease'} inventory for <strong>{actionItem.name}</strong></p>
             
             <input type="number" min="1" value={actionQty} onChange={e => setActionQty(e.target.value)} placeholder="Quantity" className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md mb-4 text-center outline-none focus:ring-1 focus:ring-blue-500" />
             
             <div className="flex gap-3 w-full max-w-xs">
               <button onClick={() => { setActionItem(null); setActionType(null); }} className="flex-1 py-2 font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">Cancel</button>
               <button onClick={submitAction} className="flex-1 py-2 font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm</button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;
