import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus, Trash2, Edit2 } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function EmployeeList() {
  const { employee: me } = useAuth();
  const qc = useQueryClient();

  const { data: employees, isPending } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Empleados"
        subtitle={`${employees?.length ?? 0} empleados`}
        action={
          <Link to="/employees/new">
            <Button><Plus size={16} />Nuevo empleado</Button>
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {isPending ? (
          <Spinner />
        ) : !employees?.length ? (
          <EmptyState icon={UserCog} title="Sin empleados" />
        ) : (
          <div className="divide-y divide-gray-50">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                  {e.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{e.name}</p>
                    {e.id === me?.id && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Tú</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      e.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {e.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{e.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/employees/${e.id}/edit`}>
                    <Button variant="ghost" size="sm"><Edit2 size={14} /></Button>
                  </Link>
                  {e.id !== me?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => confirm('¿Eliminar empleado?') && deleteMutation.mutate(e.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
