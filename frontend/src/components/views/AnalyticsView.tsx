import { useLogistics } from '../../contexts/LogisticsContext';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function AnalyticsView() {
  const { products, drivers } = useLogistics();

  const totalCapacity = 500;
  const currentInventory = products.reduce((acc, p) => acc + p.quantity, 0);
  const capacityPercent = Math.min((currentInventory / totalCapacity) * 100, 100);

  const activeDrivers = drivers.filter(d => d.status === 'On Route').length;
  const driverPercent = drivers.length > 0 ? (activeDrivers / drivers.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500 mt-1">Platform performance and network metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Warehouse Capacity</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{capacityPercent.toFixed(1)}%</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${capacityPercent}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">{currentInventory} items of {totalCapacity} max capacity</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Fleet Utilized</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{driverPercent.toFixed(1)}%</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Activity size={20} /></div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${driverPercent}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">{activeDrivers} out of {drivers.length} drivers on route</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Routing Efficiency</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">94.2%</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><BarChart3 size={20} /></div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '94.2%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Dijkstra core path optimization success rate</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-6">
         <h2 className="text-lg font-bold text-slate-900 mb-6">Delivery Volume (Past 7 Days)</h2>
         <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-8 border-b border-slate-200 pb-2">
            {[45, 62, 38, 85, 59, 72, 91].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                <div 
                  className="w-full max-w-[40px] bg-blue-100 hover:bg-blue-500 rounded-t-md transition-all duration-300 relative group"
                  style={{ height: `${val}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg transition-opacity">
                    {val}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-2 font-medium">Day {i+1}</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
