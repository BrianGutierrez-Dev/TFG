import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { incidentsApi } from '../../api/incidents';
import { clientsApi } from '../../api/clients';
import { rentalsApi } from '../../api/rentals';
import Button from '../../components/ui/Button';
import type { IncidentType, Severity } from '../../types';

interface FormData {
  clientId: number;
  contractId?: number;
  type: IncidentType;
  description: string;
  severity: Severity;
}

const incidentTypes: { value: IncidentType; label: string }[] = [
  { value: 'PAYMENT', label: 'Problema de pago' },
  { value: 'DAMAGE', label: 'Daños en el vehículo' },
  { value: 'NOT_RETURNED', label: 'No devuelto' },
  { value: 'LATE_RETURN', label: 'Devolución tardía' },
  { value: 'THEFT', label: 'Robo' },
  { value: 'ACCIDENT', label: 'Accidente' },
  { value: 'OTHER', label: 'Otro' },
];

export default function IncidentForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { severity: 'MEDIUM' },
  });
  const selectedClientId = watch('clientId');

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((r) => r.data),
  });

  const { data: contracts } = useQuery({
    queryKey: ['rentals-client', selectedClientId],
    queryFn: () =>
      rentalsApi.getAll({ clientId: Number(selectedClientId) }).then((r) => r.data),
    enabled: Boolean(selectedClientId),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      incidentsApi.create({
        ...data,
        clientId: Number(data.clientId),
        contractId: data.contractId ? Number(data.contractId) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['clients'] });
      navigate('/incidents');
    },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva incidencia</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="form-label">Cliente *</label>
          <select {...register('clientId', { required: true })} className="form-select">
            <option value="">Seleccionar cliente…</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.dni}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        {selectedClientId && contracts && contracts.length > 0 && (
          <div>
            <label className="form-label">Contrato relacionado (opcional)</label>
            <select {...register('contractId')} className="form-select">
              <option value="">Sin contrato</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.car.brand} {c.car.model} · {new Date(c.startDate).toLocaleDateString('es-ES')}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Tipo *</label>
            <select {...register('type', { required: true })} className="form-select">
              <option value="">Seleccionar tipo…</option>
              {incidentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="form-label">Gravedad *</label>
            <select {...register('severity', { required: true })} className="form-select">
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Descripción *</label>
          <textarea
            {...register('description', { required: true })}
            className="form-textarea"
            rows={4}
            placeholder="Describe detalladamente la incidencia…"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">Requerido</p>}
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Error al crear la incidencia.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>Crear incidencia</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
