import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { rentalsApi } from '../../api/rentals';
import { clientsApi } from '../../api/clients';
import { carsApi } from '../../api/cars';
import Button from '../../components/ui/Button';

interface FormData {
  clientId: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  notes?: string;
}

export default function RentalForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const selectedClientId = watch('clientId');

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then((r) => r.data),
  });

  const selectedClient = clients?.find((c) => c.id === Number(selectedClientId));

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      rentalsApi.create({
        ...data,
        clientId: Number(data.clientId),
        carId: Number(data.carId),
        totalPrice: Number(data.totalPrice),
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      navigate(`/rentals/${res.data.id}`);
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo contrato de alquiler</h1>
      </div>

      {selectedClient?.isBlacklisted && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">⚠ Cliente en lista negra</p>
            <p className="text-sm text-red-600">Este cliente tiene incidencias graves sin resolver. Procede con precaución.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="form-label">Cliente *</label>
          <select {...register('clientId', { required: true })} className="form-select">
            <option value="">Seleccionar cliente…</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.isBlacklisted ? '⚠ ' : ''}{c.name} — {c.dni}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div>
          <label className="form-label">Vehículo *</label>
          <select {...register('carId', { required: true })} className="form-select">
            <option value="">Seleccionar vehículo…</option>
            {(cars ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.licensePlate} — {c.brand} {c.model} ({c.year})
              </option>
            ))}
          </select>
          {errors.carId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fecha de inicio *</label>
            <input {...register('startDate', { required: true })} type="date" className="form-input" />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Fecha de fin *</label>
            <input {...register('endDate', { required: true })} type="date" className="form-input" />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>

        <div>
          <label className="form-label">Precio total (€) *</label>
          <input {...register('totalPrice', { required: true, min: 0 })} type="number" step="0.01" min="0" className="form-input" placeholder="250.00" />
          {errors.totalPrice && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div>
          <label className="form-label">Notas</label>
          <textarea {...register('notes')} className="form-textarea" rows={3} placeholder="Condiciones especiales, observaciones…" />
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Error al crear el contrato. El vehículo puede tener ya un contrato activo.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>Crear contrato</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
