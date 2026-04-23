import api from './axios';
import type { Employee } from '../types';

export const employeesApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: number) => api.get<Employee>(`/employees/${id}`),
  create: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post<Employee>('/employees', data),
  update: (id: number, data: Partial<Employee> & { password?: string }) =>
    api.put<Employee>(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};
