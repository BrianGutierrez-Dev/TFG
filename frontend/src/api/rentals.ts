import api from './axios';
import type { RentalContract, ContractStatus } from '../types';

export const rentalsApi = {
  getAll: (params?: { status?: ContractStatus; clientId?: number; carId?: number }) =>
    api.get<RentalContract[]>('/rentals', { params }),
  getById: (id: number) => api.get<RentalContract>(`/rentals/${id}`),
  create: (data: {
    clientId: number;
    carId: number;
    startDate: string;
    endDate: string;
    totalPrice: number;
    notes?: string;
  }) => api.post<RentalContract>('/rentals', data),
  update: (id: number, data: Partial<RentalContract>) =>
    api.put<RentalContract>(`/rentals/${id}`, data),
  updateStatus: (id: number, status: ContractStatus) =>
    api.patch<RentalContract>(`/rentals/${id}/status`, { status }),
};
