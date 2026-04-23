import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Car, FileText, RotateCcw,
  AlertTriangle, Wrench, Hammer, UserCog, LogOut, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api/clients';
import clsx from 'clsx';

function NavItem({ to, icon: Icon, label, badge }: { to: string; icon: React.ElementType; label: string; badge?: number }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-gray-700 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        )
      }
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-white text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">
      {label}
    </p>
  );
}

export default function Sidebar() {
  const { employee, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  const blacklistedCount = (clients ?? []).filter((c) => c.isBlacklisted).length;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
          <ShieldAlert size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-wide">BlackList</p>
          <p className="text-slate-500 text-xs">Gestión de taller</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <NavItem to="/" icon={LayoutDashboard} label="Panel" />

        {/* Lista negra — entrada destacada */}
        <div className="pt-1">
          <NavLink
            to="/blacklist"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              )
            }
          >
            <ShieldAlert size={18} />
            <span className="flex-1">Lista Negra</span>
            {blacklistedCount > 0 && (
              <span className="bg-gray-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                {blacklistedCount}
              </span>
            )}
          </NavLink>
        </div>

        <SectionLabel label="Clientes & Contratos" />
        <NavItem to="/clients" icon={Users} label="Clientes" />
        <NavItem to="/rentals" icon={FileText} label="Contratos" />
        <NavItem to="/car-returns/new" icon={RotateCcw} label="Devolución" />

        <SectionLabel label="Seguimiento" />
        <NavItem to="/incidents" icon={AlertTriangle} label="Incidencias" />
        <NavItem to="/cars" icon={Car} label="Vehículos" />

        <SectionLabel label="Taller" />
        <NavItem to="/maintenances" icon={Wrench} label="Mantenimiento" />
        <NavItem to="/repairs" icon={Hammer} label="Reparaciones" />

        {isAdmin && (
          <>
            <SectionLabel label="Administración" />
            <NavItem to="/employees" icon={UserCog} label="Empleados" />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold">
            {employee?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{employee?.name}</p>
            <p className="text-slate-400 text-xs capitalize">{employee?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-sm transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
