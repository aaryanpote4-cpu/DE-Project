import React, { useState, useEffect } from 'react';
import { useLogistics } from '../contexts/LogisticsContext';
import { getLocations, addOrder } from '../api';
import { X, PackagePlus } from 'lucide-react';

interface QuickDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickDispatchModal({ isOpen, onClose }: QuickDispatchModalProps) {
  const { products, logActivity } = useLogistics();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getLocations().then(setLocations).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod || !destLocation) return;
    
    setIsSubmitting(true);
    try {
      const backendSource = locations.find(l => l.name.includes(prod.location) || l.id == prod.location)?.id;
      const backendDest = destLocation;

      if(backendSource && backendDest) {
        await addOrder({ source: backendSource, destination: backendDest });
        logActivity(`Created quick order for ${prod.name}`);
        onClose(); // close on success
        setSelectedProduct('');
        setDestLocation('');
      } else {
        alert("Please select valid network nodes mapping to the backend");
      }
    } catch (err) {
      console.error(err);
      alert("Failed creating order. Is backend node running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PackagePlus className="text-blue-500" /> New Dispatch
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Inventory Product</label>
            <select 
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none" 
              required 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- Choose Item --</option>
              {products.filter(p => p.quantity > 0).map(p => (
                <option key={p.id} value={p.id}>{p.name} (Loc: {p.location})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Destination Hub</label>
            <select 
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none" 
              required 
              value={destLocation} 
              onChange={e => setDestLocation(e.target.value)}
            >
              <option value="">-- Choose Dropoff --</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition disabled:opacity-70 flex justify-center items-center"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Dispatch'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
