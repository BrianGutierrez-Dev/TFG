import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { maintenancesApi } from '../../api/maintenances';
import { carsApi } from '../../api/cars';
import Button from '../../components/ui/Button';

interface FormData {
  carId: number;
  type: string;
  description?: string;
  cost?: number;
  date: string;
  nextDueDate?: string;
}

const maintenanceTypes = ['Cambio de aceite', 'Revisión ITV', 'Cambio de neumáticos', 'Frenos', 'Filtros', 'Batería', 'Otro'];

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedCarId = searchParams.get('carId');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      carId: preselectedCarId ? Number(preselectedCarId) : undefined,
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      maintenancesApi.create({
        ...data,
        carId: Number(data.carId),
        cost: data.cost ? Number(data.cost) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenances'] });
      navigate('/maintenances');
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo mantenimiento</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="form-label">Vehículo *</label>
          <select {...register('carId', { required: true })} className="form-select">
            <option value="">Seleccionar vehículo…</option>
            {(cars ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.licensePlate} — {c.brand} {c.model}</option>
            ))}
          </select>
          {errors.carId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Tipo *</label>
            <select {...register('type', { required: true })} className="form-select">
              <option value="">Seleccionar tipo…</option>
              {maintenanceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Coste (€)</label>
            <input {...register('cost')} type="number" step="0.01" min="0" className="form-input" placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fecha *</label>
            <input {...register('date', { required: true })} type="date" className="form-input" />
            {errors.date && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Próxima revisión</label>
            <input {...register('nextDueDate')} type="date" className="form-input" />
          </div>
        </div>

        <div>
          <label className="form-label">Descripción</label>
          <textarea {...register('description')} className="form-textarea" rows={3} placeholder="Detalles del mantenimiento realizado…" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>Guardar</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
