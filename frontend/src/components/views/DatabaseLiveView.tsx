import { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Table, Server, Layers, 
  Search, ShieldCheck, ArrowUpDown
} from 'lucide-react';
import { getDatabaseSnapshot, type DatabaseSnapshot } from '../../api';

export default function DatabaseLiveView() {
  const [snapshot, setSnapshot] = useState<DatabaseSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTable, setActiveTable] = useState<'warehouses' | 'inventory' | 'orders' | 'edges' | 'users'>('warehouses');
  const [search, setSearch] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchSnapshot = () => {
    setLoading(true);
    getDatabaseSnapshot()
      .then(data => {
        setSnapshot(data);
        setLastRefreshed(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load database snapshot:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const currentRows = snapshot?.tables?.[activeTable]?.rows || [];

  const filteredRows = currentRows.filter(row => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(row).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Presentation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-blue-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Database size={18} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Presentation Console</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Database Architecture Live Inspector</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live relational tables (`warehouses`, `inventory`, `orders`, `edges`, `users`). Showing real-time database state and changes.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-400">Last Synced</div>
            <div className="text-xs font-bold text-white font-mono">{lastRefreshed || 'Connecting...'}</div>
          </div>
          <button 
            onClick={fetchSnapshot}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Tables</span>
          </button>
        </div>
      </div>

      {/* Engine Status & Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Server size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engine State</div>
            <div className="text-xs font-black text-slate-900 mt-0.5 truncate max-w-[130px]">
              {snapshot?.connected ? 'MySQL Live Pool' : 'In-Memory Resilient DB'}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Warehouses</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {snapshot?.tables?.warehouses?.count || 0} Nodes Verified
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stored SKUs</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {snapshot?.tables?.inventory?.count || 0} Products
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <ArrowUpDown size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transit Routes</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {snapshot?.tables?.edges?.count || 0} Edges (Dijkstra)
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Inspector Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Selector Tabs & Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['warehouses', 'inventory', 'orders', 'edges', 'users'] as const).map(tableName => {
              const count = snapshot?.tables?.[tableName]?.count || 0;
              const isActive = activeTable === tableName;
              return (
                <button
                  key={tableName}
                  onClick={() => { setActiveTable(tableName); setSearch(''); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Table size={14} />
                  <span>{tableName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filter ${activeTable}...`}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Live Table Content */}
        <div className="overflow-x-auto min-h-[380px]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-500">Querying database table...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-sm font-semibold">No records match your query.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  {Object.keys(filteredRows[0]).map(key => (
                    <th key={key} className="px-4 py-3">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    {Object.entries(row).map(([key, val]: [string, any], cellIdx) => {
                      // Formatting badges for key fields
                      let content = String(val ?? '-');
                      let badgeClass = '';

                      if (key === 'status') {
                        if (val === 'available' || val === 'In Stock' || val === 'Delivered') {
                          badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                        } else if (val === 'near_full' || val === 'Low Stock' || val === 'In-Transit') {
                          badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
                        } else if (val === 'full' || val === 'Out of Stock') {
                          badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
                        }
                      }

                      if (key === 'role') {
                        badgeClass = val === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                                     val === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700';
                      }

                      return (
                        <td key={cellIdx} className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                          {badgeClass ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                              {content}
                            </span>
                          ) : (
                            content
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing {filteredRows.length} of {currentRows.length} rows in <code>{activeTable}</code></span>
          <span className="text-[11px] text-slate-400">Schema defined in <code>database/schema.sql</code></span>
        </div>
      </div>
    </div>
  );
}
