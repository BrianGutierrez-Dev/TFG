import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { RentalContract, ContractStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class RentalsService {
  private http = inject(HttpClient);
  private url = '/api/rentals';

  getAll(params?: { status?: ContractStatus; clientId?: number; carId?: number }) {
    return this.http.get<RentalContract[]>(this.url, { params: params as any });
  }
  getById(id: number) { return this.http.get<RentalContract>(`${this.url}/${id}`); }
  create(data: { clientId: number; carId: number; startDate: string; endDate: string; totalPrice: number; notes?: string }) {
    return this.http.post<RentalContract>(this.url, data);
  }
  update(id: number, data: Partial<RentalContract>) { return this.http.put<RentalContract>(`${this.url}/${id}`, data); }
  updateStatus(id: number, status: ContractStatus) {
    return this.http.patch<RentalContract>(`${this.url}/${id}/status`, { status });
  }
}
