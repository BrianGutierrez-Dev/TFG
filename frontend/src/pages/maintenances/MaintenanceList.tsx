import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { maintenancesApi } from '../../api/maintenances';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function MaintenanceList() {
  const qc = useQueryClient();

  const { data: maintenances, isPending } = useQuery({
    queryKey: ['maintenances'],
    queryFn: () => maintenancesApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: maintenancesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenances'] }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Mantenimiento"
        subtitle={`${maintenances?.length ?? 0} registros`}
        action={
          <Link to="/maintenances/new">
            <Button><Plus size={16} />Nuevo mantenimiento</Button>
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {isPending ? (
          <Spinner />
        ) : !maintenances?.length ? (
          <EmptyState icon={Wrench} title="Sin mantenimientos" description="Registra el primer mantenimiento." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehículo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Próximo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Coste</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/cars/${m.car.id}`} className="font-medium text-gray-700 hover:underline">
                        {m.car.brand} {m.car.model}
                      </Link>
                      <p className="text-xs text-gray-400 font-mono">{m.car.licensePlate}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{m.type}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{m.description ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(m.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-6 py-4">
                      {m.nextDueDate ? (
                        <span className={new Date(m.nextDueDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {new Date(m.nextDueDate).toLocaleDateString('es-ES')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {m.cost != null ? `${m.cost.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => confirm('¿Eliminar?') && deleteMutation.mutate(m.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
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
