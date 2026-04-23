import api from './axios';
import type { CarReturn, CarCondition, FuelLevel } from '../types';

export const carReturnsApi = {
  getAll: () => api.get<CarReturn[]>('/car-returns'),
  getById: (id: number) => api.get<CarReturn>(`/car-returns/${id}`),
  create: (data: {
    contractId: number;
    returnDate?: string;
    condition: CarCondition;
    fuelLevel?: FuelLevel;
    damagesFound: boolean;
    damageDescription?: string;
    notes?: string;
  }) => api.post<CarReturn>('/car-returns', data),
};
