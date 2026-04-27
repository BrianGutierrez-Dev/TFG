import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ShieldAlert, LogIn } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button.component';
import type { Employee } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-8">
          <div class="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-4">
            <lucide-icon [img]="ShieldAlert" [size]="22" class="text-white"></lucide-icon>
          </div>
          <h1 class="text-xl font-semibold text-gray-900">BlackList</h1>
          <p class="text-sm text-gray-400 mt-1">Inicia sesión en tu cuenta</p>
        </div>
        <div class="card p-6">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="space-y-4">
              <div>
                <label class="form-label">Correo electrónico</label>
                <input formControlName="email" type="email" class="form-input" placeholder="nombre@empresa.com">
              </div>
              <div>
                <label class="form-label">Contraseña</label>
                <input formControlName="password" type="password" class="form-input" placeholder="••••••••">
              </div>
              @if (error()) {
                <p class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error() }}</p>
              }
              <app-button type="submit" [loading]="loading()" extraClass="w-full justify-center">
                <lucide-icon [img]="LogIn" [size]="14"></lucide-icon>
                Iniciar sesión
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly ShieldAlert = ShieldAlert;
  readonly LogIn = LogIn;

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.http.post<{ token: string; employee: Employee }>('/api/auth/login', this.form.value).subscribe({
      next: ({ token, employee }) => {
        this.auth.login(token, employee);
        this.router.navigate(['/']);
      },
      error: () => {
        this.error.set('Credenciales incorrectas. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
