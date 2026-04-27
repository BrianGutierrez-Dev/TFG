import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Incident, IncidentType } from '../models';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private http = inject(HttpClient);
  private url = '/api/incidents';

  getAll(params?: { clientId?: number; type?: IncidentType; resolved?: boolean }) {
    return this.http.get<Incident[]>(this.url, { params: params as any });
  }
  getById(id: number) { return this.http.get<Incident>(`${this.url}/${id}`); }
  create(data: Partial<Incident>) { return this.http.post<Incident>(this.url, data); }
  update(id: number, data: Partial<Incident>) { return this.http.put<Incident>(`${this.url}/${id}`, data); }
  resolve(id: number) { return this.http.patch<Incident>(`${this.url}/${id}/resolve`, {}); }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
