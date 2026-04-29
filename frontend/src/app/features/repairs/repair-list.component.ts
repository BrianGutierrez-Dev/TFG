import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Plus, Pencil, Trash2, Hammer, Search } from 'lucide-angular';
import { RepairsService } from '../../core/services/repairs.service';
import { CarsService } from '../../core/services/cars.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { RepairBadgeComponent } from '../../shared/components/badge.component';
import type { Repair, Car, RepairStatus } from '../../core/models';

function repairDateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) return null;

  return new Date(endDate) < new Date(startDate) ? { dateRange: true } : null;
}

@Component({
  selector: 'app-repair-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent, RepairBadgeComponent],
  template: `
    <app-page-header title="Reparaciones" [subtitle]="repairs().length + ' reparaciones'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nueva reparación
      </app-button>
    </app-page-header>

    @if (showModal() && dateRangeInvalid()) {
      <div class="fixed left-4 top-4 z-[70] w-64 min-h-24 rounded-md border border-red-200 bg-red-50 p-4 shadow-xl">
        <p class="text-sm font-semibold text-red-700">Fechas no válidas</p>
        <p class="mt-1 text-sm leading-5 text-red-600">La fecha fin no puede ser anterior a la fecha inicio.</p>
      </div>
    }

    <div class="flex items-center gap-3 mb-5 flex-wrap">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por matrícula, marca, modelo, descripción...">
      </div>
      @for (s of statuses; track s.value) {
        <button [class]="'filter-tab ' + (statusFilter() === s.value ? 'filter-tab-active' : 'filter-tab-inactive')"
                (click)="statusFilter.set(s.value)">{{ s.label }}</button>
      }
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Coste</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (r of filtered(); track r.id) {
              <tr>
                <td>
                  <p class="font-mono font-medium text-gray-900">{{ r.car.licensePlate }}</p>
                  <p class="text-xs text-gray-400">{{ r.car.brand }} {{ r.car.model }}</p>
                </td>
                <td class="text-sm text-gray-600 max-w-xs truncate">{{ r.description }}</td>
                <td><app-repair-badge [status]="r.status"></app-repair-badge></td>
                <td class="text-gray-700">{{ r.cost != null ? (r.cost | number:'1.2-2') + ' €' : '—' }}</td>
                <td class="text-sm text-gray-500">{{ r.startDate ? (r.startDate | date:'dd/MM/yyyy') : '—' }}</td>
                <td class="text-sm text-gray-500">{{ r.endDate ? (r.endDate | date:'dd/MM/yyyy') : '—' }}</td>
                <td class="space-x-0.5">
                  <button (click)="openEdit(r)" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <lucide-icon [img]="Pencil" [size]="14"></lucide-icon>
                  </button>
                  <button (click)="confirmDelete(r.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <lucide-icon [img]="Trash2" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="Hammer" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay reparaciones</p>
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
              <h2 class="text-base font-semibold text-gray-900">{{ editingId() ? 'Editar reparación' : 'Nueva reparación' }}</h2>
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
                  <label class="form-label">Descripción *</label>
                  <textarea formControlName="description" class="form-textarea" rows="2" maxlength="500"
                            [class.form-field-error]="isInvalid('description')"
                            placeholder="Describe la reparación..."></textarea>
                </div>
                <div>
                  <label class="form-label">Estado</label>
                  <select formControlName="status" class="form-select">
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En proceso</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Coste (€) *</label>
                  <input formControlName="cost" type="number" min="1.01" step="0.01"
                         class="form-input" [class.form-field-error]="isInvalid('cost')" placeholder="0.00">
                </div>
                <div>
                  <label class="form-label">Fecha inicio</label>
                  <input formControlName="startDate" type="date" class="form-input"
                         [class.form-field-error]="dateRangeInvalid()">
                </div>
                <div>
                  <label class="form-label">Fecha fin</label>
                  <input formControlName="endDate" type="date" class="form-input"
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
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar reparación?</h2>
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
export class RepairListComponent implements OnInit {
  private repairsService = inject(RepairsService);
  private carsService = inject(CarsService);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Hammer = Hammer;
  readonly Search = Search;

  statuses = [
    { value: '' as any, label: 'Todas' },
    { value: 'PENDING' as RepairStatus, label: 'Pendientes' },
    { value: 'IN_PROGRESS' as RepairStatus, label: 'En proceso' },
    { value: 'COMPLETED' as RepairStatus, label: 'Completadas' },
    { value: 'CANCELLED' as RepairStatus, label: 'Canceladas' },
  ];

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  repairs = signal<Repair[]>([]);
  carOptions = signal<Car[]>([]);
  search = signal('');
  statusFilter = signal<RepairStatus | ''>('');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  submitted = signal(false);

  form = this.fb.group({
    carId: [null as number | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
    status: ['PENDING' as RepairStatus],
    cost: [null as number | null, [Validators.required, Validators.min(1.01)]],
    startDate: [''],
    endDate: [''],
  }, {
    validators: repairDateRangeValidator,
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    const s = this.statusFilter();
    return this.repairs().filter(r => {
      const matchSearch = !q || r.car.licensePlate.toLowerCase().includes(q) || r.car.brand.toLowerCase().includes(q) || r.car.model.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchStatus = !s || r.status === s;
      return matchSearch && matchStatus;
    });
  });

  ngOnInit() {
    this.load();
    this.carsService.getAll().subscribe({ next: data => this.carOptions.set(data) });
  }

  load() {
    this.repairsService.getAll().subscribe({
      next: data => { this.repairs.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.submitted.set(false);
    this.form.reset({ status: 'PENDING' });
    this.showModal.set(true);
  }

  openEdit(r: Repair) {
    this.editingId.set(r.id);
    this.submitted.set(false);
    this.form.patchValue({
      carId: r.carId,
      description: r.description,
      status: r.status,
      cost: r.cost ?? null,
      startDate: r.startDate?.split('T')[0] ?? '',
      endDate: r.endDate?.split('T')[0] ?? '',
    });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.submitted.set(false); }

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  dateRangeInvalid() {
    return this.form.hasError('dateRange')
      && !!this.form.get('startDate')?.value
      && !!this.form.get('endDate')?.value;
  }

  save() {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(control => control.markAsDirty());
      return;
    }
    this.saving.set(true);
    const raw = this.form.value;
    const v: Partial<Repair> = {
      carId: raw.carId!,
      description: raw.description!.trim(),
      status: raw.status as RepairStatus,
      cost: raw.cost!,
      startDate: raw.startDate || undefined,
      endDate: raw.endDate || undefined,
    };
    const op = this.editingId()
      ? this.repairsService.update(this.editingId()!, v)
      : this.repairsService.create(v);
    op.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.repairsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.deleteId.set(null); this.load(); },
      error: () => this.deleting.set(false),
    });
  }
}
