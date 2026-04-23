import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle, CalendarPlus, X } from 'lucide-react';
import { rentalsApi } from '../../api/rentals';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ContractBadge, SeverityBadge, IncidentTypeBadge } from '../../components/ui/Badge';

const conditionLabels: Record<string, string> = {
  EXCELLENT: 'Excelente', GOOD: 'Bueno', FAIR: 'Regular', DAMAGED: 'Dañado',
};
const fuelLabels: Record<string, string> = {
  FULL: 'Lleno', THREE_QUARTERS: '¾', HALF: '½', ONE_QUARTER: '¼', EMPTY: 'Vacío',
};

export default function RentalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showExtend, setShowExtend] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');

  const { data: rental, isPending } = useQuery({
    queryKey: ['rental', id],
    queryFn: () => rentalsApi.getById(Number(id)).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: () => rentalsApi.updateStatus(Number(id), 'CANCELLED'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rental', id] }),
  });

  const extendMutation = useMutation({
    mutationFn: () => rentalsApi.update(Number(id), { endDate: newEndDate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rental', id] });
      setShowExtend(false);
      setNewEndDate('');
    },
  });

  if (isPending) return <div className="p-8"><Spinner /></div>;
  if (!rental) return null;

  const canReturn = (rental.status === 'ACTIVE' || rental.status === 'OVERDUE') && !rental.carReturn;
  const canExtend = rental.status === 'ACTIVE' || rental.status === 'OVERDUE';
  const canCancel = rental.status === 'ACTIVE';
  const minExtendDate = rental.endDate
    ? new Date(rental.endDate).toISOString().slice(0, 10)
    : undefined;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Contrato #{rental.id}</h1>
            <ContractBadge status={rental.status} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {rental.client.name} · {rental.car.brand} {rental.car.model} ({rental.car.licensePlate})
          </p>
        </div>
        <div className="flex gap-2">
          {canExtend && (
            <Button variant="warning" onClick={() => setShowExtend((v) => !v)}>
              <CalendarPlus size={14} />
              Extender contrato
            </Button>
          )}
          {canReturn && (
            <Link to={`/car-returns/new?contractId=${rental.id}`}>
              <Button variant="success">
                <RotateCcw size={14} />
                Finalizar contrato
              </Button>
            </Link>
          )}
          {canCancel && (
            <Button
              variant="danger"
              onClick={() => confirm('¿Cancelar este contrato?') && cancelMutation.mutate()}
              loading={cancelMutation.isPending}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Extend panel */}
      {showExtend && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarPlus size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Extender contrato</h3>
            </div>
            <button onClick={() => setShowExtend(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Fecha de fin actual</p>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {new Date(rental.endDate).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nueva fecha de fin *</label>
              <input
                type="date"
                min={minExtendDate}
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="form-input"
              />
            </div>
            <Button
              variant="warning"
              onClick={() => extendMutation.mutate()}
              loading={extendMutation.isPending}
              disabled={!newEndDate}
            >
              Confirmar extensión
            </Button>
          </div>
          {extendMutation.isError && (
            <p className="text-sm text-gray-600 mt-3 flex items-center gap-1">
              <AlertTriangle size={14} /> Error al extender el contrato.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Contract info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Detalles del contrato</h3>
          <dl className="space-y-3 text-sm">
            <Row label="Cliente">
              <Link to={`/clients/${rental.client.id}`} className="text-gray-900 hover:underline font-medium">
                {rental.client.name}
              </Link>
            </Row>
            <Row label="Vehículo">
              <Link to={`/cars/${rental.car.id}`} className="text-gray-900 hover:underline font-medium">
                {rental.car.brand} {rental.car.model} · {rental.car.licensePlate}
              </Link>
            </Row>
            <Row label="Inicio">{new Date(rental.startDate).toLocaleDateString('es-ES')}</Row>
            <Row label="Fin pactado">{new Date(rental.endDate).toLocaleDateString('es-ES')}</Row>
            <Row label="Precio total"><span className="font-semibold">{rental.totalPrice.toFixed(2)} €</span></Row>
            {rental.notes && <Row label="Notas">{rental.notes}</Row>}
          </dl>
        </div>

        {/* Return info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Devolución</h3>
          {rental.carReturn ? (
            <dl className="space-y-3 text-sm">
              <Row label="Devuelto">
                {new Date(rental.carReturn.returnDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Row>
              <Row label="A tiempo">
                {rental.carReturn.onTime ? (
                  <span className="flex items-center gap-1 text-gray-700"><CheckCircle size={14} /> Sí</span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-700"><AlertTriangle size={14} /> No</span>
                )}
              </Row>
              <Row label="Estado">{conditionLabels[rental.carReturn.condition]}</Row>
              {rental.carReturn.fuelLevel && <Row label="Combustible">{fuelLabels[rental.carReturn.fuelLevel]}</Row>}
              <Row label="Daños">
                {rental.carReturn.damagesFound ? (
                  <span className="text-gray-800 font-medium">{rental.carReturn.damageDescription}</span>
                ) : (
                  <span className="text-gray-500">Sin daños</span>
                )}
              </Row>
              {rental.carReturn.notes && <Row label="Notas">{rental.carReturn.notes}</Row>}
              <Row label="Empleado">{rental.carReturn.employee?.name ?? '—'}</Row>
            </dl>
          ) : (
            <div className="text-center py-8">
              <RotateCcw size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Pendiente de devolución</p>
              {canReturn && (
                <Link to={`/car-returns/new?contractId=${rental.id}`} className="mt-4 inline-block">
                  <Button variant="success" size="sm">Finalizar contrato</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Incidents */}
      {rental.incidents && rental.incidents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-gray-400" />
            Incidencias ({rental.incidents.length})
          </h3>
          <div className="space-y-3">
            {rental.incidents.map((i) => (
              <div key={i.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IncidentTypeBadge type={i.type} />
                    <SeverityBadge severity={i.severity} />
                    {i.resolved && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Resuelta</span>}
                  </div>
                  <p className="text-sm text-gray-700">{i.description}</p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{new Date(i.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-400 w-32 flex-shrink-0">{label}</dt>
      <dd className="text-gray-800">{children}</dd>
    </div>
  );
}
