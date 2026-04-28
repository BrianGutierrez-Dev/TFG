import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, Users, Car, FileText, AlertTriangle, ShieldAlert, Wrench, Clock, OctagonAlert } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { CarsService } from '../../core/services/cars.service';
import { RentalsService } from '../../core/services/rentals.service';
import { IncidentsService } from '../../core/services/incidents.service';
import { RepairsService } from '../../core/services/repairs.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import type { RentalContract } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, SpinnerComponent, PageHeaderComponent, DatePipe],
  template: `
    <app-page-header title="Panel" subtitle="Resumen general del sistema"></app-page-header>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <a routerLink="/clients" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Clientes</span>
            <lucide-icon [img]="Users" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().clients }}</p>
        </a>
        <a routerLink="/blacklist" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Lista Negra</span>
            <lucide-icon [img]="ShieldAlert" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().blacklisted }}</p>
        </a>
        <a routerLink="/cars" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Vehículos</span>
            <lucide-icon [img]="Car" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().cars }}</p>
        </a>
        <a routerLink="/rentals" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Contratos activos</span>
            <lucide-icon [img]="FileText" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().activeRentals }}</p>
        </a>
        <a routerLink="/incidents" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Incidencias</span>
            <lucide-icon [img]="AlertTriangle" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().unresolvedIncidents }}</p>
        </a>
        <a routerLink="/repairs" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Reparaciones</span>
            <lucide-icon [img]="Wrench" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().pendingRepairs }}</p>
        </a>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <!-- Pendientes de devolver -->
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-4">
            <lucide-icon [img]="Clock" [size]="16" class="text-blue-500"></lucide-icon>
            <h2 class="text-sm font-semibold text-gray-700">Devoluciones de hoy</h2>
            <span class="ml-auto text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{{ activeRentals().length }}</span>
          </div>
          @if (activeRentals().length === 0) {
            <p class="text-sm text-gray-400 text-center py-6">No hay devoluciones previstas para hoy</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-400 border-b border-gray-100">
                    <th class="text-left pb-2 font-medium">Vehículo</th>
                    <th class="text-left pb-2 font-medium">Cliente</th>
                    <th class="text-left pb-2 font-medium">Fecha fin</th>
                    <th class="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of activeRentals(); track r.id) {
                    <tr class="border-b border-gray-50 last:border-0">
                      <td class="py-2 pr-3 font-medium text-gray-900">
                        {{ r.car.brand }} {{ r.car.model }}
                        <span class="block text-xs text-gray-400 font-normal">{{ r.car.licensePlate }}</span>
                      </td>
                      <td class="py-2 pr-3 text-gray-600">{{ r.client.name }}</td>
                      <td class="py-2 pr-3 text-gray-600">{{ r.endDate | date:'dd/MM/yyyy' }}</td>
                      <td class="py-2 text-right">
                        <a [routerLink]="['/rentals', r.id]" class="text-xs text-blue-500 hover:underline">Ver</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Fuera de plazo -->
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-4">
            <lucide-icon [img]="OctagonAlert" [size]="16" class="text-red-500"></lucide-icon>
            <h2 class="text-sm font-semibold text-gray-700">Fuera de plazo</h2>
            <span class="ml-auto text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{{ overdueRentals().length }}</span>
          </div>
          @if (overdueRentals().length === 0) {
            <p class="text-sm text-gray-400 text-center py-6">No hay vehículos fuera de plazo</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-400 border-b border-gray-100">
                    <th class="text-left pb-2 font-medium">Vehículo</th>
                    <th class="text-left pb-2 font-medium">Cliente</th>
                    <th class="text-left pb-2 font-medium">Venció el</th>
                    <th class="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of overdueRentals(); track r.id) {
                    <tr class="border-b border-gray-50 last:border-0">
                      <td class="py-2 pr-3 font-medium text-gray-900">
                        {{ r.car.brand }} {{ r.car.model }}
                        <span class="block text-xs text-gray-400 font-normal">{{ r.car.licensePlate }}</span>
                      </td>
                      <td class="py-2 pr-3 text-gray-600">{{ r.client.name }}</td>
                      <td class="py-2 pr-3 text-red-500 font-medium">{{ r.endDate | date:'dd/MM/yyyy' }}</td>
                      <td class="py-2 text-right">
                        <a [routerLink]="['/rentals', r.id]" class="text-xs text-blue-500 hover:underline">Ver</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private carsService = inject(CarsService);
  private rentalsService = inject(RentalsService);
  private incidentsService = inject(IncidentsService);
  private repairsService = inject(RepairsService);

  readonly Users = Users;
  readonly ShieldAlert = ShieldAlert;
  readonly Car = Car;
  readonly FileText = FileText;
  readonly AlertTriangle = AlertTriangle;
  readonly Wrench = Wrench;
  readonly Clock = Clock;
  readonly OctagonAlert = OctagonAlert;

  loading = signal(true);
  stats = signal({ clients: 0, blacklisted: 0, cars: 0, activeRentals: 0, unresolvedIncidents: 0, pendingRepairs: 0 });
  activeRentals = signal<RentalContract[]>([]);
  overdueRentals = signal<RentalContract[]>([]);

  ngOnInit() {
    forkJoin({
      clients: this.clientsService.getAll(),
      cars: this.carsService.getAll(),
      rentals: this.rentalsService.getAll({ status: 'ACTIVE' }),
      overdue: this.rentalsService.getAll({ status: 'OVERDUE' }),
      incidents: this.incidentsService.getAll({ resolved: false }),
      repairs: this.repairsService.getAll({ status: 'PENDING' }),
    }).subscribe({
      next: ({ clients, cars, rentals, overdue, incidents, repairs }) => {
        this.stats.set({
          clients: clients.length,
          blacklisted: clients.filter(c => c.isBlacklisted).length,
          cars: cars.length,
          activeRentals: rentals.length,
          unresolvedIncidents: incidents.length,
          pendingRepairs: repairs.length,
        });
        const today = new Date().toISOString().slice(0, 10);
        this.activeRentals.set(rentals.filter(r => r.endDate.slice(0, 10) === today));
        this.overdueRentals.set(overdue);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
