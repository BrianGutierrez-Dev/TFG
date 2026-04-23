import api from './axios';
import type { Incident, IncidentType } from '../types';

export const incidentsApi = {
  getAll: (params?: { clientId?: number; type?: IncidentType; resolved?: boolean }) =>
    api.get<Incident[]>('/incidents', { params }),
  getById: (id: number) => api.get<Incident>(`/incidents/${id}`),
  create: (data: Partial<Incident>) => api.post<Incident>('/incidents', data),
  update: (id: number, data: Partial<Incident>) =>
    api.put<Incident>(`/incidents/${id}`, data),
  resolve: (id: number) => api.patch<Incident>(`/incidents/${id}/resolve`),
  delete: (id: number) => api.delete(`/incidents/${id}`),
};
