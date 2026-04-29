import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, ArrowLeft, User, Car, FileText, AlertTriangle, MapPin, Phone, Mail, CreditCard } from 'lucide-angular';
import { ClientsService } from '../../core/services/clients.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { BlacklistedBadgeComponent, ContractBadgeComponent, SeverityBadgeComponent, IncidentTypeBadgeComponent } from '../../shared/components/badge.component';
import type { CarCondition, ContractStatus, IncidentType, Severity } from '../../core/models';

interface ClientDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  dni: string;
  address?: string;
  notes?: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistedAt?: string;
  wasBlacklisted?: boolean;
  createdAt: string;
  cars: Array<{ id: number; licensePlate: string; brand: string; model: string; year: number; color?: string }>;
  contracts: Array<{
    id: number;
    startDate: string;
    endDate: string;
    status: ContractStatus;
    totalPrice: number;
    notes?: string;
    createdAt: string;
    car: { id: number; licensePlate: string; brand: string; model: string; year: number };
    carReturn?: { returnDate: string; onTime: boolean; condition: CarCondition; damagesFound: boolean };
  }>;
  incidents: Array<{
    id: number;
    type: IncidentType;
    severity: Severity;
    description: string;
    resolved: boolean;
    resolvedAt?: string;
    createdAt: string;
    contract?: { id: number; car: { licensePlate: string; brand: string; model: string } };
  }>;
}

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe, DecimalPipe, LucideAngularModule,
    SpinnerComponent, BlacklistedBadgeComponent, ContractBadgeComponent,
    SeverityBadgeComponent, IncidentTypeBadgeComponent,
  ],
  template: `
    <div class="flex items-center gap-3 mb-6">
      <a routerLink="/clients" class="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
        <lucide-icon [img]="ArrowLeft" [size]="16"></lucide-icon>
      </a>
      <h1 class="text-xl font-semibold text-gray-900">Ficha del cliente</h1>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else if (client()) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Columna izquierda: datos del cliente -->
        <div class="space-y-5">
          <div class="card p-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="User" [size]="18" class="text-gray-500"></lucide-icon>
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900">{{ client()!.name }}</h2>
                @if (client()!.isBlacklisted) {
                  <app-blacklisted-badge></app-blacklisted-badge>
                } @else if (client()!.wasBlacklisted) {
                  <span class="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Ex-blacklist</span>
                }
              </div>
            </div>
            <dl class="space-y-3 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <lucide-icon [img]="CreditCard" [size]="13" class="text-gray-400 flex-shrink-0"></lucide-icon>
                <span class="font-mono">{{ client()!.dni }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <lucide-icon [img]="Mail" [size]="13" class="text-gray-400 flex-shrink-0"></lucide-icon>
                <span>{{ client()!.email }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <lucide-icon [img]="Phone" [size]="13" class="text-gray-400 flex-shrink-0"></lucide-icon>
                <span>{{ client()!.phone }}</span>
              </div>
              @if (client()!.address) {
                <div class="flex items-start gap-2 text-gray-600">
                  <lucide-icon [img]="MapPin" [size]="13" class="text-gray-400 flex-shrink-0 mt-0.5"></lucide-icon>
                  <span>{{ client()!.address }}</span>
                </div>
              }
            </dl>
            @if (client()!.notes) {
              <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs text-gray-400 mb-1">Notas</p>
                <p class="text-sm text-gray-600">{{ client()!.notes }}</p>
              </div>
            }
            @if (client()!.isBlacklisted && client()!.blacklistReason) {
              <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs text-red-400 mb-1">Motivo blacklist</p>
                <p class="text-sm text-red-700">{{ client()!.blacklistReason }}</p>
              </div>
            }
            <p class="text-xs text-gray-300 mt-5">Cliente desde {{ client()!.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>

          <!-- Vehículos asignados -->
          <div class="card p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="Car" [size]="15" class="text-gray-400"></lucide-icon>
              <h3 class="text-sm font-semibold text-gray-700">Vehículos asignados</h3>
              <span class="ml-auto text-xs text-gray-400">{{ client()!.cars.length }}</span>
            </div>
            @if (client()!.cars.length === 0) {
              <p class="text-sm text-gray-400">Sin vehículos asignados</p>
            } @else {
              <div class="space-y-2">
                @for (car of client()!.cars; track car.id) {
                  <a [routerLink]="['/cars']" class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="Car" [size]="12" class="text-gray-500"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ car.brand }} {{ car.model }}</p>
                      <p class="text-xs font-mono text-gray-400">{{ car.licensePlate }} · {{ car.year }}</p>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <!-- Columna derecha: contratos e incidencias -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Contratos -->
          <div class="card p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="FileText" [size]="15" class="text-gray-400"></lucide-icon>
              <h3 class="text-sm font-semibold text-gray-700">Contratos</h3>
              <span class="ml-auto text-xs text-gray-400">{{ client()!.contracts.length }}</span>
            </div>
            @if (client()!.contracts.length === 0) {
              <p class="text-sm text-gray-400 py-4 text-center">Sin contratos registrados</p>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs text-gray-400 border-b border-gray-100">
                      <th class="text-left pb-2 font-medium">Vehículo</th>
                      <th class="text-left pb-2 font-medium">Inicio</th>
                      <th class="text-left pb-2 font-medium">Fin</th>
                      <th class="text-left pb-2 font-medium">Estado</th>
                      <th class="text-right pb-2 font-medium">Precio</th>
                      <th class="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of client()!.contracts; track c.id) {
                      <tr class="border-b border-gray-50 last:border-0">
                        <td class="py-2.5 pr-3">
                          <p class="font-medium text-gray-900">{{ c.car.brand }} {{ c.car.model }}</p>
                          <p class="text-xs font-mono text-gray-400">{{ c.car.licensePlate }}</p>
                        </td>
                        <td class="py-2.5 pr-3 text-gray-600">{{ c.startDate | date:'dd/MM/yy' }}</td>
                        <td class="py-2.5 pr-3 text-gray-600">{{ c.endDate | date:'dd/MM/yy' }}</td>
                        <td class="py-2.5 pr-3">
                          <app-contract-badge [status]="c.status"></app-contract-badge>
                        </td>
                        <td class="py-2.5 pr-3 text-right font-medium text-gray-900">{{ c.totalPrice | number:'1.2-2' }} €</td>
                        <td class="py-2.5 text-right">
                          <a [routerLink]="['/rentals', c.id]" class="text-xs text-blue-500 hover:underline">Ver</a>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Incidencias -->
          <div class="card p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="AlertTriangle" [size]="15" class="text-gray-400"></lucide-icon>
              <h3 class="text-sm font-semibold text-gray-700">Incidencias</h3>
              <span class="ml-auto text-xs text-gray-400">{{ client()!.incidents.length }}</span>
            </div>
            @if (client()!.incidents.length === 0) {
              <p class="text-sm text-gray-400 py-4 text-center">Sin incidencias registradas</p>
            } @else {
              <div class="space-y-2">
                @for (inc of client()!.incidents; track inc.id) {
                  <div class="border border-gray-100 rounded-xl p-3">
                    <div class="flex items-start justify-between gap-2 flex-wrap">
                      <div class="flex items-center gap-2 flex-wrap">
                        <app-incident-type-badge [type]="inc.type"></app-incident-type-badge>
                        <app-severity-badge [severity]="inc.severity"></app-severity-badge>
                        @if (inc.resolved) {
                          <span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Resuelta</span>
                        }
                      </div>
                      <span class="text-xs text-gray-400">{{ inc.createdAt | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">{{ inc.description }}</p>
                    @if (inc.contract) {
                      <p class="text-xs text-gray-400 mt-1">
                        Contrato · {{ inc.contract.car.brand }} {{ inc.contract.car.model }}
                        <span class="font-mono">({{ inc.contract.car.licensePlate }})</span>
                      </p>
                    }
                  </div>
                }
              </div>
            }
          </div>

        </div>
      </div>
    }
  `,
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);

  readonly ArrowLeft = ArrowLeft;
  readonly User = User;
  readonly Car = Car;
  readonly FileText = FileText;
  readonly AlertTriangle = AlertTriangle;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly CreditCard = CreditCard;

  loading = signal(true);
  client = signal<ClientDetail | null>(null);

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.clientsService.getById(id).subscribe({
      next: data => { this.client.set(data as unknown as ClientDetail); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
