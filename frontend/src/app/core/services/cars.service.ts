import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Car } from '../models';

type CarPayload = Omit<Partial<Car>, 'clientId'> & { clientId?: number };

@Injectable({ providedIn: 'root' })
export class CarsService {
  private http = inject(HttpClient);
  private url = '/api/cars';

  getAll(params?: { clientId?: number }) {
    return this.http.get<Car[]>(this.url, { params: params as any });
  }
  getById(id: number) { return this.http.get<any>(`${this.url}/${id}`); }
  create(data: CarPayload) { return this.http.post<Car>(this.url, data); }
  update(id: number, data: CarPayload) { return this.http.put<Car>(`${this.url}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
