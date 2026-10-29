import { useLogistics } from '../../contexts/LogisticsContext';
import { User, Activity, Settings, Lock } from 'lucide-react';

export default function ProfileView() {
  const { activityLogs, logout, login, role } = useLogistics();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 animate-slide-up stagger-1">
        User Profile & Settings
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6 animate-slide-up stagger-2">
          <div className="glass-panel p-8 rounded-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 transform scale-150">
              <User size={100} />
            </div>
            <div className="w-28 h-28 mx-auto bg-gradient-to-tr from-blue-100 to-blue-50 border-4 border-blue-500 rounded-full flex items-center justify-center mb-5 shadow-lg relative z-10 hover-lift">
              <User size={48} className="text-blue-600 drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active User</h2>
            <p className="text-blue-600 text-sm font-bold mt-1 uppercase tracking-wider">{role === 'manager' ? 'Warehouse Manager' : 'Customer'}</p>
            <p className="text-slate-500 text-sm mt-3 font-medium bg-slate-50 py-1.5 px-3 rounded-lg inline-block border border-slate-100">
              {role === 'manager' ? 'manager@logistics.pro' : 'user@logistics.pro'}
            </p>
            <div className="mt-8 space-y-3">
              <button onClick={() => login(role === 'manager' ? 'customer' : 'manager')} className="w-full px-5 py-3 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl transition-all duration-300 font-bold hover-lift shadow-sm">
                Switch to {role === 'manager' ? 'Customer' : 'Manager'} Profile
              </button>
              <button onClick={logout} className="w-full px-5 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all duration-300 font-bold hover-lift shadow-sm">
                Logout
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Settings size={20} className="text-blue-500" /> Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/50 shadow-sm hover-lift">
                <span className="text-slate-700 text-sm font-semibold">2FA Security</span>
                <div className="text-emerald-600 flex items-center gap-1.5 text-sm font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <Lock size={14}/> Enabled
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Logs) */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl h-[600px] flex flex-col animate-slide-up stagger-3">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/50">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" /> Activity Audit Log
            </h3>
            <span className="text-xs bg-blue-50 border border-blue-100 py-1.5 px-3 rounded-full text-blue-700 font-bold shadow-sm">
              {activityLogs.length} events recorded
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
            {activityLogs.length === 0 ? (
              <p className="text-slate-400 font-medium italic text-center mt-10 bg-slate-50 p-6 rounded-xl border border-slate-100">
                No recent activity detected.
              </p>
            ) : (
              activityLogs.map((log, idx) => (
                <div key={log.id} className="relative pl-7 py-1 group" style={{ animationDelay: `${idx * 50}ms` }}>
                  {/* Timeline indicator */}
                  <div className="absolute left-0 top-3 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-50 group-hover:scale-125 transition-transform duration-300"></div>
                  <div className="absolute left-1.5 top-6 bottom-[-20px] w-px bg-slate-200 group-last:hidden"></div>
                  
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-sm hover-lift hover-glow">
                    <p className="text-slate-800 text-sm font-bold leading-snug">{log.action}</p>
                    <p className="text-slate-400 text-xs mt-2 font-medium bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
