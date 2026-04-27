import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Client } from '../models';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private url = '/api/clients';

  getAll(params?: { blacklisted?: boolean }) {
    return this.http.get<Client[]>(this.url, { params: params as any });
  }
  getById(id: number) { return this.http.get<Client>(`${this.url}/${id}`); }
  getHistory(id: number) { return this.http.get<any>(`${this.url}/${id}/history`); }
  create(data: Partial<Client>) { return this.http.post<Client>(this.url, data); }
  update(id: number, data: Partial<Client>) { return this.http.put<Client>(`${this.url}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
