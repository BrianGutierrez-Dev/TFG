import api from './axios';
import type { Car } from '../types';

export const carsApi = {
  getAll: (params?: { clientId?: number }) =>
    api.get<Car[]>('/cars', { params }),
  getById: (id: number) => api.get<Car>(`/cars/${id}`),
  create: (data: Partial<Car>) => api.post<Car>('/cars', data),
  update: (id: number, data: Partial<Car>) => api.put<Car>(`/cars/${id}`, data),
  delete: (id: number) => api.delete(`/cars/${id}`),
};
