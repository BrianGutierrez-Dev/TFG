import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Plus, Eye, FileText, Search } from 'lucide-angular';
import { RentalsService } from '../../core/services/rentals.service';
import { ClientsService } from '../../core/services/clients.service';
import { CarsService } from '../../core/services/cars.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { ContractBadgeComponent } from '../../shared/components/badge.component';
import type { RentalContract, Client, Car, ContractStatus } from '../../core/models';

function contractDateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) return null;

  return new Date(endDate) <= new Date(startDate) ? { dateRange: true } : null;
}

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent, ContractBadgeComponent],
  template: `
    <app-page-header title="Contratos" [subtitle]="rentals().length + ' contratos'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nuevo contrato
      </app-button>
    </app-page-header>

    @if (showModal() && dateRangeInvalid()) {
      <div class="fixed left-4 top-4 z-[70] w-64 min-h-24 rounded-md border border-red-200 bg-red-50 p-4 shadow-xl">
        <p class="text-sm font-semibold text-red-700">Fechas no válidas</p>
        <p class="mt-1 text-sm leading-5 text-red-600">La fecha fin debe ser posterior a la fecha inicio.</p>
      </div>
    }

    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por cliente, DNI, matrícula, marca...">
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
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (r of filtered(); track r.id) {
              <tr class="cursor-pointer" (click)="goToDetail(r.id)">
                <td>
                  <p class="font-medium text-gray-900">{{ r.client.name }}</p>
                  <p class="text-xs text-gray-400">{{ r.client.dni }}</p>
                </td>
                <td>
                  <p class="font-mono text-sm text-gray-900">{{ r.car.licensePlate }}</p>
                  <p class="text-xs text-gray-400">{{ r.car.brand }} {{ r.car.model }}</p>
                </td>
                <td class="text-sm text-gray-600">{{ r.startDate | date:'dd/MM/yyyy' }}</td>
                <td class="text-sm text-gray-600">{{ r.endDate | date:'dd/MM/yyyy' }}</td>
                <td><app-contract-badge [status]="r.status"></app-contract-badge></td>
                <td class="font-medium text-gray-900">{{ r.totalPrice | number:'1.2-2' }} €</td>
                <td>
                  <button (click)="goToDetail(r.id); $event.stopPropagation()" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <lucide-icon [img]="Eye" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="FileText" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay contratos</p>
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
              <h2 class="text-base font-semibold text-gray-900">Nuevo contrato</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="form-label">Cliente *</label>
                  <select formControlName="clientId" class="form-select">
                    <option [ngValue]="null" disabled>Seleccionar cliente</option>
                    @for (c of clientOptions(); track c.id) {
                      <option [ngValue]="c.id">{{ c.name }} — {{ c.dni }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-2">
                  <label class="form-label">Vehículo *</label>
                  <select formControlName="carId" class="form-select">
                    <option [ngValue]="null" disabled>Seleccionar vehículo</option>
                    @for (c of carOptions(); track c.id) {
                      <option [ngValue]="c.id">{{ c.licensePlate }} — {{ c.brand }} {{ c.model }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="form-label">Fecha inicio *</label>
                  <input formControlName="startDate" type="date" class="form-input" [class.form-field-error]="dateRangeInvalid()">
                </div>
                <div>
                  <label class="form-label">Fecha fin *</label>
                  <input formControlName="endDate" type="date" class="form-input" [class.form-field-error]="dateRangeInvalid()">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Precio total (€) *</label>
                  <input formControlName="totalPrice" type="number" min="0.01" step="0.01" class="form-input" placeholder="0.00">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Notas</label>
                  <textarea formControlName="notes" class="form-textarea" rows="2" placeholder="Observaciones..."></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <app-button variant="secondary" (clicked)="closeModal()">Cancelar</app-button>
                <app-button type="submit" [loading]="saving()" [disabled]="dateRangeInvalid()">Crear contrato</app-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class RentalListComponent implements OnInit {
  private rentalsService = inject(RentalsService);
  private clientsService = inject(ClientsService);
  private carsService = inject(CarsService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Eye = Eye;
  readonly FileText = FileText;
  readonly Search = Search;

  statuses = [
    { value: '' as any, label: 'Todos' },
    { value: 'ACTIVE' as ContractStatus, label: 'Activos' },
    { value: 'COMPLETED' as ContractStatus, label: 'Completados' },
    { value: 'OVERDUE' as ContractStatus, label: 'Vencidos' },
    { value: 'CANCELLED' as ContractStatus, label: 'Cancelados' },
  ];

  loading = signal(true);
  saving = signal(false);
  rentals = signal<RentalContract[]>([]);
  clientOptions = signal<Client[]>([]);
  carOptions = signal<Car[]>([]);
  search = signal('');
  statusFilter = signal<ContractStatus | ''>('');
  showModal = signal(false);

  form = this.fb.group({
    clientId: [null as number | null, Validators.required],
    carId: [null as number | null, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    totalPrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    notes: [''],
  }, {
    validators: contractDateRangeValidator,
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    const s = this.statusFilter();
    return this.rentals().filter(r => {
      const matchSearch = !q || r.client.name.toLowerCase().includes(q) || r.client.dni.toLowerCase().includes(q) || r.car.licensePlate.toLowerCase().includes(q) || r.car.brand.toLowerCase().includes(q) || r.car.model.toLowerCase().includes(q);
      const matchStatus = !s || r.status === s;
      return matchSearch && matchStatus;
    });
  });

  ngOnInit() { this.load(); }

  load() {
    this.rentalsService.getAll().subscribe({
      next: data => { this.rentals.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form.reset({ totalPrice: null });
    this.clientsService.getAll().subscribe({ next: data => this.clientOptions.set(data) });
    this.carsService.getAll().subscribe({ next: data => this.carOptions.set(data) });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  dateRangeInvalid() {
    return this.form.hasError('dateRange')
      && !!this.form.get('startDate')?.value
      && !!this.form.get('endDate')?.value;
  }

  save() {
    if (this.dateRangeInvalid()) {
      this.form.get('startDate')?.markAsTouched();
      this.form.get('startDate')?.markAsDirty();
      this.form.get('endDate')?.markAsTouched();
      this.form.get('endDate')?.markAsDirty();
      return;
    }

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }
    this.saving.set(true);
    const v = this.form.value;
    this.rentalsService.create({
      clientId: v.clientId!,
      carId: v.carId!,
      startDate: v.startDate!,
      endDate: v.endDate!,
      totalPrice: v.totalPrice!,
      notes: v.notes || undefined,
    }).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  goToDetail(id: number) { this.router.navigate(['/rentals', id]); }
}
