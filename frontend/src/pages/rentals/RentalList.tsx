import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Eye, RotateCcw } from 'lucide-react';
import { rentalsApi } from '../../api/rentals';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { ContractBadge } from '../../components/ui/Badge';
import type { ContractStatus } from '../../types';

const FILTERS: { value: ContractStatus | ''; label: string }[] = [
  { value: '',           label: 'Todos' },
  { value: 'ACTIVE',    label: 'Activos' },
  { value: 'OVERDUE',   label: 'Vencidos' },
  { value: 'COMPLETED', label: 'Completados' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

export default function RentalList() {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');

  const { data: rentals, isPending } = useQuery({
    queryKey: ['rentals', statusFilter],
    queryFn: () =>
      rentalsApi.getAll(statusFilter ? { status: statusFilter } : undefined).then((r) => r.data),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Contratos"
        subtitle={`${rentals?.length ?? 0} contratos`}
        action={
          <Link to="/rentals/new">
            <Button><Plus size={15} />Nuevo contrato</Button>
          </Link>
        }
      />

      <div className="flex gap-1.5 mb-6">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`filter-tab ${statusFilter === value ? 'filter-tab-active' : 'filter-tab-inactive'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isPending ? (
          <Spinner />
        ) : !rentals?.length ? (
          <EmptyState icon={FileText} title="Sin contratos" description="Crea el primer contrato de alquiler." />
        ) : (
          <table className="data-table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vehículo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Inicio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fin</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Precio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3.5 text-gray-400 text-xs font-mono">#{r.id}</td>
                  <td className="px-6 py-3.5 font-medium text-gray-900">{r.client.name}</td>
                  <td className="px-6 py-3.5 text-gray-500">{r.car.brand} {r.car.model} · <span className="font-mono text-xs">{r.car.licensePlate}</span></td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">{new Date(r.startDate).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">{new Date(r.endDate).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">{r.totalPrice.toFixed(2)} €</td>
                  <td className="px-6 py-3.5"><ContractBadge status={r.status} /></td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/rentals/${r.id}`}>
                        <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                      </Link>
                      {(r.status === 'ACTIVE' || r.status === 'OVERDUE') && !r.carReturn && (
                        <Link to={`/car-returns/new?contractId=${r.id}`}>
                          <Button variant="success" size="sm">
                            <RotateCcw size={13} />
                            Finalizar
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
