import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { carsApi } from '../../api/cars';
import { clientsApi } from '../../api/clients';
import Button from '../../components/ui/Button';

interface FormData {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  clientId?: number;
}

export default function CarForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const { data: existing } = useQuery({
    queryKey: ['car-edit', id],
    queryFn: () => carsApi.getById(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? carsApi.update(Number(id), data) : carsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cars'] });
      navigate('/cars');
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar vehículo' : 'Nuevo vehículo'}
        </h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, year: Number(d.year), clientId: d.clientId ? Number(d.clientId) : undefined }))} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Matrícula *</label>
            <input {...register('licensePlate', { required: true })} className="form-input uppercase" placeholder="1234ABC" />
            {errors.licensePlate && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Año *</label>
            <input {...register('year', { required: true })} type="number" min="1900" max="2030" className="form-input" placeholder="2022" />
            {errors.year && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Marca *</label>
            <input {...register('brand', { required: true })} className="form-input" placeholder="Toyota" />
            {errors.brand && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Modelo *</label>
            <input {...register('model', { required: true })} className="form-input" placeholder="Corolla" />
            {errors.model && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Color</label>
            <input {...register('color')} className="form-input" placeholder="Blanco" />
          </div>
          <div>
            <label className="form-label">Cliente propietario</label>
            <select {...register('clientId')} className="form-select">
              <option value="">Sin cliente asignado</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.dni}</option>
              ))}
            </select>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Error al guardar. Comprueba que la matrícula no esté duplicada.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant={isEdit ? 'warning' : 'primary'} loading={mutation.isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear vehículo'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
