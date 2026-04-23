import api from './axios';
import type { Maintenance } from '../types';

export const maintenancesApi = {
  getAll: (params?: { carId?: number }) =>
    api.get<Maintenance[]>('/maintenances', { params }),
  getById: (id: number) => api.get<Maintenance>(`/maintenances/${id}`),
  create: (data: Partial<Maintenance>) => api.post<Maintenance>('/maintenances', data),
  update: (id: number, data: Partial<Maintenance>) =>
    api.put<Maintenance>(`/maintenances/${id}`, data),
  delete: (id: number) => api.delete(`/maintenances/${id}`),
};
