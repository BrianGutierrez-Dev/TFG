import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, ShieldAlert, ShieldOff, Users, Search } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { BlacklistedBadgeComponent } from '../../shared/components/badge.component';
import type { Client } from '../../core/models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent, BlacklistedBadgeComponent],
  template: `
    <app-page-header title="Clientes" [subtitle]="clients().length + ' registros'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nuevo cliente
      </app-button>
    </app-page-header>

    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="search.set($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por nombre, DNI...">
      </div>
      <button [class]="'filter-tab ' + (filter() === 'all' ? 'filter-tab-active' : 'filter-tab-inactive')" (click)="filter.set('all')">Todos</button>
      <button [class]="'filter-tab ' + (filter() === 'blacklisted' ? 'filter-tab-active' : 'filter-tab-inactive')" (click)="filter.set('blacklisted')">Blacklist</button>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Incidencias</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td class="font-medium text-gray-900">{{ c.name }}</td>
                <td class="font-mono text-sm text-gray-600">{{ c.dni }}</td>
                <td class="text-gray-500">{{ c.email }}</td>
                <td class="text-gray-500">{{ c.phone }}</td>
                <td>
                  @if (c.isBlacklisted) {
                    <app-blacklisted-badge></app-blacklisted-badge>
                  } @else {
                    <span class="text-xs text-gray-400">Normal</span>
                  }
                </td>
                <td><span class="text-sm text-gray-600">{{ c._count?.incidents ?? 0 }}</span></td>
                <td class="space-x-0.5">
                  <button (click)="toggleBlacklist(c)" [title]="c.isBlacklisted ? 'Quitar de Blacklist' : 'Añadir a Blacklist'"
                          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <lucide-icon [img]="c.isBlacklisted ? ShieldOff : ShieldAlert" [size]="14"></lucide-icon>
                  </button>
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
                  <lucide-icon [img]="Users" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay clientes</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Create / Edit modal -->
    @if (showModal()) {
      <div class="modal-overlay">
        <div class="modal-inner">
          <div class="modal-dialog bg-white rounded-2xl max-w-lg shadow-2xl">
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="text-base font-semibold text-gray-900">{{ editingId() ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="form-label">Nombre completo *</label>
                  <input formControlName="name" class="form-input" placeholder="Juan García López">
                </div>
                <div>
                  <label class="form-label">DNI / NIE *</label>
                  <input formControlName="dni" class="form-input" placeholder="12345678A">
                </div>
                <div>
                  <label class="form-label">Teléfono *</label>
                  <input formControlName="phone" class="form-input" placeholder="600 000 000">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Email *</label>
                  <input formControlName="email" type="email" class="form-input" placeholder="juan@email.com">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Dirección</label>
                  <input formControlName="address" class="form-input" placeholder="Calle Principal 1, Madrid">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Notas</label>
                  <textarea formControlName="notes" class="form-textarea" rows="2" placeholder="Observaciones..."></textarea>
                </div>
                <div class="col-span-2 flex items-center gap-2">
                  <input formControlName="isBlacklisted" type="checkbox" id="cb-blacklisted" class="w-4 h-4 rounded border-gray-300 accent-gray-900">
                  <label for="cb-blacklisted" class="text-sm text-gray-700 cursor-pointer">En Blacklist</label>
                </div>
                @if (form.get('isBlacklisted')?.value) {
                  <div class="col-span-2">
                    <label class="form-label">Razón de la Blacklist *</label>
                    <textarea formControlName="blacklistReason" class="form-textarea" rows="2"
                              placeholder="Motivo por el que se añade a la Blacklist..."></textarea>
                    @if (form.get('blacklistReason')?.invalid && form.get('blacklistReason')?.touched) {
                      <p class="text-xs text-red-500 mt-1">La razón es obligatoria al añadir a la Blacklist</p>
                    }
                  </div>
                }
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

    <!-- Blacklist reason modal -->
    @if (blacklistTarget()) {
      <div class="modal-overlay">
        <div class="modal-inner">
          <div class="modal-dialog bg-white rounded-2xl max-w-md shadow-2xl">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="ShieldAlert" [size]="15" class="text-red-600"></lucide-icon>
              </div>
              <h2 class="text-base font-semibold text-gray-900">Añadir a la Blacklist</h2>
            </div>
            <div class="p-6">
              <p class="text-sm text-gray-500 mb-4">
                Vas a bloquear a <span class="font-semibold text-gray-900">{{ blacklistTarget()!.name }}</span>.
                Indica el motivo (obligatorio).
              </p>
              <div>
                <label class="form-label">Razón *</label>
                <textarea [(ngModel)]="blacklistReasonText" class="form-textarea" rows="3"
                          placeholder="Describe el motivo del bloqueo..."></textarea>
              </div>
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <app-button variant="secondary" (clicked)="blacklistTarget.set(null)">Cancelar</app-button>
                <app-button variant="danger" [loading]="blacklisting()" (clicked)="confirmAddToBlacklist()">
                  Añadir a Blacklist
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Delete modal -->
    @if (deleteId()) {
      <div class="modal-overlay">
        <div class="modal-inner">
          <div class="modal-dialog bg-white rounded-2xl max-w-sm shadow-2xl p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-1">¿Eliminar cliente?</h2>
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
export class ClientListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly ShieldAlert = ShieldAlert;
  readonly ShieldOff = ShieldOff;
  readonly Users = Users;
  readonly Search = Search;

  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  blacklisting = signal(false);
  clients = signal<Client[]>([]);
  search = signal('');
  filter = signal<'all' | 'blacklisted'>('all');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  blacklistTarget = signal<Client | null>(null);
  blacklistReasonText = signal('');
  blacklistReasonError = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    dni: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: [''],
    notes: [''],
    isBlacklisted: [false],
    blacklistReason: [''],
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.clients().filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.dni.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchFilter = this.filter() === 'all' || (this.filter() === 'blacklisted' && c.isBlacklisted);
      return matchSearch && matchFilter;
    });
  });

  ngOnInit() { this.load(); }

  load() {
    this.clientsService.getAll().subscribe({
      next: data => { this.clients.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ isBlacklisted: false });
    this.showModal.set(true);
  }

  openEdit(c: Client) {
    this.editingId.set(c.id);
    this.form.patchValue(c);
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (this.form.get('isBlacklisted')?.value && !this.form.get('blacklistReason')?.value?.trim()) {
      this.form.get('blacklistReason')!.markAsTouched();
      return;
    }
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const data: Partial<Client> & { blacklistReason?: string } = {
      name: v.name!,
      email: v.email!,
      phone: v.phone!,
      dni: v.dni!,
      address: v.address || undefined,
      notes: v.notes || undefined,
      isBlacklisted: v.isBlacklisted ?? false,
    };
    if (v.isBlacklisted) data.blacklistReason = v.blacklistReason!;

    const op = this.editingId()
      ? this.clientsService.update(this.editingId()!, data)
      : this.clientsService.create(data);
    op.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  toggleBlacklist(c: Client) {
    if (c.isBlacklisted) {
      this.clientsService.update(c.id, { isBlacklisted: false }).subscribe({
        next: () => this.clients.update(list =>
          list.map(x => x.id === c.id ? { ...x, isBlacklisted: false, blacklistReason: undefined, blacklistedAt: undefined } : x)
        ),
      });
    } else {
      this.blacklistReasonText = '';
      this.blacklistTarget.set(c);
    }
  }

  confirmAddToBlacklist() {
    const c = this.blacklistTarget();
    if (!c || !this.blacklistReasonText.trim()) return;
    this.blacklisting.set(true);
    this.clientsService.update(c.id, { isBlacklisted: true, blacklistReason: this.blacklistReasonText.trim() } as any).subscribe({
      next: (updated) => {
        this.blacklisting.set(false);
        this.blacklistTarget.set(null);
        this.clients.update(list =>
          list.map(x => x.id === c.id ? { ...x, isBlacklisted: true, blacklistReason: this.blacklistReasonText.trim() } : x)
        );
      },
      error: () => this.blacklisting.set(false),
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  doDelete() {
    if (!this.deleteId()) return;
    this.deleting.set(true);
    this.clientsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.deleteId.set(null); this.load(); },
      error: () => this.deleting.set(false),
    });
  }
}
