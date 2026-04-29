import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, Car, Search } from 'lucide-angular';
import { CarsService } from '../../core/services/cars.service';
import { ClientsService } from '../../core/services/clients.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import type { Car as CarModel, Client } from '../../core/models';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent],
  template: `
    <app-page-header title="Vehículos" [subtitle]="cars().length + ' vehículos'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nuevo vehículo
      </app-button>
    </app-page-header>

    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="setSearch($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por matrícula, marca, modelo, año, color...">
      </div>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Color</th>
              <th>Propietario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (c of paginated(); track c.id) {
              <tr>
                <td class="font-mono font-medium text-gray-900">{{ c.licensePlate }}</td>
                <td class="text-gray-700">{{ c.brand }}</td>
                <td class="text-gray-700">{{ c.model }}</td>
                <td class="text-gray-500">{{ c.year }}</td>
                <td class="text-gray-500">{{ c.color || '—' }}</td>
                <td class="text-gray-500">{{ c.client?.name || '—' }}</td>
                <td class="space-x-0.5">
                  <button (click)="openEdit(c)" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <lucide-icon [img]="Pencil" [size]="14"></lucide-icon>
                  </button>
                  <button (click)="confirmDelete(c.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <lucide-icon [img]="Trash2" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="Car" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay vehículos</p>
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
              <h2 class="text-base font-semibold text-gray-900">{{ editingId() ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="form-label">Matrícula *</label>
                  <input formControlName="licensePlate" class="form-input font-mono uppercase"
                         [class.form-field-error]="isInvalid('licensePlate')"
                         maxlength="8" placeholder="0000 AAA">
                </div>
                <div>
                  <label class="form-label">Marca *</label>
                  <input formControlName="brand" class="form-input"
                         [class.form-field-error]="isInvalid('brand')"
                         maxlength="50" placeholder="Toyota">
                </div>
                <div>
                  <label class="form-label">Modelo *</label>
                  <input formControlName="model" class="form-input"
                         [class.form-field-error]="isInvalid('model')"
                         maxlength="50" placeholder="Corolla">
                </div>
                <div>
                  <label class="form-label">Año *</label>
                  <input formControlName="year" type="number" min="1900" [max]="maxVehicleYear"
                         class="form-input" [class.form-field-error]="isInvalid('year')" placeholder="2020">
                </div>
                <div>
                  <label class="form-label">Color</label>
                  <input formControlName="color" class="form-input" maxlength="30" placeholder="Blanco">
                </div>
                <div class="col-span-2 relative">
                  <label class="form-label">Propietario *</label>
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
              </div>
              @if (saveError()) {
                <p class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ saveError() }}</p>
              }
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
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Dar de baja vehículo?</h2>
            <p class="text-sm text-gray-500 mb-6">Se ocultará de los listados activos, pero se conservará su historial.</p>
            @if (deleteError()) {
              <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{{ deleteError() }}</p>
            }
            <div class="flex justify-end gap-3">
              <app-button variant="secondary" (clicked)="closeDeleteModal()">Cancelar</app-button>
              <app-button variant="danger" [loading]="deleting()" (clicked)="doDelete()">Dar de baja</app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CarListComponent implements OnInit {
  private carsService = inject(CarsService);
  private clientsService = inject(ClientsService);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Car = Car;
  readonly Search = Search;
  readonly maxVehicleYear = new Date().getFullYear() + 1;

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  saveError = signal<string | null>(null);
  cars = signal<CarModel[]>([]);
  clients = signal<Client[]>([]);
  search = signal('');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  deleteError = signal<string | null>(null);
  submitted = signal(false);
  readonly pageSize = 10;
  currentPage = signal(1);
  totalItems = signal(0);

  clientQuery = signal('');
  showClientSuggestions = signal(false);
  selectedClient = signal<Client | null>(null);
  clientSuggestions = computed(() => {
    const q = this.clientQuery().toLowerCase().trim();
    if (!q) return [];
    return this.clients().filter(c =>
      c.name.toLowerCase().includes(q) || c.dni.toLowerCase().includes(q)
    ).slice(0, 8);
  });

  form = this.fb.group({
    licensePlate: ['', [Validators.required, Validators.pattern(/^\d{4}\s?[A-Za-z]{3}$/)]],
    brand: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^.*\S.*$/)]],
    model: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^.*\S.*$/)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(this.maxVehicleYear)]],
    color: ['', Validators.maxLength(30)],
    clientId: [null as number | null, Validators.required],
  });

  filtered = computed(() => {
    return this.cars();
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));
  paginated = computed(() => {
    return this.cars();
  });
  pageStart = computed(() => this.totalItems() === 0 ? 0 : ((this.currentPage() - 1) * this.pageSize) + 1);
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalItems()));

  ngOnInit() {
    this.load();
    this.clientsService.getAll().subscribe({ next: data => this.clients.set(data) });
  }

  setSearch(value: string) {
    this.search.set(value);
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
    this.carsService.getPage({ page: this.currentPage(), limit: this.pageSize, search: this.search() || undefined }).subscribe({
      next: data => {
        this.cars.set(data.items);
        this.totalItems.set(data.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.submitted.set(false);
    this.saveError.set(null);
    this.selectedClient.set(null);
    this.clientQuery.set('');
    this.showClientSuggestions.set(false);
    this.form.reset({ year: new Date().getFullYear(), clientId: null });
    this.showModal.set(true);
  }

  openEdit(c: CarModel) {
    this.editingId.set(c.id);
    this.submitted.set(false);
    this.saveError.set(null);
    this.clientQuery.set('');
    this.showClientSuggestions.set(false);
    const owner = c.clientId ? (this.clients().find(cl => cl.id === c.clientId) ?? null) : null;
    this.selectedClient.set(owner);
    this.form.patchValue({ ...c, clientId: c.clientId ?? null });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.submitted.set(false);
    this.saveError.set(null);
    this.selectedClient.set(null);
    this.clientQuery.set('');
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

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  save() {
    this.submitted.set(true);
    this.saveError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(control => control.markAsDirty());
      return;
    }
    this.saving.set(true);
    const v = this.form.value;
    const data: Omit<Partial<CarModel>, 'clientId'> & { clientId: number } = {
      licensePlate: v.licensePlate!.replace(/\s/g, '').toUpperCase(),
      brand: v.brand!.trim(),
      model: v.model!.trim(),
      year: v.year!,
      color: v.color?.trim() || undefined,
      clientId: v.clientId!,
    };
    const op = this.editingId()
      ? this.carsService.update(this.editingId()!, data)
      : this.carsService.create(data);
    op.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message ?? 'No se ha podido guardar el vehículo');
      },
    });
  }

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
    this.carsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.closeDeleteModal(); this.load(); },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? 'No se ha podido dar de baja el vehículo');
      },
    });
  }
}
