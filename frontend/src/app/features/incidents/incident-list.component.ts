import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Plus, CheckCircle, Trash2, AlertTriangle, Search } from 'lucide-angular';
import { IncidentsService } from '../../core/services/incidents.service';
import { ClientsService } from '../../core/services/clients.service';
import { RentalsService } from '../../core/services/rentals.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { SeverityBadgeComponent, IncidentTypeBadgeComponent } from '../../shared/components/badge.component';
import type { Incident, Client, RentalContract, IncidentType, Severity } from '../../core/models';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent, SeverityBadgeComponent, IncidentTypeBadgeComponent],
  template: `
    <app-page-header title="Incidencias" [subtitle]="incidents().length + ' incidencias'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nueva incidencia
      </app-button>
    </app-page-header>

    <div class="flex items-center gap-3 mb-5 flex-wrap">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por cliente...">
      </div>
      <button [class]="'filter-tab ' + (resolvedFilter() === 'all' ? 'filter-tab-active' : 'filter-tab-inactive')" (click)="resolvedFilter.set('all')">Todas</button>
      <button [class]="'filter-tab ' + (resolvedFilter() === 'unresolved' ? 'filter-tab-active' : 'filter-tab-inactive')" (click)="resolvedFilter.set('unresolved')">Pendientes</button>
      <button [class]="'filter-tab ' + (resolvedFilter() === 'resolved' ? 'filter-tab-active' : 'filter-tab-inactive')" (click)="resolvedFilter.set('resolved')">Resueltas</button>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Gravedad</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (inc of filtered(); track inc.id) {
              <tr>
                <td>
                  <p class="font-medium text-gray-900">{{ inc.client.name }}</p>
                  <p class="text-xs text-gray-400">{{ inc.client.dni }}</p>
                </td>
                <td><app-incident-type-badge [type]="inc.type"></app-incident-type-badge></td>
                <td><app-severity-badge [severity]="inc.severity"></app-severity-badge></td>
                <td class="max-w-xs">
                  <p class="text-sm text-gray-600 truncate">{{ inc.description }}</p>
                </td>
                <td>
                  @if (inc.resolved) {
                    <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Resuelta</span>
                  } @else {
                    <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendiente</span>
                  }
                </td>
                <td class="text-sm text-gray-500">{{ inc.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="space-x-0.5">
                  @if (!inc.resolved) {
                    <button (click)="resolve(inc)" title="Marcar como resuelta"
                            class="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                      <lucide-icon [img]="CheckCircle" [size]="14"></lucide-icon>
                    </button>
                  }
                  <button (click)="confirmDelete(inc.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <lucide-icon [img]="Trash2" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="AlertTriangle" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay incidencias</p>
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
              <h2 class="text-base font-semibold text-gray-900">Nueva incidencia</h2>
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
                  <label class="form-label">Contrato (opcional)</label>
                  <select formControlName="contractId" class="form-select">
                    <option [ngValue]="null">Sin contrato</option>
                    @for (r of rentalOptions(); track r.id) {
                      <option [ngValue]="r.id">#{{ r.id }} — {{ r.car.licensePlate }} ({{ r.car.brand }} {{ r.car.model }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="form-label">Tipo *</label>
                  <select formControlName="type" class="form-select">
                    <option value="PAYMENT">Pago</option>
                    <option value="DAMAGE">Daños</option>
                    <option value="NOT_RETURNED">No devuelto</option>
                    <option value="LATE_RETURN">Devolución tardía</option>
                    <option value="THEFT">Robo</option>
                    <option value="ACCIDENT">Accidente</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Gravedad *</label>
                  <select formControlName="severity" class="form-select">
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
                <div class="col-span-2">
                  <label class="form-label">Descripción *</label>
                  <textarea formControlName="description" class="form-textarea" rows="3" placeholder="Describe la incidencia..."></textarea>
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
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar incidencia?</h2>
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
export class IncidentListComponent implements OnInit {
  private incidentsService = inject(IncidentsService);
  private clientsService = inject(ClientsService);
  private rentalsService = inject(RentalsService);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly CheckCircle = CheckCircle;
  readonly Trash2 = Trash2;
  readonly AlertTriangle = AlertTriangle;
  readonly Search = Search;

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  incidents = signal<Incident[]>([]);
  clientOptions = signal<Client[]>([]);
  rentalOptions = signal<RentalContract[]>([]);
  search = signal('');
  resolvedFilter = signal<'all' | 'resolved' | 'unresolved'>('all');
  showModal = signal(false);
  deleteId = signal<number | null>(null);

  form = this.fb.group({
    clientId: [null as number | null, Validators.required],
    contractId: [null as number | null],
    type: ['OTHER' as IncidentType, Validators.required],
    severity: ['MEDIUM' as Severity, Validators.required],
    description: ['', Validators.required],
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    const r = this.resolvedFilter();
    return this.incidents().filter(i => {
      const matchSearch = !q || i.client.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      const matchResolved = r === 'all' || (r === 'resolved' && i.resolved) || (r === 'unresolved' && !i.resolved);
      return matchSearch && matchResolved;
    });
  });

  ngOnInit() { this.load(); }

  load() {
    this.incidentsService.getAll().subscribe({
      next: data => { this.incidents.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form.reset({ type: 'OTHER', severity: 'MEDIUM' });
    this.clientsService.getAll().subscribe({ next: data => this.clientOptions.set(data) });
    this.rentalsService.getAll().subscribe({ next: data => this.rentalOptions.set(data) });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.incidentsService.create({
      clientId: v.clientId!,
      contractId: v.contractId ?? undefined,
      type: v.type as IncidentType,
      severity: v.severity as Severity,
      description: v.description!,
    }).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  resolve(inc: Incident) {
    this.incidentsService.resolve(inc.id).subscribe({
      next: () => this.incidents.update(list => list.map(i => i.id === inc.id ? { ...i, resolved: true } : i)),
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.incidentsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.deleteId.set(null); this.load(); },
      error: () => this.deleting.set(false),
    });
  }
}
