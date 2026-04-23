import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Clock,
  Gauge, Droplets,
} from 'lucide-react';
import { carReturnsApi } from '../../api/carReturns';
import { rentalsApi } from '../../api/rentals';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import clsx from 'clsx';
import type { CarCondition, FuelLevel } from '../../types';

interface FormData {
  contractId: number;
  returnDate: string;
  condition: CarCondition;
  fuelLevel: FuelLevel;
  damagesFound: boolean;
  damageDescription?: string;
  notes?: string;
}

const conditionOptions: { value: CarCondition; label: string; desc: string }[] = [
  { value: 'EXCELLENT', label: 'Excelente', desc: 'Sin ningún defecto' },
  { value: 'GOOD', label: 'Bueno', desc: 'Desgaste normal' },
  { value: 'FAIR', label: 'Regular', desc: 'Algunos arañazos o suciedad' },
  { value: 'DAMAGED', label: 'Dañado', desc: 'Daños visibles o mecánicos' },
];

const fuelOptions: { value: FuelLevel; label: string }[] = [
  { value: 'FULL', label: 'Lleno' },
  { value: 'THREE_QUARTERS', label: '¾' },
  { value: 'HALF', label: '½' },
  { value: 'ONE_QUARTER', label: '¼' },
  { value: 'EMPTY', label: 'Vacío' },
];

export default function CarReturnForm() {
  const [searchParams] = useSearchParams();
  const preselectedContractId = searchParams.get('contractId');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [condition, setCondition] = useState<CarCondition>('GOOD');
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>('FULL');
  const [damagesFound, setDamagesFound] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      contractId: preselectedContractId ? Number(preselectedContractId) : undefined,
      returnDate: new Date().toISOString().slice(0, 16),
    },
  });

  const selectedContractId = watch('contractId');
  const returnDateValue = watch('returnDate');

  const { data: activeRentals, isPending: loadingRentals } = useQuery({
    queryKey: ['rentals-active'],
    queryFn: () =>
      rentalsApi.getAll({ status: 'ACTIVE' }).then((r) => r.data).then((active) =>
        rentalsApi.getAll({ status: 'OVERDUE' }).then((r) => [...active, ...r.data])
      ),
  });

  const selectedContract = activeRentals?.find((r) => r.id === Number(selectedContractId));

  const isLate = selectedContract && returnDateValue
    ? new Date(returnDateValue) > new Date(selectedContract.endDate)
    : false;

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      carReturnsApi.create({
        contractId: Number(data.contractId),
        returnDate: data.returnDate ? new Date(data.returnDate).toISOString() : undefined,
        condition,
        fuelLevel,
        damagesFound,
        damageDescription: damagesFound ? data.damageDescription : undefined,
        notes: data.notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      qc.invalidateQueries({ queryKey: ['clients'] });
      navigate('/rentals');
    },
  });

  const step = (n: number, label: string) => (
    <span className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
      <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">{n}</span>
      {label}
    </span>
  );

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar contrato</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedContract
              ? `${selectedContract.client.name} · ${selectedContract.car.brand} ${selectedContract.car.model}`
              : 'Registra el estado del vehículo al ser recibido'}
          </p>
        </div>
      </div>

      {loadingRentals ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">

          {/* Contract */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step(1, 'Contrato')}
            {preselectedContractId && selectedContract ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
                    <p className="font-medium text-gray-900">{selectedContract.client.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Vehículo</p>
                    <p className="font-medium text-gray-900">{selectedContract.car.brand} {selectedContract.car.model} · {selectedContract.car.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Fin acordado</p>
                    <p className="font-medium text-gray-900">{new Date(selectedContract.endDate).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <input type="hidden" {...register('contractId')} />
              </div>
            ) : (
              <div>
                <label className="form-label">Contrato activo *</label>
                <select {...register('contractId', { required: true })} className="form-select">
                  <option value="">Seleccionar contrato…</option>
                  {(activeRentals ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} — {r.client.name} · {r.car.brand} {r.car.model} ({r.car.licensePlate}) · fin: {new Date(r.endDate).toLocaleDateString('es-ES')}
                      {r.status === 'OVERDUE' ? ' ⚠ VENCIDO' : ''}
                    </option>
                  ))}
                </select>
                {errors.contractId && <p className="text-gray-600 text-xs mt-1">Selecciona un contrato</p>}
              </div>
            )}
          </section>

          {/* Date */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step(2, 'Fecha y hora de devolución')}
            <div className="max-w-xs">
              <label className="form-label">Fecha y hora *</label>
              <input {...register('returnDate', { required: true })} type="datetime-local" className="form-input" />
            </div>
            {isLate && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                <Clock size={16} />
                <span><strong>Devolución tardía</strong> — Se generará automáticamente una incidencia por retraso.</span>
              </div>
            )}
            {selectedContract && !isLate && returnDateValue && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                <CheckCircle2 size={16} />
                Devolución a tiempo
              </div>
            )}
          </section>

          {/* Condition */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step(3, 'Estado del vehículo')}
            <div className="grid grid-cols-2 gap-3">
              {conditionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCondition(opt.value)}
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    condition === opt.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  )}
                >
                  <div className={clsx('w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0',
                    condition === opt.value ? 'border-white bg-white' : 'border-gray-300')} />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className={clsx('text-xs mt-0.5', condition === opt.value ? 'opacity-70' : 'text-gray-400')}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Fuel */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step(4, 'Nivel de combustible')}
            <div className="flex gap-3">
              {fuelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFuelLevel(opt.value)}
                  className={clsx(
                    'flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1',
                    fuelLevel === opt.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  <Gauge size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Damages */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step(5, 'Daños')}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setDamagesFound(false)}
                className={clsx(
                  'flex-1 py-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                  !damagesFound ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <CheckCircle2 size={16} />
                Sin daños
              </button>
              <button
                type="button"
                onClick={() => setDamagesFound(true)}
                className={clsx(
                  'flex-1 py-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                  damagesFound ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <AlertTriangle size={16} />
                Con daños
              </button>
            </div>
            {damagesFound && (
              <div>
                <label className="form-label">Descripción de los daños *</label>
                <textarea
                  {...register('damageDescription', { required: damagesFound })}
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe los daños encontrados…"
                />
                {errors.damageDescription && <p className="text-gray-600 text-xs mt-1">Requerido si hay daños</p>}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Se generará automáticamente una incidencia por daños.
                </p>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <span className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold">6</span>
              Notas adicionales
            </span>
            <textarea
              {...register('notes')}
              className="form-textarea"
              rows={3}
              placeholder="Cualquier observación adicional…"
            />
          </section>

          {mutation.isError && (
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
              <AlertTriangle size={16} />
              Error al registrar la devolución. Comprueba que el contrato no tenga ya una devolución registrada.
            </div>
          )}

          <div className="flex gap-3 pb-8">
            <Button type="submit" variant="success" loading={mutation.isPending} className="px-8">
              Registrar devolución
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
