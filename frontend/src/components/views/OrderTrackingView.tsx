/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useLogistics } from '../../contexts/LogisticsContext';
import { getOrders, addOrder, processOrder, getLocations, getEdges, getActiveRoute } from '../../api';
import { Navigation, Clock } from 'lucide-react';
import MapUI from '../MapUI';

export default function OrderTrackingView() {
  const { logActivity, role, products } = useLogistics();
  const [queue, setQueue] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any>({});
  const [locations, setLocations] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  
  // Create Order Form State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [deadlineHrs, setDeadlineHrs] = useState(24);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [previewRoute, setPreviewRoute] = useState<any>(null);

  useEffect(() => {
    if (sourceLocation && destLocation && sourceLocation !== destLocation) {
      import('../../api').then(api => {
        api.getShortestPath(sourceLocation, destLocation).then(res => setPreviewRoute(res));
      });
    } else {
      setPreviewRoute(null);
    }
  }, [sourceLocation, destLocation, locations]);

  // Auto-select nearest source when destination is chosen
  useEffect(() => {
    if (destLocation) {
      import('../../api').then(async (api) => {
        let minDest = Infinity;
        let bestSource = '';
        for (const loc of locations) {
          if (loc.id !== destLocation) {
            const res = await api.getShortestPath(loc.id, destLocation);
            if (res.distance > 0 && res.distance < minDest) {
              minDest = res.distance;
              bestSource = loc.id;
            }
          }
        }
        if (bestSource) setSourceLocation(bestSource);
      });
    }
  }, [destLocation, locations]);

  const fetchOrders = async () => {
    try {
      const ords = await getOrders();
      setQueue(ords.queue);
      setStatuses(ords.statuses);
      
      const route = await getActiveRoute();
      if (route) setCurrentRoute(route);
    } catch (e) { console.error('Failed to fetch orders', e); }
  };

  useEffect(() => {
    fetchOrders();
    getLocations().then(setLocations);
    getEdges().then(setEdges);
    const int = setInterval(fetchOrders, 3000);
    return () => clearInterval(int);
  }, []);
  
  const getLocName = (id: string) => locations.find(l => l.id === id)?.name || id;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceLocation || !destLocation) return;
    
    try {
      if(sourceLocation && destLocation && sourceLocation !== destLocation) {
        await addOrder({ source: sourceLocation, destination: destLocation, urgency, deadlineHrs });
        const prodName = products.find(p => p.id === selectedProduct)?.name || 'Custom Item';
        logActivity(`Created route for ${prodName} from ${getLocName(sourceLocation)} to ${getLocName(destLocation)}`);
        fetchOrders();
        setSourceLocation('');
        setDestLocation('');
        setSelectedProduct('');
        setUrgency('Medium');
        setDeadlineHrs(24);
      } else {
        alert("Please select valid distinct source and destination nodes");
      }
    } catch (err) {
      console.error(err);
      alert("Failed creating order. Is backend node running?");
    }
  };

  const handleDispatchNext = async () => {
    try {
      const res = await processOrder();
      setCurrentRoute(res.route);
      fetchOrders();
      logActivity(`Dispatched order ${res.order?.id || ''} via Dijkstra core engine`);
    } catch (e) {
      alert("Dispatch error. Please retry or verify pending orders.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[800px] animate-fade-in">
      
      {/* LEFT: Workflows */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
        
        {/* Create Order Card (Customer) */}
        {(!role || role === 'customer') && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PackagePlus /> Place Delivery Order
          </h2>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="text-sm text-slate-500 block mb-1">Product</label>
              <select className="w-full bg-slate-50 border border-gray-700 text-slate-900 p-2.5 rounded-lg" required value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={`prod-${p.id}`} value={p.id}>{p.name} (In stock: {p.quantity})</option>
                ))}
              </select>
            </div>
            {/* Auto-selected Source Node display */}
            {destLocation && sourceLocation && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between shadow-sm">
                <span className="text-sm text-blue-800 font-medium">Auto-Selected Source Hub:</span>
                <span className="text-sm font-bold text-blue-900 bg-white px-3 py-1 rounded shadow-sm border border-blue-100">{getLocName(sourceLocation)}</span>
              </div>
            )}
            
            <div>
              <label className="text-sm text-slate-500 block mb-1">Destination Node (Warehouse / City)</label>
              <select className="w-full bg-slate-50 border border-gray-700 text-slate-900 p-2.5 rounded-lg" required value={destLocation} onChange={e => setDestLocation(e.target.value)}>
                <option value="">-- Choose Dropoff --</option>
                {locations.map(loc => (
                  <option key={`dst-${loc.id}`} value={loc.id} disabled={sourceLocation === loc.id}>
                    {loc.name} {sourceLocation === loc.id ? '(Source)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500 block mb-1">Urgency</label>
                <select className="w-full bg-slate-50 border border-gray-700 text-slate-900 p-2.5 rounded-lg" value={urgency} onChange={e => setUrgency(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-500 block mb-1">Deadline (Hrs)</label>
                <input type="number" className="w-full bg-slate-50 border border-gray-700 text-slate-900 p-2.5 rounded-lg" min="1" max="168" value={deadlineHrs} onChange={e => setDeadlineHrs(parseInt(e.target.value))} />
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition">Create Route Request</button>
          </form>
        </div>
        )}

        {/* Queue Viewer (Manager) */}
        {role === 'manager' && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl flex-1 flex flex-col min-h-[300px]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Pending Urgent Queue</span>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">{queue.length} items</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {queue.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic">No orders pending.</p>
            ) : (
              queue.map(order => (
                <div key={order.id} title={`Order ID: ${order.id}\nUrgency: ${order.urgency}\nDistance: ${order.distance} km\nDue: ${new Date(order.deadline).toLocaleString()}`} className="bg-slate-50 p-4 rounded-lg border border-gray-700/50 flex justify-between items-center hover:shadow-md hover:border-blue-300 transition-all cursor-help">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={order.urgency === 'Critical' ? 'text-red-500' : 'text-orange-400'} />
                      <span className="text-slate-900 font-medium tracking-tight">Order #{order.id}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        order.urgency === 'Critical' ? 'bg-red-500/20 text-red-600' :
                        order.urgency === 'High' ? 'bg-orange-500/20 text-orange-600' :
                        order.urgency === 'Medium' ? 'bg-blue-500/20 text-blue-600' :
                        'bg-slate-200 text-slate-600'
                      }`}>{order.urgency}</span>
                    </div>
                    <div className="text-xs text-slate-500 space-x-2">
                       <span>Dist: <strong>{order.distance} km</strong></span>
                       <span>•</span>
                       <span>Due: <strong>{new Date(order.deadline).toLocaleString([], {hour: '2-digit', minute:'2-digit', day: 'numeric', month:'short'})}</strong></span>
                    </div>
                    <div className="text-sm font-medium text-slate-800 mt-1">
                      {getLocName(order.source)} <span className="text-slate-400 mx-1">→</span> {getLocName(order.destination)}
                    </div>
                  </div>
                  <span className="text-xs bg-orange-500/20 text-orange-600 font-bold px-2 py-1 rounded shadow-sm">{statuses[order.id] || order.status}</span>
                </div>
              ))
            )}
          </div>
          
          <button title="Executes Dijkstra's algorithm to calculate the optimal path and dispatches the highest priority order from the Min-Heap queue" onClick={handleDispatchNext} disabled={queue.length === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/20">
            <Navigation size={18} /> Dispatch Next (Dijkstra Core)
          </button>
        </div>
        )}
      </div>

      {/* RIGHT: Active Tracking Map */}
      <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg flex flex-col relative min-h-[600px]">
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur border border-gray-700 p-3 rounded-lg shadow-xl shrink-0">
          <h3 className="text-slate-900 font-semibold flex items-center gap-2">Live Tracking</h3>
          <p className="text-xs text-slate-500 mt-1">Shortest Path Routing Active</p>
        </div>
        <div className="flex-1 w-full h-full absolute inset-0 pt-20">
          <MapUI locations={locations} edges={edges} currentRoute={currentRoute || previewRoute} />
        </div>
      </div>
    </div>
  );
}

const PackagePlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 16h6"/><path d="M19 13v6"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
);
