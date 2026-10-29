import { Truck, LogOut, Package, LayoutDashboard, User, Database, Map } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLogistics } from '../../contexts/LogisticsContext';

interface TopbarProps {
  onOpenDispatch: () => void;
}

export default function Topbar({ onOpenDispatch }: TopbarProps) {
  const { logout, role, user } = useLogistics();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={17} /> },
    { name: 'Warehouses & Map', path: '/map', icon: <Map size={17} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={17} /> },
    { name: 'Shipments', path: '/orders', icon: <Truck size={17} /> },
    { name: 'Database Live View', path: '/database-view', icon: <Database size={17} /> },
    { name: 'Profile', path: '/profile', icon: <User size={17} /> },
  ];

  return (
    <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 z-[2000] shadow-sm">
      <div className="flex items-center gap-3 shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-blue-600 font-black text-xl tracking-tight cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Truck size={20} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 font-extrabold hidden sm:inline">
            LogisticsPro
          </span>
        </NavLink>

        {/* Role Badge */}
        <span className="hidden md:inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {role || 'demo'}
        </span>
      </div>

      <nav className="hidden lg:flex items-center gap-1 mx-2">
        {links.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        {(role === 'manager' || role === 'admin') && (
          <button 
            onClick={onOpenDispatch}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95"
          >
            <Truck size={14} />
            <span>New Dispatch</span>
          </button>
        )}

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-slate-800 leading-none">{user?.full_name || user?.username || 'Operator'}</span>
          <span className="text-[10px] text-slate-400 capitalize">{role || 'Customer'}</span>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all text-xs font-bold border border-transparent hover:border-rose-100"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
