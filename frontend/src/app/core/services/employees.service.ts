import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Employee } from '../models';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private http = inject(HttpClient);
  private url = '/api/employees';

  getAll() { return this.http.get<Employee[]>(this.url); }
  getById(id: number) { return this.http.get<Employee>(`${this.url}/${id}`); }
  create(data: { email: string; password: string; name: string; role?: string }) {
    return this.http.post<Employee>(this.url, data);
  }
  update(id: number, data: Partial<Employee> & { password?: string }) {
    return this.http.put<Employee>(`${this.url}/${id}`, data);
  }
  delete(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
