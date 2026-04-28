import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Plus, Pencil, Trash2, UserCog, Search } from 'lucide-angular';
import { EmployeesService } from '../../core/services/employees.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import type { Employee, Role } from '../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent],
  template: `
    <app-page-header title="Empleados" [subtitle]="employees().length + ' empleados'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nuevo empleado
      </app-button>
    </app-page-header>

    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por nombre, email...">
      </div>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (e of filtered(); track e.id) {
              <tr>
                <td class="font-medium text-gray-900">{{ e.name }}</td>
                <td class="text-gray-500">{{ e.email }}</td>
                <td>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                        [class]="e.role === 'ADMIN' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'">
                    {{ e.role === 'ADMIN' ? 'Admin' : 'Empleado' }}
                  </span>
                </td>
                <td class="text-sm text-gray-500">{{ e.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="space-x-0.5">
                  <button (click)="openEdit(e)" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <lucide-icon [img]="Pencil" [size]="14"></lucide-icon>
                  </button>
                  <button (click)="confirmDelete(e.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <lucide-icon [img]="Trash2" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="UserCog" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay empleados</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (showModal()) {
      <div class="modal-overlay">
        <div class="modal-inner">
          <div class="modal-dialog bg-white rounded-2xl max-w-md shadow-2xl">
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="text-base font-semibold text-gray-900">{{ editingId() ? 'Editar empleado' : 'Nuevo empleado' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="form-label">Nombre completo *</label>
                  <input formControlName="name" class="form-input" placeholder="María García">
                </div>
                <div>
                  <label class="form-label">Email *</label>
                  <input formControlName="email" type="email" class="form-input" placeholder="maria@empresa.com">
                </div>
                <div>
                  <label class="form-label">Contraseña {{ editingId() ? '(dejar en blanco para no cambiar)' : '*' }}</label>
                  <input formControlName="password" type="password" class="form-input" placeholder="••••••••">
                </div>
                <div>
                  <label class="form-label">Rol</label>
                  <select formControlName="role" class="form-select">
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <app-button variant="secondary" (clicked)="closeModal()">Cancelar</app-button>
                <app-button type="submit" [loading]="saving()">Guardar</app-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    @if (deleteId()) {
      <div class="modal-overlay">
        <div class="modal-inner">
          <div class="modal-dialog bg-white rounded-2xl max-w-sm shadow-2xl p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar empleado?</h2>
            <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div class="flex justify-end gap-3">
              <app-button variant="secondary" (clicked)="deleteId.set(null)">Cancelar</app-button>
              <app-button variant="danger" [loading]="deleting()" (clicked)="doDelete()">Eliminar</app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class EmployeeListComponent implements OnInit {
  private employeesService = inject(EmployeesService);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly UserCog = UserCog;
  readonly Search = Search;

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  employees = signal<Employee[]>([]);
  search = signal('');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['EMPLOYEE' as Role],
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.employees().filter(e =>
      !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.employeesService.getAll().subscribe({
      next: data => { this.employees.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ role: 'EMPLOYEE' });
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEdit(e: Employee) {
    this.editingId.set(e.id);
    this.form.patchValue({ name: e.name, email: e.email, role: e.role, password: '' });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    if (this.editingId()) {
      const data: Partial<Employee> & { password?: string } = { name: v.name!, email: v.email!, role: v.role as Role };
      if (v.password) data.password = v.password;
      this.employeesService.update(this.editingId()!, data).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.load(); },
        error: () => this.saving.set(false),
      });
    } else {
      this.employeesService.create({ name: v.name!, email: v.email!, password: v.password!, role: v.role! }).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.load(); },
        error: () => this.saving.set(false),
      });
    }
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.employeesService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.deleteId.set(null); this.load(); },
      error: () => this.deleting.set(false),
    });
  }
}
