import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { carsApi } from '../../api/cars';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ContractBadge, RepairBadge } from '../../components/ui/Badge';

const tabs = ['Información', 'Contratos', 'Mantenimiento', 'Reparaciones'] as const;

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Información');

  const { data: car, isPending } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(Number(id)).then((r) => r.data),
  });

  if (isPending) return <div className="p-8"><Spinner /></div>;
  if (!car) return null;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {car.brand} {car.model}
          </h1>
          <p className="text-gray-500 font-mono">{car.licensePlate}</p>
        </div>
        <Link to={`/cars/${id}/edit`}>
          <Button variant="secondary"><Edit2 size={14} />Editar</Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Información' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {[
              ['Matrícula', car.licensePlate],
              ['Marca', car.brand],
              ['Modelo', car.model],
              ['Año', String(car.year)],
              ['Color', car.color ?? '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-gray-400 text-xs mb-0.5">{k}</p>
                <p className="font-medium text-gray-900">{v}</p>
              </div>
            ))}
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Cliente</p>
              {car.client ? (
                <Link to={`/clients/${car.client.id}`} className="text-gray-900 hover:underline font-medium text-sm">
                  {car.client.name}
                </Link>
              ) : <p className="font-medium text-gray-900">—</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'Contratos' && (
        <div className="space-y-3">
          {!(car as { contracts?: unknown[] }).contracts?.length ? (
            <p className="text-gray-400 text-sm py-8 text-center">Sin contratos</p>
          ) : (
            (car as unknown as { contracts: { id: number; client: { name: string }; startDate: string; endDate: string; status: string }[] }).contracts.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{c.client.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.startDate).toLocaleDateString('es-ES')} → {new Date(c.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <ContractBadge status={c.status as 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'} />
                <Link to={`/rentals/${c.id}`} className="text-gray-500 text-xs hover:text-gray-900">Ver →</Link>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Mantenimiento' && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <Link to={`/maintenances/new?carId=${car.id}`}>
              <Button size="sm">+ Nuevo mantenimiento</Button>
            </Link>
          </div>
          {!(car as { maintenances?: unknown[] }).maintenances?.length ? (
            <p className="text-gray-400 text-sm py-8 text-center">Sin registros de mantenimiento</p>
          ) : (
            (car as unknown as { maintenances: { id: number; type: string; description?: string; cost?: number; date: string; nextDueDate?: string }[] }).maintenances.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">{m.type}</p>
                  <p className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString('es-ES')}</p>
                </div>
                {m.description && <p className="text-sm text-gray-600">{m.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  {m.cost != null && <span>Coste: {m.cost.toFixed(2)} €</span>}
                  {m.nextDueDate && <span>Próximo: {new Date(m.nextDueDate).toLocaleDateString('es-ES')}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Reparaciones' && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <Link to={`/repairs/new?carId=${car.id}`}>
              <Button size="sm">+ Nueva reparación</Button>
            </Link>
          </div>
          {!(car as { repairs?: unknown[] }).repairs?.length ? (
            <p className="text-gray-400 text-sm py-8 text-center">Sin reparaciones</p>
          ) : (
            (car as unknown as { repairs: { id: number; description: string; status: string; cost?: number; startDate?: string }[] }).repairs.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{r.description}</p>
                  {r.startDate && <p className="text-xs text-gray-400">{new Date(r.startDate).toLocaleDateString('es-ES')}</p>}
                </div>
                <RepairBadge status={r.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'} />
                {r.cost != null && <span className="text-sm text-gray-600">{r.cost.toFixed(2)} €</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
