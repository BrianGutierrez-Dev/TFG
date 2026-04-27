import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Maintenance } from '../models';

@Injectable({ providedIn: 'root' })
export class MaintenancesService {
  private http = inject(HttpClient);
  private url = '/api/maintenances';

  getAll(params?: { carId?: number }) {
    return this.http.get<Maintenance[]>(this.url, { params: params as any });
  }
  create(data: Partial<Maintenance>) { return this.http.post<Maintenance>(this.url, data); }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
