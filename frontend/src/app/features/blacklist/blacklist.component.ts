import { Component, inject, signal, OnInit } from '@angular/core';
import { LucideAngularModule, ShieldAlert, ShieldOff } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import type { Client } from '../../core/models';

@Component({
  selector: 'app-blacklist',
  standalone: true,
  imports: [LucideAngularModule, SpinnerComponent, PageHeaderComponent, ButtonComponent],
  template: `
    <app-page-header title="Lista Negra" [subtitle]="clients().length + ' clientes bloqueados'"></app-page-header>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Incidencias</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (c of clients(); track c.id) {
              <tr>
                <td class="font-medium text-gray-900">{{ c.name }}</td>
                <td class="font-mono text-sm">{{ c.dni }}</td>
                <td class="text-gray-500">{{ c.email }}</td>
                <td class="text-gray-500">{{ c.phone }}</td>
                <td><span class="text-sm font-medium text-gray-700">{{ c._count?.incidents ?? 0 }}</span></td>
                <td>
                  <app-button variant="secondary" size="sm" [loading]="removingId() === c.id" (clicked)="removeFromBlacklist(c)">
                    <lucide-icon [img]="ShieldOff" [size]="13"></lucide-icon>
                    Quitar
                  </app-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="text-center py-14 text-gray-400">
                  <lucide-icon [img]="ShieldAlert" [size]="32" class="mx-auto mb-2 opacity-20"></lucide-icon>
                  <p class="text-sm">No hay clientes en la lista negra</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class BlacklistComponent implements OnInit {
  private clientsService = inject(ClientsService);

  readonly ShieldAlert = ShieldAlert;
  readonly ShieldOff = ShieldOff;

  loading = signal(true);
  clients = signal<Client[]>([]);
  removingId = signal<number | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.clientsService.getAll({ blacklisted: true }).subscribe({
      next: data => { this.clients.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  removeFromBlacklist(c: Client) {
    this.removingId.set(c.id);
    this.clientsService.update(c.id, { isBlacklisted: false }).subscribe({
      next: () => {
        this.clients.update(list => list.filter(x => x.id !== c.id));
        this.removingId.set(null);
      },
      error: () => this.removingId.set(null),
    });
  }
}
