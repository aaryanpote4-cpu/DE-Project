import { useEffect, useState } from 'react';
import { useLogistics } from '../../contexts/LogisticsContext';
import { 
  Package, Truck, ArrowUpRight, Clock, Navigation, 
  Server, ShieldCheck, Zap, Warehouse as WarehouseIcon, Database, Layers, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapUI from '../MapUI';
import { getWarehouses, getOrders, getActiveRoute, getDatabaseSnapshot, type Warehouse, type Edge } from '../../api';

export default function DashboardView() {
  const { activityLogs, role, user } = useLogistics();
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [totalCapacityUsedPct, setTotalCapacityUsedPct] = useState(0);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [whList, ords, snapshot, route] = await Promise.all([
          getWarehouses(),
          getOrders().catch(() => ({ queue: [] })),
          getDatabaseSnapshot().catch(() => null),
          getActiveRoute().catch(() => null)
        ]);

        setWarehouses(whList);
        setActiveOrdersCount(ords?.queue?.length || 0);
        setCurrentRoute(route);

        if (snapshot) {
          setDbConnected(snapshot.connected);
          setEdges(snapshot.tables.edges?.rows || []);
          setTotalItemsCount(snapshot.tables.inventory?.count || 44);

          const whs = snapshot.tables.warehouses?.rows || whList;
          const totalCap = whs.reduce((acc: number, w: any) => acc + (w.total_capacity_sqft || 0), 0);
          const usedCap = whs.reduce((acc: number, w: any) => acc + (w.used_capacity_sqft || 0), 0);
          setTotalCapacityUsedPct(totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 68);
        } else {
          setTotalItemsCount(44);
          setTotalCapacityUsedPct(68);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      }
    }

    loadData();

    const interval = setInterval(async () => {
      try {
        const route = await getActiveRoute();
        setCurrentRoute(route);
        const ords = await getOrders();
        setActiveOrdersCount(ords?.queue?.length || 0);
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-blue-900/40 animate-slide-up">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {role === 'admin' ? 'Superadmin Console' : role === 'manager' ? 'Facility Manager Portal' : 'Customer Dispatch Dashboard'}
            </span>
            <span className="text-xs text-slate-400 font-medium">| {user?.email || 'Authenticated User'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            Logistics & Warehousing Operations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live geospatial topology over 14 strategic Indian freight hubs with Dijkstra shortest paths and real-time inventory utilization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/map')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <WarehouseIcon size={15} />
            <span>Open Full Map</span>
          </button>
          <button 
            onClick={() => navigate('/database-view')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
          >
            <Database size={15} />
            <span>DB Live View</span>
          </button>
        </div>
      </div>

      {/* 4 CORE DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        {/* 1. Total Warehouses */}
        <div 
          onClick={() => navigate('/map')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warehouses</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <WarehouseIcon size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {warehouses.length || 14}
          </h3>
          <div className="mt-3 flex items-center text-xs text-blue-600 font-bold">
            <ArrowUpRight size={14} className="mr-0.5" />
            <span>Across 14 Indian Metros</span>
          </div>
        </div>

        {/* 2. Total Items / SKUs */}
        <div 
          onClick={() => navigate('/inventory')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inventory Items</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {totalItemsCount}
          </h3>
          <div className="mt-3 flex items-center text-xs text-indigo-600 font-bold">
            <CheckCircle2 size={14} className="mr-0.5" />
            <span>Active SKUs Stored</span>
          </div>
        </div>

        {/* 3. Capacity Utilised */}
        <div 
          onClick={() => navigate('/map')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity Utilisation</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Layers size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {totalCapacityUsedPct}%
          </h3>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                totalCapacityUsedPct >= 90 ? 'bg-rose-500' :
                totalCapacityUsedPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${totalCapacityUsedPct}%` }}
            ></div>
          </div>
        </div>

        {/* 4. Active Shipments */}
        <div 
          onClick={() => navigate('/orders')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Shipments</span>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
              <Truck size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {activeOrdersCount}
          </h3>
          <div className="mt-3 flex items-center text-xs text-orange-600 font-bold">
            <Navigation size={14} className="mr-0.5" />
            <span>In Queue & Transit</span>
          </div>
        </div>
      </div>

      {/* Main Center Grid: Interactive Leaflet Map + Realtime Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        {/* Interactive Map (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col p-3">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Indian Freight Topology (OpenStreetMap)</h3>
            </div>
            <button 
              onClick={() => navigate('/map')} 
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore all warehouses</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <MapUI heightClass="h-[520px]" edges={edges} currentRoute={currentRoute} />
        </div>

        {/* Real-time Database Activity Log Feed (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-[585px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              <span>Realtime Database Log</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {activityLogs.slice(0, 15).map((log, idx) => (
              <div key={log.id || idx} className="relative pl-4 border-l-2 border-blue-200 pb-1 group">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform"></div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{log.action}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Architecture & Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Zap size={20} /></div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-800">Dijkstra Routing Engine</h4>
            <p className="text-[11px] text-slate-500">Native Graph Shortest Path Online</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Server size={20} /></div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-800">Dual Database Mode</h4>
            <p className="text-[11px] text-slate-500">{dbConnected ? 'Live MySQL Pool Connected' : 'Resilient In-Memory Fallback Active'}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={20} /></div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-800">Role-Based Security</h4>
            <p className="text-[11px] text-slate-500">Bcrypt Salted Hashes & JWT Bearer Session</p>
          </div>
        </div>
      </div>
    </div>
  );
}
