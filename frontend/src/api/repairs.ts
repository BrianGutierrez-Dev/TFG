import api from './axios';
import type { Repair, RepairStatus } from '../types';

export const repairsApi = {
  getAll: (params?: { carId?: number; status?: RepairStatus }) =>
    api.get<Repair[]>('/repairs', { params }),
  getById: (id: number) => api.get<Repair>(`/repairs/${id}`),
  create: (data: Partial<Repair>) => api.post<Repair>('/repairs', data),
  update: (id: number, data: Partial<Repair>) =>
    api.put<Repair>(`/repairs/${id}`, data),
  delete: (id: number) => api.delete(`/repairs/${id}`),
};
