import { NavLink } from 'react-router-dom';
import { Package, LayoutDashboard, Truck, User, LogOut } from 'lucide-react';
import { useLogistics } from '../../contexts/LogisticsContext';

export default function Sidebar() {
  const { logout, role } = useLogistics();

  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['customer', 'manager'] },
    { name: 'Live Tracking & Orders', path: '/orders', icon: <Package size={20} />, roles: ['customer'] },
    { name: 'Inventory & Stock', path: '/inventory', icon: <Package size={20} />, roles: ['manager'] },
    { name: 'Live Tracking & Dispatch', path: '/orders', icon: <Truck size={20} />, roles: ['manager'] },
    { name: 'Profile', path: '/profile', icon: <User size={20} />, roles: ['customer', 'manager'] },
  ];

  const links = allLinks.filter(l => l.roles.includes(role || 'customer'));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6 border-b border-slate-200 flex items-center gap-3">
        <Truck className="text-blue-500 w-8 h-8" />
        <span className="font-bold text-xl tracking-wide text-slate-900">Logistics</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button 
          onClick={logout}
          className="flex flex-row items-center gap-3 px-4 py-3 w-full text-left text-slate-500 hover:text-red-400 hover:bg-slate-100 transition-all rounded-lg"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
