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
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por matrícula, marca...">
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
            @for (c of filtered(); track c.id) {
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
      </div>
    }

    @if (showModal()) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900">{{ editingId() ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="form-label">Matrícula *</label>
                <input formControlName="licensePlate" class="form-input font-mono uppercase" placeholder="0000 AAA">
              </div>
              <div>
                <label class="form-label">Marca *</label>
                <input formControlName="brand" class="form-input" placeholder="Toyota">
              </div>
              <div>
                <label class="form-label">Modelo *</label>
                <input formControlName="model" class="form-input" placeholder="Corolla">
              </div>
              <div>
                <label class="form-label">Año *</label>
                <input formControlName="year" type="number" class="form-input" placeholder="2020">
              </div>
              <div>
                <label class="form-label">Color</label>
                <input formControlName="color" class="form-input" placeholder="Blanco">
              </div>
              <div class="col-span-2">
                <label class="form-label">Propietario</label>
                <select formControlName="clientId" class="form-select">
                  <option [ngValue]="null">Sin propietario</option>
                  @for (client of clients(); track client.id) {
                    <option [ngValue]="client.id">{{ client.name }} — {{ client.dni }}</option>
                  }
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
    }

    @if (deleteId()) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar vehículo?</h2>
          <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
          <div class="flex justify-end gap-3">
            <app-button variant="secondary" (clicked)="deleteId.set(null)">Cancelar</app-button>
            <app-button variant="danger" [loading]="deleting()" (clicked)="doDelete()">Eliminar</app-button>
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

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  cars = signal<CarModel[]>([]);
  clients = signal<Client[]>([]);
  search = signal('');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  form = this.fb.group({
    licensePlate: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    color: [''],
    clientId: [null as number | null],
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.cars().filter(c =>
      !q || c.licensePlate.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.load();
    this.clientsService.getAll().subscribe({ next: data => this.clients.set(data) });
  }

  load() {
    this.carsService.getAll().subscribe({
      next: data => { this.cars.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ year: new Date().getFullYear(), clientId: null });
    this.showModal.set(true);
  }

  openEdit(c: CarModel) {
    this.editingId.set(c.id);
    this.form.patchValue({ ...c, clientId: c.clientId ?? null });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value as Partial<CarModel>;
    const op = this.editingId()
      ? this.carsService.update(this.editingId()!, data)
      : this.carsService.create(data);
    op.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.carsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.deleteId.set(null); this.load(); },
      error: () => this.deleting.set(false),
    });
  }
}
