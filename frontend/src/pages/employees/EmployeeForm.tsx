import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import Button from '../../components/ui/Button';

interface FormData {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { role: 'EMPLOYEE' },
  });

  const { data: existing } = useQuery({
    queryKey: ['employee-edit', id],
    queryFn: () => employeesApi.getById(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) reset({ name: existing.name, email: existing.email, role: existing.role });
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, ...(isEdit && !data.password ? { password: undefined } : {}) };
      return isEdit ? employeesApi.update(Number(id), payload) : employeesApi.create(payload as Required<FormData>);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
  });

  return (
    <div className="p-8 max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar empleado' : 'Nuevo empleado'}
        </h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="form-label">Nombre completo *</label>
          <input {...register('name', { required: true })} className="form-input" placeholder="Ana Martínez" />
          {errors.name && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div>
          <label className="form-label">Email *</label>
          <input {...register('email', { required: true })} type="email" className="form-input" placeholder="ana@taller.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div>
          <label className="form-label">{isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
          <input
            {...register('password', { required: !isEdit })}
            type="password"
            className="form-input"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        <div>
          <label className="form-label">Rol</label>
          <select {...register('role')} className="form-select">
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Error al guardar. El email puede estar en uso.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant={isEdit ? 'warning' : 'primary'} loading={mutation.isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear empleado'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
