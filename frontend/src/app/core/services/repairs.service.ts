import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Repair, RepairStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class RepairsService {
  private http = inject(HttpClient);
  private url = '/api/repairs';

  getAll(params?: { carId?: number; status?: RepairStatus }) {
    return this.http.get<Repair[]>(this.url, { params: params as any });
  }
  getById(id: number) { return this.http.get<Repair>(`${this.url}/${id}`); }
  create(data: Partial<Repair>) { return this.http.post<Repair>(this.url, data); }
  update(id: number, data: Partial<Repair>) { return this.http.put<Repair>(`${this.url}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
