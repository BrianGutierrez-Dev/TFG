import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import type { Employee } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem('token'));
  private _employee = signal<Employee | null>(this.loadEmployee());

  readonly token = this._token.asReadonly();
  readonly employee = this._employee.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._employee()?.role === 'ADMIN');

  constructor() {
    if (this._token()) {
      this.http.get<Employee>('/api/auth/me').subscribe({
        error: () => this.logout(),
      });
    }
  }

  login(token: string, employee: Employee): void {
    localStorage.setItem('token', token);
    localStorage.setItem('employee', JSON.stringify(employee));
    this._token.set(token);
    this._employee.set(employee);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    this._token.set(null);
    this._employee.set(null);
    this.router.navigate(['/login']);
  }

  private loadEmployee(): Employee | null {
    try {
      const raw = localStorage.getItem('employee');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
