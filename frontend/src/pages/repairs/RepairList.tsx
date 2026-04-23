import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Hammer, Plus, Trash2, Edit2 } from 'lucide-react';
import { repairsApi } from '../../api/repairs';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { RepairBadge } from '../../components/ui/Badge';
import type { RepairStatus } from '../../types';

export default function RepairList() {
  const [statusFilter, setStatusFilter] = useState<RepairStatus | ''>('');
  const qc = useQueryClient();

  const { data: repairs, isPending } = useQuery({
    queryKey: ['repairs', statusFilter],
    queryFn: () =>
      repairsApi.getAll(statusFilter ? { status: statusFilter } : undefined).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: repairsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['repairs'] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: RepairStatus }) =>
      repairsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['repairs'] }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Reparaciones"
        subtitle={`${repairs?.length ?? 0} reparaciones`}
        action={
          <Link to="/repairs/new">
            <Button><Plus size={16} />Nueva reparación</Button>
          </Link>
        }
      />

      <div className="flex gap-2 mb-6">
        {(['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'Todas' : s === 'PENDING' ? 'Pendientes' : s === 'IN_PROGRESS' ? 'En proceso' : s === 'COMPLETED' ? 'Completadas' : 'Canceladas'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {isPending ? (
          <Spinner />
        ) : !repairs?.length ? (
          <EmptyState icon={Hammer} title="Sin reparaciones" description="Registra la primera reparación." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehículo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Inicio</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Coste</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/cars/${r.car.id}`} className="font-medium text-gray-700 hover:underline">
                        {r.car.brand} {r.car.model}
                      </Link>
                      <p className="text-xs text-gray-400 font-mono">{r.car.licensePlate}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900 max-w-xs">{r.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RepairBadge status={r.status} />
                        {r.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: r.id, status: 'IN_PROGRESS' })}
                            className="text-xs text-gray-500 hover:text-gray-900"
                          >
                            Iniciar
                          </button>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: r.id, status: 'COMPLETED' })}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Completar
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.startDate ? new Date(r.startDate).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.cost != null ? `${r.cost.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/repairs/${r.id}/edit`}>
                          <Button variant="ghost" size="sm"><Edit2 size={14} /></Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => confirm('¿Eliminar?') && deleteMutation.mutate(r.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
