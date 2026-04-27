import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, Users, Car, FileText, AlertTriangle, ShieldAlert, Wrench } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { CarsService } from '../../core/services/cars.service';
import { RentalsService } from '../../core/services/rentals.service';
import { IncidentsService } from '../../core/services/incidents.service';
import { RepairsService } from '../../core/services/repairs.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, SpinnerComponent, PageHeaderComponent],
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

  loading = signal(true);
  stats = signal({ clients: 0, blacklisted: 0, cars: 0, activeRentals: 0, unresolvedIncidents: 0, pendingRepairs: 0 });

  ngOnInit() {
    forkJoin({
      clients: this.clientsService.getAll(),
      cars: this.carsService.getAll(),
      rentals: this.rentalsService.getAll({ status: 'ACTIVE' }),
      incidents: this.incidentsService.getAll({ resolved: false }),
      repairs: this.repairsService.getAll({ status: 'PENDING' }),
    }).subscribe({
      next: ({ clients, cars, rentals, incidents, repairs }) => {
        this.stats.set({
          clients: clients.length,
          blacklisted: clients.filter(c => c.isBlacklisted).length,
          cars: cars.length,
          activeRentals: rentals.length,
          unresolvedIncidents: incidents.length,
          pendingRepairs: repairs.length,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
