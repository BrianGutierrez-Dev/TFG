import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Plus, CheckCircle } from 'lucide-angular';
import { RentalsService } from '../../core/services/rentals.service';
import { CarReturnsService } from '../../core/services/car-returns.service';
import { IncidentsService } from '../../core/services/incidents.service';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { ContractBadgeComponent, SeverityBadgeComponent, IncidentTypeBadgeComponent } from '../../shared/components/badge.component';
import type { RentalContract, Incident, CarCondition, FuelLevel, ContractStatus } from '../../core/models';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe, LucideAngularModule, SpinnerComponent, ButtonComponent, ContractBadgeComponent, SeverityBadgeComponent, IncidentTypeBadgeComponent],
  template: `
    <div class="flex items-center gap-3 mb-6">
      <a routerLink="/rentals" class="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
        <lucide-icon [img]="ArrowLeft" [size]="16"></lucide-icon>
      </a>
      <h1 class="text-xl font-semibold text-gray-900">Detalle del contrato</h1>
    </div>

    @if (loading()) {
      <app-spinner></app-spinner>
    } @else if (rental()) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Main info -->
        <div class="lg:col-span-2 space-y-5">
          <div class="card p-6">
            <div class="flex items-start justify-between mb-5">
              <div>
                <h2 class="text-base font-semibold text-gray-900">Contrato #{{ rental()!.id }}</h2>
                <p class="text-sm text-gray-400 mt-0.5">{{ rental()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <app-contract-badge [status]="rental()!.status"></app-contract-badge>
                @if (rental()!.status === 'ACTIVE') {
                  <app-button variant="warning" size="sm" (clicked)="changeStatus('OVERDUE')">Vencido</app-button>
                  <app-button variant="success" size="sm" (clicked)="changeStatus('COMPLETED')">Completar</app-button>
                  <app-button variant="danger" size="sm" (clicked)="changeStatus('CANCELLED')">Cancelar</app-button>
                }
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-400 mb-1">Cliente</p>
                <p class="font-medium text-gray-900">{{ rental()!.client.name }}</p>
                <p class="text-gray-500">{{ rental()!.client.dni }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-1">Vehículo</p>
                <p class="font-medium font-mono text-gray-900">{{ rental()!.car.licensePlate }}</p>
                <p class="text-gray-500">{{ rental()!.car.brand }} {{ rental()!.car.model }} {{ rental()!.car.year }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-1">Fecha inicio</p>
                <p class="font-medium text-gray-900">{{ rental()!.startDate | date:'dd/MM/yyyy' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-1">Fecha fin</p>
                <p class="font-medium text-gray-900">{{ rental()!.endDate | date:'dd/MM/yyyy' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-1">Precio total</p>
                <p class="font-semibold text-gray-900">{{ rental()!.totalPrice | number:'1.2-2' }} €</p>
              </div>
              @if (rental()!.notes) {
                <div class="col-span-2">
                  <p class="text-xs text-gray-400 mb-1">Notas</p>
                  <p class="text-gray-600">{{ rental()!.notes }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Car return -->
          <div class="card p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Devolución del vehículo</h3>
            @if (rental()!.carReturn) {
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-gray-400 mb-1">Fecha devolución</p>
                  <p class="font-medium text-gray-900">{{ rental()!.carReturn!.returnDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Puntual</p>
                  <p class="font-medium" [class]="rental()!.carReturn!.onTime ? 'text-green-600' : 'text-red-600'">
                    {{ rental()!.carReturn!.onTime ? 'Sí' : 'No' }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Estado</p>
                  <p class="font-medium text-gray-900">{{ conditionLabel(rental()!.carReturn!.condition) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Combustible</p>
                  <p class="font-medium text-gray-900">{{ fuelLabel(rental()!.carReturn!.fuelLevel) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Daños</p>
                  <p class="font-medium" [class]="rental()!.carReturn!.damagesFound ? 'text-red-600' : 'text-gray-600'">
                    {{ rental()!.carReturn!.damagesFound ? 'Sí' : 'No' }}
                  </p>
                </div>
                @if (rental()!.carReturn!.damageDescription) {
                  <div class="col-span-2">
                    <p class="text-xs text-gray-400 mb-1">Descripción de daños</p>
                    <p class="text-gray-600">{{ rental()!.carReturn!.damageDescription }}</p>
                  </div>
                }
              </div>
            } @else if (rental()!.status === 'ACTIVE' || rental()!.status === 'OVERDUE') {
              @if (!showReturnForm()) {
                <app-button size="sm" (clicked)="showReturnForm.set(true)">
                  <lucide-icon [img]="Plus" [size]="13"></lucide-icon>
                  Registrar devolución
                </app-button>
              } @else {
                <form [formGroup]="returnForm" (ngSubmit)="saveReturn()" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="form-label">Fecha de devolución *</label>
                      <input formControlName="returnDate" type="date" class="form-input">
                    </div>
                    <div>
                      <label class="form-label">Estado del vehículo *</label>
                      <select formControlName="condition" class="form-select">
                        <option value="EXCELLENT">Excelente</option>
                        <option value="GOOD">Bueno</option>
                        <option value="FAIR">Regular</option>
                        <option value="DAMAGED">Dañado</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label">Nivel de combustible</label>
                      <select formControlName="fuelLevel" class="form-select">
                        <option value="FULL">Lleno</option>
                        <option value="THREE_QUARTERS">3/4</option>
                        <option value="HALF">1/2</option>
                        <option value="ONE_QUARTER">1/4</option>
                        <option value="EMPTY">Vacío</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-2 pt-1">
                      <div class="flex items-center gap-2">
                        <input formControlName="onTime" type="checkbox" id="cb-ontime" class="w-4 h-4 accent-gray-900">
                        <label for="cb-ontime" class="text-sm text-gray-700 cursor-pointer">Devolución a tiempo</label>
                      </div>
                      <div class="flex items-center gap-2">
                        <input formControlName="damagesFound" type="checkbox" id="cb-damages" class="w-4 h-4 accent-gray-900">
                        <label for="cb-damages" class="text-sm text-gray-700 cursor-pointer">Daños encontrados</label>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <label class="form-label">Descripción de daños</label>
                      <textarea formControlName="damageDescription" class="form-textarea" rows="2" placeholder="Describe los daños..."></textarea>
                    </div>
                    <div class="col-span-2">
                      <label class="form-label">Notas</label>
                      <textarea formControlName="notes" class="form-textarea" rows="2"></textarea>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <app-button variant="secondary" size="sm" (clicked)="showReturnForm.set(false)">Cancelar</app-button>
                    <app-button type="submit" size="sm" [loading]="savingReturn()">
                      <lucide-icon [img]="CheckCircle" [size]="13"></lucide-icon>
                      Registrar
                    </app-button>
                  </div>
                </form>
              }
            } @else {
              <p class="text-sm text-gray-400">No aplica para contratos cerrados sin devolución registrada.</p>
            }
          </div>
        </div>

        <!-- Incidents -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-900">Incidencias</h3>
            <span class="text-xs text-gray-400">{{ incidents().length }}</span>
          </div>
          @if (incidents().length === 0) {
            <p class="text-sm text-gray-400">Sin incidencias registradas.</p>
          } @else {
            <div class="space-y-3">
              @for (inc of incidents(); track inc.id) {
                <div class="border border-gray-100 rounded-xl p-3">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <app-incident-type-badge [type]="inc.type"></app-incident-type-badge>
                    <app-severity-badge [severity]="inc.severity"></app-severity-badge>
                  </div>
                  <p class="text-xs text-gray-600 mt-2">{{ inc.description }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ inc.createdAt | date:'dd/MM/yyyy' }}</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class RentalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private rentalsService = inject(RentalsService);
  private carReturnsService = inject(CarReturnsService);
  private incidentsService = inject(IncidentsService);
  private fb = inject(FormBuilder);

  readonly ArrowLeft = ArrowLeft;
  readonly Plus = Plus;
  readonly CheckCircle = CheckCircle;

  loading = signal(true);
  savingReturn = signal(false);
  rental = signal<RentalContract | null>(null);
  incidents = signal<Incident[]>([]);
  showReturnForm = signal(false);

  returnForm = this.fb.group({
    returnDate: [new Date().toISOString().split('T')[0], Validators.required],
    condition: ['GOOD' as CarCondition, Validators.required],
    fuelLevel: ['FULL' as FuelLevel],
    onTime: [true],
    damagesFound: [false],
    damageDescription: [''],
    notes: [''],
  });

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.rentalsService.getById(id).subscribe({
      next: data => { this.rental.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.incidentsService.getAll().subscribe({
      next: data => this.incidents.set(data.filter(i => i.contractId === id)),
    });
  }

  changeStatus(status: ContractStatus) {
    this.rentalsService.updateStatus(this.rental()!.id, status).subscribe({
      next: data => this.rental.update(r => r ? { ...r, status: data.status } : r),
    });
  }

  saveReturn() {
    if (this.returnForm.invalid) return;
    this.savingReturn.set(true);
    const v = this.returnForm.value;
    this.carReturnsService.create({
      contractId: this.rental()!.id,
      returnDate: v.returnDate!,
      condition: v.condition as CarCondition,
      fuelLevel: v.fuelLevel as FuelLevel,
      onTime: v.onTime!,
      damagesFound: v.damagesFound!,
      damageDescription: v.damageDescription || undefined,
      notes: v.notes || undefined,
    }).subscribe({
      next: (ret) => {
        this.savingReturn.set(false);
        this.showReturnForm.set(false);
        this.rental.update(r => r ? { ...r, carReturn: ret } : r);
      },
      error: () => this.savingReturn.set(false),
    });
  }

  conditionLabel(c: CarCondition) {
    return { EXCELLENT: 'Excelente', GOOD: 'Bueno', FAIR: 'Regular', DAMAGED: 'Dañado' }[c] ?? c;
  }

  fuelLabel(f?: FuelLevel) {
    if (!f) return '—';
    return { FULL: 'Lleno', THREE_QUARTERS: '3/4', HALF: '1/2', ONE_QUARTER: '1/4', EMPTY: 'Vacío' }[f] ?? f;
  }
}
