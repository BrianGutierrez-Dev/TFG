import api from './axios';
import type { Client } from '../types';

export const clientsApi = {
  getAll: (params?: { blacklisted?: boolean }) =>
    api.get<Client[]>('/clients', { params }),
  getById: (id: number) => api.get<Client>(`/clients/${id}`),
  getHistory: (id: number) => api.get(`/clients/${id}/history`),
  create: (data: Partial<Client>) => api.post<Client>('/clients', data),
  update: (id: number, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};
