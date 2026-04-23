import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { incidentsApi } from '../../api/incidents';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { SeverityBadge, IncidentTypeBadge } from '../../components/ui/Badge';

export default function IncidentList() {
  const [showResolved, setShowResolved] = useState(false);
  const qc = useQueryClient();

  const { data: incidents, isPending } = useQuery({
    queryKey: ['incidents', showResolved],
    queryFn: () =>
      incidentsApi.getAll({ resolved: showResolved ? undefined : false }).then((r) => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: incidentsApi.resolve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Incidencias"
        subtitle={`${incidents?.length ?? 0} ${showResolved ? 'incidencias' : 'abiertas'}`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="filter-tab filter-tab-inactive"
            >
              {showResolved ? 'Ocultar resueltas' : 'Mostrar todas'}
            </button>
            <Link to="/incidents/new">
              <Button><Plus size={15} />Nueva incidencia</Button>
            </Link>
          </div>
        }
      />

      <div className="card overflow-hidden">
        {isPending ? (
          <Spinner />
        ) : !incidents?.length ? (
          <EmptyState icon={AlertTriangle} title="Sin incidencias" description="No hay incidencias pendientes." />
        ) : (
          <div className="divide-y divide-gray-50">
            {incidents.map((i) => (
              <div
                key={i.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-start gap-4"
                style={{ borderLeft: '3px solid transparent' }}
                onMouseEnter={e => (e.currentTarget.style.borderLeftColor = '#111827')}
                onMouseLeave={e => (e.currentTarget.style.borderLeftColor = 'transparent')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <IncidentTypeBadge type={i.type} />
                    <SeverityBadge severity={i.severity} />
                    {i.resolved && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        Resuelta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{i.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 flex-wrap">
                    <Link to={`/clients/${i.client.id}`} className="font-medium text-gray-600 hover:text-gray-900 hover:underline">
                      {i.client.name}
                    </Link>
                    {i.contract && (
                      <>
                        <span>·</span>
                        <span>{i.contract.car.brand} {i.contract.car.model} · <span className="font-mono">{i.contract.car.licensePlate}</span></span>
                      </>
                    )}
                    <span>·</span>
                    <span>{new Date(i.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                {!i.resolved && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => resolveMutation.mutate(i.id)}
                    loading={resolveMutation.isPending}
                    className="flex-shrink-0"
                  >
                    <CheckCircle size={13} />
                    Resolver
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
