import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { repairsApi } from '../../api/repairs';
import { carsApi } from '../../api/cars';
import Button from '../../components/ui/Button';
import type { RepairStatus } from '../../types';

interface FormData {
  carId: number;
  description: string;
  cost?: number;
  status: RepairStatus;
  startDate?: string;
  endDate?: string;
}

export default function RepairForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedCarId = searchParams.get('carId');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      carId: preselectedCarId ? Number(preselectedCarId) : undefined,
      status: 'PENDING',
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then((r) => r.data),
  });

  const { data: existing } = useQuery({
    queryKey: ['repair-edit', id],
    queryFn: () => repairsApi.getById(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      reset({
        ...existing,
        startDate: existing.startDate ? existing.startDate.slice(0, 10) : undefined,
        endDate: existing.endDate ? existing.endDate.slice(0, 10) : undefined,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        carId: Number(data.carId),
        cost: data.cost ? Number(data.cost) : undefined,
      };
      return isEdit ? repairsApi.update(Number(id), payload) : repairsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repairs'] });
      navigate('/repairs');
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar reparación' : 'Nueva reparación'}
        </h1>
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

        <div>
          <label className="form-label">Descripción *</label>
          <textarea {...register('description', { required: true })} className="form-textarea" rows={3} placeholder="Describe la reparación a realizar…" />
          {errors.description && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Estado</label>
            <select {...register('status')} className="form-select">
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En proceso</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="form-label">Coste estimado (€)</label>
            <input {...register('cost')} type="number" step="0.01" min="0" className="form-input" placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fecha de inicio</label>
            <input {...register('startDate')} type="date" className="form-input" />
          </div>
          <div>
            <label className="form-label">Fecha de fin</label>
            <input {...register('endDate')} type="date" className="form-input" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant={isEdit ? 'warning' : 'primary'} loading={mutation.isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear reparación'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
