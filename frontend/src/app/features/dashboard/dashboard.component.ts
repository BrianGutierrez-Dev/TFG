import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, FileText, AlertTriangle, Wrench, Clock, OctagonAlert, CalendarClock, CircleDollarSign, CircleCheckBig } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { CarsService } from '../../core/services/cars.service';
import { RentalsService } from '../../core/services/rentals.service';
import { IncidentsService } from '../../core/services/incidents.service';
import { RepairsService } from '../../core/services/repairs.service';
import { MaintenancesService } from '../../core/services/maintenances.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import type { Maintenance, RentalContract } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, SpinnerComponent, PageHeaderComponent, DatePipe, DecimalPipe],
  template: `
    <app-page-header title="Panel" subtitle="Resumen general del sistema"></app-page-header>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else {
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <a routerLink="/rentals" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Ingresos mes</span>
            <lucide-icon [img]="CircleDollarSign" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().monthlyRevenue | number:'1.2-2' }} €</p>
        </a>
        <a routerLink="/rentals" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Contratos activos</span>
            <lucide-icon [img]="FileText" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().activeRentals }}</p>
        </a>
        <a routerLink="/cars" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Disponibles</span>
            <lucide-icon [img]="CircleCheckBig" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().availableCars }}</p>
        </a>
        <a routerLink="/repairs" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">En reparación</span>
            <lucide-icon [img]="Wrench" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().carsInRepair }}</p>
        </a>
        <a routerLink="/blacklist" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Clientes problemáticos</span>
            <lucide-icon [img]="AlertTriangle" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().problematicClients }}</p>
        </a>
        <a routerLink="/maintenances" class="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Mantenimientos próximos</span>
            <lucide-icon [img]="CalendarClock" [size]="16" class="text-gray-300"></lucide-icon>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats().upcomingMaintenances }}</p>
        </a>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
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

        <!-- Próximas devoluciones -->
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-4">
            <lucide-icon [img]="CalendarClock" [size]="16" class="text-amber-500"></lucide-icon>
            <h2 class="text-sm font-semibold text-gray-700">Próximas devoluciones</h2>
            <span class="ml-auto text-xs font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{{ upcomingRentals().length }}</span>
          </div>
          @if (upcomingRentals().length === 0) {
            <p class="text-sm text-gray-400 text-center py-6">No hay devoluciones en los próximos 3 días</p>
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
                  @for (r of upcomingRentals(); track r.id) {
                    <tr class="border-b border-gray-50 last:border-0">
                      <td class="py-2 pr-3 font-medium text-gray-900">
                        {{ r.car.brand }} {{ r.car.model }}
                        <span class="block text-xs text-gray-400 font-normal">{{ r.car.licensePlate }}</span>
                      </td>
                      <td class="py-2 pr-3 text-gray-600">{{ r.client.name }}</td>
                      <td class="py-2 pr-3 text-amber-600 font-medium">{{ r.endDate | date:'dd/MM/yyyy' }}</td>
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

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-4">
            <lucide-icon [img]="Wrench" [size]="16" class="text-emerald-500"></lucide-icon>
            <h2 class="text-sm font-semibold text-gray-700">Mantenimientos próximos</h2>
            <span class="ml-auto text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{{ upcomingMaintenances().length }}</span>
          </div>
          @if (upcomingMaintenances().length === 0) {
            <p class="text-sm text-gray-400 text-center py-6">No hay mantenimientos previstos en los próximos 15 días</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-400 border-b border-gray-100">
                    <th class="text-left pb-2 font-medium">Vehículo</th>
                    <th class="text-left pb-2 font-medium">Tipo</th>
                    <th class="text-left pb-2 font-medium">Próxima fecha</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of upcomingMaintenances(); track m.id) {
                    <tr class="border-b border-gray-50 last:border-0">
                      <td class="py-2 pr-3 font-medium text-gray-900">
                        {{ m.car.brand }} {{ m.car.model }}
                        <span class="block text-xs text-gray-400 font-normal">{{ m.car.licensePlate }}</span>
                      </td>
                      <td class="py-2 pr-3 text-gray-600">{{ m.type }}</td>
                      <td class="py-2 pr-3 text-emerald-600 font-medium">{{ m.nextDueDate | date:'dd/MM/yyyy' }}</td>
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
  private maintenancesService = inject(MaintenancesService);

  readonly FileText = FileText;
  readonly AlertTriangle = AlertTriangle;
  readonly Wrench = Wrench;
  readonly Clock = Clock;
  readonly OctagonAlert = OctagonAlert;
  readonly CalendarClock = CalendarClock;
  readonly CircleDollarSign = CircleDollarSign;
  readonly CircleCheckBig = CircleCheckBig;

  loading = signal(true);
  stats = signal({
    monthlyRevenue: 0,
    activeRentals: 0,
    availableCars: 0,
    carsInRepair: 0,
    problematicClients: 0,
    upcomingMaintenances: 0,
  });
  activeRentals = signal<RentalContract[]>([]);
  upcomingRentals = signal<RentalContract[]>([]);
  overdueRentals = signal<RentalContract[]>([]);
  upcomingMaintenances = signal<Maintenance[]>([]);

  ngOnInit() {
    forkJoin({
      clients: this.clientsService.getAll(),
      cars: this.carsService.getAll(),
      rentals: this.rentalsService.getAll(),
      incidents: this.incidentsService.getAll({ resolved: false }),
      repairs: this.repairsService.getAll(),
      maintenances: this.maintenancesService.getAll(),
    }).subscribe({
      next: ({ clients, cars, rentals, incidents, repairs, maintenances }) => {
        const today = new Date().toISOString().slice(0, 10);
        const in3Days = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
        const in15Days = new Date(Date.now() + 15 * 86_400_000).toISOString().slice(0, 10);
        const month = today.slice(0, 7);

        const activeContracts = rentals.filter(r => r.status === 'ACTIVE');
        const overdueContracts = rentals.filter(r => r.status === 'OVERDUE');
        const occupiedCarIds = new Set(
          rentals
            .filter(r =>
              (r.status === 'ACTIVE' || r.status === 'OVERDUE')
              && r.startDate.slice(0, 10) <= today
              && r.endDate.slice(0, 10) >= today
            )
            .map(r => r.carId)
        );
        const carsInRepairIds = new Set(
          repairs
            .filter(r => r.status === 'IN_PROGRESS')
            .map(r => r.carId)
        );
        const problematicClientIds = new Set([
          ...clients.filter(c => c.isBlacklisted).map(c => c.id),
          ...incidents.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').map(i => i.clientId),
        ]);
        const nextMaintenances = maintenances
          .filter(m => !!m.nextDueDate && m.nextDueDate.slice(0, 10) >= today && m.nextDueDate.slice(0, 10) <= in15Days)
          .sort((a, b) => a.nextDueDate!.localeCompare(b.nextDueDate!));

        this.stats.set({
          monthlyRevenue: rentals
            .filter(r => r.status !== 'CANCELLED' && r.startDate.slice(0, 7) === month)
            .reduce((sum, r) => sum + r.totalPrice, 0),
          activeRentals: activeContracts.length,
          availableCars: cars.filter(c => !occupiedCarIds.has(c.id) && !carsInRepairIds.has(c.id)).length,
          carsInRepair: carsInRepairIds.size,
          problematicClients: problematicClientIds.size,
          upcomingMaintenances: nextMaintenances.length,
        });
        this.activeRentals.set(activeContracts.filter(r => r.endDate.slice(0, 10) === today));
        this.upcomingRentals.set(activeContracts.filter(r => r.endDate.slice(0, 10) > today && r.endDate.slice(0, 10) <= in3Days));
        this.overdueRentals.set(overdueContracts);
        this.upcomingMaintenances.set(nextMaintenances.slice(0, 8));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
