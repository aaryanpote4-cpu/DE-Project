import { useLogistics } from '../../contexts/LogisticsContext';
import { Search, History } from 'lucide-react';
import { useState } from 'react';

export default function LogsView() {
  const { activityLogs } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = activityLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
          <p className="text-slate-500 mt-1">Review system actions and events</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>No activity logs found matching your search.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <li key={log.id} className="p-4 hover:bg-slate-50/50 transition">
                <div className="flex justify-between md:items-center flex-col md:flex-row gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{log.action}</span>
                    <span className="text-xs text-slate-400 font-mono mt-1">Event ID: {log.id}</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-max">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
