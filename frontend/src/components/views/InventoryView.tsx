import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Warehouse as WarehouseIcon, Package, CheckCircle, RefreshCw } from 'lucide-react';
import { 
  getWarehouses, 
  getAllWarehouseInventory, 
  addWarehouseInventoryItem, 
  deleteWarehouseInventoryItem, 
  type Warehouse, 
  type WarehouseInventoryItem 
} from '../../api';

export default function InventoryView() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<WarehouseInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  
  // Quick Add Form State
  const [showAdd, setShowAdd] = useState(false);
  const [newProd, setNewProd] = useState({ 
    name: '', 
    sku: '', 
    category: 'Electronics', 
    quantity: 50, 
    unit_price: 1200, 
    warehouse_id: 1 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [whData, invData] = await Promise.all([
        getWarehouses(),
        getAllWarehouseInventory()
      ]);
      setWarehouses(whData);
      setInventory(invData);
      if (whData.length > 0 && !newProd.warehouse_id) {
        setNewProd(prev => ({ ...prev, warehouse_id: whData[0].id }));
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) return;

    setIsSaving(true);
    setFeedback('');

    try {
      const targetWarehouseId = Number(newProd.warehouse_id) || 1;
      const added = await addWarehouseInventoryItem(targetWarehouseId, {
        name: newProd.name.trim(),
        sku: newProd.sku.trim() || undefined,
        category: newProd.category,
        quantity: Number(newProd.quantity) || 1,
        unit_price: Number(newProd.unit_price) || 0,
        status: 'In Stock'
      });

      // Find warehouse details for local display
      const wh = warehouses.find(w => w.id === targetWarehouseId);
      const enrichedItem: WarehouseInventoryItem = {
        ...added,
        warehouse_name: wh ? wh.name : `Warehouse #${targetWarehouseId}`,
        warehouse_city: wh ? wh.city : 'City Hub'
      } as any;

      setInventory(prev => [enrichedItem, ...prev]);
      setFeedback(`Item "${added.name}" saved to database!`);
      setNewProd({
        name: '',
        sku: '',
        category: 'Electronics',
        quantity: 50,
        unit_price: 1200,
        warehouse_id: targetWarehouseId
      });

      setTimeout(() => {
        setShowAdd(false);
        setFeedback('');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to save item to database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Delete this item from the database?')) return;
    try {
      await deleteWarehouseInventoryItem(itemId);
      setInventory(prev => prev.filter(i => i.id !== itemId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const filtered = inventory.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p as any).warehouse_city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWarehouse = 
      selectedWarehouseFilter === 'all' || 
      String(p.warehouse_id) === selectedWarehouseFilter;

    return matchesSearch && matchesWarehouse;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Package size={18} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Inventory System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Synchronized with the relational database. Add, restock, or remove SKUs per Indian warehouse facility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Reload from database"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition shadow-sm cursor-pointer"
          >
            <Plus size={18} /> {showAdd ? 'Close Form' : 'Add Item to Warehouse'}
          </button>
        </div>
      </div>

      {/* Add Item to Database Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-blue-400" /> Add Product to Warehouse in Database
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Writes directly to the MySQL <code>inventory</code> table and updates warehouse capacity.
              </p>
            </div>
            {feedback && (
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle size={14} /> {feedback}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Name *</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Semiconductor Chips (ARM64)" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" 
                value={newProd.name} 
                onChange={e => setNewProd({...newProd, name: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Warehouse *</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                value={newProd.warehouse_id} 
                onChange={e => setNewProd({...newProd, warehouse_id: parseInt(e.target.value) || 1})}
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.city} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                value={newProd.category} 
                onChange={e => setNewProd({...newProd, category: e.target.value})}
              >
                <option value="Electronics">Electronics</option>
                <option value="Medical">Medical</option>
                <option value="Automotive">Automotive</option>
                <option value="Textiles">Textiles</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Robotics">Robotics</option>
                <option value="Cold Chain">Cold Chain</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Metals">Metals</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quantity *</label>
              <input 
                required 
                type="number" 
                min="1" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                value={newProd.quantity} 
                onChange={e => setNewProd({...newProd, quantity: Math.max(1, parseInt(e.target.value) || 1)})} 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Unit Price (₹) *</label>
              <input 
                required 
                type="number" 
                min="0" 
                step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                value={newProd.unit_price} 
                onChange={e => setNewProd({...newProd, unit_price: Math.max(0, parseFloat(e.target.value) || 0)})} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving to Database...
                </>
              ) : (
                <>
                  <Plus size={16} /> Save Item to Database
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by SKU, product name, category, or city..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm font-medium"
            value={selectedWarehouseFilter}
            onChange={e => setSelectedWarehouseFilter(e.target.value)}
          >
            <option value="all">All Warehouses ({warehouses.length})</option>
            {warehouses.map(w => (
              <option key={w.id} value={String(w.id)}>{w.city} ({w.name})</option>
            ))}
          </select>

          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('table')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Table
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Display */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700">Loading database inventory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-3">
          <WarehouseIcon size={48} className="text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Inventory Items Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchTerm ? 'No items match your active search filter.' : 'Click "Add Item to Warehouse" above to add products to the database.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">SKU Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Warehouse Facility</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => {
                  const wh = warehouses.find(w => w.id === p.warehouse_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600">{p.sku}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{wh?.city || (p as any).warehouse_city || `Warehouse #${p.warehouse_id}`}</span>
                        <span className="block text-xs text-slate-400">{wh?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900">{p.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{p.unit_price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.quantity > 50 ? 'bg-emerald-100 text-emerald-700' :
                          p.quantity > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {p.status || (p.quantity > 0 ? 'In Stock' : 'Out of Stock')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition cursor-pointer"
                          title="Delete from database"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => {
            const wh = warehouses.find(w => w.id === p.warehouse_id);
            return (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {p.sku}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {p.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 leading-snug">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <WarehouseIcon size={12} className="text-blue-500" />
                    {wh?.city || (p as any).warehouse_city || `Warehouse #${p.warehouse_id}`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Quantity</span>
                    <strong className="text-slate-900">{p.quantity.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Unit Price</span>
                    <strong className="text-emerald-600 font-bold">₹{p.unit_price?.toLocaleString()}</strong>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(p.id)}
                  className="w-full text-xs font-bold text-rose-600 hover:bg-rose-50 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200"
                >
                  <Trash2 size={13} /> Remove Item
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
