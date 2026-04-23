import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Search, Eye, Phone, Mail, AlertTriangle, FileText } from 'lucide-react';
import { clientsApi } from '../../api/clients';
import Spinner from '../../components/ui/Spinner';
import { SeverityBadge, IncidentTypeBadge } from '../../components/ui/Badge';

export default function BlacklistPage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: clients, isPending } = useQuery({
    queryKey: ['clients', true],
    queryFn: () => clientsApi.getAll({ blacklisted: true }).then((r) => r.data),
  });

  const filtered = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dni.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lista Negra</h1>
            <p className="text-sm text-gray-500">
              {isPending ? '…' : `${filtered.length} cliente${filtered.length !== 1 ? 's' : ''} restringido${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {isPending ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert size={28} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 text-lg">Sin clientes restringidos</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? 'No hay resultados para esa búsqueda.' : 'No hay ningún cliente en lista negra.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => {
            const isOpen = expanded === client.id;
            const unresolvedCount = (client.incidents ?? []).filter((i: { resolved: boolean }) => !i.resolved).length;

            return (
              <div
                key={client.id}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800"
              >
                {/* Client row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{client.name}</p>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">
                        {client.dni}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail size={11} /> {(client as { email?: string }).email ?? '—'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={11} /> {(client as { phone?: string }).phone ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-white font-semibold text-lg leading-none">{unresolvedCount}</p>
                      <p className="text-gray-400 text-xs mt-0.5">sin resolver</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold text-lg leading-none">{client._count?.contracts ?? 0}</p>
                      <p className="text-gray-400 text-xs mt-0.5">contratos</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpanded(isOpen ? null : client.id)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle size={12} />
                        {isOpen ? 'Ocultar' : 'Incidencias'}
                      </button>
                      <Link
                        to={`/clients/${client.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Ver ficha
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Expanded incidents */}
                {isOpen && (
                  <div className="border-t border-gray-800 bg-gray-950 px-5 py-4 space-y-2">
                    {!(client as { incidents?: unknown[] }).incidents || (client as { incidents: unknown[] }).incidents.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Sin incidencias registradas</p>
                    ) : (
                      (client as { incidents: Array<{ id: number; type: string; severity: string; description: string; resolved: boolean; createdAt: string; contract?: { id: number } }> }).incidents.map((inc) => (
                        <div key={inc.id} className="flex items-start gap-3 bg-gray-900 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap flex-1">
                            <IncidentTypeBadge type={inc.type as 'PAYMENT' | 'DAMAGE' | 'NOT_RETURNED' | 'LATE_RETURN' | 'THEFT' | 'ACCIDENT' | 'OTHER'} />
                            <SeverityBadge severity={inc.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} />
                            {!inc.resolved && (
                              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">Abierta</span>
                            )}
                            <p className="text-gray-300 text-sm ml-1">{inc.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {inc.contract && (
                              <Link to={`/rentals/${inc.contract.id}`} className="text-gray-500 hover:text-gray-300">
                                <FileText size={14} />
                              </Link>
                            )}
                            <span className="text-gray-600 text-xs">
                              {new Date(inc.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
