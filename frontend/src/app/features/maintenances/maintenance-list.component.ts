import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Plus, Trash2, Wrench, Search } from 'lucide-angular';
import { MaintenancesService } from '../../core/services/maintenances.service';
import { CarsService } from '../../core/services/cars.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import type { Maintenance, Car } from '../../core/models';

function maintenanceDateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const date = control.get('date')?.value;
  const nextDueDate = control.get('nextDueDate')?.value;

  if (!date || !nextDueDate) return null;

  return new Date(nextDueDate) <= new Date(date) ? { dateRange: true } : null;
}

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent],
  template: `
    <app-page-header title="Mantenimiento" [subtitle]="maintenances().length + ' registros'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nuevo mantenimiento
      </app-button>
    </app-page-header>

    @if (showModal() && dateRangeInvalid()) {
      <div class="fixed left-4 top-4 z-[70] w-64 min-h-24 rounded-md border border-red-200 bg-red-50 p-4 shadow-xl">
        <p class="text-sm font-semibold text-red-700">Fechas no válidas</p>
        <p class="mt-1 text-sm leading-5 text-red-600">La próxima revisión debe ser posterior a la fecha del mantenimiento.</p>
      </div>
    }

    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por matrícula, tipo...">
      </div>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Coste</th>
              <th>Fecha</th>
              <th>Próximo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (m of filtered(); track m.id) {
              <tr>
                <td>
                  <p class="font-mono font-medium text-gray-900">{{ m.car.licensePlate }}</p>
                  <p class="text-xs text-gray-400">{{ m.car.brand }} {{ m.car.model }}</p>
                </td>
                <td class="text-gray-700">{{ m.type }}</td>
                <td class="text-sm text-gray-500 max-w-xs truncate">{{ m.description || '—' }}</td>
                <td class="text-gray-700">{{ m.cost != null ? (m.cost | number:'1.2-2') + ' €' : '—' }}</td>
                <td class="text-sm text-gray-600">{{ m.date | date:'dd/MM/yyyy' }}</td>
                <td class="text-sm text-gray-500">{{ m.nextDueDate ? (m.nextDueDate | date:'dd/MM/yyyy') : '—' }}</td>
                <td>
                  <button (click)="confirmDelete(m.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <lucide-icon [img]="Trash2" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="Wrench" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay registros de mantenimiento</p>
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
          <div class="modal-dialog bg-white rounded-2xl max-w-lg shadow-2xl">
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="text-base font-semibold text-gray-900">Nuevo mantenimiento</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="form-label">Vehículo *</label>
                  <select formControlName="carId" class="form-select" [class.form-field-error]="isInvalid('carId')">
                    <option [ngValue]="null" disabled>Seleccionar vehículo</option>
                    @for (c of carOptions(); track c.id) {
                      <option [ngValue]="c.id">{{ c.licensePlate }} — {{ c.brand }} {{ c.model }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-2">
                  <label class="form-label">Tipo *</label>
                  <input formControlName="type" class="form-input" [class.form-field-error]="isInvalid('type')"
                         maxlength="80" placeholder="Aceite, Neumáticos, ITV...">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Descripción</label>
                  <textarea formControlName="description" class="form-textarea" rows="2" maxlength="500"
                            [class.form-field-error]="isInvalid('description')"
                            placeholder="Detalles del mantenimiento..."></textarea>
                </div>
                <div>
                  <label class="form-label">Coste (€) *</label>
                  <input formControlName="cost" type="number" min="1.01" step="0.01"
                         class="form-input" [class.form-field-error]="isInvalid('cost')" placeholder="0.00">
                </div>
                <div>
                  <label class="form-label">Fecha *</label>
                  <input formControlName="date" type="date" class="form-input"
                         [class.form-field-error]="isInvalid('date') || dateRangeInvalid()">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Próxima revisión</label>
                  <input formControlName="nextDueDate" type="date" class="form-input"
                         [class.form-field-error]="dateRangeInvalid()">
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <app-button variant="secondary" (clicked)="closeModal()">Cancelar</app-button>
                <app-button type="button" [loading]="saving()" (clicked)="save()">Guardar</app-button>
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
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar registro?</h2>
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
export class MaintenanceListComponent implements OnInit {
  private maintenancesService = inject(MaintenancesService);
  private carsService = inject(CarsService);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Wrench = Wrench;
  readonly Search = Search;

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  maintenances = signal<Maintenance[]>([]);
  carOptions = signal<Car[]>([]);
  search = signal('');
  showModal = signal(false);
  deleteId = signal<number | null>(null);
  submitted = signal(false);

  form = this.fb.group({
    carId: [null as number | null, Validators.required],
    type: ['', [Validators.required, Validators.maxLength(80), Validators.pattern(/^.*\S.*$/)]],
    description: ['', [Validators.minLength(3), Validators.maxLength(500)]],
    cost: [null as number | null, [Validators.required, Validators.min(1.01)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    nextDueDate: [''],
  }, {
    validators: maintenanceDateRangeValidator,
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.maintenances().filter(m =>
      !q || m.car.licensePlate.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.load();
    this.carsService.getAll().subscribe({ next: data => this.carOptions.set(data) });
  }

  load() {
    this.maintenancesService.getAll().subscribe({
      next: data => { this.maintenances.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.submitted.set(false);
    this.form.reset({ date: new Date().toISOString().split('T')[0] });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.submitted.set(false); }

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  dateRangeInvalid() {
    return this.form.hasError('dateRange')
      && !!this.form.get('date')?.value
      && !!this.form.get('nextDueDate')?.value;
  }

  save() {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(control => control.markAsDirty());
      return;
    }
    this.saving.set(true);
    const v = this.form.value;
    this.maintenancesService.create({
      carId: v.carId!,
      type: v.type!,
      description: v.description?.trim() || undefined,
      cost: v.cost!,
      date: v.date!,
      nextDueDate: v.nextDueDate || undefined,
    } as Partial<Maintenance>).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.maintenancesService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.deleteId.set(null); this.load(); },
      error: () => this.deleting.set(false),
    });
  }
}
