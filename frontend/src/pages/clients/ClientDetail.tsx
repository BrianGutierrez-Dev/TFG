import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, CreditCard, AlertTriangle, Car } from 'lucide-react';
import { clientsApi } from '../../api/clients';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { BlacklistedBadge, ContractBadge, SeverityBadge, IncidentTypeBadge } from '../../components/ui/Badge';

const tabs = ['Información', 'Contratos', 'Incidencias'] as const;

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Información');

  const { data, isPending } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getHistory(Number(id)).then((r) => r.data),
  });

  if (isPending) return <div className="p-8"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="p-8">
      {/* Back + actions */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            {data.isBlacklisted && <BlacklistedBadge />}
          </div>
        </div>
        <Link to={`/clients/${id}/edit`}>
          <Button variant="secondary">
            <Edit2 size={14} />
            Editar
          </Button>
        </Link>
      </div>

      {/* Blacklist warning */}
      {data.isBlacklisted && (
        <div className="mb-6 flex items-start gap-3 bg-gray-900 rounded-xl px-5 py-4">
          <AlertTriangle size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white">Cliente en lista negra</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Este cliente tiene incidencias graves sin resolver. Revisa su historial antes de aceptar nuevos contratos.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'Información' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Datos personales</h3>
            <InfoRow icon={CreditCard} label="DNI" value={(data as { dni?: string }).dni ?? '—'} />
            <InfoRow icon={Mail} label="Email" value={(data as { email?: string }).email ?? '—'} />
            <InfoRow icon={Phone} label="Teléfono" value={(data as { phone?: string }).phone ?? '—'} />
            <InfoRow icon={MapPin} label="Dirección" value={(data as { address?: string }).address ?? '—'} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatBox value={data.contracts?.length ?? 0} label="Contratos" color="bg-gray-100 text-gray-700" />
              <StatBox value={data.incidents?.length ?? 0} label="Incidencias" color="bg-gray-100 text-gray-700" />
              <StatBox
                value={data.incidents?.filter((i: { resolved: boolean }) => !i.resolved).length ?? 0}
                label="Sin resolver"
                color="bg-gray-900 text-white"
              />
              <StatBox
                value={data.contracts?.filter((c: { carReturn: unknown }) => !c.carReturn).length ?? 0}
                label="Sin devolver"
                color="bg-gray-800 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contratos */}
      {tab === 'Contratos' && (
        <div className="space-y-3">
          {(!data.contracts || data.contracts.length === 0) ? (
            <p className="text-gray-400 text-sm py-8 text-center">Sin contratos registrados</p>
          ) : (
            data.contracts.map((c: { id: number; car: { licensePlate: string; brand: string; model: string }; startDate: string; endDate: string; status: string; carReturn: unknown }) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <Car size={18} className="text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{c.car.brand} {c.car.model} · {c.car.licensePlate}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.startDate).toLocaleDateString('es-ES')} → {new Date(c.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <ContractBadge status={c.status as 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'} />
                {!c.carReturn && c.status === 'ACTIVE' && (
                  <Link to={`/car-returns/new?contractId=${c.id}`}>
                    <Button variant="success" size="sm">Registrar devolución</Button>
                  </Link>
                )}
                <Link to={`/rentals/${c.id}`} className="text-gray-500 hover:text-gray-900 text-xs">Ver →</Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Incidencias */}
      {tab === 'Incidencias' && (
        <div className="space-y-3">
          {(!data.incidents || data.incidents.length === 0) ? (
            <p className="text-gray-400 text-sm py-8 text-center">Sin incidencias</p>
          ) : (
            data.incidents.map((i: { id: number; type: string; description: string; severity: string; resolved: boolean; createdAt: string }) => (
              <div key={i.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IncidentTypeBadge type={i.type as 'PAYMENT' | 'DAMAGE' | 'NOT_RETURNED' | 'LATE_RETURN' | 'THEFT' | 'ACCIDENT' | 'OTHER'} />
                    <SeverityBadge severity={i.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} />
                    {i.resolved && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Resuelta</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{new Date(i.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <p className="text-sm text-gray-700">{i.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-gray-400 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={`rounded-xl p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  );
}
