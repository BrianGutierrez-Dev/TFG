import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, Users, FileText,
  AlertTriangle, Car, Wrench, Hammer, UserCog,
  LogOut, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api/clients';
import clsx from 'clsx';

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        )
      }
    >
      <Icon size={15} />
      {label}
    </NavLink>
  );
}

function Dropdown({ label, icon: Icon, items }: {
  label: string;
  icon: React.ElementType;
  items: { to: string; label: string; icon: React.ElementType }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <Icon size={15} />
        {label}
        <ChevronDown size={13} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-50">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                  isActive ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { employee, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  const blacklistedCount = (clients ?? []).filter((c) => c.isBlacklisted).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-6 gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
          <ShieldAlert size={15} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm tracking-wide">BlackList</span>
      </Link>

      {/* Nav items */}
      <nav className="flex items-center gap-0.5 flex-1">
        <NavItem to="/" label="Panel" icon={LayoutDashboard} />

        {/* Lista Negra — destacada */}
        <NavLink
          to="/blacklist"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            )
          }
        >
          <ShieldAlert size={15} />
          Lista Negra
          {blacklistedCount > 0 && (
            <span className="bg-white text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
              {blacklistedCount}
            </span>
          )}
        </NavLink>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <NavItem to="/clients" label="Clientes" icon={Users} />
        <NavItem to="/rentals" label="Contratos" icon={FileText} />
        <NavItem to="/incidents" label="Incidencias" icon={AlertTriangle} />
        <NavItem to="/cars" label="Vehículos" icon={Car} />

        <Dropdown
          label="Taller"
          icon={Wrench}
          items={[
            { to: '/maintenances', label: 'Mantenimiento', icon: Wrench },
            { to: '/repairs', label: 'Reparaciones', icon: Hammer },
          ]}
        />

        {isAdmin && (
          <Dropdown
            label="Admin"
            icon={UserCog}
            items={[
              { to: '/employees', label: 'Empleados', icon: UserCog },
            ]}
          />
        )}
      </nav>

      {/* User menu */}
      <div className="relative flex-shrink-0" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
            {employee?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{employee?.name?.split(' ')[0]}</span>
          <ChevronDown size={13} className={clsx('text-gray-400 transition-transform', userMenuOpen && 'rotate-180')} />
        </button>

        {userMenuOpen && (
          <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 z-50">
            <div className="px-4 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs font-medium text-gray-900">{employee?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{employee?.role?.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
