import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, FileText, AlertTriangle, Car, ArrowRight, Clock, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clientsApi } from '../api/clients';
import { rentalsApi } from '../api/rentals';
import { incidentsApi } from '../api/incidents';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { ContractBadge, SeverityBadge, IncidentTypeBadge } from '../components/ui/Badge';
import type { RentalContract } from '../types';

export default function Dashboard() {
  const { employee } = useAuth();

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  const { data: rentals, isPending: rentalsLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: () => rentalsApi.getAll().then((r) => r.data),
  });

  const { data: incidents, isPending: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsApi.getAll().then((r) => r.data),
  });

  const blacklistedClients = (clients ?? []).filter((c) => c.isBlacklisted);
  const activeRentals = (rentals ?? []).filter((r) => r.status === 'ACTIVE');
  const overdueRentals = (rentals ?? []).filter((r) => r.status === 'OVERDUE');
  const openIncidents = (incidents ?? []).filter((i) => !i.resolved);
  const criticalIncidents = openIncidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH');

  const urgentRentals = [...overdueRentals, ...activeRentals].slice(0, 6) as RentalContract[];
  const recentIncidents = openIncidents.slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {employee?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Alert summary strip */}
        <div className="flex items-center gap-3">
          {blacklistedClients.length > 0 && (
            <Link to="/blacklist" className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
              <ShieldAlert size={15} />
              {blacklistedClients.length} en lista negra
            </Link>
          )}
          {overdueRentals.length > 0 && (
            <Link to="/rentals" className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
              <Clock size={15} />
              {overdueRentals.length} vencido{overdueRentals.length !== 1 ? 's' : ''}
            </Link>
          )}
          {criticalIncidents.length > 0 && (
            <Link to="/incidents" className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors">
              <AlertTriangle size={15} />
              {criticalIncidents.length} incidencia{criticalIncidents.length !== 1 ? 's' : ''} crítica{criticalIncidents.length !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Stat cards */}
        <div className="col-span-3 grid grid-cols-4 gap-4">
          <StatCard
            value={blacklistedClients.length}
            label="Lista negra"
            icon={ShieldAlert}
            dark
            to="/blacklist"
          />
          <StatCard
            value={activeRentals.length}
            label="Contratos activos"
            icon={FileText}
            to="/rentals"
          />
          <StatCard
            value={overdueRentals.length}
            label="Contratos vencidos"
            icon={Clock}
            alert={overdueRentals.length > 0}
            to="/rentals"
          />
          <StatCard
            value={openIncidents.length}
            label="Incidencias abiertas"
            icon={AlertTriangle}
            alert={openIncidents.length > 0}
            to="/incidents"
          />
        </div>

        {/* Contratos urgentes */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Car size={16} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Contratos en curso</h2>
            </div>
            <Link to="/rentals" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {rentalsLoading ? (
            <div className="p-6"><Spinner /></div>
          ) : urgentRentals.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-400">Sin contratos activos</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {urgentRentals.map((r) => (
                <div key={r.id} className={`flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors ${r.status === 'OVERDUE' ? 'bg-gray-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.client.name}</p>
                      {r.client.isBlacklisted && (
                        <ShieldAlert size={12} className="text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {r.car.brand} {r.car.model} · {r.car.licensePlate}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{new Date(r.endDate).toLocaleDateString('es-ES')}</p>
                  </div>
                  <ContractBadge status={r.status} />
                  <Link to={`/rentals/${r.id}`} className="text-gray-400 hover:text-gray-900 flex-shrink-0">
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incidencias abiertas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Incidencias abiertas</h2>
            </div>
            <Link to="/incidents" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>

          {incidentsLoading ? (
            <div className="p-6"><Spinner /></div>
          ) : recentIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                <AlertTriangle size={18} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">Sin incidencias abiertas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentIncidents.map((i) => (
                <div key={i.id} className="px-6 py-3.5">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <IncidentTypeBadge type={i.type} />
                    <SeverityBadge severity={i.severity} />
                  </div>
                  <p className="text-xs text-gray-700 truncate">{i.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{i.client?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acceso rápido */}
        <div className="col-span-3 grid grid-cols-4 gap-3">
          {[
            { label: 'Nuevo cliente', to: '/clients/new', icon: Wrench },
            { label: 'Nuevo contrato', to: '/rentals/new', icon: FileText },
            { label: 'Registrar devolución', to: '/car-returns/new', icon: Car },
            { label: 'Nueva incidencia', to: '/incidents/new', icon: AlertTriangle },
          ].map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Icon size={15} className="text-gray-500" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value, label, icon: Icon, dark, alert, to,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  dark?: boolean;
  alert?: boolean;
  to: string;
}) {
  const base = dark
    ? 'bg-gray-900 text-white border-gray-800'
    : alert && value > 0
    ? 'bg-gray-800 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  return (
    <Link to={to} className={`rounded-xl border shadow-sm p-5 flex items-center justify-between hover:opacity-90 transition-opacity ${base}`}>
      <div>
        <p className={`text-3xl font-bold`}>{value}</p>
        <p className={`text-xs mt-1 ${dark || (alert && value > 0) ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      </div>
      <Icon size={22} className={dark || (alert && value > 0) ? 'text-gray-500' : 'text-gray-300'} />
    </Link>
  );
}
