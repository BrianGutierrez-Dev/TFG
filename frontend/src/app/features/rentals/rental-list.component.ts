import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Plus, Eye, FileText, Search, Trash2 } from 'lucide-angular';
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
        <input [value]="search()" (input)="setSearch($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por cliente, DNI, matrícula, marca...">
      </div>
      @for (s of statuses; track s.value) {
        <button [class]="'filter-tab ' + (statusFilter() === s.value ? 'filter-tab-active' : 'filter-tab-inactive')"
                (click)="setStatusFilter(s.value)">{{ s.label }}</button>
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
            @for (r of paginated(); track r.id) {
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
                  <button (click)="confirmDelete(r.id); $event.stopPropagation()" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <lucide-icon [img]="Trash2" [size]="14"></lucide-icon>
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
        @if (totalItems() > pageSize) {
          <div class="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
            <p class="text-sm text-gray-500">
              Mostrando {{ pageStart() }}-{{ pageEnd() }} de {{ totalItems() }}
            </p>
            <div class="flex items-center gap-2">
              <button type="button" class="filter-tab filter-tab-inactive"
                      [disabled]="currentPage() === 1"
                      [class.opacity-50]="currentPage() === 1"
                      [class.cursor-not-allowed]="currentPage() === 1"
                      (click)="previousPage()">Anterior</button>
              <span class="text-sm text-gray-500">Página {{ currentPage() }} de {{ totalPages() }}</span>
              <button type="button" class="filter-tab filter-tab-inactive"
                      [disabled]="currentPage() === totalPages()"
                      [class.opacity-50]="currentPage() === totalPages()"
                      [class.cursor-not-allowed]="currentPage() === totalPages()"
                      (click)="nextPage()">Siguiente</button>
            </div>
          </div>
        }
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
                <div class="col-span-2 relative">
                  <label class="form-label">Cliente *</label>
                  @if (selectedClient()) {
                    <div class="form-input flex items-center justify-between cursor-default">
                      <span class="text-gray-900">{{ selectedClient()!.name }}
                        <span class="ml-1 font-mono text-xs text-gray-400">{{ selectedClient()!.dni }}</span>
                      </span>
                      <button type="button" (click)="clearClient()"
                              class="ml-2 text-gray-400 hover:text-gray-700 leading-none">✕</button>
                    </div>
                  } @else {
                    <input type="text" class="form-input" [class.form-field-error]="isInvalid('clientId')"
                           placeholder="Buscar por nombre o DNI..."
                           [value]="clientQuery()"
                           (input)="onClientSearch($any($event.target).value)"
                           (focus)="showClientSuggestions.set(true)"
                           (blur)="onClientBlur()"
                           autocomplete="off">
                    @if (showClientSuggestions() && clientQuery().length > 0) {
                      <ul class="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                        @if (clientSuggestions().length > 0) {
                          @for (c of clientSuggestions(); track c.id) {
                            <li>
                              <button type="button" (mousedown)="selectClient(c)"
                                      class="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm">
                                <span class="font-medium text-gray-900">{{ c.name }}</span>
                                <span class="ml-2 font-mono text-xs text-gray-400">{{ c.dni }}</span>
                              </button>
                            </li>
                          }
                        } @else {
                          <li class="px-4 py-3 text-sm text-gray-400">Sin resultados</li>
                        }
                      </ul>
                    }
                  }
                </div>
                <div class="col-span-2 relative">
                  <label class="form-label">Vehículo *</label>
                  @if (selectedCar()) {
                    <div [class]="'form-input flex items-center justify-between cursor-default ' + (selectedCarUnavailable() ? 'form-field-error bg-gray-50 text-gray-400' : '')">
                      <span [class]="selectedCarUnavailable() ? 'text-gray-400' : 'text-gray-900'">
                        <span class="font-mono">{{ selectedCar()!.licensePlate }}</span>
                        <span class="ml-1">{{ selectedCar()!.brand }} {{ selectedCar()!.model }}</span>
                      </span>
                      <button type="button" (click)="clearCar()"
                              class="ml-2 text-gray-400 hover:text-gray-700 leading-none">✕</button>
                    </div>
                  } @else {
                    <input type="text" class="form-input" [class.form-field-error]="isInvalid('carId')"
                           placeholder="Buscar por matrícula o modelo..."
                           [value]="carQuery()"
                           (input)="onCarSearch($any($event.target).value)"
                           (focus)="showCarSuggestions.set(true)"
                           (blur)="onCarBlur()"
                           autocomplete="off">
                    @if (showCarSuggestions() && carQuery().length > 0) {
                      <ul class="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        @if (carSuggestions().length > 0) {
                          @for (c of carSuggestions(); track c.id) {
                            <li>
                              <button type="button"
                                      [disabled]="isCarUnavailable(c.id)"
                                      (mousedown)="selectCar(c)"
                                      [class]="'w-full text-left px-4 py-2.5 transition-colors text-sm ' + (isCarUnavailable(c.id) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-900')">
                                <span class="font-mono font-medium">{{ c.licensePlate }}</span>
                                <span class="ml-2">{{ c.brand }} {{ c.model }}</span>
                                @if (isCarUnavailable(c.id)) {
                                  <span class="ml-2 text-xs text-gray-400">No disponible</span>
                                }
                              </button>
                            </li>
                          }
                        } @else {
                          <li class="px-4 py-3 text-sm text-gray-400">Sin resultados</li>
                        }
                      </ul>
                    }
                  }
                  @if (selectedCarUnavailable()) {
                    <p class="mt-2 text-xs text-red-600">{{ selectedCarAvailabilityMessage() }}</p>
                  }
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
              @if (createError()) {
                <p class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ createError() }}</p>
              }
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <app-button variant="secondary" (clicked)="closeModal()">Cancelar</app-button>
                <app-button type="submit" [loading]="saving()" [disabled]="dateRangeInvalid() || selectedCarUnavailable()">Crear contrato</app-button>
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
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar contrato?</h2>
            <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            @if (deleteError()) {
              <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{{ deleteError() }}</p>
            }
            <div class="flex justify-end gap-3">
              <app-button variant="secondary" (clicked)="closeDeleteModal()">Cancelar</app-button>
              <app-button variant="danger" [loading]="deleting()" (clicked)="doDelete()">Eliminar</app-button>
            </div>
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
  readonly Trash2 = Trash2;

  statuses = [
    { value: '' as any, label: 'Todos' },
    { value: 'ACTIVE' as ContractStatus, label: 'Activos' },
    { value: 'COMPLETED' as ContractStatus, label: 'Completados' },
    { value: 'OVERDUE' as ContractStatus, label: 'Vencidos' },
    { value: 'CANCELLED' as ContractStatus, label: 'Cancelados' },
  ];

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  rentals = signal<RentalContract[]>([]);
  clientOptions = signal<Client[]>([]);
  carOptions = signal<Car[]>([]);
  search = signal('');
  statusFilter = signal<ContractStatus | ''>('');
  showModal = signal(false);
  deleteId = signal<number | null>(null);
  deleteError = signal<string | null>(null);
  createError = signal<string | null>(null);
  submitted = signal(false);
  readonly pageSize = 10;
  currentPage = signal(1);
  totalItems = signal(0);

  clientQuery = signal('');
  showClientSuggestions = signal(false);
  selectedClient = signal<Client | null>(null);
  carQuery = signal('');
  showCarSuggestions = signal(false);
  selectedCar = signal<Car | null>(null);
  clientSuggestions = computed(() => {
    const q = this.clientQuery().toLowerCase().trim();
    if (!q) return [];
    return this.clientOptions().filter(c =>
      c.name.toLowerCase().includes(q) || c.dni.toLowerCase().includes(q)
    ).slice(0, 8);
  });
  carSuggestions = computed(() => {
    const q = this.carQuery().toLowerCase().trim();
    if (!q) return [];
    return this.carOptions().filter(c =>
      c.licensePlate.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
    ).slice(0, 8);
  });

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
    return this.rentals();
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));
  paginated = computed(() => {
    return this.rentals();
  });
  pageStart = computed(() => this.totalItems() === 0 ? 0 : ((this.currentPage() - 1) * this.pageSize) + 1);
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalItems()));

  ngOnInit() {
    this.load();
    this.form.valueChanges.subscribe(() => this.createError.set(null));
  }

  setSearch(value: string) {
    this.search.set(value);
    this.currentPage.set(1);
    this.load();
  }

  setStatusFilter(status: ContractStatus | '') {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.load();
  }

  previousPage() {
    this.currentPage.update(page => Math.max(1, page - 1));
    this.load();
  }

  nextPage() {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
    this.load();
  }

  load() {
    this.rentalsService.getPage({
      page: this.currentPage(),
      limit: this.pageSize,
      search: this.search() || undefined,
      status: this.statusFilter() || undefined,
    }).subscribe({
      next: data => {
        this.rentals.set(data.items);
        this.totalItems.set(data.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form.reset({ totalPrice: null });
    this.createError.set(null);
    this.submitted.set(false);
    this.selectedClient.set(null);
    this.selectedCar.set(null);
    this.clientQuery.set('');
    this.carQuery.set('');
    this.showClientSuggestions.set(false);
    this.showCarSuggestions.set(false);
    this.clientsService.getAll().subscribe({ next: data => this.clientOptions.set(data) });
    this.carsService.getAll().subscribe({ next: data => this.carOptions.set(data) });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.createError.set(null);
    this.submitted.set(false);
    this.selectedClient.set(null);
    this.selectedCar.set(null);
    this.clientQuery.set('');
    this.carQuery.set('');
  }

  onClientSearch(value: string) {
    this.clientQuery.set(value);
    this.form.controls.clientId.setValue(null);
    this.selectedClient.set(null);
    this.showClientSuggestions.set(true);
  }

  selectClient(c: Client) {
    this.selectedClient.set(c);
    this.form.controls.clientId.setValue(c.id);
    this.showClientSuggestions.set(false);
    this.clientQuery.set('');
  }

  clearClient() {
    this.selectedClient.set(null);
    this.form.controls.clientId.setValue(null);
    this.clientQuery.set('');
  }

  onClientBlur() {
    setTimeout(() => this.showClientSuggestions.set(false), 150);
  }

  onCarSearch(value: string) {
    this.carQuery.set(value);
    this.form.controls.carId.setValue(null);
    this.selectedCar.set(null);
    this.showCarSuggestions.set(true);
  }

  selectCar(c: Car) {
    if (this.isCarUnavailable(c.id)) return;
    this.selectedCar.set(c);
    this.form.controls.carId.setValue(c.id);
    this.showCarSuggestions.set(false);
    this.carQuery.set('');
  }

  clearCar() {
    this.selectedCar.set(null);
    this.form.controls.carId.setValue(null);
    this.carQuery.set('');
  }

  onCarBlur() {
    setTimeout(() => this.showCarSuggestions.set(false), 150);
  }

  dateRangeInvalid() {
    return this.form.hasError('dateRange')
      && !!this.form.get('startDate')?.value
      && !!this.form.get('endDate')?.value;
  }

  isCarUnavailable(carId: number) {
    return this.findCarConflict(carId) !== null;
  }

  selectedCarUnavailable() {
    const carId = this.form.controls.carId.value;
    return carId ? this.isCarUnavailable(carId) : false;
  }

  selectedCarAvailabilityMessage() {
    const carId = this.form.controls.carId.value;
    const conflict = carId ? this.findCarConflict(carId) : null;
    if (!conflict) return '';
    const start = new Date(conflict.startDate).toLocaleDateString('es-ES');
    const end = new Date(conflict.endDate).toLocaleDateString('es-ES');
    return `No disponible: coincide con el contrato #${conflict.id} de ${conflict.client.name} (${start} - ${end}).`;
  }

  private findCarConflict(carId: number) {
    const startDate = this.form.controls.startDate.value;
    const endDate = this.form.controls.endDate.value;
    if (!startDate || !endDate || this.dateRangeInvalid()) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.rentals().find(r =>
      r.carId === carId
      && (r.status === 'ACTIVE' || r.status === 'OVERDUE')
      && start < new Date(r.endDate)
      && end > new Date(r.startDate)
    ) ?? null;
  }

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  save() {
    this.submitted.set(true);

    if (this.dateRangeInvalid()) {
      this.form.get('startDate')?.markAsTouched();
      this.form.get('startDate')?.markAsDirty();
      this.form.get('endDate')?.markAsTouched();
      this.form.get('endDate')?.markAsDirty();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(control => control.markAsDirty());
      return;
    }
    if (this.selectedCarUnavailable()) {
      this.createError.set(this.selectedCarAvailabilityMessage());
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
      error: (err) => {
        this.saving.set(false);
        this.createError.set(err?.error?.message ?? 'No se ha podido crear el contrato');
      },
    });
  }

  goToDetail(id: number) { this.router.navigate(['/rentals', id]); }

  confirmDelete(id: number) {
    this.deleteError.set(null);
    this.deleteId.set(id);
  }

  closeDeleteModal() {
    this.deleteId.set(null);
    this.deleteError.set(null);
  }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.rentalsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.closeDeleteModal(); this.load(); },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? 'No se ha podido eliminar el contrato');
      },
    });
  }
}
