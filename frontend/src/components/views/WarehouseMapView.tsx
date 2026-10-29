import { useState, useEffect } from 'react';
import { Warehouse as WarehouseIcon, MapPin, Layers } from 'lucide-react';
import MapUI from '../MapUI';
import { getWarehouses, type Warehouse } from '../../api';

export default function WarehouseMapView() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    getWarehouses().then(data => setWarehouses(data)).catch(() => {});
  }, []);

  const totalCap = warehouses.reduce((acc: number, w: Warehouse) => acc + (w.total_capacity_sqft || 0), 0);
  const usedCap = warehouses.reduce((acc: number, w: Warehouse) => acc + (w.used_capacity_sqft || 0), 0);
  const avgUtilization = totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 0;

  const availableCount = warehouses.filter((w: Warehouse) => w.status === 'available').length;
  const nearFullCount = warehouses.filter((w: Warehouse) => w.status === 'near_full').length;
  const fullCount = warehouses.filter((w: Warehouse) => w.status === 'full').length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-blue-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <WarehouseIcon size={18} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Pan-India Network</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Indian Warehouse & Hubs Map</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live interactive Leaflet map rendered strictly via OpenStreetMap tiles. Real-time status clustering, live capacity filters, and instant inventory inspection.
          </p>
        </div>

        {/* Capacity Legend Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            Available: {availableCount}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
            Near Full: {nearFullCount}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400"></span>
            Full: {fullCount}
          </div>
        </div>
      </div>

      {/* Main Responsive Map with fixed height */}
      <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200">
        <MapUI 
          heightClass="h-[640px]" 
          onWarehouseSelect={(w) => setSelectedWarehouse(w)} 
        />
      </div>

      {/* Warehouse Quick Cards Grid below Map */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            <span>All 14 Operational Facilities</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Average Network Space Utilisation: <span className="text-blue-600 font-extrabold">{avgUtilization}%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouses.map((w: Warehouse) => {
            const isFull = w.status === 'full' || w.utilization >= 90;
            const isNearFull = w.status === 'near_full' || (w.utilization >= 70 && !isFull);
            const statusColor = isFull ? 'text-rose-600 bg-rose-50 border-rose-200' :
                                isNearFull ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                'text-emerald-600 bg-emerald-50 border-emerald-200';

            return (
              <div 
                key={w.id}
                onClick={() => setSelectedWarehouse(w)}
                className={`p-4 rounded-xl bg-white border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                  selectedWarehouse?.id === w.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-black tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {w.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor}`}>
                    {w.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">{w.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> {w.city}, {w.state}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Capacity: {w.utilization}%</span>
                    <span>{Math.round(w.used_capacity_sqft / 1000)}k / {Math.round(w.total_capacity_sqft / 1000)}k sqft</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${w.utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
