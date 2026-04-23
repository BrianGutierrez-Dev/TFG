import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { clientsApi } from '../../api/clients';
import Button from '../../components/ui/Button';

interface FormData {
  name: string;
  email: string;
  phone: string;
  dni: string;
  address?: string;
  notes?: string;
}

export default function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const { data: existing } = useQuery({
    queryKey: ['client-edit', id],
    queryFn: () => clientsApi.getById(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? clientsApi.update(Number(id), data) : clientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      navigate('/clients');
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
        </h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nombre completo *</label>
            <input {...register('name', { required: true })} className="form-input" placeholder="Juan García López" />
            {errors.name && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">DNI / NIE *</label>
            <input {...register('dni', { required: true })} className="form-input" placeholder="12345678A" />
            {errors.dni && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Email *</label>
            <input {...register('email', { required: true })} type="email" className="form-input" placeholder="cliente@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Teléfono *</label>
            <input {...register('phone', { required: true })} className="form-input" placeholder="600 123 456" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>

        <div>
          <label className="form-label">Dirección</label>
          <input {...register('address')} className="form-input" placeholder="Calle Mayor 1, 28001 Madrid" />
        </div>

        <div>
          <label className="form-label">Notas internas</label>
          <textarea {...register('notes')} className="form-textarea" rows={3} placeholder="Información adicional sobre el cliente…" />
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Error al guardar. Comprueba que el email y DNI no estén duplicados.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant={isEdit ? 'warning' : 'primary'} loading={mutation.isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
