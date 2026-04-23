import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Plus, Search, Trash2, Eye } from 'lucide-react';
import { carsApi } from '../../api/cars';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function CarList() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: cars, isPending } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: carsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cars'] }),
  });

  const filtered = (cars ?? []).filter(
    (c) =>
      c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Vehículos"
        subtitle={`${cars?.length ?? 0} vehículos registrados`}
        action={
          <Link to="/cars/new">
            <Button>
              <Plus size={16} />
              Nuevo vehículo
            </Button>
          </Link>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por matrícula, marca o modelo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-9"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {isPending ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Car} title="Sin vehículos" description="Añade el primer vehículo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Matrícula</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehículo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Año</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Color</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-gray-900">{car.licensePlate}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{car.brand} {car.model}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{car.year}</td>
                    <td className="px-6 py-4 text-gray-600">{car.color ?? '—'}</td>
                    <td className="px-6 py-4">
                      {car.client ? (
                        <Link to={`/clients/${car.client.id}`} className="text-gray-700 hover:underline">
                          {car.client.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/cars/${car.id}`}>
                          <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => confirm('¿Eliminar este vehículo?') && deleteMutation.mutate(car.id)}
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
