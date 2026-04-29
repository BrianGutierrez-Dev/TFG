import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [ReactiveFormsModule, LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent, BlacklistedBadgeComponent],
  template: `
    <app-page-header title="Clientes" [subtitle]="clients().length + ' registros'">
      <app-button (clicked)="openCreate()">
        <lucide-icon [img]="Plus" [size]="14"></lucide-icon>
        Nuevo cliente
      </app-button>
    </app-page-header>

    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-sm">
        <lucide-icon [img]="Search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
        <input [value]="search()" (input)="setSearch($any($event.target).value)"
               class="form-input pl-9" placeholder="Buscar por nombre, DNI, email, teléfono...">
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
              <th>DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Incidencias</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (c of paginated(); track c.id) {
              <tr class="cursor-pointer" (click)="goToDetail(c.id)">
                <td class="font-medium text-gray-900">{{ c.name }}</td>
                <td class="font-mono text-sm text-gray-600">{{ c.dni }}</td>
                <td class="text-gray-500">{{ c.email }}</td>
                <td class="text-gray-500">{{ c.phone }}</td>
                <td>
                  @if (c.isBlacklisted) {
                    <app-blacklisted-badge></app-blacklisted-badge>
                  } @else if (c.wasBlacklisted) {
                    <span class="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Ex-blacklist</span>
                  } @else {
                    <span class="text-xs text-gray-400">Normal</span>
                  }
                </td>
                <td><span class="text-sm text-gray-600">{{ c._count?.incidents ?? 0 }}</span></td>
                <td class="space-x-0.5" (click)="$event.stopPropagation()">
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
        @if (filtered().length > pageSize) {
          <div class="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
            <p class="text-sm text-gray-500">
              Mostrando {{ pageStart() }}-{{ pageEnd() }} de {{ filtered().length }}
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
                  <input formControlName="name" class="form-input"
                         [class.form-field-error]="isInvalid('name')"
                         placeholder="Juan García López">
                </div>
                <div>
                  <label class="form-label">DNI / NIE *</label>
                  <input formControlName="dni" class="form-input"
                         [class.form-field-error]="isInvalid('dni')"
                         placeholder="12345678A">
                </div>
                <div>
                  <label class="form-label">Teléfono *</label>
                  <input formControlName="phone" class="form-input"
                         [class.form-field-error]="isInvalid('phone')"
                         placeholder="600 000 000">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Email *</label>
                  <input formControlName="email" type="email" class="form-input"
                         [class.form-field-error]="isInvalid('email')"
                         placeholder="juan@email.com">
                </div>
                <div class="col-span-2">
                  <label class="form-label">Dirección</label>
                  <input formControlName="address" class="form-input"
                         [class.form-field-error]="isInvalid('address')"
                         placeholder="Calle Principal 1, Madrid">
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
                              [class.form-field-error]="isBlacklistReasonInvalid()"
                              placeholder="Motivo por el que se añade a la Blacklist..."></textarea>
                    @if (isBlacklistReasonInvalid()) {
                      <p class="text-xs text-red-500 mt-1">La razón es obligatoria al añadir a la Blacklist</p>
                    }
                  </div>
                }
              </div>
              @if (saveError()) {
                <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">{{ saveError() }}</p>
              }
              <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
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
                <textarea #reasonInput
                          (input)="blacklistReasonText = reasonInput.value; blacklistReasonError.set(false)"
                          [class]="'form-textarea ' + (blacklistReasonError() ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '')"
                          rows="3" placeholder="Describe el motivo del bloqueo..."></textarea>
                @if (blacklistReasonError()) {
                  <p class="text-xs text-red-500 mt-1">La razón es obligatoria</p>
                }
              </div>
              @if (blacklistApiError()) {
                <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">{{ blacklistApiError() }}</p>
              }
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <app-button variant="secondary" (clicked)="blacklistTarget.set(null); blacklistReasonError.set(false); blacklistApiError.set(null)">Cancelar</app-button>
                <app-button variant="danger" [loading]="blacklisting()" (clicked)="confirmAddToBlacklist()">
                  Añadir a Blacklist
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Unblacklist confirmation modal -->
    @if (unblacklistTarget()) {
      <div class="modal-overlay">
        <div class="modal-inner">
          <div class="modal-dialog bg-white rounded-2xl max-w-sm shadow-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="ShieldOff" [size]="16" class="text-amber-600"></lucide-icon>
              </div>
              <h2 class="text-base font-semibold text-gray-900">¿Quitar de la Blacklist?</h2>
            </div>
            <p class="text-sm text-gray-500 mb-6">
              Vas a quitar a <span class="font-semibold text-gray-900">{{ unblacklistTarget()!.name }}</span> de la lista negra.
              Podrá volver a alquilar vehículos con normalidad.
            </p>
            <div class="flex justify-end gap-3">
              <app-button variant="secondary" (clicked)="unblacklistTarget.set(null)">Cancelar</app-button>
              <app-button variant="warning" [loading]="blacklisting()" (clicked)="confirmRemoveFromBlacklist()">Quitar de Blacklist</app-button>
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
export class ClientListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private router = inject(Router);
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
  saveError = signal<string | null>(null);
  clients = signal<Client[]>([]);
  search = signal('');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  deleteError = signal<string | null>(null);
  blacklistTarget = signal<Client | null>(null);
  unblacklistTarget = signal<Client | null>(null);
  blacklistReasonText = '';
  blacklistReasonError = signal(false);
  blacklistApiError = signal<string | null>(null);
  submitted = signal(false);
  readonly pageSize = 10;
  currentPage = signal(1);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}[A-Za-z]$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    address: ['', Validators.minLength(5)],
    notes: [''],
    isBlacklisted: [false],
    blacklistReason: [''],
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.clients().filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.dni.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
      return matchSearch;
    });
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });
  pageStart = computed(() => this.filtered().length === 0 ? 0 : ((this.currentPage() - 1) * this.pageSize) + 1);
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.filtered().length));

  ngOnInit() { this.load(); }

  goToDetail(id: number) { this.router.navigate(['/clients', id]); }

  setSearch(value: string) {
    this.search.set(value);
    this.currentPage.set(1);
  }

  previousPage() {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  nextPage() {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }

  load() {
    this.clientsService.getAll().subscribe({
      next: data => { this.clients.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.submitted.set(false);
    this.saveError.set(null);
    this.form.reset({ isBlacklisted: false });
    this.showModal.set(true);
  }

  openEdit(c: Client) {
    this.editingId.set(c.id);
    this.submitted.set(false);
    this.saveError.set(null);
    this.form.patchValue(c);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.saveError.set(null);
    this.submitted.set(false);
  }

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  isBlacklistReasonInvalid() {
    const control = this.form.controls.blacklistReason;
    return !!this.form.controls.isBlacklisted.value
      && !control.value?.trim()
      && (control.touched || control.dirty || this.submitted());
  }

  save() {
    this.submitted.set(true);
    this.saveError.set(null);
    if (this.form.invalid || this.isBlacklistReasonInvalid()) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(control => control.markAsDirty());
      return;
    }
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

    this.saveError.set(null);
    const op = this.editingId()
      ? this.clientsService.update(this.editingId()!, data)
      : this.clientsService.create(data);
    op.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: (err) => { this.saving.set(false); this.saveError.set(err?.error?.message ?? 'Error al guardar'); },
    });
  }

  toggleBlacklist(c: Client) {
    if (c.isBlacklisted) {
      this.unblacklistTarget.set(c);
    } else {
      this.blacklistReasonText = '';
      this.blacklistReasonError.set(false);
      this.blacklistApiError.set(null);
      this.blacklistTarget.set(c);
    }
  }

  confirmRemoveFromBlacklist() {
    const c = this.unblacklistTarget();
    if (!c) return;
    this.blacklisting.set(true);
    this.clientsService.update(c.id, { isBlacklisted: false }).subscribe({
      next: () => {
        this.blacklisting.set(false);
        this.unblacklistTarget.set(null);
        this.clients.update(list =>
          list.map(x => x.id === c.id ? { ...x, isBlacklisted: false, blacklistReason: undefined, blacklistedAt: undefined } : x)
        );
      },
      error: () => this.blacklisting.set(false),
    });
  }

  confirmAddToBlacklist() {
    const c = this.blacklistTarget();
    if (!c) return;
    if (!this.blacklistReasonText.trim()) {
      this.blacklistReasonError.set(true);
      return;
    }
    const reason = this.blacklistReasonText.trim();
    this.blacklisting.set(true);
    this.clientsService.update(c.id, { isBlacklisted: true, blacklistReason: reason } as any).subscribe({
      next: () => {
        this.blacklisting.set(false);
        this.blacklistTarget.set(null);
        this.clients.update(list =>
          list.map(x => x.id === c.id ? { ...x, isBlacklisted: true, blacklistReason: reason } : x)
        );
      },
      error: (err: any) => {
        this.blacklisting.set(false);
        this.blacklistApiError.set(err?.error?.message ?? 'Error al guardar. Inténtalo de nuevo.');
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
    this.clientsService.delete(this.deleteId()!).subscribe({
      next: () => { this.deleting.set(false); this.closeDeleteModal(); this.load(); },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? 'No se ha podido eliminar el cliente');
      },
    });
  }
}
