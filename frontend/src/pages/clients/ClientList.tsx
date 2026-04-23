import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Trash2, Eye, ShieldAlert } from 'lucide-react';
import { clientsApi } from '../../api/clients';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function ClientList() {
  const [search, setSearch] = useState('');
  const [filterBlacklisted, setFilterBlacklisted] = useState<boolean | undefined>(undefined);
  const qc = useQueryClient();

  const { data: clients, isPending } = useQuery({
    queryKey: ['clients', filterBlacklisted],
    queryFn: () =>
      clientsApi
        .getAll(filterBlacklisted !== undefined ? { blacklisted: filterBlacklisted } : undefined)
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  const filtered = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dni.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Clientes"
        subtitle={`${clients?.length ?? 0} clientes registrados`}
        action={
          <Link to="/clients/new">
            <Button>
              <Plus size={16} />
              Nuevo cliente
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
        <select
          value={filterBlacklisted === undefined ? '' : String(filterBlacklisted)}
          onChange={(e) =>
            setFilterBlacklisted(e.target.value === '' ? undefined : e.target.value === 'true')
          }
          className="form-select w-44"
        >
          <option value="">Todos</option>
          <option value="false">Sin restricciones</option>
          <option value="true">Lista negra</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isPending ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="Sin clientes" description="Añade tu primer cliente para empezar." />
        ) : (
          <table className="data-table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">DNI</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Teléfono</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contratos</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className={`border-b border-gray-50 last:border-0 transition-colors ${
                    client.isBlacklisted
                      ? 'bg-gray-900 hover:bg-gray-800'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        client.isBlacklisted ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium ${client.isBlacklisted ? 'text-white' : 'text-gray-900'}`}>
                          {client.name}
                        </p>
                        <p className={`text-xs ${client.isBlacklisted ? 'text-gray-400' : 'text-gray-400'}`}>
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-mono text-sm ${client.isBlacklisted ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.dni}
                  </td>
                  <td className={`px-6 py-4 ${client.isBlacklisted ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.phone}
                  </td>
                  <td className={`px-6 py-4 ${client.isBlacklisted ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client._count?.contracts ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    {client.isBlacklisted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-gray-900">
                        <ShieldAlert size={11} /> Lista negra
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/clients/${client.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={client.isBlacklisted ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : ''}
                        >
                          <Eye size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Eliminar este cliente?')) {
                            deleteMutation.mutate(client.id);
                          }
                        }}
                        className={client.isBlacklisted ? 'text-gray-500 hover:bg-gray-700 hover:text-white' : 'text-gray-400 hover:text-gray-700'}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
