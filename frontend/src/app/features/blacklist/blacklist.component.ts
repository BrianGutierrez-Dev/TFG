import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Ban, ShieldOff, ShieldAlert, UserX } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import type { Client } from '../../core/models';

@Component({
  selector: 'app-blacklist',
  standalone: true,
  imports: [DatePipe, LucideAngularModule, SpinnerComponent],
  template: `
    <div class="-mx-6 -mt-6 -mb-6 min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-gray-700 to-gray-900 px-6 pt-0 pb-16">

      <!-- Header -->
      <div class="border-b border-red-900/40 px-0 pt-10 pb-8 mb-10">
        <div class="flex items-end justify-between">
          <div>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center">
                <lucide-icon [img]="ShieldAlert" [size]="20" class="text-red-500"></lucide-icon>
              </div>
              <h1 class="text-4xl font-black text-white tracking-tight">BLACKLIST</h1>
            </div>
            <p class="text-gray-500 text-sm font-medium">
              Acceso denegado &mdash;
              <span class="text-red-500 font-semibold">{{ clients().length }}</span>
              {{ clients().length === 1 ? 'cliente bloqueado' : 'clientes bloqueados' }}
            </p>
          </div>

          <div class="text-right hidden sm:block">
            <p class="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-1">Estado del sistema</p>
            <div class="flex items-center gap-2 justify-end">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span class="text-red-400 text-sm font-semibold">ACTIVO</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      @if (loading()) {
        <div class="flex justify-center pt-20">
          <app-spinner></app-spinner>
        </div>
      } @else if (clients().length === 0) {
        <div class="flex flex-col items-center justify-center pt-24 text-center">
          <div class="w-20 h-20 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-5">
            <lucide-icon [img]="ShieldOff" [size]="36" class="text-gray-700"></lucide-icon>
          </div>
          <p class="text-gray-500 text-base font-medium">No hay clientes bloqueados</p>
          <p class="text-gray-700 text-sm mt-1">La blacklist está vacía</p>
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (c of clients(); track c.id) {
            <div class="group relative bg-gray-900 rounded-2xl border border-gray-800 border-l-4 border-l-red-600 overflow-hidden transition-all duration-200 hover:border-gray-700 hover:border-l-red-500 hover:shadow-2xl hover:shadow-red-950/30">

              <!-- Top strip -->
              <div class="bg-red-950/30 border-b border-red-900/30 px-5 py-2 flex items-center justify-between">
                <span class="text-red-500 text-xs font-bold uppercase tracking-widest">Bloqueado</span>
                <div class="flex items-center gap-2">
                  @if (c.blacklistedAt) {
                    <span class="text-gray-600 text-xs">{{ c.blacklistedAt | date:'dd/MM/yyyy' }}</span>
                  }
                  <lucide-icon [img]="Ban" [size]="13" class="text-red-600"></lucide-icon>
                </div>
              </div>

              <div class="p-5 flex flex-col gap-4">

                <!-- Identity -->
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <lucide-icon [img]="UserX" [size]="18" class="text-gray-400"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-white font-bold text-lg leading-tight truncate">{{ c.name }}</p>
                    <p class="text-gray-500 font-mono text-sm mt-0.5">{{ c.dni }}</p>
                  </div>
                </div>

                <!-- Reason -->
                <div class="bg-gray-950/60 rounded-xl border border-gray-800 px-4 py-3">
                  <p class="text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">Motivo</p>
                  @if (c.blacklistReason) {
                    <p class="text-gray-300 text-sm leading-relaxed">{{ c.blacklistReason }}</p>
                  } @else {
                    <p class="text-gray-600 text-sm italic">Sin motivo registrado</p>
                  }
                </div>

                <!-- Action -->
                <button
                  (click)="removeFromBlacklist(c)"
                  [disabled]="removingId() === c.id"
                  class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium transition-all duration-150 hover:border-gray-500 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  @if (removingId() === c.id) {
                    <span class="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin"></span>
                    Quitando...
                  } @else {
                    <lucide-icon [img]="ShieldOff" [size]="14"></lucide-icon>
                    Quitar de la Blacklist
                  }
                </button>

              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
})
export class BlacklistComponent implements OnInit {
  private clientsService = inject(ClientsService);

  readonly ShieldAlert = ShieldAlert;
  readonly ShieldOff = ShieldOff;
  readonly Ban = Ban;
  readonly UserX = UserX;

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
